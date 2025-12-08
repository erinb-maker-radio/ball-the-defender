/**
 * Renderer Plugin - Beautiful visual rendering
 * Clean separation of rendering from game logic
 */

class RendererPlugin {
    constructor() {
        this.colorThemes = null;
        this.activeTheme = null;
    }
    
    onThemeChange(theme) {
        this.activeTheme = theme;
        console.log('🎨 Renderer updated with new theme');
    }
    
    initialize(engine) {
        this.engine = engine;
        this.canvas = engine.canvas;
        this.ctx = engine.ctx;
        
        // Get color theme system
        this.colorThemes = engine.plugins.get('colorThemes');
        if (this.colorThemes) {
            this.activeTheme = this.colorThemes.activeTheme;
        }
        
        // Get particle system
        this.particleSystem = engine.plugins.get('particles');
        
        // Initialize advanced renderer system
        this.advancedRenderer = new AdvancedRendererSystem();
        this.advancedRenderer.initialize(engine);
        
        // Register render layers
        engine.registerRenderLayer('blocks', 100, this.renderBlocks.bind(this));
        engine.registerRenderLayer('balls', 200, this.renderBalls.bind(this));
        engine.registerRenderLayer('particles', 300, this.renderParticles.bind(this));
        engine.registerRenderLayer('ui', 1000, this.renderUI.bind(this));
        
        console.log('🎨 Renderer plugin initialized with advanced effects');
    }
    
    renderBlocks(ctx, entities, gameData, currentTime) {
        entities.blocks.forEach(block => {
            if (block.destroyed) return;
            
            // Use advanced renderer system for all block rendering
            this.advancedRenderer.renderBlock(ctx, block, currentTime);
        });
    }
    
    // Advanced block rendering is now handled by AdvancedRendererSystem
    
    renderBalls(ctx, entities, gameData, currentTime) {
        entities.balls.forEach(ball => {
            if (!ball.active) return;
            
            this.renderBall(ctx, ball, currentTime);
        });
    }
    
    renderBall(ctx, ball, currentTime) {
        if (!this.colorThemes) return;
        
        const ballColors = this.colorThemes.getBallColors();
        
        ctx.save();
        
        // Check if ball is detonating (Ball Go Boom mode)
        const isDetonating = ball.detonating === true;
        
        // Ball trail with theme colors
        if (ball.trail) {
            ball.trail.forEach((point, i) => {
                const alpha = point.alpha * 0.3;
                const radius = ball.radius * (0.5 + alpha * 0.5);
                
                ctx.globalAlpha = alpha;
                ctx.fillStyle = ballColors.trail;
                ctx.beginPath();
                ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        // Main ball with glow effect
        ctx.globalAlpha = 1;
        
        if (isDetonating) {
            // Detonating ball - red flame effect
            this.renderDetontatingBall(ctx, ball, currentTime);
        } else {
            // Normal ball - beautiful gradient with glow
            ctx.shadowColor = ballColors.main;
            ctx.shadowBlur = 15;
            
            // Beautiful gradient
            const gradient = ctx.createRadialGradient(
                ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
                ball.x, ball.y, ball.radius
            );
            gradient.addColorStop(0, this.lightenColor(ballColors.main, 0.3));
            gradient.addColorStop(1, ballColors.main);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Subtle border
            ctx.shadowBlur = 0;
            ctx.strokeStyle = this.darkenColor(ballColors.main, 0.2);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    renderDetontatingBall(ctx, ball, currentTime) {
        // Explosive flame effect for Ball Go Boom mode
        const time = currentTime * 0.01;
        
        // Multiple flame layers
        const flameLayers = [
            { color: '#ff0000', radius: ball.radius * 1.6, alpha: 0.5 },
            { color: '#ff4400', radius: ball.radius * 1.3, alpha: 0.7 },
            { color: '#ff8800', radius: ball.radius * 1.0, alpha: 0.9 }
        ];
        
        flameLayers.forEach(layer => {
            ctx.globalAlpha = layer.alpha;
            ctx.shadowColor = layer.color;
            ctx.shadowBlur = 35;
            ctx.fillStyle = layer.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, layer.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
    
    lightenColor(color, factor) {
        // Simple color lightening utility
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * factor * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, factor) {
        // Simple color darkening utility
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * factor * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    renderParticles(ctx, entities, gameData, currentTime) {
        // Use sophisticated particle system for rendering
        if (this.particleSystem) {
            this.particleSystem.render(ctx);
        }
        
        // Legacy particle fallback (in case any still exist in entities)
        if (entities.particles && entities.particles.length > 0) {
            entities.particles.forEach(particle => {
                ctx.save();
                ctx.globalAlpha = particle.alpha || particle.life;
                ctx.fillStyle = particle.color;
                
                if (particle.size) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
                }
                
                ctx.restore();
            });
        }
    }
    
    renderUI(ctx, entities, gameData, currentTime) {
        ctx.save();
        
        // Game state overlay
        if (this.engine.state === 'paused') {
            this.renderPausedOverlay(ctx);
        } else if (this.engine.state === 'gameOver') {
            this.renderGameOverOverlay(ctx, gameData);
        } else if (this.engine.state === 'playing' && gameData.ballsLaunched === 0) {
            this.renderIdleOverlay(ctx);
        }
        
        // Score and level (always visible during gameplay)
        if (this.engine.state === 'playing') {
            this.renderGameStats(ctx, gameData);
        }
        
        ctx.restore();
    }
    
    renderPausedOverlay(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Paused text
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    renderGameOverOverlay(ctx, gameData) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over text
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 20;
        ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Final score
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Final Score: ${gameData.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    renderIdleOverlay(ctx) {
        // Show "Click to Launch Ball" instruction
        if (this.engine.gameData.ballsLaunched === 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.fillText('Click anywhere to launch ball!', this.canvas.width / 2, this.canvas.height / 2);
            ctx.restore();
        }
    }
    
    renderGameStats(ctx, gameData) {
        const textColor = this.colorThemes?.activeTheme?.text || '#ffffff';
        
        ctx.fillStyle = textColor;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        
        ctx.fillText(`Score: ${gameData.score}`, 10, 10);
        ctx.fillText(`Level: ${gameData.level}`, 10, 35);
        ctx.fillText(`Balls: ${gameData.ballCount}`, 10, 60);
    }
}

// Export
window.RendererPlugin = RendererPlugin;
console.log('🎨 Beautiful Renderer Plugin loaded');