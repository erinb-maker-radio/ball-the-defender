// Automatic GitHub Gist Leaderboard System
// TRUE automatic cross-PC syncing with GitHub token

(function() {
    console.log('🤖 Automatic GitHub Gist Sync Loading...');
    
    // Configuration
    const GIST_CONFIG = {
        gistId: '40398c32fa6fac004a52ea22d2612d23',
        token: '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',
        fileName: 'ball-defender-leaderboard.json',
        rawUrl: 'https://gist.githubusercontent.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23/raw/ball-defender-leaderboard.json',
        apiUrl: 'https://api.github.com/gists/40398c32fa6fac004a52ea22d2612d23'
    };
    
    const AutoGistSync = {
        async loadFromGist() {
            try {
                console.log('🤖 AUTO: Loading from GitHub Gist...');
                
                // Add cache busting to ensure fresh data
                const response = await fetch(GIST_CONFIG.rawUrl + '?t=' + Date.now());
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ AUTO: Loaded', data.leaderboard?.length, 'scores from gist');
                    return data.leaderboard || [];
                } else {
                    console.warn('⚠️ AUTO: Gist response not OK:', response.status);
                    throw new Error('Failed to fetch from gist');
                }
                
            } catch (error) {
                console.error('❌ AUTO: Error loading from gist:', error);
                
                // Fallback to localStorage
                const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                if (stored) {
                    const scores = JSON.parse(stored);
                    console.log('📦 AUTO: Fallback to localStorage:', scores.length, 'scores');
                    return scores;
                }
                
                return [];
            }
        },
        
        async saveToGist(leaderboard) {
            try {
                console.log('🤖 AUTO: Saving to GitHub Gist...');
                console.log('💾 AUTO: Saving', leaderboard.length, 'scores');
                
                const gistData = {
                    leaderboard: leaderboard,
                    lastUpdated: new Date().toISOString(),
                    version: Date.now()
                };
                
                const updatePayload = {
                    files: {
                        [GIST_CONFIG.fileName]: {
                            content: JSON.stringify(gistData, null, 2)
                        }
                    }
                };
                
                console.log('🌐 AUTO: Updating gist...');
                const response = await fetch(GIST_CONFIG.apiUrl, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${GIST_CONFIG.token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    body: JSON.stringify(updatePayload)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ AUTO: Gist updated successfully!');
                    console.log('🌐 AUTO: Updated at:', result.updated_at);
                    
                    // Also save to localStorage as backup
                    localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(leaderboard));
                    
                    return true;
                } else {
                    const error = await response.text();
                    console.error('❌ AUTO: Failed to update gist:', response.status, error);
                    
                    // Save to localStorage as fallback
                    localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(leaderboard));
                    return false;
                }
                
            } catch (error) {
                console.error('❌ AUTO: Error saving to gist:', error);
                
                // Save to localStorage as fallback
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(leaderboard));
                return false;
            }
        }
    };
    
    // Override the OnlineLeaderboard with FULL automatic sync
    window.OnlineLeaderboard = {
        async mergeAndSync(newScore = null) {
            console.log('🤖 AUTO: mergeAndSync called');
            
            try {
                // ALWAYS load fresh from gist first
                let currentScores = await AutoGistSync.loadFromGist();
                
                // Add new score if provided
                if (newScore && newScore.name && typeof newScore.score === 'number') {
                    console.log(`🤖 AUTO: Adding new score: ${newScore.name} - ${newScore.score}`);
                    currentScores.push({
                        name: newScore.name.substring(0, 18),
                        score: newScore.score,
                        date: new Date().toISOString(),
                        id: Date.now() + Math.random() // Unique ID for each score
                    });
                    
                    console.log('🚀 AUTO: NEW SCORE - Will update gist automatically!');
                }
                
                // FIXED: Allow multiple scores per name - just sort and take top 15
                const validScores = currentScores.filter(score => 
                    score && score.name && typeof score.score === 'number'
                );
                
                const finalScores = validScores
                    .sort((a, b) => b.score - a.score) // Sort by highest score first
                    .slice(0, 15) // Take top 15 scores regardless of name
                    .map((score, index) => ({
                        ...score,
                        rank: index + 1,
                        id: score.id || (Date.now() + Math.random()) // Ensure unique ID
                    }));
                
                console.log(`🤖 AUTO: Final leaderboard allows duplicate names: ${finalScores.length} scores`);
                
                // Show name breakdown
                const nameCount = {};
                finalScores.forEach(score => {
                    nameCount[score.name] = (nameCount[score.name] || 0) + 1;
                });
                console.log('🤖 AUTO: Name breakdown:', nameCount);
                
                // If we added a new score, AUTOMATICALLY save to gist
                if (newScore) {
                    console.log('🤖 AUTO: Updating gist with new score...');
                    const success = await AutoGistSync.saveToGist(finalScores);
                    
                    if (success) {
                        console.log('🎉 AUTO: GLOBAL LEADERBOARD UPDATED! All PCs will see this score!');
                    } else {
                        console.log('⚠️ AUTO: Gist update failed, but score saved locally');
                    }
                } else {
                    // No new score, just save to localStorage
                    localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(finalScores));
                }
                
                // Update global reference
                if (window.currentLeaderboard) {
                    window.currentLeaderboard = finalScores;
                }
                
                console.log(`🤖 AUTO: Final leaderboard: ${finalScores.length} scores`);
                
                return finalScores;
                
            } catch (error) {
                console.error('❌ AUTO: Error in mergeAndSync:', error);
                return [];
            }
        },
        
        async addScore(playerName, playerScore) {
            console.log(`🤖 AUTO: Adding score: ${playerName} - ${playerScore}`);
            return await this.mergeAndSync({
                name: playerName,
                score: playerScore
            });
        },
        
        async getLeaderboard() {
            console.log('🤖 AUTO: Getting current leaderboard');
            return await this.mergeAndSync();
        }
    };
    
    // Test function for duplicate names
    window.testDuplicateNames = async function() {
        console.log('🧪 Testing duplicate name handling...');
        
        try {
            // Add multiple scores with same name
            await window.OnlineLeaderboard.addScore('TEST_PLAYER', 1000);
            console.log('✅ Added TEST_PLAYER - 1000');
            
            setTimeout(async () => {
                await window.OnlineLeaderboard.addScore('TEST_PLAYER', 2000);
                console.log('✅ Added TEST_PLAYER - 2000');
                
                setTimeout(async () => {
                    await window.OnlineLeaderboard.addScore('TEST_PLAYER', 1500);
                    console.log('✅ Added TEST_PLAYER - 1500');
                    console.log('🔍 Check leaderboard - should show multiple TEST_PLAYER entries');
                }, 1000);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error testing duplicate names:', error);
        }
    };
    
    // Test function to verify token works
    window.testGistWrite = async function() {
        console.log('🧪 Testing automatic gist write...');
        
        try {
            const testScores = [
                {name: "TEST_AUTO", score: 99999, date: new Date().toISOString()},
                {name: "TG MAXEY", score: 11380, date: "2024-01-15T10:30:00.000Z"},
                {name: "CYLIS", score: 9680, date: "2024-01-14T18:45:00.000Z"}
            ];
            
            const success = await AutoGistSync.saveToGist(testScores);
            
            if (success) {
                console.log('✅ TEST: Automatic gist write works!');
                console.log('🔄 TEST: Check the gist - TEST_AUTO score should appear');
            } else {
                console.log('❌ TEST: Automatic gist write failed');
            }
            
        } catch (error) {
            console.error('❌ TEST: Error testing gist write:', error);
        }
    };
    
    // Auto-sync on page load
    async function autoSyncOnLoad() {
        console.log('🤖 AUTO: Starting automatic sync on page load...');
        
        try {
            const scores = await window.OnlineLeaderboard.mergeAndSync();
            
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
                console.log('🔄 AUTO: Display updated with fresh gist data');
            }
            
            console.log('✅ AUTO: Automatic sync complete on startup');
            
        } catch (error) {
            console.error('❌ AUTO: Error in startup sync:', error);
        }
    }
    
    // Initialize automatic system
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(autoSyncOnLoad, 1500);
        });
    } else {
        setTimeout(autoSyncOnLoad, 1500);
    }
    
    console.log('✅ Automatic GitHub Gist Sync Ready!');
    console.log('🤖 TRUE automatic global leaderboard - no manual steps needed!');
    console.log('🎯 New high scores automatically sync to all PCs!');
    console.log('🔄 FIXED: Multiple scores per player name now allowed!');
    console.log('💡 Type testGistWrite() to test automatic updates');
    console.log('💡 Type testDuplicateNames() to test multiple scores per name');
    
})();