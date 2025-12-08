const ModeExamples = {
    originalMode: {
        id: 'original',
        name: 'Original',
        description: 'Classic Ball Defender Experience',
        
        colorScheme: {
            background: { primary: '#0a0a23', secondary: '#1a1a3a', accent: '#2a2a4a' },
            blockByHP: {
                1: { base: '#4CAF50', glow: '#81C784', shadow: '#2E7D32' },
                2: { base: '#388E3C', glow: '#66BB6A', shadow: '#1B5E20' },
                3: { base: '#2E7D32', glow: '#4CAF50', shadow: '#1B5E20' },
                default: { base: '#9E9E9E', glow: '#BDBDBD', shadow: '#616161' }
            },
            special: {
                spawner: { base: '#FFD700', glow: '#FFF59D', shadow: '#F9A825' },
                exploder: { base: '#FF6F00', glow: '#FFB300', shadow: '#E65100' }
            }
        },
        
        stylesheet: {
            customCSS: `
                .mode-original {
                    --primary-color: #64ffda;
                    --secondary-color: #667eea;
                    --accent-color: #f093fb;
                }
            `
        },
        
        mechanics: {
            startingBalls: 1,
            ballSpeed: 1.0,
            specialFeatures: []
        },
        
        musicProgression: [1, 6, 4, 5],
        
        leaderboard: {
            key: 'ballDefender_original_Leaderboard',
            gistFile: 'ball-defender-original-leaderboard.json'
        }
    },
    
    ballGoBoomMode: {
        id: 'ballGoBoom',
        name: 'Ball Go Boom!',
        description: 'Explosive Action Mode with Ball Detonator',
        
        colorScheme: {
            background: { primary: '#230a0a', secondary: '#3a1a1a', accent: '#4a2a2a' },
            blockByHP: {
                1: { base: '#FF4500', glow: '#FF8C00', shadow: '#B22222' },
                2: { base: '#FF6600', glow: '#FFA500', shadow: '#CC3300' },
                3: { base: '#FFD700', glow: '#FFFF00', shadow: '#FF8800' },
                default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' }
            },
            special: {
                spawner: { base: '#FFD700', glow: '#FFFFFF', shadow: '#FFA500' },
                exploder: { base: '#FF0000', glow: '#FFFF00', shadow: '#990000' }
            }
        },
        
        stylesheet: {
            customCSS: `
                .mode-ballGoBoom {
                    --primary-color: #ffa500;
                    --secondary-color: #ff6b6b;
                    --accent-color: #ffff00;
                }
                
                .mode-ballGoBoom .game-canvas {
                    background: radial-gradient(circle, #230a0a, #3a1a1a);
                }
            `
        },
        
        mechanics: {
            startingBalls: 1,
            ballSpeed: 1.0,
            specialFeatures: [
                {
                    id: 'ballDetonator',
                    type: 'specialMechanic',
                    name: 'Ball Detonator',
                    description: 'Strategic ball explosion system',
                    onActivate: function() {
                        if (window.ballDetonator) {
                            window.ballDetonator.initializeDetonator();
                        }
                    }
                }
            ]
        },
        
        musicProgression: [1, 3, 6, 4],
        
        leaderboard: {
            key: 'ballDefender_ballGoBoom_Leaderboard', 
            gistFile: 'ball-defender-ballGoBoom-leaderboard.json'
        }
    },
    
    volcanicMayhemExample: {
        id: 'volcanicMayhem',
        name: 'Volcanic Mayhem',
        description: 'Lava blocks crack and spawn mini-blocks, fire trail powerups, heat meter difficulty',
        
        colorScheme: {
            background: { primary: '#2a0f0f', secondary: '#4a1f1f', accent: '#6a2f2f' },
            blockByHP: {
                1: { base: '#ff4500', glow: '#ff8c00', shadow: '#b22222' },
                2: { base: '#ff6600', glow: '#ffa500', shadow: '#cc3300' },
                3: { base: '#ffd700', glow: '#ffff00', shadow: '#ff8800' },
                default: { base: '#8b0000', glow: '#ff4500', shadow: '#660000' }
            },
            special: {
                spawner: { base: '#ffd700', glow: '#ffffff', shadow: '#ffa500' },
                exploder: { base: '#ff0000', glow: '#ffff00', shadow: '#990000' }
            }
        },
        
        stylesheet: {
            customCSS: `
                .mode-volcanicMayhem {
                    --primary-color: #ffa500;
                    --heat-color: #ff4500;
                    --lava-color: #ff6600;
                }
                
                .mode-volcanicMayhem .heat-meter {
                    background: linear-gradient(90deg, #ffa500, #ff4500);
                    box-shadow: 0 0 20px var(--heat-color);
                }
                
                .mode-volcanicMayhem .cracking-block {
                    animation: crack-pulse 1s infinite;
                }
                
                @keyframes crack-pulse {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(1.3) drop-shadow(0 0 10px #ff4500); }
                }
            `
        },
        
        mechanics: {
            startingBalls: 1,
            ballSpeed: 1.0,
            specialFeatures: [
                {
                    id: 'fireTrail',
                    type: 'powerup',
                    name: 'Fire Trail',
                    description: 'Ball leaves burning trail that damages blocks',
                    effect: { trailDamage: 1, trailDuration: 2000, trailColor: '#ff4500' },
                    rarity: 0.1
                },
                {
                    id: 'crackingBlocks',
                    type: 'blockBehavior',
                    name: 'Cracking Blocks',
                    description: 'Blocks crack and spawn smaller blocks when destroyed',
                    effect: { spawnCount: 2, spawnHP: 1, spawnSize: 0.7 }
                },
                {
                    id: 'heatMeter',
                    type: 'difficultyModifier',
                    name: 'Heat Meter',
                    description: 'Heat builds up, making blocks harder and faster',
                    effect: { 
                        maxHeat: 100,
                        heatPerLevel: 10,
                        blockSpeedMultiplier: 1.5,
                        blockHPMultiplier: 1.3
                    }
                }
            ]
        },
        
        musicProgression: [1, 4, 6, 3],
        
        leaderboard: {
            key: 'ballDefender_volcanicMayhem_Leaderboard',
            gistFile: 'ball-defender-volcanicMayhem-leaderboard.json'
        }
    },
    
    cyberStormExample: {
        id: 'cyberStorm',
        name: 'Cyber Storm',
        description: 'Electric blue cyber theme with time freeze powerups and magnetic blocks',
        
        colorScheme: {
            background: { primary: '#0a0a2a', secondary: '#1a1a4a', accent: '#2a2a6a' },
            blockByHP: {
                1: { base: '#00ffff', glow: '#64ffda', shadow: '#00bcd4' },
                2: { base: '#40c4ff', glow: '#81d4fa', shadow: '#0288d1' },
                3: { base: '#18ffff', glow: '#84ffff', shadow: '#00acc1' },
                default: { base: '#263238', glow: '#546e7a', shadow: '#37474f' }
            },
            special: {
                spawner: { base: '#64ffda', glow: '#ffffff', shadow: '#4dd0e1' },
                exploder: { base: '#18ffff', glow: '#64ffda', shadow: '#00bcd4' }
            }
        },
        
        stylesheet: {
            customCSS: `
                .mode-cyberStorm {
                    --primary-color: #64ffda;
                    --secondary-color: #40c4ff;
                    --accent-color: #18ffff;
                    --cyber-glow: #00ffff;
                }
                
                .mode-cyberStorm .game-canvas {
                    background: linear-gradient(135deg, #0a0a2a, #1a1a4a);
                    box-shadow: inset 0 0 100px rgba(100, 255, 218, 0.1);
                }
                
                .mode-cyberStorm .magnetic-block {
                    animation: magnetic-pulse 2s infinite;
                }
                
                @keyframes magnetic-pulse {
                    0%, 100% { box-shadow: 0 0 10px var(--cyber-glow); }
                    50% { box-shadow: 0 0 30px var(--cyber-glow), 0 0 60px var(--accent-color); }
                }
            `
        },
        
        mechanics: {
            startingBalls: 1,
            ballSpeed: 1.2,
            specialFeatures: [
                {
                    id: 'timeFreeze',
                    type: 'powerup',
                    name: 'Time Freeze',
                    description: 'Slows down time for everything except balls',
                    effect: { duration: 3000, timeMultiplier: 0.3 },
                    rarity: 0.08
                },
                {
                    id: 'magneticBlocks',
                    type: 'blockBehavior',
                    name: 'Magnetic Blocks',
                    description: 'Blocks attract or repel balls',
                    effect: { magneticForce: 3, magneticRange: 100, polarity: 'attract' }
                }
            ]
        },
        
        musicProgression: [1, 4, 6, 3],
        
        leaderboard: {
            key: 'ballDefender_cyberStorm_Leaderboard',
            gistFile: 'ball-defender-cyberStorm-leaderboard.json'
        }
    },
    
    minimalistExample: {
        id: 'zen',
        name: 'Zen Mode',
        description: 'Minimal peaceful mode with slower gameplay and subtle effects',
        
        colorScheme: {
            background: { primary: '#f5f5f5', secondary: '#eeeeee', accent: '#e0e0e0' },
            blockByHP: {
                1: { base: '#9e9e9e', glow: '#bdbdbd', shadow: '#757575' },
                2: { base: '#757575', glow: '#9e9e9e', shadow: '#616161' },
                3: { base: '#616161', glow: '#757575', shadow: '#424242' },
                default: { base: '#424242', glow: '#616161', shadow: '#212121' }
            },
            special: {
                spawner: { base: '#795548', glow: '#a1887f', shadow: '#5d4037' },
                exploder: { base: '#607d8b', glow: '#90a4ae', shadow: '#455a64' }
            }
        },
        
        stylesheet: {
            customCSS: `
                .mode-zen {
                    --primary-color: #616161;
                    --secondary-color: #9e9e9e;
                    --accent-color: #757575;
                }
                
                .mode-zen .game-canvas {
                    background: linear-gradient(135deg, #f5f5f5, #eeeeee);
                }
                
                .mode-zen * {
                    transition: all 0.5s ease;
                }
            `
        },
        
        mechanics: {
            startingBalls: 1,
            ballSpeed: 0.7,
            specialFeatures: []
        },
        
        musicProgression: [1, 5, 6, 4],
        
        leaderboard: {
            key: 'ballDefender_zen_Leaderboard',
            gistFile: 'ball-defender-zen-leaderboard.json'
        }
    }
};

