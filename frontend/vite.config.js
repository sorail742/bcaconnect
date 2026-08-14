import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000'

  return {
  plugins: [
    react(),
    // Génère dist/stats.html après `vite build` — diagnostic du contenu réel
    // du chunk principal (688 kB avant optimisation), pas une supposition.
    visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      // stats.html (rollup-plugin-visualizer) est un artefact de diagnostic de
      // build, pas un asset applicatif — l'exclure du precache du service
      // worker (sinon il dépasse maximumFileSizeToCacheInBytes et fait
      // échouer le build en environnement, cf. incident lors de son ajout).
      workbox: {
        globIgnores: ['stats.html'],
      },
      manifest: {
        name: 'BCA Connect',
        short_name: 'BCA',
        description: 'BCA Connect - Écosystème Connecté',
        theme_color: '#1CA0DB',
        icons: [
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      'react': path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules', 'react-router-dom'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/dexie') || id.includes('node_modules/socket.io-client')) {
            return 'vendor-data';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
    strictPort: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/socket.io': {
        target: backendUrl,
        ws: true,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
  }
})
