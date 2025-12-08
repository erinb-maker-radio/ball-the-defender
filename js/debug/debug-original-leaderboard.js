// Debug script to investigate Original mode leaderboard issues
(function() {
    console.log('🔍 DEBUGGING ORIGINAL MODE LEADERBOARD');
    console.log('=' .repeat(50));
    
    // Check current game mode
    console.log('📊 CURRENT GAME STATE:');
    console.log('  window.currentGameMode:', window.currentGameMode);
    console.log('  window.selectedGameMode:', window.selectedGameMode);
    console.log('  localStorage selectedMode:', localStorage.getItem('ballDefender_selectedMode'));
    console.log('');
    
    // Check localStorage for all possible score keys
    console.log('💾 LOCALSTORAGE INSPECTION:');
    const possibleKeys = [
        'ballDefender_original_Leaderboard',
        'ballDefenderPersistentLeaderboard', 
        'ballDefenderLeaderboard',
        'ballDefender_ballGoBoom_Leaderboard',
        'ballDefender_iceFrost_Leaderboard'
    ];
    
    possibleKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log(`  ✅ ${key}: ${parsed.length} entries`);
                if (parsed.length > 0) {
                    console.log(`    Top score: ${parsed[0].name} - ${parsed[0].score}`);
                }
            } catch (e) {
                console.log(`  ❌ ${key}: Invalid JSON`);
            }
        } else {
            console.log(`  ⭕ ${key}: Not found`);
        }
    });
    console.log('');
    
    // Check working-gist-writer mode scores
    console.log('🎯 MODE SCORES CHECK:');
    if (window.getModeScores) {
        const originalScores = window.getModeScores('original');
        console.log(`  Original mode scores: ${originalScores.length} entries`);
        if (originalScores.length > 0) {
            console.log(`    Top score: ${originalScores[0].name} - ${originalScores[0].score}`);
        }
        
        if (window.getAllModeScores) {
            const allScores = window.getAllModeScores();
            console.log('  All mode scores:', allScores);
        }
    } else {
        console.log('  ❌ window.getModeScores not available');
    }
    console.log('');
    
    // Check getLeaderboard function result
    console.log('🏆 GETLEADERBOARD FUNCTION TEST:');
    if (window.getLeaderboard) {
        const leaderboard = window.getLeaderboard();
        console.log(`  getLeaderboard() returns: ${leaderboard.length} entries`);
        if (leaderboard.length > 0) {
            console.log(`    Top score: ${leaderboard[0].name} - ${leaderboard[0].score}`);
        }
    } else {
        console.log('  ❌ getLeaderboard function not available');
    }
    console.log('');
    
    // Check leaderboard display element
    console.log('🖥️ DOM ELEMENT CHECK:');
    const leaderboardElement = document.getElementById('leaderboard');
    if (leaderboardElement) {
        console.log('  ✅ Leaderboard element found');
        console.log(`  Current content length: ${leaderboardElement.innerHTML.length} chars`);
        if (leaderboardElement.innerHTML.trim() === '') {
            console.log('  ⚠️ Leaderboard element is empty!');
        }
    } else {
        console.log('  ❌ Leaderboard element not found in DOM');
    }
    console.log('');
    
    // Test manual score addition for debugging
    console.log('🧪 MANUAL TEST:');
    window.debugAddTestScore = function() {
        console.log('Adding test score to Original mode...');
        if (window.addToLeaderboard) {
            window.addToLeaderboard('DebugTest', 9999);
            console.log('Test score added, updating display...');
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
            }
        }
    };
    
    window.debugForceRefresh = function() {
        console.log('Force refreshing leaderboard display...');
        if (window.updateLeaderboardDisplay) {
            window.updateLeaderboardDisplay();
        }
    };
    
    console.log('💡 Debug functions available:');
    console.log('  debugAddTestScore() - adds a test score');
    console.log('  debugForceRefresh() - forces leaderboard refresh');
    console.log('  debugGistWriter() - shows gist writer status');
    
})();