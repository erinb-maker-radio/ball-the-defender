/**
 * BALL DEFENDER SERVICE WORKER
 * ============================
 * Provides offline functionality, caching, and fast loading for PWA
 */

const CACHE_NAME = 'ball-defender-v8.6.0';
const STATIC_CACHE_NAME = 'ball-defender-static-v8.6.0';
const DYNAMIC_CACHE_NAME = 'ball-defender-dynamic-v8.6.0';

// Core files that must be cached for offline functionality
const CORE_FILES = [
    './',
    './index.html',
    './style.css',
    './responsive-mobile.css',
    './game.js',
    './game-core.js',
    './performance-optimizer.js',
    './mobile-touch-controls.js',
    './main-menu.js',
    './mode-template-system.js',
    './original-mode-proper.js',
    './ice-mode-proper.js', 
    './ball-go-boom-mode-proper.js',
    './ball-detonator.js',
    './working-gist-writer.js',
    './block-renderers.js',
    './manifest.json'
];

// Audio files for offline play
const AUDIO_FILES = [
    './audio/grand-piano_A.wav',
    './audio/open-hihat.wav',
    './audio/roland-grand-piano-one-note-bright_169bpm_C_major.wav',
    './audio/roland-grand-piano-one-note-electric-2_149bpm_F_minor.wav',
    './audio/roland-grand-piano-one-note-grand_111bpm_G_major.wav'
];

// Optional files that enhance the experience but aren't required
const OPTIONAL_FILES = [
    './mode-performance-template.js',
    './audio-framework.js',
    './neon-chaser-effects.js',
    './color-schemes.js',
    './mode-examples.js'
];

// Files that should always be fetched fresh (for updates)
const NETWORK_FIRST_FILES = [
    './version.json',
    './auto-updater.js'
];

// Install event - cache core files
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache core files
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('📦 Caching core files...');
                return cache.addAll(CORE_FILES);
            }),
            
            // Cache audio files (non-blocking)
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('🎵 Caching audio files...');
                return Promise.allSettled(
                    AUDIO_FILES.map(file => 
                        cache.add(file).catch(err => 
                            console.warn(`⚠️ Failed to cache audio: ${file}`, err)
                        )
                    )
                );
            }),
            
            // Cache optional files (non-blocking)
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('📎 Caching optional files...');
                return Promise.allSettled(
                    OPTIONAL_FILES.map(file => 
                        cache.add(file).catch(err => 
                            console.warn(`⚠️ Failed to cache optional: ${file}`, err)
                        )
                    )
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker installation complete');
            // Skip waiting to activate immediately
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old versions of our caches
                    if (cacheName.startsWith('ball-defender-') && 
                        cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== DYNAMIC_CACHE_NAME) {
                        console.log(`🗑️ Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content and handle caching strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Only handle requests from our origin
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different caching strategies based on file type
    if (NETWORK_FIRST_FILES.some(file => url.pathname.endsWith(file))) {
        // Network first for update files
        event.respondWith(networkFirstStrategy(event.request));
    } else if (url.pathname.endsWith('.wav') || url.pathname.endsWith('.mp3')) {
        // Cache first for audio files
        event.respondWith(cacheFirstStrategy(event.request));
    } else if (CORE_FILES.some(file => url.pathname.endsWith(file) || url.pathname === file)) {
        // Cache first for core game files
        event.respondWith(cacheFirstStrategy(event.request));
    } else {
        // Stale while revalidate for other files
        event.respondWith(staleWhileRevalidateStrategy(event.request));
    }
});

// Cache-first strategy - serve from cache, fallback to network
async function cacheFirstStrategy(request) {
    try {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log(`📦 Serving from cache: ${request.url}`);
            return cachedResponse;
        }
        
        console.log(`🌐 Fetching from network: ${request.url}`);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error(`❌ Cache-first failed for ${request.url}:`, error);
        
        // Return offline fallback if available
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE_NAME);
            return cache.match('./index.html');
        }
        
        throw error;
    }
}

// Network-first strategy - try network, fallback to cache
async function networkFirstStrategy(request) {
    try {
        console.log(`🌐 Network-first: ${request.url}`);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn(`⚠️ Network failed, trying cache: ${request.url}`);
        
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale-while-revalidate strategy - serve from cache, update in background
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch update in background
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(err => {
        console.warn(`⚠️ Background fetch failed: ${request.url}`, err);
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        console.log(`📦 Serving stale: ${request.url}`);
        return cachedResponse;
    }
    
    // Otherwise wait for network
    console.log(`🌐 Waiting for network: ${request.url}`);
    return fetchPromise;
}

// Background sync for when connectivity returns
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    try {
        // Sync any pending data, update leaderboards, etc.
        console.log('📊 Syncing game data...');
        
        // Could implement leaderboard sync, settings sync, etc. here
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC_COMPLETE',
                timestamp: Date.now()
            });
        });
        
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Handle messages from the main app
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            console.log('⏭️ Skipping waiting period');
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                version: CACHE_NAME,
                caches: [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME]
            });
            break;
            
        case 'CLEAR_CACHES':
            console.log('🗑️ Clearing all caches');
            event.waitUntil(
                caches.keys().then(cacheNames => 
                    Promise.all(
                        cacheNames.map(name => caches.delete(name))
                    )
                )
            );
            break;
            
        case 'CACHE_AUDIO':
            if (data.audioFiles) {
                console.log('🎵 Caching additional audio files');
                event.waitUntil(cacheAudioFiles(data.audioFiles));
            }
            break;
    }
});

// Cache additional audio files
async function cacheAudioFiles(audioFiles) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    return Promise.allSettled(
        audioFiles.map(file => cache.add(file))
    );
}

// Error handling
self.addEventListener('error', event => {
    console.error('🚨 Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('🚨 Service Worker unhandled rejection:', event.reason);
});

console.log('🛡️ Ball Defender Service Worker loaded');
console.log(`📋 Cache version: ${CACHE_NAME}`);
console.log(`📦 Will cache ${CORE_FILES.length} core files`);
console.log(`🎵 Will cache ${AUDIO_FILES.length} audio files`);
console.log(`📎 Will cache ${OPTIONAL_FILES.length} optional files`);