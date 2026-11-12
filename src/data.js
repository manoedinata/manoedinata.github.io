// Page content + per-hue class maps (DESIGN.md §3).
// Class strings are written out in full so Tailwind can detect them.

export const HUES = {
  purple: { strong: 'bg-purple-100 dark:bg-purple-900', soft: 'bg-purple-50 dark:bg-purple-950', icon: 'text-purple-900 dark:text-purple-200', light: '#7e22ce', dark: '#d8b4fe' },
  red: { strong: 'bg-red-100 dark:bg-red-900', soft: 'bg-red-50 dark:bg-red-950', icon: 'text-red-900 dark:text-red-200', light: '#b91c1c', dark: '#fca5a5' },
  orange: { strong: 'bg-orange-100 dark:bg-orange-900', soft: 'bg-orange-50 dark:bg-orange-950', icon: 'text-orange-900 dark:text-orange-200', light: '#c2410c', dark: '#fdba74' },
  yellow: { strong: 'bg-yellow-100 dark:bg-yellow-900', soft: 'bg-yellow-50 dark:bg-yellow-950', icon: 'text-yellow-900 dark:text-yellow-200', light: '#a16207', dark: '#fde047' },
  green: { strong: 'bg-green-100 dark:bg-green-900', soft: 'bg-green-50 dark:bg-green-950', icon: 'text-green-900 dark:text-green-200', light: '#15803d', dark: '#86efac' },
  blue: { strong: 'bg-blue-100 dark:bg-blue-900', soft: 'bg-blue-50 dark:bg-blue-950', icon: 'text-blue-900 dark:text-blue-200', light: '#1d4ed8', dark: '#93c5fd' },
  indigo: { strong: 'bg-indigo-100 dark:bg-indigo-900', soft: 'bg-indigo-50 dark:bg-indigo-950', icon: 'text-indigo-900 dark:text-indigo-200', light: '#4338ca', dark: '#a5b4fc' },
  fuchsia: { strong: 'bg-fuchsia-100 dark:bg-fuchsia-900', soft: 'bg-fuchsia-50 dark:bg-fuchsia-950', icon: 'text-fuchsia-900 dark:text-fuchsia-200', light: '#a21caf', dark: '#f0abfc' },
  neutral: { strong: 'bg-neutral-100 dark:bg-neutral-800', soft: 'bg-neutral-50 dark:bg-neutral-900', icon: 'text-neutral-900 dark:text-neutral-200', light: '#404040', dark: '#d4d4d4' },
  latte: { strong: 'bg-[oklch(87%_0.045_60)] dark:bg-[oklch(40.8%_0.045_60)]', soft: 'bg-[oklch(95%_0.02_60)] dark:bg-[oklch(30%_0.03_60)]', icon: 'text-[oklch(30%_0.06_60)] dark:text-[oklch(90%_0.04_60)]', light: 'oklch(55.3% 0.09 60)', dark: 'oklch(83.7% 0.07 60)' },
  slate: { strong: 'bg-[oklch(92.9%_0.025_280)] dark:bg-[oklch(37.2%_0.06_280)]', soft: 'bg-[oklch(96%_0.012_280)] dark:bg-[oklch(28%_0.04_280)]', icon: 'text-[oklch(20.8%_0.04_280)] dark:text-[oklch(92.9%_0.025_280)]', light: 'oklch(37.2% 0.06 280)', dark: 'oklch(86.9% 0.035 280)' },
}

// ---- Content lives in content.yaml; this file only loads and checks it ----

import content from './content.yaml'

const ICONS = ['x', 'github', 'mail', 'pen', 'paper-plane', 'telegram'] // keep in sync with components/Icon.vue

function check(list, section, key, allowed) {
  for (const entry of list ?? [])
    if (!allowed.includes(entry[key]))
      throw new Error(`content.yaml → ${section} "${entry.title ?? entry.label}": unknown ${key} "${entry[key]}". Use one of: ${allowed.join(', ')}`)
}

check(content.features, 'features', 'hue', Object.keys(HUES))
check(content.contacts, 'contacts', 'hue', Object.keys(HUES))
check(content.contacts, 'contacts', 'icon', ICONS)
check(content.projects, 'projects', 'hue', Object.keys(HUES))

const names = content.profile.names?.length ? content.profile.names.map(String) : [content.profile.name]
export const profile = { ...content.profile, names, year: new Date().getFullYear() }
export const features = content.features ?? []
export const contacts = content.contacts ?? []
export const projects = content.projects ?? []
export const footerLinks = content.footer?.links ?? []
export const site = { title: content.site?.title || content.profile.name, description: content.site?.description ?? '' }