const ModeUsageExamples = {
    createFromDescription: function(description) {
        console.log('📝 Creating mode from description:', description);
        
        const config = ModeTemplateGenerator.generateModeConfig(description);
        const registeredMode = ModeFramework.registerMode(config);
        
        console.log('✅ Mode created:', registeredMode.name);
        return registeredMode;
    },
    
    exampleUsage: function() {
        console.log('🎯 Example: Creating Volcanic Mayhem mode...');
        
        const description = "Volcanic mode with lava blocks that crack and spawn mini-blocks, fire trail powerups that damage blocks, and a heat meter that makes the game harder as it fills up";
        
        const volcanicMode = this.createFromDescription(description);
        
        console.log('Mode created with features:', volcanicMode.mechanics.specialFeatures.map(f => f.name));
        
        ModeFramework.activateMode(volcanicMode.id);
        console.log('✅ Volcanic Mayhem mode activated!');
    },
    
    registerExistingModes: function() {
        console.log('📚 Registering example modes...');
        
        Object.values(ModeExamples).forEach(mode => {
            try {
                ModeFramework.registerMode(mode);
            } catch (error) {
                console.warn(`Failed to register ${mode.name}:`, error.message);
            }
        });
        
        console.log('✅ Example modes registered');
    }
};

window.ModeExamples = ModeExamples;
window.ModeUsageExamples = ModeUsageExamples;

console.log('📚 Mode Examples loaded - Reference implementations ready');
console.log('💡 Try: ModeUsageExamples.exampleUsage() to see the framework in action');