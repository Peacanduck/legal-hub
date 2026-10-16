import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const entry = (file: string) => fileURLToPath(new URL(file, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
