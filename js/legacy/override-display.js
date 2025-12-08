// Override Display Functions to Show Only Gist Data
(function() {
    console.log('🔄 Overriding Display Functions...');
    
    let gistOnlyLeaderboard = [];
    
    // Wait for page to load, then override the display functions
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log('🔄 Overriding getLeaderboard and display functions...');
            
            // Override getLeaderboard to return only gist data
            if (window.getLeaderboard) {
                window.getLeaderboard = function() {
                    console.log(`🎯 OVERRIDE: getLeaderboard called - returning ${gistOnlyLeaderboard.length} gist scores`);
                    return gistOnlyLeaderboard;
                };
                console.log('✅ getLeaderboard overridden');
            }
            
            // Override updateLeaderboardDisplay to force gist data
            if (window.updateLeaderboardDisplay) {
                const originalUpdate = window.updateLeaderboardDisplay;
                
                window.updateLeaderboardDisplay = function() {
                    console.log('🎯 OVERRIDE: updateLeaderboardDisplay called');
                    
                    // Get the latest gist data from localStorage
                    try {
                        const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                        if (stored) {
                            gistOnlyLeaderboard = JSON.parse(stored);
                            console.log(`🎯 OVERRIDE: Using ${gistOnlyLeaderboard.length} scores from localStorage`);
                        } else {
                            gistOnlyLeaderboard = [];
                            console.log('🎯 OVERRIDE: No localStorage data, using empty array');
                        }
                    } catch (e) {
                        gistOnlyLeaderboard = [];
                        console.log('🎯 OVERRIDE: Error reading localStorage, using empty array');
                    }
                    
                    // Call the original function (it will call our overridden getLeaderboard)
                    originalUpdate.call(this);
                    
                    console.log('🎯 OVERRIDE: Display updated with gist-only data');
                };
                console.log('✅ updateLeaderboardDisplay overridden');
            }
            
            // Force an immediate display update
            setTimeout(() => {
                console.log('🔄 OVERRIDE: Force updating display with gist data...');
                
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                    console.log('🔄 OVERRIDE: Display force-updated');
                }
                
            }, 1000);
            
        }, 1000);
    });
    
    // Make the gist data available globally for other functions to use
    window.setGistOnlyLeaderboard = function(scores) {
        gistOnlyLeaderboard = scores || [];
        console.log(`🎯 OVERRIDE: Gist leaderboard set to ${gistOnlyLeaderboard.length} scores`);
    };
    
    window.getGistOnlyLeaderboard = function() {
        return gistOnlyLeaderboard;
    };
    
    console.log('🔄 Display override system ready');
    
})();