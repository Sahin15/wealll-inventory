import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons.svg'], // we'll use actual files
      manifest: {
        name: 'WeAlll Inventory',
        short_name: 'WeAlll',
        description: 'Smart multi-tenant business inventory, sales and operations system',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Cache static assets only (JS, CSS, fonts, static images). Do NOT cache API endpoints.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        // Ensuring API calls are explicitly NOT cached by workbox
        runtimeCaching: []
      }
    })
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (
              id.includes('react-router-dom') || 
              id.includes('react-dom') || 
              id.includes('/react/') || 
              id.includes('\\react\\')
            ) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('axios') || id.includes('react-hot-toast')) {
              return 'vendor-utils';
            }
            return 'vendor-core';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5010',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:5010',
        changeOrigin: true
      }
    }
  }
})
