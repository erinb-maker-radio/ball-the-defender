// STROBE CHAOS BOMB IMPLEMENTATION V3
// Direct game loop patching for accurate block targeting
(function() {
    console.log('💣🌈 STROBE CHAOS BOMB V3 LOADING...');
    
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
    
    function getStrobeChaosGradient(ctx, x, y, width, height) {
        // Create moving rainbow gradient
        const colorOffset = Math.floor(strobeAnimationFrame / 8) % STROBE_CHAOS_COLORS.length;
        
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        
        // Add rainbow stops with offset
        for (let i = 0; i < STROBE_CHAOS_COLORS.length; i++) {
            const colorIndex = (i + colorOffset) % STROBE_CHAOS_COLORS.length;
            gradient.addColorStop(i / (STROBE_CHAOS_COLORS.length - 1), STROBE_CHAOS_COLORS[colorIndex]);
        }
        
        return gradient;
    }
    
    function getCurrentStrobeColor() {
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
        console.log(`💣 Strobe chaos V3 attempt ${attempts}/${maxAttempts}`);
        
        if (!window.gameLoop || !window.CanvasRenderingContext2D || !window.blocks || !window.ctx) {
            if (attempts < maxAttempts) {
                setTimeout(attemptImplementation, 200);
            }
            return;
        }
        
        // Find the game.js source to get exact rendering code
        const originalGameLoop = window.gameLoop;
        const gameLoopString = originalGameLoop.toString();
        
        console.log('🔍 Analyzing game loop for block rendering...');
        
        // Check if we can find the block rendering section
        const blockRenderMatch = gameLoopString.includes('blocks.forEach(block =>');
        
        if (!blockRenderMatch) {
            console.log('❌ Could not find block rendering in game loop');
            if (attempts < maxAttempts) {
                setTimeout(attemptImplementation, 300);
                return;
            }
        }
        
        // Completely replace the gameLoop to add strobe chaos rendering
        window.gameLoop = function() {
            // Update strobe chaos animation first
            updateStrobeChaosAnimation();
            
            // Call original game loop first
            const result = originalGameLoop.call(this);
            
            // Then draw strobe chaos overlays on exploder blocks
            if (window.blocks && window.ctx) {
                window.blocks.forEach(block => {
                    if (!block.destroyed && block.isSpecial && block.specialType === 'exploder') {
                        console.log(`💣 STROBE CHAOS: Rendering exploder at (${block.x}, ${block.y})`);
                        
                        // Save context state
                        window.ctx.save();
                        
                        // Apply shake offset
                        const shakeX = block.x + shakeOffset.x;
                        const shakeY = block.y + shakeOffset.y;
                        
                        // Get pulse effect (copied from original game logic)
                        const time = Date.now() * 0.002 + block.x * 0.01;
                        const pulseEffect = Math.sin(time * 2) * 0.1 + 1; // Special blocks pulse more
                        const pulsedWidth = block.width * pulseEffect;
                        const pulsedHeight = block.height * pulseEffect;
                        const offsetX = (block.width - pulsedWidth) / 2;
                        const offsetY = (block.height - pulsedHeight) / 2;
                        
                        // Create strobe chaos gradient
                        const strobeGradient = getStrobeChaosGradient(
                            window.ctx,
                            shakeX + offsetX,
                            shakeY + offsetY,
                            pulsedWidth,
                            pulsedHeight
                        );
                        
                        // Add glow effect
                        const currentColor = getCurrentStrobeColor();
                        window.ctx.shadowColor = currentColor;
                        window.ctx.shadowBlur = 30;
                        
                        // Draw strobe chaos background
                        window.ctx.fillStyle = strobeGradient;
                        window.ctx.fillRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
                        
                        // Add bright border
                        window.ctx.strokeStyle = currentColor;
                        window.ctx.lineWidth = 3;
                        window.ctx.strokeRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
                        
                        // Clear shadow for icon
                        window.ctx.shadowBlur = 0;
                        
                        // Draw bomb icon
                        const iconSize = Math.min(pulsedWidth, pulsedHeight) * 0.6;
                        window.ctx.font = `${iconSize}px Arial`;
                        window.ctx.textAlign = 'center';
                        window.ctx.textBaseline = 'middle';
                        
                        const iconX = shakeX + offsetX + pulsedWidth / 2;
                        const iconY = shakeY + offsetY + pulsedHeight / 2;
                        
                        // White outline for bomb icon
                        window.ctx.strokeStyle = '#ffffff';
                        window.ctx.lineWidth = 3;
                        window.ctx.strokeText('💣', iconX, iconY);
                        
                        // Black bomb icon center
                        window.ctx.fillStyle = '#000000';
                        window.ctx.fillText('💣', iconX, iconY);
                        
                        // Restore context
                        window.ctx.restore();
                    }
                });
            }
            
            return result;
        };
        
        console.log('✅ STROBE CHAOS BOMB V3 IMPLEMENTATION COMPLETE!');
        console.log('🎯 Targeting exploder blocks with direct game loop override');
    }
    
    // Start implementation
    setTimeout(attemptImplementation, 100);
    
    // Debug function
    window.testStrobeChaosV3 = function() {
        console.log('💣🌈 STROBE CHAOS V3 TEST');
        console.log('  Current mode:', window.currentGameMode?.id);
        console.log('  Animation frame:', strobeAnimationFrame);
        console.log('  Current strobe color:', getCurrentStrobeColor());
        console.log('  Shake offset:', shakeOffset);
        
        if (window.blocks) {
            const allBlocks = window.blocks.filter(b => !b.destroyed);
            const exploderBlocks = allBlocks.filter(b => b.isSpecial && b.specialType === 'exploder');
            const spawnerBlocks = allBlocks.filter(b => b.isSpecial && b.specialType === 'spawner');
            
            console.log('  Total blocks:', allBlocks.length);
            console.log('  Exploder blocks found:', exploderBlocks.length);
            console.log('  Spawner blocks found:', spawnerBlocks.length);
            
            exploderBlocks.forEach((block, i) => {
                console.log(`    💣 Exploder ${i}: (${block.x}, ${block.y}) HP:${block.hitPoints} Special:${block.isSpecial}`);
            });
            
            if (exploderBlocks.length === 0) {
                console.log('  ⚠️ No exploder blocks found. They spawn randomly (2.5% chance)');
                console.log('  💡 Play a few levels to see exploder blocks appear');
            }
        }
    };
    
    // Auto-test when blocks are available
    let testAttempts = 0;
    function autoTest() {
        testAttempts++;
        if (window.blocks && testAttempts < 20) {
            const exploders = window.blocks.filter(b => !b.destroyed && b.isSpecial && b.specialType === 'exploder');
            if (exploders.length > 0) {
                console.log(`🎉 Found ${exploders.length} exploder blocks! Strobe chaos should be visible.`);
                return;
            }
        }
        
        if (testAttempts < 20) {
            setTimeout(autoTest, 2000);
        }
    }
    
    setTimeout(autoTest, 3000);
    
    console.log('💣🌈 STROBE CHAOS BOMB V3 READY!');
    console.log('💡 Use testStrobeChaosV3() to check status');
    console.log('🎮 Exploder blocks spawn randomly (2.5% chance) - play to see them!');
    
})();