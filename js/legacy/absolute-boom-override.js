// ABSOLUTE BOOM OVERRIDE - Replace rendering completely
(function() {
    console.log('🔥🔥🔥 ABSOLUTE BOOM OVERRIDE LOADING...');
    
    // Volcanic colors
    const VOLCANIC_COLORS = {
        1: { base: '#FF4500', glow: '#FF8C00', shadow: '#B22222' },
        2: { base: '#FF6600', glow: '#FFA500', shadow: '#CC3300' },
        3: { base: '#FFD700', glow: '#FFFF00', shadow: '#FF8800' },
        4: { base: '#FF0000', glow: '#FF4444', shadow: '#990000' },
        5: { base: '#DC143C', glow: '#FF1493', shadow: '#8B0000' },
        6: { base: '#FF69B4', glow: '#FF00FF', shadow: '#CC0066' },
        7: { base: '#8B0000', glow: '#FF4500', shadow: '#660000' },
        8: { base: '#B22222', glow: '#FF6347', shadow: '#800000' },
        9: { base: '#FF7F50', glow: '#FF6347', shadow: '#CD5C5C' },
        10: { base: '#FF8C00', glow: '#FFD700', shadow: '#FF6600' },
        default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' }
    };
    
    // Volcanic special blocks with DRAMATIC neon effects
    const VOLCANIC_SPECIAL = {
        spawner: { 
            base: '#00FFFF', glow: '#00FFFF', shadow: '#008B8B',  // Bright Cyan - Shield Generator
            name: 'MAGMA SHIELD GENERATOR'
        },
        exploder: { 
            base: '#FF00FF', glow: '#FF00FF', shadow: '#8B008B',  // Bright Magenta - Bomb
            name: 'PLASMA BOMB CORE'
        }
    };
    
    // Wait for everything to load
    let overrideAttempts = 0;
    const maxAttempts = 50;
    
    function attemptOverride() {
        overrideAttempts++;
        console.log(`🔥 Override attempt ${overrideAttempts}/${maxAttempts}`);
        
        // Check if we have what we need
        if (!window.gameLoop) {
            console.log('⏳ Waiting for gameLoop...');
            if (overrideAttempts < maxAttempts) {
                setTimeout(attemptOverride, 200);
            }
            return;
        }
        
        // Get the gameLoop function as a string
        let gameLoopString = window.gameLoop.toString();
        
        // Check if it already has our modifications
        if (!gameLoopString.includes('isBallGoBoomMode')) {
            console.log('❌ gameLoop does not contain our modifications!');
            console.log('🔧 Attempting to inject colors directly...');
            
            // Find the block rendering section
            const blockRenderingMatch = gameLoopString.match(/blocks\.forEach\(block => \{[\s\S]*?if \(!block\.destroyed\) \{[\s\S]*?\}\s*\}\);/g);
            
            if (blockRenderingMatch && blockRenderingMatch.length > 0) {
                console.log('✅ Found block rendering section');
                
                // Replace the gameLoop function entirely
                const originalGameLoop = window.gameLoop;
                
                window.gameLoop = function() {
                    // Store original colors if in Ball Go Boom mode
                    let originalColors = null;
                    const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                    
                    if (isBoomMode && window.colors && window.colors.blockByHP) {
                        console.log('🌋 FORCING VOLCANIC COLORS FOR THIS FRAME');
                        
                        // Backup original colors
                        originalColors = {
                            blockByHP: {},
                            special: {}
                        };
                        
                        // Backup block colors
                        for (let hp = 1; hp <= 10; hp++) {
                            if (window.colors.blockByHP[hp]) {
                                originalColors.blockByHP[hp] = { ...window.colors.blockByHP[hp] };
                            }
                        }
                        originalColors.blockByHP.default = { ...window.colors.blockByHP.default };
                        
                        // Backup special colors
                        if (window.colors.special) {
                            originalColors.special.spawner = { ...window.colors.special.spawner };
                            originalColors.special.exploder = { ...window.colors.special.exploder };
                        }
                        
                        // Replace with volcanic colors
                        for (let hp = 1; hp <= 10; hp++) {
                            window.colors.blockByHP[hp] = VOLCANIC_COLORS[hp] || VOLCANIC_COLORS.default;
                        }
                        window.colors.blockByHP.default = VOLCANIC_COLORS.default;
                        
                        // Replace special block colors with dramatic neon
                        if (window.colors.special) {
                            window.colors.special.spawner = VOLCANIC_SPECIAL.spawner;
                            window.colors.special.exploder = VOLCANIC_SPECIAL.exploder;
                        }
                    }
                    
                    // Call original game loop
                    const result = originalGameLoop.call(this);
                    
                    // Restore original colors
                    if (originalColors) {
                        // Restore block colors
                        for (let hp in originalColors.blockByHP) {
                            window.colors.blockByHP[hp] = originalColors.blockByHP[hp];
                        }
                        
                        // Restore special colors
                        if (originalColors.special && window.colors.special) {
                            window.colors.special.spawner = originalColors.special.spawner;
                            window.colors.special.exploder = originalColors.special.exploder;
                        }
                    }
                    
                    return result;
                };
                
                console.log('✅ gameLoop COMPLETELY REPLACED with volcanic color override!');
            }
        } else {
            console.log('✅ gameLoop already contains modifications');
            
            // Even if it has modifications, let's double-check the colors are being applied
            const originalGameLoop = window.gameLoop;
            
            window.gameLoop = function() {
                // Force colors before each frame if in Ball Go Boom mode
                const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                
                if (isBoomMode && window.colors && window.colors.blockByHP) {
                    // Temporarily replace colors
                    const tempColors = {};
                    for (let hp = 1; hp <= 10; hp++) {
                        tempColors[hp] = window.colors.blockByHP[hp];
                        window.colors.blockByHP[hp] = VOLCANIC_COLORS[hp] || VOLCANIC_COLORS.default;
                    }
                    tempColors.default = window.colors.blockByHP.default;
                    window.colors.blockByHP.default = VOLCANIC_COLORS.default;
                    
                    // Run game loop
                    const result = originalGameLoop.call(this);
                    
                    // Restore
                    for (let hp in tempColors) {
                        window.colors.blockByHP[hp] = tempColors[hp];
                    }
                    
                    return result;
                }
                
                return originalGameLoop.call(this);
            };
            
            console.log('✅ Added DOUBLE override to ensure volcanic colors!');
        }
        
        // Also override the colors object directly
        if (window.colors && window.colors.blockByHP) {
            const originalBlockByHP = window.colors.blockByHP;
            
            // Create a proxy that returns volcanic colors in boom mode
            window.colors.blockByHP = new Proxy(originalBlockByHP, {
                get: function(target, prop) {
                    const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                    
                    if (isBoomMode && VOLCANIC_COLORS[prop]) {
                        console.log(`🌋 Returning volcanic color for HP ${prop}`);
                        return VOLCANIC_COLORS[prop];
                    }
                    
                    return target[prop];
                }
            });
            
            console.log('✅ colors.blockByHP proxied for volcanic colors!');
        }
    }
    
    // Start override attempts
    setTimeout(attemptOverride, 500);
    
    // Debug function
    window.testVolcanicOverride = function() {
        console.log('🌋 VOLCANIC OVERRIDE TEST');
        console.log('  Current mode:', window.currentGameMode?.id);
        console.log('  Is Ball Go Boom:', window.currentGameMode?.id === 'ballGoBoom');
        
        if (window.colors?.blockByHP) {
            console.log('  HP 1 color:', window.colors.blockByHP[1]);
            console.log('  HP 5 color:', window.colors.blockByHP[5]);
        }
        
        console.log('  gameLoop modified:', window.gameLoop.toString().includes('VOLCANIC'));
    };
    
    console.log('🔥🔥🔥 ABSOLUTE BOOM OVERRIDE READY!');
    console.log('💡 Use testVolcanicOverride() to check status');
    
})();