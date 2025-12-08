// BALL DEFENDER - CLEAN ARCHITECTURE CORE MODULE
// ⚠️  DEPLOYMENT VERSION - This is the active version
// This replaces the global variable chaos with proper encapsulation

class GameCore {
    constructor() {
        this.initialized = false;
        this.currentMode = null;
        this.canvas = null;
        this.ctx = null;
        this.blocks = [];
        this.balls = [];
        this.particles = [];
        this.powerups = [];
        
        // Game state
        this.gameState = 'idle'; // idle, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.ballCount = 1;
        
        // Systems
        this.renderer = null;
        this.audioEngine = null;
        this.inputHandler = null;
        this.leaderboard = null;
        
        // Frame timing
        this.lastFrameTime = 0;
        this.deltaMultiplier = 1.0;
        
        console.log('🎮 GameCore initialized - Clean architecture active');
    }
    
    initialize(canvasId) {
        if (this.initialized) {
            console.warn('GameCore already initialized');
            return;
        }
        
        // Initialize canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Unable to get 2D rendering context');
        }
        
        // DYNAMIC CANVAS: Match main game.js sizing
        const availableWidth = window.innerWidth - 330; // Sidebar + 10px margin
        const availableHeight = window.innerHeight - 20; // Minimal top/bottom margin
        
        // Target 4:3 aspect ratio but maximize space usage
        const targetAspectRatio = 4/3;
        let gameWidth, gameHeight;
        
        // Calculate dimensions to use maximum available space (99% utilization)
        if (availableWidth / availableHeight > targetAspectRatio) {
            // Limited by height - use 99% of available height
            gameHeight = Math.floor(availableHeight * 0.99);
            gameWidth = Math.floor(gameHeight * targetAspectRatio);
        } else {
            // Limited by width - use 99% of available width
            gameWidth = Math.floor(availableWidth * 0.99);
            gameHeight = Math.floor(gameWidth / targetAspectRatio);
        }
        
        // Ensure reasonable size for good performance (reduced max size significantly)
        gameWidth = Math.max(640, Math.min(gameWidth, 1000)); // Min 640px, max 1000px width (was 1600px)
        gameHeight = Math.max(480, Math.min(gameHeight, 750)); // Min 480px, max 750px height (was 1200px)
        
        this.canvas.width = gameWidth;
        this.canvas.height = gameHeight;
        
        this.initialized = true;
        console.log('✅ GameCore initialized successfully');
        
        return this;
    }
    
    setMode(mode) {
        if (!this.initialized) {
            throw new Error('GameCore must be initialized before setting mode');
        }
        
        this.currentMode = mode;
        console.log(`🎯 Game mode set to: ${mode.name}`);
        
        // Initialize mode-specific systems
        this.renderer = RendererFactory.create(mode, this.ctx);
        
        return this;
    }
    
    getMode() {
        return this.currentMode;
    }
    
    // Game state management
    setState(newState) {
        const oldState = this.gameState;
        this.gameState = newState;
        console.log(`🔄 Game state: ${oldState} → ${newState}`);
    }
    
    getState() {
        return this.gameState;
    }
    
    // Entity management
    addBlock(block) {
        this.blocks.push(block);
    }
    
    removeBlock(index) {
        if (index >= 0 && index < this.blocks.length) {
            this.blocks.splice(index, 1);
        }
    }
    
    getBlocks() {
        return this.blocks.filter(block => !block.destroyed);
    }
    
    addBall(ball) {
        this.balls.push(ball);
    }
    
    getBalls() {
        return this.balls.filter(ball => ball.active);
    }
    
    // Rendering
    render(currentTime) {
        if (!this.renderer) {
            console.warn('No renderer available');
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render all entities through the clean renderer system
        this.renderer.render(this, currentTime);
    }
    
    // Frame timing (frame-rate independent)
    updateTiming(currentTime) {
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = currentTime;
        }
        
        const deltaTime = Math.min(currentTime - this.lastFrameTime, 16.67 * 3); // Cap to prevent huge jumps
        this.lastFrameTime = currentTime;
        this.deltaMultiplier = deltaTime / 16.67; // Normalize to 60fps
        
        return this.deltaMultiplier;
    }
    
    getDeltaMultiplier() {
        return this.deltaMultiplier;
    }
    
    // Clean shutdown
    destroy() {
        this.initialized = false;
        this.currentMode = null;
        this.canvas = null;
        this.ctx = null;
        this.blocks = [];
        this.balls = [];
        this.particles = [];
        this.powerups = [];
        this.renderer = null;
        
        console.log('🧹 GameCore destroyed cleanly');
    }
}

