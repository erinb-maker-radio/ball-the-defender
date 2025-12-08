/**
 * ICE MODE - PROPER IMPLEMENTATION
 * =================================
 * 
 * This is the correct implementation of Ice Mode using the Mode Template System.
 * It properly separates the mode definition from runtime state and ensures
 * the freeze system is correctly initialized and maintained.
 */

const iceModeDefinition = {
    id: 'iceFrost',
    name: 'Ice Mode',
    description: 'Freeze blocks (8% spawn rate) that freeze surrounding blocks in a 2-space radius, showing countdown timers',
    
    colorScheme: {
        // Minimal scheme - theme colors take priority
        background: { 
            primary: '#0a1a2a', 
            secondary: '#1a2a4a', 
            accent: '#2a4a6a' 
        },
        blockByHP: null,    // Disabled - using PROTECTED Ice Theme instead
        special: null       // Disabled - using PROTECTED Ice Theme instead
    },
    
    mechanics: {
        startingBalls: 1,
        ballSpeed: 1.0,
        specialFeatures: [
            {
                id: 'freezeBlocks',
                type: 'blockBehavior',
                name: 'Freeze Blocks',
                description: 'Special blocks that freeze surrounding blocks',
                effect: {
                    freezeRadius: 1,
                    freezeDuration: 5000,
                    countdownInterval: 1000,
                    spreadAnimation: true,
                    stackable: true
                },
                
                /**
                 * This function is called when the mode is activated.
                 * The 'this' context is a sandboxed feature context.
                 */
                onActivate: function() {
                    console.log('🧊 Initializing Freeze Block System');
                    console.log('🔍 onActivate called! this:', this);
                    
                    // Create the freeze system API
                    const freezeSystem = {
                        // Track frozen blocks
                        frozenBlocks: new Map(),
                        freezeTimers: new Map(),
                        isFreezing: false,
                        
                        /**
                         * Freezes blocks within a radius of the center point
                         */
                        freezeBlocksInRadius: function(centerX, centerY, radius) {
                            if (!window.blocks) {
                                console.warn('No blocks array found');
                                return;
                            }
                            
                            // Prevent re-entrance
                            if (this.isFreezing) {
                                console.warn('Already processing freeze effect');
                                return;
                            }
                            this.isFreezing = true;
                            
                            console.log(`🧊 Freezing blocks at (${centerX}, ${centerY}) with radius ${radius}`);
                            
                            const freezePixelRadius = radius * 100;
                            const affectedBlocks = [];
                            
                            const centerBlockX = centerX + 30;
                            const centerBlockY = centerY + 30;
                            
                            // Find blocks within radius
                            window.blocks.forEach((block, index) => {
                                if (block.destroyed || block.frozen) return;
                                
                                const blockCenterX = block.x + block.width / 2;
                                const blockCenterY = block.y + block.height / 2;
                                
                                const dx = blockCenterX - centerBlockX;
                                const dy = blockCenterY - centerBlockY;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                
                                if (distance > 10 && distance <= freezePixelRadius) {
                                    affectedBlocks.push({ block, index });
                                }
                            });
                            
                            console.log(`🧊 Found ${affectedBlocks.length} blocks to freeze`);
                            
                            // Play freeze sound
                            this.playFreezeSound();
                            
                            // Freeze each affected block with cascading animation
                            // Sort blocks by distance from center for sequential animation
                            affectedBlocks.sort(({ block: a }, { block: b }) => {
                                const distA = Math.sqrt((a.x - centerBlockX) ** 2 + (a.y - centerBlockY) ** 2);
                                const distB = Math.sqrt((b.x - centerBlockX) ** 2 + (b.y - centerBlockY) ** 2);
                                return distA - distB;
                            });
                            
                            // Freeze blocks with sequential timing for cascade effect
                            affectedBlocks.forEach(({ block, index }, sequenceIndex) => {
                                const delay = sequenceIndex * 200; // 200ms between each block
                                setTimeout(() => {
                                    this.freezeBlock(block, index, {
                                        sourceX: centerX,
                                        sourceY: centerY,
                                        sequenceIndex,
                                        isSource: sequenceIndex === 0
                                    });
                                }, delay);
                            });
                            
                            this.isFreezing = false;
                        },
                        
                        /**
                         * Freezes a specific block with cascade information
                         */
                        freezeBlock: function(block, index, cascadeInfo = {}) {
                            if (!block || block.destroyed) return;
                            
                            // Clear existing freeze timer if re-freezing
                            if (this.frozenBlocks.has(index)) {
                                clearInterval(this.freezeTimers.get(index));
                            }
                            
                            console.log(`🧊 Freezing block at index ${index} (sequence: ${cascadeInfo.sequenceIndex || 0})`);
                            
                            // Mark block as frozen with cascade info
                            block.frozen = true;
                            block.freezeCountdown = 5;
                            block.cascadeInfo = cascadeInfo; // Store cascade information
                            this.frozenBlocks.set(index, block);
                            
                            // Fractal animation removed for cleaner freeze effect
                            
                            // Visual effects are now handled by canvas rendering
                            console.log(`🧊 Block frozen - will render ice colors on canvas`);
                            
                            // Start countdown
                            this.startCountdown(block, index);
                        },
                        
                        /**
                         * Adds ice visual effects to frozen block (now rendered on canvas)
                         */
                        addIceOverlay: function(block) {
                            console.log('🧊 Block frozen - visual effects will be rendered on canvas');
                            // No longer need HTML overlays - ice effects are rendered directly on canvas
                            // The block.frozen flag and block.freezeCountdown are used by the canvas renderer
                        },
                        
                        /**
                         * Starts countdown timer for frozen block
                         */
                        startCountdown: function(block, index) {
                            const timer = setInterval(() => {
                                // Check if block still exists and isn't destroyed
                                if (!block || block.destroyed) {
                                    clearInterval(timer);
                                    this.freezeTimers.delete(index);
                                    return;
                                }
                                
                                block.freezeCountdown--;
                                
                                // Countdown is now displayed on canvas, no HTML element to update
                                console.log(`🧊 Block ${index} countdown: ${block.freezeCountdown}`);
                                
                                // Unfreeze when countdown reaches zero
                                if (block.freezeCountdown <= 0) {
                                    this.unfreezeBlock(block, index);
                                }
                            }, 1000);
                            
                            this.freezeTimers.set(index, timer);
                        },
                        
                        /**
                         * Unfreezes a block
                         */
                        unfreezeBlock: function(block, index) {
                            console.log(`🔥 Unfreezing block at index ${index}`);
                            
                            block.frozen = false;
                            delete block.freezeCountdown;
                            
                            // Clear timer
                            if (this.freezeTimers.has(index)) {
                                clearInterval(this.freezeTimers.get(index));
                                this.freezeTimers.delete(index);
                            }
                            
                            this.frozenBlocks.delete(index);
                            this.playUnfreezeSound();
                        },
                        
                        /**
                         * Plays freeze sound effect
                         */
                        playFreezeSound: function() {
                            if (window.audioEngine?.playCustomSound) {
                                window.audioEngine.playCustomSound({
                                    frequency: 800,
                                    type: 'square',
                                    duration: 0.3,
                                    volume: 0.3,
                                    effects: ['glitch', 'crackle']
                                });
                            }
                        },
                        
                        /**
                         * Plays unfreeze sound effect
                         */
                        playUnfreezeSound: function() {
                            if (window.audioEngine?.playCustomSound) {
                                window.audioEngine.playCustomSound({
                                    frequency: 400,
                                    type: 'sine',
                                    duration: 0.2,
                                    volume: 0.2,
                                    effects: ['shimmer']
                                });
                            }
                        },
                        
                        /**
                         * Cleanup function for when mode is deactivated
                         */
                        cleanup: function() {
                            console.log('🧹 Cleaning up freeze system');
                            
                            // Unfreeze all blocks
                            this.frozenBlocks.forEach((block, index) => {
                                this.unfreezeBlock(block, index);
                            });
                            
                            // Clear all timers
                            this.freezeTimers.forEach(timer => clearInterval(timer));
                            this.freezeTimers.clear();
                            this.frozenBlocks.clear();
                            
                            // Remove any remaining ice overlays from DOM
                            this.removeAllIceOverlays();
                        },
                        
                        /**
                         * Remove all ice overlays from the DOM (DISABLED - using canvas rendering)
                         */
                        removeAllIceOverlays: function() {
                            // Overlays are now rendered on canvas, so clean up any leftover HTML overlays
                            const overlays = document.querySelectorAll('.ice-overlay');
                            if (overlays.length > 0) {
                                console.log(`🧹 Cleaning up ${overlays.length} leftover HTML overlays`);
                                overlays.forEach(overlay => overlay.remove());
                            }
                        },
                        
                        /**
                         * Game restart cleanup - called when game restarts without mode change
                         */
                        gameRestartCleanup: function() {
                            console.log('🔄 Ice Mode: Game restart cleanup');
                            
                            // Clear all frozen state but keep the system active
                            this.frozenBlocks.forEach((block, index) => {
                                if (block.frozen) {
                                    delete block.frozen;
                                    delete block.freezeCountdown;
                                }
                            });
                            
                            // Clear all timers
                            this.freezeTimers.forEach(timer => clearInterval(timer));
                            this.freezeTimers.clear();
                            this.frozenBlocks.clear();
                            
                            // Clean up any leftover HTML overlays
                            this.removeAllIceOverlays();
                        }
                    };
                    
                    // Register the freeze system globally using the feature context
                    this.registerGlobal('iceMode', freezeSystem);
                    console.log('🧊 Freeze system registered through Mode Template System');
                    
                    // Add cleanup function for mode deactivation
                    this.addCleanup(() => {
                        if (window.iceMode && window.iceMode.cleanup) {
                            window.iceMode.cleanup();
                        }
                        // Also clean up the direct reference
                        delete window.iceMode;
                    });
                    
                    // Hook into game restart - reduced frequency for performance
                    const gameRestartWatcher = setInterval(() => {
                        if (window.blocks && window.blocks.length === 0 && freezeSystem.frozenBlocks.size > 0) {
                            console.log('🔄 Detected game restart (empty blocks), cleaning up ice overlays');
                            freezeSystem.gameRestartCleanup();
                        }
                    }, 5000); // Reduced from 1000ms to 5000ms
                    
                    // DISABLED: Don't wrap startGame as it interferes with game initialization
                    // const originalStartGame = window.startGame;
                    // if (originalStartGame) {
                    //     window.startGame = function() {
                    //         console.log('🔄 Ice Mode: Detected startGame() call, cleaning up ice overlays');
                    //         freezeSystem.gameRestartCleanup();
                    //         return originalStartGame.apply(this, arguments);
                    //     };
                    // }
                    
                    // Clean up the watcher and startGame hook when mode is deactivated
                    this.addCleanup(() => {
                        clearInterval(gameRestartWatcher);
                        // DISABLED: No need to restore since we're not wrapping
                        // if (originalStartGame) {
                        //     window.startGame = originalStartGame;
                        // }
                    });
                    
                    // Activate fractal freeze animation plugin
                    if (window.PluginManager) {
                        console.log('🎨 Activating fractal animation plugins for Ice Mode');
                        window.PluginManager.activatePluginsForMode('iceFrost');
                    } else {
                        console.warn('⚠️ PluginManager not found - animations may not work');
                    }
                    
                    console.log('✅ Freeze Block System initialized and registered');
                    console.log('✅ window.iceMode.freezeBlocksInRadius available:', !!window.iceMode?.freezeBlocksInRadius);
                }
            }
        ]
    },
    
    audioConfig: {
        progression: [6, 1, 4, 5],
        key: 'A',
        style: { 
            tempo: 'slow', 
            attack: 'soft', 
            sustain: 'long', 
            timbre: 'crystalline' 
        },
        soundEffects: {
            blockHit: { frequency: 1000, duration: 0.1, timbre: 'crystalline' },
            blockDestroy: { frequency: 600, duration: 0.3, timbre: 'shattering' },
            ballBounce: { frequency: 1400, duration: 0.05, timbre: 'metallic' },
            freeze: { frequency: 800, duration: 0.3, timbre: 'glitchy-crackle' },
            unfreeze: { frequency: 400, duration: 0.2, timbre: 'shimmer' }
        }
    },
    
    leaderboard: {
        key: 'ballDefender_iceFrost_Leaderboard',
        gistFile: 'ball-defender-iceFrost-leaderboard.json'
    },
    
    stylesheet: {
        customCSS: `
            .mode-iceFrost {
                --primary-color: #4dd0e1;
                --secondary-color: #26c6da;
                --accent-color: #00e5ff;
                --ice-color: #b3e5fc;
                --freeze-glow: #18ffff;
            }
            
            .mode-iceFrost .game-canvas {
                background: radial-gradient(circle at center, #0a1a2a, #1a2a4a);
            }
            
            /* Themed pause and start buttons */
            .mode-iceFrost #pauseBtn,
            .mode-iceFrost #startBtn {
                background: linear-gradient(135deg, #000a1a 0%, #001833 25%, #002952 50%, #003d6b 75%, #005080 100%) !important;
                border: 3px solid #00a3ff !important;
                color: #ffffff !important;
                box-shadow: 
                    inset 0 0 20px rgba(0, 163, 255, 0.3),
                    0 0 30px rgba(0, 163, 255, 0.5),
                    0 0 50px rgba(0, 128, 204, 0.3) !important;
                text-shadow: 
                    0 0 10px #ffffff,
                    0 0 20px #00a3ff !important;
                font-family: 'Courier New', monospace !important;
                font-weight: bold !important;
                border-radius: 8px !important;
                transition: all 0.3s ease !important;
            }
            
            .mode-iceFrost #pauseBtn::before {
                content: '❄️';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 16px;
                /* animation: ice-rotate 4s linear infinite; */ /* DISABLED FOR DEBUGGING */
            }
            
            .mode-iceFrost #pauseBtn {
                padding-left: 40px !important;
            }
            
            .mode-iceFrost #pauseBtn:hover,
            .mode-iceFrost #startBtn:hover {
                background: linear-gradient(135deg, #001833 0%, #002952 25%, #003d6b 50%, #005080 75%, #00a3ff 100%) !important;
                box-shadow: 
                    inset 0 0 30px rgba(0, 163, 255, 0.5),
                    0 0 40px rgba(0, 163, 255, 0.7),
                    0 0 60px rgba(0, 128, 204, 0.5) !important;
                /* transform: scale(1.05) !important; */ /* DISABLED FOR DEBUGGING */
            }
            
            /* Freeze block styles */
            .freeze-block {
                background: linear-gradient(135deg, #000a1a 0%, #001833 25%, #002952 50%, #003d6b 75%, #005080 100%) !important;
                border: 3px solid #00a3ff !important;
                box-shadow: inset 0 0 40px rgba(0, 163, 255, 0.5), 0 0 30px #0080cc !important;
                /* animation: ice-pulse 2.5s ease-in-out infinite !important; */ /* DISABLED FOR DEBUGGING */
            }
            
            @keyframes ice-pulse {
                0%, 100% { 
                    filter: brightness(0.8) saturate(1); 
                    box-shadow: inset 0 0 40px rgba(0, 163, 255, 0.5), 0 0 30px #0080cc !important;
                }
                50% { 
                    filter: brightness(1.2) saturate(1.5); 
                    box-shadow: inset 0 0 60px rgba(0, 163, 255, 0.7), 0 0 50px #00a3ff !important;
                }
            }
            
            @keyframes ice-rotate {
                0% { transform: translateY(-50%) rotate(0deg); }
                100% { transform: translateY(-50%) rotate(360deg); }
            }
            
            /* Ice overlay CSS moved to style.css to avoid conflicts */
            
            /* Freeze countdown display */
            .freeze-countdown {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--freeze-glow);
                font-size: 24px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                text-shadow: 
                    0 0 10px var(--freeze-glow),
                    0 0 20px var(--accent-color),
                    2px 2px 4px rgba(0, 0, 0, 0.8);
                z-index: 10;
                /* animation: countdown-pulse 1s infinite; */ /* DISABLED FOR DEBUGGING */
            }
            
            @keyframes countdown-pulse {
                0%, 100% { 
                    transform: translate(-50%, -50%) scale(1);
                }
                50% { 
                    transform: translate(-50%, -50%) scale(1.2);
                }
            }
        `
    }
};

