const CACHE_PREFIX = 'golf-';
const CACHE_NAME = 'golf-v1.0.3';
const PRECACHE_URLS = [
    './',
    './index.html',
    './index-en.html',
    './index-jp.html',
    './analysis.html',
    './analysis-en.html',
    './analysis-jp.html',
    './assets/css/style.css',
    './assets/css/landing-page.css',
    './assets/css/analysis.css',
    './assets/js/app-update.js',
    './assets/js/browser-check.js',
    './assets/js/error-reporter.js',
    './assets/js/landing-page.js',
    './favicon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

function isStaticAsset(request, url) {
    return ['style', 'script', 'image', 'font'].includes(request.destination)
        || url.pathname.includes('/assets/')
        || /\.(?:css|js|png|jpe?g|gif|svg|webp|woff2?|json)$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin || url.pathname.endsWith('/version.json')) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
                    }
                    return response;
                })
                .catch(async () => (
                    await caches.match(request)
                    || await caches.match('./index.html')
                    || Response.error()
                ))
        );
        return;
    }

    if (!isStaticAsset(request, url)) return;

    event.respondWith((async () => {
        const cached = await caches.match(request);
        const network = fetch(request)
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
                }
                return response;
            })
            .catch(() => null);
        if (cached) {
            event.waitUntil(network);
            return cached;
        }
        return await network || Response.error();
    })());
});
