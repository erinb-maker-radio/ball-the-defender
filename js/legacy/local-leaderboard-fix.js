// Local Leaderboard Fix
// Replaces unreliable online services with robust localStorage-only system

(function() {
    console.log('📊 Local Leaderboard Fix Loading...');
    
    // Override the online leaderboard with a reliable local-only version
    window.OnlineLeaderboard = {
        async mergeAndSync(newScore = null) {
            console.log('📊 Local Leaderboard: mergeAndSync called');
            
            try {
                // Get current scores from localStorage
                let currentScores = [];
                const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                
                if (stored) {
                    try {
                        currentScores = JSON.parse(stored);
                        console.log(`📊 Loaded ${currentScores.length} scores from localStorage`);
                    } catch (e) {
                        console.warn('📊 Error parsing stored scores, starting fresh');
                        currentScores = [];
                    }
                } else {
                    console.log('📊 No stored scores found, using fallback');
                    // Use fallback scores if no local data exists
                    currentScores = [
                        { name: 'TG MAXEY', score: 11380, date: '2024-01-15T10:30:00.000Z' },
                        { name: 'BALLMASTER', score: 8750, date: '2024-01-14T18:45:00.000Z' },
                        { name: 'ACE', score: 7200, date: '2024-01-13T14:20:00.000Z' },
                        { name: 'DEFENDER PRO', score: 6500, date: '2024-01-12T09:15:00.000Z' },
                        { name: 'BLOCK BUSTER', score: 5800, date: '2024-01-11T16:30:00.000Z' },
                        { name: 'FIREBALL', score: 5200, date: '2024-01-10T11:45:00.000Z' },
                        { name: 'SNIPER', score: 4600, date: '2024-01-09T20:00:00.000Z' },
                        { name: 'ROOKIE', score: 4000, date: '2024-01-08T13:25:00.000Z' },
                        { name: 'CHALLENGER', score: 3500, date: '2024-01-07T17:50:00.000Z' },
                        { name: 'PLAYER ONE', score: 3000, date: '2024-01-06T08:30:00.000Z' }
                    ];
                }
                
                // Add new score if provided
                if (newScore && newScore.name && typeof newScore.score === 'number') {
                    console.log(`📊 Adding new score: ${newScore.name} - ${newScore.score}`);
                    currentScores.push({
                        name: newScore.name.substring(0, 18),
                        score: newScore.score,
                        date: new Date().toISOString()
                    });
                }
                
                // Remove duplicates (keep highest score per player)
                const uniqueScores = [];
                const nameMap = new Map();
                
                currentScores.forEach(score => {
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
                
                // Save back to localStorage
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(finalScores));
                
                console.log(`📊 Final leaderboard has ${finalScores.length} scores`);
                console.log('📊 Top 3:', finalScores.slice(0, 3));
                
                // Update global reference
                if (window.currentLeaderboard) {
                    window.currentLeaderboard = finalScores;
                }
                
                return finalScores;
                
            } catch (error) {
                console.error('📊 Error in mergeAndSync:', error);
                // Return fallback scores on error
                return [
                    { name: 'TG MAXEY', score: 11380, date: '2024-01-15T10:30:00.000Z' },
                    { name: 'BALLMASTER', score: 8750, date: '2024-01-14T18:45:00.000Z' },
                    { name: 'ACE', score: 7200, date: '2024-01-13T14:20:00.000Z' }
                ];
            }
        },
        
        async addScore(playerName, playerScore) {
            console.log(`📊 Adding score: ${playerName} - ${playerScore}`);
            return await this.mergeAndSync({
                name: playerName,
                score: playerScore
            });
        },
        
        async getLeaderboard() {
            console.log('📊 Getting current leaderboard');
            return await this.mergeAndSync();
        }
    };
    
    // Override any functions that try to use external services
    if (window.saveOnlineLeaderboard) {
        window.saveOnlineLeaderboard = async function(leaderboard) {
            console.log('📊 Saving leaderboard locally (external service disabled)');
            localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(leaderboard));
            return leaderboard;
        };
    }
    
    if (window.loadOnlineLeaderboard) {
        const originalLoad = window.loadOnlineLeaderboard;
        window.loadOnlineLeaderboard = async function() {
            console.log('📊 Loading leaderboard locally (external service disabled)');
            
            try {
                const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                if (stored) {
                    const scores = JSON.parse(stored);
                    window.currentLeaderboard = scores;
                    console.log(`📊 Loaded ${scores.length} scores from local storage`);
                    return scores;
                }
            } catch (e) {
                console.warn('📊 Error loading from localStorage');
            }
            
            // Fallback to original function
            return originalLoad ? originalLoad.call(this) : [];
        };
    }
    
    // Add manual leaderboard management functions
    window.clearLeaderboard = function() {
        console.log('📊 Clearing leaderboard');
        localStorage.removeItem('ballDefenderGlobalLeaderboard');
        console.log('✅ Leaderboard cleared');
    };
    
    window.exportLeaderboard = function() {
        const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
        if (stored) {
            console.log('📊 Current leaderboard data:');
            console.log(stored);
            return JSON.parse(stored);
        } else {
            console.log('📊 No leaderboard data found');
            return [];
        }
    };
    
    window.importLeaderboard = function(data) {
        if (Array.isArray(data)) {
            localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(data));
            console.log(`📊 Imported ${data.length} scores`);
            return true;
        } else {
            console.error('📊 Invalid data format for import');
            return false;
        }
    };
    
    console.log('✅ Local Leaderboard Fix Applied');
    console.log('📊 External services disabled - using localStorage only');
    console.log('💡 Available functions:');
    console.log('  - clearLeaderboard() - Clear all scores');
    console.log('  - exportLeaderboard() - View current scores');
    console.log('  - importLeaderboard(data) - Import scores from another PC');
    
})();