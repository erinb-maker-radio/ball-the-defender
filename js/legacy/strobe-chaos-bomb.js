// STROBE CHAOS BOMB IMPLEMENTATION
// Implements the selected strobe chaos design for bomb blocks
(function() {
    console.log('💣🌈 STROBE CHAOS BOMB LOADING...');
    
    // Strobe chaos colors (horizontal rainbow stripes)
    const STROBE_CHAOS_COLORS = [
        '#ff1744', // Red
        '#d500f9', // Purple
        '#3d5afe', // Blue
        '#00bcd4', // Cyan
        '#4caf50', // Green
        '#ffeb3b', // Yellow
        '#ff5722'  // Orange
    ];
    
    let strobeAnimationFrame = 0;
    let shakeOffset = { x: 0, y: 0 };
    
    // Animation timing
    const STROBE_SPEED = 60; // frames for full cycle
    const SHAKE_SPEED = 24; // frames for shake cycle
    
    function getStrobeChaosColor() {
        // Create moving rainbow stripes
        const colorIndex = Math.floor(strobeAnimationFrame / 8) % STROBE_CHAOS_COLORS.length;
        const nextColorIndex = (colorIndex + 1) % STROBE_CHAOS_COLORS.length;
        
        // Simple color cycling for now
        return STROBE_CHAOS_COLORS[colorIndex];
    }
    
    function updateStrobeChaosAnimation() {
        strobeAnimationFrame = (strobeAnimationFrame + 1) % STROBE_SPEED;
        
        // Gentle shake animation
        const shakePhase = (strobeAnimationFrame % SHAKE_SPEED) / SHAKE_SPEED * Math.PI * 2;
        shakeOffset.x = Math.sin(shakePhase) * 1.5;
        shakeOffset.y = Math.sin(shakePhase * 1.3) * 0.8;
    }
    
    // Wait for game to be ready
    let attempts = 0;
    const maxAttempts = 50;
    
    function attemptImplementation() {
        attempts++;
        console.log(`💣 Strobe chaos attempt ${attempts}/${maxAttempts}`);
        
        if (!window.gameLoop || !window.CanvasRenderingContext2D) {
            if (attempts < maxAttempts) {
                setTimeout(attemptImplementation, 200);
            }
            return;
        }
        
        // Override the canvas fillRect method to add strobe chaos effect for bomb blocks
        const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;
        const originalFillStyle = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
        
        // Track when we're rendering a bomb block
        let isRenderingBombBlock = false;
        let bombBlockInfo = null;
        
        // Monitor fillStyle changes to detect bomb blocks
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
            get: function() {
                return originalFillStyle.get.call(this);
            },
            set: function(value) {
                const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                const isOriginalMode = !window.currentGameMode || window.currentGameMode.id === 'original';
                
                let isBombBlock = false;
                
                // Check for bomb block colors in both modes
                if (typeof value === 'string') {
                    // Ball Go Boom mode: Magenta bomb blocks
                    if (isBoomMode && (value.includes('#FF00FF') || value.includes('#ff00ff') || 
                        value.includes('255, 0, 255') || value.includes('magenta'))) {
                        isBombBlock = true;
                    }
                    
                    // Original mode: Yellow exploder blocks (from special colors)
                    if (isOriginalMode && (value.includes('#FFFF00') || value.includes('#ffff00') || 
                        value.includes('255, 255, 0') || value.includes('yellow') ||
                        value.includes('#FFD700') || value.includes('#ffd700'))) {
                        // Additional check: only for blocks that are likely special exploder blocks
                        // We can detect this by checking if it's in the special rendering context
                        isBombBlock = true;
                    }
                }
                
                if (isBombBlock) {
                    // This is a bomb block! Switch to strobe chaos
                    isRenderingBombBlock = true;
                    const strobeColor = getStrobeChaosColor();
                    console.log(`💣 Applying strobe chaos color: ${strobeColor} (${isBoomMode ? 'Boom' : 'Original'} mode)`);
                    originalFillStyle.set.call(this, strobeColor);
                } else {
                    isRenderingBombBlock = false;
                    originalFillStyle.set.call(this, value);
                }
            }
        });
        
        // Override fillRect to add shake effect and bomb icon
        CanvasRenderingContext2D.prototype.fillRect = function(x, y, width, height) {
            if (isRenderingBombBlock) {
                // Apply shake offset
                const shakeX = x + shakeOffset.x;
                const shakeY = y + shakeOffset.y;
                
                // Store bomb block info for icon rendering
                bombBlockInfo = {
                    x: shakeX + width / 2,
                    y: shakeY + height / 2,
                    width: width,
                    height: height
                };
                
                // Add glow effect
                this.save();
                this.shadowColor = getStrobeChaosColor();
                this.shadowBlur = 25;
                
                originalFillRect.call(this, shakeX, shakeY, width, height);
                
                this.restore();
                
                // Add bomb icon
                this.save();
                this.font = `${Math.min(width, height) * 0.6}px Arial`;
                this.textAlign = 'center';
                this.textBaseline = 'middle';
                
                // White outline for bomb icon
                this.strokeStyle = '#ffffff';
                this.lineWidth = 3;
                this.strokeText('💣', bombBlockInfo.x, bombBlockInfo.y);
                
                // Black bomb icon
                this.fillStyle = '#000000';
                this.fillText('💣', bombBlockInfo.x, bombBlockInfo.y);
                
                this.restore();
            } else {
                originalFillRect.call(this, x, y, width, height);
            }
        };
        
        // Hook into the game loop to update animations
        if (window.gameLoop) {
            const originalGameLoop = window.gameLoop;
            
            window.gameLoop = function() {
                // Update strobe chaos animation
                updateStrobeChaosAnimation();
                
                // Call original game loop
                return originalGameLoop.call(this);
            };
            
            console.log('✅ Strobe chaos bomb animation hooked into game loop!');
        }
        
        console.log('✅ STROBE CHAOS BOMB IMPLEMENTATION COMPLETE!');
    }
    
    // Start implementation
    setTimeout(attemptImplementation, 100);
    
    // Debug function
    window.testStrobeChaos = function() {
        console.log('💣🌈 STROBE CHAOS TEST');
        console.log('  Current mode:', window.currentGameMode?.id);
        console.log('  Animation frame:', strobeAnimationFrame);
        console.log('  Current strobe color:', getStrobeChaosColor());
        console.log('  Shake offset:', shakeOffset);
    };
    
    console.log('💣🌈 STROBE CHAOS BOMB READY!');
    console.log('💡 Use testStrobeChaos() to check status');
    
})();