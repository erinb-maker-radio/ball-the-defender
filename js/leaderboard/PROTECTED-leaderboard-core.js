/**
 * 🔒 PROTECTED FILE - MANDATORY PERMISSION REQUIRED 🔒
 * 
 * This file contains CRITICAL leaderboard functionality.
 * ANY modification requires explicit user permission.
 * 
 * ENFORCEMENT RULES:
 * 1. AI assistants MUST ask permission before ANY edit
 * 2. Permission must be granted for EACH modification
 * 3. User must explicitly approve with "YES"
 * 4. No blanket permissions allowed
 * 5. Even typos and comments require permission
 * 
 * PROTECTED FUNCTIONS:
 * - PROTECTED_submitToSupabase(): Handles final score submission
 * - PROTECTED_preserveScore(): Ensures score isn't lost in gameOver
 * - PROTECTED_showNameDialog(): Shows name input dialog
 * - PROTECTED_gameOverFlow(): Complete game over sequence
 * 
 * Last verified working: December 2024
 */

// ⚠️⚠️⚠️ CRITICAL: Core leaderboard submission function ⚠️⚠️⚠️
window.PROTECTED_submitToSupabase = async function(playerName, playerScore, gameMode) {
    console.log('🔒 PROTECTED: Submitting to Supabase:', playerName, playerScore, gameMode);
    
    // Detect game mode if not provided
    const detectedMode = gameMode || window.currentGameMode?.id || window.selectedGameMode || localStorage.getItem('ballDefender_selectedMode') || 'original';
    
    // Use the existing Supabase system
    if (window.addToSupabaseLeaderboard) {
        console.log(`🔒 PROTECTED: Using Supabase system for mode: ${detectedMode}`);
        return await window.addToSupabaseLeaderboard(playerName, playerScore, detectedMode);
    } else {
        console.error('🔒 PROTECTED ERROR: addToSupabaseLeaderboard not available!');
        throw new Error('Supabase leaderboard system not available');
    }
};

// ⚠️⚠️⚠️ CRITICAL: Score preservation function ⚠️⚠️⚠️
window.PROTECTED_preserveScore = function(currentScore) {
    console.log('🔒 PROTECTED: Preserving score before reset:', currentScore);
    
    // This MUST be called before stopGame() or score will be lost
    if (typeof currentScore !== 'number') {
        console.error('🔒 PROTECTED ERROR: Invalid score type:', typeof currentScore, currentScore);
        return 0;
    }
    
    if (currentScore < 0) {
        console.warn('🔒 PROTECTED WARNING: Negative score detected:', currentScore);
        return 0;
    }
    
    return currentScore;
};

// ⚠️⚠️⚠️ CRITICAL: Name input dialog function ⚠️⚠️⚠️
window.PROTECTED_showNameDialog = function(playerScore) {
    console.log('🔒 PROTECTED: Showing name dialog for score:', playerScore);
    
    // Validate score
    if (!playerScore || playerScore <= 0) {
        console.error('🔒 PROTECTED ERROR: Invalid score for name dialog:', playerScore);
        return;
    }
    
    // Call the existing showNameInputDialog function
    if (typeof showNameInputDialog === 'function') {
        showNameInputDialog(playerScore);
    } else {
        console.error('🔒 PROTECTED ERROR: showNameInputDialog function not available!');
    }
};

// ⚠️⚠️⚠️ CRITICAL: Complete protected game over flow ⚠️⚠️⚠️
window.PROTECTED_gameOverFlow = function(currentScore) {
    console.log('🔒 PROTECTED: Starting protected game over flow with score:', currentScore);
    
    try {
        // Step 1: Preserve the score before any resets
        const preservedScore = window.PROTECTED_preserveScore(currentScore);
        
        // Step 2: Call stopGame to reset the game state
        if (typeof stopGame === 'function') {
            stopGame();
            console.log('🔒 PROTECTED: Game stopped and reset');
        } else {
            console.error('🔒 PROTECTED ERROR: stopGame function not available');
        }
        
        // Step 3: Check if it's a high score
        let isHigh = false;
        if (typeof isHighScore === 'function') {
            isHigh = isHighScore(preservedScore);
            console.log('🔒 PROTECTED: High score check result:', isHigh);
        } else {
            console.warn('🔒 PROTECTED WARNING: isHighScore function not available, assuming high score');
            isHigh = true;
        }
        
        // Step 4: Show name dialog only if it's a top 15 score for the mode
        if (isHigh) {
            console.log('🔒 PROTECTED: Showing name dialog for top 15 score:', preservedScore);
            window.PROTECTED_showNameDialog(preservedScore);
        } else {
            console.log('🔒 PROTECTED: Score not in top 15 for this mode:', preservedScore);
        }
        
        // Step 5: Show PLAY AGAIN button after the flow completes
        window.PROTECTED_showPlayAgainButton();
        
        return preservedScore;
        
    } catch (error) {
        console.error('🔒 PROTECTED ERROR in game over flow:', error);
        // Even if there's an error, try to preserve the score and show play again
        const score = window.PROTECTED_preserveScore(currentScore);
        window.PROTECTED_showPlayAgainButton();
        return score;
    }
};

