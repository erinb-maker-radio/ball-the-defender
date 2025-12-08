// Test script to manually add some Original mode scores for debugging
(function() {
    console.log('🧪 TESTING ORIGINAL MODE SCORES');
    
    // Create some test scores
    const testScores = [
        { name: 'TestPlayer1', score: 1500, date: new Date().toISOString() },
        { name: 'TestPlayer2', score: 1200, date: new Date().toISOString() },
        { name: 'TestPlayer3', score: 1000, date: new Date().toISOString() },
        { name: 'TestPlayer4', score: 800, date: new Date().toISOString() },
        { name: 'TestPlayer5', score: 600, date: new Date().toISOString() }
    ];
    
    // Save to the main storage location
    console.log('💾 Saving test scores to ballDefenderPersistentLeaderboard...');
    localStorage.setItem('ballDefenderPersistentLeaderboard', JSON.stringify(testScores));
    
    // Also save to mode-specific storage
    console.log('💾 Saving test scores to ballDefender_original_Leaderboard...');
    localStorage.setItem('ballDefender_original_Leaderboard', JSON.stringify(testScores));
    
    // Force reload of original scores in working-gist-writer
    if (window.getModeScores) {
        console.log('🔄 Forcing reload of original mode scores...');
        
        // Manually reload the scores (simulate what loadOriginalScores does)
        try {
            const stored = localStorage.getItem('ballDefenderPersistentLeaderboard');
            if (stored) {
                const scores = JSON.parse(stored).filter(s => typeof s.score === 'number');
                
                // Update the mode scores directly if possible
                if (window.getAllModeScores) {
                    const allScores = window.getAllModeScores();
                    allScores['original'] = scores;
                    console.log(`✅ Updated original mode scores: ${scores.length} entries`);
                }
            }
        } catch (e) {
            console.error('❌ Failed to reload scores:', e);
        }
    }
    
    // Force update of the leaderboard display
    console.log('🖥️ Forcing leaderboard display update...');
    if (window.updateLeaderboardDisplay) {
        window.updateLeaderboardDisplay();
    }
    
    // Test the getLeaderboard function
    console.log('🏆 Testing getLeaderboard function...');
    if (window.getLeaderboard) {
        const leaderboard = window.getLeaderboard();
        console.log(`Result: ${leaderboard.length} entries`);
        if (leaderboard.length > 0) {
            console.log('Top score:', leaderboard[0]);
        }
    }
    
    console.log('✅ Test scores added! Check the leaderboard display.');
    
})();