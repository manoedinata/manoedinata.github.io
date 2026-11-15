// Pull posts from the Notion "Posts" database into src/posts/<slug>.md.
//
//   NOTION_TOKEN=ntn_xxx NOTION_DATABASE_ID=xxx npm run sync:notion
//
// Database properties (all but Name optional):
//   Name (title) · Slug (text) · Date (date) · Summary (text) · Tags (multi-select)
//   Draft (checkbox) · Icon (select/text, a name in src/assets/emoji/) · Hue (select/text, a key of HUES in src/data.js)
//
// Synced posts carry `notion: <page id>` in their frontmatter. Only those files are
// overwritten or deleted, so hand-written posts in src/posts/ are left alone.
// Images are downloaded to public/writings/<slug>/ and linked relatively; plugins/posts.js
// points relative image paths at that folder.

import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const POSTS_DIR = join(ROOT, 'src/posts')
const IMAGES_DIR = join(ROOT, 'public/writings')

const NOTION_TOKEN = process.env.NOTION_TOKEN
// A page inside the Posts database, or the database id itself.
const SEED_ID = process.env.NOTION_DATABASE_ID || process.env.NOTION_SEED_ID
if (!NOTION_TOKEN || !SEED_ID) {
  console.error('Set NOTION_TOKEN and NOTION_DATABASE_ID, e.g.:')
  console.error('  NOTION_TOKEN=ntn_xxx NOTION_DATABASE_ID=xxx npm run sync:notion')
  process.exit(1)
}

const notion = new Client({ auth: NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

// Valid icon / hue names, so a typo in Notion falls back to the default instead of breaking the build.
const EMOJI_NAMES = readdirSync(join(ROOT, 'src/assets/emoji'))
  .filter((f) => f.endsWith('.svg'))
  .map((f) => f.slice(0, -4))
const HUE_NAMES = [
  ...(/export const HUES = \{([\s\S]*?)\n\}/.exec(readFileSync(join(ROOT, 'src/data.js'), 'utf8'))?.[1] ?? '')
    .matchAll(/^\s+(\w+):\s*\{/gm),
].map((m) => m[1])

// ---- Helpers ----------------------------------------------------------------

const plain = (arr) => (arr || []).map((t) => t.plain_text).join('')

// Text from a select or rich_text property.
const textProp = (p) => p?.select?.name ?? plain(p?.rich_text)

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const IMAGE_EXT = /^\.(png|jpe?g|gif|webp|svg|avif|bmp|tiff?)$/i

// Stable file name: hashed on content, since Notion's presigned URLs change every run.
function imageFileName(url, buffer, index) {
  let base = ''
  try {
    base = decodeURIComponent(basename(new URL(url).pathname))
  } catch {
    /* malformed url */
  }
  let ext = extname(base).toLowerCase()
  if (!IMAGE_EXT.test(ext)) ext = '.png'
  const name = basename(base, extname(base)).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || `image-${index + 1}`
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 8)
  return `${name}-${hash}${ext}`
}

// Download every remote image into `dir` and point the markdown at the local copy.
async function localizeImages(markdown, dir) {
  const matches = [...markdown.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g)]
  const local = new Map() // url -> file name, or null if the download failed
  for (const [i, [, url]] of matches.entries()) {
    if (local.has(url)) continue
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const file = imageFileName(url, buf, i)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, file), buf)
      local.set(url, file)
      console.log(`    ↓ ${file}`)
    } catch (err) {
      console.warn(`    ! image download failed (${err.message}); keeping remote URL`)
      local.set(url, null)
    }
  }
  return markdown.replace(/(!\[[^\]]*\]\()(https?:\/\/[^\s)]+)(\))/g, (m, a, url, b) =>
    local.get(url) ? `${a}${local.get(url)}${b}` : m,
  )
}

// Notion's Heading 1/2/3 become ##/###/####: the post title is the page's <h1>, and the
// table of contents lists ## and ###. Code fences are left alone.
function demoteHeadings(markdown) {
  let fence = false
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) fence = !fence
      return !fence && /^#{1,5} /.test(line) ? `#${line}` : line
    })
    .join('\n')
}

