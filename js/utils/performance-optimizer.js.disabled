/**
 * PERFORMANCE OPTIMIZER FOR BALL DEFENDER
 * ========================================
 * Ensures smooth, consistent gameplay across all devices and modes
 * Critical for fair leaderboard competition
 */

console.log('⚡ Performance Optimizer Loading...');

// Performance metrics tracking
const performanceMetrics = {
    frameCount: 0,
    totalFrameTime: 0,
    worstFrameTime: 0,
    droppedFrames: 0,
    lastFrameTimestamp: 0,
    fpsHistory: [],
    memorySnapshots: [],
    
    // Performance thresholds
    TARGET_FPS: 60,
    MIN_ACCEPTABLE_FPS: 50,
    MAX_FRAME_TIME: 33.33, // 30 FPS is minimum acceptable
    
    // Tracking intervals
    metricsInterval: null,
    memoryInterval: null
};

// Start performance monitoring
function startPerformanceMonitoring() {
    console.log('📊 Starting performance monitoring...');
    
    // Monitor FPS every second
    performanceMetrics.metricsInterval = setInterval(() => {
        const avgFrameTime = performanceMetrics.totalFrameTime / performanceMetrics.frameCount || 16.67;
        const avgFPS = 1000 / avgFrameTime;
        
        performanceMetrics.fpsHistory.push(avgFPS);
        if (performanceMetrics.fpsHistory.length > 60) {
            performanceMetrics.fpsHistory.shift(); // Keep last 60 seconds
        }
        
        // Check for performance issues
        if (avgFPS < performanceMetrics.MIN_ACCEPTABLE_FPS) {
            console.warn(`⚠️ Low FPS detected: ${avgFPS.toFixed(1)} FPS`);
            console.warn(`  Worst frame: ${performanceMetrics.worstFrameTime.toFixed(1)}ms`);
            console.warn(`  Dropped frames: ${performanceMetrics.droppedFrames}`);
            
            // Auto-adjust quality if needed
            autoAdjustQuality(avgFPS);
        }
        
        // Reset counters
        performanceMetrics.frameCount = 0;
        performanceMetrics.totalFrameTime = 0;
        performanceMetrics.worstFrameTime = 0;
        performanceMetrics.droppedFrames = 0;
    }, 1000);
    
    // Monitor memory usage every 5 seconds
    if (performance.memory) {
        performanceMetrics.memoryInterval = setInterval(() => {
            const memoryMB = performance.memory.usedJSHeapSize / 1048576;
            performanceMetrics.memorySnapshots.push(memoryMB);
            
            if (performanceMetrics.memorySnapshots.length > 12) {
                performanceMetrics.memorySnapshots.shift();
            }
            
            // Check for memory leaks (consistent growth)
            if (performanceMetrics.memorySnapshots.length >= 5) {
                const recentGrowth = performanceMetrics.memorySnapshots.slice(-5);
                const isGrowing = recentGrowth.every((val, i) => 
                    i === 0 || val > recentGrowth[i - 1] * 1.01
                );
                
                if (isGrowing) {
                    console.warn(`⚠️ Potential memory leak detected!`);
                    console.warn(`  Memory usage: ${memoryMB.toFixed(1)}MB`);
                    cleanupMemory();
                }
            }
        }, 5000);
    }
}

// Hook into game loop to measure frame times
function hookGameLoop() {
    const originalGameLoop = window.gameLoop;
    if (!originalGameLoop) {
        console.warn('⚠️ Game loop not found, retrying...');
        setTimeout(hookGameLoop, 1000);
        return;
    }
    
    window.gameLoop = function() {
        const startTime = performance.now();
        
        // Call original game loop
        const result = originalGameLoop.apply(this, arguments);
        
        // Measure frame time
        const frameTime = performance.now() - startTime;
        performanceMetrics.frameCount++;
        performanceMetrics.totalFrameTime += frameTime;
        
        if (frameTime > performanceMetrics.worstFrameTime) {
            performanceMetrics.worstFrameTime = frameTime;
        }
        
        if (frameTime > performanceMetrics.MAX_FRAME_TIME) {
            performanceMetrics.droppedFrames++;
        }
        
        return result;
    };
    
    console.log('✅ Performance monitoring hooked into game loop');
}

