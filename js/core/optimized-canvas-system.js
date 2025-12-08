/**
 * OPTIMIZED CANVAS SYSTEM
 * ======================
 * 
 * High-performance multi-layer canvas rendering with:
 * - Layer separation for static/dynamic content
 * - Dirty rectangle tracking and updates
 * - Adaptive frame rate throttling
 * - Resolution scaling for performance
 */

class OptimizedCanvasSystem {
    constructor() {
        this.layers = new Map();
        this.dirtyRegions = new Map();
        this.isInitialized = false;
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.frameTime = 16.67; // Target 60fps
        this.currentFPS = 60;
        this.targetFPS = 60;
        
        // Adaptive frame rate settings
        this.adaptiveFrameRate = true;
        this.minFPS = 30;
        this.maxFPS = 60;
        this.frameSkip = 0;
        this.frameSkipCounter = 0;
        
        // Resolution scaling
        this.resolutionScale = 1.0;
        this.minResolutionScale = 0.5;
        this.autoScaleResolution = true;
        this.nativeWidth = 1000;
        this.nativeHeight = 700;
        
        // Layer definitions
        this.layerConfig = {
            background: {
                zIndex: 1,
                static: true,
                clearOnDraw: false,
                updateFrequency: 0 // Never updates after initial draw
            },
            blocks: {
                zIndex: 2,
                static: false,
                clearOnDraw: true,
                updateFrequency: 2, // Update every 2 frames
                useDirtyRects: true
            },
            balls: {
                zIndex: 3,
                static: false,
                clearOnDraw: true,
                updateFrequency: 1, // Update every frame
                useDirtyRects: true
            },
            particles: {
                zIndex: 4,
                static: false,
                clearOnDraw: true,
                updateFrequency: 1,
                useDirtyRects: false // Particles move too much for dirty rects
            },
            effects: {
                zIndex: 5,
                static: false,
                clearOnDraw: true,
                updateFrequency: 1,
                useDirtyRects: true
            },
            ui: {
                zIndex: 10,
                static: false,
                clearOnDraw: false,
                updateFrequency: 4, // UI updates less frequently
                useDirtyRects: true
            }
        };
        
        // Dirty rectangle tracking
        this.maxDirtyRects = 20;
        this.dirtyRectMergeThreshold = 100; // Merge rects closer than this
        
        console.log('🎨 OptimizedCanvasSystem initialized');
    }
    
    /**
     * Initialize the multi-layer canvas system
     */
    initialize() {
        if (this.isInitialized) return;
        
        const gameContainer = document.getElementById('gameContainer') || document.body;
        const gameCanvas = document.getElementById('gameCanvas');
        
        if (!gameCanvas) {
            console.error('❌ Game canvas not found');
            return;
        }
        
        // Store native resolution
        this.nativeWidth = gameCanvas.width;
        this.nativeHeight = gameCanvas.height;
        
        // Don't hide the original canvas - let it render normally
        // gameCanvas.style.display = 'none';
        
        // Create container for layered canvases
        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'optimizedCanvasContainer';
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.width = this.nativeWidth + 'px';
        canvasContainer.style.height = this.nativeHeight + 'px';
        canvasContainer.style.left = gameCanvas.offsetLeft + 'px';
        canvasContainer.style.top = gameCanvas.offsetTop + 'px';
        canvasContainer.style.pointerEvents = 'none'; // Don't interfere with game interactions
        canvasContainer.style.display = 'none'; // Hide the layer system for now
        
        gameCanvas.parentNode.insertBefore(canvasContainer, gameCanvas);
        
        // Create layers
        Object.entries(this.layerConfig).forEach(([layerName, config]) => {
            this.createLayer(layerName, config, canvasContainer);
        });
        
        // Setup composite canvas for final output
        this.createCompositeCanvas(canvasContainer);
        
        // Start render loop
        this.startOptimizedRenderLoop();
        
        this.isInitialized = true;
        console.log('✅ OptimizedCanvasSystem initialized with', this.layers.size, 'layers');
    }
    
