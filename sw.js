/**
 * BALL DEFENDER SERVICE WORKER
 * ============================
 * Provides offline functionality, caching, and fast loading for PWA
 */

// Debug mode - set to true to enable console logging
const SW_DEBUG_MODE = false;
function swDebugLog(...args) { if (SW_DEBUG_MODE) swDebugLog(...args); }
function swDebugWarn(...args) { if (SW_DEBUG_MODE) swDebugWarn(...args); }

const CACHE_NAME = 'ball-defender-v9.0.1';
const STATIC_CACHE_NAME = 'ball-defender-static-v9.0.1';
const DYNAMIC_CACHE_NAME = 'ball-defender-dynamic-v9.0.1';

// Core files that must be cached for offline functionality
const CORE_FILES = [
    './',
    './index.html',
    './index-organized.html',
    './css/style.css',
    './css/responsive-mobile.css',
    './js/main.js',
    './js/core/game.js',
    './js/core/game-core.js',
    './js/core/color-schemes.js',
    './js/core/block-renderers.js',
    './js/utils/performance-optimizer.js',
    './js/audio/mobile-touch-controls.js',
    './js/utils/main-menu.js',
    './js/modes/mode-template-system.js',
    './js/modes/original-mode-proper.js',
    './js/modes/ice-mode-proper.js', 
    './js/modes/ball-go-boom-mode-proper.js',
    './js/legacy/ball-detonator.js',
    './assets/manifest.json'
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
    './js/audio/audio-framework.js',
    // './js/legacy/neon-chaser-effects.js', // Disabled - excessive animations
    './js/modes/mode-examples.js'
];

// Files that should always be fetched fresh (for updates)
const NETWORK_FIRST_FILES = [
    './assets/version.json'
];

// Install event - cache core files
self.addEventListener('install', event => {
    swDebugLog('🔧 Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache core files
            caches.open(STATIC_CACHE_NAME).then(cache => {
                swDebugLog('📦 Caching core files...');
                return cache.addAll(CORE_FILES);
            }),
            
            // Cache audio files (non-blocking)
            caches.open(STATIC_CACHE_NAME).then(cache => {
                swDebugLog('🎵 Caching audio files...');
                return Promise.allSettled(
                    AUDIO_FILES.map(file => 
                        cache.add(file).catch(err => 
                            swDebugWarn(`⚠️ Failed to cache audio: ${file}`, err)
                        )
                    )
                );
            }),
            
            // Cache optional files (non-blocking)
            caches.open(STATIC_CACHE_NAME).then(cache => {
                swDebugLog('📎 Caching optional files...');
                return Promise.allSettled(
                    OPTIONAL_FILES.map(file => 
                        cache.add(file).catch(err => 
                            swDebugWarn(`⚠️ Failed to cache optional: ${file}`, err)
                        )
                    )
                );
            })
        ]).then(() => {
            swDebugLog('✅ Service Worker installation complete');
            // Skip waiting to activate immediately
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    swDebugLog('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old versions of our caches
                    if (cacheName.startsWith('ball-defender-') && 
                        cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== DYNAMIC_CACHE_NAME) {
                        swDebugLog(`🗑️ Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            swDebugLog('✅ Service Worker activated');
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
            swDebugLog(`📦 Serving from cache: ${request.url}`);
            return cachedResponse;
        }
        
        swDebugLog(`🌐 Fetching from network: ${request.url}`);
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
        swDebugLog(`🌐 Network-first: ${request.url}`);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        swDebugWarn(`⚠️ Network failed, trying cache: ${request.url}`);
        
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
        swDebugWarn(`⚠️ Background fetch failed: ${request.url}`, err);
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        swDebugLog(`📦 Serving stale: ${request.url}`);
        return cachedResponse;
    }
    
    // Otherwise wait for network
    swDebugLog(`🌐 Waiting for network: ${request.url}`);
    return fetchPromise;
}

// Background sync for when connectivity returns
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        swDebugLog('🔄 Background sync triggered');
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    try {
        // Sync any pending data, update leaderboards, etc.
        swDebugLog('📊 Syncing game data...');
        
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
            swDebugLog('⏭️ Skipping waiting period');
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                version: CACHE_NAME,
                caches: [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME]
            });
            break;
            
        case 'CLEAR_CACHES':
            swDebugLog('🗑️ Clearing all caches');
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
                swDebugLog('🎵 Caching additional audio files');
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

swDebugLog('🛡️ Ball, The Defender Service Worker loaded');
swDebugLog(`📋 Cache version: ${CACHE_NAME}`);
swDebugLog(`📦 Will cache ${CORE_FILES.length} core files`);
swDebugLog(`🎵 Will cache ${AUDIO_FILES.length} audio files`);
swDebugLog(`📎 Will cache ${OPTIONAL_FILES.length} optional files`);
