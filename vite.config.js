import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { parse } from 'yaml'

const CONTENT = new URL('./src/content.yaml', import.meta.url)

// Import .yaml/.yml files as plain JS objects.
const yaml = () => ({
  name: 'yaml',
  transform(code, id) {
    if (!/\.ya?ml$/.test(id)) return
    return { code: `export default ${JSON.stringify(parse(code))}`, map: null }
  },
})

const escape = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Fill %SITE_TITLE% / %SITE_DESCRIPTION% in index.html from content.yaml.
const siteMeta = () => ({
  name: 'site-meta',
  transformIndexHtml(html) {
    const { site = {}, profile = {} } = parse(readFileSync(CONTENT, 'utf8')) ?? {}
    return html
      .replaceAll('%SITE_TITLE%', escape(site.title || profile.name))
      .replaceAll('%SITE_DESCRIPTION%', escape(site.description || profile.lines?.[0]))
  },
  // index.html is not a module, so reload the page when the content changes.
  handleHotUpdate({ file, server }) {
    if (file === CONTENT.pathname) server.ws.send({ type: 'full-reload' })
  },
})

export default defineConfig({
  plugins: [yaml(), siteMeta(), vue(), tailwindcss()],
})