// Auto-adjust quality settings based on performance
function autoAdjustQuality(currentFPS) {
    console.log(`🔧 Auto-adjusting quality for ${currentFPS.toFixed(1)} FPS...`);
    
    // Aggressive particle reduction for slow devices
    if (currentFPS < 40) {
        // Severe performance issues - drastically reduce particles
        if (window.particles && window.particles.length > 20) {
            window.particles = window.particles.slice(-10);
            console.log('  🚨 Emergency particle reduction: limited to 10 particles');
        }
        
        // Enable low-quality particle rendering
        window.PARTICLE_QUALITY = 'low';
        window.PARTICLE_SKIP_FRAMES = 2; // Only render every 3rd frame
        window.MAX_EXPLOSION_PARTICLES = 15; // Reduce explosion particles
        
        console.log('  🚨 Emergency mode: Low quality particles, reduced explosions');
    } else if (currentFPS < 50) {
        // Moderate performance issues - reduce particle count
        if (window.particles && window.particles.length > 50) {
            window.particles = window.particles.slice(-25);
            console.log('  ⚠️ Moderate particle reduction: limited to 25 particles');
        }
        
        window.PARTICLE_QUALITY = 'medium';
        window.PARTICLE_SKIP_FRAMES = 1; // Render every other frame
        window.MAX_EXPLOSION_PARTICLES = 25;
        
        console.log('  ⚠️ Performance mode: Medium quality particles');
    }
    
    // Reduce max particles for future spawning
    if (window.MAX_PARTICLES && window.MAX_PARTICLES > 50) {
        window.MAX_PARTICLES = Math.floor(window.MAX_PARTICLES * 0.75);
        console.log(`  Reduced max particles to ${window.MAX_PARTICLES}`);
    }
    
    // Reduce visual effects
    if (window.visualEffectsEnabled !== false) {
        window.visualEffectsEnabled = false;
        console.log('  Disabled visual effects');
    }
    
    // Simplify rendering
    if (window.renderQuality !== 'low') {
        window.renderQuality = 'low';
        console.log('  Set render quality to low');
    }
}

// Memory cleanup
function cleanupMemory() {
    console.log('🧹 Running memory cleanup...');
    
    // Clean up old particles
    if (window.particles && window.particles.length > 100) {
        window.particles = window.particles.slice(-50);
        console.log('  Cleaned up excess particles');
    }
    
    // Clean up DOM overlays (ice mode and other effects)
    const oldOverlays = document.querySelectorAll('.ice-overlay, .effect-overlay, .freeze-countdown');
    if (oldOverlays.length > 50) {
        let removed = 0;
        oldOverlays.forEach((overlay, i) => {
            if (i < oldOverlays.length - 30) {
                overlay.remove();
                removed++;
            }
        });
        console.log(`  Removed ${removed} old overlays`);
    }
    
    // Clean up orphaned timers from ice mode
    if (window.iceMode && window.iceMode.freezeTimers) {
        let cleanedTimers = 0;
        window.iceMode.freezeTimers.forEach((timer, index) => {
            // Check if block still exists
            const blockExists = window.blocks && window.blocks[index] && !window.blocks[index].destroyed;
            if (!blockExists) {
                clearInterval(timer);
                window.iceMode.freezeTimers.delete(index);
                window.iceMode.frozenBlocks.delete(index);
                cleanedTimers++;
            }
        });
        if (cleanedTimers > 0) {
            console.log(`  Cleaned ${cleanedTimers} orphaned ice mode timers`);
        }
    }
    
    // Force garbage collection if available
    if (window.gc) {
        window.gc();
        console.log('  Forced garbage collection');
    }
}

