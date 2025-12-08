// DEFINITIVE Ball Go Boom Colors - Direct Override at Source
(function() {
    console.log('🔥 DEFINITIVE Boom Colors - Intercepting color object creation...');
    
    // Ball Go Boom volcanic colors
    const BOOM_BLOCK_COLORS = {
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
        default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' } // Indigo - Blue Flame
    };
    
    // Original colors backup
    let originalBlockColors = null;
    
    // INTERCEPT the colors object creation
    let colorsIntercepted = false;
    const originalDefineProperty = Object.defineProperty;
    
    // Monitor window.colors assignment
    let colorsWatcher = null;
    function watchForColors() {
        if (window.colors && !colorsIntercepted) {
            console.log('🔥 Colors object detected! Intercepting...');
            interceptColors();
            if (colorsWatcher) clearInterval(colorsWatcher);
        }
    }
    
    // Start watching immediately
    colorsWatcher = setInterval(watchForColors, 50);
    
    // Intercept colors and add mode-switching capability
    function interceptColors() {
        if (!window.colors || colorsIntercepted) return;
        
        console.log('🔥 Intercepting colors object...');
        colorsIntercepted = true;
        
        // Backup original colors
        originalBlockColors = JSON.parse(JSON.stringify(window.colors.blockByHP));
        console.log('🔥 Original colors backed up:', Object.keys(originalBlockColors).length, 'entries');
        
        // Create mode-aware color system
        const originalColors = window.colors;
        
        // Override the colors object with a smart proxy-like system
        const smartColors = {
            ...originalColors,
            blockByHP: new Proxy(originalColors.blockByHP, {
                get: function(target, prop) {
                    // If in Ball Go Boom mode, return boom colors
                    if (window.currentGameMode && window.currentGameMode.id === 'ballGoBoom') {
                        if (BOOM_BLOCK_COLORS[prop]) {
                            return BOOM_BLOCK_COLORS[prop];
                        }
                        if (prop === 'default') {
                            return BOOM_BLOCK_COLORS.default;
                        }
                    }
                    // Otherwise return original colors
                    return originalBlockColors[prop] || target[prop];
                }
            })
        };
        
        // Replace window.colors
        window.colors = smartColors;
        
        console.log('🔥 Smart color system installed!');
        console.log('🔥 Mode-aware colors: Original + Ball Go Boom volcanic');
        
        // Test the system
        setTimeout(() => {
            console.log('🔥 Testing color system...');
            console.log('  - Current mode:', window.currentGameMode?.id);
            console.log('  - HP 1 color (should be green in original, red in boom):', window.colors.blockByHP[1]);
            console.log('  - HP 5 color (should be orange in original, crimson in boom):', window.colors.blockByHP[5]);
        }, 1000);
    }
    
    // Force create boom button when in boom mode
    function ensureBoomButton() {
        if (window.currentGameMode?.id !== 'ballGoBoom') return;
        
        let boomBtn = document.getElementById('ballGoBoomBtn');
        if (boomBtn) return; // Already exists
        
        const controls = document.querySelector('.game-controls');
        if (!controls) return;
        
        console.log('💣 Creating Ball Go Boom button...');
        
        boomBtn = document.createElement('button');
        boomBtn.id = 'ballGoBoomBtn';
        boomBtn.innerHTML = '💣 BALL GO BOOM! 💥';
        boomBtn.style.cssText = `
            display: none;
            width: 100%;
            padding: 20px;
            margin-top: 20px;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: #1a1a2e;
            border: 3px solid #ff4500;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            animation: pulse 2s infinite;
            box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
            transition: all 0.3s;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
        `;
        
        // Add click handler
        boomBtn.addEventListener('click', function() {
            console.log('💥 BOOM BUTTON CLICKED!');
            if (window.triggerBallExplosion) {
                window.triggerBallExplosion();
            }
        });
        
        controls.appendChild(boomBtn);
        console.log('💣 Boom button created');
    }
    
    // Monitor mode changes and button visibility
    function monitorGameState() {
        if (window.currentGameMode?.id === 'ballGoBoom') {
            // Ensure boom button exists
            ensureBoomButton();
            
            // Show/hide boom button based on game state
            const boomBtn = document.getElementById('ballGoBoomBtn');
            if (boomBtn && window.balls && window.gameState) {
                const ballCount = window.balls.length;
                const isPlaying = window.gameState === 'playing';
                
                if (ballCount === 1 && isPlaying) {
                    boomBtn.style.display = 'block';
                } else {
                    boomBtn.style.display = 'none';
                }
            }
        }
    }
    
    // Start monitoring
    function startMonitoring() {
        console.log('🔥 Starting game state monitoring...');
        
        // Monitor every 100ms
        setInterval(monitorGameState, 100);
        
        // Also hook into game loop if it exists
        const checkForGameLoop = setInterval(() => {
            if (window.gameLoop) {
                const originalGameLoop = window.gameLoop;
                
                window.gameLoop = function() {
                    monitorGameState();
                    return originalGameLoop.call(this);
                };
                
                clearInterval(checkForGameLoop);
                console.log('✅ Game loop hooked for monitoring');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkForGameLoop), 10000);
    }
    
    // Debug functions
    window.testBoomColors = function() {
        console.log('🔥 BOOM COLORS TEST');
        console.log('  - Colors intercepted:', colorsIntercepted);
        console.log('  - Current mode:', window.currentGameMode?.id);
        console.log('  - Colors object exists:', !!window.colors);
        
        if (window.colors?.blockByHP) {
            console.log('  - HP 1 color:', window.colors.blockByHP[1]);
            console.log('  - HP 3 color:', window.colors.blockByHP[3]);
            console.log('  - HP 5 color:', window.colors.blockByHP[5]);
            console.log('  - Default color:', window.colors.blockByHP.default);
        }
        
        console.log('  - Boom button exists:', !!document.getElementById('ballGoBoomBtn'));
        console.log('  - Ball count:', window.balls?.length);
        console.log('  - Game state:', window.gameState);
    };
    
    // Initialize everything
    function initialize() {
        console.log('🔥 Initializing definitive boom colors system...');
        
        // Start watching for colors object
        watchForColors();
        
        // Start monitoring game state
        startMonitoring();
        
        console.log('✅ Definitive boom colors system initialized');
    }
    
    // Start immediately or when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    console.log('🔥 DEFINITIVE Ball Go Boom Colors system ready!');
    console.log('💡 Debug: testBoomColors()');
    
})();