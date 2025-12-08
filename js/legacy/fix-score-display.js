// Fix Score Display - Ensures leaderboard shows current data after high score entry
(function() {
    console.log('🏆 Fix Score Display Loading...');
    
    let fixApplied = false;
    
    function applyScoreDisplayFix() {
        const checkInterval = setInterval(() => {
            if (window.showNameInputDialog && !fixApplied) {
                console.log('🏆 Applying score display fix...');
                
                // Override showNameInputDialog to fix the flow
                const originalShowNameInput = window.showNameInputDialog;
                
                window.showNameInputDialog = function(playerScore) {
                    console.log('🏆 FIX: showNameInputDialog called with score:', playerScore);
                    
                    // Create modal overlay
                    const modal = document.createElement('div');
                    modal.className = 'name-input-modal';
                    
                    // Create dialog
                    const dialog = document.createElement('div');
                    dialog.className = 'name-input-dialog';
                    
                    dialog.innerHTML = `
                        <div class="name-input-title">New High Score!</div>
                        <div class="name-input-score">${playerScore}</div>
                        <input type="text" class="name-input-field" placeholder="Enter your name" maxlength="18" autocomplete="off">
                        <div class="name-input-buttons">
                            <button class="name-input-btn primary">Save Score</button>
                            <button class="name-input-btn secondary">Skip</button>
                        </div>
                    `;
                    
                    modal.appendChild(dialog);
                    document.body.appendChild(modal);
                    
                    const nameInput = dialog.querySelector('.name-input-field');
                    const saveBtn = dialog.querySelector('.primary');
                    const skipBtn = dialog.querySelector('.secondary');
                    
                    // Focus the input
                    nameInput.focus();
                    
                    // FIXED Handle save with proper async flow
                    const handleSave = async () => {
                        const playerName = nameInput.value.trim() || 'Anonymous';
                        console.log(`🏆 FIX: Saving score: ${playerName} - ${playerScore}`);
                        
                        try {
                            // Show saving indicator
                            saveBtn.textContent = 'Saving...';
                            saveBtn.disabled = true;
                            
                            // Step 1: Add to leaderboard (this syncs to gist)
                            if (window.OnlineLeaderboard && window.OnlineLeaderboard.addScore) {
                                console.log('🏆 FIX: Using OnlineLeaderboard.addScore');
                                await window.OnlineLeaderboard.addScore(playerName, playerScore);
                            } else if (window.addToLeaderboard) {
                                console.log('🏆 FIX: Using addToLeaderboard');
                                window.addToLeaderboard(playerName, playerScore);
                            }
                            
                            // Step 2: Wait a moment for gist sync
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // Step 3: Force refresh from gist
                            if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
                                console.log('🏆 FIX: Force refreshing from gist...');
                                await window.OnlineLeaderboard.mergeAndSync();
                            }
                            
                            // Step 4: Update display with fresh data
                            if (window.updateLeaderboardDisplay) {
                                console.log('🏆 FIX: Updating display with fresh data...');
                                window.updateLeaderboardDisplay();
                            }
                            
                            // Step 5: Small delay to ensure display update
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            console.log('🏆 FIX: Score saved and display updated');
                            
                        } catch (error) {
                            console.error('🏆 FIX: Error saving score:', error);
                        }
                        
                        // Step 6: Close modal
                        document.body.removeChild(modal);
                        console.log('🏆 FIX: Modal closed - leaderboard should show current data');
                    };
                    
                    // Handle skip
                    const handleSkip = () => {
                        document.body.removeChild(modal);
                        console.log('🏆 FIX: Score skipped');
                    };
                    
                    // Event listeners
                    saveBtn.addEventListener('click', handleSave);
                    skipBtn.addEventListener('click', handleSkip);
                    nameInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            handleSave();
                        } else if (e.key === 'Escape') {
                            handleSkip();
                        }
                    });
                };
                
                fixApplied = true;
                clearInterval(checkInterval);
                console.log('✅ Score display fix applied - leaderboard will show current data after score entry');
            }
        }, 100);
        
        // Safety timeout
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 10000);
    }
    
    // Apply the fix
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyScoreDisplayFix);
    } else {
        applyScoreDisplayFix();
    }
    
    console.log('🏆 Fix Score Display ready');
    
})();