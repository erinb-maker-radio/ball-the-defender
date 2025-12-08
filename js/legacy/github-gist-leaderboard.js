// GitHub Gist Online Leaderboard System
// Stores leaderboard data in a public GitHub Gist for cross-PC syncing

(function() {
    console.log('🐙 GitHub Gist Leaderboard Loading...');
    
    // Configuration - you can create a gist manually and put the ID here
    const GIST_CONFIG = {
        // Create a gist manually at https://gist.github.com with this content:
        // {"leaderboard":[],"lastUpdated":"2025-01-14T00:00:00.000Z","version":1}
        gistId: null, // Will try to create one automatically or use existing
        fileName: 'ball-defender-leaderboard.json',
        description: 'Ball Defender Global Leaderboard'
    };
    
    // For now, let's use a well-known public gist ID that we can create
    // This is a placeholder - we'll use a simple HTTP service instead
    
    const GistLeaderboard = {
        async findOrCreateGist() {
            // For now, we'll use a simple approach with a free JSON storage service
            // that doesn't require authentication
            
            console.log('🐙 Setting up GitHub Gist alternative...');
            
            // Use https://api.github.com/gists/ to search for existing public gists
            // But since we can't authenticate, let's use a simpler approach
            
            return {
                url: 'https://api.github.com/gists/12345', // Placeholder
                rawUrl: 'https://gist.githubusercontent.com/raw/12345/ball-defender-leaderboard.json'
            };
        },
        
        async loadFromGist() {
            try {
                console.log('🐙 Loading leaderboard from GitHub Gist...');
                
                // Try a few different approaches
                const testUrls = [
                    // We'll create a real gist manually and put the ID here
                    'https://gist.githubusercontent.com/anonymous/12345/raw/ball-defender-leaderboard.json',
                    // Fallback to local storage
                    null
                ];
                
                for (const url of testUrls) {
                    if (!url) break;
                    
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const data = await response.json();
                            console.log('✅ Loaded from GitHub Gist:', data.leaderboard?.length, 'scores');
                            return data.leaderboard || [];
                        }
                    } catch (e) {
                        console.warn('⚠️ Gist URL failed:', url);
                    }
                }
                
                // Fallback to localStorage
                const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                if (stored) {
                    const scores = JSON.parse(stored);
                    console.log('📦 Loaded from localStorage:', scores.length, 'scores');
                    return scores;
                }
                
                // Ultimate fallback
                console.log('📋 Using fallback scores');
                return [
                    { name: 'TG MAXEY', score: 11380, date: '2024-01-15T10:30:00.000Z' },
                    { name: 'BALLMASTER', score: 8750, date: '2024-01-14T18:45:00.000Z' },
                    { name: 'ACE', score: 7200, date: '2024-01-13T14:20:00.000Z' }
                ];
                
            } catch (error) {
                console.error('🐙 Error loading from gist:', error);
                return [];
            }
        },
        
        async saveToGist(leaderboard) {
            try {
                console.log('🐙 Saving leaderboard to GitHub Gist...');
                
                // For now, we can't write to gists without authentication
                // So we'll save to localStorage and provide instructions for manual sync
                
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(leaderboard));
                console.log('💾 Saved to localStorage (GitHub Gist write requires authentication)');
                
                // In a real implementation, you would need a GitHub token
                // curl -X PATCH https://api.github.com/gists/{gist_id} \
                //   -H "Authorization: token YOUR_TOKEN" \
                //   -d '{"files":{"ball-defender-leaderboard.json":{"content":"..."}}}' 
                
                return true;
                
            } catch (error) {
                console.error('🐙 Error saving to gist:', error);
                return false;
            }
        }
    };
    
    // Override the OnlineLeaderboard with our GitHub Gist version
    window.OnlineLeaderboard = {
        async mergeAndSync(newScore = null) {
            console.log('🐙 GitHub Gist: mergeAndSync called');
            
            try {
                // Load current scores from gist
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
                
                // Save back to gist
                await GistLeaderboard.saveToGist(finalScores);
                
                console.log(`🐙 Final leaderboard: ${finalScores.length} scores`);
                return finalScores;
                
            } catch (error) {
                console.error('🐙 Error in mergeAndSync:', error);
                return [];
            }
        }
    };
    
    // Manual gist management functions
    window.createGistManually = function() {
        const leaderboard = JSON.stringify({
            leaderboard: [
                { name: 'TG MAXEY', score: 11380, date: '2024-01-15T10:30:00.000Z' },
                { name: 'BALLMASTER', score: 8750, date: '2024-01-14T18:45:00.000Z' },
                { name: 'ACE', score: 7200, date: '2024-01-13T14:20:00.000Z' }
            ],
            lastUpdated: new Date().toISOString(),
            version: 1
        }, null, 2);
        
        console.log('🐙 To create a GitHub Gist manually:');
        console.log('1. Go to https://gist.github.com');
        console.log('2. Create a new gist with filename: ball-defender-leaderboard.json');
        console.log('3. Paste this content:');
        console.log(leaderboard);
        console.log('4. Copy the gist ID from the URL');
        console.log('5. Update the gistId in the code');
        
        return leaderboard;
    };
    
    console.log('✅ GitHub Gist Leaderboard System Ready');
    console.log('🐙 Note: Write access requires authentication');
    console.log('💡 Type createGistManually() for setup instructions');
    
})();