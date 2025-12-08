// BALL DETONATOR SYSTEM - Ball Go Boom Exclusive Feature
// Strategic ball explosion mechanic with countdown and physics

(function() {
    console.log('💣 Ball Detonator System Loading...');
    
    // Detonator configuration
    const DETONATOR_CONFIG = {
        explosionRadius: 150,        // Pixel radius of explosion effect
        damageRadius: 120,           // Pixel radius for damage dealing
        shockwaveRadius: 180,        // Pixel radius for pushing blocks
        explosionDamage: 3,          // Damage dealt to blocks in radius
        shockwaveForce: 5,           // Pixels to push blocks
        countdownDuration: 3000,     // 3 seconds total
        flashInterval: 200,         // Ball flash rate during countdown
        screenShakeDuration: 500,    // Screen shake time
        screenShakeIntensity: 10     // Pixel shake amount
    };
    
    // Detonator state
    const detonatorState = {
        isActive: false,
        countdown: 0,
        targetBall: null,
        button: null,
        countdownInterval: null,
        flashInterval: null,
        originalBallColor: null
    };
    
    // Create the big red detonator button
    function createDetonatorButton() {
        // First, try to find the game-controls section
        let controlsSection = document.querySelector('.game-controls');
        
        // If not found, try the sidebar
        if (!controlsSection) {
            const sidebar = document.querySelector('.game-sidebar');
            if (sidebar) {
                console.log('⚠️ game-controls not found, adding to sidebar directly');
                controlsSection = sidebar;
            } else {
                console.error('❌ Could not find game-controls or sidebar');
                return null;
            }
        }
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'detonatorContainer';
        buttonContainer.style.cssText = `
            margin-top: 20px;
            margin-bottom: 20px;
            padding: 10px;
            display: none;
            position: relative;
            z-index: 100;
        `;
        
        // Create the button itself
        const button = document.createElement('div');
        button.id = 'detonatorButton';
        button.innerHTML = `
            <div class="detonator-body">
                <div class="detonator-countdown"></div>
                <div class="detonator-label">DETONATE</div>
                <div class="detonator-cover"></div>
            </div>
        `;
        
        button.style.cssText = `
            width: 100px;
            height: 100px;
            margin: 0 auto;
            cursor: pointer;
            user-select: none;
        `;
        
        // Inner button styling
        const style = document.createElement('style');
        style.textContent = `
            #detonatorButton .detonator-body {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, #ff4444, #cc0000);
                border-radius: 50%;
                border: 5px solid #800000;
                box-shadow: 
                    0 5px 20px rgba(255, 0, 0, 0.5),
                    inset 0 -5px 10px rgba(0, 0, 0, 0.3),
                    inset 0 5px 10px rgba(255, 255, 255, 0.3);
                position: relative;
                transition: transform 0.1s;
            }
            
            #detonatorButton:hover .detonator-body {
                transform: scale(1.05);
                box-shadow: 
                    0 5px 30px rgba(255, 0, 0, 0.8),
                    inset 0 -5px 10px rgba(0, 0, 0, 0.3),
                    inset 0 5px 10px rgba(255, 255, 255, 0.3);
            }
            
            #detonatorButton:active .detonator-body {
                transform: scale(0.95);
                box-shadow: 
                    0 2px 10px rgba(255, 0, 0, 0.5),
                    inset 0 -2px 5px rgba(0, 0, 0, 0.5),
                    inset 0 2px 5px rgba(255, 255, 255, 0.2);
            }
            
            #detonatorButton .detonator-countdown {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 48px;
                font-weight: bold;
                color: #ffffff;
                text-shadow: 
                    0 0 10px #ff0000,
                    0 0 20px #ff0000,
                    0 0 30px #ff0000;
                font-family: 'Courier New', monospace;
                z-index: 3;
                display: none;
            }
            
            #detonatorButton.priming .detonator-countdown {
                display: block;
                animation: pulse 0.5s infinite;
            }
            
            #detonatorButton .detonator-label {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ffffff;
                font-weight: bold;
                font-size: 14px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                font-family: 'Arial Black', sans-serif;
                z-index: 2;
            }
            
            #detonatorButton.priming .detonator-label {
                display: none;
            }
            
            #detonatorButton .detonator-cover {
                position: absolute;
                top: 10%;
                left: 10%;
                width: 80%;
                height: 80%;
                border-radius: 50%;
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.4) 0%, 
                    rgba(255, 255, 255, 0.1) 50%, 
                    transparent 50%);
                pointer-events: none;
            }
            
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.2); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
            
            #detonatorButton.disabled {
                opacity: 0.4;
                pointer-events: none;
                filter: grayscale(0.5);
            }
            
            #detonatorButton.disabled .detonator-label {
                font-size: 11px;
                opacity: 0.7;
            }
            
            #detonatorButton.disabled .detonator-body {
                background: radial-gradient(circle, #666666, #333333);
                border-color: #444444;
            }
        `;
        document.head.appendChild(style);
        
        // Add button to container
        buttonContainer.appendChild(button);
        
        // Insert into the DOM
        if (controlsSection.classList && controlsSection.classList.contains('game-controls')) {
            // Insert after game controls
            controlsSection.parentNode.insertBefore(buttonContainer, controlsSection.nextSibling);
        } else {
            // Just append to sidebar
            controlsSection.appendChild(buttonContainer);
        }
        
        // Store reference to container for visibility control
        button.container = buttonContainer;
        
        console.log('✅ Button inserted into DOM');
        
        return button;
    }
    
    // Check if detonation is allowed
    function canDetonate() {
        // Only in Ball Go Boom mode
        if (!window.currentGameMode || window.currentGameMode.id !== 'ballGoBoom') {
            return false;
        }
        
        // Only if game is playing (check multiple conditions)
        const isPlaying = window.gameState === 'playing' || 
                         window._gameState === 'playing' ||
                         (window.balls && window.balls.some(b => b && b.active));
        
        if (!isPlaying) {
            return false;
        }
        
        // Check balls array
        if (!window.balls || !Array.isArray(window.balls)) {
            return false;
        }
        
        // Only if there's exactly one active ball
        const activeBalls = window.balls.filter(b => b && b.active === true);
        
        if (activeBalls.length !== 1) {
            return false;
        }
        
        // Not during countdown
        if (detonatorState.isActive) {
            return false;
        }
        
        return true;
    }
    
    // Start detonation countdown
    function startDetonation() {
        if (!canDetonate()) return;
        
        const activeBalls = window.balls.filter(b => b.active);
        if (activeBalls.length !== 1) return;
        
        detonatorState.isActive = true;
        detonatorState.targetBall = activeBalls[0];
        detonatorState.countdown = 3;
        detonatorState.originalBallColor = detonatorState.targetBall.color || '#2196F3';
        
        const button = detonatorState.button;
        button.classList.add('priming');
        
        const countdownDisplay = button.querySelector('.detonator-countdown');
        countdownDisplay.textContent = '3';
        
        console.log('💣 DETONATION SEQUENCE INITIATED!');
        
        // Start ball flashing
        detonatorState.flashInterval = setInterval(() => {
            if (detonatorState.targetBall && detonatorState.targetBall.active) {
                // Toggle between red and original color
                detonatorState.targetBall.detonating = !detonatorState.targetBall.detonating;
            }
        }, DETONATOR_CONFIG.flashInterval);
        
        // Countdown
        detonatorState.countdownInterval = setInterval(() => {
            detonatorState.countdown--;
            
            if (detonatorState.countdown > 0) {
                countdownDisplay.textContent = detonatorState.countdown;
                console.log(`💣 Countdown: ${detonatorState.countdown}`);
                
                // Play tick sound if audio engine exists
                if (window.audioEngine?.playUIClick) {
                    window.audioEngine.playUIClick();
                }
            } else {
                // BOOM!
                countdownDisplay.textContent = 'BOOM!';
                console.log('💥 DETONATION!');
                
                setTimeout(() => {
                    executeDetonation();
                    resetDetonator();
                }, 200);
            }
        }, 1000);
    }
    
    // Execute the explosion
    function executeDetonation() {
        const ball = detonatorState.targetBall;
        if (!ball || !ball.active) {
            console.warn('Ball no longer active, canceling detonation');
            return;
        }
        
        console.log(`💥 Exploding ball at (${ball.x}, ${ball.y})`);
        
        // Create explosion effects
        createExplosionVisuals(ball.x, ball.y);
        
        // Apply area damage
        applyExplosionDamage(ball.x, ball.y);
        
        // Apply shockwave physics
        applyShockwave(ball.x, ball.y);
        
        // Screen shake
        applyScreenShake();
        
        // Remove the ball from current round 
        ball.active = false;
        ball.destroyed = true;
        
        // Actually remove the ball from the balls array (like when it hits danger line)
        const ballIndex = window.balls.indexOf(ball);
        if (ballIndex !== -1) {
            window.balls.splice(ballIndex, 1);
            console.log(`🎱 Ball removed from array. Remaining balls in round: ${window.balls.length}`);
        }
        
        // Reduce PERMANENT ball count for future rounds
        if (window.baseBallCount > 0) {
            window.baseBallCount--;
            // Don't touch ballsForNextShot here - it gets reset from baseBallCount at round end
            console.log(`💥 Ball detonated! Permanent ball count reduced to ${window.baseBallCount}`);
            console.log(`📊 Future rounds will launch ${window.baseBallCount} balls`);
            
            // Update UI if it exists
            const ballsLeftDisplay = document.getElementById('ballsLeft');
            if (ballsLeftDisplay) {
                ballsLeftDisplay.textContent = window.baseBallCount || '0';
            }
        }
        
        // Check if round should end (no balls left)
        if (window.balls.length === 0) {
            console.log(`🏁 Last ball detonated - round ending`);
            window.turnInProgress = false;
            window.firstBallOfTurn = true;
            window.ballsForNextShot = window.baseBallCount;
        } else {
            console.log(`🎮 Round continues with ${window.balls.length} balls still active`);
        }
        
        // Play explosion sound if available
        if (window.audioEngine?.playExplosion) {
            window.audioEngine.playExplosion();
        }
    }
    
    // Create visual explosion effects
    function createExplosionVisuals(x, y) {
        // Create explosion particles with performance awareness
        const maxParticles = window.MAX_EXPLOSION_PARTICLES || 50;
        const particleCount = Math.min(50, maxParticles);
        
        // Check current particle load
        const currentParticleCount = window.particles ? window.particles.length : 0;
        const availableSlots = (window.MAX_PARTICLES || 100) - currentParticleCount;
        const actualParticleCount = Math.min(particleCount, Math.max(5, availableSlots));
        
        console.log(`💥 Creating ${actualParticleCount} explosion particles (${currentParticleCount} existing)`);
        
        for (let i = 0; i < actualParticleCount; i++) {
            const angle = (Math.PI * 2 * i) / actualParticleCount;
            const speed = 5 + Math.random() * 10;
            
            // Adjust particle properties based on performance mode
            const particleLife = window.PARTICLE_QUALITY === 'low' ? 0.7 : 1.0;
            const particleSize = window.PARTICLE_QUALITY === 'low' ? 
                (2 + Math.random() * 3) : (3 + Math.random() * 5);
            
            const particle = {
                x: x,
                y: y,
                speedX: Math.cos(angle) * speed, // Use speedX/speedY for compatibility with game.js
                speedY: Math.sin(angle) * speed,
                life: particleLife,
                decay: 0.02,
                color: `hsl(${Math.random() * 60}, 100%, 50%)`, // Red to yellow
                size: particleSize
            };
            
            if (window.particles) {
                window.particles.push(particle);
            }
        }
        
        // Create shockwave ring effect (visual only)
        if (window.explosionEffects) {
            window.explosionEffects.push({
                x: x,
                y: y,
                radius: 0,
                maxRadius: DETONATOR_CONFIG.shockwaveRadius,
                alpha: 1.0,
                color: '#ff4444'
            });
        }
    }
    
    // Apply explosion damage to nearby blocks
    function applyExplosionDamage(x, y) {
        if (!window.blocks) return;
        
        let blocksDestroyed = 0;
        
        window.blocks.forEach(block => {
            if (block.destroyed) return;
            
            // Calculate distance from explosion center to block center
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;
            const distance = Math.sqrt(
                Math.pow(blockCenterX - x, 2) + 
                Math.pow(blockCenterY - y, 2)
            );
            
            // Apply damage if within radius
            if (distance <= DETONATOR_CONFIG.damageRadius) {
                // Damage falloff based on distance
                const damageMultiplier = 1 - (distance / DETONATOR_CONFIG.damageRadius) * 0.5;
                const damage = Math.ceil(DETONATOR_CONFIG.explosionDamage * damageMultiplier);
                
                block.hitPoints -= damage;
                block.glow = 1.0; // Visual feedback
                
                console.log(`💥 Block at (${block.x}, ${block.y}) took ${damage} damage`);
                
                if (block.hitPoints <= 0) {
                    block.destroyed = true;
                    blocksDestroyed++;
                    
                    // Add score for destroyed block
                    if (window.score !== undefined) {
                        window.score += 10;
                    }
                    
                    // Create destruction particles
                    createBlockDestructionParticles(block);
                }
            }
        });
        
        console.log(`💥 Explosion destroyed ${blocksDestroyed} blocks`);
    }
    
    // Apply shockwave physics to push blocks
    function applyShockwave(x, y) {
        if (!window.blocks) return;
        
        window.blocks.forEach(block => {
            if (block.destroyed) return;
            
            // Calculate distance and direction
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;
            const distance = Math.sqrt(
                Math.pow(blockCenterX - x, 2) + 
                Math.pow(blockCenterY - y, 2)
            );
            
            // Apply push if within shockwave radius
            if (distance <= DETONATOR_CONFIG.shockwaveRadius && distance > 0) {
                // Calculate push direction (away from explosion)
                const pushAngle = Math.atan2(blockCenterY - y, blockCenterX - x);
                const pushForce = DETONATOR_CONFIG.shockwaveForce * 
                    (1 - distance / DETONATOR_CONFIG.shockwaveRadius);
                
                // Apply displacement
                block.x += Math.cos(pushAngle) * pushForce;
                block.y += Math.cos(pushAngle) * pushForce * 0.3; // Less vertical push
                
                // Add wobble effect
                block.wobble = 1.0;
                block.wobbleAngle = pushAngle;
            }
        });
    }
    
    // Create particles for destroyed blocks
    function createBlockDestructionParticles(block) {
        if (!window.particles) return;
        
        // Reduce particle count for performance
        const baseParticleCount = 10;
        const performanceMultiplier = window.PARTICLE_QUALITY === 'low' ? 0.3 : 
                                    window.PARTICLE_QUALITY === 'medium' ? 0.6 : 1.0;
        const particleCount = Math.ceil(baseParticleCount * performanceMultiplier);
        
        // Check particle budget
        const currentParticleCount = window.particles.length;
        const availableSlots = (window.MAX_PARTICLES || 100) - currentParticleCount;
        const actualParticleCount = Math.min(particleCount, Math.max(1, availableSlots));
        
        for (let i = 0; i < actualParticleCount; i++) {
            window.particles.push({
                x: block.x + block.width / 2,
                y: block.y + block.height / 2,
                speedX: (Math.random() - 0.5) * 8, // Use speedX/speedY for compatibility
                speedY: (Math.random() - 0.5) * 8,
                life: window.PARTICLE_QUALITY === 'low' ? 0.6 : 1.0,
                decay: 0.02,
                color: '#ff6600',
                size: window.PARTICLE_QUALITY === 'low' ? 
                    (1 + Math.random() * 2) : (2 + Math.random() * 3)
            });
        }
    }
    
    // Apply screen shake effect
    function applyScreenShake() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        const originalTransform = canvas.style.transform;
        let shakeTime = 0;
        
        const shakeInterval = setInterval(() => {
            shakeTime += 50;
            
            if (shakeTime < DETONATOR_CONFIG.screenShakeDuration) {
                const intensity = DETONATOR_CONFIG.screenShakeIntensity * 
                    (1 - shakeTime / DETONATOR_CONFIG.screenShakeDuration);
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                canvas.style.transform = `translate(${x}px, ${y}px)`;
            } else {
                canvas.style.transform = originalTransform || '';
                clearInterval(shakeInterval);
            }
        }, 50);
    }
    
    // Reset detonator after explosion
    function resetDetonator() {
        clearInterval(detonatorState.countdownInterval);
        clearInterval(detonatorState.flashInterval);
        
        detonatorState.isActive = false;
        detonatorState.countdown = 0;
        detonatorState.targetBall = null;
        
        const button = detonatorState.button;
        if (button) {
            button.classList.remove('priming');
            const countdownDisplay = button.querySelector('.detonator-countdown');
            countdownDisplay.textContent = '';
        }
        
        // Reset ball color if it still exists
        if (detonatorState.targetBall && detonatorState.originalBallColor) {
            detonatorState.targetBall.detonating = false;
        }
        
        updateButtonVisibility();
    }
    
    // Update button visibility based on game state
    function updateButtonVisibility() {
        const button = detonatorState.button;
        if (!button || !button.container) {
            console.warn('⚠️ Detonator button not found');
            return;
        }
        
        const isBoomMode = window.currentGameMode?.id === 'ballGoBoom';
        // Check multiple conditions for playing state
        const isPlaying = window.gameState === 'playing' || 
                         window._gameState === 'playing' ||
                         (window.balls && window.balls.some(b => b && b.active));
        const canDet = canDetonate();
        
        // Show container if in Ball Go Boom mode
        if (isBoomMode) {
            button.container.style.display = 'block';
            
            // Enable/disable based on whether we can detonate
            if (canDet) {
                button.classList.remove('disabled');
                button.querySelector('.detonator-label').textContent = 'DETONATE';
            } else {
                button.classList.add('disabled');
                // Show why it's disabled
                let labelText = 'DETONATE';
                
                if (!isPlaying) {
                    labelText = 'NOT PLAYING';
                } else if (!window.balls || !Array.isArray(window.balls)) {
                    labelText = 'NO BALLS';
                } else {
                    const activeBalls = window.balls.filter(b => b && b.active === true);
                    if (activeBalls.length === 0) {
                        labelText = 'NO BALL';
                    } else if (activeBalls.length > 1) {
                        labelText = `${activeBalls.length} BALLS`;
                    } else {
                        // Exactly 1 ball but still can't detonate - shouldn't happen
                        labelText = 'WAIT...';
                    }
                }
                
                button.querySelector('.detonator-label').textContent = labelText;
            }
        } else {
            // Hide in other modes
            button.container.style.display = 'none';
        }
    }
    
    // Initialize detonator system
    function initializeDetonator() {
        console.log('💣 Initializing Ball Detonator System...');
        
        // Check if already initialized
        if (detonatorState.button) {
            console.log('⚠️ Detonator already initialized');
            return;
        }
        
        // Create button
        detonatorState.button = createDetonatorButton();
        
        if (!detonatorState.button) {
            console.error('❌ Failed to create detonator button');
            return;
        }
        
        console.log('✅ Detonator button created');
        
        // Add click handler
        detonatorState.button.addEventListener('click', () => {
            if (canDetonate()) {
                startDetonation();
            }
        });
        
        // Initialize explosion effects array if it doesn't exist
        if (!window.explosionEffects) {
            window.explosionEffects = [];
        }
        
        // Monitor game state changes more frequently
        setInterval(updateButtonVisibility, 50);
        
        console.log('✅ Ball Detonator System ready!');
    }
    
    // Hook into game loop to render explosion effects (SAFE VERSION - no wrapping)
    function hookRenderingSystem() {
        console.log('💣 Installing rendering hook WITHOUT wrapping gameLoop...');
        
        // DON'T wrap gameLoop - just hook into rendering via RAF
        // This prevents the infinity mirror bug
        function renderExplosionEffects() {
            // Check Ball Go Boom button visibility (moved from main-menu.js)
            if (window.checkBallGoBoomButton) {
                window.checkBallGoBoomButton();
            }
            
            // Update moving blocks if in Ball Go Boom mode (moved from main-menu.js)
            if (window.currentGameMode && window.currentGameMode.id === 'ballGoBoom' && window.blocks) {
                window.blocks.forEach(block => {
                    if (block.isMoving && !block.destroyed) {
                        // Apply velocity
                        if (block.vx) {
                            block.x += block.vx;
                            block.vx *= 0.95; // Friction
                            if (Math.abs(block.vx) < 0.1) block.vx = 0;
                        }
                        if (block.vy) {
                            block.y += block.vy;
                            block.vy *= 0.95; // Friction
                            if (Math.abs(block.vy) < 0.1) block.vy = 0;
                        }
                        
                        // Stop moving when velocity is near zero
                        if (!block.vx && !block.vy) {
                            block.isMoving = false;
                        }
                        
                        // Keep blocks on screen
                        if (block.canvas && block.canvas.width) {
                            if (block.x < 0) block.x = 0;
                            if (block.x + block.width > window.canvas.width) {
                                block.x = window.canvas.width - block.width;
                            }
                        }
                    }
                });
            }
            
            // Render explosion rings
            if (window.explosionEffects && window.explosionEffects.length > 0) {
                const canvas = document.getElementById('gameCanvas');
                const ctx = canvas?.getContext('2d');
                if (ctx) {
                    window.explosionEffects = window.explosionEffects.filter(effect => {
                        effect.radius += 5;
                        effect.alpha -= 0.02;
                        
                        if (effect.alpha > 0) {
                            ctx.save();
                            ctx.globalAlpha = effect.alpha;
                            ctx.strokeStyle = effect.color;
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                            ctx.stroke();
                            ctx.restore();
                            return true;
                        }
                        return false;
                    });
                }
            }
            
            // Continue rendering loop
            requestAnimationFrame(renderExplosionEffects);
        }
        
        // Start independent rendering loop
        requestAnimationFrame(renderExplosionEffects);
        
        console.log('✅ Explosion rendering hook installed (RAF-based, no gameLoop wrapping)');
    }
    
    // Wait for game to load and initialize
    function waitForGame() {
        console.log('💣 Waiting for game to be ready...');
        
        // Check if game variables exist
        const checkInterval = setInterval(() => {
            if (window.balls && window.blocks && window.gameState !== undefined) {
                clearInterval(checkInterval);
                console.log('✅ Game variables detected, initializing detonator...');
                initializeDetonator();
                setTimeout(hookRenderingSystem, 100);
            }
        }, 500);
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForGame);
    } else {
        waitForGame();
    }
    
    // Export for debugging
    window.ballDetonator = {
        config: DETONATOR_CONFIG,
        state: detonatorState,
        canDetonate,
        startDetonation,
        executeDetonation,
        updateButtonVisibility,
        initializeDetonator
    };
    
    console.log('💣 Ball Detonator System loaded - Ball Go Boom exclusive feature!');
})();