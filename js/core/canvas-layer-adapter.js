/**
 * CANVAS LAYER ADAPTER
 * ====================
 * 
 * Integrates the optimized canvas system with the existing game
 * Routes game rendering to appropriate layers
 */

class CanvasLayerAdapter {
    constructor() {
        this.initialized = false;
        this.gameCore = null;
        this.canvasSystem = null;
        
        // Track object positions for dirty rect optimization
        this.objectTracking = {
            balls: new Map(),
            blocks: new Map(),
            particles: new Map()
        };
        
        console.log('🔌 CanvasLayerAdapter initialized');
    }
    
    /**
     * Initialize the adapter
     */
    initialize() {
        if (this.initialized) return;
        
        // Wait for both systems to be ready
        const waitForSystems = () => {
            if (window.OptimizedCanvasSystem && window.gameCore) {
                this.canvasSystem = window.OptimizedCanvasSystem;
                this.gameCore = window.gameCore;
                this.setupAdaptation();
                this.initialized = true;
                console.log('✅ CanvasLayerAdapter connected to game systems');
            } else {
                setTimeout(waitForSystems, 100);
            }
        };
        
        waitForSystems();
    }
    
    /**
     * Setup adaptation between game and canvas system
     */
    setupAdaptation() {
        // Listen for layer redraw events
        window.addEventListener('canvasLayerRedraw', (event) => {
            this.handleLayerRedraw(event.detail);
        });
        
        window.addEventListener('canvasRegionRedraw', (event) => {
            this.handleRegionRedraw(event.detail);
        });
        
        // Override game rendering functions
        this.overrideGameRendering();
        
        // Setup initial static layers
        this.renderStaticLayers();
    }
    
    /**
     * Override game rendering to use layers
     */
    overrideGameRendering() {
        // Store original render function
        const originalRender = window.gameCore?.render || (() => {});
        
        // Replace with layered rendering
        if (window.gameCore) {
            window.gameCore.render = () => {
                // Don't render to main canvas, use layers instead
                this.renderGameToLayers();
            };
        }
        
        // Override particle rendering
        if (window.SmartParticlePlugin || window.SmartParticlePluginOptimized) {
            this.overrideParticleRendering();
        }
    }
    
    /**
     * Override particle rendering to use particle layer
     */
    overrideParticleRendering() {
        const particlePlugin = window.SmartParticlePlugin || 
                               window.SmartParticlePluginOptimized ||
                               window.PluginManager?.getPlugin('SmartParticlePlugin');
        
        if (particlePlugin && particlePlugin.render) {
            const originalRender = particlePlugin.render.bind(particlePlugin);
            
            particlePlugin.render = (currentTime) => {
                const layer = this.canvasSystem.getLayer('particles');
                if (layer) {
                    // Use particle layer context
                    const originalCtx = particlePlugin.ctx;
                    const originalCanvas = particlePlugin.canvas;
                    
                    particlePlugin.ctx = layer.ctx;
                    particlePlugin.canvas = layer.canvas;
                    
                    // Clear and render
                    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                    originalRender(currentTime);
                    
                    // Restore original context
                    particlePlugin.ctx = originalCtx;
                    particlePlugin.canvas = originalCanvas;
                } else {
                    originalRender(currentTime);
                }
            };
        }
    }
    
    /**
     * Render game elements to appropriate layers
     */
    renderGameToLayers() {
        if (!this.gameCore || !this.canvasSystem) return;
        
        const game = this.gameCore;
        
        // Track and render balls
        if (game.balls && game.balls.length > 0) {
            this.renderBalls(game.balls);
        }
        
        // Track and render blocks
        if (game.blocks && game.blocks.length > 0) {
            this.renderBlocks(game.blocks);
        }
        
        // UI updates
        this.renderUI();
    }
    
    /**
     * Render balls with dirty rect tracking
     */
    renderBalls(balls) {
        const layer = this.canvasSystem.getLayer('balls');
        if (!layer) return;
        
        balls.forEach((ball, index) => {
            const prevPos = this.objectTracking.balls.get(index);
            const currentPos = {
                x: ball.x - ball.radius,
                y: ball.y - ball.radius,
                width: ball.radius * 2,
                height: ball.radius * 2
            };
            
            // Mark dirty regions
            if (prevPos) {
                // Mark old position as dirty
                this.canvasSystem.markDirty('balls', 
                    prevPos.x - 2, prevPos.y - 2, 
                    prevPos.width + 4, prevPos.height + 4);
            }
            
            // Mark new position as dirty
            this.canvasSystem.markDirty('balls', 
                currentPos.x - 2, currentPos.y - 2, 
                currentPos.width + 4, currentPos.height + 4);
            
            // Update tracking
            this.objectTracking.balls.set(index, currentPos);
        });
        
        // Remove tracking for balls that no longer exist
        if (this.objectTracking.balls.size > balls.length) {
            for (let i = balls.length; i < this.objectTracking.balls.size; i++) {
                this.objectTracking.balls.delete(i);
            }
        }
    }
    