// TEMPORARY: Create a simple freeze function for testing - DISABLED
window.testFreezeMode = function() {
    console.log('🧊 TEST: Simple freeze mode DISABLED - using enhanced version instead');
    return;
    
    console.log('🧊 TEST: Creating window.iceMode manually');
    if (!window.iceMode) {
        // Store frozen blocks and their timers
        const frozenBlocks = new Map();
        const freezeTimers = new Map();
        
        window.iceMode = {
            freezeBlocksInRadius: function(x, y, radius) {
                console.log(`🧊 MANUAL FREEZE: Called at (${x}, ${y}) with radius ${radius}`);
                console.log('  Blocks:', window.blocks?.length || 0);
                
                if (window.blocks) {
                    let frozen = 0;
                    const centerX = x + 30; // Center of freeze block
                    const centerY = y + 30;
                    
                    window.blocks.forEach((block, index) => {
                        if (!block.destroyed && !block.frozen) {
                            const blockCenterX = block.x + block.width / 2;
                            const blockCenterY = block.y + block.height / 2;
                            const dx = blockCenterX - centerX;
                            const dy = blockCenterY - centerY;
                            const dist = Math.sqrt(dx*dx + dy*dy);
                            
                            if (dist > 10 && dist < 150) { // 150 pixel radius, exclude the freeze block itself
                                // Mark block as frozen
                                block.frozen = true;
                                block.freezeCountdown = 5;
                                block.originalY = block.y; // Store original position
                                frozenBlocks.set(index, block);
                                frozen++;
                                console.log(`  Froze block at (${block.x}, ${block.y})`);
                                
                                // Clear any existing timer
                                if (freezeTimers.has(index)) {
                                    clearInterval(freezeTimers.get(index));
                                }
                                
                                // Start countdown timer
                                const timer = setInterval(() => {
                                    if (!block || block.destroyed) {
                                        clearInterval(timer);
                                        freezeTimers.delete(index);
                                        frozenBlocks.delete(index);
                                        return;
                                    }
                                    
                                    block.freezeCountdown--;
                                    console.log(`  Block ${index} countdown: ${block.freezeCountdown}`);
                                    
                                    if (block.freezeCountdown <= 0) {
                                        // Unfreeze the block
                                        block.frozen = false;
                                        delete block.freezeCountdown;
                                        delete block.originalY;
                                        frozenBlocks.delete(index);
                                        clearInterval(timer);
                                        freezeTimers.delete(index);
                                        console.log(`  Block ${index} unfrozen!`);
                                    }
                                }, 1000);
                                
                                freezeTimers.set(index, timer);
                            }
                        }
                    });
                    console.log(`  Total frozen: ${frozen}`);
                    
                    // Add visual freeze effect
                    if (frozen > 0 && window.audioEngine?.playCustomSound) {
                        window.audioEngine.playCustomSound({
                            frequency: 800,
                            type: 'square',
                            duration: 0.3,
                            volume: 0.3
                        });
                    }
                }
            },
            
            // Cleanup function
            cleanup: function() {
                freezeTimers.forEach(timer => clearInterval(timer));
                freezeTimers.clear();
                frozenBlocks.clear();
            }
        };
        console.log('✅ window.iceMode created with full countdown timer support');
    }
};

