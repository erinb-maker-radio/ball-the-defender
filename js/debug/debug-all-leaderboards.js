// Debug script to check all mode leaderboards
(function() {
    console.log('🏆 DEBUGGING ALL MODE LEADERBOARDS');
    console.log('=' .repeat(60));
    
    // Check what modes are available
    console.log('📊 AVAILABLE MODES:');
    console.log('  window.GameModes:', window.GameModes);
    if (window.ModeFramework) {
        console.log('  ModeFramework modes:', Array.from(window.ModeFramework.registeredModes.keys()));
    }
    console.log('');
    
    // Check current mode
    console.log('🎯 CURRENT MODE:');
    console.log('  window.currentGameMode:', window.currentGameMode);
    console.log('  window.selectedGameMode:', window.selectedGameMode);
    console.log('  localStorage selectedMode:', localStorage.getItem('ballDefender_selectedMode'));
    console.log('');
    
    // Check localStorage for all possible leaderboard keys
    console.log('💾 ALL LEADERBOARD STORAGE:');
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('ball') || key.includes('Ball') || key.includes('leader') || key.includes('Leader')) {
            allKeys.push(key);
        }
    }
    
    allKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    console.log(`  ✅ ${key}: ${parsed.length} scores`);
                    if (parsed.length > 0 && parsed[0].score) {
                        console.log(`    Top: ${parsed[0].name} - ${parsed[0].score}`);
                    }
                } else {
                    console.log(`  ⚪ ${key}: Not an array`);
                }
            } catch (e) {
                console.log(`  ❌ ${key}: Invalid JSON`);
            }
        }
    });
    console.log('');
    
    // Check working-gist-writer mode scores
    console.log('🎯 WORKING-GIST-WRITER MODE SCORES:');
    if (window.getModeScores) {
        const modes = ['original', 'ballGoBoom', 'iceFrost'];
        modes.forEach(mode => {
            const scores = window.getModeScores(mode);
            console.log(`  ${mode}: ${scores.length} scores`);
            if (scores.length > 0) {
                console.log(`    Top: ${scores[0].name} - ${scores[0].score}`);
            }
        });
        
        if (window.getAllModeScores) {
            console.log('  All mode scores object:', window.getAllModeScores());
        }
    } else {
        console.log('  ❌ window.getModeScores not available');
    }
    console.log('');
    
    // Test getLeaderboard function for each mode
    console.log('🏆 TESTING GETLEADERBOARD FOR EACH MODE:');
    const modes = ['original', 'ballGoBoom', 'iceFrost'];
    
    modes.forEach(mode => {
        console.log(`\n--- Testing ${mode.toUpperCase()} mode ---`);
        
        // Temporarily set the current mode
        const originalMode = window.currentGameMode;
        const originalSelected = window.selectedGameMode;
        
        // Set mode for testing
        if (window.GameModes && window.GameModes[mode.toUpperCase()]) {
            window.currentGameMode = window.GameModes[mode.toUpperCase()];
        }
        window.selectedGameMode = mode;
        
        // Test getLeaderboard
        if (window.getLeaderboard) {
            const leaderboard = window.getLeaderboard();
            console.log(`  getLeaderboard() returns: ${leaderboard.length} entries`);
            if (leaderboard.length > 0) {
                console.log(`    Top score: ${leaderboard[0].name} - ${leaderboard[0].score}`);
            }
        } else {
            console.log('  ❌ getLeaderboard function not available');
        }
        
        // Restore original mode
        window.currentGameMode = originalMode;
        window.selectedGameMode = originalSelected;
    });
    console.log('');
    
    // Check DOM leaderboard element
    console.log('🖥️ DOM LEADERBOARD ELEMENT:');
    const leaderboardElement = document.getElementById('leaderboard');
    if (leaderboardElement) {
        console.log('  ✅ Leaderboard element found');
        console.log(`  Current content: "${leaderboardElement.innerHTML.substring(0, 100)}..."`);
        console.log(`  Content length: ${leaderboardElement.innerHTML.length} chars`);
    } else {
        console.log('  ❌ Leaderboard element not found');
    }
    console.log('');
    
    // Test functions
    window.debugSwitchToMode = function(mode) {
        console.log(`🔄 Switching to ${mode} mode...`);
        if (window.startGame) {
            window.startGame(mode);
        } else {
            console.error('startGame function not found');
        }
    };
    
    window.debugForceUpdateDisplay = function() {
        console.log('🔄 Force updating leaderboard display...');
        if (window.updateLeaderboardDisplay) {
            window.updateLeaderboardDisplay();
        } else {
            console.error('updateLeaderboardDisplay function not found');
        }
    };
    
    window.debugAddTestScoreToCurrentMode = function() {
        const currentMode = window.currentGameMode?.id || window.selectedGameMode || 'original';
        console.log(`🧪 Adding test score to ${currentMode} mode...`);
        
        if (window.addToLeaderboard) {
            window.addToLeaderboard('TestUser', 9999);
            console.log('✅ Test score added via addToLeaderboard');
            
            // Force refresh
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
            }
        } else {
            console.error('addToLeaderboard function not found');
        }
    };
    
    console.log('💡 Debug functions available:');
    console.log('  debugSwitchToMode("original"|"ballGoBoom"|"iceFrost") - switch modes');
    console.log('  debugForceUpdateDisplay() - force leaderboard refresh');
    console.log('  debugAddTestScoreToCurrentMode() - add test score to current mode');
    
})();