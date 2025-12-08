// Enhanced Leaderboard System with Multiple Fallbacks
// This script patches the game to use a more robust leaderboard system

(function() {
    console.log('🔧 Leaderboard Fix Module Loading...');
    
    // Test localStorage availability
    function testLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            console.log('✅ localStorage is available');
            return true;
        } catch(e) {
            console.warn('❌ localStorage is NOT available:', e.message);
            return false;
        }
    }
    
    // Alternative storage using cookies
    const CookieStorage = {
        setItem: function(key, value) {
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
            document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            console.log('🍪 Saved to cookie storage');
        },
        
        getItem: function(key) {
            const name = key + "=";
            const decodedCookie = decodeURIComponent(document.cookie);
            const cookies = decodedCookie.split(';');
            
            for(let i = 0; i < cookies.length; i++) {
                let c = cookies[i].trim();
                if (c.indexOf(name) === 0) {
                    const value = c.substring(name.length);
                    console.log('🍪 Loaded from cookie storage');
                    return value;
                }
            }
            return null;
        }
    };
    
    // Alternative storage using IndexedDB
    const IndexedDBStorage = {
        dbName: 'BallDefenderDB',
        storeName: 'leaderboard',
        db: null,
        
        init: async function() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, 1);
                
                request.onerror = () => {
                    console.error('❌ IndexedDB failed to open');
                    reject(request.error);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    console.log('✅ IndexedDB initialized');
                    resolve();
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
            });
        },
        
        setItem: async function(key, value) {
            if (!this.db) await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(value, key);
                
                request.onsuccess = () => {
                    console.log('💾 Saved to IndexedDB');
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('❌ IndexedDB save failed');
                    reject(request.error);
                };
            });
        },
        
        getItem: async function(key) {
            if (!this.db) await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);
                
                request.onsuccess = () => {
                    if (request.result !== undefined) {
                        console.log('💾 Loaded from IndexedDB');
                    }
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('❌ IndexedDB read failed');
                    reject(request.error);
                };
            });
        }
    };
    
    // Enhanced storage wrapper that tries multiple methods
    window.PersistentStorage = {
        localStorageAvailable: testLocalStorage(),
        
        async setItem(key, value) {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            
            // Try localStorage first
            if (this.localStorageAvailable) {
                try {
                    localStorage.setItem(key, stringValue);
                    console.log('✅ Saved to localStorage');
                } catch(e) {
                    console.warn('localStorage save failed:', e);
                    this.localStorageAvailable = false;
                }
            }
            
            // Also save to cookies as backup
            try {
                CookieStorage.setItem(key, stringValue);
            } catch(e) {
                console.warn('Cookie save failed:', e);
            }
            
            // Also try IndexedDB
            try {
                await IndexedDBStorage.setItem(key, stringValue);
            } catch(e) {
                console.warn('IndexedDB save failed:', e);
            }
        },
        
        async getItem(key) {
            // Try localStorage first
            if (this.localStorageAvailable) {
                try {
                    const value = localStorage.getItem(key);
                    if (value !== null) {
                        console.log('✅ Retrieved from localStorage');
                        return value;
                    }
                } catch(e) {
                    console.warn('localStorage read failed:', e);
                    this.localStorageAvailable = false;
                }
            }
            
            // Try IndexedDB next
            try {
                const value = await IndexedDBStorage.getItem(key);
                if (value !== undefined && value !== null) {
                    console.log('✅ Retrieved from IndexedDB');
                    return value;
                }
            } catch(e) {
                console.warn('IndexedDB read failed:', e);
            }
            
            // Fall back to cookies
            try {
                const value = CookieStorage.getItem(key);
                if (value !== null) {
                    console.log('✅ Retrieved from cookies');
                    return value;
                }
            } catch(e) {
                console.warn('Cookie read failed:', e);
            }
            
            return null;
        }
    };
    
    // Override the game's save/load functions if they exist
    if (window.saveOnlineLeaderboard) {
        const originalSave = window.saveOnlineLeaderboard;
        window.saveOnlineLeaderboard = async function(leaderboard) {
            console.log('🔧 Using enhanced save system');
            await window.PersistentStorage.setItem('ballDefenderPersistentLeaderboard', leaderboard);
            return originalSave.call(this, leaderboard);
        };
    }
    
    if (window.loadOnlineLeaderboard) {
        const originalLoad = window.loadOnlineLeaderboard;
        window.loadOnlineLeaderboard = async function() {
            console.log('🔧 Using enhanced load system');
            const stored = await window.PersistentStorage.getItem('ballDefenderPersistentLeaderboard');
            if (stored) {
                try {
                    const scores = JSON.parse(stored);
                    console.log(`🔧 Successfully loaded ${scores.length} scores from enhanced storage`);
                    window.currentLeaderboard = scores;
                    window.updateLeaderboardDisplay();
                    return scores;
                } catch(e) {
                    console.error('Failed to parse stored scores:', e);
                }
            }
            return originalLoad.call(this);
        };
    }
    
    console.log('✅ Leaderboard Fix Module Loaded');
    console.log('Storage methods available:');
    console.log('  - localStorage:', testLocalStorage() ? 'YES' : 'NO');
    console.log('  - Cookies: YES');
    console.log('  - IndexedDB: YES (async)');
})();