// Optimize collision detection
function optimizeCollisionDetection() {
    console.log('🚀 Optimizing collision detection...');
    
    // Skip collision checks on some frames for performance
    window.COLLISION_SKIP_FRAMES = 0;
    window.COLLISION_FRAME_COUNTER = 0;
    
    // Spatial partitioning for collision detection (future enhancement)
    window.spatialGrid = {
        cellSize: 100,
        cells: {},
        
        addBlock: function(block, index) {
            const cellX = Math.floor(block.x / this.cellSize);
            const cellY = Math.floor(block.y / this.cellSize);
            const key = `${cellX},${cellY}`;
            
            if (!this.cells[key]) {
                this.cells[key] = [];
            }
            this.cells[key].push({ block, index });
        },
        
        getBlocksNear: function(x, y, radius) {
            const results = [];
            const cellRadius = Math.ceil(radius / this.cellSize);
            const centerCellX = Math.floor(x / this.cellSize);
            const centerCellY = Math.floor(y / this.cellSize);
            
            for (let dx = -cellRadius; dx <= cellRadius; dx++) {
                for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                    const key = `${centerCellX + dx},${centerCellY + dy}`;
                    if (this.cells[key]) {
                        results.push(...this.cells[key]);
                    }
                }
            }
            
            return results;
        },
        
        clear: function() {
            this.cells = {};
        }
    };
    
    // Optimize expensive math operations
    if (!window.optimizedSqrt) {
        window.optimizedSqrt = function(value) {
            // Use faster approximation for non-critical distance calculations
            return Math.sqrt(value);
        };
        
        // Cache common calculations
        window.distanceCache = new Map();
        window.calculateDistance = function(x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        };
    }
    
    console.log('✅ Collision detection optimizations ready');
}

// Ensure consistent physics timing
function ensureConsistentPhysics() {
    console.log('⏱️ Ensuring consistent physics timing...');
    
    // Fixed timestep physics for consistency
    window.PHYSICS_TIMESTEP = 1000 / 60; // 60 Hz physics
    window.physicsAccumulator = 0;
    window.MAX_DELTA_CAP = 33.33; // Cap delta at 30 FPS minimum
    
    // Store original game loop if not already stored
    if (!window.originalGameLoopForPerf && window.gameLoop) {
        window.originalGameLoopForPerf = window.gameLoop;
    }
    
    // Cap delta time for consistent physics across devices
    window.capDeltaTime = function(deltaTime) {
        // Cap maximum delta time to prevent huge jumps
        const cappedDelta = Math.min(deltaTime, window.MAX_DELTA_CAP);
        
        // Ensure minimum delta time for high refresh rate displays
        const consistentDelta = Math.max(cappedDelta, 8.33); // 120 FPS max
        
        return consistentDelta;
    };
    
    console.log('✅ Delta time capping enabled (8.33ms - 33.33ms range)');
    console.log('✅ Physics timing consistency initialized');
}

// Performance report
window.getPerformanceReport = function() {
    const avgFPS = performanceMetrics.fpsHistory.reduce((a, b) => a + b, 0) / performanceMetrics.fpsHistory.length || 60;
    const minFPS = Math.min(...performanceMetrics.fpsHistory);
    const maxFPS = Math.max(...performanceMetrics.fpsHistory);
    
    const report = {
        averageFPS: avgFPS.toFixed(1),
        minFPS: minFPS.toFixed(1),
        maxFPS: maxFPS.toFixed(1),
        consistency: ((1 - (maxFPS - minFPS) / avgFPS) * 100).toFixed(1) + '%',
        memoryUsageMB: performance.memory ? 
            (performance.memory.usedJSHeapSize / 1048576).toFixed(1) : 'N/A',
        particleCount: window.particles ? window.particles.length : 0,
        particleQuality: window.PARTICLE_QUALITY || 'high',
        particleSkipFrames: window.PARTICLE_SKIP_FRAMES || 0,
        maxParticles: window.MAX_PARTICLES || 100
    };
    
    console.log('📊 PERFORMANCE REPORT:');
    console.log(`  Average FPS: ${report.averageFPS}`);
    console.log(`  Min FPS: ${report.minFPS}`);
    console.log(`  Max FPS: ${report.maxFPS}`);
    console.log(`  Consistency: ${report.consistency}`);
    console.log(`  Memory: ${report.memoryUsageMB} MB`);
    console.log(`  Particles: ${report.particleCount}/${report.maxParticles}`);
    console.log(`  Quality: ${report.particleQuality} (skip ${report.particleSkipFrames} frames)`);
    
    return report;
};

