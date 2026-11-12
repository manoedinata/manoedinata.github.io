// Contact-tile line icons (Tabler style: 24×24, stroke 2, round caps), drawn with currentColor.
// Brand glyphs (x, github, mail, telegram) are filled paths in components/Icon.vue.
// Add an icon: one entry here, a list of path `d` strings.

export const LINE_ICONS = {
  pen: ['M4 20h4L18.5 9.5a2.828 2.828 0 1 0-4-4L4 16v4', 'M13.5 6.5l4 4'],
  'paper-plane': ['M10 14l11 -11', 'M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5'],
}

export const BRAND_ICONS = ['x', 'github', 'mail', 'telegram']

export const ICONS = [...BRAND_ICONS, ...Object.keys(LINE_ICONS)]
