import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// base = nome del repository, perché il sito è servito da GitHub Pages
// su giacomoguaresi.github.io/Adventures/ (docs/05-deploy.md).
export default defineConfig({
  base: '/Adventures/',
  plugins: [
    react(),
    tailwindcss(),
    // PWA come in Grocery e Projects: installabile, con la shell dell'app in
    // cache. I dati non passano dal service worker: senza rete non si vedono i
    // trekking (docs/03-architettura.md). Le icone le genera `npm run icone` da
    // public/icona.svg.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icona.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Adventures',
        short_name: 'Adventures',
        description: 'Trekking e avventure da fare fuori casa',
        lang: 'it',
        display: 'standalone',
        // Come l'intestazione e lo sfondo dell'app (src/index.css).
        theme_color: '#3f6485',
        background_color: '#f1f5f9',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
