/**
 * Advanced Renderer System - Latest GitHub visual effects
 * Clean, extensible architecture for sophisticated block rendering
 */

class AdvancedRendererSystem {
    constructor() {
        this.renderers = new Map();
        this.effectCache = new Map();
        this.animationTime = 0;
        this.frameCounter = 0;
        
        this.registerBuiltInRenderers();
        console.log('🎨 Advanced Renderer System created');
    }
    
    initialize(engine) {
        this.engine = engine;
        this.colorThemes = engine.plugins.get('colorThemes');
        console.log('🎨 Advanced Renderer System initialized');
    }
    
    registerBuiltInRenderers() {
        // Normal blocks with beautiful gradients and effects
        this.registerRenderer('normal', new NormalBlockRenderer());
        
        // Special exploder blocks with rainbow chaos effects
        this.registerRenderer('exploder', new ExploderBlockRenderer());
        
        // Freeze blocks with ice crystal effects  
        this.registerRenderer('freeze', new FreezeBlockRenderer());
        
        // Spawner blocks with golden effects
        this.registerRenderer('spawner', new SpawnerBlockRenderer());
        
        console.log('🎨 Built-in renderers registered');
    }
    
    registerRenderer(type, renderer) {
        this.renderers.set(type, renderer);
        renderer.setRendererSystem(this);
    }
    
    renderBlock(ctx, block, currentTime) {
        this.animationTime = currentTime * 0.001;
        this.frameCounter++;
        
        // Determine renderer type
        let rendererType = 'normal';
        if (block.specialType) {
            rendererType = block.specialType;
        } else if (block.frozen) {
            rendererType = 'freeze';
        }
        
        // Get appropriate renderer
        const renderer = this.renderers.get(rendererType);
        if (renderer) {
            renderer.render(ctx, block, currentTime, this.colorThemes);
        } else {
            // Fallback to normal renderer
            this.renderers.get('normal').render(ctx, block, currentTime, this.colorThemes);
        }
    }
    
    // Utility methods for renderers
    createCachedGradient(key, createFn, cacheDuration = 100) {
        const now = this.frameCounter;
        const cached = this.effectCache.get(key);
        
        if (cached && (now - cached.frame) < cacheDuration) {
            return cached.gradient;
        }
        
        const gradient = createFn();
        this.effectCache.set(key, { gradient, frame: now });
        return gradient;
    }
    
    getAnimationTime() {
        return this.animationTime;
    }
}

/**
 * Base Block Renderer Class
 */
class BaseBlockRenderer {
    constructor() {
        this.rendererSystem = null;
    }
    
    setRendererSystem(system) {
        this.rendererSystem = system;
    }
    
    getColors(block, colorThemes) {
        if (!colorThemes) return this.getFallbackColors();
        
        if (block.specialType) {
            return colorThemes.activeTheme.special[block.specialType] || this.getFallbackColors();
        }
        
        return colorThemes.getBlockColors(block);
    }
    
    getFallbackColors() {
        return {
            base: '#4CAF50',
            glow: '#81C784', 
            shadow: '#388E3C'
        };
    }
    
    render(ctx, block, currentTime, colorThemes) {
        throw new Error('BaseBlockRenderer.render() must be implemented');
    }
}

/**
 * Normal Block Renderer - Beautiful gradients and effects
 */
class NormalBlockRenderer extends BaseBlockRenderer {
    render(ctx, block, currentTime, colorThemes) {
        const colors = this.getColors(block, colorThemes);
        const time = this.rendererSystem.getAnimationTime();
        
        ctx.save();
        
        // Beautiful pulse animation
        const pulsePhase = Math.sin(time * 2 + block.x * 0.01) * 0.05 + 1;
        const pulsedWidth = block.width * pulsePhase;
        const pulsedHeight = block.height * pulsePhase;
        const offsetX = (block.width - pulsedWidth) / 2;
        const offsetY = (block.height - pulsedHeight) / 2;
        
        // Health-based glow effect
        const healthRatio = block.hitPoints / block.maxHitPoints;
        if (healthRatio < 0.5) {
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 15 * (1 - healthRatio);
        }
        
        // Create sophisticated gradient
        const gradient = ctx.createLinearGradient(
            block.x + offsetX, block.y + offsetY,
            block.x + offsetX + pulsedWidth, block.y + offsetY + pulsedHeight
        );
        gradient.addColorStop(0, colors.glow);
        gradient.addColorStop(0.5, colors.base);
        gradient.addColorStop(1, colors.shadow);
        
        // Render block
        ctx.fillStyle = gradient;
        ctx.fillRect(block.x + offsetX, block.y + offsetY, pulsedWidth, pulsedHeight);
        
        // Beautiful border
        ctx.strokeStyle = colors.shadow;
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x + offsetX, block.y + offsetY, pulsedWidth, pulsedHeight);
        
