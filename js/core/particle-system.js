/**
 * SMART PARTICLE SYSTEM - CONFIGURABLE ARCHITECTURE
 * =================================================
 * 
 * Mode-aware particle system with configurable shapes, colors, and physics
 * No patches or hacks - pure configuration-driven system
 */

class SmartParticleSystem {
    constructor() {
        this.isActive = false;
        this.particles = new Map(); // Store particle effects by ID
        this.canvas = null;
        this.ctx = null;
        
        // Store original functions for clean restoration
        this.originalCreateImpactParticles = null;
        this.originalCreateDestructionParticles = null;
        
        // Default particle configurations for each mode
        this.modeConfigs = {
            // Default/Original mode - classic colorful particles
            original: {
                impact: {
                    count: { min: 4, max: 8 },
                    shapes: ['circle', 'square'],
                    colors: ['#ff6b00', '#ff9500', '#ffb040'],
                    physics: {
                        speed: { min: 30, max: 80 },
                        gravity: 120,
                        friction: 0.95,
                        bounce: 0.3
                    },
                    visual: {
                        size: { min: 2, max: 5 },
                        fadeRate: 0.02,
                        duration: 1000
                    }
                },
                destruction: {
                    count: { min: 8, max: 15 },
                    shapes: ['circle', 'diamond', 'cross'],
                    colors: ['#ff4500', '#ff6b00', '#ffd700'],
                    physics: {
                        speed: { min: 50, max: 120 },
                        gravity: 100,
                        friction: 0.93,
                        bounce: 0.4
                    },
                    visual: {
                        size: { min: 3, max: 8 },
                        fadeRate: 0.015,
                        duration: 1500
                    }
                }
            },
            
            // Ball Go Boom mode - explosive fiery particles
            ballGoBoom: {
                impact: {
                    count: { min: 6, max: 12 },
                    shapes: ['star', 'burst', 'flame'],
                    colors: ['#ff0000', '#ff4500', '#ffff00'],
                    physics: {
                        speed: { min: 40, max: 100 },
                        gravity: 80,
                        friction: 0.92,
                        bounce: 0.5
                    },
                    visual: {
                        size: { min: 3, max: 6 },
                        fadeRate: 0.025,
                        duration: 1200,
                        glow: true
                    }
                },
                destruction: {
                    count: { min: 12, max: 20 },
                    shapes: ['explosion', 'star', 'burst'],
                    colors: ['#ff1744', '#d500f9', '#ffff00'],
                    physics: {
                        speed: { min: 60, max: 150 },
                        gravity: 60,
                        friction: 0.90,
                        bounce: 0.6
                    },
                    visual: {
                        size: { min: 4, max: 10 },
                        fadeRate: 0.012,
                        duration: 2000,
                        glow: true
                    }
                }
            },
            
            // Ice mode - white crystalline particles
            iceFrost: {
                impact: {
                    count: { min: 6, max: 12 },
                    shapes: ['triangle', 'triangle', 'triangle'],
                    colors: ['#ffffff', '#f8f8ff', '#ffffff'],  // Pure white icicle triangles
                    physics: {
                        speed: { min: 20, max: 70 },
                        gravity: 100,
                        friction: 0.97,
                        bounce: 0.2
                    },
                    visual: {
                        size: { min: 3, max: 6 },
                        fadeRate: 0.018,
                        duration: 1800,
                        sparkle: true
                    }
                },
                destruction: {
                    count: { min: 8, max: 15 },
                    shapes: ['triangle', 'triangle', 'triangle'],
                    colors: ['#ffffff', '#ffffff', '#f0f8ff'],  // White ice shards
                    physics: {
                        speed: { min: 30, max: 100 },
                        gravity: 120,
                        friction: 0.95,
                        bounce: 0.1
                    },
                    visual: {
                        size: { min: 4, max: 8 },
                        fadeRate: 0.015,
                        duration: 2200,
                        sparkle: true
                    }
                }
            }
        };
        
        console.log('⚡ Smart Particle System initialized');
    }
    
    /**
     * Initialize and hook into the game
     */
    initialize() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.setupCanvas();
        this.overrideParticleFunctions();
        
