/**
 * SMART PARTICLE PLUGIN - PERFORMANCE OPTIMIZED
 * ============================================
 * 
 * High-performance particle system with:
 * - Object pooling for memory efficiency
 * - Spatial culling for viewport optimization
 * - Level-of-detail (LOD) for adaptive quality
 * - Batch rendering for draw call optimization
 */

class SmartParticlePluginOptimized {
    constructor() {
        this.name = 'SmartParticlePlugin';
        this.version = '2.0.0-optimized';
        this.isActive = false;
        this.particles = new Map();
        this.canvas = null;
        this.ctx = null;
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastFpsTime = performance.now();
        this.currentFPS = 60;
        this.targetFPS = 60;
        
        // Object pooling
        this.particlePool = [];
        this.poolSize = 500; // Max particles in pool
        this.activeParticleCount = 0;
        
        // Viewport culling boundaries with margin
        this.viewportMargin = 50;
        this.viewport = {
            x: 0,
            y: 0,
            width: 1000,
            height: 700
        };
        
        // LOD settings
        this.lodLevel = 0; // 0=full, 1=medium, 2=simple
        this.lodThresholds = {
            particles: [50, 150, 300], // Particle count thresholds
            fps: [50, 30, 20] // FPS thresholds
        };
        
        // Batch rendering groups
        this.renderBatches = {
            triangles: [],
            diamonds: [],
            snowflakes: []
        };
        
        // Mode-specific particle configurations (same as before but with LOD variations)
        this.modeConfigs = {
            original: {
                impact: {
                    count: { min: 1, max: 3 },
                    shapes: ['triangle', 'diamond', 'triangle'],
                    colors: ['#ff6b00', '#ff9500', '#ffb040'],
                    physics: { speed: { min: 30, max: 80 }, gravity: 120, friction: 0.95 }
                }
            },
            iceFrost: {
                impact: {
                    count: { min: 2, max: 4 },  // Reduced for optimization
                    shapes: ['triangle', 'triangle', 'triangle'],
                    colors: ['#ffffff', '#f8f8ff', '#ffffff'],  // Pure white triangles
                    physics: { speed: { min: 30, max: 80 }, gravity: 120, friction: 0.96 }
                },
                destruction: {
                    count: { min: 4, max: 8 },  // Reduced for optimization
                    shapes: ['triangle', 'triangle', 'triangle'],  // Only triangles
                    colors: ['#ffffff', '#ffffff', '#f0f8ff'],  // White ice shards
                    physics: { speed: { min: 40, max: 120 }, gravity: 140, friction: 0.94 }
                },
                snowflakes: {
                    count: { min: 7, max: 10 },
                    shapes: ['snowflake', 'snowflake', 'snowflake'],
                    colors: ['rgba(255, 255, 255, 0.8)', 'rgba(240, 248, 255, 0.6)', 'rgba(230, 240, 255, 0.7)'],
                    physics: { speed: { min: 2, max: 8 }, gravity: 15, friction: 0.995 }
                }
            }
        };
        
        // Initialize particle pool
        this.initializePool();
        
        console.log('🚀 SmartParticlePlugin Optimized initialized with performance enhancements');
    }
    
