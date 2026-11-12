// Blog posts live in src/posts/*.md (see plugins/posts.js for the format).
import { HUES } from './data.js'
import { EMOJI_NAMES } from './emoji.js'

// Small metadata for lists (eager); bodies are separate chunks, loaded per post.
const metas = import.meta.glob('./posts/*.md', { eager: true, query: '?meta', import: 'default' })
const bodies = import.meta.glob('./posts/*.md', { import: 'default' })

// A build turns drafts into null (see plugins/posts.js).
const all = Object.values(metas).filter(Boolean)

for (const m of all) {
  if (!HUES[m.hue])
    throw new Error(`src/posts/${m.slug}.md: unknown hue "${m.hue}". Use one of: ${Object.keys(HUES).join(', ')}`)
  if (!EMOJI_NAMES.includes(m.icon))
    throw new Error(`src/posts/${m.slug}.md: unknown icon "${m.icon}". Use one of: ${EMOJI_NAMES.join(', ')}`)
}

// Newest first.
export const posts = all.sort((a, b) => b.date.localeCompare(a.date))

export const findPost = (slug) => posts.find((p) => p.slug === slug)

/** Resolves to { html, headings }, or null for an unknown slug. */
export const loadPost = (slug) => bodies[`./posts/${slug}.md`]?.() ?? Promise.resolve(null)

const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
export const formatDate = (iso) => fmt.format(new Date(`${iso}T00:00:00Z`))

/** [[year, posts], ...], newest year first. */
export function byYear(list = posts) {
  const groups = new Map()
  for (const p of list) {
    const y = p.date.slice(0, 4)
    if (!groups.has(y)) groups.set(y, [])
    groups.get(y).push(p)
  }
  return [...groups]
}