// Front matter of an existing post, or null if it has none.
function frontOf(file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))
  try {
    return m ? parseYaml(m[1]) : null
  } catch {
    return null
  }
}

// The data source id for the Posts database, from a page in it or the database id.
async function resolveDataSourceId(seedId) {
  try {
    const db = await notion.databases.retrieve({ database_id: seedId })
    return db.data_sources?.[0]?.id ?? seedId
  } catch {
    /* not a database: treat it as a page in one */
  }
  const page = await notion.pages.retrieve({ page_id: seedId })
  if (page.parent?.data_source_id) return page.parent.data_source_id
  const db = await notion.databases.retrieve({ database_id: page.parent.database_id })
  return db.data_sources?.[0]?.id ?? page.parent.database_id
}

async function queryAllPages(dataSourceId) {
  const results = []
  let cursor
  do {
    const res = await notion.dataSources.query({ data_source_id: dataSourceId, start_cursor: cursor })
    results.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return results
}

// ---- Main ---------------------------------------------------------------------

const dataSourceId = await resolveDataSourceId(SEED_ID)
const pages = await queryAllPages(dataSourceId)
console.log(`Data source ${dataSourceId}: ${pages.length} page(s).`)

mkdirSync(POSTS_DIR, { recursive: true })

// slug -> notion page id, for posts written by an earlier sync.
const synced = new Map()
for (const f of readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))) {
  const front = frontOf(join(POSTS_DIR, f))
  if (front?.notion) synced.set(f.slice(0, -3), String(front.notion))
}

const written = new Set()
for (const page of pages) {
  const p = page.properties
  const title = plain(p.Name?.title).trim() || 'Untitled'
  const slug = slugify(plain(p.Slug?.rich_text) || title) || page.id
  const file = join(POSTS_DIR, `${slug}.md`)

  if (written.has(slug)) {
    console.warn(`  ! skipped "${title}": slug "${slug}" already used by another Notion page`)
    continue
  }
  if (existsSync(file) && !synced.has(slug)) {
    console.warn(`  ! skipped "${title}": src/posts/${slug}.md is a hand-written post`)
    continue
  }

  const icon = textProp(p.Icon)
  const hue = textProp(p.Hue)
  if (icon && !EMOJI_NAMES.includes(icon)) console.warn(`  ! ${slug}: unknown icon "${icon}", using default`)
  if (hue && !HUE_NAMES.includes(hue)) console.warn(`  ! ${slug}: unknown hue "${hue}", using default`)

  const front = {
    title,
    date: (p.Date?.date?.start ?? page.created_time).slice(0, 10),
    ...(plain(p.Summary?.rich_text) && { description: plain(p.Summary.rich_text) }),
    ...(EMOJI_NAMES.includes(icon) && { icon }),
    ...(HUE_NAMES.includes(hue) && { hue }),
    ...(p.Tags?.multi_select?.length && { tags: p.Tags.multi_select.map((t) => t.name) }),
    draft: p.Draft?.checkbox ?? false,
    notion: page.id,
  }

  // Start the image folder fresh so removed images go too; names are content-hashed, so unchanged ones produce no diff.
  const imageDir = join(IMAGES_DIR, slug)
  rmSync(imageDir, { recursive: true, force: true })
  const body = demoteHeadings(await localizeImages(n2m.toMarkdownString(await n2m.pageToMarkdown(page.id)).parent || '', imageDir))

  writeFileSync(file, `---\n${stringifyYaml(front).trimEnd()}\n---\n\n${body.trim()}\n`)
  written.add(slug)
  console.log(`  ✓ src/posts/${slug}.md`)
}

// Posts removed (or renamed) in Notion.
for (const slug of synced.keys()) {
  if (written.has(slug)) continue
  rmSync(join(POSTS_DIR, `${slug}.md`), { force: true })
  rmSync(join(IMAGES_DIR, slug), { recursive: true, force: true })
  console.log(`  ✗ removed src/posts/${slug}.md`)
}

console.log('Done.')