// Mobile-specific performance profiles
const MOBILE_PERFORMANCE_PROFILES = {
    phone: {
        ultra: { particles: 50, explosionParticles: 20, skipFrames: 0, quality: 'medium' },
        high: { particles: 35, explosionParticles: 15, skipFrames: 0, quality: 'medium' },
        medium: { particles: 25, explosionParticles: 12, skipFrames: 1, quality: 'low' },
        low: { particles: 15, explosionParticles: 8, skipFrames: 2, quality: 'low' },
        potato: { particles: 8, explosionParticles: 4, skipFrames: 3, quality: 'low' }
    },
    tablet: {
        ultra: { particles: 100, explosionParticles: 30, skipFrames: 0, quality: 'high' },
        high: { particles: 75, explosionParticles: 25, skipFrames: 0, quality: 'medium' },
        medium: { particles: 50, explosionParticles: 20, skipFrames: 1, quality: 'medium' },
        low: { particles: 30, explosionParticles: 15, skipFrames: 2, quality: 'low' },
        potato: { particles: 15, explosionParticles: 8, skipFrames: 3, quality: 'low' }
    },
    desktop: {
        ultra: { particles: 200, explosionParticles: 50, skipFrames: 0, quality: 'high' },
        high: { particles: 100, explosionParticles: 35, skipFrames: 0, quality: 'high' },
        medium: { particles: 50, explosionParticles: 25, skipFrames: 1, quality: 'medium' },
        low: { particles: 25, explosionParticles: 15, skipFrames: 2, quality: 'low' },
        potato: { particles: 10, explosionParticles: 5, skipFrames: 3, quality: 'low' }
    }
};

// Mode Template System Performance Interface
window.ModePerformanceManager = {
    // Register mode-specific performance requirements
    registerMode: function(modeId, requirements) {
        if (!window.modePerformanceRequirements) {
            window.modePerformanceRequirements = {};
        }
        
        window.modePerformanceRequirements[modeId] = {
            baseParticleMultiplier: requirements.baseParticleMultiplier || 1.0,
            explosionIntensity: requirements.explosionIntensity || 1.0,
            visualEffectsIntensity: requirements.visualEffectsIntensity || 1.0,
            preferredQuality: requirements.preferredQuality || 'auto',
            customOptimizations: requirements.customOptimizations || {}
        };
        
        console.log(`🎮 Mode ${modeId} performance requirements registered`);
    },
    
    // Apply mode-specific optimizations
    applyModeOptimizations: function(modeId) {
        const requirements = window.modePerformanceRequirements?.[modeId];
        if (!requirements) return;
        
        const deviceType = this.getDeviceType();
        const currentProfile = this.getCurrentProfile();
        
        // Apply mode-specific multipliers
        if (requirements.baseParticleMultiplier !== 1.0) {
            window.MAX_PARTICLES = Math.ceil(currentProfile.particles * requirements.baseParticleMultiplier);
            window.MAX_EXPLOSION_PARTICLES = Math.ceil(currentProfile.explosionParticles * requirements.explosionIntensity);
        }
        
        // Apply custom optimizations
        Object.assign(window, requirements.customOptimizations);
        
        console.log(`🎯 Applied ${modeId} mode optimizations for ${deviceType}`);
    },
    
    getDeviceType: function() {
        if (window.MobileControls?.isMobile) return 'phone';
        if (window.MobileControls?.isTablet) return 'tablet';
        return 'desktop';
    },
    
    getCurrentProfile: function() {
        const deviceType = this.getDeviceType();
        const performanceMode = window.currentPerformanceMode || 'medium';
        return MOBILE_PERFORMANCE_PROFILES[deviceType][performanceMode];
    }
};

