// Colour emoji-style icons: Microsoft Fluent Emoji Flat (MIT), vendored as SVGs in src/assets/emoji/.
// Add one: curl -o src/assets/emoji/<name>.svg https://api.iconify.design/fluent-emoji-flat/<name>.svg
// (browse names at https://icon-sets.iconify.design/fluent-emoji-flat/)

const files = import.meta.glob('./assets/emoji/*.svg', { eager: true, query: '?url', import: 'default' })

export const EMOJI = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice('./assets/emoji/'.length, -'.svg'.length), url]),
)

export const EMOJI_NAMES = Object.keys(EMOJI)
