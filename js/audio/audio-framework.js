const AudioFramework = {
    progressions: {
        classic: [1, 6, 4, 5],
        dramatic: [1, 3, 6, 4], 
        tension: [1, 4, 6, 3],
        electronic: [1, 4, 6, 5],
        flowing: [1, 5, 6, 4],
        organic: [1, 6, 2, 5],
        mysterious: [6, 4, 1, 5],
        heroic: [1, 5, 6, 3],
        melancholy: [6, 1, 4, 5],
        uplifting: [1, 3, 4, 5]
    },
    
    styles: {
        classical: {
            tempo: 'moderate',
            attack: 'soft',
            sustain: 'long',
            timbre: 'warm'
        },
        electronic: {
            tempo: 'fast',
            attack: 'sharp',
            sustain: 'short',
            timbre: 'synthetic'
        },
        ambient: {
            tempo: 'slow',
            attack: 'very-soft',
            sustain: 'very-long',
            timbre: 'ethereal'
        },
        rock: {
            tempo: 'fast',
            attack: 'hard',
            sustain: 'medium',
            timbre: 'distorted'
        },
        cinematic: {
            tempo: 'variable',
            attack: 'dramatic',
            sustain: 'sweeping',
            timbre: 'orchestral'
        }
    },
    
    keys: {
        'C': { root: 261.63, scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88] },
        'D': { root: 293.66, scale: [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 554.37] },
        'E': { root: 329.63, scale: [329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 622.25] },
        'F': { root: 349.23, scale: [349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 659.25] },
        'G': { root: 392.00, scale: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 739.99] },
        'A': { root: 440.00, scale: [440.00, 493.88, 554.37, 587.33, 659.25, 739.99, 830.61] },
        'B': { root: 493.88, scale: [493.88, 554.37, 622.25, 659.25, 739.99, 830.61, 932.33] }
    },
    
    generateModeAudio(modeConfig) {
        const audioConfig = {
            progression: this.selectProgression(modeConfig),
            style: this.selectStyle(modeConfig),
            key: this.selectKey(modeConfig),
            tempo: this.selectTempo(modeConfig),
            intensity: this.selectIntensity(modeConfig)
        };
        
        return {
            ...audioConfig,
            chordSequence: this.buildChordSequence(audioConfig),
            soundEffects: this.generateSoundEffects(modeConfig),
            adaptiveTriggers: this.createAdaptiveTriggers(modeConfig)
        };
    },
    
    selectProgression(modeConfig) {
        if (modeConfig.musicProgression) {
            return modeConfig.musicProgression;
        }
        
        const theme = modeConfig.id.toLowerCase();
        
        if (theme.includes('volcanic') || theme.includes('fire')) return this.progressions.tension;
        if (theme.includes('cyber') || theme.includes('electric')) return this.progressions.electronic;
        if (theme.includes('ocean') || theme.includes('water')) return this.progressions.flowing;
        if (theme.includes('forest') || theme.includes('nature')) return this.progressions.organic;
        if (theme.includes('space') || theme.includes('cosmic')) return this.progressions.mysterious;
        if (theme.includes('zen') || theme.includes('peaceful')) return this.progressions.melancholy;
        
        return this.progressions.classic;
    },
    
    selectStyle(modeConfig) {
        const theme = modeConfig.id.toLowerCase();
        
        if (theme.includes('cyber') || theme.includes('electric')) return this.styles.electronic;
        if (theme.includes('zen') || theme.includes('ambient')) return this.styles.ambient;
        if (theme.includes('rock') || theme.includes('metal')) return this.styles.rock;
        if (theme.includes('cinematic') || theme.includes('epic')) return this.styles.cinematic;
        
        return this.styles.classical;
    },
    
    selectKey(modeConfig) {
        const theme = modeConfig.id.toLowerCase();
        
        if (theme.includes('volcanic') || theme.includes('fire')) return 'D';
        if (theme.includes('cyber') || theme.includes('electric')) return 'F';
        if (theme.includes('ocean') || theme.includes('water')) return 'A';
        if (theme.includes('forest') || theme.includes('nature')) return 'G';
        if (theme.includes('space') || theme.includes('cosmic')) return 'B';
        
        return 'C';
    },
    
    selectTempo(modeConfig) {
        const mechanics = modeConfig.mechanics || {};
        
        if (mechanics.ballSpeed > 1.2) return 'fast';
        if (mechanics.ballSpeed < 0.8) return 'slow';
        
        const theme = modeConfig.id.toLowerCase();
        if (theme.includes('zen') || theme.includes('peaceful')) return 'slow';
        if (theme.includes('action') || theme.includes('chaos')) return 'fast';
        
        return 'moderate';
    },
    
    selectIntensity(modeConfig) {
        const features = modeConfig.mechanics?.specialFeatures || [];
        const difficultyCount = features.filter(f => f.type === 'difficultyModifier').length;
        
        if (difficultyCount >= 2) return 'high';
        if (difficultyCount === 1) return 'medium';
        return 'low';
    },
    
    buildChordSequence(audioConfig) {
        const { progression, key, style } = audioConfig;
        const keyData = this.keys[key];
        
        return progression.map(degree => {
            const rootNote = keyData.scale[degree - 1];
            const thirdNote = keyData.scale[((degree + 2) % 7)];
            const fifthNote = keyData.scale[((degree + 4) % 7)];
            
            return {
                root: rootNote,
                third: thirdNote,
                fifth: fifthNote,
                degree: degree,
                style: style
            };
        });
    },
    
    generateSoundEffects(modeConfig) {
        const theme = modeConfig.id.toLowerCase();
        const effects = {
            blockHit: { frequency: 800, duration: 0.1 },
            blockDestroy: { frequency: 400, duration: 0.3 },
            ballBounce: { frequency: 1200, duration: 0.05 },
            powerup: { frequency: 600, duration: 0.5 },
            levelComplete: { sequence: [523, 659, 784], duration: 1.0 }
        };
        
        if (theme.includes('volcanic') || theme.includes('fire')) {
            effects.blockDestroy.frequency = 200;
            effects.blockDestroy.timbre = 'crackling';
        }
        
        if (theme.includes('cyber') || theme.includes('electric')) {
            effects.blockHit.timbre = 'synthetic';
            effects.ballBounce.frequency = 1500;
        }
        
        if (theme.includes('ocean') || theme.includes('water')) {
            effects.ballBounce.timbre = 'flowing';
            effects.blockDestroy.frequency = 300;
        }
        
        return effects;
    },
    
    createAdaptiveTriggers(modeConfig) {
        const triggers = {
            onGameStart: 'startProgression',
            onLevelUp: 'intensifyMusic',
            onPowerup: 'playPowerupSound',
            onGameOver: 'fadeOut'
        };
        
        const features = modeConfig.mechanics?.specialFeatures || [];
        
        features.forEach(feature => {
            if (feature.type === 'difficultyModifier') {
                triggers[`on${feature.id}Activate`] = 'addTension';
            }
            
            if (feature.type === 'powerup') {
                triggers[`on${feature.id}Collect`] = `play${feature.id}Sound`;
            }
        });
        
        return triggers;
    },
    
    integrateWithAudioEngine(modeAudioConfig) {
        if (window.audioEngine) {
            if (window.audioEngine.setProgression) {
                window.audioEngine.setProgression(modeAudioConfig.progression);
            }
            
            if (window.audioEngine.setKey) {
                window.audioEngine.setKey(modeAudioConfig.key);
            }
            
            if (window.audioEngine.setStyle) {
                window.audioEngine.setStyle(modeAudioConfig.style);
            }
            
            if (window.audioEngine.setSoundEffects) {
                window.audioEngine.setSoundEffects(modeAudioConfig.soundEffects);
            }
        }
        
        return modeAudioConfig;
    },
    
    createModeAudioPreset(description) {
        const mockModeConfig = { 
            id: description.toLowerCase().replace(/\s+/g, ''),
            mechanics: { ballSpeed: 1.0, specialFeatures: [] }
        };
        
        return this.generateModeAudio(mockModeConfig);
    }
};

window.AudioFramework = AudioFramework;

console.log('🎵 Audio Framework loaded - Mode-aware music system ready');
console.log('Available progressions:', Object.keys(AudioFramework.progressions));
console.log('Available styles:', Object.keys(AudioFramework.styles));