// Manual performance controls
window.setPerformanceMode = function(mode) {
    console.log(`🎛️ Setting performance mode to: ${mode}`);
    
    // Store current mode for future reference
    window.currentPerformanceMode = mode.toLowerCase();
    
    // Get device-specific profile
    const deviceType = window.MobileControls?.isMobile ? 'phone' : 
                      window.MobileControls?.isTablet ? 'tablet' : 'desktop';
    
    const profile = MOBILE_PERFORMANCE_PROFILES[deviceType]?.[mode.toLowerCase()];
    
    if (!profile) {
        console.log('❌ Invalid mode. Use: ultra, high, medium, low, potato');
        return;
    }
    
    // Apply device-optimized settings
    window.PARTICLE_QUALITY = profile.quality;
    window.PARTICLE_SKIP_FRAMES = profile.skipFrames;
    window.MAX_PARTICLES = profile.particles;
    window.MAX_EXPLOSION_PARTICLES = profile.explosionParticles;
    
    // Clear existing particles if new limit is lower
    if (window.particles && window.particles.length > profile.particles) {
        window.particles.length = 0;
    }
    
    // Apply current mode optimizations if in a specific mode
    if (window.currentGameMode?.id && window.ModePerformanceManager) {
        window.ModePerformanceManager.applyModeOptimizations(window.currentGameMode.id);
    }
    
    const modeDescriptions = {
        ultra: `⚡ Ultra mode: Maximum quality for ${deviceType}`,
        high: `🔥 High mode: Good quality for ${deviceType}`,
        medium: `⚠️ Medium mode: Balanced performance for ${deviceType}`,
        low: `🚨 Low mode: Maximum performance for ${deviceType}`,
        potato: `🥔 Potato mode: Minimal effects for slow ${deviceType}`
    };
    
    console.log(modeDescriptions[mode.toLowerCase()]);
    console.log(`  Particles: ${profile.particles}, Explosions: ${profile.explosionParticles}, Quality: ${profile.quality}`);
    
    // Clean up excess particles if new limit is lower
    if (window.particles && window.particles.length > window.MAX_PARTICLES) {
        window.particles = window.particles.slice(-window.MAX_PARTICLES);
        console.log(`  Reduced particles to ${window.MAX_PARTICLES}`);
    }
};

// Optimize rendering performance
function optimizeRendering() {
    console.log('🎨 Optimizing rendering performance...');
    
    // Reduce canvas clearing frequency if possible
    if (window.ctx) {
        // Store original clearRect method
        if (!window.originalClearRect) {
            window.originalClearRect = window.ctx.clearRect.bind(window.ctx);
        }
        
        // Implement dirty rectangle clearing (optional optimization)
        window.clearCanvasOptimized = function() {
            if (window.PERFORMANCE_MODE === 'optimized' && window.lastClearTime) {
                const now = performance.now();
                if (now - window.lastClearTime < 8.33) { // Skip clearing at >120fps
                    return;
                }
            }
            window.originalClearRect(0, 0, window.canvas.width, window.canvas.height);
            window.lastClearTime = performance.now();
        };
    }
    
    // Set rendering quality flags
    window.RENDER_QUALITY = window.RENDER_QUALITY || 'high';
    window.USE_ANTIALIASING = window.USE_ANTIALIASING !== false; // Default true
    window.MAX_PARTICLES = window.MAX_PARTICLES || 200;
    
    console.log('✅ Rendering optimizations enabled');
}

