/**
 * Debug script to test gist loading
 */
(function() {
    console.log('🔍 Debugging Gist Loading...');
    
    const GIST_CONFIG = {
        gistId: '40398c32fa6fac004a52ea22d2612d23',
        token: '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'
    };
    
    window.debugGistLoading = async function() {
        console.log('🌐 Testing direct gist access...');
        
        try {
            const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, {
                headers: {
                    'Authorization': `token ${GIST_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ GitHub API error:', response.status, errorText);
                return;
            }
            
            const gistData = await response.json();
            console.log('✅ Gist data loaded successfully');
            console.log('📁 Available files:', Object.keys(gistData.files));
            
            // Check specific mode files
            const modeFiles = [
                'ball-defender-original-leaderboard.json',
                'ball-defender-ballGoBoom-leaderboard.json',
                'ball-defender-iceFrost-leaderboard.json'
            ];
            
            modeFiles.forEach(fileName => {
                if (gistData.files[fileName]) {
                    console.log(`✅ Found ${fileName}`);
                    try {
                        const content = JSON.parse(gistData.files[fileName].content);
                        console.log(`  Content type:`, typeof content);
                        console.log(`  Is array:`, Array.isArray(content));
                        if (content.leaderboard) {
                            console.log(`  Has leaderboard property with ${content.leaderboard.length} scores`);
                        } else if (Array.isArray(content)) {
                            console.log(`  Direct array with ${content.length} scores`);
                        } else {
                            console.log(`  Content structure:`, Object.keys(content));
                        }
                    } catch (e) {
                        console.error(`  Failed to parse JSON:`, e.message);
                    }
                } else {
                    console.log(`❌ Missing ${fileName}`);
                }
            });
            
        } catch (error) {
            console.error('❌ Network error:', error);
        }
    };
    
    window.debugLeaderboardManager = function() {
        if (!window.ModeLeaderboardManager) {
            console.error('❌ ModeLeaderboardManager not available');
            return;
        }
        
        const manager = window.ModeLeaderboardManager;
        console.log('🔍 Testing ModeLeaderboardManager...');
        console.log('Config:', { ...manager.config, token: '[REDACTED]' });
        
        // Test each mode
        ['original', 'ballGoBoom', 'iceFrost'].forEach(async (mode) => {
            console.log(`\n🧪 Testing ${mode} mode:`);
            console.log(`  Storage key: ${manager.getStorageKey(mode)}`);
            console.log(`  Gist filename: ${manager.getGistFileName(mode)}`);
            
            try {
                const scores = await manager.getLeaderboard(mode);
                console.log(`  ✅ Loaded ${scores.length} scores`);
                if (scores.length > 0) {
                    console.log(`  Top score: ${scores[0].name} - ${scores[0].score}`);
                }
            } catch (error) {
                console.error(`  ❌ Failed to load: ${error.message}`);
            }
        });
    };
    
    window.debugClearAllLocalData = function() {
        console.log('🧹 Clearing all local leaderboard data...');
        
        const keysToRemove = [
            'ballDefender_original_Leaderboard',
            'ballDefender_ballGoBoom_Leaderboard',
            'ballDefender_iceFrost_Leaderboard',
            'ballDefenderPersistentLeaderboard',
            'ballDefenderLeaderboard',
            'ballDefenderGlobalLeaderboard'
        ];
        
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed: ${key}`);
            }
        });
        
        console.log('✅ Local data cleared');
    };
    
    console.log('💡 Debug functions available:');
    console.log('  debugGistLoading() - Test direct gist access');
    console.log('  debugLeaderboardManager() - Test leaderboard manager');
    console.log('  debugClearAllLocalData() - Clear all localStorage');
    
})();