// NUCLEAR Force Boom Colors and Button Fix
(function() {
    console.log('🔥 NUCLEAR FORCE Boom Colors and Button Fix Loading...');
    
    // FORCE OVERRIDE colors immediately
    let originalColors = null;
    let boomColorsApplied = false;
    
    // Ball Go Boom volcanic colors - AGGRESSIVE OVERRIDE
    const BOOM_COLORS = {
        1: { base: '#FF4500', glow: '#FF8C00', shadow: '#B22222' },  // Orange Red - Lava
        2: { base: '#FF6600', glow: '#FFA500', shadow: '#CC3300' },  // Bright Orange - Fire
        3: { base: '#FFD700', glow: '#FFFF00', shadow: '#FF8800' },  // Gold - Solar Flare
        4: { base: '#FF0000', glow: '#FF4444', shadow: '#990000' },  // Pure Red - Magma
        5: { base: '#DC143C', glow: '#FF1493', shadow: '#8B0000' },  // Crimson - Hot Coal
        6: { base: '#FF69B4', glow: '#FF00FF', shadow: '#CC0066' },  // Hot Pink - Plasma
        7: { base: '#8B0000', glow: '#FF4500', shadow: '#660000' },  // Dark Red - Ember
        8: { base: '#B22222', glow: '#FF6347', shadow: '#800000' },  // Fire Brick - Volcanic Rock
        9: { base: '#FF7F50', glow: '#FF6347', shadow: '#CD5C5C' },  // Coral - Molten Metal
        10: { base: '#FF8C00', glow: '#FFD700', shadow: '#FF6600' }, // Dark Orange - Liquid Fire
        default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' } // Indigo - Blue Flame (hottest)
    };
    
    // AGGRESSIVELY force apply boom colors
    function forceApplyBoomColors() {
        console.log('🔥 AGGRESSIVELY applying Ball Go Boom colors...');
        
        if (!window.colors) {
            console.warn('🔥 window.colors not found, creating...');
            return false;
        }
        
        // Store original colors if not stored
        if (!originalColors) {
            originalColors = JSON.parse(JSON.stringify(window.colors.blockByHP));
            console.log('🔥 Original colors backed up');
        }
        
        // FORCE replace every single color
        for (let hp = 1; hp <= 10; hp++) {
            if (BOOM_COLORS[hp]) {
                window.colors.blockByHP[hp] = BOOM_COLORS[hp];
            }
        }
        window.colors.blockByHP.default = BOOM_COLORS.default;
        
        boomColorsApplied = true;
        console.log('🔥 BOOM COLORS FORCE APPLIED!');
        console.log('🔥 HP 1 color now:', window.colors.blockByHP[1]);
        console.log('🔥 HP 5 color now:', window.colors.blockByHP[5]);
        
        return true;
    }
    
    // Restore original colors
    function restoreOriginalColors() {
        if (!originalColors || !window.colors) return;
        
        console.log('🔥 Restoring original colors...');
        for (let hp = 1; hp <= 10; hp++) {
            if (originalColors[hp]) {
                window.colors.blockByHP[hp] = originalColors[hp];
            }
        }
        window.colors.blockByHP.default = originalColors.default;
        
        boomColorsApplied = false;
        console.log('🔥 Original colors restored');
    }
    
    // FORCE create boom button
    function forceCreateBoomButton() {
        console.log('💣 FORCE creating Ball Go Boom button...');
        
        // Remove any existing button first
        const existingBtn = document.getElementById('ballGoBoomBtn');
        if (existingBtn) {
            existingBtn.remove();
            console.log('💣 Removed existing boom button');
        }
        
        const controls = document.querySelector('.game-controls');
        if (!controls) {
            console.warn('💣 Game controls not found!');
            return null;
        }
        
        // Create button with FORCE styling
        const boomBtn = document.createElement('button');
        boomBtn.id = 'ballGoBoomBtn';
        boomBtn.innerHTML = '💣 BALL GO BOOM! 💥';
        boomBtn.style.cssText = `
            display: block !important;
            width: 100%;
            padding: 20px;
            margin-top: 20px;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
            color: #1a1a2e !important;
            border: 3px solid #ff4500 !important;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            animation: pulse 2s infinite;
            box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
            transition: all 0.3s;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            z-index: 9999;
        `;
        
        // Add click handler
        boomBtn.addEventListener('click', function() {
            console.log('💥 BOOM BUTTON CLICKED!');
            if (window.triggerBallExplosion) {
                window.triggerBallExplosion();
            }
        });
        
        controls.appendChild(boomBtn);
        console.log('💣 Boom button FORCE created and added!');
        
        return boomBtn;
    }
    
    // Check boom button visibility AGGRESSIVELY
    function checkBoomButtonAggressive() {
        if (!window.currentGameMode || window.currentGameMode.id !== 'ballGoBoom') {
            return;
        }
        
        let boomBtn = document.getElementById('ballGoBoomBtn');
        if (!boomBtn) {
            console.log('💣 Boom button missing, force creating...');
            boomBtn = forceCreateBoomButton();
        }
        
        if (!boomBtn) return;
        
        // Check conditions
        const ballCount = window.balls ? window.balls.length : 0;
        const gameState = window.gameState;
        
        console.log(`💣 Button check: balls=${ballCount}, gameState=${gameState}`);
        
        if (ballCount === 1 && gameState === 'playing') {
            boomBtn.style.display = 'block';
            boomBtn.style.visibility = 'visible';
            boomBtn.disabled = false;
            console.log('💣 BOOM BUTTON SHOWN - 1 ball remaining');
        } else {
            boomBtn.style.display = 'none';
        }
    }
    
    // Monitor mode changes AGGRESSIVELY  
    function monitorModeChanges() {
        let lastMode = null;
        
        const checkMode = () => {
            const currentMode = window.currentGameMode?.id;
            
            if (currentMode !== lastMode) {
                console.log(`🔥 Mode changed: ${lastMode} -> ${currentMode}`);
                lastMode = currentMode;
                
                if (currentMode === 'ballGoBoom') {
                    console.log('🔥 Ball Go Boom mode activated - FORCING colors and button');
                    setTimeout(() => forceApplyBoomColors(), 100);
                    setTimeout(() => forceCreateBoomButton(), 200);
                } else if (currentMode === 'original' && boomColorsApplied) {
                    console.log('🔥 Original mode activated - restoring colors');
                    restoreOriginalColors();
                }
            }
        };
        
        // Check every 100ms
        setInterval(checkMode, 100);
    }
    
    // Hook into game loop AGGRESSIVELY
    function hookGameLoop() {
        console.log('🔥 Hooking game loop for AGGRESSIVE monitoring...');
        
        const checkForGameLoop = setInterval(() => {
            if (window.gameLoop) {
                const originalGameLoop = window.gameLoop;
                
                window.gameLoop = function() {
                    // Apply colors if in Ball Go Boom mode
                    if (window.currentGameMode?.id === 'ballGoBoom' && !boomColorsApplied) {
                        forceApplyBoomColors();
                    }
                    
                    // Check button visibility every frame
                    if (window.currentGameMode?.id === 'ballGoBoom') {
                        checkBoomButtonAggressive();
                    }
                    
                    return originalGameLoop.call(this);
                };
                
                clearInterval(checkForGameLoop);
                console.log('✅ Game loop AGGRESSIVELY hooked');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkForGameLoop), 10000);
    }
    
    // Debug functions
    window.forceBoomColors = forceApplyBoomColors;
    window.forceBoomButton = forceCreateBoomButton;
    window.debugBoomMode = function() {
        console.log('🔥 BOOM MODE DEBUG:');
        console.log('  - Current mode:', window.currentGameMode?.id);
        console.log('  - Colors applied:', boomColorsApplied);
        console.log('  - Button exists:', !!document.getElementById('ballGoBoomBtn'));
        console.log('  - Ball count:', window.balls?.length);
        console.log('  - Game state:', window.gameState);
        
        if (window.colors?.blockByHP) {
            console.log('  - HP 1 color:', window.colors.blockByHP[1]);
            console.log('  - HP 5 color:', window.colors.blockByHP[5]);
        }
    };
    
    // Initialize EVERYTHING
    function initialize() {
        console.log('🔥 NUCLEAR Force Boom initialization...');
        
        // Wait for DOM and colors to exist
        const waitForReady = setInterval(() => {
            if (window.colors && window.colors.blockByHP) {
                console.log('🔥 Colors object found, setting up aggressive monitoring...');
                
                hookGameLoop();
                monitorModeChanges();
                
                // If already in boom mode, force apply immediately
                if (window.currentGameMode?.id === 'ballGoBoom') {
                    setTimeout(() => {
                        forceApplyBoomColors();
                        forceCreateBoomButton();
                    }, 500);
                }
                
                clearInterval(waitForReady);
            }
        }, 100);
        
        setTimeout(() => clearInterval(waitForReady), 10000);
    }
    
    // Start everything
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    console.log('🔥 NUCLEAR Force Boom Colors and Button Fix ready!');
    console.log('💡 Debug: debugBoomMode(), forceBoomColors(), forceBoomButton()');
    
})();