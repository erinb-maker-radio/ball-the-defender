const ModeTemplateGenerator = {
    colorSchemes: {
        volcanic: {
            background: { primary: '#2a0f0f', secondary: '#4a1f1f', accent: '#6a2f2f' },
            blocks: { base: '#ff4500', glow: '#ff8c00', shadow: '#b22222' },
            ui: { primary: '#ffa500', secondary: '#ff6b6b', accent: '#ffff00' },
            particles: { primary: '#ff1744', secondary: '#ff8a00', trail: '#ffff00' }
        },
        cyber: {
            background: { primary: '#0a0a2a', secondary: '#1a1a4a', accent: '#2a2a6a' },
            blocks: { base: '#00ffff', glow: '#64ffda', shadow: '#00bcd4' },
            ui: { primary: '#64ffda', secondary: '#40c4ff', accent: '#18ffff' },
            particles: { primary: '#64ffda', secondary: '#40c4ff', trail: '#18ffff' }
        },
        ocean: {
            background: { primary: '#0a2a2a', secondary: '#1a4a4a', accent: '#2a6a6a' },
            blocks: { base: '#00bcd4', glow: '#4dd0e1', shadow: '#0097a7' },
            ui: { primary: '#4dd0e1', secondary: '#26c6da', accent: '#00e5ff' },
            particles: { primary: '#4dd0e1', secondary: '#26c6da', trail: '#00e5ff' }
        },
        forest: {
            background: { primary: '#0f2a0f', secondary: '#1f4a1f', accent: '#2f6a2f' },
            blocks: { base: '#4caf50', glow: '#81c784', shadow: '#2e7d32' },
            ui: { primary: '#81c784', secondary: '#66bb6a', accent: '#a5d6a7' },
            particles: { primary: '#4caf50', secondary: '#81c784', trail: '#c8e6c9' }
        }
    },
    
    powerupTypes: {
        fireTrail: {
            id: 'fireTrail',
            type: 'powerup',
            name: 'Fire Trail',
            description: 'Ball leaves burning trail that damages blocks',
            effect: { trailDamage: 1, trailDuration: 2000, trailColor: '#ff4500' },
            rarity: 0.1
        },
        gravityFlip: {
            id: 'gravityFlip',
            type: 'powerup', 
            name: 'Gravity Flip',
            description: 'Reverses gravity for all balls',
            effect: { duration: 5000, gravityMultiplier: -1 },
            rarity: 0.05
        },
        timeFreeze: {
            id: 'timeFreeze',
            type: 'powerup',
            name: 'Time Freeze',
            description: 'Slows down time for everything except balls',
            effect: { duration: 3000, timeMultiplier: 0.3 },
            rarity: 0.08
        },
        multishot: {
            id: 'multishot',
            type: 'powerup',
            name: 'Multi Shot',
            description: 'Next shot fires multiple balls in spread pattern',
            effect: { ballCount: 3, spreadAngle: 30 },
            rarity: 0.15
        }
    },
    
    difficultyModifiers: {
        heatMeter: {
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
        },
        windEffects: {
            id: 'windEffects', 
            type: 'difficultyModifier',
            name: 'Wind Effects',
            description: 'Random wind pushes balls off course',
            effect: {
                windStrength: 2,
                windChangeInterval: 3000,
                visualEffects: true
            }
        },
        fog: {
            id: 'fog',
            type: 'difficultyModifier',
            name: 'Fog of War',
            description: 'Reduces visibility of distant blocks',
            effect: {
                fadeDistance: 200,
                maxOpacity: 0.3,
                animated: true
            }
        }
    },
    
    blockBehaviors: {
        cracking: {
            id: 'cracking',
            type: 'blockBehavior',
            name: 'Cracking Blocks',
            description: 'Blocks crack and spawn smaller blocks when destroyed',
            effect: {
                crackThreshold: 1,
                spawnCount: 2,
                spawnHP: 1,
                spawnSize: 0.7
            }
        },
        melting: {
            id: 'melting',
            type: 'blockBehavior', 
            name: 'Melting Blocks',
            description: 'Blocks melt and damage adjacent blocks over time',
            effect: {
                meltRate: 0.5,
                spreadRadius: 50,
                meltDamage: 0.1
            }
        },
        magnetic: {
            id: 'magnetic',
            type: 'blockBehavior',
            name: 'Magnetic Blocks', 
            description: 'Blocks attract or repel balls',
            effect: {
                magneticForce: 3,
                magneticRange: 100,
                polarity: 'attract'
            }
        }
    },
    
    parseDescription(description) {
        const parsed = {
            theme: this.extractTheme(description),
            colors: this.extractColors(description),
            powerups: this.extractPowerups(description),
            difficulties: this.extractDifficulties(description),
            blocks: this.extractBlocks(description),
            music: this.extractMusic(description),
            mechanics: this.extractMechanics(description)
        };
        
        return parsed;
    },
    
    extractTheme(description) {
        const themes = ['volcanic', 'cyber', 'ocean', 'forest', 'space', 'desert', 'ice', 'neon'];
        return themes.find(theme => description.toLowerCase().includes(theme)) || 'custom';
    },
    
    extractColors(description) {
        const theme = this.extractTheme(description);
        return this.colorSchemes[theme] || this.colorSchemes.cyber;
    },
    
    extractPowerups(description) {
        const powerups = [];
        Object.keys(this.powerupTypes).forEach(type => {
            if (description.toLowerCase().includes(type.toLowerCase()) || 
                description.toLowerCase().includes(this.powerupTypes[type].name.toLowerCase())) {
                powerups.push(this.powerupTypes[type]);
            }
        });
        return powerups;
    },
    
    extractDifficulties(description) {
        const difficulties = [];
        Object.keys(this.difficultyModifiers).forEach(type => {
            if (description.toLowerCase().includes(type.toLowerCase()) ||
                description.toLowerCase().includes(this.difficultyModifiers[type].name.toLowerCase())) {
                difficulties.push(this.difficultyModifiers[type]);
            }
        });
        return difficulties;
    },
    
    extractBlocks(description) {
        const blocks = [];
        Object.keys(this.blockBehaviors).forEach(type => {
            if (description.toLowerCase().includes(type.toLowerCase()) ||
                description.toLowerCase().includes(this.blockBehaviors[type].name.toLowerCase())) {
                blocks.push(this.blockBehaviors[type]);
            }
        });
        return blocks;
    },
    
    extractMusic(description) {
        if (window.AudioFramework) {
            const mockConfig = { 
                id: description.toLowerCase().replace(/\s+/g, ''),
                mechanics: { specialFeatures: this.extractPowerups(description).concat(this.extractDifficulties(description)) }
            };
            return window.AudioFramework.selectProgression(mockConfig);
        }
        
        if (description.toLowerCase().includes('techno')) return [1, 4, 6, 3];
        if (description.toLowerCase().includes('classical')) return [1, 5, 6, 4];
        if (description.toLowerCase().includes('rock')) return [1, 6, 4, 5];
        return [1, 6, 4, 5];
    },
    
    extractMechanics(description) {
        const mechanics = { startingBalls: 1 };
        
        if (description.toLowerCase().includes('multiple balls')) {
            mechanics.startingBalls = 3;
        }
        if (description.toLowerCase().includes('fast')) {
            mechanics.ballSpeed = 1.5;
        }
        if (description.toLowerCase().includes('slow')) {
            mechanics.ballSpeed = 0.7;
        }
        
        return mechanics;
    },
    
    generateModeConfig(description) {
        const parsed = this.parseDescription(description);
        const modeId = this.generateModeId(description);
        const modeName = this.generateModeName(description);
        
        const config = {
            id: modeId,
            name: modeName,
            description: description,
            
            colorScheme: {
                background: parsed.colors.background,
                blockByHP: this.generateBlockColors(parsed.colors.blocks),
                special: {
                    spawner: parsed.colors.ui,
                    exploder: parsed.colors.particles
                }
            },
            
            stylesheet: {
                customCSS: this.generateCustomCSS(modeId, parsed.colors)
            },
            
            mechanics: {
                startingBalls: parsed.mechanics.startingBalls || 1,
                ballSpeed: parsed.mechanics.ballSpeed || 1.0,
                specialFeatures: [
                    ...parsed.powerups,
                    ...parsed.difficulties, 
                    ...parsed.blocks
                ]
            },
            
            musicProgression: parsed.music,
            
            audioConfig: window.AudioFramework ? 
                window.AudioFramework.generateModeAudio({
                    id: modeId,
                    musicProgression: parsed.music,
                    mechanics: {
                        startingBalls: parsed.mechanics.startingBalls || 1,
                        ballSpeed: parsed.mechanics.ballSpeed || 1.0,
                        specialFeatures: [
                            ...parsed.powerups,
                            ...parsed.difficulties, 
                            ...parsed.blocks
                        ]
                    }
                }) : null,
            
            leaderboard: {
                key: `ballDefender_${modeId}_Leaderboard`,
                gistFile: `ball-defender-${modeId}-leaderboard.json`
            }
        };
        
        return config;
    },
    
    generateModeId(description) {
        const theme = this.extractTheme(description);
        const suffix = Math.random().toString(36).substring(2, 5);
        return `${theme}${suffix}`;
    },
    
    generateModeName(description) {
        const theme = this.extractTheme(description);
        return `${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`;
    },
    
    generateBlockColors(baseColors) {
        const colors = {};
        for (let hp = 1; hp <= 10; hp++) {
            colors[hp] = {
                base: this.adjustColor(baseColors.base, hp * 0.1),
                glow: this.adjustColor(baseColors.glow, hp * 0.1), 
                shadow: this.adjustColor(baseColors.shadow, hp * 0.1)
            };
        }
        colors.default = baseColors;
        return colors;
    },
    
    adjustColor(color, factor) {
        return color;
    },
    
    generateCustomCSS(modeId, colors) {
        return `
            .mode-${modeId} {
                --primary-color: ${colors.ui.primary};
                --secondary-color: ${colors.ui.secondary};
                --accent-color: ${colors.ui.accent};
                --bg-primary: ${colors.background.primary};
                --bg-secondary: ${colors.background.secondary};
            }
            
            .mode-${modeId} .game-canvas {
                background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
            }
            
            .mode-${modeId} .ui-element {
                color: var(--primary-color);
                text-shadow: 0 0 10px var(--accent-color);
            }
        `;
    }
};

window.ModeTemplateGenerator = ModeTemplateGenerator;

console.log('🤖 Mode Template Generator loaded - Ready to parse natural language');