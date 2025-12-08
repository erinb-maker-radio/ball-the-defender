// Ball Go Boom Features - Colors and Button Fix
(function() {
    console.log('💣 Ball Go Boom Features Loading...');
    
    // Ball Go Boom color scheme for blocks - VOLCANIC/EXPLOSIVE THEME
    const ballGoBoomBlockColors = {
        blockByHP: {
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
            // Higher values - ultra-heated theme
            default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' } // Indigo - Blue Flame (hottest)
        },
        // Special block types for Ball Go Boom
        special: {
            spawner: { base: '#FFD700', glow: '#FFFFFF', shadow: '#FFA500' }, // Blazing Gold
            exploder: { base: '#FF0000', glow: '#FFFF00', shadow: '#990000' }  // Red-Hot Explosive
        }
    };
    
    // Apply Ball Go Boom block colors
    function applyBallGoBoomColors() {
        if (window.currentGameMode && window.currentGameMode.id === 'ballGoBoom') {
            console.log('💣 Applying Ball Go Boom block colors...');
            
            if (window.colors && window.colors.blockByHP && window.colors.special) {
                // Override block colors completely
                Object.assign(window.colors.blockByHP, ballGoBoomBlockColors.blockByHP);
                Object.assign(window.colors.special, ballGoBoomBlockColors.special);
                
                console.log('✅ Ball Go Boom VOLCANIC colors applied!');
                console.log('🔥 Block colors now:', Object.keys(window.colors.blockByHP).length, 'HP levels');
                
                return true; // Success
            } else {
                console.warn('💣 window.colors not ready yet, will retry...');
                // Retry after a short delay
                setTimeout(applyBallGoBoomColors, 100);
                return false; // Not ready yet
            }
        }
        return false;
    }
    
    // Force apply colors immediately when mode is detected
    function forceApplyBoomColors() {
        console.log('🔥 FORCE applying Ball Go Boom colors...');
        
        // Wait for colors object to exist
        let attempts = 0;
        const maxAttempts = 50;
        
        const forceInterval = setInterval(() => {
            attempts++;
            
            if (applyBallGoBoomColors()) {
                clearInterval(forceInterval);
                console.log('🔥 SUCCESS: Volcanic colors force-applied!');
            } else if (attempts >= maxAttempts) {
                clearInterval(forceInterval);
                console.error('🔥 FAILED: Could not apply colors after', maxAttempts, 'attempts');
            }
        }, 50);
    }
    
    // Create and manage Ball Go Boom button
    function createBallGoBoomButton() {
        console.log('💣 Creating Ball Go Boom button...');
        
        const controls = document.querySelector('.game-controls');
        if (!controls) {
            console.warn('💣 Game controls not found, retrying...');
            setTimeout(createBallGoBoomButton, 500);
            return;
        }
        
        // Remove existing button if any
        const existingBtn = document.getElementById('ballGoBoomBtn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        // Create new button
        const boomBtn = document.createElement('button');
        boomBtn.id = 'ballGoBoomBtn';
        boomBtn.innerHTML = '💣 BALL GO BOOM! 💥';
        boomBtn.style.cssText = `
            display: none;
            width: 100%;
            padding: 20px;
            margin-top: 20px;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: #1a1a2e;
            border: none;
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
        
        controls.appendChild(boomBtn);
        
        // Add event listener
        boomBtn.addEventListener('click', triggerBallExplosion);
        
        console.log('✅ Ball Go Boom button created and added');
        return boomBtn;
    }
    
    // Check if Ball Go Boom button should be shown - IMPROVED VERSION
    function checkBallGoBoomButton() {
        // Only check if in Ball Go Boom mode
        if (!window.currentGameMode || window.currentGameMode.id !== 'ballGoBoom') {
            return;
        }
        
        // Only check during gameplay
        if (!window.gameState || window.gameState !== 'playing') {
            return;
        }
        
        // Get or create button
        let boomBtn = document.getElementById('ballGoBoomBtn');
        if (!boomBtn) {
            boomBtn = createBallGoBoomButton();
        }
        
        if (!boomBtn) return;
        
        // Check ball count
        const ballCount = window.balls ? window.balls.length : 0;
        console.log(`💣 Checking button: balls=${ballCount}, gameState=${window.gameState}, mode=${window.currentGameMode.id}`);
        
        if (ballCount === 1) {
            boomBtn.style.display = 'block';
            window.ballGoBoomState = window.ballGoBoomState || {};
            window.ballGoBoomState.explosionReady = true;
            console.log('💣 Ball Go Boom button SHOWN - 1 ball remaining');
        } else {
            boomBtn.style.display = 'none';
            if (window.ballGoBoomState) {
                window.ballGoBoomState.explosionReady = false;
            }
        }
    }
    
    // Trigger ball explosion
    function triggerBallExplosion() {
        console.log('💥 Ball Go Boom button clicked!');
        
        if (!window.ballGoBoomState || !window.ballGoBoomState.explosionReady) {
            console.warn('💣 Explosion not ready');
            return;
        }
        
        if (!window.balls || window.balls.length !== 1) {
            console.warn('💣 Wrong number of balls:', window.balls?.length);
            return;
        }
        
        const ball = window.balls[0];
        if (!ball) {
            console.warn('💣 No ball found');
            return;
        }
        
        console.log('💥 BALL GO BOOM! Starting explosion sequence...');
        
        const boomBtn = document.getElementById('ballGoBoomBtn');
        if (boomBtn) {
            boomBtn.disabled = true;
            // boomBtn.style.animation = 'flash 0.1s infinite'; /* Disabled - too aggressive */
            boomBtn.textContent = 'EXPLODING...';
        }
        
        // Initialize Ball Go Boom state
        window.ballGoBoomState = window.ballGoBoomState || {
            explosionPower: 150,
            explosionRadius: 200
        };
        
        // Start flashing animation
        let flashCount = 0;
        const maxFlashes = 20; // 2 seconds at 100ms intervals
        
        const flashInterval = setInterval(() => {
            flashCount++;
            
            // Make ball flash
            if (ball) {
                ball.isFlashing = !ball.isFlashing;
                ball.flashColor = `hsl(${Math.random() * 60}, 100%, 50%)`; // Yellow to red
            }
            
            // Speed up flashing
            if (flashCount >= maxFlashes) {
                clearInterval(flashInterval);
                explodeBall(ball);
            }
        }, 300); // Reduced from 100ms to 300ms - much less aggressive
    }
    
    // Explode the ball
    function explodeBall(ball) {
        if (!ball) return;
        
        console.log('💥 KA-BLOOEY! Ball exploding at:', ball.x, ball.y);
        
        // Visual explosion effect
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const explosion = document.createElement('div');
            explosion.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,0,1) 0%, rgba(255,165,0,1) 30%, rgba(255,0,0,0.8) 60%, rgba(255,0,0,0) 100%);
                pointer-events: none;
                animation: explode 0.5s ease-out forwards;
                z-index: 9999;
                width: 20px;
                height: 20px;
            `;
            
            const rect = canvas.getBoundingClientRect();
            explosion.style.left = (ball.x - 10 + rect.left) + 'px';
            explosion.style.top = (ball.y - 10 + rect.top) + 'px';
            
            // Add explosion keyframes if not already added
            if (!document.getElementById('explosionStyles')) {
                const style = document.createElement('style');
                style.id = 'explosionStyles';
                style.textContent = `
                    @keyframes explode {
                        0% { width: 20px; height: 20px; opacity: 1; }
                        100% { width: 400px; height: 400px; opacity: 0; margin-left: -190px; margin-top: -190px; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(explosion);
            
            setTimeout(() => {
                if (document.body.contains(explosion)) {
                    document.body.removeChild(explosion);
                }
            }, 500);
        }
        
        // Apply explosion physics
        if (window.blocks) {
            let blocksDestroyed = 0;
            let blocksPushed = 0;
            
            window.blocks.forEach(block => {
                if (block.destroyed) return;
                
                const dx = (block.x + block.width/2) - ball.x;
                const dy = (block.y + block.height/2) - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < (window.ballGoBoomState.explosionRadius || 200)) {
                    const force = (1 - distance / (window.ballGoBoomState.explosionRadius || 200)) * (window.ballGoBoomState.explosionPower || 150);
                    
                    if (distance < 50) {
                        // Destroy close blocks
                        block.destroyed = true;
                        blocksDestroyed++;
                        
                        if (window.score !== undefined && window.updateScore) {
                            window.score += block.points || 10;
                            window.updateScore(window.score);
                        }
                    } else {
                        // Push blocks away
                        block.vx = (dx / distance) * force * 0.1;
                        block.vy = (dy / distance) * force * 0.1;
                        block.isMoving = true;
                        blocksPushed++;
                    }
                }
            });
            
            console.log(`💥 Explosion results: ${blocksDestroyed} blocks destroyed, ${blocksPushed} blocks pushed`);
        }
        
        // Play explosion sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.type = 'sawtooth';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.warn('Could not play explosion sound:', e);
        }
        
        // Remove the ball
        const ballIndex = window.balls.indexOf(ball);
        if (ballIndex > -1) {
            window.balls.splice(ballIndex, 1);
            console.log('💥 Ball removed from game');
        }
        
        // Reset button
        const boomBtn = document.getElementById('ballGoBoomBtn');
        if (boomBtn) {
            boomBtn.disabled = false;
            boomBtn.style.animation = '';
            boomBtn.innerHTML = '💣 BALL GO BOOM! 💥';
            boomBtn.style.display = 'none';
        }
        
        // Allow player to shoot again
        if (window.canShoot !== undefined) {
            window.canShoot = true;
        }
        
        // Reset ball go boom state
        if (window.ballGoBoomState) {
            window.ballGoBoomState.explosionReady = false;
        }
        
        console.log('✅ Explosion complete! Player can shoot again.');
    }
    
    // Hook into game loop for button checking and moving blocks
    function hookGameLoop() {
        console.log('💣 Hooking into game loop...');
        
        const checkInterval = setInterval(() => {
            if (window.gameLoop) {
                const originalGameLoop = window.gameLoop;
                
                window.gameLoop = function() {
                    // Apply colors if in Ball Go Boom mode (but not every frame)
                    if (window.currentGameMode && window.currentGameMode.id === 'ballGoBoom') {
                        // Only apply colors occasionally, not every frame
                        if (Math.random() < 0.01) { // 1% chance per frame
                            applyBallGoBoomColors();
                        }
                        
                        // Check button visibility
                        checkBallGoBoomButton();
                        
                        // Update moving blocks
                        if (window.blocks) {
                            window.blocks.forEach(block => {
                                if (block.isMoving && !block.destroyed) {
                                    if (block.vx) {
                                        block.x += block.vx;
                                        block.vx *= 0.95;
                                        if (Math.abs(block.vx) < 0.1) block.vx = 0;
                                    }
                                    if (block.vy) {
                                        block.y += block.vy;
                                        block.vy *= 0.95;
                                        if (Math.abs(block.vy) < 0.1) block.vy = 0;
                                    }
                                    
                                    if (!block.vx && !block.vy) {
                                        block.isMoving = false;
                                    }
                                    
                                    // Keep blocks on screen
                                    if (block.x < 0) { block.x = 0; block.vx = 0; }
                                    if (block.x + block.width > (window.canvas?.width || 800)) {
                                        block.x = (window.canvas?.width || 800) - block.width;
                                        block.vx = 0;
                                    }
                                    if (block.y < 0) { block.y = 0; block.vy = 0; }
                                }
                            });
                        }
                    }
                    
                    return originalGameLoop.call(this);
                };
                
                clearInterval(checkInterval);
                console.log('✅ Game loop hooked successfully');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Hook into mode changes
    function hookModeChanges() {
        console.log('💣 Setting up mode change hooks...');
        
        // Watch for mode changes via main menu - but less aggressively
        let lastModeCheck = null;
        const observer = new MutationObserver(() => {
            const currentMode = window.currentGameMode?.id;
            if (currentMode !== lastModeCheck && currentMode === 'ballGoBoom') {
                console.log('💣 Ball Go Boom mode detected via DOM change');
                lastModeCheck = currentMode;
                
                // FORCE apply colors immediately
                setTimeout(() => {
                    forceApplyBoomColors();
                }, 500);
                
                // Ensure button exists
                setTimeout(() => {
                    if (!document.getElementById('ballGoBoomBtn')) {
                        createBallGoBoomButton();
                    }
                }, 1500);
            } else if (currentMode !== 'ballGoBoom') {
                lastModeCheck = currentMode;
            }
        });
        
        observer.observe(document.body, { childList: true });
        
        console.log('✅ Mode change hooks installed');
    }
    
    // Expose functions globally for debugging
    window.checkBallGoBoomButton = checkBallGoBoomButton;
    window.triggerBallExplosion = triggerBallExplosion;
    window.applyBallGoBoomColors = applyBallGoBoomColors;
    window.forceApplyBoomColors = forceApplyBoomColors;
    
    // Debug function to check colors
    window.debugBoomColors = function() {
        console.log('🔥 DEBUG: Ball Go Boom Colors Check');
        console.log('  - Current mode:', window.currentGameMode?.id);
        console.log('  - Colors object exists:', !!window.colors);
        console.log('  - BlockByHP exists:', !!window.colors?.blockByHP);
        console.log('  - Special exists:', !!window.colors?.special);
        
        if (window.colors?.blockByHP) {
            console.log('  - Current HP 1 color:', window.colors.blockByHP[1]);
            console.log('  - Current HP 5 color:', window.colors.blockByHP[5]);
        }
        
        if (window.currentGameMode?.id === 'ballGoBoom') {
            console.log('🔥 Forcing color application...');
            forceApplyBoomColors();
        }
    };
    
    // Initialize
    function initialize() {
        console.log('💣 Initializing Ball Go Boom Features...');
        
        hookGameLoop();
        hookModeChanges();
        
        // Try to create button and apply colors if we're already in Ball Go Boom mode
        setTimeout(() => {
            if (window.currentGameMode && window.currentGameMode.id === 'ballGoBoom') {
                console.log('🔥 Ball Go Boom mode already active - applying colors...');
                forceApplyBoomColors();
                createBallGoBoomButton();
            }
        }, 1000);
        
        console.log('💣 Ball Go Boom Features initialized');
    }
    
    // Start after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 1000);
        });
    } else {
        setTimeout(initialize, 1000);
    }
    
    console.log('💣 Ball Go Boom Features ready');
    console.log('🔥 VOLCANIC fire-themed block colors and explosion mechanics loaded!');
    console.log('💡 Debug: debugBoomColors() - Check/force apply colors');
    
})();