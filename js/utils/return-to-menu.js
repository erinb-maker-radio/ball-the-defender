// Return to Menu Button System
(function() {
    console.log('🏠 Return to Menu System Loading...');
    
    let returnToMenuBtn = null;
    
    // Initialize the return to menu button
    function initializeReturnToMenuButton() {
        returnToMenuBtn = document.getElementById('returnToMenuBtn');
        
        if (!returnToMenuBtn) {
            console.error('❌ Return to Menu button not found in DOM');
            return;
        }
        
        // Add click event listener
        returnToMenuBtn.addEventListener('click', function() {
            console.log('🏠 Return to Menu button clicked');
            returnToMainMenu();
        });
        
        // Add styles to match other game buttons
        returnToMenuBtn.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        `;
        
        // Add hover effects
        returnToMenuBtn.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #ff5252 0%, #ff7979 100%)';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
        });
        
        returnToMenuBtn.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
        });
        
        console.log('✅ Return to Menu button initialized');
    }
    
    // Show the return to menu button (called when game starts)
    function showReturnToMenuButton() {
        if (returnToMenuBtn) {
            returnToMenuBtn.style.display = 'block';
            console.log('🏠 Return to Menu button shown');
        }
    }
    
    // Hide the return to menu button (called when returning to menu)
    function hideReturnToMenuButton() {
        if (returnToMenuBtn) {
            returnToMenuBtn.style.display = 'none';
            console.log('🏠 Return to Menu button hidden');
        }
    }
    
    // Return to main menu functionality
    function returnToMainMenu() {
        console.log('🏠 Returning to main menu - resetting game like a loss...');

        // Stop all audio immediately (suspend context to halt playing sounds)
        if (window.audioEngine) {
            window.audioEngine.pauseAudio();
            window.audioEngine.stopChordProgression();
            window.audioEngine.stopGlitchHopTrack();
            console.log('🔇 All audio stopped on menu return');
        }

        // Hide boom button when returning to menu
        if (window.domBoomButton) {
            window.domBoomButton.hide();
            console.log('💥 Boom button hidden on menu return');
        }

        // Always call stopGame to completely reset everything (like losing)
        if (window.stopGame) {
            console.log('⏹️ Calling stopGame() to reset board and all game state');
            window.stopGame();
        } else {
            console.warn('⚠️ stopGame() not available, manual cleanup...');
            // Fallback manual cleanup if stopGame doesn't exist
            window.gameState = 'idle';
            if (window.balls) window.balls.length = 0;
            if (window.blocks) window.blocks.length = 0;
            if (window.score !== undefined) window.score = 0;
            if (window.level !== undefined) window.level = 1;
        }
        
        // Clear any running intervals/timers
        if (window.gameLoopId) {
            cancelAnimationFrame(window.gameLoopId);
            window.gameLoopId = null;
        }
        
        // Set to menu state
        window.gameStarted = false;
        window.gameState = 'menu';
        
        // Hide game canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'none';
        }
        
        // Hide game controls and reset UI
        hideGameControls();
        
        // Reset start button text (in case it was "PLAY AGAIN")
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.textContent = 'START GAME';
            startBtn.style.display = 'none'; // Hide until game mode selected
        }
        
        // Hide pause button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.style.display = 'none';
        }
        
        // Show main menu
        if (window.showMainMenu) {
            window.showMainMenu();
        } else {
            // Fallback: create and show menu
            const menu = document.getElementById('mainMenu');
            if (menu) {
                menu.style.display = 'flex';

                // Reset all menu elements that may have been hidden by zoom animation
                const modeButtons = menu.querySelectorAll('.mode-image-btn');
                modeButtons.forEach(btn => {
                    btn.style.opacity = '1';
                    btn.style.transition = '';
                });

                const titleImg = menu.querySelector('.menu-title-img');
                if (titleImg) {
                    titleImg.style.opacity = '1';
                    titleImg.style.transition = '';
                }

                // Remove any leftover zoom image
                const zoomImg = document.getElementById('modeZoomImage');
                if (zoomImg) zoomImg.remove();

                console.log('🏠 Menu elements restored to visible');
            } else {
                console.warn('⚠️ Main menu not found, attempting to recreate...');
                if (window.createMainMenu) {
                    window.createMainMenu();
                }
            }
        }
        
        // Reset any mode-specific states
        resetModeStates();
        
        console.log('✅ Successfully returned to main menu - board completely reset');
    }
    
    // Reset mode-specific states (Ball Go Boom, Ice Mode, etc.)
    function resetModeStates() {
        // Reset Ball Go Boom state
        if (window.ballGoBoomState) {
            window.ballGoBoomState = {
                explosionReady: false,
                explosionTimer: null,
                flashInterval: null,
                explosionPower: 150,
                explosionRadius: 200,
                flashStartTime: null
            };
        }
        
        // Reset any ice mode states
        if (window.iceModeState) {
            window.iceModeState = {
                frozen: false,
                freezeTimer: null
            };
        }
        
        // Clear any mode-specific intervals or timers
        if (window.ballGoBoomState?.explosionTimer) {
            clearTimeout(window.ballGoBoomState.explosionTimer);
        }
        if (window.ballGoBoomState?.flashInterval) {
            clearInterval(window.ballGoBoomState.flashInterval);
        }
        
        console.log('🔄 Mode-specific states reset');
    }
    
    // Hide all game control buttons
    function hideGameControls() {
        const controlButtons = [
            'startBtn', 'pauseBtn', 'prestigeBtn', 'returnToMenuBtn'
        ];
        
        controlButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = 'none';
            }
        });
        
        // Hide speed control
        const speedControl = document.querySelector('.speed-control');
        if (speedControl) {
            speedControl.style.display = 'none';
        }
    }
    
    // Reset mode-specific states
    function resetModeStates() {
        // Reset Ball Go Boom state
        if (window.ballGoBoomState) {
            window.ballGoBoomState.explosionReady = false;
            window.ballGoBoomState.explosionTimer = null;
            window.ballGoBoomState.flashInterval = null;
            window.ballGoBoomState.flashStartTime = null;
        }
        
        // Hide Ball Go Boom button
        const ballGoBoomBtn = document.getElementById('ballGoBoomBtn');
        if (ballGoBoomBtn) {
            ballGoBoomBtn.style.display = 'none';
        }
        
        // Reset Ice Mode state
        if (window.iceMode) {
            // Clear any frozen blocks
            if (window.iceMode.clearAllFrozenBlocks) {
                window.iceMode.clearAllFrozenBlocks();
            }
        }
        
        // Clear any mode-specific overlays
        const overlays = document.querySelectorAll('.ice-overlay, .explosion-overlay');
        overlays.forEach(overlay => overlay.remove());
        
        console.log('🔄 Mode states reset');
    }
    
    // Hook into game start to show the button
    function hookGameStart() {
        // Monitor when game starts to show the button
        const originalStartGame = window.startGame;
        if (originalStartGame) {
            window.startGame = function(...args) {
                console.log('🏠 startGame called, will show return to menu button');
                const result = originalStartGame.apply(this, args);
                
                // Small delay to ensure game has started
                setTimeout(() => {
                    if (window.gameState === 'playing' || window.gameStarted) {
                        console.log('🏠 Game confirmed as started, showing return to menu button');
                        showReturnToMenuButton();
                    }
                }, 1000);
                
                return result;
            };
        }
        
        // Also try to hook into the core game.js startGame function
        // Check if it exists later and hook into it
        setTimeout(() => {
            if (window.startGame && window.startGame !== originalStartGame) {
                console.log('🏠 Found different startGame function, hooking into that too');
                const coreStartGame = window.startGame;
                window.startGame = function(...args) {
                    console.log('🏠 Core startGame called');
                    const result = coreStartGame.apply(this, args);
                    
                    // Show button when core game starts
                    setTimeout(() => {
                        console.log('🏠 Core game started, showing return to menu button');
                        showReturnToMenuButton();
                    }, 500);
                    
                    return result;
                };
            }
        }, 2000);
        
        // Also monitor gameState changes - ENHANCED for better detection
        let lastGameState = '';
        let lastGameStarted = false;
        setInterval(() => {
            const currentGameState = window.gameState;
            const currentGameStarted = window.gameStarted;
            
            // Check if state changed or if we should show the button
            if (currentGameState !== lastGameState || currentGameStarted !== lastGameStarted) {
                lastGameState = currentGameState;
                lastGameStarted = currentGameStarted;
                
                // Show button if game is playing OR if gameStarted is true (more forgiving)
                if (currentGameState === 'playing' || currentGameStarted) {
                    console.log('🏠 Game detected as active, showing return to menu button');
                    showReturnToMenuButton();
                } else if (currentGameState === 'menu' || currentGameState === 'stopped') {
                    hideReturnToMenuButton();
                }
            }
        }, 250); // Check more frequently
        
        // FAILSAFE: Monitor start button visibility as indicator game has started
        setInterval(() => {
            const startBtn = document.getElementById('startBtn');
            if (startBtn && startBtn.style.display === 'none') {
                // Start button is hidden, game must be running
                const returnBtn = document.getElementById('returnToMenuBtn');
                if (returnBtn && returnBtn.style.display === 'none') {
                    console.log('🏠 FAILSAFE: Start button hidden, showing return to menu');
                    showReturnToMenuButton();
                }
            }
        }, 1000);
    }
    
    // Expose functions globally
    window.ReturnToMenuSystem = {
        show: showReturnToMenuButton,
        hide: hideReturnToMenuButton,
        returnToMenu: returnToMainMenu
    };
    
    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    initializeReturnToMenuButton();
                    hookGameStart();
                }, 1000);
            });
        } else {
            setTimeout(() => {
                initializeReturnToMenuButton();
                hookGameStart();
            }, 1000);
        }
    }
    
    initialize();
    console.log('✅ Return to Menu System ready');
    
})();