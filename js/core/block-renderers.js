// BALL DEFENDER - CLEAN BLOCK RENDERING SYSTEM
// Proper abstraction for different block types

// Base Block Renderer
class BlockRenderer {
    render(ctx, block, currentTime) {
        throw new Error('BlockRenderer.render() must be implemented by subclass');
    }
    
    // Get special block colors - SINGLE SOURCE OF TRUTH
    getSpecialColors(type) {
        // FIRST: Check for theme colors
        if (window.getThemeBlockColors) {
            const themeColors = window.getThemeBlockColors(type, 'full');
            if (themeColors && themeColors.fill) {
                // Using theme colors for special block (no logging needed)
                return {
                    base: themeColors.fill,
                    glow: themeColors.glow || themeColors.fill,
                    shadow: themeColors.shadow || '#000000'
                };
            }
        }
        
        // FALLBACK: SINGLE SOURCE OF TRUTH: window.colors
        if (window.colors && window.colors.special && window.colors.special[type]) {
            return window.colors.special[type];
        }
        
        // Emergency fallback if window.colors not initialized
        console.warn(`⚠️ window.colors.special.${type} not found!`);
        const defaults = {
            spawner: { base: '#FFD700', glow: '#FFF59D', shadow: '#F9A825' },
            exploder: { base: '#FF6F00', glow: '#FFB300', shadow: '#E65100' },
            freeze: { base: '#00e5ff', glow: '#b3e5fc', shadow: '#0277bd' }
        };
        return defaults[type] || defaults.spawner;
    }
    
    // Shared utility methods
    createBasicGradient(ctx, x, y, width, height, colors) {
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, colors.glow);
        gradient.addColorStop(0.3, colors.base);
        gradient.addColorStop(1, colors.shadow);
        return gradient;
    }
    
    applyGlowEffect(ctx, colors, isSpecial, glowLevel = 0) {
        if (glowLevel > 0 || isSpecial) {
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = isSpecial ? 30 : glowLevel * 20;
        }
    }
    
    drawBlockBase(ctx, x, y, width, height, gradient, strokeColor) {
        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // Add colored border only (no black outline - Ball Go Boom style)
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }
}

// Normal Block Renderer
class NormalBlockRenderer extends BlockRenderer {
    constructor() {
        super();
        // No need for colorScheme - using window.colors as single source of truth
    }
    
    render(ctx, block, currentTime) {
        // Get appropriate colors based on HP and mode
        const colors = this.getBlockColors(block);
        
        // Apply glow effect
        ctx.save();
        this.applyGlowEffect(ctx, colors, false, block.glow);
        
        // Gentle animation
        const time = currentTime * 0.002 + block.x * 0.01;
        const pulseEffect = Math.sin(time) * 0.05 + 1;
        
        const pulsedWidth = block.width * pulseEffect;
        const pulsedHeight = block.height * pulseEffect;
        const offsetX = (block.width - pulsedWidth) / 2;
        const offsetY = (block.height - pulsedHeight) / 2;
        
        // Create gradient
        const gradient = this.createBasicGradient(
            ctx,
            block.x + offsetX,
            block.y + offsetY,
            pulsedWidth,
            pulsedHeight,
            colors
        );
        
        // Draw block with colored border (Ball Go Boom style)
        this.drawBlockBase(
            ctx,
            block.x + offsetX,
            block.y + offsetY,
            pulsedWidth,
            pulsedHeight,
            gradient,
            colors.border || colors.base  // Use border color if available, else base
        );
        
        ctx.restore();
    }
    
    getBlockColors(block) {
        const hp = block.hitPoints;
        const maxHp = block.maxHitPoints || hp; // Use maxHitPoints if available
        
        // FIRST: Check for theme colors
        if (window.getThemeBlockColors) {
            // For normal blocks, use HP value; for special blocks, use their type
            const blockType = block.specialType || `hp${hp}`;
            const healthPercent = hp / maxHp;
            
            let damageState = 'full';
            if (healthPercent <= 0.3) {
                damageState = 'critical';
            } else if (healthPercent <= 0.6) {
                damageState = 'damaged';
            }
            
            const themeColors = window.getThemeBlockColors(blockType, damageState);
            
            if (themeColors && themeColors.fill) {
                // Using theme colors (no logging needed)
                return {
                    base: themeColors.fill,
                    glow: themeColors.glow || themeColors.fill,
                    shadow: themeColors.shadow || '#000000',
                    border: themeColors.border || themeColors.fill
                };
            }
        }
        
        // FALLBACK: Use window.colors system
        if (window.colors && window.colors.blockByHP) {
            const colorConfig = window.colors.blockByHP[hp] || 
                              window.colors.blockByHP.default || 
                              { base: '#666666', glow: '#888888', shadow: '#444444' };
            // Using fallback colors (no logging needed)
            return colorConfig;
        }
        
        // Emergency fallback if nothing is initialized
        console.warn('⚠️ No color system initialized!');
        return { base: '#666666', glow: '#888888', shadow: '#444444' };
    }
}

