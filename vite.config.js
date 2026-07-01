import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pembilas/' : '/',
  plugins: [svelte()],
  // Vitest resolves packages without the "browser" condition by default,
  // which makes Svelte pick its server-side build (no mount/effects) even
  // under jsdom. Forcing it here is the documented fix for component tests.
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  build: {
    // The search index (~5.7MB of JSON) is lazy-loaded as its own chunk
    // (see WordSearch.svelte) rather than bundled into the critical path,
    // so its raw size no longer reflects initial load cost -- raise the
    // warning limit to match it instead of getting an expected warning on
    // every build.
    chunkSizeWarningLimit: 6000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.js'],
  },
}))
