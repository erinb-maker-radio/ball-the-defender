/**
 * MODE PERFORMANCE TEMPLATE
 * ========================
 * Example template showing how new modes can register performance requirements
 * This ensures all future modes work optimally across all devices
 */

// Example 1: High-intensity mode with lots of effects
if (window.ModePerformanceManager) {
    window.ModePerformanceManager.registerMode('volcanicMode', {
        // Particle multipliers (1.0 = default, >1.0 = more particles, <1.0 = fewer)
        baseParticleMultiplier: 1.5,  // 50% more particles for lava effects
        explosionIntensity: 2.0,       // Double explosion particles for volcanic eruptions
        visualEffectsIntensity: 1.3,   // 30% more visual effects
        
        // Preferred quality (auto, high, medium, low)
        preferredQuality: 'high',      // This mode looks best with high quality
        
        // Custom optimizations specific to this mode
        customOptimizations: {
            VOLCANIC_LAVA_PARTICLES: true,
            MAX_LAVA_STREAMS: 3,
            LAVA_PARTICLE_LIFE: 2.0,
            VOLCANIC_SCREEN_HEAT_EFFECT: true
        }
    });
}

// Example 2: Minimal performance mode
if (window.ModePerformanceManager) {
    window.ModePerformanceManager.registerMode('minimalistMode', {
        // Very light on performance
        baseParticleMultiplier: 0.3,   // 70% fewer particles
        explosionIntensity: 0.5,       // Half the explosion effects
        visualEffectsIntensity: 0.2,   // Minimal visual effects
        
        // Prefers low quality for clean look
        preferredQuality: 'low',
        
        // Custom optimizations
        customOptimizations: {
            MINIMALIST_RENDERING: true,
            DISABLE_GLOW_EFFECTS: true,
            SIMPLE_COLLISION_PARTICLES: true
        }
    });
}

// Example 3: Mode that adapts based on device
if (window.ModePerformanceManager) {
    window.ModePerformanceManager.registerMode('adaptiveMode', {
        // Base settings
        baseParticleMultiplier: 1.0,
        explosionIntensity: 1.0,
        visualEffectsIntensity: 1.0,
        preferredQuality: 'auto',
        
        // Device-specific customizations
        customOptimizations: {
            // Function that adjusts based on device capabilities
            applyDeviceSpecificSettings: function() {
                const deviceType = window.MobileControls?.isMobile ? 'phone' : 
                                 window.MobileControls?.isTablet ? 'tablet' : 'desktop';
                
                switch(deviceType) {
                    case 'phone':
                        window.ADAPTIVE_MODE_EFFECTS = 'minimal';
                        window.ADAPTIVE_PARTICLE_SIZE = 0.7;
                        break;
                    case 'tablet':
                        window.ADAPTIVE_MODE_EFFECTS = 'medium';
                        window.ADAPTIVE_PARTICLE_SIZE = 0.9;
                        break;
                    case 'desktop':
                        window.ADAPTIVE_MODE_EFFECTS = 'full';
                        window.ADAPTIVE_PARTICLE_SIZE = 1.0;
                        break;
                }
                
                console.log(`🎯 Adaptive mode configured for ${deviceType}`);
            }
        }
    });
}

/**
 * PERFORMANCE REGISTRATION TEMPLATE FOR NEW MODES
 * ===============================================
 * 
 * Copy this template when creating new modes:
 * 
 * if (window.ModePerformanceManager) {
 *     window.ModePerformanceManager.registerMode('yourModeName', {
 *         // Particle settings (1.0 = default)
 *         baseParticleMultiplier: 1.0,    // Overall particle count
 *         explosionIntensity: 1.0,        // Explosion particle count
 *         visualEffectsIntensity: 1.0,    // Other visual effects
 *         
 *         // Quality preference
 *         preferredQuality: 'auto',       // auto, high, medium, low
 *         
 *         // Mode-specific settings
 *         customOptimizations: {
 *             // Add your mode's specific performance variables here
 *             YOUR_MODE_CUSTOM_SETTING: true,
 *             YOUR_MODE_PARTICLE_LIMIT: 50,
 *             
 *             // Optional: Custom initialization function
 *             init: function() {
 *                 console.log('Your mode performance settings initialized');
 *             }
 *         }
 *     });
 * }
 * 
 * DEVICE-AWARE PERFORMANCE:
 * ========================
 * The system automatically applies different settings based on device:
 * 
 * Phone (mobile):     Lower particle counts, simplified effects
 * Tablet:             Medium particle counts, balanced effects  
 * Desktop:            Full particle counts, all effects enabled
 * 
 * Your mode will automatically work optimally on all devices!
 * 
 * ACTIVATION:
 * ==========
 * Performance settings are automatically applied when switching to your mode.
 * You can also manually trigger optimizations:
 * 
 * window.ModePerformanceManager.applyModeOptimizations('yourModeName');
 * 
 * TESTING:
 * =======
 * Test your mode on different performance levels:
 * 
 * window.setPerformanceMode('potato');  // Very slow devices
 * window.setPerformanceMode('low');     // Slow devices  
 * window.setPerformanceMode('medium');  // Average devices
 * window.setPerformanceMode('high');    // Good devices
 * window.setPerformanceMode('ultra');   // High-end devices
 */

console.log('📋 Mode Performance Template loaded - examples for future mode development');

// Export for reference
window.ModePerformanceExamples = {
    volcanicMode: 'High-intensity mode with extra particles',
    minimalistMode: 'Performance-optimized minimal effects mode', 
    adaptiveMode: 'Device-aware adaptive effects mode'
};