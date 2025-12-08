/**
 * LEADERBOARD MIGRATION SYSTEM
 * This script migrates data from the old leaderboard system to the new standardized system.
 */

(function() {
    console.log('🔄 Starting Leaderboard Migration...');
    
    const MIGRATION_CONFIG = {
        legacyKeys: [
            'ballDefenderPersistentLeaderboard',
            'ballDefenderLeaderboard', 
            'ballDefenderGlobalLeaderboard',
            'ballDefender_original_Leaderboard',
            'ballDefender_ballGoBoom_Leaderboard',
            'ballDefender_iceFrost_Leaderboard'
        ],
        
        modeKeyMappings: {
            'ballDefenderPersistentLeaderboard': 'original',
            'ballDefenderLeaderboard': 'original',
            'ballDefenderGlobalLeaderboard': 'original',
            'ballDefender_original_Leaderboard': 'original',
            'ballDefender_ballGoBoom_Leaderboard': 'ballGoBoom',
            'ballDefender_iceFrost_Leaderboard': 'iceFrost'
        }
    };
    
    async function migrateLeaderboards() {
        if (!window.ModeLeaderboardManager) {
            console.error('❌ ModeLeaderboardManager not available');
            return;
        }
        
        const manager = window.ModeLeaderboardManager;
        const modeScores = { 'original': [], 'ballGoBoom': [], 'iceFrost': [] };
        
        // Collect legacy data
        for (const [legacyKey, modeId] of Object.entries(MIGRATION_CONFIG.modeKeyMappings)) {
            const data = localStorage.getItem(legacyKey);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        for (const score of parsed) {
                            if (score && score.name && typeof score.score === 'number') {
                                const timestamp = Date.now();
                                const randomId = Math.random().toString(36);
                                modeScores[modeId].push({
                                    name: score.name,
                                    score: score.score,
                                    date: score.date || new Date().toISOString(),
                                    id: 'legacy_' + timestamp + '_' + randomId,
                                    mode: modeId
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to parse ' + legacyKey + ':', error);
                }
            }
        }
        
        // Save migrated data
        for (const [modeId, scores] of Object.entries(modeScores)) {
            if (scores.length > 0) {
                scores.sort((a, b) => b.score - a.score);
                const topScores = scores.slice(0, 15);
                await manager.saveLeaderboard(modeId, topScores);
                console.log('✅ Migrated ' + topScores.length + ' scores to ' + modeId);
            }
        }
    }
    
    function checkAutoMigration() {
        if (!window.ModeLeaderboardManager) {
            setTimeout(checkAutoMigration, 100);
            return;
        }
        
        const hasLegacyData = MIGRATION_CONFIG.legacyKeys.some(key => 
            localStorage.getItem(key)
        );
        
        if (hasLegacyData) {
            console.log('🔄 Legacy data detected, but auto-migration disabled for gist-only mode');
            console.log('💡 Use window.LeaderboardMigration.migrate() to manually migrate if needed');
        }
    }
    
    window.LeaderboardMigration = { migrate: migrateLeaderboards };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAutoMigration);
    } else {
        checkAutoMigration();
    }
    
    console.log('✅ Leaderboard Migration system loaded');
})();
