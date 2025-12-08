/**
 * SMART PARTICLE PLUGIN - CLEAN ARCHITECTURE
 * ==========================================
 * 
 * Mode-aware particle system that creates triangular icicles for ice mode
 * Uses smart plugin architecture with clean canvas integration.
 */

class SmartParticlePlugin {
    constructor() {
        this.name = 'SmartParticlePlugin';
        this.version = '1.0.0';
        this.isActive = false;
        this.particles = new Map();
        this.canvas = null;
        this.ctx = null;
        
        // Mode-specific particle configurations
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
                    count: { min: 4, max: 8 },
                    shapes: ['triangle', 'triangle', 'triangle'],
                    colors: ['#ffffff', '#f8f8ff', '#ffffff'],  // Pure white triangles
                    physics: { speed: { min: 30, max: 80 }, gravity: 120, friction: 0.96 }
                },
                destruction: {
                    count: { min: 6, max: 12 },
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
        
        console.log('🔺 SmartParticlePlugin initialized');
    }
    
    activate() {
        if (this.isActive) {
            console.log('⚠️ SmartParticlePlugin already active');
            return;
        }
        
        console.log('🚀 SmartParticlePlugin activating...');
        this.isActive = true;
        this.initializeCanvas();
        this.overrideParticleFunctions();
        this.registerWithCanvasSystem();
        this.startRenderLoop();
        
        console.log('✅ SmartParticlePlugin activated successfully');
    }
    
    deactivate() {
        if (!this.isActive) return;
        
        this.restoreOriginalFunctions();
        this.cleanup();
        this.isActive = false;
        
        console.log('🧹 SmartParticlePlugin deactivated');
    }
    
    initializeCanvas() {
        const waitForGameCanvas = () => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (!gameCanvas) {
                setTimeout(waitForGameCanvas, 100);
                return;
            }
            
            // Smart architecture: Create overlay canvas
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
            
            console.log('✅ Smart particle overlay canvas created');
        };
        
