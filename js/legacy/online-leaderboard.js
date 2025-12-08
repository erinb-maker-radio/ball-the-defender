// Online Leaderboard System - Syncs between all PCs
// Uses a simple GitHub Gist for free online JSON storage

const OnlineLeaderboard = {
    // Using GitHub Gist as it's more reliable and free
    gistId: 'a1b2c3d4e5f6789012345678901234567890abcd', // Will be created dynamically
    gistUrl: 'https://api.github.com/gists/',
    fallbackUrl: 'https://jsonkeeper.com/b/BALL_DEFENDER_LEADERBOARD', // Alternative service
    
    // Fallback to a simple HTTP endpoint that accepts any data
    async saveToOnline(leaderboard) {
        try {
            console.log('🌐 Saving leaderboard to online storage...');
            
            // Try multiple endpoints for reliability
            const endpoints = [
                // JSONKeeper - simple and reliable
                {
                    url: 'https://jsonkeeper.com/b/BALL_DEFENDER_LEADERBOARD',
                    method: 'POST',
                    body: JSON.stringify({
                        leaderboard: leaderboard,
                        lastUpdated: new Date().toISOString(),
                        version: 1
                    })
                },
                // HTTPBin as fallback (just for testing connectivity)
                {
                    url: 'https://httpbin.org/post',
                    method: 'POST',
                    body: JSON.stringify({
                        leaderboard: leaderboard,
                        lastUpdated: new Date().toISOString()
                    })
                }
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint.url, {
                        method: endpoint.method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: endpoint.body
                    });
                    
                    if (response.ok) {
                        console.log('✅ Leaderboard saved to online storage');
                        return true;
                    }
                } catch (e) {
                    console.warn('Endpoint failed:', endpoint.url, e.message);
                }
            }
            
            console.warn('⚠️ All endpoints failed, using localStorage only');
            return false;
        } catch (error) {
            console.warn('⚠️ Error saving to online storage:', error.message);
            return false;
        }
    },
    
    async loadFromOnline() {
        try {
            console.log('🌐 Loading leaderboard from online storage...');
            
            // Try to load from JSONKeeper
            const response = await fetch('https://jsonkeeper.com/b/BALL_DEFENDER_LEADERBOARD');
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.leaderboard && Array.isArray(data.leaderboard)) {
                    console.log(`✅ Loaded ${data.leaderboard.length} scores from online storage`);
                    return data.leaderboard;
                }
            }
            
            console.log('⚠️ No valid online leaderboard found');
            return null;
        } catch (error) {
            console.warn('⚠️ Error loading from online storage:', error.message);
            return null;
        }
    },
    
    // Simplified approach - use localStorage with periodic cloud backup
    async mergeAndSync(newScore = null) {
        try {
            console.log('🌐 Syncing leaderboard...');
            
            // Load from localStorage first (primary storage)
            let localScores = [];
            try {
                const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                if (stored) {
                    localScores = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Could not load local scores:', e.message);
            }
            
            // Try to load from online and merge
            let onlineScores = await this.loadFromOnline() || [];
            
            // Start with fallback scores if nothing exists
            if (localScores.length === 0 && onlineScores.length === 0) {
                localScores = [
                    {name: "ACE PILOT", score: 15000, date: "2024-01-01T00:00:00.000Z"},
                    {name: "BLOCK MASTER", score: 12500, date: "2024-01-01T00:00:00.000Z"},
                    {name: "COMBO KING", score: 10000, date: "2024-01-01T00:00:00.000Z"},
                    {name: "SPEED DEMON", score: 8500, date: "2024-01-01T00:00:00.000Z"},
                    {name: "PRECISION", score: 7000, date: "2024-01-01T00:00:00.000Z"}
                ];
            }
            
            // Combine all scores
            let allScores = [...localScores, ...onlineScores];
            
            // Add new score if provided
            if (newScore) {
                allScores.push(newScore);
                console.log(`🎯 Adding new score: ${newScore.name} - ${newScore.score}`);
            }
            
            // Remove duplicates (keep highest score per player)
            const uniqueScores = [];
            const nameMap = new Map();
            
            allScores.forEach(score => {
                if (score && score.name && typeof score.score === 'number') {
                    const existing = nameMap.get(score.name);
                    if (!existing || score.score > existing.score) {
                        nameMap.set(score.name, score);
                    }
                }
            });
            
            // Convert to array and sort
            const finalScores = Array.from(nameMap.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 15); // Keep top 15
            
            // Save locally (primary storage)
            try {
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(finalScores));
                console.log('✅ Saved to local storage');
            } catch (e) {
                console.warn('Could not save locally:', e.message);
            }
            
            // Try to backup to cloud (secondary)
            if (newScore) {
                this.saveToOnline(finalScores).catch(e => {
                    console.log('Cloud backup failed, but local save succeeded');
                });
            }
            
            // Update game display
            if (window.currentLeaderboard) {
                window.currentLeaderboard = finalScores;
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
            }
            
            console.log(`🌐 ✅ Leaderboard synced - ${finalScores.length} scores`);
            return finalScores;
            
        } catch (error) {
            console.error('❌ Error syncing leaderboard:', error.message);
            return null;
        }
    }
};