// ⚠️⚠️⚠️ CRITICAL: Show play again button after game over ⚠️⚠️⚠️
window.PROTECTED_showPlayAgainButton = function() {
    console.log('🔒 PROTECTED: Showing PLAY AGAIN button');
    
    // Find the start button and show it with PLAY AGAIN text
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.textContent = 'PLAY AGAIN';
        startBtn.style.display = 'block';
        console.log('🔒 PROTECTED: PLAY AGAIN button shown');
    } else {
        console.error('🔒 PROTECTED ERROR: Start button not found in DOM');
    }
    
    // Hide end game button since game is over
    const endGameBtn = document.getElementById('endGameBtn');
    if (endGameBtn) {
        endGameBtn.style.display = 'none';
        console.log('🔒 PROTECTED: End game button hidden');
    }
};

// ⚠️⚠️⚠️ CRITICAL: Protected addToLeaderboard wrapper ⚠️⚠️⚠️
window.PROTECTED_addToLeaderboard = async function(playerName, playerScore) {
    console.log('🔒 PROTECTED: Adding to leaderboard:', playerName, playerScore);
    
    try {
        // Use the protected submission function
        const result = await window.PROTECTED_submitToSupabase(playerName, playerScore);
        
        // Update leaderboard display if function exists
        if (typeof updateLeaderboardDisplay === 'function') {
            updateLeaderboardDisplay();
        }
        
        console.log('🔒 PROTECTED: Successfully added to leaderboard');
        return result;
        
    } catch (error) {
        console.error('🔒 PROTECTED ERROR: Failed to add to leaderboard:', error);
        throw error;
    }
};

// ⚠️⚠️⚠️ CRITICAL: Health check for protected functions ⚠️⚠️⚠️
window.PROTECTED_healthCheck = function() {
    console.log('🔒 PROTECTED: Running leaderboard health check...');
    
    const checks = {
        supabaseSystem: !!window.addToSupabaseLeaderboard,
        authSystem: !!window.SecureHighScoreAuth,
        nameDialog: typeof showNameInputDialog === 'function',
        scoreCheck: typeof isHighScore === 'function',
        gameOverOriginal: typeof gameOver === 'function',
        protectedFunctions: {
            submitToSupabase: typeof window.PROTECTED_submitToSupabase === 'function',
            preserveScore: typeof window.PROTECTED_preserveScore === 'function',
            showNameDialog: typeof window.PROTECTED_showNameDialog === 'function',
            gameOverFlow: typeof window.PROTECTED_gameOverFlow === 'function',
            addToLeaderboard: typeof window.PROTECTED_addToLeaderboard === 'function',
            showPlayAgainButton: typeof window.PROTECTED_showPlayAgainButton === 'function'
        }
    };
    
    const allProtectedOk = Object.values(checks.protectedFunctions).every(v => v === true);
    const coreSystemsOk = checks.supabaseSystem && checks.authSystem && checks.nameDialog;
    
    if (allProtectedOk && coreSystemsOk) {
        console.log('✅ 🔒 PROTECTED: All leaderboard systems healthy!');
        return true;
    } else {
        console.error('❌ 🔒 PROTECTED: Leaderboard health check FAILED!');
        console.error('🔒 PROTECTED: Failed checks:', checks);
        return false;
    }
};

// Auto-run health check when this file loads
console.log('🔒 PROTECTED-leaderboard-core.js loaded');
setTimeout(() => {
    window.PROTECTED_healthCheck();
}, 1000);

// Expose for debugging
window.PROTECTED_LEADERBOARD_CORE = {
    version: '1.0.0',
    lastModified: 'December 2024',
    healthCheck: window.PROTECTED_healthCheck,
    functions: [
        'PROTECTED_submitToSupabase',
        'PROTECTED_preserveScore', 
        'PROTECTED_showNameDialog',
        'PROTECTED_gameOverFlow',
        'PROTECTED_addToLeaderboard',
        'PROTECTED_showPlayAgainButton'
    ]
};