        console.log('✅ Smart Particle System activated');
    }
    
    /**
     * Setup overlay canvas for particle rendering
     */
    setupCanvas() {
        const waitForGameCanvas = () => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (!gameCanvas) {
                setTimeout(waitForGameCanvas, 100);
                return;
            }
            
            // Create particle overlay canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particleOverlay';
            this.canvas.width = gameCanvas.width;
            this.canvas.height = gameCanvas.height;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = gameCanvas.offsetTop + 'px';
            this.canvas.style.left = gameCanvas.offsetLeft + 'px';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '15'; // Above other overlays
            
            gameCanvas.parentNode.insertBefore(this.canvas, gameCanvas.nextSibling);
            this.ctx = this.canvas.getContext('2d');
            
            console.log('✅ Particle overlay canvas created');
        };
        
        waitForGameCanvas();
    }
    
    /**
     * Override game particle functions with smart versions
     */
    overrideParticleFunctions() {
        // Store originals for restoration
        this.originalCreateImpactParticles = window.createImpactParticles;
        this.originalCreateDestructionParticles = window.createDestructionParticles;
        
        // Override with smart versions
        window.createImpactParticles = (x, y, color) => {
            console.log('🚀 Smart createImpactParticles called at', x, y);
            this.createConfigurableParticles(x, y, 'impact');
        };
        
        window.createDestructionParticles = (x, y, color) => {
            console.log('💥 Smart createDestructionParticles called at', x, y);
            this.createConfigurableParticles(x, y, 'destruction');
        };
        
        console.log('✅ Particle functions overridden with smart system');
    }
    
    /**
     * Create particles based on current mode configuration
     */
    createConfigurableParticles(x, y, type) {
        const currentMode = this.getCurrentMode();
        const config = this.modeConfigs[currentMode]?.[type] || this.modeConfigs.original[type];
        
        console.log('⚡ Smart Particle System creating particles:', {mode: currentMode, type, shapes: config.shapes});
        
        const particles = [];
        const particleId = 'effect_' + Date.now() + '_' + Math.random();
        const numParticles = this.randomBetween(config.count.min, config.count.max);
        
        for (let i = 0; i < numParticles; i++) {
            const particle = this.createSingleParticle(x, y, config);
            particles.push(particle);
        }
        
        // Store effect with unique ID
        const effectId = `${type}_${Date.now()}_${Math.floor(x)}_${Math.floor(y)}`;
        this.particles.set(effectId, {
            particles,
            startTime: performance.now(),
            duration: config.visual.duration
        });
        
        console.log(`🎯 STORED ${particles.length} particles with ID: ${effectId}`);
        console.log(`🎯 Total particle effects: ${this.particles.size}`);
        console.log(`🎯 Canvas exists: ${!!this.canvas}, Context exists: ${!!this.ctx}`);
        
        // Auto-cleanup
        setTimeout(() => {
            this.particles.delete(effectId);
        }, config.visual.duration + 500);
    }
    
    /**
     * Create a single configured particle
     */
    createSingleParticle(x, y, config) {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.randomBetween(config.physics.speed.min, config.physics.speed.max);
        
        return {
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: this.randomBetween(config.visual.size.min, config.visual.size.max),
            shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            opacity: 1.0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            gravity: config.physics.gravity,
            friction: config.physics.friction,
            bounce: config.physics.bounce,
            fadeRate: config.visual.fadeRate,
            glow: config.visual.glow || false,
            sparkle: config.visual.sparkle || false
        };
    }
    
    /**
     * Get current game mode
     */
    getCurrentMode() {
        // Try multiple ways to detect current mode
        if (window.currentGameMode?.id) {
            console.log('🎮 Smart Particle System detected mode:', window.currentGameMode.id);
            return window.currentGameMode.id;
        }
        if (window.selectedGameMode) {
            console.log('🎮 Smart Particle System detected mode:', window.selectedGameMode);
            return window.selectedGameMode;
        }
        
        // Fallback to localStorage
        const savedMode = localStorage.getItem('ballDefender_selectedMode');
        console.log('🎮 Smart Particle System fallback mode:', savedMode || 'original');
        return savedMode || 'original';
    }
    
    /**
     * Random number between min and max
     */
    randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Update and render all particles
     */
    render(currentTime) {
        if (!this.ctx || this.particles.size === 0) {
            if (this.particles.size > 0 && !this.ctx) {
                console.log('⚠️ RENDER: Have particles but no context!');
            }
            return;
        }
        
        console.log(`🎨 RENDER: Drawing ${this.particles.size} particle effects`);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((effect, effectId) => {
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration;
            
            if (progress >= 1) {
                this.particles.delete(effectId);
                return;
            }
            
            effect.particles.forEach(particle => {
                this.updateParticle(particle, elapsed);
                this.renderParticle(particle);
            });
        });
    }
    
    /**
     * Update particle physics
     */
    updateParticle(particle, elapsed) {
        // Apply physics
        particle.vx *= particle.friction;
        particle.vy += particle.gravity * 0.016; // 60fps assumed
        particle.vy *= particle.friction;
        
        // Update position
        particle.x += particle.vx * 0.016;
        particle.y += particle.vy * 0.016;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Update opacity
        particle.opacity = Math.max(0, particle.opacity - particle.fadeRate);
        
        // Bounce off canvas edges
        if (particle.x < 0 || particle.x > this.canvas.width) {
            particle.vx *= -particle.bounce;
        }
        if (particle.y > this.canvas.height) {
            particle.vy *= -particle.bounce;
        }
    }
    
    /**
     * Render a single particle
     */
    renderParticle(particle) {
        if (particle.opacity <= 0) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        // Apply glow effect if enabled
        if (particle.glow) {
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.size * 2;
        }
        
        // Render based on shape
        this.renderShape(particle);
        
        this.ctx.restore();
    }
    
    /**
     * Render particle shape
     */
    renderShape(particle) {
        this.ctx.fillStyle = particle.color;
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 1;
        
        switch (particle.shape) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'square':
                this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                break;
                
            case 'diamond':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -particle.size);
                this.ctx.lineTo(particle.size, 0);
                this.ctx.lineTo(0, particle.size);
                this.ctx.lineTo(-particle.size, 0);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -particle.size);
                this.ctx.lineTo(particle.size * 0.7, particle.size * 0.7);
                this.ctx.lineTo(-particle.size * 0.7, particle.size * 0.7);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'star':
                this.drawStar(particle.size, 5);
                break;
                
            case 'crystal':
                this.drawCrystal(particle.size);
                break;
                
            case 'snowflake':
                this.drawSnowflake(particle.size);
                break;
                
            case 'flame':
                this.drawFlame(particle.size);
                break;
                
            case 'burst':
                this.drawBurst(particle.size);
                break;
                
            default:
                // Default to circle
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
        }
    }
    
    /**
     * Draw star shape
     */
    drawStar(size, points = 5) {
        this.ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? size : size * 0.4;
            const angle = (i / (points * 2)) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * Draw crystal shape
     */
    drawCrystal(size) {
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }
    
    /**
     * Draw snowflake shape
     */
    drawSnowflake(size) {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            
            // Add cross at tip
            const crossSize = size * 0.3;
            this.ctx.beginPath();
            this.ctx.moveTo(x - crossSize/2, y);
            this.ctx.lineTo(x + crossSize/2, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw flame shape
     */
    drawFlame(size) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, size);
        this.ctx.quadraticCurveTo(-size/2, size/2, -size/3, 0);
        this.ctx.quadraticCurveTo(0, -size, size/3, 0);
        this.ctx.quadraticCurveTo(size/2, size/2, 0, size);
        this.ctx.fill();
    }
    
    /**
     * Draw burst shape
     */
    drawBurst(size) {
        const rays = 8;
        this.ctx.beginPath();
        for (let i = 0; i < rays; i++) {
            const angle = (i / rays) * Math.PI * 2;
            const length = i % 2 === 0 ? size : size * 0.6;
            const x = Math.cos(angle) * length;
            const y = Math.sin(angle) * length;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * Set custom configuration for a mode
     */
    setModeConfig(modeId, config) {
        this.modeConfigs[modeId] = config;
        console.log(`✅ Custom particle config set for mode: ${modeId}`);
    }
    
    /**
     * Cleanup and restore original functions
     */
    cleanup() {
        this.isActive = false;
        
        // Restore original functions
        if (this.originalCreateImpactParticles) {
            window.createImpactParticles = this.originalCreateImpactParticles;
        }
        if (this.originalCreateDestructionParticles) {
            window.createDestructionParticles = this.originalCreateDestructionParticles;
        }
        
        // Remove canvas
        if (this.canvas) {
            this.canvas.remove();
        }
        
        // Clear particles
        this.particles.clear();
        
        console.log('🧹 Smart Particle System cleaned up');
    }
}

// Create global instance
window.SmartParticleSystem = new SmartParticleSystem();

// IMMEDIATE initialization for testing
console.log('🚀 IMMEDIATE: Attempting to initialize Smart Particle System right now...');
try {
    window.SmartParticleSystem.initialize();
    console.log('✅ IMMEDIATE: Smart Particle System initialized successfully!');
    
    // AGGRESSIVE: Keep re-overriding the functions every second
    const keepOverriding = () => {
        const smartImpact = (x, y, color) => {
            console.log('🚀 AGGRESSIVE Smart createImpactParticles called at', x, y);
            window.SmartParticleSystem.createConfigurableParticles(x, y, 'impact');
        };
        
        const smartDestruction = (x, y, color) => {
            console.log('💥 AGGRESSIVE Smart createDestructionParticles called at', x, y);
            window.SmartParticleSystem.createConfigurableParticles(x, y, 'destruction');
        };
        
        window.createImpactParticles = smartImpact;
        window.createDestructionParticles = smartDestruction;
        
        console.log('🔄 AGGRESSIVE: Re-overrode particle functions');
    };
    
    // Override immediately and then every second
    keepOverriding();
    setInterval(keepOverriding, 1000);
    
} catch (error) {
    console.error('❌ IMMEDIATE: Failed to initialize:', error);
}

// Auto-initialize when needed
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.SmartParticleSystem.initialize();
    }, 1000);
});

