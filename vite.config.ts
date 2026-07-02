import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works whether served from a domain root or a
  // GitHub Pages project subpath (e.g. /wkcd-tree-map/).
  base: './',
  plugins: [react()],
})