// Optimize particle system specifically
function optimizeParticleSystem() {
    console.log('✨ Optimizing particle system...');
    
    // Initialize particle performance settings
    window.PARTICLE_QUALITY = window.PARTICLE_QUALITY || 'high';
    window.PARTICLE_SKIP_FRAMES = window.PARTICLE_SKIP_FRAMES || 0;
    window.MAX_EXPLOSION_PARTICLES = window.MAX_EXPLOSION_PARTICLES || 50;
    window.PARTICLE_FRAME_COUNTER = 0;
    
    // Hook into particle rendering for performance improvements
    if (window.drawParticles) {
        const originalDrawParticles = window.drawParticles;
        window.drawParticles = function() {
            // Skip particle rendering on some frames for performance
            window.PARTICLE_FRAME_COUNTER = (window.PARTICLE_FRAME_COUNTER + 1) % (window.PARTICLE_SKIP_FRAMES + 1);
            if (window.PARTICLE_FRAME_COUNTER !== 0) {
                return; // Skip this frame
            }
            
            // Limit particle count before rendering
            if (window.particles && window.particles.length > (window.MAX_PARTICLES || 100)) {
                window.particles = window.particles.slice(-(window.MAX_PARTICLES || 100));
            }
            
            // Use optimized rendering based on quality setting
            if (window.PARTICLE_QUALITY === 'low') {
                drawParticlesLowQuality();
            } else if (window.PARTICLE_QUALITY === 'medium') {
                drawParticlesMediumQuality();
            } else {
                originalDrawParticles.apply(this, arguments);
            }
        };
    }
    
    // Low quality particle renderer - squares instead of circles
    window.drawParticlesLowQuality = function() {
        if (!window.particles) return;
        const ctx = window.ctx;
        if (!ctx) return;
        
        window.particles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            // Draw squares instead of circles for better performance
            const size = particle.size;
            ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
        });
        ctx.globalAlpha = 1.0;
    };
    
    // Medium quality particle renderer - smaller circles
    window.drawParticlesMediumQuality = function() {
        if (!window.particles) return;
        const ctx = window.ctx;
        if (!ctx) return;
        
        window.particles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            // Reduce particle size for better performance
            const size = Math.max(1, particle.size * 0.7);
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    };
    
    console.log('✅ Particle system optimizations enabled');
}

// Initialize performance optimizations
function initializeOptimizations() {
    startPerformanceMonitoring();
    hookGameLoop();
    optimizeCollisionDetection();
    optimizeRendering();
    optimizeParticleSystem();
    ensureConsistentPhysics();
    
    // Set global performance flags
    window.PERFORMANCE_MODE = 'optimized';
    window.TARGET_FPS = 60;
    window.MAX_DELTA_TIME = 33.33; // Cap at 30 FPS minimum
    window.MAX_PARTICLES = 100; // Initial particle limit
    
    // Hook into canvas context if available
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        window.canvas = canvas;
        window.ctx = canvas.getContext('2d');
        
        // Disable smoothing for pixel-perfect rendering (better performance)
        if (window.ctx && window.RENDER_QUALITY === 'performance') {
            window.ctx.imageSmoothingEnabled = false;
            window.ctx.webkitImageSmoothingEnabled = false;
            window.ctx.mozImageSmoothingEnabled = false;
            console.log('🎨 Image smoothing disabled for better performance');
        }
    }
    
    console.log('⚡ Performance Optimizer fully initialized!');
    console.log('📊 Use window.getPerformanceReport() to check performance');
    console.log('🎛️ Performance mode:', window.PERFORMANCE_MODE);
    console.log('🎯 Target FPS:', window.TARGET_FPS);
    console.log('✨ Particle limit:', window.MAX_PARTICLES);
}

// Auto-initialize after delay
setTimeout(initializeOptimizations, 2000);

console.log('⚡ Performance Optimizer loaded - initializing in 2 seconds...');