/**
 * Service Worker - Performance & Offline Cache
 * Focus: Fast loading + Stability
 */

const CACHE_NAME = 'menu-online-v1.4';
const STATIC_CACHE = 'static-v1.4';
const DYNAMIC_CACHE = 'dynamic-v1.4';

// Critical assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/styles/main.css',
    '/src/js/app.js',
    '/src/js/views/MenuView.js',
    '/src/js/database-nasa.js',
    '/src/js/services/data-lazy-loader.js',
    '/src/js/services/lazy-loader.js',
    '/favicon.ico'
];

// Install: Cache critical assets
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Static cache complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Cache install failed:', error);
            })
    );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch: Network-first for data, cache-first for assets
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip Chrome extensions
    if (url.protocol === 'chrome-extension:') return;
    
    // Skip external CDNs (they have their own caching)
    if (url.hostname === 'cdn.tailwindcss.com') return;
    
    event.respondWith(
        handleRequest(request)
    );
});

async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Static assets: Cache-first strategy
        if (isStaticAsset(url.pathname)) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // API/Data requests: Network-first strategy
        if (isDataRequest(url.pathname)) {
            return await networkFirst(request, DYNAMIC_CACHE);
        }
        
        // Everything else: Network-first with cache fallback
        return await networkFirst(request, DYNAMIC_CACHE);
        
    } catch (error) {
        console.error('❌ Fetch failed:', error);
        
        // Fallback to offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        return new Response('Offline', { status: 503 });
    }
}

// Cache-first strategy (for static assets)
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }
    
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }
    
    return response;
}

// Network-first strategy (for dynamic content)
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        // Network failed, try cache
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        
        throw error;
    }
}

// Check if request is for static assets
function isStaticAsset(pathname) {
    return pathname.includes('/src/') || 
           pathname.includes('.css') || 
           pathname.includes('.js') || 
           pathname.includes('.ico') ||
           pathname === '/' ||
           pathname === '/index.html';
}

// Check if request is for data/API
function isDataRequest(pathname) {
    return pathname.includes('/api/') || 
           pathname.includes('.json') ||
           pathname.includes('supabase');
}

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data === 'GET_CACHE_STATUS') {
        getCacheStatus().then(status => {
            event.ports[0].postMessage(status);
        });
    }
});

async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        status[cacheName] = keys.length;
    }
    
    return status;
}