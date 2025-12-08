// Pure Gist-Only Leaderboard - NO local filler scores
(function() {
    console.log('🎯 Pure Gist-Only Leaderboard Loading...');
    
    const GIST_URL = 'https://gist.githubusercontent.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23/raw/ball-defender-leaderboard.json';
    
    // Override the OnlineLeaderboard to use ONLY gist data
    window.OnlineLeaderboard = {
        async mergeAndSync(newScore = null) {
            console.log('🎯 PURE GIST: mergeAndSync called');
            
            try {
                let currentScores = [];
                
                // ONLY load from gist - no fallbacks, no localStorage mixing
                try {
                    console.log('🌐 Loading ONLY from gist...');
                    const response = await fetch(GIST_URL + '?t=' + Date.now());
                    
                    if (response.ok) {
                        const data = await response.json();
                        currentScores = data.leaderboard || [];
                        console.log('✅ PURE GIST: Loaded', currentScores.length, 'scores from gist');
                        console.log('📊 PURE GIST: Scores:', currentScores);
                    } else {
                        console.error('❌ PURE GIST: Gist not accessible:', response.status);
                        // If gist fails, use empty array - NO fallback scores
                        currentScores = [];
                    }
                } catch (error) {
                    console.error('❌ PURE GIST: Failed to load gist:', error);
                    // If gist fails, use empty array - NO fallback scores
                    currentScores = [];
                }
                
                // Add new score if provided
                if (newScore && newScore.name && typeof newScore.score === 'number') {
                    console.log(`🎯 PURE GIST: Adding new score: ${newScore.name} - ${newScore.score}`);
                    currentScores.push({
                        name: newScore.name.substring(0, 18),
                        score: newScore.score,
                        date: new Date().toISOString()
                    });
                }
                
                // Remove duplicates and sort (keep highest score per player)
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
                
                // Save ONLY to localStorage (no mixing with old data)
                localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(finalScores));
                
                // Update global reference
                if (window.currentLeaderboard) {
                    window.currentLeaderboard = finalScores;
                }
                
                console.log(`🎯 PURE GIST: Final leaderboard: ${finalScores.length} scores`);
                console.log('🏆 PURE GIST: Final scores:', finalScores);
                
                return finalScores;
                
            } catch (error) {
                console.error('❌ PURE GIST: Error in mergeAndSync:', error);
                // Return empty array on error - NO fallbacks
                return [];
            }
        }
    };
    
    // Override the game's loadOnlineLeaderboard to use pure gist
    if (window.loadOnlineLeaderboard) {
        window.loadOnlineLeaderboard = async function() {
            console.log('🎯 PURE GIST: loadOnlineLeaderboard called');
            const scores = await window.OnlineLeaderboard.mergeAndSync();
            return scores;
        };
    }
    
    // Clear any existing localStorage on startup to remove filler scores
    function clearFillerScores() {
        console.log('🧹 PURE GIST: Clearing any local filler scores...');
        localStorage.removeItem('ballDefenderGlobalLeaderboard');
        localStorage.removeItem('ballDefenderPersistentLeaderboard');
        console.log('✅ PURE GIST: Local storage cleared');
    }
    
    // Force sync on page load
    async function forcePureGistSync() {
        console.log('🎯 PURE GIST: Force syncing on page load...');
        
        // Clear any existing local data
        clearFillerScores();
        
        // Load fresh from gist
        const scores = await window.OnlineLeaderboard.mergeAndSync();
        
        // Update display if available
        if (window.updateLeaderboardDisplay) {
            window.updateLeaderboardDisplay();
            console.log('🔄 PURE GIST: Display updated');
        }
        
        console.log('✅ PURE GIST SYNC COMPLETE - Only gist scores should be visible');
        return scores;
    }
    
    // Make functions available globally
    window.forcePureGistSync = forcePureGistSync;
    window.clearAllLocalScores = clearFillerScores;
    
    // Auto-run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(forcePureGistSync, 1500); // Delay to let other scripts load
        });
    } else {
        setTimeout(forcePureGistSync, 1500);
    }
    
    console.log('🎯 Pure Gist-Only System Ready');
    console.log('💡 No fallback scores - only what is in the GitHub Gist');
    console.log('💡 Type forcePureGistSync() to manually sync');
    
})();