// OVERLAY CLEANUP SYSTEM REMOVED - No longer needed with canvas rendering
// Ice effects are now rendered directly on canvas, no HTML overlays created

// DISABLED: Game hook cleanup causes initialization conflicts
// const originalStartGame = window.startGame;
// if (originalStartGame) {
//     window.startGame = function(...args) {
//         aggressiveOverlayCleanup();
//         return originalStartGame.apply(this, args);
//     };
// }

// Register the Ice Mode with the template system
if (window.ModeTemplateSystem) {
    try {
        window.ModeTemplateSystem.registerMode(iceModeDefinition);
        console.log('✅ Ice Mode registered with template system');
        // Auto-create freeze mode when Ice Mode is registered
        window.testFreezeMode();
    } catch (error) {
        console.error('❌ Failed to register Ice Mode:', error);
    }
} else {
    console.warn('⚠️ Mode Template System not loaded yet, deferring Ice Mode registration');
    
    // Wait for template system to load
    const waitForTemplateSystem = setInterval(() => {
        if (window.ModeTemplateSystem) {
            clearInterval(waitForTemplateSystem);
            try {
                window.ModeTemplateSystem.registerMode(iceModeDefinition);
                console.log('✅ Ice Mode registered with template system (deferred)');
            } catch (error) {
                console.error('❌ Failed to register Ice Mode:', error);
            }
        }
    }, 100);
    
    // Stop waiting after 5 seconds
    setTimeout(() => clearInterval(waitForTemplateSystem), 5000);
}

// Export for debugging
window.iceModeDefinition = iceModeDefinition;