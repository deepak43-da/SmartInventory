// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       devOptions: {
//         enabled: true, // allows PWA in dev mode
//       },
//       manifest: {
//         name: 'Merchandiser',
//         short_name: 'Merchandiser',
//         start_url: '/',
//         display: 'standalone',
//         background_color: '#ffffff',
//         theme_color: '#0A2E61',
//         icons: [
//           {
//             src: '/pwa-192x192.png',
//             sizes: '192x192',
//             type: 'image/png'
//           },
//           {
//             src: '/pwa-512x512.png',
//             sizes: '512x512',
//             type: 'image/png'
//           }
//         ]
//       }
//     })
//   ]
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      devOptions: {
        enabled: true, // allow PWA in dev
      },

      // 🔥 THIS IS THE FIX
      workbox: {
        // Always serve index.html for SPA navigation
        navigateFallback: '/index.html',

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'document',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
            },
          },
        ],
      },

      includeAssets: [
        'index.html',
        'manifest.json',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],

      manifest: {
        name: 'Merchandiser',
        short_name: 'Merchandiser',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0A2E61',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})

