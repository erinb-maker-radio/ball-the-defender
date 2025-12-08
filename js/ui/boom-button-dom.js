/**
 * DOM-Based Boom Button System
 * ============================
 * Clean implementation that positions boom button over the ball launcher
 * using DOM positioning that follows the launcher dynamically
 */

class DOMBoomButton {
    constructor() {
        this.button = null;
        this.isVisible = false;
        this.gameCanvas = null;
        this.initialized = false;
        
        // Detonation countdown state
        this.isDetonating = false;
        this.targetBall = null;
        this.countdown = 0;
        this.countdownInterval = null;
        this.flashInterval = null;
        
        // Ball count monitoring
        this.ballCountInterval = null;
        
        console.log('💥 DOM Boom Button system created');
    }
    
    /**
     * Initialize the boom button system
     */
    initialize() {
        if (this.initialized) {
            console.warn('DOM Boom Button already initialized');
            return;
        }
        
        this.gameCanvas = document.getElementById('gameCanvas');
        if (!this.gameCanvas) {
            console.error('Game canvas not found for boom button positioning');
            return false;
        }
        
        this.createButton();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ DOM Boom Button initialized');
        return true;
    }
    
    /**
     * Create the boom button DOM element
     */
    createButton() {
        // Remove existing button if any
        if (this.button) {
            this.button.remove();
        }
        
        // Create button element
        this.button = document.createElement('button');
        this.button.id = 'domBoomButton';
        this.button.className = 'dom-boom-button';
        this.button.innerHTML = '💥';
        this.button.title = 'Detonate Ball (Ball Go Boom Mode)';
        
        // Style the button
        this.button.style.cssText = `
            position: absolute;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
            border: 3px solid #ffffff;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 
                0 4px 15px rgba(255, 68, 68, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.2);
            transition: all 0.2s ease;
            display: none;
            user-select: none;
            -webkit-user-select: none;
        `;
        
        // Add hover effects
        this.button.addEventListener('mouseenter', () => {
            this.button.style.transform = 'scale(1.1)';
            this.button.style.boxShadow = `
                0 6px 20px rgba(255, 68, 68, 0.6),
                inset 0 0 30px rgba(255, 255, 255, 0.3)
            `;
        });
        
        this.button.addEventListener('mouseleave', () => {
            this.button.style.transform = 'scale(1)';
            this.button.style.boxShadow = `
                0 4px 15px rgba(255, 68, 68, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.2)
            `;
        });
        
        // Add click effect
        this.button.addEventListener('mousedown', () => {
            this.button.style.transform = 'scale(0.95)';
        });
        
        this.button.addEventListener('mouseup', () => {
            this.button.style.transform = 'scale(1.1)'; // Maintain hover scale
        });
        
        // Add to document
        document.body.appendChild(this.button);
        
        // Start monitoring ball count to show/hide button automatically
        this.startBallCountMonitoring();
        
        console.log('💥 DOM boom button created');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Click handler
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleBoomClick();
        });
        
        // Window resize handler to reposition button
        window.addEventListener('resize', () => {
            if (this.isVisible) {
                this.updatePosition();
            }
        });
        
        // Canvas size change observer
        if (this.gameCanvas && window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                if (this.isVisible) {
                    this.updatePosition();
                }
            });
            resizeObserver.observe(this.gameCanvas);
        }
        
        console.log('✅ DOM boom button event listeners set up');
    }
    
    /**
     * Monitor ball count to automatically show/hide button
     */
    startBallCountMonitoring() {
        // Check ball count every 100ms for responsive button display
        this.ballCountInterval = setInterval(() => {
            if (window.selectedGameMode === 'ballGoBoom' && !this.isDetonating) {
                const activeBalls = window.balls?.filter(b => b && b.active) || [];
                
                if (activeBalls.length === 1 && !this.isVisible) {
                    // Show button when exactly 1 ball remains
                    this.show();
                } else if (activeBalls.length !== 1 && this.isVisible) {
                    // Hide button when not exactly 1 ball
                    this.hide();
                }
            } else if (this.isVisible && window.selectedGameMode !== 'ballGoBoom') {
                // Hide if not in Ball Go Boom mode
                this.hide();
            }
        }, 100);
        
        console.log('🔍 Ball count monitoring started');
    }
    
    /**
     * Handle boom button click
     */
    handleBoomClick() {
        console.log('💥 DOM Boom button clicked!');
        
        // Check if we're in Ball Go Boom mode
        if (window.selectedGameMode !== 'ballGoBoom') {
            console.log('⚠️ Boom button clicked but not in Ball Go Boom mode');
            return;
        }
        
        // Check if there's exactly one active ball
        const activeBalls = window.balls?.filter(b => b && b.active) || [];
        console.log(`🎾 Found ${activeBalls.length} active balls`);
        
        if (activeBalls.length !== 1) {
            console.log('⚠️ Need exactly 1 active ball for detonation');
            return;
        }
        
        // Check if already detonating
        if (this.isDetonating) {
            console.log('💣 Already in detonation countdown');
            return;
        }
        
        // Start 3-second countdown instead of immediate detonation
        const ball = activeBalls[0];
        this.startDetonationCountdown(ball);
    }
    
    /**
     * Start 3-second countdown before detonation (like original system)
     */
    startDetonationCountdown(ball) {
        if (!ball || !ball.active) return;
        
        console.log('💣 DETONATION SEQUENCE INITIATED!');
        
        // Set detonation state
        this.isDetonating = true;
        this.targetBall = ball;
        this.countdown = 3;
        
        // Change button appearance during countdown
        this.button.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
        this.button.innerHTML = '3';
        this.button.style.fontSize = '32px';
        this.button.style.fontWeight = 'bold';
        
        // Start ball flashing red
        this.startBallFlashing(ball);
        
        // Start countdown timer
        this.countdownInterval = setInterval(() => {
            this.countdown--;
            
            if (this.countdown > 0) {
                this.button.innerHTML = this.countdown.toString();
                console.log(`💣 Countdown: ${this.countdown}`);
                
                // Play tick sound
                if (window.audioEngine?.playUIClick) {
                    window.audioEngine.playUIClick();
                }
            } else {
                // BOOM!
                this.button.innerHTML = 'BOOM!';
                this.button.style.fontSize = '18px';
                console.log('💥 DETONATION!');
                
                setTimeout(() => {
                    this.executeDetonation();
                    this.resetDetonationState();
                }, 200);
            }
        }, 1000);
    }
    
    /**
     * Make ball flash red during countdown
     */
    startBallFlashing(ball) {
        this.flashInterval = setInterval(() => {
            if (ball && ball.active) {
                // Toggle detonating flag for visual effect
                ball.detonating = !ball.detonating;
            }
        }, 200); // Flash every 200ms like original
    }
    
    /**
     * Execute the actual detonation
     */
    executeDetonation() {
        const ball = this.targetBall;
        if (!ball || !ball.active) {
            console.warn('Ball no longer active, canceling detonation');
            return;
        }
        
        console.log(`💥 Exploding ball at (${ball.x.toFixed(0)}, ${ball.y.toFixed(0)})`);
        
        // Stop ball flashing
        ball.detonating = false;
        
        // Execute detonation (same logic as before)
        this.detonateBall(ball);
    }
    
    /**
     * Reset detonation state
     */
    resetDetonationState() {
        // Clear intervals
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        if (this.flashInterval) {
            clearInterval(this.flashInterval);
            this.flashInterval = null;
        }
        
        // Reset state
        this.isDetonating = false;
        this.targetBall = null;
        this.countdown = 0;
        
        // Reset button appearance
        this.button.innerHTML = '💥';
        this.button.style.fontSize = '24px';
        this.button.style.fontWeight = 'normal';
        this.button.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
        
        // Button will be hidden by detonateBall, but reset for next time
        console.log('🔄 Detonation state reset');
    }
    
    /**
     * Detonate a ball with explosion effects (copied from boom-button-manager.js)
     */
    detonateBall(ball) {
        if (!ball || !ball.active) return;
        
        console.log(`💥 Detonating ball at (${ball.x.toFixed(0)}, ${ball.y.toFixed(0)})`);
        
        // Hide the boom button during detonation
        this.hide();
        
        // Create explosion effects
        this.createExplosionEffects(ball.x, ball.y);
        
        // Apply area damage to blocks
        this.applyExplosionDamage(ball.x, ball.y);
        
        // Remove the ball
        ball.active = false;
        ball.destroyed = true;
        
        // Remove from balls array
        const ballIndex = window.balls.indexOf(ball);
        if (ballIndex !== -1) {
            window.balls.splice(ballIndex, 1);
            console.log(`🎱 Ball removed. Remaining balls: ${window.balls.length}`);
        }
        
        // Reduce permanent ball count for future rounds
        if (window.baseBallCount > 0) {
            window.baseBallCount--;
            console.log(`📊 Ball count reduced to ${window.baseBallCount} for future rounds`);
            
            // Update UI
            const ballsLeftDisplay = document.getElementById('ballsLeft');
            if (ballsLeftDisplay) {
                ballsLeftDisplay.textContent = window.baseBallCount || '0';
            }
        }
        
        // Check if round should end (no more balls moving)
        const movingBalls = window.balls?.filter(b => b.active && (b.vx !== 0 || b.vy !== 0)) || [];
        if (movingBalls.length === 0) {
            console.log('🏁 No more moving balls after detonation - ending round');
            if (window.endRound) {
                setTimeout(() => window.endRound(), 500);
            }
        }
    }
    
    /**
     * Create spectacular explosion visual effects
     */
    createExplosionEffects(x, y) {
        console.log(`💥 SPECTACULAR EXPLOSION at (${x}, ${y})!`);
        
        // MASSIVE SCREEN SHAKE
        this.createScreenShake(x, y);
        
        // FANTASTIC BOOM SOUND
        this.playSpectacularBoomSound();
        
        // EXPLODING PARTICLES EVERYWHERE
        this.createMassiveParticleExplosion(x, y);
        
        // SECONDARY EFFECTS
        this.createShockwaveRings(x, y);
        this.createExplosionFlash(x, y);
        
        console.log(`🌟 SPECTACULAR explosion effects unleashed!`);
    }
    
    /**
     * Create intense screen shake effect
     */
    createScreenShake(x, y) {
        if (!this.gameCanvas) return;
        
        console.log('📳 Creating MASSIVE screen shake!');
        
        const shakeIntensity = 25; // Much more intense
        const shakeDuration = 800; // Longer shake
        const shakeFrequency = 60; // High frequency for violent shake
        
        let shakeTime = 0;
        const originalTransform = this.gameCanvas.style.transform;
        
        const shakeInterval = setInterval(() => {
            shakeTime += 16; // Roughly 60fps
            
            if (shakeTime >= shakeDuration) {
                clearInterval(shakeInterval);
                this.gameCanvas.style.transform = originalTransform;
                console.log('📳 Screen shake complete');
                return;
            }
            
            // Decay shake over time
            const intensity = shakeIntensity * (1 - shakeTime / shakeDuration);
            
            // Random shake in all directions
            const shakeX = (Math.random() - 0.5) * intensity;
            const shakeY = (Math.random() - 0.5) * intensity;
            const shakeRotate = (Math.random() - 0.5) * 2; // Slight rotation shake
            
            this.gameCanvas.style.transform = `translate(${shakeX}px, ${shakeY}px) rotate(${shakeRotate}deg)`;
        }, 16);
    }
    
    /**
     * Play fantastic boom sound with multiple layers
     */
    playSpectacularBoomSound() {
        if (!window.audioEngine?.playCustomSound) {
            console.log('🔊 No audio engine available for boom sound');
            return;
        }
        
        console.log('🔊 Playing FANTASTIC boom sound!');
        
        // Layer 1: Deep bass explosion
        window.audioEngine.playCustomSound({
            frequency: 60,
            type: 'sawtooth',
            duration: 1.2,
            volume: 0.8,
            effects: ['distortion', 'reverb'],
            attack: 0.01,
            decay: 0.3,
            sustain: 0.2,
            release: 0.5
        });
        
        // Layer 2: Mid-range crack
        setTimeout(() => {
            window.audioEngine.playCustomSound({
                frequency: 200,
                type: 'square',
                duration: 0.8,
                volume: 0.7,
                effects: ['distortion', 'crackle'],
                attack: 0.01,
                decay: 0.2
            });
        }, 50);
        
        // Layer 3: High-frequency sizzle
        setTimeout(() => {
            window.audioEngine.playCustomSound({
                frequency: 800,
                type: 'noise',
                duration: 0.6,
                volume: 0.5,
                effects: ['filter', 'reverb'],
                attack: 0.01,
                decay: 0.4
            });
        }, 100);
        
        // Layer 4: Thunderclap rumble
        setTimeout(() => {
            window.audioEngine.playCustomSound({
                frequency: 30,
                type: 'triangle',
                duration: 1.5,
                volume: 0.6,
                effects: ['reverb', 'delay'],
                attack: 0.1,
                decay: 0.8
            });
        }, 200);
    }
    
    /**
     * Create massive particle explosion
     */
    createMassiveParticleExplosion(x, y) {
        if (!window.particles) {
            window.particles = []; // Create if doesn't exist
        }
        
        console.log('🎆 Creating MASSIVE particle explosion!');
        
        const totalParticles = 150; // Way more particles
        
        // Main explosion particles (outward burst)
        for (let i = 0; i < 80; i++) {
            const angle = (Math.PI * 2 * i) / 80 + Math.random() * 0.2;
            const speed = Math.random() * 15 + 8; // Much faster
            const size = Math.random() * 12 + 6; // Bigger particles
            
            window.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.015, // Slower decay for longer trails
                size: size,
                color: `hsl(${Math.random() * 60}, 100%, ${60 + Math.random() * 40}%)`, // Bright oranges/reds
                gravity: 0.1 // Add gravity for realistic falling
            });
        }
        
        // Secondary explosion particles (delayed burst)
        setTimeout(() => {
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 12 + 6;
                const size = Math.random() * 8 + 4;
                
                window.particles.push({
                    x: x + (Math.random() - 0.5) * 60, // Slight spread
                    y: y + (Math.random() - 0.5) * 60,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0.8,
                    decay: 0.02,
                    size: size,
                    color: `hsl(${Math.random() * 40 + 20}, 100%, ${50 + Math.random() * 30}%)`, // Yellows/oranges
                    gravity: 0.05
                });
            }
        }, 150);
        
        // Sparks and debris
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 20 + 10;
            
            window.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.03,
                size: 2 + Math.random() * 3,
                color: '#ffffff', // White hot sparks
                gravity: 0.2,
                bounce: 0.3 // Sparks can bounce
            });
        }
    }
    
    /**
     * Create expanding shockwave rings
     */
    createShockwaveRings(x, y) {
        if (!window.particles) return;
        
        console.log('💫 Creating shockwave rings!');
        
        // Create multiple expanding rings
        for (let ring = 0; ring < 3; ring++) {
            setTimeout(() => {
                const ringParticles = 24;
                const radius = 30 + ring * 20;
                
                for (let i = 0; i < ringParticles; i++) {
                    const angle = (Math.PI * 2 * i) / ringParticles;
                    const ringX = x + Math.cos(angle) * radius;
                    const ringY = y + Math.sin(angle) * radius;
                    
                    window.particles.push({
                        x: ringX,
                        y: ringY,
                        vx: Math.cos(angle) * 3,
                        vy: Math.sin(angle) * 3,
                        life: 0.6,
                        decay: 0.02,
                        size: 4,
                        color: `hsl(60, 100%, 80%)`, // Bright yellow rings
                        gravity: 0
                    });
                }
            }, ring * 100);
        }
    }
    
    /**
     * Create localized explosion flash effect at ball position
     */
    createExplosionFlash(ballX, ballY) {
        if (!this.gameCanvas) return;
        
        console.log(`⚡ Creating explosion flash at ball position (${ballX}, ${ballY})!`);
        
        // Get canvas position and scale
        const canvasRect = this.gameCanvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.gameCanvas.width;
        const scaleY = canvasRect.height / this.gameCanvas.height;
        
        // Convert ball position to screen coordinates
        const screenX = canvasRect.left + (ballX * scaleX);
        const screenY = canvasRect.top + (ballY * scaleY);
        
        // Create localized flash overlay centered on explosion
        const flash = document.createElement('div');
        const flashSize = 400; // Size of flash effect
        
        flash.style.cssText = `
            position: fixed;
            left: ${screenX - flashSize/2}px;
            top: ${screenY - flashSize/2}px;
            width: ${flashSize}px;
            height: ${flashSize}px;
            background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,200,0,0.6) 20%, rgba(255,100,0,0.3) 40%, transparent 70%);
            pointer-events: none;
            z-index: 9999;
            border-radius: 50%;
            animation: explosionFlash 0.4s ease-out;
            transform-origin: center center;
        `;
        
        // Add flash animation keyframes if not already present
        if (!document.getElementById('explosionFlashStyle')) {
            const style = document.createElement('style');
            style.id = 'explosionFlashStyle';
            style.textContent = `
                @keyframes explosionFlash {
                    0% { 
                        opacity: 1; 
                        transform: scale(0.5);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.2);
                    }
                    100% { 
                        opacity: 0; 
                        transform: scale(2);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(flash);
        
        // Remove flash after animation
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 400);
    }
    
    /**
     * Apply explosion damage to nearby blocks and create fire at destroyed locations
     */
    applyExplosionDamage(x, y) {
        if (!window.blocks) return;
        
        const explosionRadius = 150;
        const explosionDamage = 3;
        let blocksDestroyed = 0;
        const destroyedBlockPositions = []; // Track where blocks were destroyed
        
        window.blocks.forEach(block => {
            if (block.destroyed) return;
            
            // Calculate distance from explosion center to block center
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;
            const distance = Math.sqrt(
                Math.pow(blockCenterX - x, 2) + 
                Math.pow(blockCenterY - y, 2)
            );
            
            if (distance <= explosionRadius) {
                console.log(`💥 Block at (${block.x}, ${block.y}) hit by explosion (distance: ${distance.toFixed(0)})`);
                
                // Apply damage
                block.hitPoints = Math.max(0, (block.hitPoints || 1) - explosionDamage);
                
                // Destroy if no hit points left
                if (block.hitPoints <= 0) {
                    block.destroyed = true;
                    blocksDestroyed++;
                    
                    // Track this destroyed block position for fire
                    destroyedBlockPositions.push({
                        x: blockCenterX,
                        y: blockCenterY,
                        width: block.width,
                        height: block.height
                    });
                    
                    // Add score
                    if (window.score !== undefined) {
                        window.score += 10;
                    }
                    
                    // Create destruction particles
                    this.createDestructionParticles(blockCenterX, blockCenterY);
                }
            }
        });
        
        console.log(`💥 Explosion destroyed ${blocksDestroyed} blocks`);
        
        // Create persistent fire at destroyed block locations
        if (destroyedBlockPositions.length > 0) {
            this.createPersistentFire(destroyedBlockPositions);
        }
        
        // Update UI
        if (window.updateUI) {
            window.updateUI();
        }
    }
    
    /**
     * Create persistent fire effects at destroyed block locations
     */
    createPersistentFire(destroyedPositions) {
        if (!window.particles) {
            window.particles = [];
        }
        
        console.log(`🔥 Creating persistent fire at ${destroyedPositions.length} destroyed block locations`);
        
        destroyedPositions.forEach(blockPos => {
            // Create fire that burns for 4-6 seconds
            const fireDuration = 4000 + Math.random() * 2000; // 4-6 seconds
            const fireStartTime = Date.now();
            
            // Create initial fire burst at block location
            this.createFireBurst(blockPos.x, blockPos.y, blockPos.width, blockPos.height);
            
            // Create sustained fire that continues burning
            const fireInterval = setInterval(() => {
                const timeElapsed = Date.now() - fireStartTime;
                
                if (timeElapsed >= fireDuration) {
                    clearInterval(fireInterval);
                    console.log(`🔥 Fire extinguished at (${blockPos.x}, ${blockPos.y})`);
                    return;
                }
                
                // Fire intensity decreases over time
                const fireIntensity = 1 - (timeElapsed / fireDuration);
                const particleCount = Math.floor(fireIntensity * 8) + 2; // 2-10 particles per burst
                
                // Create fire particles within the block area
                for (let i = 0; i < particleCount; i++) {
                    const fireX = blockPos.x + (Math.random() - 0.5) * blockPos.width * 0.8;
                    const fireY = blockPos.y + (Math.random() - 0.5) * blockPos.height * 0.8;
                    
                    // Fire rises upward with some horizontal flicker
                    const upwardSpeed = -(Math.random() * 3 + 2) * fireIntensity; // Rises up
                    const horizontalFlicker = (Math.random() - 0.5) * 2;
                    
                    // Fire colors: red -> orange -> yellow -> white (hottest)
                    const fireHue = Math.random() * 60; // 0-60 = red to yellow
                    const fireSaturation = 80 + Math.random() * 20; // 80-100%
                    const fireLightness = 50 + Math.random() * 30; // 50-80%
                    
                    window.particles.push({
                        x: fireX,
                        y: fireY,
                        vx: horizontalFlicker,
                        vy: upwardSpeed,
                        life: 0.8 * fireIntensity,
                        decay: 0.02 + Math.random() * 0.01,
                        size: 3 + Math.random() * 4,
                        color: `hsl(${fireHue}, ${fireSaturation}%, ${fireLightness}%)`,
                        gravity: -0.05, // Fire rises (negative gravity)
                        flicker: true, // Special flag for fire particles
                        fireIntensity: fireIntensity
                    });
                }
            }, 150); // Create new fire particles every 150ms
        });
    }
    
    /**
     * Create initial fire burst when block is destroyed
     */
    createFireBurst(x, y, width, height) {
        if (!window.particles) return;
        
        // Create intense initial fire burst
        for (let i = 0; i < 15; i++) {
            const burstX = x + (Math.random() - 0.5) * width;
            const burstY = y + (Math.random() - 0.5) * height;
            
            // Initial burst has more energy
            const upwardSpeed = -(Math.random() * 5 + 3);
            const horizontalSpeed = (Math.random() - 0.5) * 4;
            
            window.particles.push({
                x: burstX,
                y: burstY,
                vx: horizontalSpeed,
                vy: upwardSpeed,
                life: 1.0,
                decay: 0.015,
                size: 4 + Math.random() * 6,
                color: `hsl(${Math.random() * 40}, 90%, ${60 + Math.random() * 20}%)`,
                gravity: -0.1, // Strong upward movement for initial burst
                flicker: true,
                fireIntensity: 1.0
            });
        }
        
        console.log(`🔥 Fire burst created at destroyed block (${x}, ${y})`);
    }
    
    /**
     * Create particles when blocks are destroyed
     */
    createDestructionParticles(x, y) {
        if (!window.particles) return;
        
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            
            window.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.8,
                decay: 0.015,
                size: 3,
                color: '#ff6b6b'
            });
        }
    }
    
    /**
     * Update button position below danger line
     */
    updatePosition() {
        if (!this.button || !this.gameCanvas || !this.isVisible) return;
        
        // Get canvas position and size
        const canvasRect = this.gameCanvas.getBoundingClientRect();
        
        // Get launcher position (from game constants)
        const launcherX = window.nextBallStartX || (this.gameCanvas.width / 2);
        
        // Position below danger line instead of above launcher
        // Danger line is typically around 80% down the canvas
        const dangerLineY = this.gameCanvas.height * 0.8;
        const buttonY = dangerLineY + 40; // 40px below danger line
        
        // Convert to screen coordinates
        const scaleX = canvasRect.width / this.gameCanvas.width;
        const scaleY = canvasRect.height / this.gameCanvas.height;
        
        const screenX = canvasRect.left + (launcherX * scaleX);
        const screenY = canvasRect.top + (buttonY * scaleY);
        
        // Position button below danger line (centered horizontally with launcher)
        this.button.style.left = `${screenX - 30}px`; // 30px = half button width
        this.button.style.top = `${screenY}px`;
        
        console.log(`📍 Boom button positioned below danger line at (${screenX - 30}, ${screenY})`);
    }
    
    /**
     * Show the boom button (Ball Go Boom mode with exactly 1 ball only)
     */
    show() {
        if (!this.initialized || !this.button) {
            console.warn('DOM Boom Button not initialized');
            return;
        }
        
        // Only show in Ball Go Boom mode
        if (window.selectedGameMode !== 'ballGoBoom') {
            console.log('🚫 Not showing boom button - not in Ball Go Boom mode');
            return;
        }
        
        // Only show when there's exactly 1 active ball
        const activeBalls = window.balls?.filter(b => b && b.active) || [];
        if (activeBalls.length !== 1) {
            console.log(`🚫 Not showing boom button - need exactly 1 ball, found ${activeBalls.length}`);
            this.hide();
            return;
        }
        
        this.isVisible = true;
        this.button.style.display = 'block';
        this.updatePosition();
        
        console.log('👁️ DOM Boom button shown (1 ball detected)');
    }
    
    /**
     * Hide the boom button
     */
    hide() {
        if (!this.button) return;
        
        // Cancel any active countdown when hiding
        if (this.isDetonating) {
            this.resetDetonationState();
        }
        
        this.isVisible = false;
        this.button.style.display = 'none';
        
        console.log('🙈 DOM Boom button hidden');
    }
    
    /**
     * Clean up the boom button system
     */
    destroy() {
        // Clean up all intervals
        if (this.ballCountInterval) {
            clearInterval(this.ballCountInterval);
            this.ballCountInterval = null;
        }
        
        if (this.isDetonating) {
            this.resetDetonationState();
        }
        
        if (this.button) {
            this.button.remove();
            this.button = null;
        }
        
        this.isVisible = false;
        this.initialized = false;
        
        console.log('🧹 DOM Boom Button destroyed');
    }
}

// Create and expose global instance
window.domBoomButton = new DOMBoomButton();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.domBoomButton.initialize();
        }, 500); // Small delay to ensure game is ready
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        window.domBoomButton.initialize();
    }, 500);
}

console.log('💥 DOM Boom Button system loaded');