// Renderer Factory - Clean abstraction for different rendering modes
class RendererFactory {
    static create(mode, ctx) {
        switch (mode.id) {
            case 'original':
                return new OriginalRenderer(ctx);
            case 'ballGoBoom':
                return new BallGoBoomRenderer(ctx);
            case 'iceFrost':
                return new IceFrostRenderer(ctx);
            default:
                console.warn(`No specific renderer for mode: ${mode.id}, using OriginalRenderer as fallback`);
                return new OriginalRenderer(ctx);
        }
    }
}

// Base Renderer Class
class BaseRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        // No need for colorScheme - using window.colors as single source of truth
    }
    
    render(gameCore, currentTime) {
        // Base rendering logic
        this.renderBlocks(gameCore.getBlocks(), currentTime);
        this.renderBalls(gameCore.getBalls(), currentTime);
        this.renderParticles(gameCore.particles, currentTime);
        this.renderPowerups(gameCore.powerups, currentTime);
    }
    
    renderBlocks(blocks, currentTime) {
        // Initialize renderer cache if needed
        if (!this.rendererCache) {
            this.rendererCache = {
                exploder: new ExploderBlockRenderer(),
                spawner: new SpawnerBlockRenderer(),
                freeze: new FreezeBlockRenderer(),
                normal: new NormalBlockRenderer()
            };
        }
        
        blocks.forEach(block => {
            if (block.destroyed) return;
            
            const renderer = this.getBlockRenderer(block);
            renderer.render(this.ctx, block, currentTime);
        });
    }
    
    getBlockRenderer(block) {
        if (block.isSpecial && block.specialType === 'exploder') {
            // Use calm spawner renderer instead of aggressive exploder renderer
            return this.rendererCache.spawner;
        } else if (block.isSpecial && block.specialType === 'spawner') {
            return this.rendererCache.spawner;
        } else if (block.isSpecial && block.specialType === 'freeze') {
            return this.rendererCache.freeze;
        } else {
            return this.rendererCache.normal;
        }
    }
    
    renderBalls(balls, currentTime) {
        // Ball rendering logic
        balls.forEach(ball => {
            if (!ball.active) return;

            // Draw ball trail
            if (ball.trail && ball.trail.length > 0) {
                ball.trail.forEach((point, i) => {
                    const alpha = point.alpha || (i + 1) / ball.trail.length;
                    this.ctx.save();
                    this.ctx.globalAlpha = alpha * 0.3;
                    this.ctx.fillStyle = '#ff6644'; // Orange/red trail for character
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, ball.radius * 0.7, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                });
            }

            // Draw main ball - use sprite if available
            this.ctx.save();

            if (window.ballSprite && window.ballSprite.complete && window.ballSprite.naturalWidth > 0) {
                // Draw sprite
                const spriteSize = ball.radius * 3;
                const halfSize = spriteSize / 2;

                // Glow behind sprite
                const gradient = this.ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, spriteSize * 0.6);
                gradient.addColorStop(0, 'rgba(255, 100, 50, 0.4)');
                gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.2)');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, spriteSize * 0.6, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw sprite
                this.ctx.drawImage(
                    window.ballSprite,
                    ball.x - halfSize,
                    ball.y - halfSize,
                    spriteSize,
                    spriteSize
                );
            } else {
                // Fallback to circle
                this.ctx.fillStyle = '#2196F3';
                this.ctx.strokeStyle = '#1976D2';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    }
    
    renderParticles(particles, currentTime) {
        // Particle rendering logic
        particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.restore();
        });
    }
    
    renderPowerups(powerups, currentTime) {
        // Powerup rendering logic
        powerups.forEach(powerup => {
            if (powerup.collected) return;
            
            this.ctx.save();
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.strokeStyle = '#388E3C';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(powerup.x + powerup.width/2, powerup.y + powerup.height/2, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw +1 text
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('+1', powerup.x + powerup.width/2, powerup.y + powerup.height/2);
            this.ctx.restore();
        });
    }
}

// Original Mode Renderer
class OriginalRenderer extends BaseRenderer {
    constructor(ctx) {
        super(ctx);
        // Mode template system handles colors via window.colors
        console.log('🎨 Original renderer initialized');
    }
}

// Ball Go Boom Mode Renderer  
class BallGoBoomRenderer extends BaseRenderer {
    constructor(ctx) {
        super(ctx);
        // Mode template system handles colors via window.colors
        console.log('🌋 Ball Go Boom renderer initialized');
    }
}

// Ice Frost Mode Renderer
class IceFrostRenderer extends BaseRenderer {
    constructor(ctx) {
        super(ctx);
        // Mode template system handles colors via window.colors
        console.log('🧊 Ice Frost renderer initialized');
    }
}

// Export for global access (transitional)
window.GameCore = GameCore;
window.RendererFactory = RendererFactory;
window.BaseRenderer = BaseRenderer;

console.log('🏗️ Game Core Module loaded - Clean architecture foundation ready');