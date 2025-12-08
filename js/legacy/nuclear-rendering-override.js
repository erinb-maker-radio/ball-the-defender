// NUCLEAR RENDERING OVERRIDE - Fix Ball Go Boom Colors at Rendering Level
(function() {
    console.log('🔥 NUCLEAR Rendering Override - Intercepting block rendering...');
    
    // Ball Go Boom volcanic colors
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
        default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' } // Indigo - Blue Flame
    };
    
    // Check if we're in Ball Go Boom mode
    function isBallGoBoomMode() {
        return window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
    }
    
    // Get the correct color for a block based on mode
    function getBlockColor(hp, isSpecial, specialType) {
        if (isSpecial && window.colors && window.colors.special) {
            return window.colors.special[specialType];
        }
        
        if (isBallGoBoomMode()) {
            // Return Ball Go Boom volcanic colors
            return BOOM_COLORS[hp] || BOOM_COLORS.default;
        } else {
            // Return original colors
            if (window.colors && window.colors.blockByHP) {
                return window.colors.blockByHP[hp] || window.colors.blockByHP.default;
            }
        }
        
        // Fallback to green if nothing else works
        return { base: '#4CAF50', glow: '#81C784', shadow: '#388E3C' };
    }
    
    // Override Canvas 2D Context methods to intercept color setting
    let originalCtx = null;
    let ctxOverridden = false;
    
    function overrideCanvasContext() {
        if (ctxOverridden) return;
        
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx || !ctx.createLinearGradient) return;
        
        console.log('🔥 Overriding Canvas 2D context methods...');
        
        // Store original methods
        const originalCreateLinearGradient = ctx.createLinearGradient;
        const originalFillRect = ctx.fillRect;
        const originalStrokeRect = ctx.strokeRect;
        
        // Track if we're currently rendering a block
        let renderingBlock = false;
        let currentBlockColor = null;
        
        // Override createLinearGradient to use our colors
        ctx.createLinearGradient = function(x0, y0, x1, y1) {
            const gradient = originalCreateLinearGradient.call(this, x0, y0, x1, y1);
            
            // If we're in Ball Go Boom mode and rendering a block, override the gradient
            if (isBallGoBoomMode() && renderingBlock && currentBlockColor) {
                const originalAddColorStop = gradient.addColorStop;
                
                gradient.addColorStop = function(offset, color) {
                    let newColor = color;
                    
                    // Replace gradient colors with Ball Go Boom colors
                    if (currentBlockColor) {
                        if (offset === 0) {
                            newColor = currentBlockColor.glow;
                        } else if (offset === 0.5) {
                            newColor = currentBlockColor.base;
                        } else if (offset === 1) {
                            newColor = currentBlockColor.shadow;
                        }
                    }
                    
                    return originalAddColorStop.call(this, offset, newColor);
                };
            }
            
            return gradient;
        };
        
        // Monitor fillRect calls to detect block rendering
        ctx.fillRect = function(x, y, width, height) {
            // Detect if this might be a block (reasonable size)
            if (width > 20 && width < 200 && height > 10 && height < 100) {
                renderingBlock = true;
                
                // Check if we're in Ball Go Boom mode and find the block being rendered
                if (isBallGoBoomMode() && window.blocks) {
                    const block = window.blocks.find(b => 
                        !b.destroyed && 
                        Math.abs(b.x - x) < 5 && 
                        Math.abs(b.y - y) < 5
                    );
                    
                    if (block) {
                        currentBlockColor = getBlockColor(block.hitPoints, block.isSpecial, block.specialType);
                        console.log(`🔥 Rendering block HP ${block.hitPoints} with color:`, currentBlockColor.base);
                    }
                }
            }
            
            const result = originalFillRect.call(this, x, y, width, height);
            
            // Reset after rendering
            setTimeout(() => {
                renderingBlock = false;
                currentBlockColor = null;
            }, 0);
            
            return result;
        };
        
        // Override strokeRect for block borders
        ctx.strokeRect = function(x, y, width, height) {
            if (isBallGoBoomMode() && renderingBlock && currentBlockColor) {
                // Force Ball Go Boom glow color for borders
                const originalStrokeStyle = this.strokeStyle;
                this.strokeStyle = currentBlockColor.glow;
                
                const result = originalStrokeRect.call(this, x, y, width, height);
                
                // Restore original stroke style
                this.strokeStyle = originalStrokeStyle;
                return result;
            }
            
            return originalStrokeRect.call(this, x, y, width, height);
        };
        
        ctxOverridden = true;
        console.log('✅ Canvas context overridden for Ball Go Boom colors');
    }
    
    // Alternative approach: Direct game.js function override
    function overrideGameFunctions() {
        console.log('🔥 Attempting to override game functions...');
        
        // Look for the gameLoop or rendering functions
        const checkForGameFunctions = setInterval(() => {
            if (window.gameLoop || window.drawBlocks || window.render) {
                console.log('🔥 Game functions found, attempting override...');
                
                // If there's a specific draw blocks function, override it
                if (window.drawBlocks) {
                    const originalDrawBlocks = window.drawBlocks;
                    
                    window.drawBlocks = function() {
                        // Store original colors temporarily
                        let originalColors = null;
                        
                        if (isBallGoBoomMode() && window.colors) {
                            console.log('🔥 Ball Go Boom mode detected - forcing volcanic colors');
                            originalColors = { ...window.colors.blockByHP };
                            
                            // Replace all colors with Ball Go Boom colors
                            for (let hp = 1; hp <= 10; hp++) {
                                if (BOOM_COLORS[hp]) {
                                    window.colors.blockByHP[hp] = BOOM_COLORS[hp];
                                }
                            }
                            window.colors.blockByHP.default = BOOM_COLORS.default;
                        }
                        
                        // Call original function
                        const result = originalDrawBlocks.call(this);
                        
                        // Restore original colors
                        if (originalColors) {
                            window.colors.blockByHP = originalColors;
                        }
                        
                        return result;
                    };
                    
                    console.log('✅ drawBlocks function overridden');
                    clearInterval(checkForGameFunctions);
                }
                
                // If there's a game loop, hook into it
                else if (window.gameLoop) {
                    const originalGameLoop = window.gameLoop;
                    
                    window.gameLoop = function() {
                        // Before each frame, ensure Ball Go Boom colors if in that mode
                        if (isBallGoBoomMode() && window.colors && window.colors.blockByHP) {
                            // Temporarily override colors for this frame
                            const originalColors = { ...window.colors.blockByHP };
                            
                            for (let hp = 1; hp <= 10; hp++) {
                                if (BOOM_COLORS[hp]) {
                                    window.colors.blockByHP[hp] = BOOM_COLORS[hp];
                                }
                            }
                            window.colors.blockByHP.default = BOOM_COLORS.default;
                            
                            // Call original game loop
                            const result = originalGameLoop.call(this);
                            
                            // Restore colors after rendering
                            setTimeout(() => {
                                window.colors.blockByHP = originalColors;
                            }, 0);
                            
                            return result;
                        }
                        
                        return originalGameLoop.call(this);
                    };
                    
                    console.log('✅ gameLoop function overridden');
                    clearInterval(checkForGameFunctions);
                }
            }
        }, 100);
        
        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkForGameFunctions), 10000);
    }
    
    // Create boom button when needed
    function ensureBoomButton() {
        if (!isBallGoBoomMode()) return;
        
        let boomBtn = document.getElementById('ballGoBoomBtn');
        if (boomBtn) return;
        
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
        
        boomBtn.addEventListener('click', function() {
            console.log('💥 BOOM BUTTON CLICKED!');
            if (window.triggerBallExplosion) {
                window.triggerBallExplosion();
            }
        });
        
        controls.appendChild(boomBtn);
        console.log('💣 Boom button created');
    }
    
    // Monitor game state for boom button
    function monitorGameState() {
        if (!isBallGoBoomMode()) return;
        
        ensureBoomButton();
        
        const boomBtn = document.getElementById('ballGoBoomBtn');
        if (boomBtn && window.balls && window.gameState) {
            const ballCount = window.balls.length;
            const isPlaying = window.gameState === 'playing';
            
            if (ballCount === 1 && isPlaying) {
                boomBtn.style.display = 'block';
                console.log('💣 Boom button shown - 1 ball remaining');
            } else {
                boomBtn.style.display = 'none';
            }
        }
    }
    
    // Debug function
    window.debugNuclearColors = function() {
        console.log('🔥 NUCLEAR COLORS DEBUG');
        console.log('  - Ball Go Boom mode:', isBallGoBoomMode());
        console.log('  - Current mode object:', window.currentGameMode);
        console.log('  - Canvas context overridden:', ctxOverridden);
        console.log('  - Colors object exists:', !!window.colors);
        
        if (window.colors?.blockByHP) {
            console.log('  - Current HP 1 color:', window.colors.blockByHP[1]);
            console.log('  - Ball Go Boom HP 1 color:', BOOM_COLORS[1]);
        }
        
        console.log('  - Boom button exists:', !!document.getElementById('ballGoBoomBtn'));
        console.log('  - Blocks array:', window.blocks?.length);
    };
    
    // Initialize everything
    function initialize() {
        console.log('🔥 Initializing Nuclear Rendering Override...');
        
        // Start monitoring immediately
        setInterval(() => {
            overrideCanvasContext();
            monitorGameState();
        }, 100);
        
        // Try to override game functions
        overrideGameFunctions();
        
        console.log('✅ Nuclear Rendering Override initialized');
    }
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    console.log('🔥 NUCLEAR Rendering Override ready!');
    console.log('💡 Debug: debugNuclearColors()');
    
})();