    /**
     * Initialize object pool with reusable particles
     */
    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.particlePool.push(this.createPooledParticle());
        }
        console.log(`📦 Created particle pool with ${this.poolSize} reusable particles`);
    }
    
    /**
     * Create a pooled particle with all properties pre-allocated
     */
    createPooledParticle() {
        return {
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 0,
            color: '',
            shape: '',
            opacity: 1,
            gravity: 0,
            friction: 0,
            rotation: 0,
            rotationSpeed: 0,
            bounce: 0,
            hasHitGround: false,
            inViewport: true,
            lodLevel: 0
        };
    }
    
    /**
     * Get particle from pool or create new if pool is exhausted
     */
    getParticleFromPool() {
        // Find inactive particle in pool
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                this.activeParticleCount++;
                return particle;
            }
        }
        
        // Pool exhausted, reuse oldest particle or create new if under limit
        if (this.particlePool.length < this.poolSize * 1.5) {
            const newParticle = this.createPooledParticle();
            newParticle.active = true;
            this.particlePool.push(newParticle);
            this.activeParticleCount++;
            return newParticle;
        }
        
        // Reuse oldest particle
        const oldestParticle = this.particlePool[0];
        this.particlePool.push(this.particlePool.shift());
        return oldestParticle;
    }
    
    /**
     * Return particle to pool
     */
    returnParticleToPool(particle) {
        particle.active = false;
        this.activeParticleCount--;
    }
    
    /**
     * Update viewport dimensions for culling
     */
    updateViewport() {
        if (this.canvas) {
            this.viewport.width = this.canvas.width;
            this.viewport.height = this.canvas.height;
        }
    }
    
    /**
     * Check if particle is in viewport
     */
    isInViewport(particle) {
        return particle.x > -this.viewportMargin &&
               particle.x < this.viewport.width + this.viewportMargin &&
               particle.y > -this.viewportMargin &&
               particle.y < this.viewport.height + this.viewportMargin;
    }
    
    /**
     * Calculate current LOD level based on performance
     */
    calculateLODLevel() {
        // Based on particle count
        if (this.activeParticleCount > this.lodThresholds.particles[2]) {
            this.lodLevel = 2; // Simple
        } else if (this.activeParticleCount > this.lodThresholds.particles[1]) {
            this.lodLevel = 1; // Medium
        } else if (this.activeParticleCount > this.lodThresholds.particles[0]) {
            this.lodLevel = Math.min(1, this.lodLevel + 0.1); // Gradual increase
        } else {
            this.lodLevel = Math.max(0, this.lodLevel - 0.1); // Gradual decrease
        }
        
        // Also consider FPS
        if (this.currentFPS < this.lodThresholds.fps[2]) {
            this.lodLevel = 2;
        } else if (this.currentFPS < this.lodThresholds.fps[1]) {
            this.lodLevel = Math.max(1, this.lodLevel);
        }
        
        return Math.floor(this.lodLevel);
    }
    
    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastFpsTime;
        
        if (delta >= 1000) {
            this.currentFPS = Math.round(this.frameCount * 1000 / delta);
            this.frameCount = 0;
            this.lastFpsTime = now;
            
            // Log performance stats occasionally
            if (Math.random() < 0.1) {
                console.log(`⚡ FPS: ${this.currentFPS}, Particles: ${this.activeParticleCount}, LOD: ${Math.floor(this.lodLevel)}`);
            }
        }
    }
    
    activate() {
        if (this.isActive) {
            console.log('⚠️ SmartParticlePlugin already active');
            return;
        }
        
        console.log('🚀 SmartParticlePlugin Optimized activating...');
        this.isActive = true;
        this.initializeCanvas();
        this.overrideParticleFunctions();
        this.startRenderLoop();
        
        console.log('✅ SmartParticlePlugin Optimized activated successfully');
    }
    
    deactivate() {
        if (!this.isActive) return;
        
        this.restoreOriginalFunctions();
        this.cleanup();
        this.isActive = false;
        
        // Return all particles to pool
        this.particlePool.forEach(p => p.active = false);
        this.activeParticleCount = 0;
        
        console.log('🧹 SmartParticlePlugin Optimized deactivated');
    }
    
    initializeCanvas() {
        const waitForGameCanvas = () => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (!gameCanvas) {
                setTimeout(waitForGameCanvas, 100);
                return;
            }
            
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'smartParticleCanvas';
            this.canvas.width = gameCanvas.width;
            this.canvas.height = gameCanvas.height;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = gameCanvas.offsetTop + 'px';
            this.canvas.style.left = gameCanvas.offsetLeft + 'px';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '5';
            
            gameCanvas.parentNode.insertBefore(this.canvas, gameCanvas.nextSibling);
            this.ctx = this.canvas.getContext('2d');
            
            // Update viewport dimensions
            this.updateViewport();
            
            console.log('✅ Smart particle overlay canvas created with viewport culling');
        };
        
        waitForGameCanvas();
    }
    
    overrideParticleFunctions() {
        this.originalCreateImpactParticles = window.createImpactParticles;
        this.originalCreateDestructionParticles = window.createDestructionParticles;
        
        window.createImpactParticles = (x, y, color) => {
            this.createModeParticles(x, y, 'impact');
            const currentMode = this.getCurrentMode();
            if (currentMode === 'iceFrost') {
                this.createModeParticles(x, y, 'snowflakes');
            }
        };
        
        window.createDestructionParticles = (x, y, color) => {
            this.createModeParticles(x, y, 'destruction');
            const currentMode = this.getCurrentMode();
            if (currentMode === 'iceFrost') {
                this.createModeParticles(x, y, 'snowflakes');
            }
        };
        
        console.log('✅ Particle functions overridden with optimized versions');
    }
    
    createModeParticles(x, y, type) {
        const currentMode = this.getCurrentMode();
        const config = this.modeConfigs[currentMode]?.[type] || this.modeConfigs.original.impact;
        
        // Adjust particle count based on LOD
        const lodMultiplier = [1, 0.7, 0.4][Math.floor(this.lodLevel)];
        const baseCount = this.randomBetween(config.count.min, config.count.max);
        const numParticles = Math.max(1, Math.floor(baseCount * lodMultiplier));
        
        const particles = [];
        
        for (let i = 0; i < numParticles; i++) {
            const particle = this.getParticleFromPool();
            this.initializeParticle(particle, x, y, config);
            particles.push(particle);
        }
        
        const effectId = `${type}_${Date.now()}_${Math.floor(x)}_${Math.floor(y)}`;
        this.particles.set(effectId, {
            particles,
            startTime: performance.now(),
            duration: 1000
        });
        
        setTimeout(() => {
            const effect = this.particles.get(effectId);
            if (effect) {
                effect.particles.forEach(p => this.returnParticleToPool(p));
                this.particles.delete(effectId);
            }
        }, 8437);
    }
    
    initializeParticle(particle, x, y, config) {
        const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        
        // Reset and initialize particle properties
        particle.x = x + (Math.random() - 0.5) * 40;
        particle.y = y + (Math.random() - 0.5) * 40;
        particle.vx = (Math.random() - 0.5) * this.randomBetween(config.physics.speed.min, config.physics.speed.max) * 6;
        particle.vy = -Math.random() * this.randomBetween(config.physics.speed.min, config.physics.speed.max) * 6;
        particle.size = this.randomBetween(3, 8);
        particle.color = color;
        particle.shape = shape;
        particle.opacity = 1;
        particle.gravity = config.physics.gravity;
        particle.friction = config.physics.friction;
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = (Math.random() - 0.5) * 0.3;
        particle.bounce = 1.2;
        particle.hasHitGround = false;
        particle.inViewport = true;
        particle.lodLevel = 0;
        
        // Special properties for different particle types
        if (shape === 'snowflake') {
            particle.size = this.randomBetween(2, 5);
            particle.rotationSpeed *= 0.2;
            particle.bounce = 0.1;
            particle.vx *= 2.5;
            particle.vy *= 1.5;
        }
    }
    
    getCurrentMode() {
        let mode = 'original';
        if (window.currentGameMode?.id) {
            mode = window.currentGameMode.id;
        } else if (window.selectedGameMode) {
            mode = window.selectedGameMode;
        } else {
            mode = localStorage.getItem('ballDefender_selectedMode') || 'original';
        }
        return mode;
    }
    
    randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }
    
    startRenderLoop() {
        console.log('🔄 Starting optimized render loop');
        const renderFrame = () => {
            if (!this.isActive) return;
            
            const currentTime = performance.now();
            this.updateFPS();
            this.calculateLODLevel();
            this.render(currentTime);
            requestAnimationFrame(renderFrame);
        };
        requestAnimationFrame(renderFrame);
        console.log('✅ Optimized render loop started');
    }
    
    render(currentTime) {
        if (!this.ctx || this.particles.size === 0) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clear render batches
        this.renderBatches.triangles = [];
        this.renderBatches.diamonds = [];
        this.renderBatches.snowflakes = [];
        
        let visibleParticles = 0;
        let culledParticles = 0;
        
        // Sort particles into batches and update
        this.particles.forEach((effect, effectId) => {
            const progress = (currentTime - effect.startTime) / effect.duration;
            if (progress >= 1) {
                effect.particles.forEach(p => this.returnParticleToPool(p));
                this.particles.delete(effectId);
                return;
            }
            
            effect.particles.forEach(particle => {
                if (!particle.active) return;
                
                // Update physics
                this.updateParticle(particle);
                
                // Viewport culling
                particle.inViewport = this.isInViewport(particle);
                if (!particle.inViewport) {
                    culledParticles++;
                    return;
                }
                
                visibleParticles++;
                
                // Calculate particle LOD level
                particle.lodLevel = Math.floor(this.lodLevel);
                particle.progress = progress;
                
                // Add to appropriate batch
                switch (particle.shape) {
                    case 'triangle':
                        this.renderBatches.triangles.push(particle);
                        break;
                    case 'diamond':
                        this.renderBatches.diamonds.push(particle);
                        break;
                    case 'snowflake':
                        this.renderBatches.snowflakes.push(particle);
                        break;
                }
            });
        });
        
        // Batch render by shape type
        this.renderBatch(this.renderBatches.triangles, 'triangle');
        this.renderBatch(this.renderBatches.diamonds, 'diamond');
        this.renderBatch(this.renderBatches.snowflakes, 'snowflake');
        
        // Log culling stats occasionally
        if (Math.random() < 0.01 && culledParticles > 0) {
            console.log(`🎯 Culled ${culledParticles} off-screen particles, rendering ${visibleParticles}`);
        }
    }
    
    /**
     * Batch render particles of the same type
     */
    renderBatch(particles, shapeType) {
        if (particles.length === 0) return;
        
        this.ctx.save();
        
        // Group by similar properties for even better batching
        const groups = this.groupParticlesByProperties(particles);
        
        groups.forEach(group => {
            // Set common properties once for the group
            this.ctx.fillStyle = group.color;
            this.ctx.strokeStyle = group.color;
            
            group.particles.forEach(particle => {
                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, 1 - particle.progress) * particle.opacity;
                this.ctx.translate(particle.x, particle.y);
                
                // Only rotate if necessary (LOD optimization)
                if (particle.lodLevel < 2) {
                    this.ctx.rotate(particle.rotation);
                }
                
                // Draw with LOD-appropriate detail
                this.drawParticleWithLOD(particle, shapeType);
                
                this.ctx.restore();
            });
        });
        
        this.ctx.restore();
    }
    
    /**
     * Group particles by similar properties for batch rendering
     */
    groupParticlesByProperties(particles) {
        const groups = new Map();
        
        particles.forEach(particle => {
            const key = `${particle.color}_${particle.lodLevel}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    color: particle.color,
                    lodLevel: particle.lodLevel,
                    particles: []
                });
            }
            groups.get(key).particles.push(particle);
        });
        
        return Array.from(groups.values());
    }
    
    /**
     * Draw particle with appropriate level of detail
     */
    drawParticleWithLOD(particle, shapeType) {
        const lod = particle.lodLevel;
        
        switch (shapeType) {
            case 'triangle':
                if (lod === 0) {
                    this.drawTriangle(particle.size);
                } else if (lod === 1) {
                    this.drawSimpleTriangle(particle.size);
                } else {
                    this.drawDot(particle.size);
                }
                break;
            case 'diamond':
                if (lod === 0) {
                    this.drawDiamond(particle.size);
                } else if (lod === 1) {
                    this.drawSimpleDiamond(particle.size);
                } else {
                    this.drawDot(particle.size);
                }
                break;
            case 'snowflake':
                if (lod === 0) {
                    this.drawSnowflake(particle.size);
                } else if (lod === 1) {
                    this.drawSimpleSnowflake(particle.size);
                } else {
                    this.drawDot(particle.size * 0.7);
                }
                break;
        }
    }
    
    updateParticle(particle) {
        // Apply gravity
        particle.vy += particle.gravity * 0.016;
        
        // Update position
        particle.x += particle.vx * 0.016;
        particle.y += particle.vy * 0.016;
        
        // Update rotation (skip for high LOD)
        if (particle.lodLevel < 2) {
            particle.rotation += particle.rotationSpeed;
        }
        
        // Simplified physics for high LOD
        if (particle.lodLevel < 2) {
            // Check for ground bounce
            if (particle.y > this.canvas.height - 10 && particle.vy > 0) {
                particle.y = this.canvas.height - 10;
                particle.vy = -particle.vy * particle.bounce;
                particle.vx *= 0.8;
                particle.rotationSpeed *= 0.9;
                particle.hasHitGround = true;
            }
            
            // Check for side walls bounce
            if (particle.x < 5 || particle.x > this.canvas.width - 5) {
                particle.vx = -particle.vx * particle.bounce;
                particle.x = Math.max(5, Math.min(this.canvas.width - 5, particle.x));
                particle.rotationSpeed *= -0.8;
            }
        }
        
        // Apply friction
        const frictionMultiplier = particle.hasHitGround ? 0.98 : particle.friction;
        particle.vx *= frictionMultiplier;
        particle.vy *= frictionMultiplier;
    }
    
    // Full detail drawing methods
    drawTriangle(size) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.7, size * 0.7);
        this.ctx.lineTo(-size * 0.7, size * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawDiamond(size) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size, 0);
        this.ctx.lineTo(0, size);
        this.ctx.lineTo(-size, 0);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    
    drawSnowflake(size) {
        this.ctx.strokeStyle = this.ctx.fillStyle;
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';
        
        for (let i = 0; i < 6; i++) {
            this.ctx.save();
            this.ctx.rotate((i * Math.PI) / 3);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size);
            this.ctx.lineTo(0, size);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size * 0.7);
            this.ctx.lineTo(-size * 0.3, -size * 0.4);
            this.ctx.moveTo(0, -size * 0.7);
            this.ctx.lineTo(size * 0.3, -size * 0.4);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }
    
    // Simplified drawing methods for medium LOD
    drawSimpleTriangle(size) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size, size);
        this.ctx.lineTo(-size, size);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawSimpleDiamond(size) {
        this.ctx.fillRect(-size/2, -size/2, size, size);
    }
    
    
    drawSimpleSnowflake(size) {
        this.ctx.strokeStyle = this.ctx.fillStyle;
        this.ctx.lineWidth = 1;
        
        // Just draw a simple cross
        this.ctx.beginPath();
        this.ctx.moveTo(-size, 0);
        this.ctx.lineTo(size, 0);
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(0, size);
        this.ctx.stroke();
    }
    
    // Ultra-simple dot for high LOD
    drawDot(size) {
        this.ctx.fillRect(-size/2, -size/2, size, size);
    }
    
    restoreOriginalFunctions() {
        if (this.originalCreateImpactParticles) {
            window.createImpactParticles = this.originalCreateImpactParticles;
        }
        if (this.originalCreateDestructionParticles) {
            window.createDestructionParticles = this.originalCreateDestructionParticles;
        }
    }
    
    cleanup() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.particles.clear();
    }
}

// Register with plugin manager
if (window.PluginManager) {
    // First unregister the old plugin
    const oldPlugin = window.PluginManager.getPlugin('SmartParticlePlugin');
    if (oldPlugin) {
        window.PluginManager.deactivatePlugin('SmartParticlePlugin');
    }
    
    // Register the optimized version
    const smartParticlePlugin = new SmartParticlePluginOptimized();
    window.PluginManager.registerPlugin(smartParticlePlugin);
    console.log('✅ SmartParticlePlugin Optimized registered with PluginManager');
} else {
    // Wait for PluginManager to be ready
    const registerOptimizedPlugin = () => {
        if (window.PluginManager) {
            const oldPlugin = window.PluginManager.getPlugin('SmartParticlePlugin');
            if (oldPlugin) {
                window.PluginManager.deactivatePlugin('SmartParticlePlugin');
            }
            
            const smartParticlePlugin = new SmartParticlePluginOptimized();
            const success = window.PluginManager.registerPlugin(smartParticlePlugin);
            if (success) {
                console.log('✅ SmartParticlePlugin Optimized registered with PluginManager');
            }
            return true;
        }
        return false;
    };
    
    if (!registerOptimizedPlugin()) {
        const checkInterval = setInterval(() => {
            if (registerOptimizedPlugin()) {
                clearInterval(checkInterval);
            }
        }, 100);
    }
}

console.log('🚀 SmartParticlePlugin Optimized loaded - Performance enhancements ready');