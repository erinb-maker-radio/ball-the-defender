/**
 * Clear all local scores and enforce gist-only leaderboards
 */
(function() {
    console.log('🧹 ENFORCING GIST-ONLY LEADERBOARDS...');
    
    // All possible localStorage keys that might contain scores
    const keysToRemove = [
        'ballDefender_original_Leaderboard',
        'ballDefender_ballGoBoom_Leaderboard',
        'ballDefender_iceFrost_Leaderboard',
        'ballDefenderPersistentLeaderboard',
        'ballDefenderLeaderboard',
        'ballDefenderGlobalLeaderboard',
        'ballDefender_migration_backup'
    ];
    
    // Clear all existing localStorage score data
    let removedCount = 0;
    keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed: ${key}`);
            removedCount++;
        }
    });
    
    // Set up periodic cleanup to prevent localStorage accumulation
    setInterval(() => {
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Auto-removed: ${key}`);
            }
        });
    }, 5000); // Check every 5 seconds
    
    console.log(`✅ Cleared ${removedCount} local score entries`);
    console.log('🔒 Gist-only mode enforced - localStorage blocked');
    
    // Clear the leaderboard manager cache to force reload from gist
    if (window.ModeLeaderboardManager) {
        window.ModeLeaderboardManager.clearCache();
        console.log('🔄 Cleared leaderboard manager cache');
    }
    
})();