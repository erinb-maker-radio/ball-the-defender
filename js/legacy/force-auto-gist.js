// Force Auto Gist Updates - Intercepts ALL score saves
(function() {
    console.log('🔥 Force Auto Gist Updates Loading...');
    
    // Override addToLeaderboard to trigger auto gist sync
    function interceptAddToLeaderboard() {
        if (window.addToLeaderboard) {
            const originalAdd = window.addToLeaderboard;
            
            window.addToLeaderboard = function(playerName, playerScore) {
                console.log('🔥 INTERCEPTED: addToLeaderboard called:', playerName, '-', playerScore);
                
                // Call the original function first
                const result = originalAdd.call(this, playerName, playerScore);
                
                // Then trigger the automatic gist sync
                setTimeout(async () => {
                    console.log('🔥 TRIGGERING: Automatic gist sync...');
                    
                    if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
                        try {
                            await window.OnlineLeaderboard.mergeAndSync({
                                name: playerName,
                                score: playerScore
                            });
                            console.log('🔥 SUCCESS: Gist sync triggered for new score!');
                        } catch (error) {
                            console.error('🔥 ERROR: Gist sync failed:', error);
                        }
                    } else {
                        console.warn('🔥 WARNING: OnlineLeaderboard.mergeAndSync not available');
                    }
                }, 500);
                
                return result;
            };
            
            console.log('✅ addToLeaderboard intercepted for auto gist sync');
        } else {
            console.warn('❌ addToLeaderboard function not found');
        }
    }
    
    // Override saveOnlineLeaderboard to trigger gist sync
    function interceptSaveOnlineLeaderboard() {
        if (window.saveOnlineLeaderboard) {
            const originalSave = window.saveOnlineLeaderboard;
            
            window.saveOnlineLeaderboard = async function(leaderboard) {
                console.log('🔥 INTERCEPTED: saveOnlineLeaderboard called with', leaderboard.length, 'scores');
                
                // Call the original function
                const result = await originalSave.call(this, leaderboard);
                
                // Then trigger gist sync
                if (window.OnlineLeaderboard && window.OnlineLeaderboard.saveToGist) {
                    try {
                        console.log('🔥 TRIGGERING: Direct gist save...');
                        await window.OnlineLeaderboard.saveToGist(leaderboard);
                        console.log('🔥 SUCCESS: Direct gist save completed!');
                    } catch (error) {
                        console.error('🔥 ERROR: Direct gist save failed:', error);
                    }
                }
                
                return result;
            };
            
            console.log('✅ saveOnlineLeaderboard intercepted for auto gist sync');
        }
    }
    
    // Test function to manually trigger gist sync with current scores
    window.forceSyncCurrentScores = async function() {
        console.log('🔥 Manual force sync of current scores...');
        
        try {
            const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
            if (stored) {
                const scores = JSON.parse(stored);
                console.log('🔥 Found', scores.length, 'scores to sync');
                
                if (window.OnlineLeaderboard && window.OnlineLeaderboard.saveToGist) {
                    await window.OnlineLeaderboard.saveToGist(scores);
                    console.log('🔥 SUCCESS: Manual sync completed!');
                } else {
                    console.error('🔥 ERROR: saveToGist not available');
                }
            } else {
                console.log('🔥 No scores found in localStorage');
            }
        } catch (error) {
            console.error('🔥 ERROR: Manual sync failed:', error);
        }
    };
    
    // Monitor localStorage changes and sync automatically
    function monitorLocalStorageChanges() {
        const originalSetItem = localStorage.setItem;
        
        localStorage.setItem = function(key, value) {
            const result = originalSetItem.call(this, key, value);
            
            // If leaderboard was updated, sync to gist
            if (key === 'ballDefenderGlobalLeaderboard') {
                console.log('🔥 DETECTED: localStorage leaderboard change');
                
                setTimeout(async () => {
                    try {
                        const scores = JSON.parse(value);
                        console.log('🔥 AUTO-SYNCING:', scores.length, 'scores to gist...');
                        
                        if (window.OnlineLeaderboard && window.OnlineLeaderboard.saveToGist) {
                            await window.OnlineLeaderboard.saveToGist(scores);
                            console.log('🔥 SUCCESS: Auto-sync completed!');
                        }
                    } catch (error) {
                        console.error('🔥 ERROR: Auto-sync failed:', error);
                    }
                }, 1000);
            }
            
            return result;
        };
        
        console.log('✅ localStorage monitoring enabled for auto-sync');
    }
    
    // Initialize everything
    function initialize() {
        console.log('🔥 Initializing force auto gist sync...');
        
        interceptAddToLeaderboard();
        interceptSaveOnlineLeaderboard();
        monitorLocalStorageChanges();
        
        console.log('🔥 All interceptions active - gist will update automatically!');
    }
    
    // Start after a delay to ensure other scripts are loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 1000);
        });
    } else {
        setTimeout(initialize, 1000);
    }
    
    console.log('🔥 Force Auto Gist system ready');
    console.log('💡 Type forceSyncCurrentScores() to manually sync all scores to gist');
    
})();