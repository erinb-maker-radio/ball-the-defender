/**
 * ORIGINAL MODE - PROPER IMPLEMENTATION
 * =====================================
 * 
 * This is the proper implementation of Original Mode using the Mode Template System,
 * matching the structure and approach used by Ice Mode.
 */

const originalModeDefinition = {
    id: 'original',
    name: 'Original',
    description: 'The classic Ball Defender experience',
    
    colorScheme: {
        background: { 
            primary: '#1a1a2e', 
            secondary: '#0f0f1e', 
            accent: '#16213e' 
        },
        // Using PROTECTED Original Theme instead - providing minimal fallback only
        blockByHP: null,    // Using PROTECTED Original Theme instead
        special: null       // Using PROTECTED Original Theme instead
    },
    
    mechanics: {
        startingBalls: 1,
        ballSpeed: 1.0,
        specialFeatures: [
            {
                id: 'classicGameplay',
                type: 'gameBehavior',
                name: 'Classic Gameplay',
                description: 'Traditional Ball Defender mechanics with clean performance',
                effect: {
                    cleanPerformance: true,
                    optimizedRendering: true,
                    stableFrameRate: true
                },
                
                /**
                 * This function is called when the mode is activated.
                 * The 'this' context is a sandboxed feature context.
                 */
                onActivate: function() {
                    console.log('🌟 Initializing Original Mode Classic Gameplay Systems');
                    
                    // Create the classic gameplay system
                    const classicSystem = {
                        name: 'Classic Ball Defender',
                        version: '2.0.0',
                        
                        // Clean up any mode-specific overlays or systems
                        cleanup: function() {
                            console.log('🧹 Original Mode cleanup complete');
                        },
                        
                        // Performance optimization for Original Mode
                        optimizePerformance: function() {
                            // Original Mode focuses on clean, stable performance
                            if (window.optimizedCanvasSystem) {
                                window.optimizedCanvasSystem.setOptimizationLevel('balanced');
                            }
                        }
                    };
                    
                    // Register the classic system globally using the feature context
                    this.registerGlobal('originalMode', classicSystem);
                    console.log('🌟 Classic gameplay system registered through Mode Template System');
                    
                    // Add cleanup function for mode deactivation
                    this.addCleanup(() => {
                        if (window.originalMode && window.originalMode.cleanup) {
                            window.originalMode.cleanup();
                        }
                        // Also clean up the direct reference
                        delete window.originalMode;
                    });
                    
                    // Optimize performance for Original Mode
                    classicSystem.optimizePerformance();
                    
                    // Activate plugins for Original Mode
                    if (window.PluginManager) {
                        console.log('🎨 Activating plugins for Original Mode');
                        window.PluginManager.activatePluginsForMode('original');
                    } else {
                        console.warn('⚠️ PluginManager not found - some features may not work');
                    }
                    
                    console.log('✅ Original Mode classic systems initialized');
                }
            }
        ]
    },
    
    audioConfig: {
        progression: [1, 4, 5, 1],
        key: 'C',
        style: { 
            tempo: 'medium', 
            attack: 'normal', 
            sustain: 'medium',
            timbre: 'classic' 
        },
        soundEffects: {
            blockHit: { frequency: 800, duration: 0.1, timbre: 'pure' },
            blockDestroy: { frequency: 400, duration: 0.2, timbre: 'warm' },
            ballBounce: { frequency: 1200, duration: 0.05, timbre: 'bright' }
        }
    },
    
    leaderboard: {
        key: 'ballDefender_original_Leaderboard',
        gistFile: 'ball-defender-original-leaderboard.json'
    },
    
    stylesheet: {
        customCSS: `
            .mode-original {
                --primary-color: #00ff00;     /* Bright green from Original theme */
                --secondary-color: #228B22;   /* Forest green from Original theme */
                --accent-color: #8B4513;      /* Brown accent from Original theme */
            }
            
            .mode-original .game-canvas {
                background: radial-gradient(circle at center, #1a1a2e, #0d1a0d);
            }
            
            /* Themed pause and start buttons using Original theme colors */
            .mode-original #pauseBtn,
            .mode-original #startBtn {
                background: linear-gradient(135deg, #00ff00 0%, #228B22 100%) !important;
                border: 2px solid #88ff88 !important;
                color: #ffffff !important;
                box-shadow: 
                    0 4px 15px rgba(0, 255, 0, 0.4),
                    inset 0 0 20px rgba(136, 255, 136, 0.2) !important;
                transition: all 0.3s ease !important;
                font-family: 'Courier New', monospace !important;
                font-weight: bold !important;
                border-radius: 8px !important;
                text-shadow: 0 0 10px #00ff00 !important;
            }
            
            .mode-original #pauseBtn:hover,
            .mode-original #startBtn:hover {
                transform: translateY(-2px) scale(1.05) !important;
                background: linear-gradient(135deg, #88ff88 0%, #00ff00 100%) !important;
                box-shadow: 
                    0 6px 25px rgba(0, 255, 0, 0.6),
                    inset 0 0 30px rgba(136, 255, 136, 0.4) !important;
                text-shadow: 0 0 15px #88ff88 !important;
            }
        `
    }
};

// Register the Original Mode with the template system
if (window.ModeTemplateSystem) {
    try {
        window.ModeTemplateSystem.registerMode(originalModeDefinition);
        console.log('✅ Original Mode registered with template system');
    } catch (error) {
        console.error('❌ Failed to register Original Mode:', error);
    }
} else {
    console.warn('⚠️ Mode Template System not loaded yet, deferring Original Mode registration');
    
    // Wait for template system to load
    const waitForTemplateSystem = setInterval(() => {
        if (window.ModeTemplateSystem) {
            clearInterval(waitForTemplateSystem);
            try {
                window.ModeTemplateSystem.registerMode(originalModeDefinition);
                console.log('✅ Original Mode registered with template system (deferred)');
            } catch (error) {
                console.error('❌ Failed to register Original Mode:', error);
            }
        }
    }, 100);
    
    // Stop waiting after 5 seconds
    setTimeout(() => clearInterval(waitForTemplateSystem), 5000);
}

// Export for debugging
window.originalModeDefinition = originalModeDefinition;