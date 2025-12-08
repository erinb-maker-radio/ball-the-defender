// ELIMINATE ALL FAKE NAMES - Zero tolerance for fallback scores
(function() {
    console.log('🚫 ELIMINATING ALL FAKE NAMES...');
    
    // List of ALL fake names that should NEVER appear
    const FAKE_NAMES = [
        'DEFENDER PRO', 'BLOCK BUSTER', 'FIREBALL', 'SNIPER', 'ROOKIE', 
        'CHALLENGER', 'PLAYER ONE', 'BALLMASTER', 'ACE'
    ];
    
    // Function to remove ANY fake names from ANY array
    function removeFakeNames(scores) {
        if (!Array.isArray(scores)) return [];
        
        const filtered = scores.filter(score => {
            if (!score || !score.name) return false;
            
            const isFake = FAKE_NAMES.some(fakeName => 
                score.name.toUpperCase().includes(fakeName.toUpperCase())
            );
            
            if (isFake) {
                console.log('🚫 ELIMINATED FAKE NAME:', score.name);
            }
            
            return !isFake;
        });
        
        console.log(`🚫 Filtered ${scores.length} scores down to ${filtered.length} (removed ${scores.length - filtered.length} fake names)`);
        return filtered;
    }
    
    // Override ALL functions that might return scores
    function overrideAllScoreFunctions() {
        console.log('🚫 Overriding ALL score functions to eliminate fake names...');
        
        // Override getLeaderboard
        if (window.getLeaderboard) {
            const originalGet = window.getLeaderboard;
            window.getLeaderboard = function() {
                const scores = originalGet.call(this);
                const filtered = removeFakeNames(scores);
                console.log(`🚫 getLeaderboard: ${scores.length} → ${filtered.length} scores`);
                return filtered;
            };
        }
        
        // Override OnlineLeaderboard.mergeAndSync
        if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
            const originalMerge = window.OnlineLeaderboard.mergeAndSync;
            window.OnlineLeaderboard.mergeAndSync = async function(newScore) {
                const result = await originalMerge.call(this, newScore);
                const filtered = removeFakeNames(result);
                
                // Save filtered version back to localStorage
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(filtered));
                
                console.log(`🚫 OnlineLeaderboard.mergeAndSync: ${result.length} → ${filtered.length} scores`);
                return filtered;
            };
        }
        
        // Override currentLeaderboard getter/setter
        if (window.currentLeaderboard) {
            let _currentLeaderboard = removeFakeNames(window.currentLeaderboard);
            
            Object.defineProperty(window, 'currentLeaderboard', {
                get: function() {
                    return _currentLeaderboard;
                },
                set: function(newScores) {
                    _currentLeaderboard = removeFakeNames(newScores);
                    console.log(`🚫 currentLeaderboard set: ${newScores?.length || 0} → ${_currentLeaderboard.length} scores`);
                },
                configurable: true
            });
        }
        
        // Override loadOnlineLeaderboard
        if (window.loadOnlineLeaderboard) {
            const originalLoad = window.loadOnlineLeaderboard;
            window.loadOnlineLeaderboard = async function() {
                const result = await originalLoad.call(this);
                const filtered = removeFakeNames(result);
                
                // Force update the global reference
                if (window.currentLeaderboard) {
                    window.currentLeaderboard = filtered;
                }
                
                console.log(`🚫 loadOnlineLeaderboard: ${result?.length || 0} → ${filtered.length} scores`);
                return filtered;
            };
        }
        
        // Clean localStorage on every access
        const originalGetItem = localStorage.getItem;
        localStorage.getItem = function(key) {
            const result = originalGetItem.call(this, key);
            
            if (key === 'ballDefenderGlobalLeaderboard' && result) {
                try {
                    const scores = JSON.parse(result);
                    const filtered = removeFakeNames(scores);
                    
                    if (filtered.length !== scores.length) {
                        console.log(`🚫 Cleaned localStorage: ${scores.length} → ${filtered.length} scores`);
                        localStorage.setItem(key, JSON.stringify(filtered));
                        return JSON.stringify(filtered);
                    }
                } catch (e) {
                    console.warn('🚫 Error cleaning localStorage:', e);
                }
            }
            
            return result;
        };
    }
    
    // Clean existing localStorage immediately
    function cleanExistingData() {
        console.log('🚫 Cleaning existing localStorage data...');
        
        const keys = ['ballDefenderGlobalLeaderboard', 'ballDefenderPersistentLeaderboard'];
        
        keys.forEach(key => {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    const scores = JSON.parse(stored);
                    const filtered = removeFakeNames(scores);
                    
                    if (filtered.length !== scores.length) {
                        localStorage.setItem(key, JSON.stringify(filtered));
                        console.log(`🚫 Cleaned ${key}: ${scores.length} → ${filtered.length} scores`);
                    }
                }
            } catch (e) {
                console.warn(`🚫 Error cleaning ${key}:`, e);
            }
        });
    }
    
    // Force update display with clean data
    function forceCleanDisplay() {
        console.log('🚫 Force updating display with clean data...');
        
        if (window.updateLeaderboardDisplay) {
            window.updateLeaderboardDisplay();
            console.log('🚫 Display force updated');
        }
    }
    
    // Initialize everything
    function initialize() {
        console.log('🚫 Initializing fake name elimination...');
        
        cleanExistingData();
        overrideAllScoreFunctions();
        
        // Force clean after a delay to catch any late-loading scores
        setTimeout(() => {
            cleanExistingData();
            forceCleanDisplay();
            console.log('🚫 Final cleanup completed');
        }, 2000);
    }
    
    // Start immediately and after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also run after a delay to catch everything
    setTimeout(initialize, 500);
    
    // Manual cleanup function
    window.eliminateFakeNames = function() {
        console.log('🚫 Manual fake name elimination...');
        cleanExistingData();
        forceCleanDisplay();
    };
    
    console.log('🚫 Fake name eliminator loaded - ZERO tolerance for fallback scores');
    console.log('💡 Type eliminateFakeNames() to manually clean');
    
})();