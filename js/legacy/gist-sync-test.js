// Test if GitHub Gist syncing is working
(function() {
    console.log('🧪 Testing GitHub Gist sync...');
    
    const GIST_URL = 'https://gist.githubusercontent.com/erinb-maker-radio/40398c32fa6fac004a52ea22d2612d23/raw/ball-defender-leaderboard.json';
    
    async function testGistAccess() {
        try {
            console.log('🌐 Testing gist access...');
            const response = await fetch(GIST_URL + '?t=' + Date.now());
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Gist accessible!');
                console.log('📊 Gist contains:', data.leaderboard?.length, 'scores');
                console.log('🏆 Gist scores:', data.leaderboard);
                
                // Check local storage
                const local = localStorage.getItem('ballDefenderGlobalLeaderboard');
                if (local) {
                    const localScores = JSON.parse(local);
                    console.log('📦 localStorage contains:', localScores.length, 'scores');
                    console.log('🏠 Local scores:', localScores);
                    
                    // Compare
                    if (data.leaderboard.length !== localScores.length) {
                        console.log('⚠️ MISMATCH: Gist has', data.leaderboard.length, 'but local has', localScores.length);
                    } else {
                        console.log('✅ Count matches');
                    }
                } else {
                    console.log('📦 No localStorage data found');
                }
                
                return data.leaderboard;
            } else {
                console.error('❌ Gist not accessible:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Gist test failed:', error);
            return null;
        }
    }
    
    // Test on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', testGistAccess);
    } else {
        testGistAccess();
    }
    
    // Make test function available
    window.testGistSync = testGistAccess;
    
    console.log('💡 Type testGistSync() to check gist vs localStorage');
    
})();