    /**
     * Render blocks with dirty rect tracking
     */
    renderBlocks(blocks) {
        const layer = this.canvasSystem.getLayer('blocks');
        if (!layer) return;
        
        blocks.forEach((block, index) => {
            if (!block.active) return;
            
            const prevPos = this.objectTracking.blocks.get(index);
            const currentPos = {
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                hp: block.hitPoints
            };
            
            // Check if block changed
            if (!prevPos || 
                prevPos.x !== currentPos.x || 
                prevPos.y !== currentPos.y ||
                prevPos.hp !== currentPos.hp) {
                
                if (prevPos) {
                    // Mark old position as dirty
                    this.canvasSystem.markDirty('blocks', 
                        prevPos.x - 5, prevPos.y - 5, 
                        prevPos.width + 10, prevPos.height + 10);
                }
                
                // Mark new position as dirty
                this.canvasSystem.markDirty('blocks', 
                    currentPos.x - 5, currentPos.y - 5, 
                    currentPos.width + 10, currentPos.height + 10);
                
                // Update tracking
                this.objectTracking.blocks.set(index, currentPos);
            }
        });
    }
    
    /**
     * Render UI elements
     */
    renderUI() {
        // UI updates less frequently, mark dirty when score changes etc
        if (this.shouldUpdateUI()) {
            this.canvasSystem.markLayerDirty('ui');
        }
    }
    
