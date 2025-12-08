// Leaderboard Debug and Fix System
// This script diagnoses and fixes leaderboard issues

(function() {
    console.log('🔧 Leaderboard Debug System Loading...');
    
    // Enhanced logging for all leaderboard operations
    function debugLog(message, data = null) {
        console.log(`🏆 LEADERBOARD DEBUG: ${message}`);
        if (data) {
            console.log('📊 Data:', data);
        }
    }
    
    // Test localStorage functionality
    function testLocalStorage() {
        try {
            const testKey = 'ballDefender_test_' + Date.now();
            const testValue = 'test_value_' + Math.random();
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (retrieved === testValue) {
                debugLog('✅ localStorage is working correctly');
                return true;
            } else {
                debugLog('❌ localStorage read/write mismatch');
                return false;
            }
        } catch (e) {
            debugLog('❌ localStorage failed:', e.message);
            return false;
        }
    }
    
    // Override and enhance the addToLeaderboard function
    function enhanceAddToLeaderboard() {
        if (window.addToLeaderboard) {
            const originalAdd = window.addToLeaderboard;
            
            window.addToLeaderboard = function(playerName, playerScore) {
                debugLog(`📝 addToLeaderboard called: ${playerName} - ${playerScore}`);
                
                try {
                    // Ensure we have valid inputs
                    if (!playerName || typeof playerScore !== 'number') {
                        debugLog('❌ Invalid inputs to addToLeaderboard', {playerName, playerScore});
                        return;
                    }
                    
                    // Get current leaderboard
                    let currentScores = [];
                    try {
                        const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
                        if (stored) {
                            currentScores = JSON.parse(stored);
                            debugLog(`📋 Current leaderboard has ${currentScores.length} scores`);
                        } else {
                            debugLog('📋 No existing leaderboard, starting fresh');
                        }
                    } catch (e) {
                        debugLog('❌ Error loading current leaderboard:', e.message);
                        currentScores = [];
                    }
                    
                    // Add new score
                    const newScore = {
                        name: playerName.substring(0, 18),
                        score: playerScore,
                        date: new Date().toISOString()
                    };
                    
                    currentScores.push(newScore);
                    debugLog('✅ New score added to array');
                    
                    // Remove duplicates (keep highest score per player)
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
                    
                    // Convert to array and sort
                    const finalScores = Array.from(nameMap.values())
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 15); // Keep top 15
                    
                    debugLog(`🎯 Final leaderboard has ${finalScores.length} scores`);
                    debugLog('🏆 Top 3 scores:', finalScores.slice(0, 3));
                    
                    // Save to localStorage
                    try {
                        localStorage.setItem('ballDefenderGlobalLeaderboard', JSON.stringify(finalScores));
                        debugLog('✅ Leaderboard saved to localStorage');
                        
                        // Verify it was saved
                        const verification = localStorage.getItem('ballDefenderGlobalLeaderboard');
                        if (verification) {
                            const parsed = JSON.parse(verification);
                            debugLog(`✅ Verification: ${parsed.length} scores in storage`);
                        } else {
                            debugLog('❌ Verification failed: No data in localStorage');
                        }
                    } catch (e) {
                        debugLog('❌ Error saving to localStorage:', e.message);
                    }
                    
                    // Update global reference
                    if (window.currentLeaderboard) {
                        window.currentLeaderboard = finalScores;
                        debugLog('✅ Global currentLeaderboard updated');
                    }
                    
                    // Update display
                    if (window.updateLeaderboardDisplay) {
                        window.updateLeaderboardDisplay();
                        debugLog('✅ Display update called');
                    } else {
                        debugLog('❌ updateLeaderboardDisplay function not found');
                    }
                    
                    return finalScores;
                    
                } catch (error) {
                    debugLog('❌ Error in addToLeaderboard:', error.message);
                    debugLog('🔄 Falling back to original function');
                    return originalAdd.call(this, playerName, playerScore);
                }
            };
            
            debugLog('✅ addToLeaderboard function enhanced');
        } else {
            debugLog('❌ addToLeaderboard function not found!');
        }
    }
    
    // Override and enhance the showNameInputDialog function
    function enhanceNameInputDialog() {
        if (window.showNameInputDialog) {
            const originalDialog = window.showNameInputDialog;
            
            window.showNameInputDialog = function(playerScore) {
                debugLog(`🎯 High score dialog triggered for score: ${playerScore}`);
                
                // Call original function but add extra debugging
                const result = originalDialog.call(this, playerScore);
                
                // Add debugging to the save button
                setTimeout(() => {
                    const saveBtn = document.querySelector('.name-input-btn.primary');
                    if (saveBtn) {
                        const originalClick = saveBtn.onclick;
                        saveBtn.onclick = function() {
                            const nameInput = document.querySelector('.name-input-field');
                            const playerName = nameInput ? nameInput.value.trim() || 'Anonymous' : 'Anonymous';
                            
                            debugLog(`💾 Save button clicked: ${playerName} - ${playerScore}`);
                            
                            if (originalClick) {
                                originalClick.call(this);
                            }
                        };
                        debugLog('✅ Save button debugging added');
                    }
                }, 100);
                
                return result;
            };
            
            debugLog('✅ showNameInputDialog function enhanced');
        } else {
            debugLog('❌ showNameInputDialog function not found!');
        }
    }
    
    // Override gameOver function to add debugging
    function enhanceGameOver() {
        if (window.gameOver) {
            const originalGameOver = window.gameOver;
            
            window.gameOver = function() {
                debugLog(`🎮 Game Over called - Current score: ${window.score || 'unknown'}`);
                
                // Check if it's a high score
                if (window.isHighScore && window.score) {
                    const isHigh = window.isHighScore(window.score);
                    debugLog(`🏆 Is high score: ${isHigh}`);
                } else {
                    debugLog('❌ isHighScore function or score not available');
                }
                
                return originalGameOver.call(this);
            };
            
            debugLog('✅ gameOver function enhanced');
        } else {
            debugLog('❌ gameOver function not found!');
        }
    }
    
    // Manual test function
    window.testLeaderboard = function() {
        debugLog('🧪 Starting manual leaderboard test...');
        
        const testScore = Math.floor(Math.random() * 10000) + 5000;
        const testName = 'TEST_' + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        debugLog(`🎯 Testing with: ${testName} - ${testScore}`);
        
        if (window.addToLeaderboard) {
            window.addToLeaderboard(testName, testScore);
        } else {
            debugLog('❌ addToLeaderboard function not available for testing');
        }
    };
    
    // Initialize when DOM is ready
    function initialize() {
        debugLog('🚀 Initializing leaderboard debug system...');
        
        // Test localStorage
        const localStorageWorks = testLocalStorage();
        
        if (!localStorageWorks) {
            debugLog('❌ CRITICAL: localStorage is not working!');
            return;
        }
        
        // Enhance functions
        enhanceAddToLeaderboard();
        enhanceNameInputDialog();
        enhanceGameOver();
        
        // Show current leaderboard state
        try {
            const stored = localStorage.getItem('ballDefenderGlobalLeaderboard');
            if (stored) {
                const scores = JSON.parse(stored);
                debugLog(`📊 Current leaderboard: ${scores.length} scores`);
                scores.slice(0, 3).forEach((score, index) => {
                    debugLog(`   ${index + 1}. ${score.name} - ${score.score}`);
                });
            } else {
                debugLog('📊 No leaderboard data in localStorage');
            }
        } catch (e) {
            debugLog('❌ Error reading current leaderboard:', e.message);
        }
        
        debugLog('✅ Debug system ready');
        debugLog('💡 Type testLeaderboard() in console to test manually');
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();