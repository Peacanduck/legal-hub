import { renameSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const entry = (file: string) => fileURLToPath(new URL(file, import.meta.url))

// Vercel serves a real file before it applies any rewrite, and `/` is the
// file index.html. Shipping the hub's page as hub.html instead leaves `/`
// to vercel.json, which serves diggle.html on diggle.pydigital.xyz and
// hub.html everywhere else. Build only: the dev server keeps index.html.
const hubEntryAsHubHtml = (): Plugin => ({
  name: 'hub-entry-as-hub-html',
  apply: 'build',
  writeBundle(options) {
    const dir = options.dir ?? 'dist'
    renameSync(join(dir, 'index.html'), join(dir, 'hub.html'))
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), hubEntryAsHubHtml()],
  build: {
    rollupOptions: {
      // One HTML entry per app with its own landing page, so each serves its
      // own favicon, title and link-preview tags before any JavaScript runs
      // (wallets and crawlers only read the static head). Every entry loads
      // the same app; vercel.json maps the routes to them.
      input: {
        main: entry('./index.html'),
        diggle: entry('./diggle.html'),
        vorta: entry('./vorta.html'),
      },
    },
  },
})
