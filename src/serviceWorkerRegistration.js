// // src/serviceWorkerRegistration.js

// export function register() {
//   if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//       navigator.serviceWorker.register('/service-worker.js');
//     });
//   }
// }

// export function unregister() {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.ready.then(registration => {
//       registration.unregister();
//     });
//   }
// }

// const CACHE_NAME = "pwa-cache-v1";

// const APP_SHELL = [
//   "/",
//   "/index.html",
//   "/manifest.json"
// ];

// // 🔹 INSTALL
// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(APP_SHELL);
//     })
//   );
//   self.skipWaiting();
// });

// // 🔹 ACTIVATE
// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((keys) =>
//       Promise.all(
//         keys
//           .filter((key) => key !== CACHE_NAME)
//           .map((key) => caches.delete(key))
//       )
//     )
//   );
//   self.clients.claim();
// });

// // 🔹 FETCH (THIS IS THE IMPORTANT PART)
// self.addEventListener("fetch", (event) => {

//   // ✅ SPA navigation → always return index.html
//   if (event.request.mode === "navigate") {
//     event.respondWith(
//       caches.match("/index.html").then((cached) => {
//         return cached || fetch(event.request);
//       })
//     );
//     return;
//   }

//   // ✅ Static assets
//   event.respondWith(
//     caches.match(event.request).then((cached) => {
//       return cached || fetch(event.request);
//     })
//   );
// });

const CLEANUP_KEY = "last_data_cleanup_timestamp";

const APP_SHELL = ["/", "/index.html", "/manifest.json"];
// import { store, persistor } from "./redux/store";
// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

// Activate with cleanup
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== CACHE_NAME)
              .map((key) => caches.delete(key)),
          ),
        ),
      // Check for cleanup every 5 minutes
      (async () => {
        const lastCleanup = localStorage.getItem(CLEANUP_KEY);
        const now = new Date();
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (!lastCleanup || now - new Date(lastCleanup) > fiveMinutesInMs) {
          // Clear IndexedDB (Redux store)
          if (window.indexedDB) {
            const databases = await window.indexedDB.databases();
            for (const db of databases) {
              if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
              }
            }
          }
          // Clear all localStorage items (including persist:root and any user/offline/session data)
      //      await persistor.purge();
      // store.dispatch({ type: "RESET_STORE" });
          localStorage.clear();

          // Update cleanup timestamp
          localStorage.setItem(CLEANUP_KEY, now.toISOString());
        }
      })(),
    ]),
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  // SPA navigation
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cached) => {
        return cached || fetch(event.request);
      }),
    );
    return;
  }

  // Static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    }),
  );
});

const CACHE_NAME = "app-cache-v1";
const urlsToCache = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // For API calls, we don't want to cache failures
          // Let Redux handle offline data
          return new Response(
            JSON.stringify({
              error: "Offline",
              message: "Network unavailable",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        });
    }),
  );
});