// Spawner Block Renderer
class SpawnerBlockRenderer extends BlockRenderer {
    render(ctx, block, currentTime) {
        // Get colors based on the actual special type
        const colors = this.getSpecialColors(block.specialType || 'spawner');
        
        ctx.save();
        this.applyGlowEffect(ctx, colors, true);
        
        // Special pulsing animation
        const time = currentTime * 0.002 + block.x * 0.01;
        const pulseEffect = Math.sin(time * 2) * 0.1 + 1;
        
        const pulsedWidth = block.width * pulseEffect;
        const pulsedHeight = block.height * pulseEffect;
        const offsetX = (block.width - pulsedWidth) / 2;
        const offsetY = (block.height - pulsedHeight) / 2;
        
        // Create gradient
        const gradient = this.createBasicGradient(
            ctx,
            block.x + offsetX,
            block.y + offsetY,
            pulsedWidth,
            pulsedHeight,
            colors
        );
        
        // Draw block with colored border (Ball Go Boom style)
        this.drawBlockBase(
            ctx,
            block.x + offsetX,
            block.y + offsetY,
            pulsedWidth,
            pulsedHeight,
            gradient,
            colors.border || colors.base  // Use border color if available, else base
        );
        
        // Draw appropriate icon based on special type
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.min(pulsedWidth, pulsedHeight) * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Choose icon based on special type
        const icon = block.specialType === 'exploder' ? '💣' : '⭐';
        ctx.strokeText(icon, block.x + block.width/2, block.y + block.height/2);
        ctx.fillText(icon, block.x + block.width/2, block.y + block.height/2);
        
        ctx.restore();
    }
}

// FREEZE BLOCK RENDERER - Ice Mode Special (Optimized)
class FreezeBlockRenderer extends BlockRenderer {
    constructor() {
        super();
        // PERFORMANCE: No animation timing needed
    }
    
    render(ctx, block, currentTime) {
        // OPTIMIZED: Simplified freeze block rendering
        ctx.save();
        
        // Use same color system as all other renderers  
        const baseColors = this.getSpecialColors('freeze') || {};
        const crystalColors = {
            base: baseColors.base || '#00bcd4',     // Ice cyan
            glow: baseColors.glow || '#80deea',     // Light cyan glow
            shadow: baseColors.shadow || '#004d5c'  // Dark cyan shadow
        };
        
        // PERFORMANCE: Simple static crystal block (no pulsing, no rotation)
        // Basic shadow for depth
        ctx.shadowColor = crystalColors.shadow;
        ctx.shadowBlur = 8; // Fixed shadow, no animation
        
        // Simple gradient (2 stops instead of 5)
        const gradient = ctx.createLinearGradient(
            block.x, block.y, 
            block.x + block.width, block.y + block.height
        );
        gradient.addColorStop(0, crystalColors.base);
        gradient.addColorStop(1, crystalColors.glow);
        
        // Draw crystal body (no size changes)
        ctx.fillStyle = gradient;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Simple border (no neon effects, no black outline - Ball Go Boom style)
        ctx.strokeStyle = crystalColors.glow;
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
        
        // Static snowflake (no spinning, no outline)
        ctx.shadowBlur = 0; // No glow on snowflake
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial'; // Smaller snowflake
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❄️', block.x + block.width/2, block.y + block.height/2);
        
        ctx.restore();
    }
}

