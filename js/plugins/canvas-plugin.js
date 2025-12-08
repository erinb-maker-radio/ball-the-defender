/**
 * Canvas Plugin - Beautiful canvas management
 * Replaces the chaotic canvas-refresh-fix.js wrapper
 */

class CanvasPlugin {
    constructor() {
        this.clearColor = '#0a0a0a';
        this.backgroundGradient = null;
    }
    
    initialize(engine) {
        this.engine = engine;
        this.canvas = engine.canvas;
        this.ctx = engine.ctx;
        
        // Register as the first render layer (background)
        engine.registerRenderLayer('background', 0, this.renderBackground.bind(this));
        
        console.log('🖼️ Canvas plugin initialized');
    }
    
    renderBackground(ctx, entities, gameData, currentTime) {
        // Beautiful animated background
        this.drawAnimatedBackground(ctx, currentTime);
    }
    
    drawAnimatedBackground(ctx, currentTime) {
        // Get background color from theme system
        const colorThemes = this.engine.plugins.get('colorThemes');
        const backgroundColor = colorThemes ? colorThemes.getBackgroundColor() : '#0a0a23';
        
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    onStateChange(oldState, newState) {
        // Adjust background based on state
        if (newState === 'paused') {
            this.clearColor = '#1a1a2e';
        } else {
            this.clearColor = '#0a0a0a';
        }
    }
}

// Export
window.CanvasPlugin = CanvasPlugin;
console.log('🖼️ Beautiful Canvas Plugin loaded');