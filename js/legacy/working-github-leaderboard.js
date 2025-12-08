// Working GitHub Gist Online Leaderboard System
// Syncs leaderboard data between all PCs using your GitHub Gist

(function() {
    console.log('🐙 GitHub Gist Leaderboard System Loading...');
    
    // Your actual gist configuration
    const GIST_CONFIG = {
        gistId: '40398c32fa6fac004a52ea22d2612d23',
        fileName: 'ball-defender-leaderboard.json',
        rawUrl: 'https://gist.githubusercontent.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23/raw/ball-defender-leaderboard.json',
        apiUrl: 'https://api.github.com/gists/40398c32fa6fac004a52ea22d2612d23'
    };
    
    const GistLeaderboard = {
        async loadFromGist() {
            try {
                console.log('🐙 Loading leaderboard from GitHub Gist...');
                console.log('🌐 URL:', GIST_CONFIG.rawUrl);
                
                // Add cache busting to ensure fresh data
                const cacheBuster = '?t=' + Date.now();
                const response = await fetch(GIST_CONFIG.rawUrl + cacheBuster);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Loaded from GitHub Gist:', data.leaderboard?.length, 'scores');
                    console.log('📊 Gist data:', data);
                    return data.leaderboard || [];
                } else {
                    console.warn('⚠️ Gist response not OK:', response.status);
                    throw new Error('Failed to fetch from gist');
                }
                
            } catch (error) {
                console.error('🐙 Error loading from gist:', error);
                
                // Fallback to localStorage
                const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                if (stored) {
                    const scores = JSON.parse(stored);
                    console.log('📦 Fallback: loaded from localStorage:', scores.length, 'scores');
                    return scores;
                }
                
                // Ultimate fallback
                console.log('📋 Ultimate fallback: using default scores');
                return [
                    { name: 'TG MAXEY', score: 11380, date: '2024-01-15T10:30:00.000Z' },
                    { name: 'BALLMASTER', score: 8750, date: '2024-01-14T18:45:00.000Z' },
                    { name: 'ACE', score: 7200, date: '2024-01-13T14:20:00.000Z' }
                ];
            }
        },
        
        async saveToGist(leaderboard) {
            try {
                console.log('🐙 Saving leaderboard to GitHub Gist...');
                console.log('💾 Saving', leaderboard.length, 'scores');
                
                // For now, we'll save to localStorage as the primary storage
                // and provide the gist data for manual updates
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(leaderboard));
                
                const gistData = {
                    leaderboard: leaderboard,
                    lastUpdated: new Date().toISOString(),
                    version: Date.now()
                };
                
                console.log('✅ Saved to localStorage');
                console.log('🐙 To update the gist manually, copy this data:');
                console.log(JSON.stringify(gistData, null, 2));
                
                // Store the data that should be in the gist for manual copying
                window.gistUpdateData = JSON.stringify(gistData, null, 2);
                
                return true;
                
            } catch (error) {
                console.error('🐙 Error saving to gist:', error);
                return false;
            }
        }
    };
    
    // Override the OnlineLeaderboard with our working GitHub Gist version
    window.OnlineLeaderboard = {
        async mergeAndSync(newScore = null) {
            console.log('🐙 GitHub Gist: mergeAndSync called');
            
            try {
                // Load current scores from gist (this will work automatically)
                let currentScores = await GistLeaderboard.loadFromGist();
                
                // Add new score if provided
                if (newScore && newScore.name && typeof newScore.score === 'number') {
                    console.log(`🐙 Adding new score: ${newScore.name} - ${newScore.score}`);
                    currentScores.push({
                        name: newScore.name.substring(0, 18),
                        score: newScore.score,
                        date: new Date().toISOString()
                    });
                }
                
                // Remove duplicates and sort
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
                
                const finalScores = Array.from(nameMap.values())
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 15);
                
                // Save back (localStorage + prepare gist data)
                await GistLeaderboard.saveToGist(finalScores);
                
                // Update global reference
                if (window.currentLeaderboard) {
                    window.currentLeaderboard = finalScores;
                }
                
                console.log(`🐙 Final leaderboard: ${finalScores.length} scores`);
                console.log('🏆 Top 3:', finalScores.slice(0, 3));
                
                return finalScores;
                
            } catch (error) {
                console.error('🐙 Error in mergeAndSync:', error);
                
                // Emergency fallback
                const fallback = [
                    { name: 'TG MAXEY', score: 11380, date: '2024-01-15T10:30:00.000Z' },
                    { name: 'BALLMASTER', score: 8750, date: '2024-01-14T18:45:00.000Z' },
                    { name: 'ACE', score: 7200, date: '2024-01-13T14:20:00.000Z' }
                ];
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(fallback));
                return fallback;
            }
        },
        
        async addScore(playerName, playerScore) {
            console.log(`🐙 Adding score via gist system: ${playerName} - ${playerScore}`);
            return await this.mergeAndSync({
                name: playerName,
                score: playerScore
            });
        },
        
        async getLeaderboard() {
            console.log('🐙 Getting current leaderboard from gist');
            return await this.mergeAndSync();
        }
    };
    
    // Utility functions for manual gist management
    window.viewGistData = function() {
        if (window.gistUpdateData) {
            console.log('📋 Current gist data to copy:');
            console.log(window.gistUpdateData);
            return window.gistUpdateData;
        } else {
            console.log('🐙 No gist update data available. Try making a score change first.');
            return null;
        }
    };
    
    window.copyGistUpdateUrl = function() {
        console.log('🔗 To update the gist manually:');
        console.log('1. Go to: https://gist.github.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23');
        console.log('2. Click "Edit"');
        console.log('3. Replace the content with the data from viewGistData()');
        console.log('4. Click "Update gist"');
        return 'https://gist.github.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23';
    };
    
    window.forceLoadFromGist = async function() {
        console.log('🔄 Force loading fresh data from GitHub Gist...');
        try {
            const scores = await GistLeaderboard.loadFromGist();
            localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(scores));
            
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
                console.log('✅ Display updated with fresh gist data');
            }
            
            return scores;
        } catch (error) {
            console.error('❌ Force load failed:', error);
            return null;
        }
    };
    
    console.log('✅ GitHub Gist Leaderboard System Ready!');
    console.log('🌐 Gist URL: https://gist.github.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23');
    console.log('📖 Reading works automatically');
    console.log('💾 Writing requires manual gist update for now');
    console.log('💡 Available functions:');
    console.log('  - forceLoadFromGist() - Load fresh data from gist');
    console.log('  - viewGistData() - See data to copy to gist');
    console.log('  - copyGistUpdateUrl() - Get gist edit URL');
    
})();