
/**
 * Service Worker for Araç Filo Yönetimi PWA
 * Provides offline functionality and caching strategy
 */

const CACHE_NAME = 'filo-yonetim-v2.3-fixed';
const OFFLINE_URL = '/';

// Assets to cache on install (CDN resources only - build outputs cached dynamically)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // CDN Resources
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/toastify-js',
  // Note: /assets/*.js and /assets/*.css are cached dynamically via fetch event
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch((error) => {
        console.error('[Service Worker] Cache failed:', error);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed, return offline page
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * ========================================
 * FIREBASE CLOUD MESSAGING (BACKGROUND)
 * ========================================
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
try {
  firebase.initializeApp({
    apiKey: "AIzaSyDKeJDoNyGiPfdT6aOleZvzN85I8C3bVu8",
    authDomain: "rehber-filo.firebaseapp.com",
    databaseURL: "https://rehber-filo-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rehber-filo",
    storageBucket: "rehber-filo.appspot.com",
    messagingSenderId: "1022169726073",
    appId: "1:1022169726073:web:584648469dd7854248a8a8"
  });

  const messaging = firebase.messaging();

  // Handle background messages (when app is closed/minimized)
  messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Filo Yönetim';
    const notificationOptions = {
      body: payload.notification?.body || 'Yeni bir bildiriminiz var',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: payload.data?.tag || 'default',
      data: payload.data || {},
      requireInteraction: true, // Kullanıcı tıklayana kadar kalır
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Aç'
        },
        {
          action: 'close',
          title: 'Kapat'
        }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  console.log('[Service Worker] Firebase Messaging initialized');
} catch (error) {
  console.error('[Service Worker] Firebase Messaging init error:', error);
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === self.location.origin + '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // No window open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
