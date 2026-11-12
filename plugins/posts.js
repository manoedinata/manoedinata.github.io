// Markdown posts (src/posts/*.md) → JS modules, plus one static HTML file per route at build.
//
//   import post from './posts/hello.md'        → { html, headings }   (the body, lazy-loaded)
//   import meta from './posts/hello.md?meta'   → { slug, title, date, ... } (small, for lists)
//
// Drafts (`draft: true`) render in `vite dev` only; a build drops their content entirely.
// Fenced code is highlighted at build time by Shiki (light + dark colours as CSS vars, no runtime JS).

import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'
import { createHighlighter } from 'shiki'
import { parse as parseYaml } from 'yaml'

const POSTS_DIR = fileURLToPath(new URL('../src/posts/', import.meta.url))
const WORDS_PER_MINUTE = 200

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;|&#\d+;/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')

// Languages highlighted in ``` fences. Anything else renders as plain text.
const LANGS = [
  'shellscript', 'shellsession', 'javascript', 'typescript', 'json', 'yaml', 'toml', 'ini', 'python',
  'c', 'cpp', 'rust', 'go', 'java', 'kotlin', 'make', 'cmake', 'diff', 'html', 'css', 'vue', 'xml',
  'markdown', 'dockerfile', 'nix', 'lua', 'sql',
]
const THEMES = { light: 'github-light', dark: 'github-dark' }
let highlighter
const getHighlighter = () => (highlighter ??= createHighlighter({ themes: Object.values(THEMES), langs: LANGS }))

function highlight(hl, code, lang) {
  if (!hl) return null
  try {
    return hl.codeToHtml(code, { lang: lang || 'text', themes: THEMES, defaultColor: false })
  } catch {
    return hl.codeToHtml(code, { lang: 'text', themes: THEMES, defaultColor: false }) // unknown language
  }
}

// Clipboard / check glyphs for the copy button (same 2px stroke style as components/Icon.vue).
const svg = (d) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
const COPY_ICONS =
  `<span class="icon-copy">${svg('<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 3h6v4H9z"/>')}</span>` +
  `<span class="icon-done">${svg('<path d="M5 12l5 5L20 7"/>')}</span>`

/** `hl`: a loaded Shiki highlighter; without one, code blocks stay plain (fine for metadata). */
export function readPost(file, hl = null) {
  const src = readFileSync(file, 'utf8')
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src)
  const front = (match && parseYaml(match[1])) || {}
  const body = match ? src.slice(match[0].length) : src
  const slug = basename(file).replace(/\.md$/, '')

  if (!front.title) throw new Error(`src/posts/${slug}.md: missing "title" in frontmatter`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(front.date ?? '')))
    throw new Error(`src/posts/${slug}.md: "date" must be YYYY-MM-DD, got "${front.date}"`)

  // h2/h3 get ids so the table of contents and #links work.
  const headings = []
  const seen = new Map()
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens)
        let id = slugify(text) || 'section'
        const n = seen.get(id) ?? 0
        seen.set(id, n + 1)
        if (n) id += `-${n}`
        if (depth === 2 || depth === 3) headings.push({ id, depth, text: inner.replace(/<[^>]+>/g, '') })
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`
      },
      code({ text, lang }) {
        const out = highlight(hl, text, (lang || '').split(/\s/)[0]) ?? `<pre><code>${escapeHtml(text)}</code></pre>`
        // Post.vue handles clicks on .copy (event delegation).
        return `<div class="code-block"><button type="button" class="copy" aria-label="Copy code" title="Copy">${COPY_ICONS}</button>${out}</div>\n`
      },
    },
  })
  const html = marked.parse(body)
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length

  const meta = {
    slug,
    title: String(front.title),
    date: String(front.date),
    description: front.description ? String(front.description) : '',
    emoji: front.emoji ? String(front.emoji) : '📝',
    hue: front.hue ? String(front.hue) : 'blue',
    tags: (front.tags ?? []).map(String),
    draft: Boolean(front.draft),
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  }
  return { meta, html, headings }
}

export function listPosts({ drafts }) {
  if (!existsSync(POSTS_DIR)) return []
  return readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readPost(join(POSTS_DIR, f)).meta)
    .filter((m) => drafts || !m.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

// Swap the <title> and description in a built HTML page.
function withMeta(html, title, description) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
}

export default function posts({ siteTitle }) {
  let config
  return {
    name: 'posts',
    configResolved(c) {
      config = c
    },

    async transform(code, id) {
      const [file, query] = id.split('?')
      if (!file.endsWith('.md') || !file.startsWith(POSTS_DIR)) return
      const post = readPost(file, query === 'meta' ? null : await getHighlighter())
      const hidden = post.meta.draft && config.command === 'build'
      const value = hidden ? null : query === 'meta' ? post.meta : { html: post.html, headings: post.headings }
      return { code: `export default ${JSON.stringify(value)}`, map: null }
    },

    // A new/removed post changes the glob results; a full reload is simplest.
    handleHotUpdate({ file, server }) {
      if (file.startsWith(POSTS_DIR) && file.endsWith('.md')) {
        server.ws.send({ type: 'full-reload' })
        return []
      }
    },

    // GitHub Pages serves files, not routes: write a real HTML page for every route
    // so each one returns 200 and carries its own title/description.
    closeBundle() {
      if (config.command !== 'build') return
      const out = config.build.outDir
      const index = readFileSync(join(out, 'index.html'), 'utf8')
      const title = siteTitle()
      const page = (path, t, d) => {
        mkdirSync(join(out, path), { recursive: true })
        writeFileSync(join(out, path, 'index.html'), withMeta(index, t, d))
      }

      page('writings', `Writings · ${title}`, `Writings by ${title}.`)
      for (const p of listPosts({ drafts: false })) page(`writings/${p.slug}`, `${p.title} · ${title}`, p.description || p.title)
      writeFileSync(join(out, '404.html'), withMeta(index, `Not found · ${title}`, 'Nothing here.'))
    },
  }
}
