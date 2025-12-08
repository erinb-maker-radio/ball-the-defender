// Force GitHub Gist Sync - Overrides localStorage with gist data
(function() {
    console.log('🔄 Force Gist Sync Loading...');
    
    const GIST_URL = 'https://gist.githubusercontent.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23/raw/ball-defender-leaderboard.json';
    
    async function forceLoadFromGist() {
        try {
            console.log('🔄 FORCE: Loading fresh data from GitHub Gist...');
            console.log('🌐 URL:', GIST_URL);
            
            const response = await fetch(GIST_URL + '?t=' + Date.now());
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ FORCE: Loaded from gist:', data.leaderboard?.length, 'scores');
                
                // FORCE overwrite localStorage with gist data
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(data.leaderboard));
                console.log('💾 FORCE: Overwritten localStorage with gist data');
                
                // Update global reference
                if (window.currentLeaderboard) {
                    window.currentLeaderboard = data.leaderboard;
                    console.log('🌐 FORCE: Updated global reference');
                }
                
                // Update display if available
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                    console.log('🔄 FORCE: Updated display');
                }
                
                console.log('✅ FORCE SYNC COMPLETE');
                console.log('📊 Current scores:', data.leaderboard);
                
                return data.leaderboard;
            } else {
                console.error('❌ FORCE: Gist not accessible:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ FORCE: Failed to load from gist:', error);
            return null;
        }
    }
    
    // Override the OnlineLeaderboard to ALWAYS check gist first
    const originalOnlineLeaderboard = window.OnlineLeaderboard;
    
    window.OnlineLeaderboard = {
        async mergeAndSync(newScore = null) {
            console.log('🔄 FORCED GIST: mergeAndSync called');
            
            try {
                // ALWAYS load from gist first
                let currentScores = [];
                
                try {
                    const response = await fetch(GIST_URL + '?t=' + Date.now());
                    if (response.ok) {
                        const data = await response.json();
                        currentScores = data.leaderboard || [];
                        console.log('✅ Loaded', currentScores.length, 'scores from gist');
                    } else {
                        throw new Error('Gist not accessible');
                    }
                } catch (gistError) {
                    console.warn('⚠️ Gist failed, using localStorage fallback');
                    const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                    currentScores = stored ? JSON.parse(stored) : [];
                }
                
                // Add new score if provided
                if (newScore && newScore.name && typeof newScore.score === 'number') {
                    console.log(`🔄 Adding new score: ${newScore.name} - ${newScore.score}`);
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
                
                // Save to localStorage
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(finalScores));
                
                // Update global reference
                if (window.currentLeaderboard) {
                    window.currentLeaderboard = finalScores;
                }
                
                console.log(`🔄 FORCED GIST: Final leaderboard: ${finalScores.length} scores`);
                
                return finalScores;
                
            } catch (error) {
                console.error('❌ FORCED GIST: Error in mergeAndSync:', error);
                return [];
            }
        }
    };
    
    // Make force sync available globally
    window.forceGistSync = forceLoadFromGist;
    
    // Auto-run on page load to ensure consistency
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(forceLoadFromGist, 1000); // Small delay to let other scripts load
        });
    } else {
        setTimeout(forceLoadFromGist, 1000);
    }
    
    console.log('🔄 Force Gist Sync Ready');
    console.log('💡 Type forceGistSync() to manually sync from gist');
    
})();