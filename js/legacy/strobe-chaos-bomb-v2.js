// STROBE CHAOS BOMB IMPLEMENTATION V2
// Fixed detection logic for proper bomb block targeting
(function() {
    console.log('💣🌈 STROBE CHAOS BOMB V2 LOADING...');
    
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
        console.log(`💣 Strobe chaos V2 attempt ${attempts}/${maxAttempts}`);
        
        if (!window.gameLoop || !window.CanvasRenderingContext2D || !window.blocks) {
            if (attempts < maxAttempts) {
                setTimeout(attemptImplementation, 200);
            }
            return;
        }
        
        // Track current block being rendered
        let currentRenderingBlock = null;
        
        // Override the main rendering loop to intercept block rendering
        const originalGameLoop = window.gameLoop;
        
        window.gameLoop = function() {
            // Update strobe chaos animation
            updateStrobeChaosAnimation();
            
            // Call original game loop but intercept block rendering
            const result = originalGameLoop.call(this);
            
            // Post-process: Draw strobe chaos effects on exploder blocks
            if (window.blocks && window.ctx) {
                const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                
                window.blocks.forEach(block => {
                    if (!block.destroyed && block.isSpecial && block.specialType === 'exploder') {
                        // This is an exploder block - apply strobe chaos!
                        console.log(`💣 Rendering strobe chaos on exploder block at (${block.x}, ${block.y})`);
                        
                        // Clear the area first
                        window.ctx.save();
                        
                        // Apply shake offset
                        const shakeX = block.x + shakeOffset.x;
                        const shakeY = block.y + shakeOffset.y;
                        
                        // Get pulse effect (same as original game)
                        const time = Date.now() * 0.002 + block.x * 0.01;
                        const pulseEffect = Math.sin(time * 2) * 0.1 + 1; // Special blocks pulse more
                        const pulsedWidth = block.width * pulseEffect;
                        const pulsedHeight = block.height * pulseEffect;
                        const offsetX = (block.width - pulsedWidth) / 2;
                        const offsetY = (block.height - pulsedHeight) / 2;
                        
                        // Draw strobe chaos background
                        const strobeColor = getStrobeChaosColor();
                        
                        // Create rainbow gradient
                        const gradient = window.ctx.createLinearGradient(
                            shakeX + offsetX, 
                            shakeY + offsetY, 
                            shakeX + offsetX + pulsedWidth, 
                            shakeY + offsetY + pulsedHeight
                        );
                        
                        // Add rainbow stops
                        STROBE_CHAOS_COLORS.forEach((color, index) => {
                            gradient.addColorStop(index / (STROBE_CHAOS_COLORS.length - 1), color);
                        });
                        
                        // Add glow effect
                        window.ctx.shadowColor = strobeColor;
                        window.ctx.shadowBlur = 25;
                        
                        // Draw the strobe chaos block
                        window.ctx.fillStyle = gradient;
                        window.ctx.fillRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
                        
                        // Add bright border
                        window.ctx.strokeStyle = strobeColor;
                        window.ctx.lineWidth = 3;
                        window.ctx.strokeRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
                        
                        // Reset shadow
                        window.ctx.shadowBlur = 0;
                        
                        // Add bomb icon
                        window.ctx.font = `${Math.min(pulsedWidth, pulsedHeight) * 0.6}px Arial`;
                        window.ctx.textAlign = 'center';
                        window.ctx.textBaseline = 'middle';
                        
                        const iconX = shakeX + offsetX + pulsedWidth / 2;
                        const iconY = shakeY + offsetY + pulsedHeight / 2;
                        
                        // White outline for bomb icon
                        window.ctx.strokeStyle = '#ffffff';
                        window.ctx.lineWidth = 3;
                        window.ctx.strokeText('💣', iconX, iconY);
                        
                        // Black bomb icon
                        window.ctx.fillStyle = '#000000';
                        window.ctx.fillText('💣', iconX, iconY);
                        
                        window.ctx.restore();
                    }
                });
            }
            
            return result;
        };
        
        console.log('✅ STROBE CHAOS BOMB V2 IMPLEMENTATION COMPLETE!');
    }
    
    // Start implementation
    setTimeout(attemptImplementation, 100);
    
    // Debug function
    window.testStrobeChaosV2 = function() {
        console.log('💣🌈 STROBE CHAOS V2 TEST');
        console.log('  Current mode:', window.currentGameMode?.id);
        console.log('  Animation frame:', strobeAnimationFrame);
        console.log('  Current strobe color:', getStrobeChaosColor());
        console.log('  Shake offset:', shakeOffset);
        
        if (window.blocks) {
            const exploderBlocks = window.blocks.filter(b => !b.destroyed && b.isSpecial && b.specialType === 'exploder');
            console.log('  Exploder blocks found:', exploderBlocks.length);
            exploderBlocks.forEach((block, i) => {
                console.log(`    Block ${i}: (${block.x}, ${block.y}) HP:${block.hitPoints}`);
            });
        }
    };
    
    console.log('💣🌈 STROBE CHAOS BOMB V2 READY!');
    console.log('💡 Use testStrobeChaosV2() to check status');
    
})();