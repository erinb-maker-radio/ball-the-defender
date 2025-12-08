/**
 * MODE TEMPLATE SYSTEM INTEGRATION
 * =================================
 * 
 * This file integrates the new Mode Template System with the existing game infrastructure.
 * It ensures backward compatibility while providing a clean migration path.
 */

(function() {
    console.log('🔧 Initializing Mode Template System Integration...');
    
    /**
     * Waits for the Mode Template System to be available
     */
    function waitForTemplateSystem(callback) {
        if (window.ModeTemplateSystem) {
            callback();
        } else {
            const checkInterval = setInterval(() => {
                if (window.ModeTemplateSystem) {
                    clearInterval(checkInterval);
                    callback();
                }
            }, 50);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('❌ Mode Template System failed to load');
            }, 5000);
        }
    }
    
    /**
     * Integrates with the existing startGame function
     */
    function integrateWithStartGame() {
        const originalStartGame = window.startGame;
        
        if (!originalStartGame) {
            console.warn('⚠️ startGame function not found, deferring integration');
            return;
        }
        
        window.startGame = function(mode) {
            console.log(`🎮 Starting game with mode: ${mode}`);
            
            // Use template system if available
            if (window.ModeTemplateSystem && window.ModeTemplateSystem.getMode(mode)) {
                try {
                    // Activate mode through template system
                    const modeInstance = window.ModeTemplateSystem.activateMode(mode);
                    console.log(`✅ Mode activated through template system: ${mode}`);
                    
                    // Ensure compatibility with existing systems
                    window.currentGameMode = modeInstance.definition;
                    window.selectedGameMode = mode;
                    
                    // Update body class
                    document.body.className = document.body.className.replace(/mode-\w+/g, '');
                    document.body.classList.add(`mode-${mode}`);
                    
                    // Save to localStorage
                    localStorage.setItem('ballDefender_selectedMode', mode);
                    
                    // Initialize GameCore if available
                    if (window.gameCore && modeInstance.definition) {
                        try {
                            window.gameCore.setMode(modeInstance.definition);
                            console.log(`🎨 GameCore renderer initialized for ${mode} mode`);
                        } catch (error) {
                            console.error(`❌ Failed to set GameCore mode:`, error);
                        }
                    }
                    
                    // Call original startGame for any additional setup
                    if (originalStartGame && originalStartGame !== window.startGame) {
                        return originalStartGame.call(this, mode);
                    }
                } catch (error) {
                    console.error(`❌ Failed to activate mode through template system:`, error);
                    // Fall back to original implementation
                    return originalStartGame.call(this, mode);
                }
            } else {
                // Use original implementation
                return originalStartGame.call(this, mode);
            }
        };
        
        console.log('✅ Integrated with startGame function');
    }
    
    /**
     * Migrates existing mode definitions to the template system
     */
    function migrateExistingModes() {
        // Original Mode
        const originalMode = {
            id: 'original',
            name: 'Original',
            description: 'The classic Ball Defender experience',
            
            colorScheme: {
                background: { 
                    primary: '#1a1a2e', 
                    secondary: '#0f0f1e', 
                    accent: '#16213e' 
                },
                blockByHP: {
                    1: { base: '#64ffda', glow: '#80ffea', shadow: '#40d0aa' },
                    2: { base: '#ffd93d', glow: '#ffe55d', shadow: '#d0b030' },
                    3: { base: '#ff6bcb', glow: '#ff8bdb', shadow: '#d050a0' },
                    4: { base: '#ff4757', glow: '#ff6777', shadow: '#d03040' },
                    5: { base: '#a55eea', glow: '#b57efa', shadow: '#8040c0' },
                    default: { base: '#4a4a4a', glow: '#6a6a6a', shadow: '#2a2a2a' }
                },
                special: {
                    spawner: { base: '#00ff88', glow: '#40ffaa', shadow: '#00cc66' },
                    exploder: { base: '#ff3838', glow: '#ff5858', shadow: '#cc2020' }
                }
            },
            
            mechanics: {
                startingBalls: 1,
                ballSpeed: 1.0,
                specialFeatures: []
            },
            
            audioConfig: {
                progression: [1, 4, 5, 1],
                key: 'C',
                style: { tempo: 'medium', attack: 'normal', sustain: 'medium' }
            },
            
            leaderboard: {
                key: 'ballDefender_original_Leaderboard',
                gistFile: 'ball-defender-original-leaderboard.json'
            },
            
            stylesheet: {
                customCSS: `
                    .mode-original #pauseBtn,
                    .mode-original #startBtn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                        border: 2px solid #fff !important;
                        color: #fff !important;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
                        transition: all 0.3s ease !important;
                    }
                    
                    .mode-original #pauseBtn:hover,
                    .mode-original #startBtn:hover {
                        transform: translateY(-2px) !important;
                        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6) !important;
                    }
                `
            }
        };
        
        // Ball Go Boom Mode
        const ballGoBoomMode = {
            id: 'ballGoBoom',
            name: 'Ball Go Boom',
            description: 'Explosive mode with detonator balls and chain reactions',
            
            colorScheme: {
                background: { 
                    primary: '#1a0000', 
                    secondary: '#330000', 
                    accent: '#4d0000' 
                },
                blockByHP: {
                    1: { base: '#ff9500', glow: '#ffb040', shadow: '#cc7700' },
                    2: { base: '#ff6b00', glow: '#ff8840', shadow: '#cc5500' },
                    3: { base: '#ff4500', glow: '#ff6640', shadow: '#cc3600' },
                    4: { base: '#ff0000', glow: '#ff4040', shadow: '#cc0000' },
                    5: { base: '#cc0000', glow: '#ff0000', shadow: '#990000' },
                    default: { base: '#661100', glow: '#882200', shadow: '#440a00' }
                },
                special: {
                    spawner: { base: '#ffff00', glow: '#ffff80', shadow: '#cccc00' },
                    exploder: { base: '#ff00ff', glow: '#ff80ff', shadow: '#cc00cc' },
                    detonator: { base: '#ffffff', glow: '#ff0000', shadow: '#aa0000' }
                }
            },
            
            mechanics: {
                startingBalls: 1,
                ballSpeed: 1.2,
                specialFeatures: [
                    {
                        id: 'ballDetonator',
                        type: 'ballBehavior',
                        name: 'Ball Detonator',
                        description: 'Balls explode on command',
                        onActivate: function() {
                            // Ball detonator is handled by ball-detonator.js
                            console.log('🎯 Ball Detonator feature enabled');
                        }
                    }
                ]
            },
            
            audioConfig: {
                progression: [1, 5, 6, 4],
                key: 'D',
                style: { tempo: 'fast', attack: 'hard', sustain: 'short', timbre: 'explosive' }
            },
            
            leaderboard: {
                key: 'ballDefender_ballGoBoom_Leaderboard',
                gistFile: 'ball-defender-ballGoBoom-leaderboard.json'
            },
            
            stylesheet: {
                customCSS: `
                    .mode-ballGoBoom #pauseBtn,
                    .mode-ballGoBoom #startBtn {
                        background: linear-gradient(135deg, #ff6b00, #ff0000, #ff6b00) !important;
                        background-size: 200% 200% !important;
                        animation: boom-gradient 3s ease infinite !important;
                        border: 3px solid #ff0000 !important;
                        color: #ffffff !important;
                        box-shadow: 
                            0 0 20px rgba(255, 0, 0, 0.5),
                            inset 0 0 20px rgba(255, 107, 0, 0.3) !important;
                        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8) !important;
                        font-weight: bold !important;
                        transition: all 0.3s ease !important;
                    }
                    
                    .mode-ballGoBoom #pauseBtn::before {
                        content: '💥';
                        margin-right: 8px;
                        animation: boom-shake 0.5s ease-in-out infinite;
                    }
                    
                    .mode-ballGoBoom #pauseBtn:hover,
                    .mode-ballGoBoom #startBtn:hover {
                        transform: scale(1.1) !important;
                        box-shadow: 
                            0 0 30px rgba(255, 0, 0, 0.8),
                            inset 0 0 30px rgba(255, 107, 0, 0.5) !important;
                    }
                    
                    @keyframes boom-gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    
                    @keyframes boom-shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-2px); }
                        75% { transform: translateX(2px); }
                    }
                `
            }
        };
        
        // Register existing modes with the template system
        waitForTemplateSystem(() => {
            try {
                // Register original mode
                window.ModeTemplateSystem.registerMode(originalMode);
                console.log('✅ Original mode migrated to template system');
                
                // Register Ball Go Boom mode
                window.ModeTemplateSystem.registerMode(ballGoBoomMode);
                console.log('✅ Ball Go Boom mode migrated to template system');
                
                // Ice Mode should be registered by ice-mode-proper.js
                
            } catch (error) {
                console.error('❌ Failed to migrate modes:', error);
            }
        });
    }
    
    /**
     * Sets up event listeners for mode changes
     */
    function setupEventListeners() {
        // Listen for mode change events
        window.addEventListener('modechange', (event) => {
            console.log(`📢 Mode changed to: ${event.detail.name} (${event.detail.mode})`);
            
            // Update any UI elements that depend on the current mode
            const modeDisplay = document.getElementById('currentModeDisplay');
            if (modeDisplay) {
                modeDisplay.textContent = event.detail.name;
            }
        });
    }
    
    /**
     * Initialize the integration
     */
    function initialize() {
        console.log('🚀 Starting Mode Template System Integration...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                integrateWithStartGame();
                migrateExistingModes();
                setupEventListeners();
            });
        } else {
            integrateWithStartGame();
            migrateExistingModes();
            setupEventListeners();
        }
        
        console.log('✅ Mode Template System Integration initialized');
    }
    
    // Start initialization
    initialize();
    
})();

console.log('✅ Mode Template Integration loaded');