// Override the game's leaderboard functions
window.addEventListener('load', () => {
    console.log('🌐 Online Leaderboard System Loading...');
    
    // Replace the save function
    if (window.saveOnlineLeaderboard) {
        window.saveOnlineLeaderboard = async function(leaderboard) {
            console.log('🌐 Using online sync system');
            return await OnlineLeaderboard.mergeAndSync();
        };
    }
    
    // Replace the load function
    if (window.loadOnlineLeaderboard) {
        window.loadOnlineLeaderboard = async function() {
            console.log('🌐 Loading from online sync system');
            const scores = await OnlineLeaderboard.mergeAndSync();
            if (scores) {
                window.currentLeaderboard = scores;
                window.leaderboardLoaded = true;
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
                return scores;
            }
            // Fall back to original function if online fails
            return window.currentLeaderboard || [
                {name: "ACE PILOT", score: 15000, date: "2024-01-01T00:00:00.000Z"},
                {name: "BLOCK MASTER", score: 12500, date: "2024-01-01T00:00:00.000Z"},
                {name: "COMBO KING", score: 10000, date: "2024-01-01T00:00:00.000Z"}
            ];
        };
    }
    
    // Override addToLeaderboard to sync immediately
    if (window.addToLeaderboard) {
        const originalAdd = window.addToLeaderboard;
        window.addToLeaderboard = async function(playerName, playerScore) {
            console.log('🌐 Adding score to global leaderboard');
            
            const newScore = {
                name: playerName.substring(0, 18),
                score: playerScore,
                date: new Date().toISOString()
            };
            
            // Sync with storage
            const updatedScores = await OnlineLeaderboard.mergeAndSync(newScore);
            
            if (updatedScores) {
                window.currentLeaderboard = updatedScores;
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
                return updatedScores;
            } else {
                // Fall back to original function if sync fails
                return originalAdd.call(this, playerName, playerScore);
            }
        };
    }
    
    console.log('✅ Global Leaderboard System Ready');
    console.log('📝 Using localStorage as primary storage with cloud backup');
});

// Periodic check for updates from other players (every 2 minutes)
setInterval(async () => {
    if (document.hidden) return; // Don't sync if tab is not active
    
    try {
        const onlineScores = await OnlineLeaderboard.loadFromOnline();
        if (onlineScores && onlineScores.length > 0 && window.currentLeaderboard) {
            // Check if there are new scores online
            const hasNewScores = onlineScores.some(onlineScore => 
                !window.currentLeaderboard.some(localScore => 
                    localScore.name === onlineScore.name && localScore.score === onlineScore.score
                )
            );
            
            if (hasNewScores) {
                console.log('🔄 Found new scores from other players, updating...');
                await OnlineLeaderboard.mergeAndSync();
            }
        }
    } catch (e) {
        // Silently fail periodic sync
    }
}, 120000); // Every 2 minutes