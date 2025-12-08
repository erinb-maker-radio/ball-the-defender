// Adaptive Drum Loop Layer System
// Layers in drum loops based on score milestones - config loaded from localStorage

class DrumLayerSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.isPlaying = false;
        this.layers = {};
        this.currentMode = 'original';

        // State tracking
        this.currentScore = 0;
        this.currentBalls = 0;
        this.fadeTime = 0.5; // seconds to fade in/out layers

        // Target BPM for syncing all loops
        this.targetBPM = 60;

        // Timing for quantized activation
        this.loopStartTime = 0; // When loops started playing
        this.beatsPerBar = 4;   // 4/4 time
        this.barsPerLoop = 4;   // Assuming 4-bar loops
    }

    // Load config - tries JSON file first, then localStorage
    async loadConfig(mode) {
        this.currentMode = mode;
        this.layers = {};

        // Try loading from JSON file first
        const jsonPath = `audio/drum-config/drum-config-${mode}.json`;
        try {
            const response = await fetch(jsonPath);
            if (response.ok) {
                const config = await response.json();
                this.applyConfig(config, 'JSON file');
                return;
            }
        } catch (e) {
            console.log(`🥁 No JSON file for ${mode}, checking localStorage...`);
        }

        // Fall back to localStorage
        const storageKey = `ballDefender_drumLoops_${mode}`;
        const saved = localStorage.getItem(storageKey);

        if (!saved) {
            console.log(`🥁 No drum loop config for ${mode}`);
            return;
        }

        try {
            const config = JSON.parse(saved);
            this.applyConfig(config, 'localStorage');
        } catch (e) {
            console.warn('🥁 Failed to parse drum config:', e);
        }
    }

    // Apply config to layers
    applyConfig(config, source) {
        console.log(`🥁 Loading drum config for ${this.currentMode} from ${source}:`, config);

        config.loops.forEach((loopConfig, index) => {
            this.layers[`loop${index}`] = {
                file: loopConfig.file,
                name: loopConfig.name,
                bpm: loopConfig.bpm,
                buffer: null,
                source: null,
                gain: null,
                scoreThresholdOn: loopConfig.triggerOn,
                scoreThresholdOff: loopConfig.triggerOff,
                halftime: loopConfig.halftime || false,
                halfLoop: loopConfig.halfLoop || false, // Only play first half of loop
                active: false,
                volume: loopConfig.volume || 0.7,
                loaded: false,
            };
        });

        console.log(`🥁 Loaded ${Object.keys(this.layers).length} drum loops for ${this.currentMode}`);
    }

    async init(mode) {
        // Load config for mode
        if (mode) {
            await this.loadConfig(mode);
        }

        // Use existing audio context if available
        if (window.audioEngine && window.audioEngine.audioContext) {
            this.audioContext = window.audioEngine.audioContext;
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.8;
            this.masterGain.connect(window.audioEngine.masterGain || this.audioContext.destination);
        } else {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.8;
            this.masterGain.connect(this.audioContext.destination);
        }

        // Create gain nodes for each layer
        for (const [name, layer] of Object.entries(this.layers)) {
            layer.gain = this.audioContext.createGain();
            layer.gain.gain.value = 0; // Start silent
            layer.gain.connect(this.masterGain);
        }

        // Load all audio buffers
        await this.loadAllBuffers();

        this.isInitialized = true;
        console.log('🥁 DrumLayerSystem initialized');
    }

    async loadAllBuffers() {
        const loadPromises = Object.entries(this.layers).map(async ([name, layer]) => {
            try {
                const response = await fetch(layer.file);
                if (!response.ok) {
                    console.warn(`Loop file not found: ${layer.file}`);
                    return;
                }
                const arrayBuffer = await response.arrayBuffer();
                layer.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
                layer.loaded = true;
                console.log(`✓ Loaded drum loop: ${layer.name}`);
            } catch (error) {
                console.warn(`Failed to load drum loop ${name}: ${layer.file}`);
            }
        });

        await Promise.all(loadPromises);
    }

    start() {
        if (!this.isInitialized || this.isPlaying) return;
        if (Object.keys(this.layers).length === 0) {
            console.log('🥁 No drum loops configured - skipping');
            return;
        }

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isPlaying = true;

        // Calculate sync offset with mixdown if available
        let syncOffset = 0;
        if (window.audioEngine && window.audioEngine.mixdownStartTime && window.audioEngine.mixdownPlaying) {
            const elapsed = this.audioContext.currentTime - window.audioEngine.mixdownStartTime;
            // Get the loop duration at target BPM (assuming 4 bars at 60 BPM = 16 seconds, scale by BPM)
            const beatsPerLoop = 16; // Assuming 4 bar loops
            const loopDurationAtTargetBPM = (beatsPerLoop / this.targetBPM) * 60;
            syncOffset = elapsed % loopDurationAtTargetBPM;
            console.log(`🥁 Syncing drums to mixdown - offset: ${syncOffset.toFixed(3)}s`);
        }

        // Store loop start time for quantized activation (adjusted for sync offset)
        this.loopStartTime = this.audioContext.currentTime - syncOffset;

        // Start all loaded loops (they'll play silently until activated)
        for (const [name, layer] of Object.entries(this.layers)) {
            if (layer.loaded && layer.buffer) {
                this.startLoop(layer, syncOffset);
            }
        }

        console.log('🥁 DrumLayerSystem started');
    }

    startLoop(layer, syncOffset = 0) {
        if (layer.source) {
            try {
                layer.source.stop();
            } catch (e) {}
        }

        // Calculate playback rate to match target BPM
        const halftimeMultiplier = layer.halftime ? 0.5 : 1;
        const playbackRate = (this.targetBPM / layer.bpm) * halftimeMultiplier;

        layer.source = this.audioContext.createBufferSource();
        layer.source.buffer = layer.buffer;
        layer.source.loop = true;
        layer.source.playbackRate.value = playbackRate;

        // If halfLoop, only loop the first half of the buffer
        if (layer.halfLoop && layer.buffer) {
            layer.source.loopStart = 0;
            layer.source.loopEnd = layer.buffer.duration / 2;
        }

        layer.source.connect(layer.gain);

        // Calculate the offset into the buffer to sync with mixdown
        // The syncOffset is in real-time seconds, but we need buffer offset
        // which is affected by playback rate
        const bufferOffset = (syncOffset * playbackRate) % layer.buffer.duration;
        layer.source.start(0, bufferOffset);
    }

    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.currentScore = 0;

        // Stop all loops
        for (const layer of Object.values(this.layers)) {
            if (layer.source) {
                try {
                    layer.source.stop();
                } catch (e) {}
                layer.source = null;
            }
            if (layer.gain) {
                layer.gain.gain.value = 0;
            }
            layer.active = false;
        }

        console.log('🥁 DrumLayerSystem stopped');
    }

    // Called by game to update score - checks thresholds and activates layers
    updateScore(score) {
        this.currentScore = score;
        this.checkThresholds();
    }

    // Called by game to update ball count
    updateBalls(balls) {
        this.currentBalls = balls;
    }

    checkThresholds() {
        if (!this.audioContext) return;

        for (const [name, layer] of Object.entries(this.layers)) {
            if (!layer.loaded) continue;

            let shouldBeActive = false;

            // Check if score is >= ON threshold
            if (layer.scoreThresholdOn !== null && this.currentScore >= layer.scoreThresholdOn) {
                shouldBeActive = true;
            }

            // Check if score is >= OFF threshold (turns it off)
            if (layer.scoreThresholdOff !== null && this.currentScore >= layer.scoreThresholdOff) {
                shouldBeActive = false;
            }

            // Activate or deactivate layer with fade
            if (shouldBeActive && !layer.active) {
                this.activateLayer(name);
            } else if (!shouldBeActive && layer.active) {
                this.deactivateLayer(name);
            }
        }
    }

    activateLayer(name) {
        const layer = this.layers[name];
        if (!layer || !layer.gain || !layer.loaded) return;

        layer.active = true;
        const now = this.audioContext.currentTime;

        // Calculate time until next loop "1" (downbeat)
        const beatsPerLoop = this.beatsPerBar * this.barsPerLoop; // 16 beats for 4 bars
        const loopDuration = (beatsPerLoop / this.targetBPM) * 60; // Duration in seconds
        const elapsed = now - this.loopStartTime;
        const positionInLoop = elapsed % loopDuration;
        const timeUntilNextOne = loopDuration - positionInLoop;

        // Schedule fade in at the next "1"
        const fadeStartTime = now + timeUntilNextOne;

        layer.gain.gain.cancelScheduledValues(now);
        layer.gain.gain.setValueAtTime(0, now); // Keep silent until next 1
        layer.gain.gain.setValueAtTime(0, fadeStartTime); // Still silent at start of fade
        layer.gain.gain.linearRampToValueAtTime(layer.volume, fadeStartTime + this.fadeTime);

        console.log(`🥁 Loop scheduled: ${layer.name} in ${timeUntilNextOne.toFixed(2)}s (score: ${this.currentScore})`);
    }

    deactivateLayer(name) {
        const layer = this.layers[name];
        if (!layer || !layer.gain) return;

        layer.active = false;
        const now = this.audioContext.currentTime;

        // Fade out
        layer.gain.gain.cancelScheduledValues(now);
        layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
        layer.gain.gain.linearRampToValueAtTime(0, now + this.fadeTime);

        console.log(`🥁 Loop deactivated: ${layer.name}`);
    }

    // Set master volume (0-1)
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    // Get current state for debugging
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentScore: this.currentScore,
            currentMode: this.currentMode,
            layers: Object.entries(this.layers).map(([name, layer]) => ({
                name: layer.name,
                loaded: layer.loaded,
                active: layer.active,
                scoreThresholdOn: layer.scoreThresholdOn,
                scoreThresholdOff: layer.scoreThresholdOff,
                halftime: layer.halftime
            }))
        };
    }
}

// Create global instance
window.DrumLayerSystem = new DrumLayerSystem();

console.log('🥁 DrumLayerSystem module loaded');