    /**
     * Check if UI should update
     */
    shouldUpdateUI() {
        // Check for score changes, level changes, etc
        const currentScore = window.gameCore?.score || 0;
        const currentLevel = window.gameCore?.level || 1;
        
        if (currentScore !== this.lastScore || currentLevel !== this.lastLevel) {
            this.lastScore = currentScore;
            this.lastLevel = currentLevel;
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle full layer redraw
     */
    handleLayerRedraw(detail) {
        const { layerName, ctx, canvas, time, scale } = detail;
        
        if (!this.gameCore) return;
        
        // Apply resolution scaling
        if (scale !== 1.0) {
            ctx.save();
            ctx.scale(scale, scale);
        }
        
        switch (layerName) {
            case 'background':
                this.drawBackground(ctx, canvas);
                break;
            case 'blocks':
                this.drawBlocks(ctx);
                break;
            case 'balls':
                this.drawBalls(ctx);
                break;
            case 'ui':
                this.drawUI(ctx, canvas);
                break;
            case 'effects':
                this.drawEffects(ctx, time);
                break;
        }
        
        if (scale !== 1.0) {
            ctx.restore();
        }
    }
    
    /**
     * Handle region redraw
     */
    handleRegionRedraw(detail) {
        const { layerName, ctx, canvas, rect, scale } = detail;
        
        if (!this.gameCore) return;
        
        // Apply resolution scaling
        if (scale !== 1.0) {
            ctx.save();
            ctx.scale(scale, scale);
        }
        
        // Render only objects in the dirty region
        switch (layerName) {
            case 'blocks':
                this.drawBlocksInRegion(ctx, rect);
                break;
            case 'balls':
                this.drawBallsInRegion(ctx, rect);
                break;
        }
        
        if (scale !== 1.0) {
            ctx.restore();
        }
    }
    
    /**
     * Render static background
     */
    renderStaticLayers() {
        const bgLayer = this.canvasSystem.getLayer('background');
        if (bgLayer) {
            this.drawBackground(bgLayer.ctx, bgLayer.canvas);
            bgLayer.dirty = false;
        }
    }
    
    /**
     * Draw background - delegate to main game's background function
     */
    drawBackground(ctx, canvas) {
        // Use the main game's background rendering instead of duplicating grid logic
        if (window.drawAnimatedBackground && window.canvas && window.ctx) {
            // Temporarily replace the main canvas context with our layer context
            const originalCanvas = window.canvas;
            const originalCtx = window.ctx;
            
            window.canvas = canvas;
            window.ctx = ctx;
            
            // Call the main game's background renderer
            window.drawAnimatedBackground();
            
            // Restore original context
            window.canvas = originalCanvas;
            window.ctx = originalCtx;
        } else {
            // Fallback: simple solid background without grid
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    /**
     * Draw all blocks
     */
    drawBlocks(ctx) {
        if (!this.gameCore?.blocks) return;
        
        this.gameCore.blocks.forEach(block => {
            if (block.active) {
                this.drawBlock(ctx, block);
            }
        });
    }
    
    /**
     * Draw blocks in specific region
     */
    drawBlocksInRegion(ctx, rect) {
        if (!this.gameCore?.blocks) return;
        
        this.gameCore.blocks.forEach(block => {
            if (block.active && this.isInRegion(block, rect)) {
                this.drawBlock(ctx, block);
            }
        });
    }
    
    /**
     * Draw single block
     */
    drawBlock(ctx, block) {
        // Use block renderer if available
        if (window.BlockRendererFactory) {
            const renderer = window.BlockRendererFactory.getRenderer(block);
            renderer.render(ctx, block, performance.now());
        } else {
            // Fallback rendering
            ctx.fillStyle = block.color || '#4dd0e1';
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Draw HP
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(block.hitPoints, block.x + block.width/2, block.y + block.height/2);
        }
    }
    
    /**
     * Draw all balls
     */
    drawBalls(ctx) {
        if (!this.gameCore?.balls) return;
        
        this.gameCore.balls.forEach(ball => {
            this.drawBall(ctx, ball);
        });
    }
    
    /**
     * Draw balls in specific region
     */
    drawBallsInRegion(ctx, rect) {
        if (!this.gameCore?.balls) return;
        
        this.gameCore.balls.forEach(ball => {
            if (this.isInRegion(ball, rect)) {
                this.drawBall(ctx, ball);
            }
        });
    }
    
    /**
     * Draw single ball - uses sprite if loaded, otherwise fallback to circle
     */
    drawBall(ctx, ball) {
        ctx.save();

        // Check if sprite is loaded
        if (window.ballSprite && window.ballSprite.complete && window.ballSprite.naturalWidth > 0) {
            // Draw sprite
            const spriteSize = ball.radius * 3; // Sprite size relative to ball radius
            const halfSize = spriteSize / 2;

            // Optional: Add glow behind sprite
            const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, spriteSize * 0.6);
            gradient.addColorStop(0, 'rgba(255, 100, 50, 0.4)');
            gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, spriteSize * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Draw the sprite centered on ball position
            ctx.drawImage(
                window.ballSprite,
                ball.x - halfSize,
                ball.y - halfSize,
                spriteSize,
                spriteSize
            );
        } else {
            // Fallback: original circle rendering
            // Glow effect
            const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 1.5);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Ball body
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
    
    /**
     * Draw UI elements
     */
    drawUI(ctx, canvas) {
        if (!this.gameCore) return;
        
        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.gameCore.score || 0}`, 20, 20);
        
        // Level
        ctx.fillText(`Level: ${this.gameCore.level || 1}`, 20, 50);
        
        // FPS counter
        if (this.canvasSystem) {
            const stats = this.canvasSystem.getStats();
            ctx.fillStyle = stats.fps < 30 ? '#ff4444' : stats.fps < 50 ? '#ffaa44' : '#44ff44';
            ctx.font = '16px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`FPS: ${stats.fps} | Scale: ${stats.resolutionScale.toFixed(2)}x`, canvas.width - 20, 20);
        }
    }
    
    /**
     * Draw special effects
     */
    drawEffects(ctx, time) {
        // Render any special effects here
    }
    
    /**
     * Check if object is in region
     */
    isInRegion(obj, rect) {
        const objRect = {
            x: obj.x - (obj.radius || 0),
            y: obj.y - (obj.radius || 0),
            width: obj.width || (obj.radius * 2) || 0,
            height: obj.height || (obj.radius * 2) || 0
        };
        
        return objRect.x < rect.x + rect.width &&
               objRect.x + objRect.width > rect.x &&
               objRect.y < rect.y + rect.height &&
               objRect.y + objRect.height > rect.y;
    }
}

// Create and initialize adapter
window.CanvasLayerAdapter = new CanvasLayerAdapter();
window.CanvasLayerAdapter.initialize();

console.log('🔌 CanvasLayerAdapter loaded - Ready to route rendering to layers');