        // HP text with health-based colors
        this.renderHPText(ctx, block, offsetX, offsetY, pulsedWidth, pulsedHeight);
        
        ctx.restore();
    }
    
    renderHPText(ctx, block, offsetX, offsetY, width, height) {
        const centerX = block.x + offsetX + width / 2;
        const centerY = block.y + offsetY + height / 2;
        const healthRatio = block.hitPoints / block.maxHitPoints;
        
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        
        // Health-based text color
        if (healthRatio > 0.6) {
            ctx.fillStyle = '#ffffff';
        } else if (healthRatio > 0.3) {
            ctx.fillStyle = '#ffff00';
        } else {
            ctx.fillStyle = '#ff4444';
        }
        
        ctx.fillText(block.hitPoints, centerX, centerY);
        ctx.shadowBlur = 0;
    }
}

/**
 * Exploder Block Renderer - Rainbow chaos effects from latest version
 */
class ExploderBlockRenderer extends BaseBlockRenderer {
    constructor() {
        super();
        this.chaosColors = [
            '#ff1744', '#d500f9', '#3d5afe', '#00bcd4', '#4caf50'
        ];
        this.cycleSpeed = 0.5;
        this.shakeSpeed = 2.0;
    }
    
    render(ctx, block, currentTime, colorThemes) {
        const time = this.rendererSystem.getAnimationTime();
        
        ctx.save();
        
        // Signature shake effect
        const shakePhase = time * this.shakeSpeed * Math.PI * 2;
        const shakeX = block.x + Math.sin(shakePhase) * 1.0;
        const shakeY = block.y + Math.sin(shakePhase * 1.37) * 0.6;
        
        // Pulsing effect
        const pulseEffect = Math.sin(time * 1) * 0.05 + 1;
        const pulsedWidth = block.width * pulseEffect;
        const pulsedHeight = block.height * pulseEffect;
        const offsetX = (block.width - pulsedWidth) / 2;
        const offsetY = (block.height - pulsedHeight) / 2;
        
        // Rainbow chaos gradient
        const gradient = this.createRainbowGradient(
            ctx, shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight, time
        );
        
        // Epic glow effect
        const currentColor = this.getCurrentChaosColor(time);
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 25;
        
        // Draw rainbow chaos block
        ctx.fillStyle = gradient;
        ctx.fillRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
        
        // Pulsing border
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2 + Math.sin(time * 2) * 0.5;
        ctx.strokeRect(shakeX + offsetX, shakeY + offsetY, pulsedWidth, pulsedHeight);
        
        // Bomb icon
        this.renderBombIcon(ctx, shakeX + offsetX + pulsedWidth/2, shakeY + offsetY + pulsedHeight/2, 
                           Math.min(pulsedWidth, pulsedHeight) * 0.6);
        
        ctx.restore();
    }
    
    createRainbowGradient(ctx, x, y, width, height, time) {
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        
        for (let i = 0; i <= 4; i++) {
            const colorIndex = (Math.floor(time * this.cycleSpeed * this.chaosColors.length) + i) % this.chaosColors.length;
            gradient.addColorStop(i / 4, this.chaosColors[colorIndex]);
        }
        
        return gradient;
    }
    
    getCurrentChaosColor(time) {
        const index = Math.floor(time * this.cycleSpeed * this.chaosColors.length) % this.chaosColors.length;
        return this.chaosColors[index];
    }
    