        waitForGameCanvas();
    }
    
    overrideParticleFunctions() {
        // Store originals
        this.originalCreateImpactParticles = window.createImpactParticles;
        this.originalCreateDestructionParticles = window.createDestructionParticles;
        
        // Override with smart versions
        window.createImpactParticles = (x, y, color) => {
            console.log('🔺 Smart particle impact at', x, y);
            this.createModeParticles(x, y, 'impact');
            // Add atmospheric effects for ice mode
            const currentMode = this.getCurrentMode();
            if (currentMode === 'iceFrost') {
                this.createModeParticles(x, y, 'snowflakes');
            }
        };
        
        window.createDestructionParticles = (x, y, color) => {
            console.log('💥 Smart particle destruction at', x, y);
            this.createModeParticles(x, y, 'destruction');
            // Add extra atmospheric effects for destruction
            const currentMode = this.getCurrentMode();
            if (currentMode === 'iceFrost') {
                this.createModeParticles(x, y, 'snowflakes');
            }
        };
        
        console.log('✅ Particle functions overridden');
    }
    
    createModeParticles(x, y, type) {
        const currentMode = this.getCurrentMode();
        const config = this.modeConfigs[currentMode]?.[type] || this.modeConfigs.original.impact;
        
        console.log(`🎨 Creating ${currentMode} ${type} particles with shapes:`, config.shapes);
        
        const particles = [];
        const numParticles = this.randomBetween(config.count.min, config.count.max);
        
        for (let i = 0; i < numParticles; i++) {
            const particle = this.createSingleParticle(x, y, config);
            particles.push(particle);
        }
        
        const effectId = `${type}_${Date.now()}_${Math.floor(x)}_${Math.floor(y)}`;
        this.particles.set(effectId, {
            particles,
            startTime: performance.now(),
            duration: 1000
        });
        
        console.log(`🎯 Stored ${particles.length} particles for ${currentMode} mode`);
        
        setTimeout(() => this.particles.delete(effectId), 1100);
    }
    
    createSingleParticle(x, y, config) {
        const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        
        const particle = {
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * this.randomBetween(config.physics.speed.min, config.physics.speed.max) * 6,
            vy: -Math.random() * this.randomBetween(config.physics.speed.min, config.physics.speed.max) * 6,
            size: this.randomBetween(3, 8),
            color: color,
            shape: shape,
            opacity: 1,
            gravity: config.physics.gravity,
            friction: config.physics.friction,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            bounce: 1.2,
            hasHitGround: false
        };
        
        // Special properties for different particle types
        if (shape === 'snowflake') {
            particle.size = this.randomBetween(2, 5);
            particle.rotationSpeed *= 0.2; // Slower snowflake spinning
            particle.bounce = 0.1; // Very little bounce
            particle.vx *= 2.5; // Much more forward momentum
            particle.vy *= 1.5; // Keep upward and outward momentum
        }
        
        return particle;
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
        console.log('🔍 SmartParticlePlugin mode detection:', {
            'window.currentGameMode?.id': window.currentGameMode?.id,
            'window.selectedGameMode': window.selectedGameMode,
            'localStorage': localStorage.getItem('ballDefender_selectedMode'),
            'final mode': mode
        });
        return mode;
    }
    
    randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }
    
    registerWithCanvasSystem() {
        if (window.CanvasPluginSystem) {
            const renderPlugin = {
                name: 'SmartParticlePlugin',
                isActive: true,
                render: (ctx, currentTime) => {
                    this.render(currentTime);
                }
            };
            
            window.CanvasPluginSystem.registerRenderPlugin(renderPlugin);
            window.CanvasPluginSystem.activateRenderPlugin('SmartParticlePlugin');
            console.log('✅ Registered SmartParticlePlugin with canvas system');
        }
    }
    
    startRenderLoop() {
        console.log('🔄 Starting SmartParticlePlugin render loop');
        const renderFrame = () => {
            if (!this.isActive) return;
            
            const currentTime = performance.now();
            this.render(currentTime);
            requestAnimationFrame(renderFrame);
        };
        requestAnimationFrame(renderFrame);
        console.log('✅ SmartParticlePlugin render loop started');
    }
    
    render(currentTime) {
        if (!this.ctx) {
            console.log('❌ SmartParticlePlugin render: no context');
            return;
        }
        if (this.particles.size === 0) {
            // No particles to render (no logging needed)
            return;
        }
        
        // Rendering particles (no logging needed)
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((effect, effectId) => {
            const progress = (currentTime - effect.startTime) / effect.duration;
            if (progress >= 1) {
                this.particles.delete(effectId);
                return;
            }
            
            effect.particles.forEach(particle => {
                this.updateParticle(particle);
                this.renderParticle(particle, progress);
            });
        });
    }
    
    updateParticle(particle) {
        // Apply gravity
        particle.vy += particle.gravity * 0.016;
        
        // Update position
        particle.x += particle.vx * 0.016;
        particle.y += particle.vy * 0.016;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Check for ground bounce
        if (particle.y > this.canvas.height - 10 && particle.vy > 0) {
            particle.y = this.canvas.height - 10;
            particle.vy = -particle.vy * particle.bounce;
            particle.vx *= 0.8; // Reduce horizontal velocity on bounce
            particle.rotationSpeed *= 0.9; // Reduce spin on bounce
            particle.hasHitGround = true;
        }
        
        // Check for side walls bounce
        if (particle.x < 5 || particle.x > this.canvas.width - 5) {
            particle.vx = -particle.vx * particle.bounce;
            particle.x = Math.max(5, Math.min(this.canvas.width - 5, particle.x));
            particle.rotationSpeed *= -0.8; // Reverse and reduce spin
        }
        
        // Apply friction (less when bouncing)
        const frictionMultiplier = particle.hasHitGround ? 0.98 : particle.friction;
        particle.vx *= frictionMultiplier;
        particle.vy *= frictionMultiplier;
    }
    
    renderParticle(particle, progress) {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, 1 - progress);
        this.ctx.fillStyle = particle.color;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        switch (particle.shape) {
            case 'triangle':
                this.drawTriangle(particle.size);
                break;
            case 'diamond':
                this.drawDiamond(particle.size);
                break;
            case 'snowflake':
                this.drawSnowflake(particle.size);
                break;
            default:
                this.drawCircle(particle.size);
        }
        
        this.ctx.restore();
    }
    
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
    
    drawCircle(size) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    
    drawSnowflake(size) {
        // Draw a simple 6-pointed snowflake
        this.ctx.strokeStyle = this.ctx.fillStyle;
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';
        
        for (let i = 0; i < 6; i++) {
            this.ctx.save();
            this.ctx.rotate((i * Math.PI) / 3);
            
            // Main line
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size);
            this.ctx.lineTo(0, size);
            this.ctx.stroke();
            
            // Small branches
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size * 0.7);
            this.ctx.lineTo(-size * 0.3, -size * 0.4);
            this.ctx.moveTo(0, -size * 0.7);
            this.ctx.lineTo(size * 0.3, -size * 0.4);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
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

// Register with plugin manager (with deferred registration)
const registerSmartParticlePlugin = () => {
    if (window.PluginManager) {
        const smartParticlePlugin = new SmartParticlePlugin();
        const success = window.PluginManager.registerPlugin(smartParticlePlugin);
        if (success) {
            console.log('✅ SmartParticlePlugin registered with PluginManager');
        }
        return true;
    }
    return false;
};

// Try immediate registration
if (!registerSmartParticlePlugin()) {
    // Wait for PluginManager to be ready
    const checkForManager = () => {
        if (registerSmartParticlePlugin()) {
            clearInterval(checkInterval);
        }
    };
    const checkInterval = setInterval(checkForManager, 100);
}

console.log('🔺 SmartParticlePlugin loaded - Triangular icicle particles ready');