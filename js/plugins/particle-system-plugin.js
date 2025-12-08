/**
 * Particle System Plugin - Beautiful particle effects
 * Impact, explosion, and special effect particles with smart architecture
 */

class ParticleSystemPlugin {
    constructor() {
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 200;
        this.particleTypes = new Map();
        
        this.registerBuiltInParticleTypes();
    }
    
    initialize(engine) {
        this.engine = engine;
        this.colorThemes = engine.plugins.get('colorThemes');
        
        // Pre-create particle pool for performance
        this.initializeParticlePool();
        
        console.log('✨ Particle System plugin initialized');
    }
    
    registerBuiltInParticleTypes() {
        // Impact particles - when ball hits block
        this.registerParticleType('impact', {
            count: 5,
            life: 1.0,
            decay: 0.02,
            size: { min: 1, max: 3 },
            velocity: { min: 3, max: 10 },
            color: '#64B5F6',
            gravity: 0.1
        });
        
        // Destruction particles - when block destroyed
        this.registerParticleType('destruction', {
            count: 12,
            life: 1.5,
            decay: 0.015,
            size: { min: 2, max: 4 },
            velocity: { min: 5, max: 15 },
            color: '#FF6B35',
            gravity: 0.2
        });
        
        // Explosion particles - Ball Go Boom mode
        this.registerParticleType('explosion', {
            count: 25,
            life: 2.0,
            decay: 0.01,
            size: { min: 3, max: 6 },
            velocity: { min: 10, max: 25 },
            colors: ['#ff1744', '#ff4400', '#ff8800', '#ffaa00'],
            gravity: 0.15,
            glow: true
        });
        
        // Ice particles - Ice Mode freeze effects
        this.registerParticleType('freeze', {
            count: 8,
            life: 2.5,
            decay: 0.012,
            size: { min: 2, max: 5 },
            velocity: { min: 2, max: 8 },
            colors: ['#00e5ff', '#4dd0e1', '#b3e5fc'],
            gravity: -0.05, // Float upward
            sparkle: true
        });
        
        // Spawner particles - Golden spawn effects
        this.registerParticleType('spawn', {
            count: 15,
            life: 1.8,
            decay: 0.014,
            size: { min: 2, max: 4 },
            velocity: { min: 4, max: 12 },
            colors: ['#FFD700', '#FFF59D', '#F9A825'],
            gravity: 0.05,
            glow: true
        });
    }
    
    registerParticleType(name, config) {
        this.particleTypes.set(name, config);
    }
    
    initializeParticlePool() {
        // Pre-create particles for better performance
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(this.createEmptyParticle());
        }
    }
    
    createEmptyParticle() {
        return {
            x: 0, y: 0,
            velocityX: 0, velocityY: 0,
            life: 0, maxLife: 0,
            decay: 0,
            size: 0,
            color: '#ffffff',
            alpha: 1,
            gravity: 0,
            glow: false,
            sparkle: false,
            active: false
        };
    }
    
    // Public API for creating particle effects
    createParticleEffect(type, x, y, options = {}) {
        const config = this.particleTypes.get(type);
        if (!config) {
            console.warn(`Unknown particle type: ${type}`);
            return;
        }
        
        const count = options.count || config.count;
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break; // Pool exhausted
            
            this.initializeParticle(particle, config, x, y, options);
            particles.push(particle);
        }
        
        // Add to active particle list
        this.particles.push(...particles);
        
        console.log(`✨ Created ${particles.length} ${type} particles`);
    }
    
    getParticleFromPool() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        
        // Pool exhausted, remove oldest active particle
        if (this.particles.length > 0) {
            const oldest = this.particles.shift();
            oldest.active = false;
            return oldest;
        }
        
        return null;
    }
    
    initializeParticle(particle, config, x, y, options) {
        // Position with optional spread
        const spread = options.spread || 0;
        particle.x = x + (Math.random() - 0.5) * spread;
        particle.y = y + (Math.random() - 0.5) * spread;
        
        // Velocity
        const angle = Math.random() * Math.PI * 2;
        const velocity = config.velocity.min + Math.random() * (config.velocity.max - config.velocity.min);
        particle.velocityX = Math.cos(angle) * velocity;
        particle.velocityY = Math.sin(angle) * velocity;
        
        // Directional bias (for explosions, etc.)
        if (options.direction) {
            particle.velocityX += options.direction.x || 0;
            particle.velocityY += options.direction.y || 0;
        }
        
        // Life and decay
        particle.life = config.life;
        particle.maxLife = config.life;
        particle.decay = config.decay;
        particle.alpha = 1.0;
        
        // Size
        particle.size = config.size.min + Math.random() * (config.size.max - config.size.min);
        
        // Color
        if (config.colors && Array.isArray(config.colors)) {
            particle.color = config.colors[Math.floor(Math.random() * config.colors.length)];
        } else {
            particle.color = options.color || config.color;
        }
        
        // Special properties
        particle.gravity = config.gravity || 0;
        particle.glow = config.glow || false;
        particle.sparkle = config.sparkle || false;
        particle.active = true;
    }
    
    // Update particles each frame
    update(deltaTime) {
        const deltaMultiplier = deltaTime / 16.67; // Normalize to 60fps
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.active || particle.life <= 0) {
                // Return to pool
                particle.active = false;
                this.particlePool.push(particle);
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update position
            particle.x += particle.velocityX * deltaMultiplier;
            particle.y += particle.velocityY * deltaMultiplier;
            
            // Apply gravity
            if (particle.gravity) {
                particle.velocityY += particle.gravity * deltaMultiplier;
            }
            
            // Update life
            particle.life -= particle.decay * deltaMultiplier;
            particle.alpha = particle.life / particle.maxLife;
        }
    }
    
    // Render particles
    render(ctx) {
        for (const particle of this.particles) {
            if (!particle.active || particle.alpha <= 0) continue;
            
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            
            // Glow effect
            if (particle.glow) {
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 10;
            }
            
            // Sparkle effect
            if (particle.sparkle && Math.random() < 0.3) {
                ctx.shadowBlur = 15;
                ctx.globalAlpha = Math.min(particle.alpha * 1.5, 1.0);
            }
            
            // Render particle
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // Convenient methods for common effects
    createImpactEffect(x, y) {
        this.createParticleEffect('impact', x, y, { spread: 10 });
    }
    
    createDestructionEffect(x, y) {
        this.createParticleEffect('destruction', x, y, { spread: 15 });
    }
    
    createExplosionEffect(x, y, intensity = 1.0) {
        this.createParticleEffect('explosion', x, y, {
            count: Math.floor(25 * intensity),
            spread: 20 * intensity
        });
    }
    
    createFreezeEffect(x, y) {
        this.createParticleEffect('freeze', x, y, {
            spread: 12,
            direction: { x: 0, y: -2 } // Upward bias
        });
    }
    
    createSpawnEffect(x, y) {
        this.createParticleEffect('spawn', x, y, { spread: 18 });
    }
    
    // Performance monitoring
    getParticleCount() {
        return this.particles.length;
    }
    
    getPoolSize() {
        return this.particlePool.length;
    }
}

// Export
window.ParticleSystemPlugin = ParticleSystemPlugin;
console.log('✨ Beautiful Particle System Plugin loaded');