    renderBombIcon(ctx, x, y, size) {
        ctx.shadowBlur = 0;
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // White outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeText('💣', x, y);
        
        // Black center
        ctx.fillStyle = '#000000';
        ctx.fillText('💣', x, y);
    }
}

/**
 * Freeze Block Renderer - Ice crystal effects from latest version  
 */
class FreezeBlockRenderer extends BaseBlockRenderer {
    render(ctx, block, currentTime, colorThemes) {
        const time = this.rendererSystem.getAnimationTime();
        const colors = this.getIceColors(colorThemes);
        
        ctx.save();
        
        // Crystal pulse and rotation
        const pulsePhase = Math.sin(time * 1.5) * 0.1 + 1;
        const rotatePhase = Math.sin(time * 0.5) * 5;
        
        const pulsedWidth = block.width * pulsePhase;
        const pulsedHeight = block.height * pulsePhase;
        const offsetX = (block.width - pulsedWidth) / 2;
        const offsetY = (block.height - pulsedHeight) / 2;
        
        // Epic neon glow
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 30 + Math.sin(time * 2) * 10;
        
        // Apply rotation transform
        ctx.translate(block.x + block.width/2, block.y + block.height/2);
        ctx.rotate((rotatePhase * Math.PI) / 180);
        ctx.translate(-(block.width/2), -(block.height/2));
        
        // Subzero dark gradient
        const gradient = this.createIceGradient(ctx, offsetX, offsetY, pulsedWidth, pulsedHeight, colors);
        
        // Draw crystal body
        ctx.fillStyle = gradient;
        ctx.fillRect(offsetX, offsetY, pulsedWidth, pulsedHeight);
        
        // Neon border
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX, offsetY, pulsedWidth, pulsedHeight);
        
        // Inner glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.base;
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.3 + Math.sin(time * 3) * 0.2})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(offsetX + 2, offsetY + 2, pulsedWidth - 4, pulsedHeight - 4);
        
        // Spinning snowflake
        this.renderSnowflake(ctx, block.width/2, block.height/2, time);
        
        ctx.restore();
    }
    
    getIceColors(colorThemes) {
        const baseColors = colorThemes?.activeTheme?.special?.freeze || {};
        return {
            base: baseColors.base || '#002952',
            glow: baseColors.glow || '#00a3ff', 
            shadow: baseColors.shadow || '#000a1a',
            accent: baseColors.accent || '#005080'
        };
    }
    
    createIceGradient(ctx, x, y, width, height, colors) {
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, colors.shadow);
        gradient.addColorStop(0.25, '#001833');
        gradient.addColorStop(0.5, colors.base);
        gradient.addColorStop(0.75, colors.accent);
        gradient.addColorStop(1, colors.glow);
        return gradient;
    }
    
    renderSnowflake(ctx, centerX, centerY, time) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((time * Math.PI) / 1.5);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText('❄️', 0, 0);
        ctx.fillText('❄️', 0, 0);
        
        ctx.restore();
    }
}

/**
 * Spawner Block Renderer - Golden effects
 */
class SpawnerBlockRenderer extends BaseBlockRenderer {
    render(ctx, block, currentTime, colorThemes) {
        const colors = this.getColors(block, colorThemes);
        const time = this.rendererSystem.getAnimationTime();
        
        ctx.save();
        
        // Golden glow effect
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 30;
        
        // Pulsing golden gradient
        const gradient = ctx.createRadialGradient(
            block.x + block.width/2, block.y + block.height/2, 0,
            block.x + block.width/2, block.y + block.height/2, block.width/2
        );
        gradient.addColorStop(0, colors.glow);
        gradient.addColorStop(0.7, colors.base);
        gradient.addColorStop(1, colors.shadow);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Golden border
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = 3;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
        
        // Star icon
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = `${Math.min(block.width, block.height) * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const icon = '⭐';
        ctx.strokeText(icon, block.x + block.width/2, block.y + block.height/2);
        ctx.fillText(icon, block.x + block.width/2, block.y + block.height/2);
        
        ctx.restore();
    }
}

// Export
window.AdvancedRendererSystem = AdvancedRendererSystem;
console.log('🎨 Advanced Renderer System loaded');