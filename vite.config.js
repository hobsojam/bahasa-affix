import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/bahasa-affix/' : '/',
  plugins: [svelte()],
  build: {
    // The search index (~5.7MB of JSON) is lazy-loaded as its own chunk
    // (see WordSearch.svelte) rather than bundled into the critical path,
    // so its raw size no longer reflects initial load cost -- raise the
    // warning limit to match it instead of getting an expected warning on
    // every build.
    chunkSizeWarningLimit: 6000,
  },
}))
