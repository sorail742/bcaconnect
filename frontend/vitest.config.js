import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['node_modules/**', 'e2e/**', 'dist/**'],
    // La suite de tests unitaires frontend démarre tout juste (Phase 0) — ne
    // pas faire échouer la CI tant qu'aucun fichier *.test.js n'est encore
    // commité. À retirer une fois une première vague de tests en place.
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      reportsDirectory: 'coverage',
      exclude: ['node_modules/**', 'e2e/**', 'src/context/translations.js'],
    },
  },
})
