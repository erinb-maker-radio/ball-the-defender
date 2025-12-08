/**
 * PERFORMANCE MONITOR
 * ==================
 * 
 * Real-time performance monitoring and display system
 * Shows adaptive frame rate and resolution scaling in action
 */

class PerformanceMonitor {
    constructor() {
        this.enabled = false;
        this.overlay = null;
        this.stats = {
            fps: 60,
            frameTime: 16.67,
            resolutionScale: 1.0,
            frameSkip: 0,
            particleCount: 0,
            dirtyRegions: 0,
            renderTime: 0
        };
        
        this.history = {
            fps: [],
            frameTime: [],
            resolutionScale: [],
            maxHistory: 60
        };
        
        this.warningThresholds = {
            lowFPS: 30,
            highFrameTime: 33.33,
            lowResolution: 0.8
        };
        
        console.log('📊 PerformanceMonitor initialized');
    }
    
    /**
     * Initialize the performance overlay
     */
    initialize() {
        if (!this.enabled) return;
        
        this.createOverlay();
        this.startMonitoring();
        
        // Add keyboard toggle (P key)
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'p' && e.ctrlKey) {
                e.preventDefault();
                this.toggle();
            }
        });
        
        console.log('✅ Performance monitor overlay created (Ctrl+P to toggle)');
    }
    
    /**
     * Create performance overlay UI
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'performance-monitor';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 250px;
            border: 1px solid #333;
            backdrop-filter: blur(5px);
        `;
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '×';
        toggleBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: #888;
            font-size: 16px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
        `;
        toggleBtn.onclick = () => this.toggle();
        overlay.appendChild(toggleBtn);
    }
    
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const monitor = (currentTime) => {
            if (!this.enabled) return;
            
            // Calculate frame time
            const frameTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Update stats
            this.updateStats(frameTime);
            
            // Update display every 10 frames
            frameCount++;
            if (frameCount % 10 === 0) {
                this.updateDisplay();
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }
    
    /**
     * Update performance statistics
     */
    updateStats(frameTime) {
        // Calculate FPS
        const fps = Math.round(1000 / frameTime);
        this.stats.fps = isFinite(fps) ? fps : 60;
        this.stats.frameTime = frameTime;
        
        // Get canvas system stats
        if (window.OptimizedCanvasSystem) {
            const canvasStats = window.OptimizedCanvasSystem.getStats();
            this.stats.resolutionScale = canvasStats.resolutionScale;
            this.stats.frameSkip = canvasStats.frameSkip;
            this.stats.dirtyRegions = canvasStats.layers.reduce((sum, layer) => sum + layer.dirtyRects, 0);
        }
        
        // Get particle count
        if (window.SmartParticlePluginOptimized || window.PluginManager) {
            const plugin = window.SmartParticlePluginOptimized || 
                          window.PluginManager?.getPlugin('SmartParticlePlugin');
            if (plugin) {
                this.stats.particleCount = plugin.activeParticleCount || 0;
            }
        }
        
        // Update history
        this.updateHistory();
    }
    
    /**
     * Update performance history
     */
    updateHistory() {
        const maxHist = this.history.maxHistory;
        
        this.history.fps.push(this.stats.fps);
        if (this.history.fps.length > maxHist) this.history.fps.shift();
        
        this.history.frameTime.push(this.stats.frameTime);
        if (this.history.frameTime.length > maxHist) this.history.frameTime.shift();
        
        this.history.resolutionScale.push(this.stats.resolutionScale);
        if (this.history.resolutionScale.length > maxHist) this.history.resolutionScale.shift();
    }
    
    /**
     * Update the display
     */
    updateDisplay() {
        if (!this.overlay || !this.enabled) return;
        
        const stats = this.stats;
        const warnings = this.getWarnings();
        
        // Calculate averages
        const avgFPS = this.calculateAverage(this.history.fps);
        const avgFrameTime = this.calculateAverage(this.history.frameTime);
        const avgScale = this.calculateAverage(this.history.resolutionScale);
        
        const html = `
            <div style="margin-bottom: 10px; color: #ffff00; font-weight: bold;">
                🚀 PERFORMANCE MONITOR
            </div>
            
            <div style="margin-bottom: 8px;">
                <div style="color: ${this.getFPSColor(stats.fps)}; font-weight: bold;">
                    FPS: ${stats.fps} (avg: ${avgFPS.toFixed(1)})
                </div>
                <div style="color: #888; font-size: 10px;">
                    Frame Time: ${stats.frameTime.toFixed(2)}ms (avg: ${avgFrameTime.toFixed(2)}ms)
                </div>
            </div>
            
            <div style="margin-bottom: 8px;">
                <div style="color: ${this.getScaleColor(stats.resolutionScale)}; font-weight: bold;">
                    Resolution: ${(stats.resolutionScale * 100).toFixed(0)}% (avg: ${(avgScale * 100).toFixed(0)}%)
                </div>
                <div style="color: #888; font-size: 10px;">
                    Frame Skip: ${stats.frameSkip}
                </div>
            </div>
            
            <div style="margin-bottom: 8px;">
                <div style="color: ${this.getParticleColor(stats.particleCount)};">
                    Particles: ${stats.particleCount}
                </div>
                <div style="color: #888; font-size: 10px;">
                    Dirty Regions: ${stats.dirtyRegions}
                </div>
            </div>
            
            ${warnings.length > 0 ? `
                <div style="margin-top: 10px; padding: 5px; background: rgba(255, 0, 0, 0.2); border-radius: 3px;">
                    <div style="color: #ff6666; font-weight: bold; margin-bottom: 3px;">⚠️ WARNINGS:</div>
                    ${warnings.map(w => `<div style="color: #ffaa66; font-size: 10px;">• ${w}</div>`).join('')}
                </div>
            ` : ''}
            
            <div style="margin-top: 10px; padding: 5px; background: rgba(0, 255, 0, 0.1); border-radius: 3px;">
                <div style="color: #66ff66; font-weight: bold; margin-bottom: 3px;">🎯 OPTIMIZATIONS:</div>
                <div style="color: #aaffaa; font-size: 10px;">• Multi-layer rendering</div>
                <div style="color: #aaffaa; font-size: 10px;">• Dirty rectangle culling</div>
                <div style="color: #aaffaa; font-size: 10px;">• Object pooling</div>
                <div style="color: #aaffaa; font-size: 10px;">• Adaptive quality scaling</div>
            </div>
            
            <div style="margin-top: 8px; color: #666; font-size: 10px; text-align: center;">
                Ctrl+P to toggle | Click × to hide
            </div>
        `;
        
        this.overlay.innerHTML = html;
        
        // Re-add close button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '×';
        toggleBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: #888;
            font-size: 16px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
        `;
        toggleBtn.onclick = () => this.toggle();
        this.overlay.appendChild(toggleBtn);
    }
    
    /**
     * Get performance warnings
     */
    getWarnings() {
        const warnings = [];
        
        if (this.stats.fps < this.warningThresholds.lowFPS) {
            warnings.push(`Low FPS: ${this.stats.fps} < ${this.warningThresholds.lowFPS}`);
        }
        
        if (this.stats.frameTime > this.warningThresholds.highFrameTime) {
            warnings.push(`High frame time: ${this.stats.frameTime.toFixed(1)}ms`);
        }
        
        if (this.stats.resolutionScale < this.warningThresholds.lowResolution) {
            warnings.push(`Reduced resolution: ${(this.stats.resolutionScale * 100).toFixed(0)}%`);
        }
        
        if (this.stats.particleCount > 200) {
            warnings.push(`High particle count: ${this.stats.particleCount}`);
        }
        
        if (this.stats.frameSkip > 0) {
            warnings.push(`Skipping frames: ${this.stats.frameSkip}`);
        }
        
        return warnings;
    }
    
    /**
     * Get color for FPS display
     */
    getFPSColor(fps) {
        if (fps >= 55) return '#00ff00';      // Green - good
        if (fps >= 40) return '#ffff00';      // Yellow - okay
        if (fps >= 25) return '#ff8800';      // Orange - poor
        return '#ff0000';                     // Red - bad
    }
    
    /**
     * Get color for resolution scale display
     */
    getScaleColor(scale) {
        if (scale >= 0.95) return '#00ff00';  // Green - full res
        if (scale >= 0.80) return '#ffff00';  // Yellow - slightly reduced
        if (scale >= 0.60) return '#ff8800';  // Orange - notably reduced
        return '#ff0000';                     // Red - heavily reduced
    }
    
    /**
     * Get color for particle count display
     */
    getParticleColor(count) {
        if (count <= 50) return '#00ff00';    // Green - low
        if (count <= 150) return '#ffff00';   // Yellow - medium
        if (count <= 300) return '#ff8800';   // Orange - high
        return '#ff0000';                     // Red - very high
    }
    
    /**
     * Calculate average of array
     */
    calculateAverage(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }
    
    /**
     * Toggle monitor visibility
     */
    toggle() {
        if (this.overlay) {
            this.overlay.style.display = this.overlay.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Enable/disable monitoring
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.overlay) {
            this.overlay.style.display = enabled ? 'block' : 'none';
        }
    }
    
    /**
     * Force performance stress test
     */
    stressTest(duration = 5000) {
        console.log('🔥 Starting performance stress test...');
        
        // Create many particles to stress the system
        const originalCreateParticles = window.createImpactParticles;
        let stressInterval;
        
        const stressFunction = () => {
            for (let i = 0; i < 10; i++) {
                if (originalCreateParticles) {
                    originalCreateParticles(
                        Math.random() * 800 + 100,
                        Math.random() * 400 + 100
                    );
                }
            }
        };
        
        stressInterval = setInterval(stressFunction, 100);
        
        setTimeout(() => {
            clearInterval(stressInterval);
            console.log('✅ Stress test completed');
        }, duration);
        
        console.log(`⏱️ Running stress test for ${duration}ms - watch the adaptive scaling!`);
    }
}

// Create global performance monitor
window.PerformanceMonitor = new PerformanceMonitor();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.PerformanceMonitor.initialize(), 1000);
    });
} else {
    setTimeout(() => window.PerformanceMonitor.initialize(), 1000);
}

// Add to window for easy access
window.stressTest = (duration) => window.PerformanceMonitor.stressTest(duration);

console.log('📊 PerformanceMonitor loaded - Real-time optimization monitoring ready');