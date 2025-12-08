// Persistent Leaderboard Display - Always shows latest scores
(function() {
    console.log('📋 Persistent Leaderboard Display Loading...');
    
    let lastKnownScores = [];
    let gameStateWatcher = null;
    
    // Force refresh leaderboard from gist and update display
    async function refreshLeaderboardFromGist() {
        try {
            console.log('📋 REFRESH: Getting latest scores from gist...');
            
            if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
                // Get fresh scores without adding new ones
                const freshScores = await window.OnlineLeaderboard.mergeAndSync();
                lastKnownScores = freshScores;
                
                console.log(`📋 REFRESH: Got ${freshScores.length} fresh scores from gist`);
                
                // Force update the display
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                    console.log('📋 REFRESH: Display updated with latest scores');
                }
                
                return freshScores;
            } else {
                console.warn('📋 REFRESH: OnlineLeaderboard not available');
                return [];
            }
        } catch (error) {
            console.error('📋 REFRESH: Error refreshing from gist:', error);
            return lastKnownScores;
        }
    }
    
    // Watch for game state changes and refresh leaderboard
    function watchGameStateChanges() {
        console.log('📋 Setting up game state watchers...');
        
        // Watch for game over
        if (window.gameOver) {
            const originalGameOver = window.gameOver;
            
            window.gameOver = function() {
                console.log('📋 GAME OVER detected - refreshing leaderboard...');
                
                // Call original game over
                const result = originalGameOver.call(this);
                
                // Refresh leaderboard after a short delay
                setTimeout(async () => {
                    await refreshLeaderboardFromGist();
                    console.log('📋 Leaderboard refreshed after game over');
                }, 1000);
                
                return result;
            };
            
            console.log('✅ Game over watcher installed');
        }
        
        // Watch for new game starts
        if (window.startGame) {
            const originalStartGame = window.startGame;
            
            window.startGame = function() {
                console.log('📋 NEW GAME detected - refreshing leaderboard...');
                
                // Refresh before starting
                setTimeout(async () => {
                    await refreshLeaderboardFromGist();
                    console.log('📋 Leaderboard refreshed before new game');
                }, 500);
                
                return originalStartGame.call(this);
            };
            
            console.log('✅ Start game watcher installed');
        }
        
        // Watch for any score additions
        if (window.addToLeaderboard) {
            const originalAdd = window.addToLeaderboard;
            
            window.addToLeaderboard = function(name, score) {
                console.log('📋 SCORE ADDED detected - will refresh leaderboard...');
                
                const result = originalAdd.call(this, name, score);
                
                // Refresh after score is added
                setTimeout(async () => {
                    await refreshLeaderboardFromGist();
                    console.log('📋 Leaderboard refreshed after score addition');
                }, 2000);
                
                return result;
            };
            
            console.log('✅ Score addition watcher installed');
        }
    }
    
    // Monitor game state changes using a different approach
    function monitorGameStateProperty() {
        if (window.gameState !== undefined) {
            let lastGameState = window.gameState;
            
            const stateMonitor = setInterval(() => {
                if (window.gameState !== lastGameState) {
                    console.log(`📋 GAME STATE CHANGE: ${lastGameState} → ${window.gameState}`);
                    
                    // Refresh on state changes
                    setTimeout(async () => {
                        await refreshLeaderboardFromGist();
                        console.log('📋 Leaderboard refreshed on state change');
                    }, 500);
                    
                    lastGameState = window.gameState;
                }
            }, 1000);
            
            console.log('✅ Game state monitor started');
            return stateMonitor;
        }
    }
    
    // Force display update on any leaderboard container visibility change
    function watchLeaderboardVisibility() {
        const leaderboardElement = document.getElementById('leaderboard');
        if (leaderboardElement) {
            const observer = new MutationObserver(() => {
                console.log('📋 Leaderboard DOM changed - ensuring latest data...');
                setTimeout(() => {
                    if (window.updateLeaderboardDisplay) {
                        window.updateLeaderboardDisplay();
                    }
                }, 100);
            });
            
            observer.observe(leaderboardElement, {
                childList: true,
                subtree: true
            });
            
            console.log('✅ Leaderboard visibility observer installed');
        }
    }
    
    // Periodic refresh every 30 seconds for extra safety
    function startPeriodicRefresh() {
        const refreshInterval = setInterval(async () => {
            console.log('📋 PERIODIC: Refreshing leaderboard every 30 seconds...');
            await refreshLeaderboardFromGist();
        }, 30000);
        
        console.log('✅ 30-second periodic refresh started');
        return refreshInterval;
    }
    
    // Manual refresh functions
    window.refreshLeaderboard = refreshLeaderboardFromGist;
    
    window.forceLeaderboardRefresh = async function() {
        console.log('📋 MANUAL: Force refreshing leaderboard...');
        await refreshLeaderboardFromGist();
        
        // Also trigger display update
        if (window.updateLeaderboardDisplay) {
            window.updateLeaderboardDisplay();
        }
        
        console.log('📋 MANUAL: Force refresh completed');
    };
    
    // Initialize everything
    function initialize() {
        console.log('📋 Initializing persistent leaderboard display...');
        
        // Set up all watchers
        watchGameStateChanges();
        gameStateWatcher = monitorGameStateProperty();
        watchLeaderboardVisibility();
        startPeriodicRefresh();
        
        // Do an initial refresh
        setTimeout(async () => {
            await refreshLeaderboardFromGist();
            console.log('📋 Initial leaderboard refresh completed');
        }, 2000);
        
        console.log('📋 Persistent leaderboard system initialized');
    }
    
    // Start after everything is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 3000);
        });
    } else {
        setTimeout(initialize, 3000);
    }
    
    console.log('📋 Persistent Leaderboard Display ready');
    console.log('💡 Functions available:');
    console.log('  - refreshLeaderboard() - Get fresh scores from gist');
    console.log('  - forceLeaderboardRefresh() - Manual refresh and display update');
    
})();