/**
 * Audio Plugin - Beautiful sound architecture
 * Integrates audio framework with state system
 */

class AudioPlugin {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.chordProgression = [1, 6, 4, 5]; // Default
        this.currentChordIndex = 0;
        this.isPlaying = false;
        this.volume = 0.85;
    }
    
    initialize(engine) {
        this.engine = engine;
        this.setupAudioContext();
        this.setupGlobalAPI();
        console.log('🎵 Audio plugin initialized');
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            
            console.log('🎵 Audio context created');
        } catch (error) {
            console.warn('⚠️ Audio context failed to initialize:', error);
        }
    }
    
    setupGlobalAPI() {
        // Expose global audioEngine for compatibility with HTML audio controls
        window.audioEngine = {
            audioContext: this.audioContext,
            masterGain: this.masterGain,
            chordProgression: this.chordProgression,
            
            // For HTML audio control compatibility
            updateGainLevels: (channel, level) => {
                if (this.masterGain) {
                    this.masterGain.gain.setValueAtTime(level, this.audioContext.currentTime);
                }
            },
            
            setChannelGain: (channel, level) => {
                if (this.masterGain) {
                    this.masterGain.gain.setValueAtTime(level, this.audioContext.currentTime);
                }
            }
        };
        
        console.log('🌐 Global audio API configured');
    }
    
    // State-aware audio management
    onStateChange(oldState, newState) {
        switch (newState) {
            case 'menu':
                this.playMenuMusic();
                break;
            case 'playing':
                this.playGameMusic();
                break;
            case 'paused':
                this.pauseMusic();
                break;
            case 'gameOver':
                this.playGameOverSound();
                break;
        }
    }
    
    playMenuMusic() {
        // Gentle ambient menu music
        console.log('🎵 Playing menu music');
        // Implementation would go here
    }
    
    playGameMusic() {
        // Dynamic game music based on progression
        console.log('🎵 Playing game music with progression:', this.chordProgression);
        // Implementation would go here
    }
    
    pauseMusic() {
        console.log('⏸️ Music paused');
        // Implementation would go here
    }
    
    playGameOverSound() {
        console.log('💀 Playing game over sound');
        // Implementation would go here
    }
    
    // Game event sounds
    playBallLaunch() {
        this.playTone(440, 0.1, 'sine', 0.3);
    }
    
    playBlockHit() {
        this.playTone(880, 0.05, 'square', 0.2);
    }
    
    playBlockDestroy() {
        this.playTone(1320, 0.2, 'sawtooth', 0.4);
    }
    
    playExplosion() {
        // Complex explosion sound
        this.playTone(150, 0.2, 'sawtooth', 0.6);
        setTimeout(() => this.playTone(100, 0.3, 'square', 0.4), 50);
    }
    
    // Utility method for simple tones
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('⚠️ Audio tone failed:', error);
        }
    }
    
    // Mode-based configuration
    setModeProgression(mode) {
        switch (mode) {
            case 'original':
                this.chordProgression = [1, 6, 4, 5];
                break;
            case 'boom':
                this.chordProgression = [1, 3, 6, 4]; // More dramatic
                break;
            case 'ice':
                this.chordProgression = [6, 4, 1, 5]; // More mysterious
                break;
            default:
                this.chordProgression = [1, 6, 4, 5];
        }
        
        // Update global reference
        if (window.audioEngine) {
            window.audioEngine.chordProgression = this.chordProgression;
        }
        
        console.log(`🎵 Audio configured for ${mode} mode:`, this.chordProgression);
    }
}

// Export
window.AudioPlugin = AudioPlugin;
console.log('🎵 Beautiful Audio Plugin loaded');