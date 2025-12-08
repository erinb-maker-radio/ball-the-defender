// Performance Optimization Patch for Ball Defender
// Reduces audio complexity and visual effects for better performance

(function() {
    console.log('⚡ Performance Optimization Loading...');
    
    // Detect if we need performance mode
    let performanceMode = false;
    let frameCount = 0;
    let lastFPSCheck = performance.now();
    
    function checkPerformance() {
        frameCount++;
        const now = performance.now();
        
        if (now - lastFPSCheck >= 2000) { // Check after 2 seconds
            const fps = frameCount / 2;
            console.log(`🔍 Detected FPS: ${fps.toFixed(1)}`);
            
            if (fps < 30) {
                performanceMode = true;
                console.log('⚡ Enabling performance mode - Low FPS detected');
                applyPerformanceOptimizations();
            }
            
            frameCount = 0;
            lastFPSCheck = now;
        }
        
        if (frameCount < 120) { // Monitor for first 2 seconds
            requestAnimationFrame(checkPerformance);
        }
    }
    
    function applyPerformanceOptimizations() {
        console.log('⚡ Applying performance optimizations...');
        
        // 1. Disable particle effects
        if (window.updateParticles) {
            window.updateParticles = function() {
                // Clear any existing particles
                if (window.particles) {
                    window.particles.length = 0;
                }
            };
            console.log('✅ Particles disabled');
        }
        
        // 2. Simplify background rendering
        if (window.drawAnimatedBackground) {
            const originalBg = window.drawAnimatedBackground;
            window.drawAnimatedBackground = function() {
                if (!window.ctx || !window.canvas) return;
                
                // Simple solid background instead of animated
                window.ctx.fillStyle = '#0a0a23';
                window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);
            };
            console.log('✅ Animated background simplified');
        }
        
        // 3. Reduce audio complexity
        if (window.audioEngine) {
            // Disable complex audio effects
            const originalPlayBallHit = window.audioEngine.playMelodicBallHit;
            if (originalPlayBallHit) {
                window.audioEngine.playMelodicBallHit = function(blockHP, activeBalls) {
                    // Simple audio only
                    try {
                        if (this.sampleLibrary && this.sampleLibrary.size > 0) {
                            const sampleNames = Array.from(this.sampleLibrary.keys());
                            const randomSample = sampleNames[Math.floor(Math.random() * Math.min(3, sampleNames.length))];
                            this.playSample(randomSample, 0.3); // Lower volume
                        }
                    } catch (e) {
                        // Silently fail
                    }
                };
                console.log('✅ Audio complexity reduced');
            }
            
            // Disable rhythm loops if they exist
            if (window.audioEngine.updateRhythmLoop) {
                window.audioEngine.updateRhythmLoop = function() {
                    // Disabled for performance
                };
                console.log('✅ Rhythm loops disabled');
            }
        }
        
        // 4. Reduce game loop frequency for better performance
        if (window.gameLoop) {
            const originalGameLoop = window.gameLoop;
            let lastFrame = 0;
            window.gameLoop = function() {
                const now = performance.now();
                
                // Limit to 30 FPS instead of 60
                if (now - lastFrame >= 33) { // 33ms = ~30 FPS
                    originalGameLoop.call(this);
                    lastFrame = now;
                } else {
                    requestAnimationFrame(window.gameLoop);
                }
            };
            console.log('✅ Game loop throttled to 30 FPS');
        }
        
        // 5. Disable mixing board animations
        const mixerElements = document.querySelectorAll('.mixer-channel input[type="range"]');
        mixerElements.forEach(slider => {
            slider.style.transition = 'none';
        });
        
        // 6. Reduce canvas quality on very slow systems
        if (window.canvas && window.ctx) {
            // Use lower quality scaling
            window.ctx.imageSmoothingEnabled = false;
            console.log('✅ Canvas quality reduced');
        }
        
        // 7. Fix ball speed for better responsiveness
        window.optimizeBallPhysics = function() {
            if (window.balls && Array.isArray(window.balls)) {
                window.balls.forEach(ball => {
                    // Ensure minimum speed to prevent sluggish movement
                    const currentSpeed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
                    if (currentSpeed > 0 && currentSpeed < 4) {
                        const multiplier = 4 / currentSpeed;
                        ball.speedX *= multiplier;
                        ball.speedY *= multiplier;
                    }
                });
            }
        };
        
        // 8. Optimize collision detection
        if (window.checkBlockCollision) {
            const originalCollision = window.checkBlockCollision;
            window.checkBlockCollision = function(ball, block) {
                // Simplified collision detection for performance
                const ballLeft = ball.x - ball.radius;
                const ballRight = ball.x + ball.radius;
                const ballTop = ball.y - ball.radius;
                const ballBottom = ball.y + ball.radius;
                
                return (ballRight > block.x && 
                        ballLeft < block.x + block.width && 
                        ballBottom > block.y && 
                        ballTop < block.y + block.height);
            };
            console.log('✅ Collision detection optimized');
        }
        
        // Show performance mode indicator
        const instructions = document.getElementById('instructions');
        if (instructions) {
            instructions.innerHTML = 'Click to start • Drag to aim • Release to shoot<br><strong style="color: #ff0;">PERFORMANCE MODE ACTIVE</strong>';
        }
        
        console.log('⚡ Performance optimizations applied');
    }
    
    // Manual performance mode trigger
    window.enablePerformanceMode = function() {
        console.log('⚡ Manually enabling performance mode');
        performanceMode = true;
        applyPerformanceOptimizations();
    };
    
    // Auto-enable performance mode for known slow systems
    const userAgent = navigator.userAgent.toLowerCase();
    const slowIndicators = ['wow64', 'windows nt 6.1', 'windows nt 6.0']; // Older Windows
    
    if (slowIndicators.some(indicator => userAgent.includes(indicator))) {
        console.log('⚡ Older system detected - enabling performance mode immediately');
        setTimeout(() => {
            performanceMode = true;
            applyPerformanceOptimizations();
        }, 1000);
    } else {
        // Start FPS monitoring for auto-detection
        setTimeout(checkPerformance, 500);
    }
    
    // Allow manual override via console
    console.log('💡 Type "enablePerformanceMode()" in console to manually optimize performance');
    
})();