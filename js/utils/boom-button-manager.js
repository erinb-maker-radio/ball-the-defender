/**
 * Boom Button Manager - Clean Implementation
 * =========================================
 * Manages the boom button lifecycle for Ball Go Boom mode
 * Clean integration with Canvas UI system
 */

class BoomButtonManager {
    constructor() {
        this.boomButton = null;
        this.isInitialized = false;
        this.explosionState = {
            isReady: false,
            isDetonating: false
        };
        
        console.log('💥 BoomButtonManager created');
    }
    
    /**
     * Initialize boom button system
     */
    initialize() {
        if (this.isInitialized) {
            console.log('⚠️ BoomButtonManager already initialized');
            return;
        }
        
        if (!window.canvasUI || !window.BoomButton) {
            console.error('❌ Canvas UI system not available');
            return false;
        }
        
        // Create boom button
        this.boomButton = new window.BoomButton({
            radius: 35,
            text: '💥',
            fontSize: 18,
            color: '#ff4444',
            textColor: '#ffffff',
            offsetY: -70, // Position above launcher
            onClick: () => this.handleBoomClick()
        });
        
        // Add to Canvas UI system
        window.canvasUI.addElement('boomButton', this.boomButton);
        
        // Start monitoring game state
        this.startMonitoring();
        
        this.isInitialized = true;
        console.log('✅ BoomButtonManager initialized');
        return true;
    }
    
    /**
     * Start monitoring game state
     */
    startMonitoring() {
        // Monitor game state every frame when needed
        const checkVisibility = () => {
            this.updateButtonVisibility();
            requestAnimationFrame(checkVisibility);
        };
        requestAnimationFrame(checkVisibility);
        
        console.log('📡 Boom button monitoring started');
    }
    
    /**
     * Update button visibility based on game state
     */
    updateButtonVisibility() {
        if (!this.boomButton) return;
        
        // Only show in Ball Go Boom mode
        const isBoomMode = window.currentGameMode?.id === 'ballGoBoom';
        const isPlaying = window.gameState === 'playing';
        const activeBalls = window.balls?.filter(b => b && b.active) || [];
        
        // Show button only when there's exactly one active ball in Ball Go Boom mode
        const shouldShow = isBoomMode && isPlaying && activeBalls.length === 1;
        
        if (shouldShow && !this.boomButton.isVisible) {
            this.boomButton.show();
            this.explosionState.isReady = true;
            console.log('💣 Boom button shown - ready to detonate');
        } else if (!shouldShow && this.boomButton.isVisible) {
            this.boomButton.hide();
            this.explosionState.isReady = false;
            console.log('🚫 Boom button hidden');
        }
    }
    
    /**
     * Handle boom button click
     */
    handleBoomClick() {
        if (!this.explosionState.isReady || this.explosionState.isDetonating) {
            console.log('💣 Boom not ready or already detonating');
            return;
        }
        
        const activeBalls = window.balls?.filter(b => b && b.active) || [];
        if (activeBalls.length !== 1) {
            console.log('💣 No single ball to detonate');
            return;
        }
        
        console.log('💥 BOOM! Starting ball detonation...');
        this.detonateBall(activeBalls[0]);
    }
    
    /**
     * Detonate a ball with explosion effects
     */
    detonateBall(ball) {
        if (!ball || !ball.active) return;
        
        this.explosionState.isDetonating = true;
        this.boomButton.hide();
        
        console.log(`💥 Detonating ball at (${ball.x.toFixed(0)}, ${ball.y.toFixed(0)})`);
        
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
        
        // Check if round should end
        if (window.balls.length === 0) {
            console.log('🏁 Last ball detonated - ending turn');
            window.turnInProgress = false;
            window.firstBallOfTurn = true;
            window.ballsForNextShot = window.baseBallCount;
        }
        
        // Reset state
        setTimeout(() => {
            this.explosionState.isDetonating = false;
            this.updateButtonVisibility();
        }, 1000);
    }
    
    /**
     * Create visual explosion effects
     */
    createExplosionEffects(x, y) {
        // Create explosion particles
        if (window.particles) {
            const particleCount = 30;
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = 3 + Math.random() * 8;
                
                window.particles.push({
                    x: x,
                    y: y,
                    speedX: Math.cos(angle) * speed,
                    speedY: Math.sin(angle) * speed,
                    life: 1.0,
                    decay: 0.02,
                    color: `hsl(${Math.random() * 60}, 100%, 60%)`, // Orange to yellow
                    size: 2 + Math.random() * 4
                });
            }
        }
        
        console.log(`✨ Created explosion effects at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }
    
    /**
     * Apply explosion damage to nearby blocks
     */
    applyExplosionDamage(x, y) {
        if (!window.blocks) return;
        
        const explosionRadius = 120;
        const explosionDamage = 3;
        let blocksDestroyed = 0;
        
        window.blocks.forEach(block => {
            if (block.destroyed) return;
            
            // Calculate distance to block center
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;
            const distance = Math.sqrt(
                Math.pow(blockCenterX - x, 2) + 
                Math.pow(blockCenterY - y, 2)
            );
            
            // Apply damage if within radius
            if (distance <= explosionRadius) {
                const damageMultiplier = 1 - (distance / explosionRadius) * 0.5;
                const damage = Math.ceil(explosionDamage * damageMultiplier);
                
                block.hitPoints -= damage;
                block.glow = 1.0; // Visual feedback
                
                if (block.hitPoints <= 0) {
                    block.destroyed = true;
                    blocksDestroyed++;
                    
                    // Add score
                    if (window.score !== undefined) {
                        window.score += 10;
                    }
                }
            }
        });
        
        console.log(`💥 Explosion destroyed ${blocksDestroyed} blocks`);
    }
    
    /**
     * Clean shutdown
     */
    destroy() {
        if (window.canvasUI) {
            window.canvasUI.removeElement('boomButton');
        }
        
        this.boomButton = null;
        this.isInitialized = false;
        
        console.log('🗑️ BoomButtonManager destroyed');
    }
}

// Create global instance
window.boomButtonManager = new BoomButtonManager();

// Auto-initialize when Canvas UI is ready
const waitForCanvasUI = setInterval(() => {
    if (window.canvasUI && window.canvasUI.isInitialized) {
        clearInterval(waitForCanvasUI);
        window.boomButtonManager.initialize();
    }
}, 100);

// Stop waiting after 10 seconds
setTimeout(() => clearInterval(waitForCanvasUI), 10000);

console.log('💥 Boom Button Manager ready');