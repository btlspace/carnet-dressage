import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['*.png', '*.svg', '*.ico'],
      manifest: {
        id: '/',
        name: 'Carnet de Dressage',
        short_name: 'Carnet Dressage',
        description: 'Application de gestion de carnet de dressage canin',
        start_url: '/',
        display: 'standalone',
        background_color: '#667eea',
        theme_color: '#667eea',
        orientation: 'any',
        lang: 'fr-FR',
        categories: ['productivity', 'utilities'],
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/home_(iPhone 14 Pro Max).png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Accueil'
          },
          {
            src: '/screenshots/fiche_recherche_(iPhone 14 Pro Max).png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Fiche de recherche'
          },
          {
            src: '/screenshots/ordre_passage_(iPhone 14 Pro Max).png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Ordre de passage'
          },
          {
            src: '/screenshots/home_pc.png',
            sizes: '1920x877',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Accueil (PC)'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 1000
    },
    host: true
  }
})
