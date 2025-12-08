/**
 * Performance Plugin - Beautiful performance optimization
 * Replaces the chaotic performance-optimizer.js wrapper
 */

class PerformancePlugin {
    constructor() {
        this.frameHistory = [];
        this.maxHistory = 60;
        this.targetFPS = 60;
        this.currentFPS = 60;
    }
    
    initialize(engine) {
        this.engine = engine;
        console.log('⚡ Performance plugin initialized');
    }
    
    preUpdate(deltaTime, currentTime) {
        // Track frame rate
        this.frameHistory.push(deltaTime);
        if (this.frameHistory.length > this.maxHistory) {
            this.frameHistory.shift();
        }
        
        // Calculate current FPS
        const avgDelta = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
        this.currentFPS = 1000 / avgDelta;
        
        // Adaptive quality - reduce particle count if FPS drops
        if (this.currentFPS < 45 && this.engine.entities.particles.length > 50) {
            // Remove excess particles gracefully
            this.engine.entities.particles.splice(50);
        }
    }
    
    postUpdate(deltaTime, currentTime) {
        // Performance monitoring
        if (this.currentFPS < 30) {
            console.warn(`⚠️ Low FPS detected: ${this.currentFPS.toFixed(1)}`);
        }
    }
    
    onStateChange(oldState, newState) {
        if (newState === 'playing') {
            // Reset performance metrics for new game
            this.frameHistory = [];
        }
    }
    
    // Public API for performance info
    getPerformanceReport() {
        return {
            currentFPS: this.currentFPS,
            targetFPS: this.targetFPS,
            frameHistory: [...this.frameHistory]
        };
    }
}

// Export
window.PerformancePlugin = PerformancePlugin;
console.log('⚡ Beautiful Performance Plugin loaded');