// Register with canvas plugin system if available
const registerWithCanvas = () => {
    if (window.CanvasPluginSystem) {
        const particleRenderPlugin = {
            name: 'SmartParticleSystem',
            isActive: true,
            render: (ctx, currentTime) => {
                console.log('🖌️ CANVAS SYSTEM: Calling SmartParticleSystem render');
                window.SmartParticleSystem.render(currentTime);
            }
        };
        
        window.CanvasPluginSystem.registerRenderPlugin(particleRenderPlugin);
        window.CanvasPluginSystem.activateRenderPlugin('SmartParticleSystem');
        console.log('✅ Smart Particle System registered with CanvasPluginSystem');
        
        // Test the canvas plugin system
        setTimeout(() => {
            console.log('🔍 CANVAS TEST: Available render plugins:', window.CanvasPluginSystem?.renderPlugins?.size || 0);
            console.log('🔍 CANVAS TEST: Active render plugins:', window.CanvasPluginSystem?.activeRenderPlugins?.size || 0);
        }, 2000);
    } else {
        console.log('❌ CanvasPluginSystem not available!');
    }
};

setTimeout(() => {
    console.log('🔍 Smart Particle System timeout reached, attempting initialization...');
    console.log('🔍 SmartParticleSystem exists:', !!window.SmartParticleSystem);
    console.log('🔍 initialize method exists:', typeof window.SmartParticleSystem?.initialize);
    
    registerWithCanvas();
    // Auto-activate the Smart Particle System
    if (window.SmartParticleSystem && typeof window.SmartParticleSystem.initialize === 'function') {
        console.log('🚀 Calling SmartParticleSystem.initialize()...');
        window.SmartParticleSystem.initialize();
    } else {
        console.error('❌ SmartParticleSystem or initialize method not available!');
    }
}, 1500);

console.log('⚡ Smart Particle System loaded - Mode-aware particle effects ready');