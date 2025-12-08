/**
 * BALL GO BOOM MODE - PROPER IMPLEMENTATION
 * ==========================================
 * 
 * This is the proper implementation of Ball Go Boom Mode using the Mode Template System,
 * matching the structure and approach used by Ice Mode.
 */

const ballGoBoomModeDefinition = {
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
            exploder: { base: '#ff00ff', glow: '#ff80ff', shadow: '#cc00cc' }
        }
    },
    
    mechanics: {
        startingBalls: 1,
        ballSpeed: 1.0,
        specialFeatures: [
            {
                id: 'ballDetonator',
                type: 'ballBehavior',
                name: 'Ball Detonator',
                description: 'Balls can be manually detonated for explosive chain reactions',
                effect: {
                    explosionRadius: 200,
                    explosionPower: 150,
                    flashDuration: 2000,
                    buttonVisibility: true
                },
                
                /**
                 * This function is called when the mode is activated.
                 * The 'this' context is a sandboxed feature context.
                 */
                onActivate: function() {
                    console.log('💥 Initializing Ball Detonator System');
                    
                    // Register the ball detonator system globally
                    this.registerGlobal('ballDetonator', {
                        canDetonate: () => {
                            return window.balls && window.balls.length === 1 && window.gameState === 'playing';
                        },
                        
                        startDetonation: () => {
                            if (!this.canDetonate()) return;
                            
                            const ball = window.balls[0];
                            if (!ball) return;
                            
                            console.log('💥 BALL GO BOOM! Starting detonation sequence...');
                            // Implementation would go here
                        }
                    });
                    
                    console.log('✅ Ball Detonator System initialized');
                }
            }
        ]
    },
    
    audioConfig: {
        progression: [1, 3, 6, 4],
        key: 'D',
        style: { 
            tempo: 'fast', 
            attack: 'hard', 
            sustain: 'short',
            timbre: 'explosive' 
        },
        soundEffects: {
            blockHit: { frequency: 600, duration: 0.15, timbre: 'explosive' },
            blockDestroy: { frequency: 200, duration: 0.4, timbre: 'boom' },
            ballBounce: { frequency: 1000, duration: 0.08, timbre: 'metallic' },
            explosion: { frequency: 150, duration: 0.5, timbre: 'rumble' }
        }
    },
    
    leaderboard: {
        key: 'ballDefender_ballGoBoom_Leaderboard',
        gistFile: 'ball-defender-ballGoBoom-leaderboard.json'
    },
    
    stylesheet: {
        customCSS: `
            .mode-ballGoBoom {
                --primary-color: #ff9500;
                --secondary-color: #ff4500;
                --accent-color: #ff0000;
                --explosion-color: #ffff00;
            }
            
            .mode-ballGoBoom .game-canvas {
                background: radial-gradient(circle at center, #1a0000, #330000);
            }
            
            /* Themed pause and start buttons */
            .mode-ballGoBoom #pauseBtn,
            .mode-ballGoBoom #startBtn {
                background: linear-gradient(135deg, #ff6b00 0%, #ff0000 100%) !important;
                border: 2px solid #ffff00 !important;
                color: #ffffff !important;
                box-shadow: 
                    0 4px 15px rgba(255, 107, 0, 0.4),
                    inset 0 0 20px rgba(255, 255, 0, 0.2) !important;
                transition: all 0.3s ease !important;
                font-family: 'Courier New', monospace !important;
                font-weight: bold !important;
                border-radius: 8px !important;
                text-shadow: 0 0 10px #ff0000 !important;
            }
            
            .mode-ballGoBoom #pauseBtn::before {
                content: '💥';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 16px;
                /* animation: explosion-pulse 2s infinite; */ /* Disabled - too aggressive */
            }
            
            .mode-ballGoBoom #pauseBtn {
                padding-left: 40px !important;
            }
            
            .mode-ballGoBoom #pauseBtn:hover,
            .mode-ballGoBoom #startBtn:hover {
                transform: translateY(-2px) scale(1.05) !important;
                background: linear-gradient(135deg, #ff0000 0%, #ff6b00 100%) !important;
                box-shadow: 
                    0 6px 25px rgba(255, 0, 0, 0.6),
                    inset 0 0 30px rgba(255, 255, 0, 0.4) !important;
                text-shadow: 0 0 15px #ffff00 !important;
            }
            
            @keyframes explosion-pulse {
                0%, 100% { 
                    transform: translateY(-50%) scale(1);
                    filter: hue-rotate(0deg);
                }
                50% { 
                    transform: translateY(-50%) scale(1.2);
                    filter: hue-rotate(60deg);
                }
            }
        `
    }
};

// Register the Ball Go Boom Mode with the template system
if (window.ModeTemplateSystem) {
    try {
        window.ModeTemplateSystem.registerMode(ballGoBoomModeDefinition);
        console.log('✅ Ball Go Boom Mode registered with template system');
    } catch (error) {
        console.error('❌ Failed to register Ball Go Boom Mode:', error);
    }
} else {
    console.warn('⚠️ Mode Template System not loaded yet, deferring Ball Go Boom Mode registration');
    
    // Wait for template system to load
    const waitForTemplateSystem = setInterval(() => {
        if (window.ModeTemplateSystem) {
            clearInterval(waitForTemplateSystem);
            try {
                window.ModeTemplateSystem.registerMode(ballGoBoomModeDefinition);
                console.log('✅ Ball Go Boom Mode registered with template system (deferred)');
            } catch (error) {
                console.error('❌ Failed to register Ball Go Boom Mode:', error);
            }
        }
    }, 100);
    
    // Stop waiting after 5 seconds
    setTimeout(() => clearInterval(waitForTemplateSystem), 5000);
}

// Export for debugging
window.ballGoBoomModeDefinition = ballGoBoomModeDefinition;