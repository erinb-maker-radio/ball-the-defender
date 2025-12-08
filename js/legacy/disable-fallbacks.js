// Disable All Fallback Scores - Forces Pure Gist Data Only
(function() {
    console.log('🚫 Disabling Fallback Scores...');
    
    // Override the fallback leaderboard with empty array
    window.addEventListener('DOMContentLoaded', function() {
        // Wait a moment for game.js to load, then override
        setTimeout(() => {
            console.log('🚫 Overriding FALLBACK_LEADERBOARD...');
            
            // Override the fallback constant
            if (window.FALLBACK_LEADERBOARD) {
                window.FALLBACK_LEADERBOARD.length = 0; // Empty the array
                console.log('✅ FALLBACK_LEADERBOARD cleared');
            }
            
            // Override the loadOnlineLeaderboard function to NOT merge with fallbacks
            if (window.loadOnlineLeaderboard) {
                const originalLoad = window.loadOnlineLeaderboard;
                
                window.loadOnlineLeaderboard = async function() {
                    console.log('🚫 OVERRIDE: loadOnlineLeaderboard called - NO FALLBACKS');
                    
                    try {
                        // Load ONLY from localStorage (which should contain gist data)
                        const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                        if (stored) {
                            const savedScores = JSON.parse(stored);
                            window.currentLeaderboard = savedScores; // NO MERGING
                            console.log(`🚫 OVERRIDE: Loaded ${savedScores.length} scores - NO FALLBACKS ADDED`);
                            return savedScores;
                        } else {
                            console.log('🚫 OVERRIDE: No localStorage data - returning empty array (NO FALLBACKS)');
                            window.currentLeaderboard = [];
                            return [];
                        }
                    } catch (error) {
                        console.error('🚫 OVERRIDE: Error loading leaderboard:', error);
                        window.currentLeaderboard = [];
                        return [];
                    }
                };
                
                console.log('✅ loadOnlineLeaderboard overridden - no fallback mixing');
            }
            
            // Override currentLeaderboard initialization
            if (window.currentLeaderboard) {
                window.currentLeaderboard = [];
                console.log('✅ currentLeaderboard reset to empty array');
            }
            
            // Force reload the leaderboard with no fallbacks
            setTimeout(async () => {
                console.log('🔄 Force reloading leaderboard with no fallbacks...');
                
                if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
                    const scores = await window.OnlineLeaderboard.mergeAndSync();
                    console.log('🔄 Reloaded with', scores.length, 'scores from gist only');
                    
                    if (window.updateLeaderboardDisplay) {
                        window.updateLeaderboardDisplay();
                        console.log('🔄 Display updated');
                    }
                }
            }, 2000);
            
        }, 500);
    });
    
    console.log('🚫 Fallback disabler ready - will remove all non-gist scores');
    
})();