    /**
     * Create a canvas layer
     */
    createLayer(name, config, container) {
        const canvas = document.createElement('canvas');
        canvas.id = `canvas-layer-${name}`;
        canvas.width = this.nativeWidth;
        canvas.height = this.nativeHeight;
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.zIndex = config.zIndex;
        canvas.style.pointerEvents = name === 'ui' ? 'auto' : 'none';
        
        // Apply resolution scaling
        if (this.resolutionScale !== 1.0 && !config.static) {
            canvas.width = Math.floor(this.nativeWidth * this.resolutionScale);
            canvas.height = Math.floor(this.nativeHeight * this.resolutionScale);
            canvas.style.width = this.nativeWidth + 'px';
            canvas.style.height = this.nativeHeight + 'px';
            canvas.style.imageRendering = this.resolutionScale < 1 ? 'auto' : 'pixelated';
        }
        
        const ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true, // Better performance in Chrome
            willReadFrequently: false
        });
        
        // Set rendering optimizations
        ctx.imageSmoothingEnabled = this.resolutionScale >= 0.8;
        ctx.imageSmoothingQuality = 'low';
        
        const layer = {
            name,
            canvas,
            ctx,
            config,
            dirty: true,
            framesSinceUpdate: 0,
            dirtyRects: [],
            lastRenderTime: 0,
            visible: true
        };
        
        this.layers.set(name, layer);
        container.appendChild(canvas);
        
        console.log(`📐 Created layer: ${name} (${canvas.width}x${canvas.height})`);
    }
    
    /**
     * Create composite canvas for final rendering
     */
    createCompositeCanvas(container) {
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas-composite';
        canvas.width = this.nativeWidth;
        canvas.height = this.nativeHeight;
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.zIndex = '100';
        canvas.style.pointerEvents = 'none';
        canvas.style.display = 'none'; // Hidden by default
        
        const ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true
        });
        
        this.compositeCanvas = canvas;
        this.compositeCtx = ctx;
        container.appendChild(canvas);
    }
    
    /**
     * Get a specific layer
     */
    getLayer(name) {
        return this.layers.get(name);
    }
    
    /**
     * Mark a region as dirty for redraw
     */
    markDirty(layerName, x, y, width, height) {
        const layer = this.layers.get(layerName);
        if (!layer) return;
        
        layer.dirty = true;
        
        if (layer.config.useDirtyRects) {
            // Add to dirty rectangles
            layer.dirtyRects.push({
                x: Math.floor(x),
                y: Math.floor(y),
                width: Math.ceil(width),
                height: Math.ceil(height)
            });
            
            // Merge overlapping rectangles if too many
            if (layer.dirtyRects.length > this.maxDirtyRects) {
                this.mergeDirtyRects(layer);
            }
        }
    }
    
    /**
     * Mark entire layer as dirty
     */
    markLayerDirty(layerName) {
        const layer = this.layers.get(layerName);
        if (!layer) return;
        
        layer.dirty = true;
        layer.dirtyRects = [{
            x: 0,
            y: 0,
            width: layer.canvas.width,
            height: layer.canvas.height
        }];
    }
    
    /**
     * Merge overlapping dirty rectangles
     */
    mergeDirtyRects(layer) {
        const rects = layer.dirtyRects;
        const merged = [];
        
        rects.forEach(rect => {
            let wasMerged = false;
            
            for (let i = 0; i < merged.length; i++) {
                const existing = merged[i];
                
                // Check if rectangles are close enough to merge
                if (this.shouldMergeRects(rect, existing)) {
                    // Merge rectangles
                    const minX = Math.min(rect.x, existing.x);
                    const minY = Math.min(rect.y, existing.y);
                    const maxX = Math.max(rect.x + rect.width, existing.x + existing.width);
                    const maxY = Math.max(rect.y + rect.height, existing.y + existing.height);
                    
                    merged[i] = {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY
                    };
                    wasMerged = true;
                    break;
                }
            }
            
            if (!wasMerged) {
                merged.push(rect);
            }
        });
        
        layer.dirtyRects = merged;
        
        // If still too many, merge all into one
        if (merged.length > this.maxDirtyRects / 2) {
            const bounds = this.calculateBounds(merged);
            layer.dirtyRects = [bounds];
        }
    }
    
    /**
     * Check if two rectangles should be merged
     */
    shouldMergeRects(rect1, rect2) {
        const distance = Math.sqrt(
            Math.pow(rect1.x - rect2.x, 2) +
            Math.pow(rect1.y - rect2.y, 2)
        );
        
        return distance < this.dirtyRectMergeThreshold ||
               this.rectsOverlap(rect1, rect2);
    }
    
    /**
     * Check if rectangles overlap
     */
    rectsOverlap(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * Calculate bounding box of rectangles
     */
    calculateBounds(rects) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        rects.forEach(rect => {
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    /**
     * Update resolution scale based on performance
     */
    updateResolutionScale() {
        if (!this.autoScaleResolution) return;
        
        const targetScale = this.currentFPS < 30 ? 0.75 :
                           this.currentFPS < 45 ? 0.85 :
                           this.currentFPS < 55 ? 0.95 :
                           1.0;
        
        // Smooth transition
        this.resolutionScale += (targetScale - this.resolutionScale) * 0.1;
        this.resolutionScale = Math.max(this.minResolutionScale, 
                                       Math.min(1.0, this.resolutionScale));
        
        // Apply to dynamic layers
        this.layers.forEach(layer => {
            if (!layer.config.static && Math.abs(layer.canvas.width - this.nativeWidth * this.resolutionScale) > 10) {
                layer.canvas.width = Math.floor(this.nativeWidth * this.resolutionScale);
                layer.canvas.height = Math.floor(this.nativeHeight * this.resolutionScale);
                layer.ctx.imageSmoothingEnabled = this.resolutionScale >= 0.8;
                layer.dirty = true;
                
                console.log(`📏 Scaled ${layer.name} to ${this.resolutionScale.toFixed(2)}x`);
            }
        });
    }
    
    /**
     * Calculate adaptive frame skip
     */
    calculateFrameSkip() {
        if (!this.adaptiveFrameRate) return;
        
        if (this.currentFPS < this.minFPS) {
            this.frameSkip = Math.min(3, this.frameSkip + 1);
        } else if (this.currentFPS > this.maxFPS * 0.9) {
            this.frameSkip = Math.max(0, this.frameSkip - 1);
        }
    }
    
    /**
     * Start optimized render loop
     */
    startOptimizedRenderLoop() {
        let lastTime = performance.now();
        
        const render = (currentTime) => {
            if (!this.isInitialized) return;
            
            // Calculate delta time
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Update FPS
            this.updateFPS(deltaTime);
            
            // Adaptive frame skipping
            this.frameSkipCounter++;
            if (this.frameSkipCounter <= this.frameSkip) {
                requestAnimationFrame(render);
                return;
            }
            this.frameSkipCounter = 0;
            
            // Update resolution if needed
            if (Math.random() < 0.05) { // Check occasionally
                this.updateResolutionScale();
                this.calculateFrameSkip();
            }
            
            // Render layers
            this.renderLayers(currentTime);
            
            requestAnimationFrame(render);
        };
        
        requestAnimationFrame(render);
        console.log('🚀 Optimized render loop started');
    }
    
    /**
     * Update FPS counter
     */
    updateFPS(deltaTime) {
        this.frameCount++;
        
        if (performance.now() - this.lastFrameTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = performance.now();
            
            if (Math.random() < 0.1) {
                console.log(`🎯 FPS: ${this.currentFPS}, Scale: ${this.resolutionScale.toFixed(2)}x, Skip: ${this.frameSkip}`);
            }
        }
    }
    
    /**
     * Render all layers
     */
    renderLayers(currentTime) {
        this.layers.forEach(layer => {
            if (!layer.visible || layer.config.static && !layer.dirty) {
                return;
            }
            
            // Check update frequency
            layer.framesSinceUpdate++;
            if (layer.framesSinceUpdate < layer.config.updateFrequency) {
                return;
            }
            
            layer.framesSinceUpdate = 0;
            
            // Render based on dirty regions
            if (layer.dirty) {
                if (layer.config.useDirtyRects && layer.dirtyRects.length > 0) {
                    this.renderDirtyRegions(layer);
                } else if (layer.config.clearOnDraw) {
                    // Clear entire layer
                    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                    
                    // Trigger layer redraw
                    this.triggerLayerRedraw(layer, currentTime);
                }
                
                layer.dirty = false;
                layer.dirtyRects = [];
                layer.lastRenderTime = currentTime;
            }
        });
    }
    
    /**
     * Render only dirty regions of a layer
     */
    renderDirtyRegions(layer) {
        const ctx = layer.ctx;
        
        // Save state
        ctx.save();
        
        // Clear and redraw each dirty rectangle
        layer.dirtyRects.forEach(rect => {
            // Scale rectangle if resolution is different
            if (this.resolutionScale !== 1.0) {
                rect.x *= this.resolutionScale;
                rect.y *= this.resolutionScale;
                rect.width *= this.resolutionScale;
                rect.height *= this.resolutionScale;
            }
            
            // Clear region
            ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
            
            // Set clipping to dirty region
            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.width, rect.height);
            ctx.clip();
            
            // Trigger redraw for this region
            this.triggerRegionRedraw(layer, rect);
        });
        
        // Restore state
        ctx.restore();
    }
    
    /**
     * Trigger redraw event for a layer
     */
    triggerLayerRedraw(layer, currentTime) {
        // Dispatch custom event for game to handle
        const event = new CustomEvent('canvasLayerRedraw', {
            detail: {
                layerName: layer.name,
                ctx: layer.ctx,
                canvas: layer.canvas,
                time: currentTime,
                scale: this.resolutionScale
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Trigger redraw event for a specific region
     */
    triggerRegionRedraw(layer, rect) {
        // Dispatch custom event for game to handle
        const event = new CustomEvent('canvasRegionRedraw', {
            detail: {
                layerName: layer.name,
                ctx: layer.ctx,
                canvas: layer.canvas,
                rect: rect,
                scale: this.resolutionScale
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Set layer visibility
     */
    setLayerVisibility(layerName, visible) {
        const layer = this.layers.get(layerName);
        if (layer) {
            layer.visible = visible;
            layer.canvas.style.display = visible ? 'block' : 'none';
        }
    }
    
    /**
     * Get rendering statistics
     */
    getStats() {
        return {
            fps: this.currentFPS,
            resolutionScale: this.resolutionScale,
            frameSkip: this.frameSkip,
            layers: Array.from(this.layers.values()).map(layer => ({
                name: layer.name,
                dirty: layer.dirty,
                dirtyRects: layer.dirtyRects.length,
                visible: layer.visible
            }))
        };
    }
}

// Create global instance
window.OptimizedCanvasSystem = new OptimizedCanvasSystem();

// Auto-initialize when game starts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.OptimizedCanvasSystem.initialize(), 100);
    });
} else {
    setTimeout(() => window.OptimizedCanvasSystem.initialize(), 100);
}

console.log('🎨 OptimizedCanvasSystem loaded - Multi-layer rendering ready');