// RAINBOW CHAOS EXPLODER RENDERER - The star of the show!
class ExploderBlockRenderer extends BlockRenderer {
    constructor() {
        super();
        
        // Rainbow chaos colors (optimized for performance)
        this.chaosColors = [
            '#ff1744', // Electric Red
            '#d500f9', // Neon Purple  
            '#3d5afe', // Electric Blue
            '#00bcd4', // Cyan Lightning
            '#4caf50'  // Neon Green
        ];
        
        // Animation settings
        this.cycleSpeed = 0.5; // Full color cycle every 2 seconds - reduced from 2.0
        this.shakeSpeed = 2.0; // Shake cycles per second - reduced from 8.0 (4x slower!)
        this.frameCounter = 0;
        this.gradientCache = null;
        this.cacheValidTime = 0;
    }
    
    render(ctx, block, currentTime) {
        this.frameCounter++;
        const time = currentTime * 0.001; // Convert to seconds
        
        ctx.save();
        
        // Time-based shake animation (frame-rate independent!)
        const shakePhase = time * this.shakeSpeed * Math.PI * 2;
        const shakeX = block.x + Math.sin(shakePhase) * 1.0; // Reduced shake distance from 2.0 to 1.0
        const shakeY = block.y + Math.sin(shakePhase * 1.37) * 0.6; // Reduced shake distance from 1.2 to 0.6
        
        // Pulsing effect
        const pulseEffect = Math.sin(time * 1) * 0.05 + 1; // Reduced from 3 to 1 Hz, and 0.1 to 0.05 amplitude
        const pulsedWidth = block.width * pulseEffect;
        const pulsedHeight = block.height * pulseEffect;
        const offsetX = (block.width - pulsedWidth) / 2;
        const offsetY = (block.height - pulsedHeight) / 2;
        
        // Create rainbow chaos gradient (cached for performance)
        const gradient = this.getRainbowGradient(ctx, shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight, time);
        
        // Epic glow effect
        const currentColor = this.getCurrentChaosColor(time);
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 25;
        
        // Draw rainbow chaos background
        ctx.fillStyle = gradient;
        ctx.fillRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
        
        // Pulsing border
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2 + Math.sin(time * 2) * 0.5; // Reduced from 6 to 2 Hz, and amplitude from 1 to 0.5
        ctx.strokeRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
        
        // Clear shadow for icon
        ctx.shadowBlur = 0;
        
        // Draw steady bomb icon (no flashing!)
        const iconSize = Math.min(pulsedWidth, pulsedHeight) * 0.6;
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const iconX = shakeX + offsetX + pulsedWidth / 2;
        const iconY = shakeY + offsetY + pulsedHeight / 2;
        
        // White outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeText('💣', iconX, iconY);
        
        // Black center
        ctx.fillStyle = '#000000';
        ctx.fillText('💣', iconX, iconY);
        
        ctx.restore();
    }
    
    getRainbowGradient(ctx, x, y, width, height, time) {
        // Performance optimization: cache gradient for 10 frames
        const cacheInterval = 10;
        
        if (this.frameCounter % cacheInterval === 0 || !this.gradientCache || time - this.cacheValidTime > 0.1) {
            // Time-based color cycling
            const cycleProgress = (time * this.cycleSpeed) % 1.0;
            const colorIndex = Math.floor(cycleProgress * this.chaosColors.length);
            
            // Create conic gradient for classic chaos look
            const gradient = ctx.createConicGradient(0, x + width/2, y + height/2);
            
            // Add rainbow stops with rotation
            for (let i = 0; i < this.chaosColors.length; i++) {
                const stop = i / this.chaosColors.length;
                const colorIndexOffset = (i + colorIndex) % this.chaosColors.length;
                gradient.addColorStop(stop, this.chaosColors[colorIndexOffset]);
            }
            
            // Complete the circle
            gradient.addColorStop(1.0, this.chaosColors[colorIndex]);
            
            this.gradientCache = gradient;
            this.cacheValidTime = time;
        }
        
        return this.gradientCache;
    }
    
    getCurrentChaosColor(time) {
        const cycleProgress = (time * this.cycleSpeed) % 1.0;
        const colorIndex = Math.floor(cycleProgress * this.chaosColors.length);
        return this.chaosColors[colorIndex];
    }
}

// Export classes for global access (transitional)
window.BlockRenderer = BlockRenderer;
window.NormalBlockRenderer = NormalBlockRenderer;
window.SpawnerBlockRenderer = SpawnerBlockRenderer;
window.ExploderBlockRenderer = ExploderBlockRenderer;

console.log('🎨 Block Renderers loaded - Clean rendering abstraction ready');