// Caching static assets (Application Shell)
const CACHE_NAME = 'dicoding-story-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.webmanifest',
    '/icons/icon-192x192.jpg',
    'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js',
    'https://fonts.googleapis.com/css2?family=Poppins&display=swap'
];


// Install event - cache App Shell
self.addEventListener('install', event => {
    console.log('Service Worker: installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: caching app shell');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: activated');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Fetch event - serve cached if offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response =>
            response || fetch(event.request).catch(() => {
                return new Response('Offline 😕', {
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
        )
    );
});

// Push Notification Listener
self.addEventListener('push', async (event) => {
    console.log("Push event masuk");

    if (!event.data) {
        console.warn('📭 Push event tanpa payload');
        return;
    }

    let data;
    try {
        data = event.data.json();
        console.log("Payload berupa JSON:", data);
    } catch (e) {
        console.warn('⚠️ Payload bukan JSON, fallback ke text.', e);
        const fallbackText = await event.data.text(); // <-- penting
        data = {
            title: 'Notifikasi',
            options: {
                body: fallbackText,
                data: { url: '/' }
            }
        };
    }

    const { title, options } = data;

    event.waitUntil(
        self.registration.showNotification(title, {
            ...options,
            icon: './icons/icon-192x192.jpg',
            badge: './icons/icon-192x192.jpg',
            data: {
                url: options?.data?.url || '/'
            }
        })
    );
});


// Klik Notifikasi → buka / fokus tab
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) return client.focus();
            }
            return clients.openWindow(url);
        })
    );
});
