// Debug mode - set to true to enable console logging
const DEBUG_MODE = false;
function debugLog(...args) { if (DEBUG_MODE) console.log(...args); }
function debugWarn(...args) { if (DEBUG_MODE) console.warn(...args); }

// Volume Mixer System - control volume levels for all audio sources
const SoundMixer = {
    // Enable/disable toggles
    enabled: {
        blockDestroy: true,
        blockHit: true,
        chainBonus: true,
        drumHit: true,
        musicalHit: true,
        powerup: true,
        launch: true,
        levelComplete: true,
        uiSounds: true,
        ambientPleasure: true,
    },

    // Volume levels (0-100)
    volumes: {
        master: 80,
        audioEditor: 100,  // Audio editor master volume
        musicalHit: 70,    // Piano/bells
        drumHit: 60,       // Jazz drums
        blockSounds: 50,   // Block hit/destroy
        launch: 60,        // Ball launch
        uiSounds: 40,      // UI clicks
    },

    isEnabled(category) {
        return this.enabled[category] === true;
    },

    getVolume(channel) {
        const vol = this.volumes[channel] ?? 100;
        const master = this.volumes.master ?? 100;
        return (vol / 100) * (master / 100);
    },

    setVolume(channel, value) {
        this.volumes[channel] = Math.max(0, Math.min(100, value));
        this.applyVolume(channel);
        this.saveSettings();
    },

    applyVolume(channel) {
        if (!window.audioEngine || !window.audioEngine.audioContext) return;

        const vol = this.getVolume(channel);
        const ae = window.audioEngine;
        const now = ae.audioContext.currentTime;

        switch(channel) {
            case 'master':
                if (ae.masterGain) ae.masterGain.gain.setValueAtTime(vol, now);
                // Re-apply all other volumes when master changes
                Object.keys(this.volumes).forEach(ch => {
                    if (ch !== 'master') this.applyVolume(ch);
                });
                break;
            case 'audioEditor':
                // Send volume to audio editor iframe via postMessage
                const iframe = document.getElementById('audioEditorFrame');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'setMasterVolume',
                        volume: this.volumes.audioEditor / 100
                    }, '*');
                }
                break;
            case 'musicalHit':
                if (ae.impactGain) ae.impactGain.gain.setValueAtTime(vol, now);
                break;
            case 'drumHit':
                if (ae.jazzDrumGain) ae.jazzDrumGain.gain.setValueAtTime(vol * 0.5, now);
                break;
        }
    },

    toggle(category) {
        this.enabled[category] = !this.enabled[category];
        this.saveSettings();
        return this.enabled[category];
    },

    saveSettings() {
        try {
            localStorage.setItem('ballDefender_soundMixer', JSON.stringify({
                enabled: this.enabled,
                volumes: this.volumes
            }));
        } catch(e) {}
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem('ballDefender_soundMixer');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.enabled) Object.assign(this.enabled, data.enabled);
                if (data.volumes) Object.assign(this.volumes, data.volumes);
            }
        } catch(e) {}
    },

    // Create mixer popup UI with volume sliders
    createMixerUI() {
        const existing = document.getElementById('soundMixerPopup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'soundMixerPopup';
        popup.innerHTML = `
            <style>
                #soundMixerPopup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(15, 15, 25, 0.98);
                    border: 2px solid #00ffff;
                    border-radius: 12px;
                    padding: 20px;
                    z-index: 10000;
                    min-width: 350px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.4);
                    font-family: 'Courier New', monospace;
                }
                #soundMixerPopup h3 {
                    margin: 0 0 20px 0;
                    color: #00ffff;
                    text-align: center;
                    font-size: 20px;
                    text-shadow: 0 0 10px #00ffff;
                }
                #soundMixerPopup .section-title {
                    color: #ff9900;
                    font-size: 12px;
                    text-transform: uppercase;
                    margin: 15px 0 8px 0;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #333;
                }
                #soundMixerPopup .mixer-row {
                    display: flex;
                    align-items: center;
                    padding: 10px 0;
                    gap: 10px;
                }
                #soundMixerPopup .mixer-label {
                    color: #fff;
                    font-size: 13px;
                    min-width: 100px;
                }
                #soundMixerPopup .volume-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    height: 8px;
                    border-radius: 4px;
                    background: linear-gradient(to right, #00ffff 0%, #00ffff var(--val), #333 var(--val), #333 100%);
                    cursor: pointer;
                }
                #soundMixerPopup .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #fff;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0,255,255,0.8);
                }
                #soundMixerPopup .volume-value {
                    color: #00ffff;
                    font-size: 12px;
                    min-width: 35px;
                    text-align: right;
                }
                #soundMixerPopup .toggle-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 0;
                }
                #soundMixerPopup .toggle-label {
                    color: #aaa;
                    font-size: 12px;
                }
                #soundMixerPopup .mini-toggle {
                    padding: 3px 10px;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 10px;
                    font-weight: bold;
                }
                #soundMixerPopup .mini-toggle.on { background: #00cc00; color: #000; }
                #soundMixerPopup .mini-toggle.off { background: #cc0000; color: #fff; }
                #soundMixerPopup .close-btn {
                    display: block;
                    width: 100%;
                    margin-top: 20px;
                    padding: 12px;
                    background: linear-gradient(135deg, #333, #222);
                    color: #fff;
                    border: 1px solid #00ffff;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                #soundMixerPopup .close-btn:hover {
                    background: #00ffff;
                    color: #000;
                }
                #soundMixerPopup .master-row {
                    background: rgba(0,255,255,0.1);
                    margin: -10px -10px 10px -10px;
                    padding: 15px;
                    border-radius: 8px;
                }
            </style>
            <h3>🎚️ Volume Mixer</h3>

            <div class="master-row">
                <div class="mixer-row">
                    <span class="mixer-label" style="color:#00ffff;font-weight:bold;">MASTER</span>
                    <input type="range" class="volume-slider" data-channel="master" min="0" max="100" value="${this.volumes.master}" style="--val:${this.volumes.master}%">
                    <span class="volume-value">${this.volumes.master}%</span>
                </div>
            </div>

            <div class="section-title">Audio Sources</div>

            <div class="mixer-row">
                <span class="mixer-label">🎵 Audio Editor</span>
                <input type="range" class="volume-slider" data-channel="audioEditor" min="0" max="100" value="${this.volumes.audioEditor || 100}" style="--val:${this.volumes.audioEditor || 100}%">
                <span class="volume-value">${this.volumes.audioEditor || 100}%</span>
            </div>

            <div class="mixer-row">
                <span class="mixer-label">🎹 Musical Hits</span>
                <input type="range" class="volume-slider" data-channel="musicalHit" min="0" max="100" value="${this.volumes.musicalHit}" style="--val:${this.volumes.musicalHit}%">
                <span class="volume-value">${this.volumes.musicalHit}%</span>
            </div>

            <div class="mixer-row">
                <span class="mixer-label">🥁 Drum Hits</span>
                <input type="range" class="volume-slider" data-channel="drumHit" min="0" max="100" value="${this.volumes.drumHit}" style="--val:${this.volumes.drumHit}%">
                <span class="volume-value">${this.volumes.drumHit}%</span>
            </div>

            <div class="mixer-row">
                <span class="mixer-label">💥 Block Sounds</span>
                <input type="range" class="volume-slider" data-channel="blockSounds" min="0" max="100" value="${this.volumes.blockSounds}" style="--val:${this.volumes.blockSounds}%">
                <span class="volume-value">${this.volumes.blockSounds}%</span>
            </div>

            <div class="mixer-row">
                <span class="mixer-label">🚀 Launch</span>
                <input type="range" class="volume-slider" data-channel="launch" min="0" max="100" value="${this.volumes.launch}" style="--val:${this.volumes.launch}%">
                <span class="volume-value">${this.volumes.launch}%</span>
            </div>

            <div class="mixer-row">
                <span class="mixer-label">🔊 UI Sounds</span>
                <input type="range" class="volume-slider" data-channel="uiSounds" min="0" max="100" value="${this.volumes.uiSounds}" style="--val:${this.volumes.uiSounds}%">
                <span class="volume-value">${this.volumes.uiSounds}%</span>
            </div>

            <div class="section-title">🥁 Drum Loops</div>
            <div id="drumLoopSliders"></div>

            <div class="section-title">Sound Toggles</div>

            <div class="toggle-row">
                <span class="toggle-label">Block Destroy</span>
                <button class="mini-toggle ${this.enabled.blockDestroy ? 'on' : 'off'}" data-sound="blockDestroy">${this.enabled.blockDestroy ? 'ON' : 'OFF'}</button>
            </div>
            <div class="toggle-row">
                <span class="toggle-label">Block Hit</span>
                <button class="mini-toggle ${this.enabled.blockHit ? 'on' : 'off'}" data-sound="blockHit">${this.enabled.blockHit ? 'ON' : 'OFF'}</button>
            </div>
            <div class="toggle-row">
                <span class="toggle-label">Chain Bonus</span>
                <button class="mini-toggle ${this.enabled.chainBonus ? 'on' : 'off'}" data-sound="chainBonus">${this.enabled.chainBonus ? 'ON' : 'OFF'}</button>
            </div>
            <div class="toggle-row">
                <span class="toggle-label">Drum Hits</span>
                <button class="mini-toggle ${this.enabled.drumHit ? 'on' : 'off'}" data-sound="drumHit">${this.enabled.drumHit ? 'ON' : 'OFF'}</button>
            </div>
            <div class="toggle-row">
                <span class="toggle-label">Musical Hits</span>
                <button class="mini-toggle ${this.enabled.musicalHit ? 'on' : 'off'}" data-sound="musicalHit">${this.enabled.musicalHit ? 'ON' : 'OFF'}</button>
            </div>
            <div class="toggle-row">
                <span class="toggle-label">Launch Sound</span>
                <button class="mini-toggle ${this.enabled.launch ? 'on' : 'off'}" data-sound="launch">${this.enabled.launch ? 'ON' : 'OFF'}</button>
            </div>
            <div class="toggle-row">
                <span class="toggle-label">Powerup</span>
                <button class="mini-toggle ${this.enabled.powerup ? 'on' : 'off'}" data-sound="powerup">${this.enabled.powerup ? 'ON' : 'OFF'}</button>
            </div>

            <button class="close-btn" onclick="document.getElementById('soundMixerPopup').remove()">Close Mixer (X)</button>
        `;

        // Volume slider handlers
        popup.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const channel = e.target.dataset.channel;
                const value = parseInt(e.target.value);
                this.setVolume(channel, value);
                e.target.style.setProperty('--val', value + '%');
                e.target.nextElementSibling.textContent = value + '%';
            });
        });

        // Toggle button handlers
        popup.querySelectorAll('.mini-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const sound = btn.dataset.sound;
                const newState = this.toggle(sound);
                btn.textContent = newState ? 'ON' : 'OFF';
                btn.className = 'mini-toggle ' + (newState ? 'on' : 'off');
            });
        });

        document.body.appendChild(popup);

        // Populate drum loop sliders dynamically
        const drumLoopContainer = document.getElementById('drumLoopSliders');
        if (drumLoopContainer && window.DrumLayerSystem && window.DrumLayerSystem.layers) {
            const layers = window.DrumLayerSystem.layers;
            const layerKeys = Object.keys(layers);

            if (layerKeys.length === 0) {
                drumLoopContainer.innerHTML = '<div style="color:#666;font-size:11px;padding:5px 0;">No drum loops loaded</div>';
            } else {
                layerKeys.forEach(key => {
                    const layer = layers[key];
                    const vol = Math.round((layer.volume || 0.7) * 100);
                    const activeIndicator = layer.active ? '🟢' : '⚫';

                    const row = document.createElement('div');
                    row.className = 'mixer-row';
                    row.innerHTML = `
                        <span class="mixer-label" style="font-size:11px;">${activeIndicator} ${layer.name || key}</span>
                        <input type="range" class="volume-slider drum-loop-slider" data-loop="${key}" min="0" max="100" value="${vol}" style="--val:${vol}%">
                        <span class="volume-value">${vol}%</span>
                    `;
                    drumLoopContainer.appendChild(row);

                    // Add event listener for this slider
                    const slider = row.querySelector('.drum-loop-slider');
                    slider.addEventListener('input', (e) => {
                        const loopKey = e.target.dataset.loop;
                        const value = parseInt(e.target.value);
                        const normalizedVol = value / 100;

                        // Update the layer volume
                        if (window.DrumLayerSystem.layers[loopKey]) {
                            window.DrumLayerSystem.layers[loopKey].volume = normalizedVol;
                            // If layer is active, update the gain node
                            if (window.DrumLayerSystem.layers[loopKey].gain && window.DrumLayerSystem.layers[loopKey].active) {
                                window.DrumLayerSystem.layers[loopKey].gain.gain.value = normalizedVol;
                            }
                        }

                        e.target.style.setProperty('--val', value + '%');
                        e.target.nextElementSibling.textContent = value + '%';
                    });
                });
            }
        } else {
            if (drumLoopContainer) {
                drumLoopContainer.innerHTML = '<div style="color:#666;font-size:11px;padding:5px 0;">Drum system not initialized</div>';
            }
        }
    }
};

// Load saved mixer settings (shared across all modes)
SoundMixer.loadSettings();

// Global function to open mixer
window.openSoundMixer = () => SoundMixer.createMixerUI();
window.SoundMixer = SoundMixer;

// Keyboard shortcut - press 'X' to open mixer
document.addEventListener('keydown', (e) => {
    if (e.key === 'x' || e.key === 'X') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        SoundMixer.createMixerUI();
    }
});

// Initialize these variables but don't access DOM yet
let canvas, ctx, scoreElement, levelElement, ballsLeftElement, blocksLeftElement;
let startBtn, pauseBtn, endGameBtn, prestigeBtn, speedSlider, speedValue;

// Function to initialize DOM elements
function initializeDOMElements() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return false;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context from canvas!');
        return false;
    }
    
    scoreElement = document.getElementById('score');
    levelElement = document.getElementById('level');
    ballsLeftElement = document.getElementById('ballsLeft');
    blocksLeftElement = document.getElementById('blocksLeft');
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    endGameBtn = document.getElementById('endGameBtn');
    prestigeBtn = document.getElementById('prestigeBtn');
    speedSlider = document.getElementById('speedSlider');
    speedValue = document.getElementById('speedValue');
    
    // Initialize performance monitor elements
    fpsMonitorElement = document.getElementById('fpsMonitor');
    deltaMonitorElement = document.getElementById('deltaMonitor');
    ballSpeedMonitorElement = document.getElementById('ballSpeedMonitor');
    
    // DYNAMIC CANVAS: Fill maximum available space with real-time responsiveness
    // Available space: window.innerWidth - (320px sidebar + minimal margins)
    const availableWidth = window.innerWidth - 330; // Sidebar + 10px margin
    const availableHeight = window.innerHeight - 20; // Minimal top/bottom margin
    
    // Target 4:3 aspect ratio but maximize space usage
    const targetAspectRatio = 4/3;
    let gameWidth, gameHeight;
    
    // Calculate dimensions to use maximum available space (99% utilization)
    if (availableWidth / availableHeight > targetAspectRatio) {
        // Limited by height - use 99% of available height
        gameHeight = Math.floor(availableHeight * 0.99);
        gameWidth = Math.floor(gameHeight * targetAspectRatio);
    } else {
        // Limited by width - use 99% of available width
        gameWidth = Math.floor(availableWidth * 0.99);
        gameHeight = Math.floor(gameWidth / targetAspectRatio);
    }
    
    // Ensure reasonable size for good performance (reduced max size significantly)
    gameWidth = Math.max(640, Math.min(gameWidth, 1000)); // Min 640px, max 1000px width (was 1600px)
    gameHeight = Math.max(480, Math.min(gameHeight, 750)); // Min 480px, max 750px height (was 1200px)
    
    // Performance mode: Use smaller canvas on mobile or if performance issues detected
    if (window.PERFORMANCE_MODE === 'mobile' || window.currentPerformanceMode === 'low' || window.currentPerformanceMode === 'potato') {
        gameWidth = Math.min(gameWidth, 800); // Max 800px for performance mode
        gameHeight = Math.min(gameHeight, 600); // Max 600px for performance mode
        debugLog('📱 Performance mode active: Reduced canvas size for better FPS');
    }
    
    canvas.width = gameWidth;
    canvas.height = gameHeight;
    
    debugLog(`Canvas initialized: ${canvas.width}x${canvas.height}`);
    
    // Add dynamic resize listener for responsive canvas
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate canvas size on window resize
            const newAvailableWidth = window.innerWidth - 330;
            const newAvailableHeight = window.innerHeight - 20;
            
            let newGameWidth, newGameHeight;
            if (newAvailableWidth / newAvailableHeight > targetAspectRatio) {
                newGameHeight = Math.floor(newAvailableHeight * 0.99);
                newGameWidth = Math.floor(newGameHeight * targetAspectRatio);
            } else {
                newGameWidth = Math.floor(newAvailableWidth * 0.99);
                newGameHeight = Math.floor(newGameWidth / targetAspectRatio);
            }
            
            // Apply size constraints
            newGameWidth = Math.max(640, Math.min(newGameWidth, 1600));
            newGameHeight = Math.max(480, Math.min(newGameHeight, 1200));
            
            // Only resize if significantly different (avoid micro-adjustments)
            if (Math.abs(canvas.width - newGameWidth) > 10 || Math.abs(canvas.height - newGameHeight) > 10) {
                canvas.width = newGameWidth;
                canvas.height = newGameHeight;
                debugLog(`Canvas resized: ${canvas.width}x${canvas.height}`);
                
                // Reinitialize game constants that depend on canvas size
                initializeGameConstants();
            }
        }, 250); // Debounce resize events
    });
    
    // Initialize the clean architecture system
    initializeCleanArchitecture();
    
    return true;
}

// Initialize the clean architecture system
function initializeCleanArchitecture() {
    // Create the global game core instance
    window.gameCore = new GameCore();
    
    // Initialize with our canvas
    window.gameCore.initialize('gameCanvas');
    
    // Mode will be set by main-menu.js mode selection
    // No default mode - let user select their preferred mode
    
    debugLog('🏗️ Clean architecture initialized successfully');
    debugLog('🎮 GameCore ready with proper module system');
}

let _gameState = 'idle';

// Trap for gameState changes
Object.defineProperty(window, 'gameState', {
    get: function() { return _gameState; },
    set: function(newValue) {
        if (_gameState !== newValue) {
            debugLog(`🎮 Game state changing: ${_gameState} → ${newValue}`);
            console.trace();
        }
        _gameState = newValue;
    }
});

let gameState = _gameState;
let score = 0;
let level = 1;

// Persistent leaderboard system with localStorage backup
// Uses a combination of hardcoded scores and localStorage for persistence

// No fallback leaderboard - gist-only system
const FALLBACK_LEADERBOARD = [];

// Current leaderboard (loaded from gist only)
let currentLeaderboard = [];
let leaderboardLoaded = false;

// Load leaderboard from localStorage with fallback
async function loadOnlineLeaderboard() {
    try {
        debugLog('🌐 Loading persistent leaderboard...');
        
        // Try to load from localStorage first
        const stored = localStorage.getItem('ballDefenderPersistentLeaderboard');
        if (stored) {
            const savedScores = JSON.parse(stored);
            // Use saved scores only (no fallback)
            const mergedScores = [...savedScores];
            // Remove duplicates by name and keep highest score
            const uniqueScores = [];
            const nameMap = new Map();
            
            mergedScores.forEach(score => {
                const existing = nameMap.get(score.name);
                if (!existing || score.score > existing.score) {
                    nameMap.set(score.name, score);
                }
            });
            
            // Convert back to array and sort
            const finalScores = Array.from(nameMap.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            
            currentLeaderboard = finalScores;
            debugLog(`🌐 ✅ Loaded ${currentLeaderboard.length} scores from persistent storage`);
        } else {
            currentLeaderboard = [];
            debugLog('🏆 No local data found, starting with empty leaderboard');
        }
        
        leaderboardLoaded = true;
        updateLeaderboardDisplay();
        return currentLeaderboard;
        
    } catch (error) {
        debugWarn(`🌐 ⚠️ Failed to load persistent leaderboard: ${error.message}`);
        debugLog('🏆 Starting with empty leaderboard');
        currentLeaderboard = [];
        leaderboardLoaded = true;
        updateLeaderboardDisplay();
        return currentLeaderboard;
    }
}

// Save leaderboard to persistent localStorage
async function saveOnlineLeaderboard(leaderboard) {
    try {
        debugLog(`🌐 💾 Saving ${leaderboard.length} scores to persistent storage`);
        debugLog('Scores being saved:', leaderboard);
        
        // Save to localStorage for persistence across sessions
        localStorage.setItem('ballDefenderPersistentLeaderboard', JSON.stringify(leaderboard));
        
        // Verify it was saved
        const verification = localStorage.getItem('ballDefenderPersistentLeaderboard');
        if (verification) {
            debugLog('✅ Verified localStorage save successful');
        } else {
            console.error('❌ localStorage save verification failed!');
        }
        
        currentLeaderboard = leaderboard;
        updateLeaderboardDisplay();
        
        debugLog('🌐 ✅ Leaderboard saved to persistent storage');
        debugLog('🏆 Updated leaderboard:', leaderboard.slice(0, 5).map(s => `${s.name}: ${s.score}`).join(', '));
        
        return true;
        
    } catch (error) {
        debugWarn(`🌐 ⚠️ Failed to save persistent leaderboard: ${error.message}`);
        currentLeaderboard = leaderboard;
        updateLeaderboardDisplay();
        return false;
    }
}

function getLeaderboard() {
    // Determine current mode - check multiple sources
    let currentMode = null;
    if (window.currentGameMode?.id) {
        currentMode = window.currentGameMode.id;
    } else if (window.selectedGameMode) {
        currentMode = window.selectedGameMode;
    } else {
        // Default to original mode if no mode is explicitly set
        currentMode = 'original';
    }
    
    // Use mode-specific scores if available
    if (window.getModeScores && currentMode) {
        const modeScores = window.getModeScores(currentMode);
        debugLog(`🏆 ${currentMode} leaderboard: ${modeScores.length} entries`);
        return modeScores;
    }
    
    // Fallback to legacy leaderboard
    debugLog(`🏆 Fallback leaderboard: ${currentLeaderboard.length} entries`);
    return currentLeaderboard;
}

function saveLeaderboard(leaderboard) {
    // Save both locally and online
    currentLeaderboard = leaderboard;
    saveOnlineLeaderboard(leaderboard); // Async save to online storage
    
    // ALSO save to mode-specific storage
    const currentMode = window.currentGameMode?.id || window.selectedGameMode || 'original';
    if (window.addScoreAndWrite) {
        // Use the working-gist-writer system for mode-specific storage
        debugLog(`💾 Saving leaderboard to mode-specific storage (${currentMode})`);
        // Note: addScoreAndWrite expects individual scores, but we're saving the full leaderboard
        // The working-gist-writer should handle this automatically when scores are added
    }
}

// ⚠️⚠️⚠️ CRITICAL LEADERBOARD CODE - DO NOT MODIFY ⚠️⚠️⚠️
// ============================================================
// THIS FUNCTION IS CRITICAL FOR LEADERBOARD RECORDING
// ANY CHANGES WILL BREAK HIGH SCORE SUBMISSION TO SUPABASE
// 
// Dependencies:
// - window.addToSupabaseLeaderboard (from simple-supabase-leaderboard.js)
// - window.SecureHighScoreAuth (from secure-highscore-auth.js)
// - Mode detection via window.currentGameMode / window.selectedGameMode
// 
// Called by: showNameInputDialog() -> handleSave()
// Last verified working: December 2024
// ============================================================
function addToLeaderboard(playerName, playerScore) {
    // ⚠️⚠️⚠️ CRITICAL: USE PROTECTED LEADERBOARD SUBMISSION ⚠️⚠️⚠️
    if (typeof window.PROTECTED_addToLeaderboard === 'function') {
        debugLog(`🔒 Using protected leaderboard submission: ${playerName} - ${playerScore}`);
        return window.PROTECTED_addToLeaderboard(playerName, playerScore);
    } else if (window.addToSupabaseLeaderboard) {
        debugLog(`🏆 ✨ Fallback: Adding score via Supabase system: ${playerName} - ${playerScore}`);
        // Detect current game mode
        const currentMode = window.currentGameMode?.id || window.selectedGameMode || localStorage.getItem('ballDefender_selectedMode') || 'original';
        debugLog(`🎮 Detected game mode for leaderboard: ${currentMode}`);
        return window.addToSupabaseLeaderboard(playerName, playerScore, currentMode);
    }
    
    // Fallback to legacy system if Supabase leaderboard isn't available
    debugWarn('⚠️ Supabase leaderboard not available, using legacy system');
    const leaderboard = [...currentLeaderboard];
    leaderboard.push({
        name: playerName.substring(0, 18), // Limit to 18 characters
        score: playerScore,
        date: new Date().toISOString()
    });
    
    // Sort by score (highest first) and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    const topLeaderboard = leaderboard.slice(0, 10);
    
    debugLog(`🏆 ✨ New high score added (legacy): ${playerName} - ${playerScore}`);
    saveLeaderboard(topLeaderboard);
    
    return topLeaderboard;
}

function isHighScore(playerScore) {
    const leaderboard = getLeaderboard();
    debugLog(`🔍 isHighScore check: score=${playerScore}, leaderboard has ${leaderboard.length} entries`);
    if (leaderboard.length > 0) {
        debugLog(`🔍 Lowest score in leaderboard: ${leaderboard[leaderboard.length - 1].score}`);
    }
    
    // If leaderboard is empty or has less than 15 entries, it's definitely a high score
    if (leaderboard.length === 0) {
        debugLog(`✅ High score detected: leaderboard is empty`);
        return true;
    }
    
    if (leaderboard.length < 15) {
        debugLog(`✅ High score detected: leaderboard has only ${leaderboard.length} entries (need 15 for full board)`);
        return true;
    }
    
    // Check if score beats the lowest score in top 15
    const lowestScore = leaderboard[Math.min(14, leaderboard.length - 1)].score;
    const isHigh = playerScore > lowestScore;
    debugLog(`${isHigh ? '✅' : '❌'} High score check: ${playerScore} > ${lowestScore} = ${isHigh} (top 15 check)`);
    return isHigh;
}

function updateLeaderboardDisplay() {
    const leaderboard = getLeaderboard();
    debugLog('🖥️ updateLeaderboardDisplay called, leaderboard data:', leaderboard);
    const leaderboardElement = document.getElementById('leaderboard');
    
    if (!leaderboardElement) {
        debugWarn('Leaderboard element not found');
        return;
    }
    
    leaderboardElement.innerHTML = '';
    
    // Ensure we have exactly 10 entries for arcade look
    const displayEntries = [...leaderboard];
    while (displayEntries.length < 10) {
        displayEntries.push({ name: '---', score: 0, date: new Date().toISOString() });
    }
    
    displayEntries.slice(0, 10).forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        
        // Format date to M/D/YY (compact format with year)
        let formattedDate = '--/--/--';
        if (entry.name !== '---' && entry.date) {
            try {
                const date = new Date(entry.date);
                if (!isNaN(date.getTime())) {
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
                    formattedDate = `${month}/${day}/${year}`;
                }
            } catch (e) {
                debugWarn('Date parsing error:', entry.date, e);
                formattedDate = '--/--/--';
            }
        }
        
        entryDiv.innerHTML = `
            <span class="leaderboard-rank">${index + 1}.</span>
            <span class="leaderboard-date">${formattedDate}</span>
            <span class="leaderboard-name">${entry.name}</span>
            <span class="leaderboard-score">${entry.score === 0 && entry.name === '---' ? '-----' : entry.score.toLocaleString()}</span>
        `;
        
        leaderboardElement.appendChild(entryDiv);
    });
}

// ⚠️⚠️⚠️ CRITICAL LEADERBOARD CODE - DO NOT MODIFY ⚠️⚠️⚠️
// ============================================================
// THIS FUNCTION SHOWS THE HIGH SCORE NAME INPUT DIALOG
// Modifying this will break the high score submission flow
// Called by: gameOver() when score qualifies for leaderboard
// ============================================================
function showNameInputDialog(playerScore) {
    debugLog(`📝 showNameInputDialog called with score: ${playerScore}`);
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'name-input-modal';
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'name-input-dialog';
    
    dialog.innerHTML = `
        <div class="name-input-title">New High Score!</div>
        <div class="name-input-score">${playerScore}</div>
        <input type="text" class="name-input-field" placeholder="Enter your name" maxlength="18" autocomplete="off">
        <div class="name-input-buttons">
            <button class="name-input-btn primary">Save Score</button>
            <button class="name-input-btn secondary">Skip</button>
        </div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    debugLog(`📝 Name input modal added to DOM. Modal classes: ${modal.className}`);
    debugLog(`📝 Modal style display: ${getComputedStyle(modal).display}`);
    
    const nameInput = dialog.querySelector('.name-input-field');
    const saveBtn = dialog.querySelector('.primary');
    const skipBtn = dialog.querySelector('.secondary');
    
    // Focus the input
    nameInput.focus();
    
    // Handle save
    const handleSave = () => {
        const playerName = nameInput.value.trim() || 'Anonymous';
        debugLog(`📝 Saving score: ${playerName} - ${playerScore}`);
        addToLeaderboard(playerName, playerScore);
        updateLeaderboardDisplay();
        document.body.removeChild(modal);
        debugLog(`📝 Score saved and modal closed`);
        
        // Show PLAY AGAIN button after score is saved
        if (typeof window.PROTECTED_showPlayAgainButton === 'function') {
            debugLog(`📝 Using protected PLAY AGAIN button display`);
            window.PROTECTED_showPlayAgainButton();
        } else {
            debugLog(`📝 Fallback: Showing PLAY AGAIN button`);
            if (startBtn) {
                startBtn.textContent = 'PLAY AGAIN';
                startBtn.style.display = 'block';
            }
        }
    };
    
    // Handle skip
    const handleSkip = () => {
        document.body.removeChild(modal);
        
        // Show PLAY AGAIN button even when skipping
        if (typeof window.PROTECTED_showPlayAgainButton === 'function') {
            debugLog(`📝 Skip: Using protected PLAY AGAIN button display`);
            window.PROTECTED_showPlayAgainButton();
        } else {
            debugLog(`📝 Skip: Fallback showing PLAY AGAIN button`);
            if (startBtn) {
                startBtn.textContent = 'PLAY AGAIN';
                startBtn.style.display = 'block';
            }
        }
    };
    
    // Event listeners
    saveBtn.addEventListener('click', handleSave);
    skipBtn.addEventListener('click', handleSkip);
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleSkip();
        }
    });
}

// Initialize leaderboard
let leaderboard = getLeaderboard();
let highScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
let animationId;
let ballCount = 1;
window.ballCount = ballCount;  // Expose for detonator system
// Removed ballsRemaining - using unlimited balls system

// Progression & Prestige System
let experience = 0;
let playerLevel = 1;
let prestigeLevel = 0;
let skillPoints = 0;
let streak = 0;
let maxStreak = 0;

// Variable Reward System
let bonusMultiplier = 1;
let luckyStreak = 0;
let nextRewardThreshold = 100;

// Ball powerup tracking - consistent system
let nextScorePowerup = 500; // Next score milestone for +1 ball
let rowsSpawned = 0; // Track rows spawned to trigger powerup
let firstSixRowPowerupGiven = false; // Track if we've given the first 6-row powerup
const ROWS_FOR_FIRST_POWERUP = 6; // Give first powerup after 6 rows

// Block speed configuration
let blockSpeedMultiplier = 1.0; // Relative speed multiplier for block movement

/**
 * BLOCK SPEED RULES AND QUANTIFICATION:
 * 
 * Base Speed Formula: (0.03 + (scoreTier * 0.006)) * 3) * multiplier (10% of old increase)
 * 
 * Speed Progression (Much more gradual):
 * - Score 0-999:    0.09 pixels/frame * multiplier (3x original slow speed)
 * - Score 1000-1999: 0.108 pixels/frame * multiplier (+0.018 instead of +0.18)
 * - Score 2000-2999: 0.126 pixels/frame * multiplier 
 * - Score 3000-3999: 0.144 pixels/frame * multiplier
 * - And so on... (+0.018 pixels/frame per 1000 points, 10x slower increase)
 * 
 * UI Multiplier Range: 0.1x to 3.0x
 * - 1.0x = Normal game speed (what was previously 3x speed)
 * - 0.5x = Half speed for easier gameplay
 * - 2.0x = Double speed for harder gameplay
 * 
 * At 60 FPS, starting speed of 0.09 pixels/frame = 5.4 pixels/second
 */

// Flow State Mechanics
let difficultyRating = 1.0;
let playerSkillRating = 1.0;
let perfectShotCount = 0;
let recentPerformance = [];

// Initialize leaderboard display
// Load online leaderboard on startup
loadOnlineLeaderboard().then(() => {
    debugLog('🏆 Leaderboard initialization complete');
}).catch(error => {
    debugWarn('🏆 Leaderboard initialization failed, using fallback');
});

// These will be set after canvas is initialized
let BALL_START_X;
let BALL_START_Y;

const balls = [];
window.balls = balls;  // Expose for detonator system
const blocks = [];
window.blocks = blocks;  // Expose for detonator system
const powerups = [];
const BLOCKS_PER_ROW = 20; // Double the blocks with half width
let BLOCK_WIDTH;
const BLOCK_HEIGHT = 30;
const BLOCK_PADDING = 6;
const BLOCK_START_Y = 40; // Start blocks closer to top for more vertical space
let BLOCK_START_X;

// Function to initialize game constants that depend on canvas
function initializeGameConstants() {
    if (!canvas) return;
    BALL_START_X = canvas.width / 2;
    BALL_START_Y = canvas.height - 20;
    BLOCK_WIDTH = Math.floor((canvas.width - 60) / BLOCKS_PER_ROW);
    BLOCK_START_X = (canvas.width - (BLOCKS_PER_ROW * BLOCK_WIDTH)) / 2;
}

let isAiming = false;
let aimStartX = 0;
let aimStartY = 0;
let aimEndX = 0;
let aimEndY = 0;
let turnInProgress = false;  // Tracks if a turn is active
let baseBallCount = 1;  // Permanent base number of balls per shot
let ballsForNextShot = 1;  // How many balls to shoot next turn
let nextBallStartX = BALL_START_X;  // Where the next turn's ball should start
let firstBallOfTurn = true;  // Track if this is the first ball hitting bottom
let launchIndex = 0;

// Expose turn management variables for detonator system
window.turnInProgress = turnInProgress;
window.baseBallCount = baseBallCount;
window.ballsForNextShot = ballsForNextShot;
window.firstBallOfTurn = firstBallOfTurn;
let levelTransitioning = false;
let lastRowSpawnTime = 0;  // Track when we last spawned a new row
let rowSpawnInterval = 5000; // 5 seconds between new rows (will get faster)

// ASMR-Based Pleasure Audio Engine - Designed for Maximum Dopamine Response
class GameAudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.masterCompressor = null;  // Master bus compressor
        this.masterLimiter = null;     // Master bus limiter
        this.makeupGain = null;        // Makeup gain after compression
        this.impactGain = null;
        this.ambianceGain = null;
        this.asmrGain = null;
        this.initialized = false;
        
        // Pleasure-focused audio properties
        this.satisfactionLevel = 0; // Builds over time for bigger releases
        this.rewardAnticipation = 0; // Creates dopamine during buildup
        this.lastImpactTime = 0;
        this.impactChain = 0; // Consecutive impacts = more satisfaction
        
        // ASMR and binaural components
        this.binauralPanner = null;
        this.asmrEffects = new Map();
        this.pleasureSamples = new Map();
        
        // Real audio sample system
        this.sampleLibrary = new Map();
        this.loadingPromises = [];
        this.realSamplePaths = {
            // ASMR and pleasure sounds - you can replace these with actual audio files
            'soft_impact': './audio/soft_impact.wav',
            'satisfying_pop': './audio/satisfying_pop.wav',
            'gentle_chime': './audio/gentle_chime.wav',
            'warm_click': './audio/warm_click.wav',
            'velvet_crush': './audio/velvet_crush.wav',
            'crystal_ting': './audio/crystal_ting.wav',
            'bubble_pop': './audio/bubble_pop.wav',
            'silk_rustle': './audio/silk_rustle.wav',
            'reward_chime': './audio/reward_chime.wav',
            'completion_breath': './audio/completion_breath.wav',
            'perfect_harmony': './audio/perfect_harmony.wav',
            // Drum samples
            'open_hihat': './audio/open-hihat.wav',
            // Jazz drum kit samples
            'jazz_kick_1': './audio/JK_BD_02.wav',
            'jazz_kick_2': './audio/JK_BD_06.wav',
            'jazz_brush_1': './audio/JK_BRSH_01.wav',
            'jazz_brush_2': './audio/JK_BRSH_02.wav',
            'jazz_hihat_1': './audio/JK_HH_01.wav',
            'jazz_hihat_2': './audio/JK_HH_02.wav',
            'jazz_tom_1': './audio/JK_PRC_03.wav',
            'jazz_tom_2': './audio/JK_PRC_04.wav',
            'jazz_tom_3': './audio/JK_PRC_05.wav',
            'jazz_perc_1': './audio/JK_PRC_06.wav',
            'jazz_perc_2': './audio/JK_PRC_09.wav',
            'jazz_perc_3': './audio/JK_PRC_10.wav',
            'jazz_snare_1': './audio/JK_SNR_01.wav',
            'jazz_snare_2': './audio/JK_SNR_02.wav',
            'jazz_snare_3': './audio/JK_SNR_03.wav',
            'jazz_snare_4': './audio/JK_SNR_04.wav',
            'jazz_snare_5': './audio/JK_SNR_07.wav',
            // Virtuosity Drums - Professional snare rolls with velocity layers
            'virt_snare_roll_1': './audio/kickmic/snare/kickmic_snare_roll_vl1.wav',
            'virt_snare_roll_2': './audio/kickmic/snare/kickmic_snare_roll_vl3.wav',
            'virt_snare_roll_3': './audio/kickmic/snare/kickmic_snare_roll_vl5.wav',
            'virt_snare_off_1': './audio/kickmic/snareoff/kickmic_snareoff_roll_vl2.wav',
            'virt_snare_off_2': './audio/kickmic/snareoff/kickmic_snareoff_roll_vl4.wav',
            'virt_lofi_roll_1': './audio/lofi/snare/lofi_snare_roll_vl1.wav',
            'virt_lofi_roll_2': './audio/lofi/snare/lofi_snare_roll_vl3.wav',
            'virt_lofi_roll_3': './audio/lofi/snare/lofi_snare_roll_vl5.wav',
            // Pro Kick Drums (velocity layers)
            'pro_kick_soft': './audio/kickmic/kick/kickmic_kick_snon_vl1_rr1.flac',
            'pro_kick_med': './audio/kickmic/kick/kickmic_kick_snon_vl2_rr1.flac',
            'pro_kick_hard': './audio/kickmic/kick/kickmic_kick_snon_vl3_rr1.flac',
            'pro_kick_max': './audio/kickmic/kick/kickmic_kick_snon_vl4_rr1.flac',
            // Pro Snare Center Hits
            'pro_snare_soft': './audio/kickmic/snare/kickmic_snare_center_vl1.flac',
            'pro_snare_med': './audio/kickmic/snare/kickmic_snare_center_vl8.flac',
            'pro_snare_hard': './audio/kickmic/snare/kickmic_snare_center_vl16.flac',
            'pro_snare_max': './audio/kickmic/snare/kickmic_snare_center_vl24.flac',
            // Pro Snare Rimshots
            'pro_rimshot_1': './audio/kickmic/snare/kickmic_snare_rimshot_vl4.flac',
            'pro_rimshot_2': './audio/kickmic/snare/kickmic_snare_rimshot_vl8.flac',
            'pro_rimshot_3': './audio/kickmic/snare/kickmic_snare_rimshot_vl12.flac',
            // Pro Hi-Hats
            'pro_hh_closed_soft': './audio/kickmic/hh/kickmic_hh_closed_vl1_rr1.flac',
            'pro_hh_closed_hard': './audio/kickmic/hh/kickmic_hh_closed_vl4_rr1.flac',
            'pro_hh_open_soft': './audio/kickmic/hh/kickmic_hh_open_vl1_rr1.flac',
            'pro_hh_open_hard': './audio/kickmic/hh/kickmic_hh_open_vl3_rr1.flac',
            'pro_hh_pedal': './audio/kickmic/hh/kickmic_hh_pedal_vl2_rr1.flac',
            'pro_hh_splash': './audio/kickmic/hh/kickmic_hh_splash_rr1.flac',
            // Pro Crashes
            'pro_crash_soft': './audio/kickmic/crash/kickmic_crash_crash_vl1_rr1.flac',
            'pro_crash_hard': './audio/kickmic/crash/kickmic_crash_crash_vl3_rr1.flac',
            'pro_crash_sizzle': './audio/kickmic/crash/kickmic_crash_sizzle_vl2_rr1.flac',
            // Pro Ride
            'pro_ride_tip': './audio/kickmic/ride/kickmic_ride_ride_vl2_rr1.flac',
            'pro_ride_bell': './audio/kickmic/ride/kickmic_ride_bell_vl2_rr1.flac',
            // Pro Toms
            'pro_htom_soft': './audio/kickmic/htom/kickmic_htom_center_vl4.flac',
            'pro_htom_hard': './audio/kickmic/htom/kickmic_htom_center_vl12.flac',
            'pro_ltom_soft': './audio/kickmic/ltom/kickmic_ltom_center_vl4.flac',
            'pro_ltom_hard': './audio/kickmic/ltom/kickmic_ltom_center_vl12.flac',
            // Piano samples for pitch-shifted chord notes
            'piano_grand_c': './audio/grand-piano-one-shot_175bpm_C_major.wav',
            'piano_roland_c': './audio/roland-grand-piano-one-note-bright_169bpm_C_major.wav',
            'piano_roland_f': './audio/roland-grand-piano-one-note-electric-2_149bpm_F_minor.wav',
            'piano_roland_g': './audio/roland-grand-piano-one-note-grand_111bpm_G_major.wav',
            'piano_single_a': './audio/grand-piano_A.wav'
        };
        
        // Dopamine feedback parameters
        this.anticipationBuildup = 0;
        this.rewardMultiplier = 1;
        this.consecutiveHits = 0;
        this.perfectHitStreak = 0;
        
        this.soundPool = new Map();
        
        // Beat generation system
        this.bpm = 120; // Slower for better groove
        this.beatSubdivision = 16;
        this.swingAmount = 0.08;
        this.glitchHopActive = false;
        this.beatStartTime = 0;
        this.lastScheduledTime = 0;
        
        // Musical progression system (I-V-vi-IV)
        this.currentChordIndex = 0;
        this.chordProgressionActive = false;
        this.beatsPerChord = 16; // Each chord lasts 16 beats (4x longer)
        this.currentBeatInChord = 0;
        
        // Key of C major for now (can be transposed later)
        this.key = 'C';

        // Jazz Solo System - chord data with guide tones and full scales
        // Guide tones are the 3rd and 7th - most important for jazz harmony
        this.chordProgression = [
            {
                name: 'I',
                root: 261.63,  // C4
                notes: [261.63, 329.63, 392.00],  // C E G (chord tones)
                guideTones: [329.63, 493.88],      // E, B (3rd and 7th)
                scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C D E F G A B
                scaleNames: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
            },
            {
                name: 'V',
                root: 392.00,  // G4
                notes: [392.00, 493.88, 587.33],  // G B D (chord tones)
                guideTones: [493.88, 698.46],      // B, F (3rd and 7th - dominant 7th)
                scale: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46], // G A B C D E F (mixolydian)
                scaleNames: ['G', 'A', 'B', 'C', 'D', 'E', 'F']
            },
            {
                name: 'vi',
                root: 440.00,  // A4
                notes: [440.00, 523.25, 659.25],  // A C E (chord tones)
                guideTones: [523.25, 392.00],      // C, G (3rd and 7th - minor 7th)
                scale: [440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99], // A B C D E F G (natural minor)
                scaleNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
            },
            {
                name: 'IV',
                root: 349.23,  // F4
                notes: [349.23, 440.00, 523.25],  // F A C (chord tones)
                guideTones: [440.00, 329.63],      // A, E (3rd and 7th)
                scale: [349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25], // F G A B C D E (lydian)
                scaleNames: ['F', 'G', 'A', 'B', 'C', 'D', 'E']
            }
        ];

        // Mode-specific default chord progressions
        // These match the audio editor defaults for each mode
        this.modeChordProgressions = {
            'original': ['I', 'V', 'vi', 'IV'],      // I-V-vi-IV (C-G-Am-F)
            'ice': ['vi', 'IV', 'I', 'V'],           // vi-IV-I-V (Am-F-C-G)
            'iceFrost': ['vi', 'IV', 'I', 'V'],     // Same as ice
            'ballGoBoom': ['I', 'IV', 'I', 'IV']    // I-IV-I-IV (C-F-C-F)
        };

        // Jazz solo state - for voice leading and melodic continuity
        this.lastSoloNote = 440.00;  // Start on A4
        this.soloDirection = 1;      // 1 = ascending, -1 = descending
        this.phraseNoteCount = 0;    // Count notes in current phrase
        this.soloRange = { low: 261.63, high: 1046.50 }; // C4 to C6
        
        // Musical timing
        this.nextChordChangeTime = 0;
        this.basslineGain = null;
        this.chordGain = null;
        
        // Progression counter for bass layers
        this.progressionCount = 0; // Track how many times we've been through the progression
        
        // Hi-hat interactive timing system
        this.hiHatSlotsPerChord = 32; // 32 hi-hat opportunities per chord
        this.currentChordStartTime = 0; // When current chord started
        this.hiHatGain = null;
        this.quantizeWindow = 0.1; // 100ms quantization window (±50ms)
        
        // Jazz drum solo system
        this.jazzDrumGain = null;
        this.recentHits = []; // Track recent hits for musical phrasing
        this.lastDrumType = null; // Avoid repeating same drum
        this.soloIntensity = 0; // Current solo energy level
        this.swingAmount = 0.1; // Jazz swing timing
        
        // Jazz drum kit types
        this.jazzDrums = {
            kick: { frequency: 60, decay: 0.4 },
            snare: { frequency: 200, decay: 0.2 },
            rimshot: { frequency: 800, decay: 0.1 },
            crash: { frequency: 2000, decay: 1.0 },
            ride: { frequency: 3000, decay: 0.3 },
            tom1: { frequency: 150, decay: 0.3 },
            tom2: { frequency: 120, decay: 0.35 },
            splash: { frequency: 4000, decay: 0.6 }
        };

        // Chord data for loading saved progressions from audio editor
        // Scale degrees 1-7 map to these chord objects
        this.chordDataLookup = {
            1: { name: 'I', root: 261.63, notes: [261.63, 329.63, 392.00], guideTones: [329.63, 493.88], scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88] }, // C major
            2: { name: 'ii', root: 293.66, notes: [293.66, 349.23, 440.00], guideTones: [349.23, 523.25], scale: [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] }, // D minor
            3: { name: 'iii', root: 329.63, notes: [329.63, 392.00, 493.88], guideTones: [392.00, 587.33], scale: [329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33] }, // E minor
            4: { name: 'IV', root: 349.23, notes: [349.23, 440.00, 523.25], guideTones: [440.00, 329.63], scale: [349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25] }, // F major
            5: { name: 'V', root: 392.00, notes: [392.00, 493.88, 587.33], guideTones: [493.88, 698.46], scale: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46] }, // G major (mixolydian)
            6: { name: 'vi', root: 440.00, notes: [440.00, 523.25, 659.25], guideTones: [523.25, 392.00], scale: [440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99] }, // A minor
            7: { name: 'vii°', root: 493.88, notes: [493.88, 587.33, 698.46], guideTones: [587.33, 440.00], scale: [493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00] } // B diminished
        };

        // Numeral to degree lookup for mode progressions
        this.numeralToDegree = {
            'I': 1, 'ii': 2, 'iii': 3, 'IV': 4, 'V': 5, 'vi': 6, 'vii°': 7
        };

        // ========================================
        // STEP SEQUENCER SYSTEM (from audio editor)
        // ========================================
        this.stepSequencerEnabled = false;
        this.stepSequencerActive = false;
        this.currentStep = 0;
        this.totalSteps = 768; // 3 progressions × 4 chords × 64 steps
        this.stepsPerChord = 64; // 16 beats × 4 subdivisions
        this.stepsPerProgression = 256; // 4 chords × 64 steps

        // Track patterns loaded from audio editor
        this.sequencerTracks = {
            subBass: { steps: [], activeOsc: null, sculptor: null },
            mainBass: { steps: [], activeOsc: null, sculptor: null },
            highBass: { steps: [], activeOsc: null, sculptor: null },
            sidechain: { steps: [] },
            chordPad: { steps: [], activeNotes: [], sculptor: null },
            arp: { steps: [], sculptor: null }
        };

        // Arpeggiator settings (loaded from audio editor)
        this.arpSettings = {
            pattern: [0, 2, 1, 2, 0, 1, 2, 1],  // Default: up-down pattern
            patternName: 'Up-Down',
            octaveShift: 1,       // How many octaves up (0, 1, or 2)
            rate: 2,              // Steps per note (2 = 8th notes)
            decay: 0.15,          // Note decay time in seconds
            filterFreq: 1000,     // Highpass filter frequency
            volume: 0.25          // Relative volume
        };

        // Step timing
        this.stepStartTime = 0;
        this.nextStepTime = 0;
        this.stepSchedulerId = null;

        // Loop bounds (loaded from audio editor)
        this.loopStart = 0;      // Default: start of timeline
        this.loopEnd = 768;      // Default: end of timeline (will loop entire thing)

        // Mixdown audio playback (pre-rendered audio from audio editor)
        this.mixdownAudioBuffer = null;
        this.mixdownSource = null;
        this.mixdownGain = null;
        this.mixdownPlaying = false;
        this.mixdownDuration = 0;
        this.mixdownBpm = 110;
    }

    // Set chord progression based on game mode (default if nothing saved)
    setModeProgression(mode) {
        const progressionNumerals = this.modeChordProgressions[mode] || this.modeChordProgressions['original'];

        // Convert numerals to full chord data
        this.chordProgression = progressionNumerals.map(numeral => {
            const degree = this.numeralToDegree[numeral] || 1;
            return this.chordDataLookup[degree];
        });

        debugLog(`🎵 Set ${mode} progression: ${progressionNumerals.join('-')}`);
    }

    // Load saved pattern from audio editor (localStorage) - FULL integration
    loadSavedProgression(mode) {
        // First, set the default progression for this mode
        this.setModeProgression(mode);

        // Map game mode IDs to audio editor mode IDs
        const modeMapping = {
            'iceFrost': 'ice',
            'ice': 'ice',
            'original': 'original',
            'ballGoBoom': 'ballGoBoom'
        };
        const editorMode = modeMapping[mode] || mode;
        const storageKey = 'ballDefender_audioPattern_' + editorMode;

        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) {
                return false;
            }

            const data = JSON.parse(saved);
            let loaded = false;

            // Load chord progression
            if (data.chordProgression && Array.isArray(data.chordProgression)) {
                const newProgression = data.chordProgression.map(degree => {
                    return this.chordDataLookup[degree] || this.chordDataLookup[1];
                });
                this.chordProgression = newProgression;
                loaded = true;
            }

            // Load BPM
            if (data.bpm && typeof data.bpm === 'number') {
                this.bpm = data.bpm;
            }

            // Load track patterns for step sequencer
            if (data.tracks && typeof data.tracks === 'object') {
                let tracksLoaded = 0;
                const trackNames = ['subBass', 'mainBass', 'highBass', 'sidechain', 'chordPad', 'arp'];

                trackNames.forEach(trackId => {
                    if (data.tracks[trackId] && data.tracks[trackId].steps) {
                        this.sequencerTracks[trackId].steps = [...data.tracks[trackId].steps];
                        tracksLoaded++;
                    }
                });

                if (tracksLoaded > 0) {
                    this.stepSequencerEnabled = true;
                }
                loaded = true;
            }

            // Load arpeggiator settings
            if (data.arpSettings) {
                if (data.arpSettings.pattern && Array.isArray(data.arpSettings.pattern)) {
                    this.arpSettings.pattern = [...data.arpSettings.pattern];
                }
                if (data.arpSettings.patternName) {
                    this.arpSettings.patternName = data.arpSettings.patternName;
                }
                if (data.arpSettings.octaveShift !== undefined) {
                    this.arpSettings.octaveShift = data.arpSettings.octaveShift;
                }
                if (data.arpSettings.rate !== undefined) {
                    this.arpSettings.rate = data.arpSettings.rate;
                }
                if (data.arpSettings.decay !== undefined) {
                    this.arpSettings.decay = data.arpSettings.decay;
                }
                if (data.arpSettings.filterFreq !== undefined) {
                    this.arpSettings.filterFreq = data.arpSettings.filterFreq;
                }
                if (data.arpSettings.volume !== undefined) {
                    this.arpSettings.volume = data.arpSettings.volume;
                }
                loaded = true;
            }

            // Load sculptor settings for each track
            if (data.tracks && typeof data.tracks === 'object') {
                const trackNames = ['subBass', 'mainBass', 'highBass', 'chordPad', 'arp'];
                let sculptorLoaded = 0;

                trackNames.forEach(trackId => {
                    if (data.tracks[trackId] && data.tracks[trackId].sculptor) {
                        this.sequencerTracks[trackId].sculptor = { ...data.tracks[trackId].sculptor };
                        sculptorLoaded++;
                    }
                });

            }

            // Load loop bounds from audio editor
            if (typeof data.loopStart === 'number' && typeof data.loopEnd === 'number') {
                this.loopStart = data.loopStart;
                this.loopEnd = data.loopEnd;
            } else {
                // Default to looping entire timeline if no loop bounds saved
                this.loopStart = 0;
                this.loopEnd = this.totalSteps;
            }

            return loaded;
        } catch (e) {
            debugWarn('Could not load saved pattern:', e);
        }
        return false;
    }

    // Load pre-rendered mixdown audio - uses audio editor (localStorage) for ballGoBoom/ice, WAV for original
    async loadMixdownAudio(mode) {
        // All modes use audio editor (localStorage) instead of bundled WAV
        const useAudioEditor = ['ballGoBoom', 'ice', 'iceFrost', 'original'];

        // Map mode IDs to WAV file paths in the audio folder (only used for original mode)
        const modeWavFiles = {
            'original': './audio/original-mixdown.wav'
        };

        // PRIORITY 1: For ballGoBoom and ice modes, skip WAV and use audio editor
        if (!useAudioEditor.includes(mode)) {
            const wavPath = modeWavFiles[mode];
            if (wavPath) {
                debugLog(`🔍 Looking for mixdown WAV: ${wavPath}`);
                try {
                    const response = await fetch(wavPath);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        this.mixdownAudioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                        this.mixdownDuration = this.mixdownAudioBuffer.duration;
                        debugLog(`✅ Loaded mixdown WAV file: ${wavPath} (${this.mixdownDuration.toFixed(1)}s)`);
                        return true;
                    }
                } catch (e) {
                    debugLog(`📁 WAV file not found: ${wavPath} - checking localStorage...`);
                }
            }
        } else {
            debugLog(`🎛️ Mode ${mode} uses audio editor - checking localStorage...`);
        }

        // PRIORITY 2: Load from localStorage (audio editor)
        const modeMapping = {
            'iceFrost': 'ice',
            'ice': 'ice',
            'original': 'original',
            'ballGoBoom': 'ballGoBoom'
        };
        const editorMode = modeMapping[mode] || mode;
        const storageKey = `ballDefender_mixdown_${editorMode}`;

        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) {
                debugLog(`🎵 No mixdown found for ${mode} - using synth`);
                return false;
            }

            debugLog(`✓ Found mixdown in localStorage (${(saved.length / 1024).toFixed(1)} KB)`);

            const data = JSON.parse(saved);
            if (!data.audioBase64) {
                return false;
            }

            // Decode base64 to audio buffer
            const response = await fetch(data.audioBase64);
            const arrayBuffer = await response.arrayBuffer();
            this.mixdownAudioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.mixdownDuration = data.duration || this.mixdownAudioBuffer.duration;
            this.mixdownBpm = data.bpm || 110;
            this.loopStart = data.loopStart || 0;
            this.loopEnd = data.loopEnd || 768;

            // Load chord progression from mixdown data (synced with what was rendered)
            if (data.chordProgression && Array.isArray(data.chordProgression)) {
                const newProgression = data.chordProgression.map(degree => {
                    return this.chordDataLookup[degree] || this.chordDataLookup[1];
                });
                this.chordProgression = newProgression;
                debugLog(`🎵 Loaded chord progression from mixdown: ${data.chordProgression.join('-')}`);
            }

            // Load arp settings from mixdown data
            if (data.arpSettings) {
                if (data.arpSettings.pattern) this.arpSettings.pattern = [...data.arpSettings.pattern];
                if (data.arpSettings.patternName) this.arpSettings.patternName = data.arpSettings.patternName;
                if (data.arpSettings.octaveShift !== undefined) this.arpSettings.octaveShift = data.arpSettings.octaveShift;
                if (data.arpSettings.rate !== undefined) this.arpSettings.rate = data.arpSettings.rate;
                if (data.arpSettings.decay !== undefined) this.arpSettings.decay = data.arpSettings.decay;
                if (data.arpSettings.filterFreq !== undefined) this.arpSettings.filterFreq = data.arpSettings.filterFreq;
                if (data.arpSettings.volume !== undefined) this.arpSettings.volume = data.arpSettings.volume;
                debugLog(`🎵 Loaded arp settings from mixdown: ${data.arpSettings.patternName || 'custom'}`);
            }

            debugLog(`✅ Mixdown audio loaded from localStorage (${this.mixdownDuration.toFixed(1)}s)`);

            return true;
        } catch (e) {
            debugWarn('Could not load mixdown audio:', e);
            this.mixdownAudioBuffer = null;
            return false;
        }
    }

    // Start playing the mixdown audio loop
    startMixdownPlayback() {
        if (!this.mixdownAudioBuffer || !this.audioContext) return false;

        // Stop any existing playback
        this.stopMixdownPlayback();

        // Create gain node for volume control
        this.mixdownGain = this.audioContext.createGain();
        this.mixdownGain.gain.setValueAtTime(1.5, this.audioContext.currentTime);
        this.mixdownGain.connect(this.masterGain || this.audioContext.destination);

        // Create source and start looped playback
        this.mixdownSource = this.audioContext.createBufferSource();
        this.mixdownSource.buffer = this.mixdownAudioBuffer;
        this.mixdownSource.loop = true;
        this.mixdownSource.connect(this.mixdownGain);
        this.mixdownSource.start(0);

        this.mixdownPlaying = true;
        this.mixdownStartTime = this.audioContext.currentTime;
        debugLog('🎵 Mixdown playback started');
        return true;
    }

    // Get the current chord based on mixdown or sequencer position
    getCurrentChord() {
        if (this.mixdownPlaying && this.mixdownStartTime) {
            // Calculate position in mixdown
            const elapsed = this.audioContext.currentTime - this.mixdownStartTime;
            const loopPosition = elapsed % this.mixdownDuration;

            // Calculate which chord we're on (4 chords per loop, equal duration)
            const chordDuration = this.mixdownDuration / 4;
            const chordIndex = Math.floor(loopPosition / chordDuration) % this.chordProgression.length;

            return this.chordProgression[chordIndex];
        } else if (this.chordProgressionActive) {
            // Use step sequencer's current chord
            return this.chordProgression[this.currentChordIndex];
        }

        // Default to first chord
        return this.chordProgression[0];
    }

    // Stop mixdown playback
    stopMixdownPlayback() {
        if (this.mixdownSource) {
            try {
                this.mixdownSource.stop();
            } catch (e) {}
            this.mixdownSource.disconnect();
            this.mixdownSource = null;
        }
        if (this.mixdownGain) {
            this.mixdownGain.disconnect();
            this.mixdownGain = null;
        }
        this.mixdownPlaying = false;
    }

    // Set mixdown volume
    setMixdownVolume(volume) {
        if (this.mixdownGain) {
            this.mixdownGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    // ========================================
    // STEP SEQUENCER METHODS
    // ========================================

    startStepSequencer() {
        if (!this.initialized || !this.stepSequencerEnabled) {
            debugLog('🎹 Step sequencer not enabled, using default music system');
            return false;
        }

        if (this.stepSequencerActive || this.mixdownPlaying) return true;

        // If we have mixdown audio, use that instead of real-time synth
        if (this.mixdownAudioBuffer) {
            debugLog('🎵 Using pre-rendered mixdown audio');
            this.startMixdownPlayback();
            return true;
        }

        // Fall back to real-time synthesis
        this.stepSequencerActive = true;
        this.currentStep = this.loopStart; // Start at loop region
        this.stepStartTime = this.audioContext.currentTime;
        this.nextStepTime = this.audioContext.currentTime;
        this.progressionCount = 0;

        debugLog(`🎹 Starting step sequencer at ${this.bpm} BPM`);
        this.scheduleNextStep();
        return true;
    }

    stopStepSequencer() {
        // Stop mixdown if playing
        if (this.mixdownPlaying) {
            this.stopMixdownPlayback();
        }

        this.stepSequencerActive = false;
        if (this.stepSchedulerId) {
            clearTimeout(this.stepSchedulerId);
            this.stepSchedulerId = null;
        }

        // Stop any active oscillators
        Object.values(this.sequencerTracks).forEach(track => {
            if (track.activeOsc) {
                try { track.activeOsc.stop(); } catch(e) {}
                track.activeOsc = null;
            }
            if (track.activeNotes) {
                track.activeNotes.forEach(osc => {
                    try { osc.stop(); } catch(e) {}
                });
                track.activeNotes = [];
            }
        });

        debugLog('🎹 Stopped step sequencer');
    }

    scheduleNextStep() {
        if (!this.stepSequencerActive) return;

        const now = this.audioContext.currentTime;
        const beatDuration = 60 / this.bpm;
        const stepDuration = beatDuration / 4; // 16th notes (4 steps per beat)

        // Get current chord based on step position
        const chordIndex = Math.floor((this.currentStep % this.stepsPerProgression) / this.stepsPerChord) % this.chordProgression.length;
        const currentChord = this.chordProgression[chordIndex];

        // Track chord changes for progression count
        const stepInProgression = this.currentStep % this.stepsPerProgression;
        if (stepInProgression === 0 && this.currentStep > 0) {
            this.progressionCount++;
            debugLog(`🎵 Progression cycle ${this.progressionCount}`);
        }

        // Update current chord index for other systems (player-triggered sounds)
        this.currentChordIndex = chordIndex;
        if ((this.currentStep % this.stepsPerChord) === 0) {
            this.currentChordStartTime = this.nextStepTime;
        }

        // Process each track at this step
        this.processStepForTrack('subBass', currentChord, this.nextStepTime, stepDuration);
        this.processStepForTrack('mainBass', currentChord, this.nextStepTime, stepDuration);
        this.processStepForTrack('highBass', currentChord, this.nextStepTime, stepDuration);
        this.processStepForTrack('chordPad', currentChord, this.nextStepTime, stepDuration);
        this.processStepForTrack('arp', currentChord, this.nextStepTime, stepDuration);
        this.processSidechainStep(this.nextStepTime, stepDuration);

        // Move to next step, loop back when reaching loop end
        this.currentStep++;
        if (this.currentStep >= this.loopEnd) {
            // Loop back to start of loop region
            this.currentStep = this.loopStart;
            debugLog(`🎹 Looping back to step ${this.loopStart}`);
        }

        this.nextStepTime += stepDuration;

        // Schedule next step
        const timeUntilNext = (this.nextStepTime - this.audioContext.currentTime) * 1000;
        this.stepSchedulerId = setTimeout(() => this.scheduleNextStep(), Math.max(0, timeUntilNext - 25));
    }

    processStepForTrack(trackId, chord, startTime, stepDuration) {
        const track = this.sequencerTracks[trackId];
        if (!track.steps || track.steps.length === 0) return;

        const stepValue = track.steps[this.currentStep] || 0;
        if (stepValue === 0) return; // No note at this step

        const baseFreq = chord.root;

        switch (trackId) {
            case 'subBass':
                if (stepValue === 1) { // Attack - start new note
                    this.playSequencerBass(baseFreq / 8, startTime, 'sub', track);
                }
                break;

            case 'mainBass':
                if (stepValue === 1) {
                    this.playSequencerBass(baseFreq / 4, startTime, 'main', track);
                }
                break;

            case 'highBass':
                if (stepValue === 1) {
                    this.playSequencerBass(baseFreq / 2, startTime, 'high', track);
                }
                break;

            case 'chordPad':
                if (stepValue === 1) {
                    this.playSequencerChordPad(chord.notes, startTime, track);
                }
                break;

            case 'arp':
                if (stepValue === 1) {
                    // Arpeggiator uses configurable pattern from arpSettings
                    const arpPattern = this.arpSettings.pattern;
                    const patternIndex = Math.floor(this.currentStep / this.arpSettings.rate) % arpPattern.length;
                    const noteIndex = arpPattern[patternIndex] % chord.notes.length;
                    const arpNote = chord.notes[noteIndex];
                    this.playSequencerArpNote(arpNote, startTime, stepDuration);
                }
                break;
        }
    }

    // Apply sculptor effect chain to an audio source
    // Matches audio-editor.html implementation for consistent sound
    applySculptorChain(source, sculptor, destinationGain, startTime, noteDuration) {
        if (!sculptor) {
            // No sculptor - direct connection with default envelope
            const env = this.audioContext.createGain();
            env.gain.setValueAtTime(0, startTime);
            env.gain.linearRampToValueAtTime(1, startTime + 0.02);
            env.gain.setValueAtTime(1, startTime + Math.max(0.05, noteDuration - 0.05));
            env.gain.linearRampToValueAtTime(0, startTime + noteDuration);
            source.connect(env);
            env.connect(destinationGain);
            return env;
        }

        let currentNode = source;
        const ctx = this.audioContext;
        let filterNode = null;

        // 1. Filter (lowpass, highpass, bandpass) - check enabled flag
        if (sculptor.filter && sculptor.filter.enabled) {
            const filter = ctx.createBiquadFilter();
            filter.type = sculptor.filter.type || 'lowpass';
            filter.frequency.setValueAtTime(sculptor.filter.cutoff || 1000, startTime);
            filter.Q.setValueAtTime(sculptor.filter.resonance || 1, startTime);

            // Filter envelope modulation (key for audio editor sound!)
            if (sculptor.filter.envelope && sculptor.filter.envelope !== 0) {
                const envAmount = sculptor.filter.envelope * 50;
                filter.frequency.setValueAtTime(sculptor.filter.cutoff + envAmount, startTime);
                filter.frequency.exponentialRampToValueAtTime(
                    Math.max(20, sculptor.filter.cutoff),
                    startTime + 0.3
                );
            }

            currentNode.connect(filter);
            currentNode = filter;
            filterNode = filter;
        }

        // 2. Color (distortion/saturation) - check enabled flag and drive > 0
        if (sculptor.color && sculptor.color.enabled && sculptor.color.drive > 0) {
            const waveshaper = ctx.createWaveShaper();

            // Use audio editor's distortion curve (44100 samples, same formula)
            const k = sculptor.color.drive * 4;
            const samples = 44100;
            const curve = new Float32Array(samples);
            for (let i = 0; i < samples; i++) {
                const x = (i * 2) / samples - 1;
                curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
            }
            waveshaper.curve = curve;
            waveshaper.oversample = '4x'; // Higher quality

            currentNode.connect(waveshaper);
            currentNode = waveshaper;
        }

        // 3. Envelope (ADSR applied to gain) - check enabled flag
        const envGain = ctx.createGain();
        if (sculptor.envelope && sculptor.envelope.enabled) {
            const attack = sculptor.envelope.attack || 0.01;
            const decay = sculptor.envelope.decay || 0.1;
            const sustain = sculptor.envelope.sustain || 0.7;
            const release = sculptor.envelope.release || 0.2;

            envGain.gain.setValueAtTime(0, startTime);
            envGain.gain.linearRampToValueAtTime(1, startTime + attack);
            envGain.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);

            // Hold at sustain until release
            const holdEnd = Math.max(startTime + attack + decay + 0.01, startTime + noteDuration - release);
            envGain.gain.setValueAtTime(sustain, holdEnd);

            // Exponential release for smoother fade (matches audio editor)
            envGain.gain.exponentialRampToValueAtTime(0.001, holdEnd + release);
        } else {
            // Default envelope - simple fade in/out
            envGain.gain.setValueAtTime(0, startTime);
            envGain.gain.linearRampToValueAtTime(1, startTime + 0.02);
            envGain.gain.setValueAtTime(1, startTime + Math.max(0.05, noteDuration - 0.05));
            envGain.gain.linearRampToValueAtTime(0, startTime + noteDuration);
        }
        currentNode.connect(envGain);
        currentNode = envGain;

        // 4. LFO modulation - check enabled flag and depth > 0
        if (sculptor.lfo && sculptor.lfo.enabled && sculptor.lfo.depth > 0) {
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();

            lfo.type = sculptor.lfo.shape === 'random' ? 'sawtooth' : (sculptor.lfo.shape || 'sine');
            lfo.frequency.setValueAtTime(sculptor.lfo.rate || 2, startTime);

            const target = sculptor.lfo.target || 'volume';

            if (target === 'volume') {
                // Modulate output volume
                const lfoAmount = (sculptor.lfo.depth / 100) * 0.5;
                lfoGain.gain.setValueAtTime(lfoAmount, startTime);
                lfo.connect(lfoGain);
                lfoGain.connect(envGain.gain);
            } else if (target === 'pitch') {
                // Modulate pitch via detune
                const lfoAmount = (sculptor.lfo.depth / 100) * 50;
                lfoGain.gain.setValueAtTime(lfoAmount, startTime);
                lfo.connect(lfoGain);
                lfoGain.connect(source.detune);
            } else if (target === 'filter' && filterNode) {
                // Modulate filter frequency
                const lfoAmount = (sculptor.lfo.depth / 100) * 500;
                lfoGain.gain.setValueAtTime(lfoAmount, startTime);
                lfo.connect(lfoGain);
                lfoGain.connect(filterNode.frequency);
            }

            lfo.start(startTime);
            lfo.stop(startTime + noteDuration + 1);
        }

        // Connect to destination
        currentNode.connect(destinationGain);
        return currentNode;
    }

    playSequencerBass(frequency, startTime, type, track) {
        if (!this.basslineGain) return;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);

        // Find sustain duration by looking ahead for sustain-end (3)
        const trackId = type === 'sub' ? 'subBass' : type === 'main' ? 'mainBass' : 'highBass';
        let sustainSteps = 1;
        for (let i = this.currentStep + 1; i < this.sequencerTracks[trackId].steps.length; i++) {
            const val = this.sequencerTracks[trackId].steps[i];
            if (val === 2) sustainSteps++;
            else if (val === 3) { sustainSteps++; break; }
            else break;
        }

        const beatDuration = 60 / this.bpm;
        const noteDuration = (beatDuration / 4) * sustainSteps;

        // Volume based on bass type
        const volume = type === 'sub' ? 0.4 : type === 'main' ? 0.3 : 0.2;

        // Get sculptor settings for this track
        const sculptor = this.sequencerTracks[trackId].sculptor;

        // Create volume gain node
        const volumeGain = this.audioContext.createGain();
        volumeGain.gain.setValueAtTime(volume, startTime);

        // Apply sculptor chain if available, otherwise direct connection
        if (sculptor) {
            this.applySculptorChain(osc, sculptor, volumeGain, startTime, noteDuration);
        } else {
            // Default envelope without sculptor
            const env = this.audioContext.createGain();
            env.gain.setValueAtTime(0, startTime);
            env.gain.linearRampToValueAtTime(1, startTime + 0.02);
            env.gain.setValueAtTime(1, startTime + noteDuration - 0.05);
            env.gain.linearRampToValueAtTime(0, startTime + noteDuration);
            osc.connect(env);
            env.connect(volumeGain);
        }

        volumeGain.connect(this.basslineGain);

        osc.start(startTime);
        osc.stop(startTime + noteDuration + 0.1);

        track.activeOsc = osc;
    }

    playSequencerChordPad(notes, startTime, track) {
        if (!this.chordGain) return;

        // Find sustain duration
        let sustainSteps = 1;
        for (let i = this.currentStep + 1; i < this.sequencerTracks.chordPad.steps.length; i++) {
            const val = this.sequencerTracks.chordPad.steps[i];
            if (val === 2) sustainSteps++;
            else if (val === 3) { sustainSteps++; break; }
            else break;
        }

        const beatDuration = 60 / this.bpm;
        const noteDuration = (beatDuration / 4) * sustainSteps;

        // Stop previous notes
        if (track.activeNotes) {
            track.activeNotes.forEach(osc => {
                try { osc.stop(startTime); } catch(e) {}
            });
        }
        track.activeNotes = [];

        // Get sculptor settings for chord pad
        const sculptor = this.sequencerTracks.chordPad.sculptor;
        const volume = 0.08; // Subtle pad

        // Play each note of the chord
        notes.forEach((noteFreq, i) => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(noteFreq, startTime);
            // Slight detune for richness (matches audio editor: -5, 0, +5 cents)
            osc.detune.setValueAtTime((i - 1) * 5, startTime);

            const volumeGain = this.audioContext.createGain();
            volumeGain.gain.setValueAtTime(volume, startTime);

            // Apply sculptor chain if available
            if (sculptor) {
                this.applySculptorChain(osc, sculptor, volumeGain, startTime, noteDuration);
            } else {
                // Default envelope without sculptor
                const env = this.audioContext.createGain();
                env.gain.setValueAtTime(0, startTime);
                env.gain.linearRampToValueAtTime(1, startTime + 0.1);
                env.gain.setValueAtTime(0.8, startTime + noteDuration - 0.2);
                env.gain.linearRampToValueAtTime(0, startTime + noteDuration);
                osc.connect(env);
                env.connect(volumeGain);
            }

            volumeGain.connect(this.chordGain);

            osc.start(startTime);
            osc.stop(startTime + noteDuration + 0.1);

            track.activeNotes.push(osc);
        });
    }

    playSequencerArpNote(frequency, startTime, stepDuration) {
        if (!this.arpGain) return;

        const osc = this.audioContext.createOscillator();
        const decay = this.arpSettings.decay;

        // Sparkly arp sound - sine wave, configurable octave shift
        const octaveMultiplier = Math.pow(2, this.arpSettings.octaveShift);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency * octaveMultiplier, startTime);

        // Get sculptor settings for arp track
        const sculptor = this.sequencerTracks.arp.sculptor;
        const volume = this.arpSettings.volume;

        // Create volume gain
        const volumeGain = this.audioContext.createGain();
        volumeGain.gain.setValueAtTime(volume, startTime);

        // Apply sculptor chain if available
        if (sculptor) {
            this.applySculptorChain(osc, sculptor, volumeGain, startTime, decay);
        } else {
            // Default arp signal chain without sculptor
            const filter = this.audioContext.createBiquadFilter();
            const env = this.audioContext.createGain();

            // Configurable highpass filter
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(this.arpSettings.filterFreq, startTime);
            filter.Q.setValueAtTime(0.5, startTime);

            // Configurable plucky envelope
            env.gain.setValueAtTime(0, startTime);
            env.gain.linearRampToValueAtTime(1, startTime + 0.002);
            env.gain.exponentialRampToValueAtTime(0.001, startTime + decay);

            osc.connect(filter);
            filter.connect(env);
            env.connect(volumeGain);
        }

        volumeGain.connect(this.arpGain);

        osc.start(startTime);
        osc.stop(startTime + decay + 0.05);
    }

    processSidechainStep(startTime, stepDuration) {
        const track = this.sequencerTracks.sidechain;
        if (!track.steps || track.steps.length === 0) return;

        const stepValue = track.steps[this.currentStep] || 0;
        if (stepValue === 0) return;

        // Sidechain creates a ducking effect on bass
        if (this.basslineGain && stepValue === 1) {
            const currentVol = this.basslineGain.gain.value;
            this.basslineGain.gain.setValueAtTime(currentVol, startTime);
            this.basslineGain.gain.linearRampToValueAtTime(currentVol * 0.3, startTime + 0.02);
            this.basslineGain.gain.linearRampToValueAtTime(currentVol, startTime + stepDuration * 0.8);
        }
    }

    async initialize() {
        if (this.initialized) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Master volume control - optimized for pleasure
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.audioContext.currentTime);

        // =============================================
        // MASTER BUS PROCESSING (Final Stage Mastering)
        // =============================================

        // Master Compressor - glues everything together and controls dynamics
        this.masterCompressor = this.audioContext.createDynamicsCompressor();
        this.masterCompressor.threshold.setValueAtTime(-18, this.audioContext.currentTime); // Start compressing at -18dB
        this.masterCompressor.knee.setValueAtTime(6, this.audioContext.currentTime);        // Medium-soft knee
        this.masterCompressor.ratio.setValueAtTime(4, this.audioContext.currentTime);       // 4:1 ratio for good control
        this.masterCompressor.attack.setValueAtTime(0.005, this.audioContext.currentTime);  // 5ms attack - fast enough to catch transients
        this.masterCompressor.release.setValueAtTime(0.15, this.audioContext.currentTime);  // 150ms release - smooth recovery

        // Master Limiter - prevents clipping, acts as a safety net
        this.masterLimiter = this.audioContext.createDynamicsCompressor();
        this.masterLimiter.threshold.setValueAtTime(-3, this.audioContext.currentTime);    // Only catch peaks near 0dB
        this.masterLimiter.knee.setValueAtTime(0, this.audioContext.currentTime);          // Hard knee for limiting
        this.masterLimiter.ratio.setValueAtTime(20, this.audioContext.currentTime);        // High ratio = limiting
        this.masterLimiter.attack.setValueAtTime(0.001, this.audioContext.currentTime);    // 1ms - very fast attack
        this.masterLimiter.release.setValueAtTime(0.05, this.audioContext.currentTime);    // 50ms release

        // Makeup Gain - compensate for compression, ensure good output level
        this.makeupGain = this.audioContext.createGain();
        this.makeupGain.gain.setValueAtTime(1.3, this.audioContext.currentTime);           // ~2.3dB makeup gain

        // Connect master chain: masterGain → compressor → limiter → makeupGain → destination
        this.masterGain.connect(this.masterCompressor);
        this.masterCompressor.connect(this.masterLimiter);
        this.masterLimiter.connect(this.makeupGain);
        this.makeupGain.connect(this.audioContext.destination);
        
        // Pleasure-focused audio channels
        this.impactGain = this.audioContext.createGain();      // Satisfying impact sounds
        this.ambianceGain = this.audioContext.createGain();    // Subtle background ambiance
        this.asmrGain = this.audioContext.createGain();        // ASMR trigger sounds
        
        // Musical channels
        this.basslineGain = this.audioContext.createGain();
        this.chordGain = this.audioContext.createGain();
        this.arpGain = this.audioContext.createGain(); // Separate gain for arpeggiator
        this.hiHatGain = this.audioContext.createGain(); // Hi-hat channel
        this.jazzDrumGain = this.audioContext.createGain(); // Jazz drum solo channel
        this.basslineGain.gain.setValueAtTime(0.69, this.audioContext.currentTime); // Increased by 15%
        this.chordGain.gain.setValueAtTime(0.46, this.audioContext.currentTime); // Increased by 15%
        this.arpGain.gain.setValueAtTime(1.0, this.audioContext.currentTime);
        this.hiHatGain.gain.setValueAtTime(1.0, this.audioContext.currentTime);
        this.jazzDrumGain.gain.setValueAtTime(1.2, this.audioContext.currentTime); // Boosted from 0.8 to 1.2
        this.basslineGain.connect(this.masterGain);
        this.chordGain.connect(this.masterGain);
        this.arpGain.connect(this.masterGain);
        this.hiHatGain.connect(this.masterGain);
        this.jazzDrumGain.connect(this.masterGain);
        
        // Create ASMR-focused effects chain
        await this.createASMREffectsChain();
        
        // Try to load real audio samples first, fallback to synthesized
        await this.loadRealAudioSamples();
        await this.generatePleasureSounds();
        
        // Set volumes for maximum satisfaction
        this.impactGain.gain.setValueAtTime(0.9, this.audioContext.currentTime);
        this.ambianceGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        this.asmrGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
        
        // Generate drum samples for beat system
        await this.generateDrumSamples();
        
        this.initialized = true;
    }
    
    async createASMREffectsChain() {
        // Gentle compressor for smooth, pleasant dynamics
        this.pleasureCompressor = this.audioContext.createDynamicsCompressor();
        this.pleasureCompressor.threshold.setValueAtTime(-12, this.audioContext.currentTime);
        this.pleasureCompressor.knee.setValueAtTime(12, this.audioContext.currentTime); // Soft knee
        this.pleasureCompressor.ratio.setValueAtTime(2, this.audioContext.currentTime); // Gentle ratio
        this.pleasureCompressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
        this.pleasureCompressor.release.setValueAtTime(0.1, this.audioContext.currentTime);
        
        // Binaural panner for 3D ASMR effects
        this.binauralPanner = this.audioContext.createStereoPanner();
        this.binauralPanner.pan.setValueAtTime(0, this.audioContext.currentTime);
        
        // Warm analog-style filter
        this.pleasureFilter = this.audioContext.createBiquadFilter();
        this.pleasureFilter.type = 'lowpass';
        this.pleasureFilter.frequency.setValueAtTime(12000, this.audioContext.currentTime);
        this.pleasureFilter.Q.setValueAtTime(0.5, this.audioContext.currentTime); // Gentle resonance
        
        // Subtle chorus for richness
        this.chorus = await this.createChorus();
        
        // Warm reverb for enveloping feel
        this.pleasureReverb = await this.createPleasureReverb();
        this.reverbWet = this.audioContext.createGain();
        this.reverbWet.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        
        // Removed ASMR delay and tempo-synced delay systems
        
        // Connect ASMR effects chain
        this.impactGain.connect(this.binauralPanner);
        this.asmrGain.connect(this.pleasureFilter);
        this.ambianceGain.connect(this.pleasureFilter);
        
        // Removed ASMR delay routing
        
        // Main pleasant signal path
        this.binauralPanner.connect(this.pleasureCompressor);
        // Removed delay wet connection
        this.pleasureFilter.connect(this.pleasureCompressor);
        
        this.pleasureCompressor.connect(this.chorus);
        this.chorus.connect(this.masterGain);
        this.chorus.connect(this.pleasureReverb);
        this.pleasureReverb.connect(this.reverbWet);
        this.reverbWet.connect(this.masterGain);
    }
    
    async loadRealAudioSamples() {
        // Load real audio files if available
        for (const [soundName, filePath] of Object.entries(this.realSamplePaths)) {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    this.sampleLibrary.set(soundName, audioBuffer);
                    // Successfully loaded real audio sample (no logging needed)
                } else {
                    // Audio file not found - will use synthesized version (no logging needed)
                }
            } catch (error) {
                // Failed to load audio - will use synthesized version (no logging needed)
            }
        }
        debugLog(`Real audio samples loaded: ${this.sampleLibrary.size}/${Object.keys(this.realSamplePaths).length}`);
    }
    
    playRealSample(sampleName, gain = 1.0, playbackRate = 1.0, panValue = 0) {
        // Play real audio sample if available, otherwise fallback to synthesized
        const realSample = this.sampleLibrary.get(sampleName);
        if (realSample) {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const panner = this.audioContext.createStereoPanner();
            
            source.buffer = realSample;
            source.playbackRate.value = playbackRate;
            gainNode.gain.value = gain;
            panner.pan.value = panValue;
            
            source.connect(gainNode);
            gainNode.connect(panner);
            panner.connect(this.asmrGain);
            
            source.start();
            return true; // Real sample played
        }
        return false; // Fall back to synthesized
    }
    
    async createChorus() {
        // Simple gain node to replace delay-based chorus
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
        return gainNode;
    }
    
    async createPleasureReverb() {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * 1.5; // Shorter, warmer reverb
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 1.5); // Gentler decay
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.5;
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }
    
    async createReverb() {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }
    
    // Removed createTempoSyncedDelay function
    
    // Removed updateDelayTime function
    
    // Removed updateDelayTimeByBallCount function
    
    async generatePleasureSounds() {
        // Generate ASMR-focused pleasure sounds designed for dopamine response
        this.pleasureSamples.set('softImpact', await this.createSoftImpact());
        this.pleasureSamples.set('satisfyingPop', await this.createSatisfyingPop());
        this.pleasureSamples.set('gentleChime', await this.createGentleChime());
        this.pleasureSamples.set('warmClick', await this.createWarmClick());
        this.pleasureSamples.set('velvetCrush', await this.createVelvetCrush());
        this.pleasureSamples.set('crystalTing', await this.createCrystalTing());
        this.pleasureSamples.set('bubblePop', await this.createBubblePop());
        this.pleasureSamples.set('silkRustle', await this.createSilkRustle());
        
        // Ambient pleasure tones
        this.pleasureSamples.set('ambientHum', await this.createAmbientHum());
        this.pleasureSamples.set('gentleWaves', await this.createGentleWaves());
    }
    
    async generateDrumSamples() {
        // Initialize drum and bass sample maps
        this.drumSamples = new Map();
        this.bassSamples = new Map();
        
        // Generate kick drum
        const kickBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const kickData = kickBuffer.getChannelData(0);
        for (let i = 0; i < kickData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const env = Math.exp(-t * 50);
            const osc = Math.sin(2 * Math.PI * (60 - t * 40) * t);
            kickData[i] = osc * env * 0.8;
        }
        this.drumSamples.set('kick', kickBuffer);
        
        // Generate snare drum
        const snareBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const snareData = snareBuffer.getChannelData(0);
        for (let i = 0; i < snareData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const env = Math.exp(-t * 15);
            const noise = (Math.random() - 0.5) * 2;
            const tone = Math.sin(2 * Math.PI * 200 * t);
            snareData[i] = (noise * 0.7 + tone * 0.3) * env * 0.6;
        }
        this.drumSamples.set('snare', snareBuffer);
        
        // Generate hi-hat
        const hihatBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const hihatData = hihatBuffer.getChannelData(0);
        for (let i = 0; i < hihatData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const env = Math.exp(-t * 80);
            const noise = (Math.random() - 0.5) * 2;
            hihatData[i] = noise * env * 0.3;
        }
        this.drumSamples.set('hihat', hihatBuffer);
        this.drumSamples.set('openhat', hihatBuffer); // Reuse for now
        
        // Generate bass
        const bassBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const bassData = bassBuffer.getChannelData(0);
        for (let i = 0; i < bassData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const env = Math.exp(-t * 5);
            const osc = Math.sin(2 * Math.PI * 55 * t) + Math.sin(2 * Math.PI * 110 * t) * 0.3;
            bassData[i] = osc * env * 0.7;
        }
        this.bassSamples.set('bass', bassBuffer);
        this.bassSamples.set('sub', bassBuffer);
        
        debugLog('🥁 Generated drum samples for beat system');
        debugLog('🥁 Available drum samples:', Array.from(this.drumSamples.keys()));
        debugLog('🎸 Available bass samples:', Array.from(this.bassSamples.keys()));
    }
    
    // Add custom sample from dropped file
    async addCustomSample(file, sampleName = null) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            const name = sampleName || file.name.split('.')[0];
            
            // Add to appropriate sample map based on name or default to pleasure samples
            if (name.includes('kick') || name.includes('drum')) {
                this.drumSamples.set(name, audioBuffer);
            } else if (name.includes('bass')) {
                this.bassSamples.set(name, audioBuffer);
            } else {
                this.sampleLibrary.set(name, audioBuffer);
            }
            
            debugLog(`✓ Added custom sample: ${name}`);
            return true;
        } catch (error) {
            console.error(`Failed to add custom sample: ${error.message}`);
            return false;
        }
    }
    
    // ASMR-focused pleasure sounds designed for maximum dopamine response
    async createSoftImpact() {
        const length = this.audioContext.sampleRate * 0.4;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate); // Stereo for ASMR
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Soft thump with warm overtones
                const fundamental = Math.sin(2 * Math.PI * 120 * t) * 0.4;
                const warmth = Math.sin(2 * Math.PI * 240 * t) * 0.2;
                const texture = (Math.random() - 0.5) * 0.05; // Subtle texture
                
                // Very gentle envelope
                const envelope = Math.exp(-t * 6) * (1 - Math.exp(-t * 30));
                
                data[i] = (fundamental + warmth + texture) * envelope * 0.6;
            }
        }
        
        return buffer;
    }
    
    async createSatisfyingPop() {
        const length = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Bubble-like pop with satisfying harmonics  
                const pop = Math.sin(2 * Math.PI * 800 * t * Math.exp(-t * 12));
                const sparkle = Math.sin(2 * Math.PI * 2400 * t) * 0.3;
                
                const envelope = Math.exp(-t * 15);
                
                data[i] = (pop + sparkle) * envelope * 0.7;
            }
        }
        
        return buffer;
    }
    
    async createGentleChime() {
        const length = this.audioContext.sampleRate * 1.2;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        // Beautiful harmonic series for satisfaction
        const frequencies = [523, 659, 784, 1047]; // C major chord
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                let sample = 0;
                
                frequencies.forEach((freq, index) => {
                    const amplitude = 0.25 / (index + 1);
                    sample += Math.sin(2 * Math.PI * freq * t) * amplitude;
                });
                
                // Long, satisfying decay
                const envelope = Math.exp(-t * 1.5);
                data[i] = sample * envelope * 0.8;
            }
        }
        
        return buffer;
    }
    
    async createWarmClick() {
        const length = this.audioContext.sampleRate * 0.08;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Warm, woody click
                const click = Math.sin(2 * Math.PI * 600 * t) * 0.6;
                const wood = (Math.random() - 0.5) * 0.2; // Wood texture
                
                const envelope = Math.exp(-t * 25);
                
                data[i] = (click + wood) * envelope * 0.5;
            }
        }
        
        return buffer;
    }
    
    async createVelvetCrush() {
        const length = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Soft crushing texture - very ASMR
                let crunch = 0;
                for (let freq = 200; freq < 2000; freq += 200) {
                    crunch += Math.sin(2 * Math.PI * freq * t) * Math.random() * 0.1;
                }
                
                const envelope = Math.exp(-t * 8);
                data[i] = crunch * envelope * 0.4;
            }
        }
        
        return buffer;
    }
    
    async createCrystalTing() {
        const length = this.audioContext.sampleRate * 0.8;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Crystal-like ringing - very satisfying
                const crystal = Math.sin(2 * Math.PI * 1760 * t) * 0.5; // High A
                const shimmer = Math.sin(2 * Math.PI * 3520 * t) * 0.2;
                
                const envelope = Math.exp(-t * 3);
                data[i] = (crystal + shimmer) * envelope * 0.6;
            }
        }
        
        return buffer;
    }
    
    async createBubblePop() {
        const length = this.audioContext.sampleRate * 0.12;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Perfect bubble pop sound
                const bubble = Math.sin(2 * Math.PI * 1000 * t * Math.exp(-t * 8));
                const envelope = Math.exp(-t * 12);
                
                data[i] = bubble * envelope * 0.7;
            }
        }
        
        return buffer;
    }
    
    async createSilkRustle() {
        const length = this.audioContext.sampleRate * 0.25;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Soft fabric rustle - classic ASMR trigger
                const rustle = (Math.random() - 0.5) * 0.3;
                const filtered = rustle * (1 - t * 2); // High-freq fade
                
                const envelope = Math.exp(-t * 5);
                data[i] = filtered * envelope * 0.3;
            }
        }
        
        return buffer;
    }
    
    async createAmbientHum() {
        const length = this.audioContext.sampleRate * 2.0;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Warm ambient drone
                const hum = Math.sin(2 * Math.PI * 220 * t) * 0.1;
                const breath = Math.sin(2 * Math.PI * 0.3 * t) * 0.05; // Breathing rhythm
                
                data[i] = (hum + breath) * 0.4;
            }
        }
        
        return buffer;
    }
    
    async createGentleWaves() {
        const length = this.audioContext.sampleRate * 3.0;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                
                // Gentle wave-like sound
                let wave = 0;
                for (let harmonic = 1; harmonic < 6; harmonic++) {
                    const freq = 55 * harmonic;
                    const amplitude = 0.1 / harmonic;
                    wave += Math.sin(2 * Math.PI * freq * t + Math.sin(t * 0.5)) * amplitude;
                }
                
                data[i] = wave * 0.2;
            }
        }
        
        return buffer;
    }
    
    // Main pleasure-focused sound playing methods
    playPleasureSound(soundType, intensity = 1.0, pan = 0) {
        // Try to play real sample first, fallback to synthesized
        if (this.playRealSample(soundType, intensity * 0.8, 1.0, pan)) {
            // Real sample played successfully
            this.satisfactionLevel += intensity * 0.15; // Real samples are more satisfying
            return;
        }
        
        // Fallback to synthesized pleasure sound
        const buffer = this.pleasureSamples.get(soundType);
        if (!buffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();
        
        source.buffer = buffer;
        gain.gain.setValueAtTime(intensity * 0.8, this.audioContext.currentTime);
        panner.pan.setValueAtTime(pan, this.audioContext.currentTime);
        
        source.connect(panner);
        panner.connect(gain);
        gain.connect(this.impactGain);
        
        source.start();
        
        // Track satisfaction level
        this.satisfactionLevel += intensity * 0.1;
    }
    
    // Dopamine-focused block hit sound
    playBlockHit(blockHP, consecutiveHits = 0) {
        this.consecutiveHits = consecutiveHits;

        // Choose sound based on HP and chain
        if (blockHP <= 1) {
            // Destruction - most satisfying
            if (SoundMixer.isEnabled('blockDestroy')) {
                this.playPleasureSound('satisfyingPop', 1.0);
                this.playPleasureSound('crystalTing', 0.6, Math.random() * 0.4 - 0.2);
            }
            this.rewardMultiplier += 0.1;
        } else if (blockHP <= 3) {
            // Medium impact
            if (SoundMixer.isEnabled('blockHit')) {
                this.playPleasureSound('warmClick', 0.8);
                this.playPleasureSound('bubblePop', 0.4);
            }
        } else {
            // Light impact
            if (SoundMixer.isEnabled('blockHit')) {
                this.playPleasureSound('softImpact', 0.7);
                this.playPleasureSound('velvetCrush', 0.3);
            }
        }

        // Chain bonus sounds
        if (consecutiveHits > 3 && SoundMixer.isEnabled('chainBonus')) {
            setTimeout(() => {
                this.playPleasureSound('gentleChime', 0.5 + (consecutiveHits * 0.1));
            }, 50);
        }
    }
    
    // UI sounds designed for pleasure
    playUIClick() {
        if (SoundMixer.isEnabled('uiSounds')) {
            this.playPleasureSound('warmClick', 0.6);
        }
    }

    playUIHover() {
        if (SoundMixer.isEnabled('uiSounds')) {
            this.playPleasureSound('silkRustle', 0.3);
        }
    }

    playLaunch() {
        if (!SoundMixer.isEnabled('launch')) return;

        // Original softImpact thump (120 Hz + 240 Hz warmth)
        this.playPleasureSound('softImpact', 0.8);

        // Chord-aware chime - uses current chord instead of fixed C major
        setTimeout(() => {
            this.playChordChime(0.4);
        }, 100);
    }

    // Play a chime using the current chord (same style as gentleChime but follows progression)
    playChordChime(intensity = 1.0) {
        if (!this.audioContext) return;

        const chord = this.getCurrentChord();
        // Transpose chord notes up an octave to match original gentleChime range (C5-C6)
        const frequencies = [
            chord.notes[0] * 2,  // Root up an octave
            chord.notes[1] * 2,  // Third up an octave
            chord.notes[2] * 2,  // Fifth up an octave
            chord.notes[0] * 4   // Root up two octaves
        ];

        const length = this.audioContext.sampleRate * 1.2;
        const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);

            for (let i = 0; i < length; i++) {
                const t = i / this.audioContext.sampleRate;
                let sample = 0;

                frequencies.forEach((freq, index) => {
                    const amplitude = 0.25 / (index + 1);
                    sample += Math.sin(2 * Math.PI * freq * t) * amplitude;
                });

                // Long, satisfying decay (same as original gentleChime)
                const envelope = Math.exp(-t * 1.5);
                data[i] = sample * envelope * 0.8;
            }
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(intensity * 0.5, this.audioContext.currentTime);

        source.connect(gain);
        gain.connect(this.masterGain || this.audioContext.destination);
        source.start();
    }

    playPowerupCollect() {
        if (!SoundMixer.isEnabled('powerup')) return;
        // Very satisfying powerup sound
        this.playPleasureSound('crystalTing', 1.0);
        setTimeout(() => {
            this.playPleasureSound('gentleChime', 0.8);
        }, 100);
        setTimeout(() => {
            this.playPleasureSound('satisfyingPop', 0.6);
        }, 200);
    }

    playLevelComplete() {
        if (!SoundMixer.isEnabled('levelComplete')) return;
        // Ultimate satisfaction
        this.playPleasureSound('gentleChime', 1.0);
        setTimeout(() => {
            this.playPleasureSound('crystalTing', 0.8, -0.3);
        }, 150);
        setTimeout(() => {
            this.playPleasureSound('crystalTing', 0.8, 0.3);
        }, 300);
        setTimeout(() => {
            this.playPleasureSound('satisfyingPop', 0.9);
        }, 450);
        
        this.satisfactionLevel = Math.min(this.satisfactionLevel + 1.0, 5.0);
    }
    
    startAmbientPleasure() {
        // Check mixer setting
        if (!SoundMixer.isEnabled('ambientPleasure')) return;
        // Subtle ambient pleasure sounds
        if (this.initialized) {
            this.playPleasureSound('ambientHum', 0.2);
            
            // Schedule gentle waves
            setTimeout(() => {
                this.playPleasureSound('gentleWaves', 0.15);
            }, 2000);
        }
    }
    
    // Removed updateRhythmLoop function
    
    updateGlitchEffects() {
        const now = this.audioContext.currentTime;
        const beatPhase = (now - this.beatStartTime) % (60 / this.bpm);
        const normalizedPhase = beatPhase / (60 / this.bpm);
        
        // Modulate analog filter cutoff with glitchy patterns
        if (this.analogFilter) {
            const glitchMod = Math.sin(normalizedPhase * Math.PI * 8) * this.glitchIntensity;
            const cutoff = 8000 + (glitchMod * 4000);
            this.analogFilter.frequency.setValueAtTime(Math.max(500, cutoff), now);
        }
        
        // Modulate reverb wetness
        if (this.reverbGain) {
            const reverbMod = Math.sin(normalizedPhase * Math.PI * 4) * 0.1;
            this.reverbGain.gain.setValueAtTime(0.15 + reverbMod, now);
        }
        
        // Removed delay feedback modulation
    }
    
    scheduleGlitchHopTrack() {
        const scheduleAhead = 0.1; // Schedule 100ms ahead
        const now = this.audioContext.currentTime;
        
        while (this.lastScheduledTime < now + scheduleAhead) {
            this.scheduleGlitchHopElements(this.lastScheduledTime);
            this.lastScheduledTime += (60 / this.bpm) / this.beatSubdivision;
        }
        
        if (this.glitchHopActive) {
            setTimeout(() => this.scheduleGlitchHopTrack(), 25);
        }
    }
    
    startGlitchHopTrack() {
        if (!this.audioContext) {
            console.error('❌ AudioContext not initialized - cannot start beats');
            return;
        }
        if (!this.drumSamples || this.drumSamples.size === 0) {
            console.error('❌ No drum samples - cannot start beats');
            return;
        }
        
        this.glitchHopActive = true;
        this.beatStartTime = this.audioContext.currentTime;
        this.lastScheduledTime = this.audioContext.currentTime;
        this.scheduleGlitchHopTrack();
        debugLog('🎵 Started glitch-hop beats at BPM:', this.bpm);
        debugLog('🥁 Drum samples available:', Array.from(this.drumSamples.keys()));
    }
    
    stopGlitchHopTrack() {
        this.glitchHopActive = false;
        debugLog('🎵 Stopped glitch-hop beats');
    }
    
    scheduleGlitchHopElements(time) {
        const beatDuration = 60 / this.bpm;
        const currentBeatInPattern = Math.floor((time - this.beatStartTime) / beatDuration) % 8; // 8-beat glitch-hop patterns
        const subdivision = Math.floor(((time - this.beatStartTime) % beatDuration) / (beatDuration / this.beatSubdivision));
        
        // Apply swing to subdivisions
        const swingAdjustment = this.getSwingAdjustment(subdivision);
        const swungTime = time + swingAdjustment;
        
        // Kick pattern removed
        
        // Snare pattern removed
        
        // Hi-hats removed
        
        // Open hats removed
        
        // Bass pattern - funky glitch-hop bass
        if ([0, 4, 6, 10].includes(subdivision)) {
            const bassNote = this.getGlitchHopBassNote(currentBeatInPattern);
            if (bassNote) {
                this.playPitchedSample('bass', bassNote, swungTime, 0.6);
                
                // Random glitch effects on bass
                if (Math.random() < 0.2) {
                    this.scheduleGlitchEffect(swungTime, 'bass');
                }
            }
        }
        
        // Sub bass on strong beats
        if (subdivision === 0 && [0, 4].includes(currentBeatInPattern)) {
            this.playPitchedSample('sub', 55, swungTime, 0.8);
        }
    }
    
    getSwingAdjustment(subdivision) {
        // Add swing to odd subdivisions (typical hip-hop swing)
        if (subdivision % 2 === 1) {
            return (60 / this.bpm / this.beatSubdivision) * this.swingAmount;
        }
        return 0;
    }
    
    getGlitchHopBassNote(beat) {
        // Funky bass progression
        const progression = [
            55,   // A1
            null, // rest
            73,   // D2  
            null, // rest
            55,   // A1
            82,   // E2
            73,   // D2
            65    // C2
        ];
        
        return progression[beat] || null;
    }
    
    playRealisticSample(sampleType, time, velocity = 1.0) {
        const buffer = this.drumSamples.get(sampleType) || this.bassSamples.get(sampleType);
        if (!buffer) {
            debugWarn(`⚠️  Sample not found: ${sampleType}`);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        
        source.buffer = buffer;
        gain.gain.setValueAtTime(velocity, time);
        
        source.connect(gain);
        if (this.musicGain) {
            gain.connect(this.musicGain);
        } else if (this.masterGain) {
            gain.connect(this.masterGain);
        }
        
        source.start(time);
    }
    
    playPitchedSample(sampleType, pitch, time, velocity = 1.0) {
        const buffer = this.bassSamples.get(sampleType);
        if (!buffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        
        source.buffer = buffer;
        
        // Calculate pitch ratio (A1 = 55Hz as base)
        const basePitch = sampleType === 'sub' ? 55 : 110;
        const pitchRatio = pitch / basePitch;
        source.playbackRate.setValueAtTime(pitchRatio, time);
        
        gain.gain.setValueAtTime(velocity, time);
        
        source.connect(gain);
        if (this.musicGain) {
            gain.connect(this.musicGain);
        } else if (this.masterGain) {
            gain.connect(this.masterGain);
        }
        
        source.start(time);
    }
    
    scheduleGlitchEffect(time, type) {
        // Glitch effects: stuttering, chopping, bit crushing
        const glitchType = Math.random();
        
        if (glitchType < 0.4) {
            // Stutter effect - repeat short segment
            this.createStutter(time, type);
        } else if (glitchType < 0.7) {
            // Reverse effect
            this.createReverse(time, type);  
        } else {
            // Bit crush effect
            this.createBitCrush(time, type);
        }
    }
    
    createStutter(time, sampleType) {
        const buffer = this.drumSamples.get(sampleType);
        if (!buffer) return;
        
        // Create 3-4 rapid repeats
        const stutterCount = 3 + Math.floor(Math.random() * 2);
        const stutterRate = (60 / this.bpm) / 32; // 32nd note stutters
        
        for (let i = 0; i < stutterCount; i++) {
            const source = this.audioContext.createBufferSource();
            const gain = this.audioContext.createGain();
            
            source.buffer = buffer;
            
            // Shorter segments for stutter
            const stutterTime = time + (i * stutterRate);
            gain.gain.setValueAtTime(0.3 / (i + 1), stutterTime);
            
            source.connect(gain);
            gain.connect(this.masterGain); // Connect directly to master
            
            source.start(stutterTime);
            source.stop(stutterTime + stutterRate * 0.8);
        }
    }
    
    createReverse(time, sampleType) {
        const buffer = this.drumSamples.get(sampleType);
        if (!buffer) return;
        
        // Create reversed version of sample
        const reversedBuffer = this.audioContext.createBuffer(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const originalData = buffer.getChannelData(channel);
            const reversedData = reversedBuffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                reversedData[i] = originalData[buffer.length - 1 - i];
            }
        }
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        
        source.buffer = reversedBuffer;
        gain.gain.setValueAtTime(0.4, time);
        
        source.connect(gain);
        gain.connect(this.masterGain);
        
        source.start(time);
    }
    
    createBitCrush(time, sampleType) {
        const buffer = this.drumSamples.get(sampleType);
        if (!buffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const waveshaper = this.audioContext.createWaveShaper();
        
        source.buffer = buffer;
        
        // Heavy bit crushing curve
        waveshaper.curve = this.createBitCrushCurve(4); // 4-bit crushing
        waveshaper.oversample = 'none';
        
        gain.gain.setValueAtTime(0.5, time);
        
        source.connect(waveshaper);
        waveshaper.connect(gain);
        gain.connect(this.masterGain);
        
        source.start(time);
    }
    
    createBitCrushCurve(bits) {
        const samples = 1024;
        const curve = new Float32Array(samples);
        const step = Math.pow(0.5, bits);
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = step * Math.floor(x / step + 0.5);
        }
        
        return curve;
    }
    
    
    // Get the closest beat subdivision for syncing impacts
    getNextBeatTime(maxLookAhead = 0.2) {
        const now = this.audioContext.currentTime;
        const beatDuration = 60 / this.bpm;
        const subdivisionDuration = beatDuration / this.beatSubdivision;
        const elapsed = now - this.beatStartTime;
        const nextSubdivisionTime = Math.ceil(elapsed / subdivisionDuration) * subdivisionDuration;
        const targetTime = this.beatStartTime + nextSubdivisionTime;
        
        // If the next subdivision is too far, return current time
        return (targetTime - now) <= maxLookAhead ? targetTime : now;
    }
    
    playAimCharge(intensity = 0.5) {
        // Pleasure-focused charge sound
        // Use existing pleasure sounds for aim charging
        this.playPleasureSound('softImpact', intensity * 0.5);
    }
    
    // Musical Progression System
    startChordProgression() {
        if (!this.initialized || this.chordProgressionActive) return;

        const progressionNames = this.chordProgression.map(c => c.name).join('-');

        // PRIORITY 1: Use pre-rendered mixdown audio if available (best quality)
        if (this.mixdownAudioBuffer) {
            debugLog(`🎵 Using PRE-RENDERED MIXDOWN AUDIO`);
            this.chordProgressionActive = true;
            this.startMixdownPlayback();
            return;
        }

        // PRIORITY 2: Use step sequencer if patterns were loaded from audio editor
        if (this.stepSequencerEnabled) {
            debugLog(`🎹 Using STEP SEQUENCER for ${progressionNames} at ${this.bpm} BPM`);
            this.chordProgressionActive = true;
            this.startStepSequencer();
            return;
        }

        // Fall back to default chord-based system
        this.chordProgressionActive = true;
        this.currentChordIndex = 0;
        this.beatStartTime = this.audioContext.currentTime;
        this.nextChordChangeTime = this.audioContext.currentTime;

        debugLog(`🎵 Starting ${progressionNames} progression in key of`, this.key);
        this.scheduleNextChord();
    }

    stopChordProgression() {
        this.chordProgressionActive = false;

        // Stop step sequencer if active
        if (this.stepSequencerActive) {
            this.stopStepSequencer();
        }

        debugLog('🎵 Stopped chord progression');
    }

    // Pause all audio (suspends AudioContext - stops all sounds immediately)
    pauseAudio() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
            debugLog('🔇 Audio context suspended - all sounds paused');
        }
    }

    // Resume all audio
    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            debugLog('🔊 Audio context resumed');
        }
    }
    
    scheduleNextChord() {
        if (!this.chordProgressionActive) return;
        
        const now = this.audioContext.currentTime;
        const beatDuration = 60 / this.bpm;
        const chordDuration = beatDuration * this.beatsPerChord;
        
        // Schedule bassline and pad for the current chord
        const currentChord = this.chordProgression[this.currentChordIndex];
        
        // Track when this chord starts for hi-hat timing
        this.currentChordStartTime = this.nextChordChangeTime;
        
        // Play bass note (root of chord)
        this.playBassNote(currentChord.root, this.nextChordChangeTime, chordDuration);
        
        // Play subtle chord pad (only after 2nd progression cycle)
        if (this.progressionCount >= 2) {
            this.playChordPad(currentChord.notes, this.nextChordChangeTime, chordDuration);
            debugLog(`🎼 Playing chord pad (progression ${this.progressionCount})`);
        }
        
        // Move to next chord
        this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgression.length;
        
        // Increment progression counter when we complete a full cycle
        if (this.currentChordIndex === 0) {
            this.progressionCount++;
            debugLog(`🎵 Completed progression cycle ${this.progressionCount}`);
        }
        
        this.nextChordChangeTime += chordDuration;
        
        // Schedule next chord
        setTimeout(() => this.scheduleNextChord(), (chordDuration - 0.1) * 1000);
    }
    
    playBassNote(frequency, startTime, duration) {
        const beatDuration = 60 / this.bpm;
        const baseFreq = frequency / 4; // Two octaves down
        
        // 808-style sustained bass with sidechain pumping
        // Play one long sustained note per chord
        const osc = this.audioContext.createOscillator();
        const subOsc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const distortion = this.audioContext.createWaveShaper();
        
        // 808 sound design - sine wave with slight saturation
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, startTime);
        
        // Sub layer for extra weight (always present)
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(baseFreq / 2, startTime); // Sub harmonic
        
        // Higher bass layer - only after first progression
        let highOsc = null;
        if (this.progressionCount > 0) {
            highOsc = this.audioContext.createOscillator();
            highOsc.type = 'sine';
            highOsc.frequency.setValueAtTime(baseFreq * 2, startTime); // One octave higher
            debugLog(`🎵 Adding high bass layer (progression ${this.progressionCount})`);
        }
        
        // Low-pass filter for warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, startTime);
        filter.Q.setValueAtTime(3, startTime);
        
        // Soft saturation curve for 808 warmth
        const samples = 256;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            const x = (i * 2 / samples) - 1;
            curve[i] = Math.tanh(x * 2);
        }
        distortion.curve = curve;
        
        // Create sidechain pumping effect (4-on-the-floor)
        const pumpPattern = 4; // Pump 4 times per measure
        for (let beat = 0; beat < 16; beat++) {
            const beatTime = startTime + (beat * beatDuration);
            
            if (beat % pumpPattern === 0) {
                // Duck on the kick (sidechain compression effect)
                env.gain.setValueAtTime(0.6, beatTime);
                env.gain.exponentialRampToValueAtTime(0.05, beatTime + 0.05); // Quick duck
                env.gain.exponentialRampToValueAtTime(0.6, beatTime + 0.3); // Release back up
            }
        }
        
        // Overall envelope - fade in and sustain
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.6, startTime + 0.02); // Quick attack
        
        // Slight fade out at the end
        env.gain.setValueAtTime(0.6, startTime + duration - 0.5);
        env.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        // Connect chain: osc -> distortion -> filter -> env -> output
        osc.connect(distortion);
        subOsc.connect(distortion);
        if (highOsc) {
            highOsc.connect(distortion);
        }
        distortion.connect(filter);
        filter.connect(env);
        env.connect(this.basslineGain);
        
        // Play for the full duration
        osc.start(startTime);
        osc.stop(startTime + duration);
        subOsc.start(startTime);
        subOsc.stop(startTime + duration);
        if (highOsc) {
            highOsc.start(startTime);
            highOsc.stop(startTime + duration);
        }
        
        // Add occasional bass slides for movement
        if (Math.random() < 0.3) {
            // 30% chance to add a pitch slide
            const slideTime = startTime + duration - beatDuration * 2;
            osc.frequency.setValueAtTime(baseFreq, slideTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, slideTime + beatDuration);
            osc.frequency.exponentialRampToValueAtTime(baseFreq, startTime + duration);
        }
    }
    
    playChordPad(notes, startTime, duration) {
        // Warm pad layer
        notes.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const env = this.audioContext.createGain();
            const pan = this.audioContext.createStereoPanner();
            
            // Warm pad sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            
            // Slight detuning for richness
            osc.detune.setValueAtTime((index - 1) * 5, startTime);
            
            // Stereo spread
            pan.pan.setValueAtTime((index - 1) * 0.3, startTime);
            
            // Gentle envelope
            env.gain.setValueAtTime(0, startTime);
            env.gain.linearRampToValueAtTime(0.08, startTime + 0.5);
            env.gain.setValueAtTime(0.08, startTime + duration - 0.5);
            env.gain.linearRampToValueAtTime(0, startTime + duration);
            
            // Connect
            osc.connect(pan);
            pan.connect(env);
            env.connect(this.chordGain);
            
            // Play
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
        
        // Add subtle arpeggiator on top - uses configurable settings
        const beatDuration = 60 / this.bpm;
        const sixteenthNote = beatDuration / 4;
        const arpPattern = this.arpSettings.pattern;
        const octaveMultiplier = Math.pow(2, this.arpSettings.octaveShift);

        arpPattern.forEach((noteIndex, i) => {
            // Rate: 2 = 8th notes (sixteenthNote * 2), 1 = 16th notes, 4 = quarter notes
            const arpTime = startTime + (i * sixteenthNote * this.arpSettings.rate);
            if (arpTime < startTime + duration && (noteIndex % notes.length) < notes.length) {
                const freq = notes[noteIndex % notes.length] * octaveMultiplier;

                const osc = this.audioContext.createOscillator();
                const env = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                // Sparkly arp sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, arpTime);

                // Configurable bright filter
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(this.arpSettings.filterFreq, arpTime);
                filter.Q.setValueAtTime(0.5, arpTime);

                // Configurable plucky envelope
                env.gain.setValueAtTime(0, arpTime);
                env.gain.linearRampToValueAtTime(this.arpSettings.volume * 0.6, arpTime + 0.002);
                env.gain.exponentialRampToValueAtTime(0.01, arpTime + this.arpSettings.decay);

                // Connect without delay
                osc.connect(filter);
                filter.connect(env);
                env.connect(this.arpGain); // Connect arpeggiator to separate gain

                // Play
                osc.start(arpTime);
                osc.stop(arpTime + this.arpSettings.decay + 0.1);
            }
        });
    }
    
    // Get a note from the current chord's scale for block hits
    getNoteFromCurrentChord() {
        const currentChord = this.chordProgression[this.currentChordIndex];
        const scale = currentChord.scale;
        
        // Pick a random note from the scale, weighted towards chord tones
        const useChordTone = Math.random() < 0.7; // 70% chance to use chord tone
        
        if (useChordTone) {
            // Use one of the chord notes
            const chordNote = currentChord.notes[Math.floor(Math.random() * currentChord.notes.length)];
            // Potentially octave up for variety
            return Math.random() < 0.5 ? chordNote : chordNote * 2;
        } else {
            // Use any note from the scale
            const scaleNote = scale[Math.floor(Math.random() * scale.length)];
            // Potentially octave up for variety
            return Math.random() < 0.5 ? scaleNote : scaleNote * 2;
        }
    }
    
    // Detect if current time aligns with musical beats
    isOnBeat(currentTime, beatType = 'quarter') {
        if (!this.chordProgressionActive || !this.beatStartTime) return false;
        
        const beatDuration = 60 / this.bpm;
        const timeSinceBeatStart = currentTime - this.beatStartTime;
        
        let noteDuration;
        switch (beatType) {
            case 'whole': noteDuration = beatDuration * 4; break;
            case 'half': noteDuration = beatDuration * 2; break;
            case 'quarter': noteDuration = beatDuration; break;
            default: noteDuration = beatDuration;
        }
        
        // Check if we're within 50ms of a beat boundary
        const remainder = timeSinceBeatStart % noteDuration;
        return remainder < 0.05 || remainder > (noteDuration - 0.05);
    }
    
    // Detect if current time aligns with musical beats
    isOnBeat(currentTime, beatType = 'quarter') {
        if (!this.chordProgressionActive || !this.beatStartTime) return false;
        
        const beatDuration = 60 / this.bpm;
        const timeSinceBeatStart = currentTime - this.beatStartTime;
        
        let noteDuration;
        switch (beatType) {
            case 'whole': noteDuration = beatDuration * 4; break;
            case 'half': noteDuration = beatDuration * 2; break;
            case 'quarter': noteDuration = beatDuration; break;
            default: noteDuration = beatDuration;
        }
        
        // Check if we're within 50ms of a beat boundary
        const remainder = timeSinceBeatStart % noteDuration;
        return remainder < 0.05 || remainder > (noteDuration - 0.05);
    }
    
    /**
     * JAZZ SOLO SYSTEM
     * Based on jazz improvisation theory:
     * - Chord-tone targeting: Play root/3rd/5th on strong beats
     * - Guide tones: Target 3rd and 7th for harmonic clarity
     * - Voice leading: Move by step for smooth melodic lines
     * - Melodic contour: Vary direction for interesting phrases
     *
     * Sources: Berklee chord-tone soloing, JazzAdvice approach patterns
     */
    getJazzSoloNote(chord, isStrongBeat) {
        // Build a pool of available notes across multiple octaves
        let notePool = [];

        // Add scale notes in multiple octaves (C4 to C6 range)
        for (let octave = 0; octave <= 2; octave++) {
            const multiplier = Math.pow(2, octave);
            chord.scale.forEach(freq => {
                const note = freq * multiplier;
                if (note >= this.soloRange.low && note <= this.soloRange.high) {
                    notePool.push(note);
                }
            });
        }

        // Sort by frequency and remove duplicates
        notePool = [...new Set(notePool)].sort((a, b) => a - b);

        // Find the closest note to our last note for voice leading
        let closestIndex = 0;
        let closestDistance = Infinity;
        notePool.forEach((note, i) => {
            const distance = Math.abs(note - this.lastSoloNote);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        });

        let selectedNote;

        if (isStrongBeat) {
            // STRONG BEAT: Target chord tones or guide tones
            // Find the nearest chord tone to our current position
            const chordTones = [];
            for (let octave = 0; octave <= 2; octave++) {
                const multiplier = Math.pow(2, octave);
                chord.notes.forEach(freq => {
                    const note = freq * multiplier;
                    if (note >= this.soloRange.low && note <= this.soloRange.high) {
                        chordTones.push(note);
                    }
                });
            }

            // Find nearest chord tone with voice leading preference
            let bestChordTone = chordTones[0];
            let bestDistance = Infinity;
            chordTones.forEach(tone => {
                const distance = Math.abs(tone - this.lastSoloNote);
                // Prefer moving by step (within a major 3rd interval ~1.26 ratio)
                if (distance < bestDistance && tone / this.lastSoloNote < 1.3 && this.lastSoloNote / tone < 1.3) {
                    bestDistance = distance;
                    bestChordTone = tone;
                }
            });

            // If no nearby chord tone, just pick the closest one
            if (bestDistance === Infinity) {
                chordTones.forEach(tone => {
                    const distance = Math.abs(tone - this.lastSoloNote);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestChordTone = tone;
                    }
                });
            }

            selectedNote = bestChordTone;
        } else {
            // WEAK BEAT: Allow scale passing tones, favor stepwise motion
            // Move 1-3 scale steps in the current direction
            const steps = Math.floor(Math.random() * 3) + 1;
            let targetIndex = closestIndex + (this.soloDirection * steps);

            // Bounce off the edges of the range
            if (targetIndex >= notePool.length) {
                targetIndex = notePool.length - 2;
                this.soloDirection = -1;  // Change direction
            } else if (targetIndex < 0) {
                targetIndex = 1;
                this.soloDirection = 1;   // Change direction
            }

            selectedNote = notePool[Math.max(0, Math.min(targetIndex, notePool.length - 1))];
        }

        // Occasionally change direction for melodic variety (every 4-8 notes)
        this.phraseNoteCount++;
        if (this.phraseNoteCount > 4 + Math.floor(Math.random() * 4)) {
            this.soloDirection *= -1;
            this.phraseNoteCount = 0;
        }

        // Update state for next note
        this.lastSoloNote = selectedNote;

        return selectedNote;
    }

    // Play melodic sounds for ball hits (90% piano, 10% bells) - NO DELAY
    playMelodicBallHit(blockHP, activeBalls = 1) {
        if (!this.audioContext) return;
        if (!SoundMixer.isEnabled('musicalHit')) return;
        
        const now = this.audioContext.currentTime;
        
        // Determine if this hit is on a strong beat
        const onWholeNote = this.isOnBeat(now, 'whole');
        const onHalfNote = this.isOnBeat(now, 'half');
        const onQuarterNote = this.isOnBeat(now, 'quarter');
        
        // 90% chance for piano, 10% chance for bells
        const playMelodicSound = Math.random() < 0.9;
        
        if (playMelodicSound) {
            // Play piano note
            this.playMelodicPiano(onWholeNote, onHalfNote || onQuarterNote);
        } else {
            // Play bell sound
            this.playMelodicBell(onWholeNote, onHalfNote, onQuarterNote);
        }
    }
    
    // Get best piano sample and calculate pitch ratio for current chord
    getBestPianoSample(chord, onWholeNote) {
        // Define target frequencies for our chord progression
        const chordTargets = {
            'I':  { root: 261.63, third: 329.63, fifth: 392.00 }, // C major
            'V':  { root: 392.00, third: 493.88, fifth: 587.33 }, // G major  
            'vi': { root: 440.00, third: 523.25, fifth: 659.25 }, // A minor
            'IV': { root: 349.23, third: 440.00, fifth: 523.25 }  // F major
        };
        
        // Choose which chord tone to play
        const target = chordTargets[chord.name];
        let targetFreq;
        if (onWholeNote) {
            targetFreq = target.root; // Root note for whole notes
        } else {
            // Random chord tone for half notes
            const tones = [target.root, target.third, target.fifth];
            targetFreq = tones[Math.floor(Math.random() * tones.length)];
        }
        
        // Available piano samples with their base frequencies
        const availableSamples = [
            { name: 'piano_grand_c', buffer: this.sampleLibrary.get('piano_grand_c'), baseFreq: 261.63 }, // C
            { name: 'piano_roland_c', buffer: this.sampleLibrary.get('piano_roland_c'), baseFreq: 261.63 }, // C  
            { name: 'piano_roland_f', buffer: this.sampleLibrary.get('piano_roland_f'), baseFreq: 349.23 }, // F
            { name: 'piano_roland_g', buffer: this.sampleLibrary.get('piano_roland_g'), baseFreq: 392.00 }, // G
            { name: 'piano_single_a', buffer: this.sampleLibrary.get('piano_single_a'), baseFreq: 440.00 }  // A
        ];
        
        // Filter to only loaded samples
        const loadedSamples = availableSamples.filter(sample => sample.buffer);
        if (loadedSamples.length === 0) {
            return { buffer: null, pitchRatio: 1.0, name: 'none' };
        }
        
        // Find the sample that needs the least pitch-shifting
        let bestSample = loadedSamples[0];
        let smallestRatio = Math.abs(Math.log2(targetFreq / bestSample.baseFreq));
        
        for (const sample of loadedSamples) {
            const ratio = Math.abs(Math.log2(targetFreq / sample.baseFreq));
            if (ratio < smallestRatio) {
                smallestRatio = ratio;
                bestSample = sample;
            }
        }
        
        // Calculate exact pitch ratio
        const pitchRatio = targetFreq / bestSample.baseFreq;
        
        return {
            buffer: bestSample.buffer,
            pitchRatio: pitchRatio,
            name: bestSample.name
        };
    }
    
    getNormalizedPianoVelocity(sampleName, inputVelocity) {
        // Define normalization factors for different piano samples
        const pianoFactors = {
            'piano_grand_c': 0.8,     // Grand piano samples tend to be loud
            'piano_roland_c': 1.0,    // Roland samples are well balanced
            'piano_roland_f': 1.1,    // F sample might be quieter
            'piano_roland_g': 0.9,    // G sample might be bright
            'piano_single_a': 1.2     // Single note might need boost
        };
        
        const factor = pianoFactors[sampleName] || 1.0;
        const normalized = inputVelocity * factor;
        return Math.min(Math.max(normalized, 0.05), 1.0); // Clamp for piano range
    }
    
    playMelodicPiano(onWholeNote, onOtherBeat) {
        // Get current chord from progression (use getCurrentChord for mixdown support)
        const chord = this.getCurrentChord();
        const currentTime = this.audioContext.currentTime;

        // Use Jazz Solo System to get the note to play
        const isStrongBeat = onWholeNote || onOtherBeat;
        const targetFreq = this.getJazzSoloNote(chord, isStrongBeat);

        // Find best sample to pitch-shift for this frequency
        const pianoSample = this.getBestPianoSampleForFreq(targetFreq);
        if (!pianoSample.buffer) {
            debugLog('🎹 No piano samples loaded for melodic hit');
            return;
        }

        // Create audio nodes for pitch-shifted playback
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = pianoSample.buffer;
        source.playbackRate.setValueAtTime(pianoSample.pitchRatio, currentTime);

        // Set volume based on timing importance
        const baseVolume = onWholeNote ? 0.4 : 0.25;
        const normalizedVolume = this.getNormalizedPianoVelocity(pianoSample.name, baseVolume);
        gainNode.gain.setValueAtTime(normalizedVolume, currentTime);

        // Piano decay
        gainNode.gain.exponentialRampToValueAtTime(baseVolume * 0.7, currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + (onWholeNote ? 3.5 : 2.5));

        // Connect directly to impact gain (NO DELAY)
        source.connect(gainNode);
        gainNode.connect(this.impactGain);

        source.start(currentTime);
        debugLog(`🎹 Jazz solo: ${targetFreq.toFixed(1)}Hz via ${pianoSample.name} @ ${pianoSample.pitchRatio.toFixed(3)}x (${chord.name})`);
    }

    // Get best piano sample for a specific target frequency
    getBestPianoSampleForFreq(targetFreq) {
        const availableSamples = [
            { name: 'piano_grand_c', buffer: this.sampleLibrary.get('piano_grand_c'), baseFreq: 261.63 },
            { name: 'piano_roland_c', buffer: this.sampleLibrary.get('piano_roland_c'), baseFreq: 261.63 },
            { name: 'piano_roland_f', buffer: this.sampleLibrary.get('piano_roland_f'), baseFreq: 349.23 },
            { name: 'piano_roland_g', buffer: this.sampleLibrary.get('piano_roland_g'), baseFreq: 392.00 },
            { name: 'piano_single_a', buffer: this.sampleLibrary.get('piano_single_a'), baseFreq: 440.00 }
        ];

        const loadedSamples = availableSamples.filter(sample => sample.buffer);
        if (loadedSamples.length === 0) {
            return { buffer: null, pitchRatio: 1.0, name: 'none' };
        }

        // Find sample needing least pitch-shifting (sounds most natural)
        let bestSample = loadedSamples[0];
        let smallestRatio = Math.abs(Math.log2(targetFreq / bestSample.baseFreq));

        for (const sample of loadedSamples) {
            const ratio = Math.abs(Math.log2(targetFreq / sample.baseFreq));
            if (ratio < smallestRatio) {
                smallestRatio = ratio;
                bestSample = sample;
            }
        }

        return {
            buffer: bestSample.buffer,
            pitchRatio: targetFreq / bestSample.baseFreq,
            name: bestSample.name
        };
    }
    
    playMelodicBell(onWholeNote, onHalfNote, onQuarterNote) {
        if (!this.audioContext || !this.chordProgression) return;

        // Get current chord and use Jazz Solo System
        const chord = this.getCurrentChord();
        const currentTime = this.audioContext.currentTime;

        // Use jazz solo to get the base frequency
        const isStrongBeat = onWholeNote || onHalfNote;
        const baseFreq = this.getJazzSoloNote(chord, isStrongBeat);

        // Create bell sound using additive synthesis
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const osc3 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();

        // Bell frequencies - fundamental + harmonics for rich tone
        osc1.frequency.setValueAtTime(baseFreq, currentTime);
        osc2.frequency.setValueAtTime(baseFreq * 2, currentTime);   // Octave
        osc3.frequency.setValueAtTime(baseFreq * 3, currentTime);   // 12th (octave + fifth)
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc3.type = 'triangle';
        
        // Bell envelope - quick attack, long decay
        const volume = onWholeNote ? 0.3 : 0.2;
        gain1.gain.setValueAtTime(volume, currentTime);
        gain2.gain.setValueAtTime(volume * 0.6, currentTime);
        gain3.gain.setValueAtTime(volume * 0.3, currentTime);
        
        gainNode.gain.setValueAtTime(1, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.7, currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + (onWholeNote ? 4 : 3));
        
        // Connect bell directly to impact gain (NO DELAY)
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        gain1.connect(gainNode);
        gain2.connect(gainNode);
        gain3.connect(gainNode);
        gainNode.connect(this.impactGain);
        
        osc1.start(currentTime);
        osc2.start(currentTime);
        osc3.start(currentTime);
        
        osc1.stop(currentTime + 5);
        osc2.stop(currentTime + 5);
        osc3.stop(currentTime + 5);
        
        debugLog(`🔔 Melodic bell: ${baseFreq.toFixed(1)}Hz (${chord && chord.name ? chord.name : 'default'})`);
    }

    // Play drum sounds for block hits instead of musical notes
    playMusicalHit(blockHP) {
        // Check mixer setting
        if (!SoundMixer.isEnabled('musicalHit')) return;

        if (!this.chordProgressionActive) {
            // Fallback to original sounds if progression not active
            this.playBlockHit(blockHP);
            return;
        }
        
        const now = this.audioContext.currentTime;
        
        // Determine if this hit is on a strong beat
        const onWholeNote = this.isOnBeat(now, 'whole');
        const onHalfNote = this.isOnBeat(now, 'half');
        const onQuarterNote = this.isOnBeat(now, 'quarter');
        const onStrongBeat = onWholeNote || onHalfNote || onQuarterNote;
        
        // Determine if piano should play (30% more piano, less high-pitched drums)
        const shouldPlayPiano = onWholeNote || onHalfNote || (onQuarterNote && Math.random() < 0.7) || (Math.random() < 0.4);
        
        // Choose drum sound based on block HP and beat timing
        let drumType;
        let velocity = onStrongBeat ? 0.7 : 0.4; // Stronger on beat
        
        if (blockHP <= 1) {
            // Destroying blocks = prefer warmer sounds, reduce bright cymbals
            if (shouldPlayPiano) {
                drumType = 'snare'; // Use snare instead of bright cymbal when piano plays
            } else {
                drumType = onWholeNote ? 'crash' : (Math.random() < 0.9 ? 'snare' : 'ride'); // More snare, ride instead of splash
            }
            velocity = onWholeNote ? 0.9 : 0.7;
        } else if (blockHP <= 2) {
            // Medium damage = prefer snare over rimshot (warmer)
            drumType = Math.random() < 0.8 ? 'snare' : 'rimshot'; // Increased snare probability
        } else if (blockHP <= 4) {
            // Light damage = prefer ride over hi-hat (less piercing)
            drumType = Math.random() < 0.8 ? 'ride' : 'hihat'; // Increased ride probability
        } else {
            // Heavy blocks = toms (already warm)
            drumType = Math.random() < 0.5 ? 'tom1' : 'tom2';
        }
        
        // Add reverb for whole note hits
        const addReverb = onWholeNote;
        
        debugLog(`🥁 Musical hit: ${drumType} (HP: ${blockHP}, velocity: ${velocity.toFixed(2)}, reverb: ${addReverb})`);
        
        // Play the appropriate drum sound
        this.playDrumHit(drumType, velocity, addReverb);
        
        // NEW: Check if this hit would trigger the quantized hi-hat system
        const quantizedSlot = this.getQuantizedHiHatSlot(now);
        const isQuantizedHit = quantizedSlot !== null;
        
        // NEW: Add open hi-hat sound for non-quantized hits
        if (!isQuantizedHit) {
            // Play open hi-hat with subtle volume
            this.playOpenHiHat(0.3);
            debugLog(`🥁 Added open hi-hat (non-quantized hit)`);
        }
        
        // NEW: Add real piano samples - expanded to reduce high-pitched drums by 30%
        if (shouldPlayPiano) {
            this.playRealPianoNote(onWholeNote, onHalfNote || onQuarterNote);
            debugLog(`🎹 Added real piano note (whole: ${onWholeNote}, half: ${onHalfNote}, quarter: ${onQuarterNote})`);
        }
    }
    
    // Generate open hi-hat sound (uses real sample if available, otherwise synthesized)
    playOpenHiHat(velocity = 0.5) {
        if (!this.audioContext || !this.hiHatGain) return;
        
        // Try to use real hi-hat sample first
        const realSample = this.sampleLibrary.get('open_hihat');
        if (realSample) {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = realSample;
            
            // Normalize open hi-hat level (they tend to be loud)
            const normalizedVelocity = velocity * 0.6; // Reduced from 0.7 to 0.6 for better balance
            gainNode.gain.setValueAtTime(normalizedVelocity, this.audioContext.currentTime);
            
            source.connect(gainNode);
            gainNode.connect(this.hiHatGain);
            
            source.start(this.audioContext.currentTime);
            debugLog(`🥁 Playing real open hi-hat sample (velocity: ${normalizedVelocity.toFixed(2)} normalized)`);
            return;
        }
        
        // Fallback to synthesized hi-hat
        debugLog(`🥁 Playing synthesized open hi-hat (real sample not loaded)`);
        const now = this.audioContext.currentTime;
        const gain = this.audioContext.createGain();
        
        // Create noise source for hi-hat
        const noise = this.audioContext.createBufferSource();
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        // Generate filtered noise
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() - 0.5) * 2;
        }
        
        noise.buffer = noiseBuffer;
        
        // High-pass filter for hi-hat brightness
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, now);
        filter.Q.setValueAtTime(1.5, now);
        
        // Open hi-hat envelope (longer sustain than closed)
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(velocity * 0.6, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(velocity * 0.3, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        // Connect audio chain
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.hiHatGain);
        
        noise.start(now);
        noise.stop(now + 0.3);
    }
    
    // Play real piano samples with pitch-shifting for chord progression
    playRealPianoNote(onWholeNote, onHalfNote) {
        if (!this.audioContext || !this.impactGain) return;
        
        // Get current chord from progression
        const chord = this.chordProgression[this.currentChordIndex % this.chordProgression.length];
        const currentTime = this.audioContext.currentTime;
        
        // Choose which piano sample to use and how to pitch-shift it
        const pianoSample = this.getBestPianoSample(chord, onWholeNote);
        if (!pianoSample.buffer) {
            debugLog('🎹 No piano samples loaded, using synthesis fallback');
            this.playPianoNote(onWholeNote, onHalfNote); // Fallback to synthesis
            return;
        }
        
        // Create audio nodes for pitch-shifted playback
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = pianoSample.buffer;
        
        // Set pitch-shift to match current chord
        source.playbackRate.setValueAtTime(pianoSample.pitchRatio, currentTime);
        
        // Set volume based on timing importance with normalization
        const baseVolume = onWholeNote ? 0.5 : 0.3; // Reduced from 0.6/0.4 to 0.5/0.3
        const normalizedVolume = this.getNormalizedPianoVelocity(pianoSample.name, baseVolume);
        gainNode.gain.setValueAtTime(normalizedVolume, currentTime);
        
        // Natural piano decay
        gainNode.gain.exponentialRampToValueAtTime(baseVolume * 0.7, currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + (onWholeNote ? 4.0 : 3.0));
        
        // Connect audio chain
        source.connect(gainNode);
        gainNode.connect(this.impactGain);
        
        // Play the sample
        source.start(currentTime);
        
        debugLog(`🎹 Playing real piano: ${pianoSample.name} @ ${pianoSample.pitchRatio.toFixed(3)}x pitch (${chord.name} chord)`);
    }
    
    // Get best piano sample and calculate pitch ratio for current chord
    getBestPianoSample(chord, onWholeNote) {
        // Define target frequencies for our chord progression
        const chordTargets = {
            'I':  { root: 261.63, third: 329.63, fifth: 392.00 }, // C major
            'V':  { root: 392.00, third: 493.88, fifth: 587.33 }, // G major  
            'vi': { root: 440.00, third: 523.25, fifth: 659.25 }, // A minor
            'IV': { root: 349.23, third: 440.00, fifth: 523.25 }  // F major
        };
        
        // Choose which chord tone to play
        const target = chordTargets[chord.name];
        let targetFreq;
        if (onWholeNote) {
            targetFreq = target.root; // Root note for whole notes
        } else {
            // Random chord tone for half notes
            const tones = [target.root, target.third, target.fifth];
            targetFreq = tones[Math.floor(Math.random() * tones.length)];
        }
        
        // Available piano samples with their base frequencies
        const availableSamples = [
            { name: 'piano_grand_c', buffer: this.sampleLibrary.get('piano_grand_c'), baseFreq: 261.63 }, // C
            { name: 'piano_roland_c', buffer: this.sampleLibrary.get('piano_roland_c'), baseFreq: 261.63 }, // C  
            { name: 'piano_roland_f', buffer: this.sampleLibrary.get('piano_roland_f'), baseFreq: 349.23 }, // F
            { name: 'piano_roland_g', buffer: this.sampleLibrary.get('piano_roland_g'), baseFreq: 392.00 }, // G
            { name: 'piano_single_a', buffer: this.sampleLibrary.get('piano_single_a'), baseFreq: 440.00 }  // A
        ];
        
        // Filter to only loaded samples
        const loadedSamples = availableSamples.filter(sample => sample.buffer);
        if (loadedSamples.length === 0) {
            return { buffer: null, pitchRatio: 1.0, name: 'none' };
        }
        
        // Find the sample that needs the least pitch-shifting
        let bestSample = loadedSamples[0];
        let smallestRatio = Math.abs(Math.log2(targetFreq / bestSample.baseFreq));
        
        for (const sample of loadedSamples) {
            const ratio = Math.abs(Math.log2(targetFreq / sample.baseFreq));
            if (ratio < smallestRatio) {
                smallestRatio = ratio;
                bestSample = sample;
            }
        }
        
        // Calculate exact pitch ratio
        const pitchRatio = targetFreq / bestSample.baseFreq;
        
        return {
            buffer: bestSample.buffer,
            pitchRatio: pitchRatio,
            name: bestSample.name
        };
    }
    
    // Generate piano note sound for whole/half note timing
    playPianoNote(onWholeNote, onHalfNote) {
        if (!this.audioContext || !this.impactGain) return;
        
        const now = this.audioContext.currentTime;
        
        // Get current chord note for harmonic piano note
        const chord = this.chordProgression[this.currentChordIndex % this.chordProgression.length];
        
        // Choose piano note from current chord (root, third, or fifth)
        const chordNotes = [
            chord.root,           // Root
            chord.root * 1.25,    // Major third
            chord.root * 1.5      // Perfect fifth
        ];
        
        // Select note based on timing
        let noteFreq;
        if (onWholeNote) {
            noteFreq = chordNotes[0]; // Root note for whole notes
        } else {
            noteFreq = chordNotes[Math.floor(Math.random() * chordNotes.length)]; // Random chord tone for half notes
        }
        
        // Transpose to comfortable piano range (around middle C)
        while (noteFreq < 200) noteFreq *= 2;
        while (noteFreq > 800) noteFreq /= 2;
        
        // Create piano-like sound with multiple harmonics
        const fundamentalGain = this.audioContext.createGain();
        const harmonic2Gain = this.audioContext.createGain();
        const harmonic3Gain = this.audioContext.createGain();
        
        // Fundamental frequency
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(noteFreq, now);
        
        // Second harmonic (octave)
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(noteFreq * 2, now);
        
        // Third harmonic (fifth)
        const osc3 = this.audioContext.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(noteFreq * 3, now);
        
        // Piano-like envelope (quick attack, long decay)
        const baseVelocity = onWholeNote ? 0.4 : 0.25;
        const duration = onWholeNote ? 3.0 : 2.0; // Longer for whole notes
        
        fundamentalGain.gain.setValueAtTime(0, now);
        fundamentalGain.gain.linearRampToValueAtTime(baseVelocity, now + 0.02);
        fundamentalGain.gain.exponentialRampToValueAtTime(baseVelocity * 0.7, now + 0.3);
        fundamentalGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        harmonic2Gain.gain.setValueAtTime(0, now);
        harmonic2Gain.gain.linearRampToValueAtTime(baseVelocity * 0.3, now + 0.02);
        harmonic2Gain.gain.exponentialRampToValueAtTime(baseVelocity * 0.2, now + 0.3);
        harmonic2Gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);
        
        harmonic3Gain.gain.setValueAtTime(0, now);
        harmonic3Gain.gain.linearRampToValueAtTime(baseVelocity * 0.15, now + 0.02);
        harmonic3Gain.gain.exponentialRampToValueAtTime(baseVelocity * 0.1, now + 0.3);
        harmonic3Gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);
        
        // Connect piano harmonics
        osc1.connect(fundamentalGain);
        osc2.connect(harmonic2Gain);
        osc3.connect(harmonic3Gain);
        
        fundamentalGain.connect(this.impactGain);
        harmonic2Gain.connect(this.impactGain);
        harmonic3Gain.connect(this.impactGain);
        
        // Start and stop oscillators
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration * 0.8);
        osc3.stop(now + duration * 0.6);
    }
    
    // Generate specific drum sounds for musical hits
    playDrumHit(drumType, velocity, addReverb = false) {
        // Check mixer setting
        if (!SoundMixer.isEnabled('drumHit')) return;
        if (!this.audioContext || !this.impactGain) return;
        
        const now = this.audioContext.currentTime;
        
        // Create reverb if needed
        let reverb = null;
        if (addReverb) {
            reverb = this.audioContext.createConvolver();
            const reverbLength = this.audioContext.sampleRate * 1.5;
            const reverbBuffer = this.audioContext.createBuffer(2, reverbLength, this.audioContext.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const channelData = reverbBuffer.getChannelData(channel);
                for (let i = 0; i < reverbLength; i++) {
                    const decay = Math.pow(1 - i / reverbLength, 2);
                    channelData[i] = (Math.random() * 2 - 1) * decay * 0.4;
                }
            }
            reverb.buffer = reverbBuffer;
        }
        
        // Generate different drum sounds
        switch(drumType) {
            case 'hihat':
                this.generateHiHatHit(now, velocity, reverb);
                break;
            case 'snare':
                this.generateSnareRoll(now, velocity, reverb);
                break;
            case 'tom1':
            case 'tom2':
                this.generateTomHit(now, velocity, drumType === 'tom2', reverb);
                break;
            case 'floortom':
                this.generateFloorTom(now, velocity, reverb);
                break;
            case 'ride':
                this.generateRideHit(now, velocity, reverb);
                break;
            case 'crash':
                this.generateCrashHit(now, velocity, reverb);
                break;
            case 'splash':
                this.generateSplashHit(now, velocity, reverb);
                break;
            case 'rimshot':
                this.generateRimshot(now, velocity, reverb);
                break;
        }
    }
    
    // Hi-hat closed hit
    generateHiHatHit(time, velocity, reverb) {
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const env = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, time);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.4, time + 0.001);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
        
        noise.connect(filter);
        filter.connect(env);
        
        if (reverb) {
            env.connect(reverb);
            reverb.connect(this.impactGain);
        } else {
            env.connect(this.impactGain);
        }
        
        noise.start(time);
        noise.stop(time + 0.1);
    }
    
    // Snare with quick roll effect
    generateSnareRoll(time, velocity, reverb) {
        // Main snare hit
        this.generateSingleSnare(time, velocity, reverb);
        
        // Add quick ghost notes for "roll" effect
        if (velocity > 0.5) {
            this.generateSingleSnare(time + 0.02, velocity * 0.3, null);
            this.generateSingleSnare(time + 0.04, velocity * 0.2, null);
        }
    }
    
    generateSingleSnare(time, velocity, reverb) {
        // Tone component
        const toneOsc = this.audioContext.createOscillator();
        const toneEnv = this.audioContext.createGain();
        toneOsc.type = 'triangle';
        toneOsc.frequency.setValueAtTime(200, time);
        
        // Noise component  
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const noiseEnv = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1200, time);
        
        // Envelopes
        toneEnv.gain.setValueAtTime(0, time);
        toneEnv.gain.linearRampToValueAtTime(velocity * 0.3, time + 0.003);
        toneEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        
        noiseEnv.gain.setValueAtTime(0, time);
        noiseEnv.gain.linearRampToValueAtTime(velocity * 0.6, time + 0.002);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        // Connect
        toneOsc.connect(toneEnv);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnv);
        
        if (reverb) {
            toneEnv.connect(reverb);
            noiseEnv.connect(reverb);
            reverb.connect(this.impactGain);
        } else {
            toneEnv.connect(this.impactGain);
            noiseEnv.connect(this.impactGain);
        }
        
        toneOsc.start(time);
        toneOsc.stop(time + 0.15);
        noise.start(time);
        noise.stop(time + 0.15);
    }
    
    // Tom hit (rack tom)
    generateTomHit(time, velocity, isLowTom, reverb) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        
        const frequency = isLowTom ? 120 : 180;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, time);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.6, time + 0.15);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.8, time + 0.01);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        osc.connect(env);
        
        if (reverb) {
            env.connect(reverb);
            reverb.connect(this.impactGain);
        } else {
            env.connect(this.impactGain);
        }
        
        osc.start(time);
        osc.stop(time + 0.4);
    }
    
    // Floor tom
    generateFloorTom(time, velocity, reverb) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.2);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.9, time + 0.015);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
        
        osc.connect(env);
        
        if (reverb) {
            env.connect(reverb);
            reverb.connect(this.impactGain);
        } else {
            env.connect(this.impactGain);
        }
        
        osc.start(time);
        osc.stop(time + 0.6);
    }
    
    // Ride cymbal hit
    generateRideHit(time, velocity, reverb) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(3200 + Math.random() * 400, time);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.4, time + 0.005);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        osc.connect(env);
        
        if (reverb) {
            env.connect(reverb);
            reverb.connect(this.impactGain);
        } else {
            env.connect(this.impactGain);
        }
        
        osc.start(time);
        osc.stop(time + 0.3);
    }
    
    // Crash cymbal
    generateCrashHit(time, velocity, reverb) {
        // Multiple frequencies for crash
        const frequencies = [1800, 2200, 2700, 3400];
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const env = this.audioContext.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq + Math.random() * 200, time);
            
            env.gain.setValueAtTime(0, time);
            env.gain.linearRampToValueAtTime(velocity * 0.3, time + 0.01);
            env.gain.exponentialRampToValueAtTime(0.01, time + 1.2);
            
            osc.connect(env);
            
            if (reverb && i === 0) { // Only first oscillator gets reverb to avoid buildup
                env.connect(reverb);
                reverb.connect(this.impactGain);
            } else {
                env.connect(this.impactGain);
            }
            
            osc.start(time);
            osc.stop(time + 1.2);
        });
    }
    
    // Splash cymbal
    generateSplashHit(time, velocity, reverb) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(4000 + Math.random() * 1000, time);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.5, time + 0.005);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        osc.connect(env);
        
        if (reverb) {
            env.connect(reverb);
            reverb.connect(this.impactGain);
        } else {
            env.connect(this.impactGain);
        }
        
        osc.start(time);
        osc.stop(time + 0.4);
    }

    // Temporary function to test bass sound in isolation
    testBassOnly() {
        debugLog('🎵 Playing bass test - progression count:', this.progressionCount);
        const frequency = 261.63; // C note
        const now = this.audioContext.currentTime;
        this.playBassNote(frequency, now, 4); // Play for 4 seconds
    }

    // Check if current time can be quantized to a hi-hat slot
    getQuantizedHiHatSlot(currentTime) {
        if (!this.chordProgressionActive || !this.currentChordStartTime) return null;
        
        const chordDuration = this.beatsPerChord * (60 / this.bpm);
        const timeSinceChordStart = currentTime - this.currentChordStartTime;
        
        // Wrap around if we're past the current chord (shouldn't happen but safety)
        const relativeTime = timeSinceChordStart % chordDuration;
        
        // Each hi-hat slot duration = chordDuration / 32
        const slotDuration = chordDuration / this.hiHatSlotsPerChord;
        
        // Find the closest hi-hat slot
        const closestSlot = Math.round(relativeTime / slotDuration);
        const closestSlotTime = closestSlot * slotDuration;
        
        // Check if we're within the quantization window
        const timeDifference = Math.abs(relativeTime - closestSlotTime);
        const halfWindow = this.quantizeWindow / 2;
        
        if (timeDifference <= halfWindow) {
            const slotNumber = closestSlot % this.hiHatSlotsPerChord;
            debugLog(`🥁 Hit quantized to slot ${slotNumber + 1}/32 (off by ${Math.round(timeDifference * 1000)}ms)`);
            return {
                slot: slotNumber,
                quantizedTime: this.currentChordStartTime + closestSlotTime,
                timingError: timeDifference
            };
        }
        
        return null;
    }
    
    // Generate hi-hat sound with optional timing adjustment
    playInteractiveHiHat(quantizedTime = null) {
        if (!this.audioContext || !this.hiHatGain) return;
        
        const now = quantizedTime || this.audioContext.currentTime;
        
        // Create hi-hat sound (noise burst with high-pass filter)
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        // Hi-hat processing chain
        const highpass = this.audioContext.createBiquadFilter();
        const env = this.audioContext.createGain();
        
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(8000, now); // Very bright
        highpass.Q.setValueAtTime(1, now);
        
        // Sharp attack, quick decay
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.3, now + 0.001);
        env.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        // Connect chain
        noise.connect(highpass);
        highpass.connect(env);
        env.connect(this.hiHatGain);
        
        // Play
        noise.start(now);
        noise.stop(now + 0.1);
        
        debugLog('🥁 Interactive hi-hat triggered!');
    }
    
    // Try to trigger hi-hat on ball interactions with quantization
    tryTriggerHiHat() {
        // Simplified version - just play a hi-hat sound immediately
        if (!this.audioContext) return false;
        
        this.playInteractiveHiHat();
        this.flashQuantizeIndicator();
        return true;
    }
    
    // Flash the quantize indicator
    flashQuantizeIndicator() {
        const indicator = document.getElementById('quantizeIndicator');
        if (indicator) {
            indicator.classList.add('active');
            setTimeout(() => {
                indicator.classList.remove('active');
            }, 150);
        }
    }

    // Generate jazz drum sound (uses real samples if available, otherwise synthesized)
    playJazzDrum(drumType, velocity = 1.0, swingOffset = 0) {
        if (!this.audioContext || !this.jazzDrumGain || !this.jazzDrums[drumType]) return;

        const now = this.audioContext.currentTime + swingOffset;

        // Try to play real sample first
        const realSample = this.getJazzSampleForDrumType(drumType);
        if (realSample) {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = realSample;

            // Normalize audio levels based on drum type
            const normalizedVelocity = this.getNormalizedDrumVelocity(drumType, velocity);
            gainNode.gain.setValueAtTime(normalizedVelocity, now);

            // Add slight pitch variation for realism
            const pitchVariation = 1 + (Math.random() - 0.5) * 0.05;
            source.playbackRate.setValueAtTime(pitchVariation, now);

            source.connect(gainNode);
            gainNode.connect(this.jazzDrumGain);

            // Limit roll duration to keep them short (0.4 seconds max)
            if (drumType.includes('roll')) {
                const rollDuration = 0.4;
                source.start(now);
                // Fade out quickly at the end
                gainNode.gain.setValueAtTime(normalizedVelocity, now + rollDuration - 0.05);
                gainNode.gain.linearRampToValueAtTime(0, now + rollDuration);
                source.stop(now + rollDuration);
            } else {
                source.start(now);
            }
            debugLog(`🥁 Playing real jazz ${drumType} sample (velocity: ${normalizedVelocity.toFixed(2)} normalized)`);
            return;
        }
        
        // Fallback to synthesized drums
        debugLog(`🥁 Playing synthesized jazz ${drumType} (real sample not loaded)`);
        const drumConfig = this.jazzDrums[drumType];
        
        // Different synthesis for different drums
        if (drumType === 'kick') {
            this.generateJazzKick(now, velocity);
        } else if (drumType === 'snare') {
            this.generateJazzSnare(now, velocity);
        } else if (drumType === 'crash' || drumType === 'splash') {
            this.generateJazzCymbal(now, velocity, drumConfig);
        } else if (drumType === 'rimshot') {
            this.generateRimshot(now, velocity);
        } else if (drumType === 'ride') {
            this.generateRideCymbal(now, velocity);
        } else {
            this.generateJazzTom(now, velocity, drumConfig);
        }
    }
    
    // Map drum types to real sample names with randomization
    getJazzSampleForDrumType(drumType) {
        const sampleMaps = {
            'kick': ['jazz_kick_1', 'jazz_kick_2', 'pro_kick_soft', 'pro_kick_med', 'pro_kick_hard', 'pro_kick_max'],
            'snare': [
                'jazz_snare_1', 'jazz_snare_2', 'jazz_snare_3', 'jazz_snare_4', 'jazz_snare_5',
                'pro_snare_soft', 'pro_snare_med', 'pro_snare_hard', 'pro_snare_max',
                'virt_snare_roll_1', 'virt_snare_roll_2', 'virt_snare_roll_3'
            ],
            'hihat': ['jazz_hihat_1', 'jazz_hihat_2', 'pro_hh_closed_soft', 'pro_hh_closed_hard'],
            'hihat_open': ['pro_hh_open_soft', 'pro_hh_open_hard', 'pro_hh_splash'],
            'hihat_pedal': ['pro_hh_pedal'],
            'tom1': ['jazz_tom_1', 'jazz_tom_2', 'pro_htom_soft', 'pro_htom_hard'],
            'tom2': ['jazz_tom_2', 'jazz_tom_3', 'pro_ltom_soft', 'pro_ltom_hard'],
            'tom3': ['jazz_tom_3', 'jazz_perc_1', 'pro_ltom_hard'],
            'rimshot': ['jazz_snare_5', 'virt_snare_off_1', 'virt_snare_off_2', 'pro_rimshot_1', 'pro_rimshot_2', 'pro_rimshot_3'],
            'ride': ['jazz_perc_2', 'jazz_perc_3', 'pro_ride_tip'],
            'ride_bell': ['pro_ride_bell'],
            'crash': ['jazz_perc_2', 'jazz_perc_3', 'pro_crash_soft', 'pro_crash_hard', 'pro_crash_sizzle'],
            'splash': ['jazz_perc_1', 'jazz_hihat_1', 'pro_hh_splash'],
            'brush': ['jazz_brush_1', 'jazz_brush_2'],
            // Specialized categories for intense gameplay
            'snare_roll': ['virt_snare_roll_1', 'virt_snare_roll_2', 'virt_snare_roll_3'],
            'lofi_roll': ['virt_lofi_roll_1', 'virt_lofi_roll_2', 'virt_lofi_roll_3']
        };
        
        const sampleNames = sampleMaps[drumType];
        if (!sampleNames || sampleNames.length === 0) return null;
        
        // Pick a random sample from the available options
        const randomSample = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        return this.sampleLibrary.get(randomSample);
    }
    
    // Normalize drum velocities for consistent audio levels
    getNormalizedDrumVelocity(drumType, inputVelocity) {
        // Define normalization factors for different drum types
        const normalizationFactors = {
            // Jazz drum kit samples
            'kick': 1.1,        // Kicks often need boost
            'snare': 0.9,       // Snares are usually loud
            'snare_roll': 1.0,  // Professional rolls are well-balanced
            'lofi_roll': 1.2,   // Lo-fi samples might be quieter
            'hihat': 0.8,       // Hi-hats can be piercing
            'tom1': 1.0,
            'tom2': 1.0, 
            'tom3': 1.0,
            'rimshot': 0.7,     // Rimshots are sharp and loud
            'ride': 0.85,       // Rides can be bright
            'crash': 1.1,       // Crashes need presence
            'splash': 0.9,      // Splashes are naturally bright
            'brush': 0.8        // Brush sounds are subtle
        };
        
        // Get normalization factor or default to 1.0
        const factor = normalizationFactors[drumType] || 1.0;
        
        // Apply normalization with reasonable limits
        const normalized = inputVelocity * factor;
        return Math.min(Math.max(normalized, 0.1), 1.5); // Clamp between 0.1 and 1.5
    }
    
    // Normalize piano velocities for consistent audio levels  
    getNormalizedPianoVelocity(sampleName, inputVelocity) {
        // Define normalization factors for different piano samples
        const pianoFactors = {
            'piano_grand_c': 0.8,     // Grand piano samples tend to be loud
            'piano_roland_c': 1.0,    // Roland samples are well balanced
            'piano_roland_f': 1.1,    // F sample might be quieter
            'piano_roland_g': 0.9,    // G sample might be bright
            'piano_single_a': 1.2     // Single note might need boost
        };
        
        const factor = pianoFactors[sampleName] || 1.0;
        const normalized = inputVelocity * factor;
        return Math.min(Math.max(normalized, 0.05), 1.0); // Clamp for piano range
    }
    
    // Jazz kick drum
    generateJazzKick(time, velocity) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.05);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.8, time + 0.005);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        osc.connect(filter);
        filter.connect(env);
        env.connect(this.jazzDrumGain);
        
        osc.start(time);
        osc.stop(time + 0.3);
    }
    
    // Jazz snare drum
    generateJazzSnare(time, velocity) {
        // Tone component
        const toneOsc = this.audioContext.createOscillator();
        const toneEnv = this.audioContext.createGain();
        const toneFilter = this.audioContext.createBiquadFilter();
        
        toneOsc.type = 'triangle';
        toneOsc.frequency.setValueAtTime(200, time);
        toneFilter.type = 'highpass';
        toneFilter.frequency.setValueAtTime(100, time);
        
        toneEnv.gain.setValueAtTime(0, time);
        toneEnv.gain.linearRampToValueAtTime(velocity * 0.3, time + 0.003);
        toneEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        // Noise component
        const noise = this.audioContext.createBufferSource();
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        const noiseEnv = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000, time);
        
        noiseEnv.gain.setValueAtTime(0, time);
        noiseEnv.gain.linearRampToValueAtTime(velocity * 0.6, time + 0.002);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        // Connect chains
        toneOsc.connect(toneFilter);
        toneFilter.connect(toneEnv);
        toneEnv.connect(this.jazzDrumGain);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnv);
        noiseEnv.connect(this.jazzDrumGain);
        
        toneOsc.start(time);
        toneOsc.stop(time + 0.2);
        noise.start(time);
        noise.stop(time + 0.2);
    }
    
    // Jazz cymbal (crash/splash)
    generateJazzCymbal(time, velocity, config) {
        // Multiple oscillators for shimmer
        const frequencies = [config.frequency, config.frequency * 1.2, config.frequency * 1.7, config.frequency * 2.3];
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const env = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 50, time);
            
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, time);
            
            env.gain.setValueAtTime(0, time);
            env.gain.linearRampToValueAtTime(velocity * 0.4 / frequencies.length, time + 0.01);
            env.gain.exponentialRampToValueAtTime(0.01, time + config.decay);
            
            osc.connect(filter);
            filter.connect(env);
            env.connect(this.jazzDrumGain);
            
            osc.start(time);
            osc.stop(time + config.decay);
        });
    }
    
    // Rimshot
    generateRimshot(time, velocity) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, time);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.Q.setValueAtTime(5, time);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.8, time + 0.001);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        
        osc.connect(filter);
        filter.connect(env);
        env.connect(this.jazzDrumGain);
        
        osc.start(time);
        osc.stop(time + 0.05);
    }
    
    // Ride cymbal
    generateRideCymbal(time, velocity) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(3000 + Math.random() * 500, time);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.3, time + 0.005);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        osc.connect(env);
        env.connect(this.jazzDrumGain);
        
        osc.start(time);
        osc.stop(time + 0.2);
    }
    
    // Jazz tom
    generateJazzTom(time, velocity, config) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(config.frequency, time);
        osc.frequency.exponentialRampToValueAtTime(config.frequency * 0.7, time + 0.1);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(velocity * 0.6, time + 0.01);
        env.gain.exponentialRampToValueAtTime(0.01, time + config.decay);
        
        osc.connect(env);
        env.connect(this.jazzDrumGain);
        
        osc.start(time);
        osc.stop(time + config.decay);
    }

    // Intelligent jazz drum mapping based on gameplay events
    playGameplayJazzDrum(eventType, intensity = 1.0) {
        if (!SoundMixer.isEnabled('drumHit')) return;

        // Track recent hits for musical phrasing
        const now = this.audioContext.currentTime;
        this.recentHits.push({ time: now, type: eventType });
        
        // Clean old hits (only keep last 2 seconds)
        this.recentHits = this.recentHits.filter(hit => now - hit.time < 2);
        
        // Calculate current solo intensity
        this.soloIntensity = Math.min(this.recentHits.length / 10, 1.0);
        
        // Determine drum type based on gameplay context
        let drumType = this.chooseDrumForEvent(eventType, intensity);
        let velocity = this.calculateVelocity(intensity);
        let swingOffset = this.calculateSwingOffset();
        
        debugLog(`🥁 Jazz drum: ${drumType} (velocity: ${velocity.toFixed(2)}, intensity: ${this.soloIntensity.toFixed(2)})`);
        
        this.playJazzDrum(drumType, velocity, swingOffset);
        this.lastDrumType = drumType;
    }
    
    // Choose appropriate drum based on gameplay event
    chooseDrumForEvent(eventType, intensity) {
        const recentCount = this.recentHits.length;

        // Extreme intensity = crashes with rare rolls
        if (this.soloIntensity > 0.8 && recentCount > 8) {
            if (Math.random() < 0.08) return 'snare_roll'; // Rare snare rolls
            if (Math.random() < 0.2) return 'ride_bell'; // Accented ride bell hits
            return 'crash';
        }

        // High intensity rapid-fire = fills, cymbals, and open hats
        if (this.soloIntensity > 0.7 && recentCount > 6) {
            if (Math.random() < 0.25) return 'crash';
            if (Math.random() < 0.2) return 'hihat_open'; // Open hi-hat for accents
            if (Math.random() < 0.3) return 'splash';
            if (Math.random() < 0.15) return 'ride_bell'; // Bell accents
            return Math.random() < 0.5 ? 'tom1' : 'tom2';
        }

        // Medium intensity = enhanced snare, toms, and hi-hats
        if (this.soloIntensity > 0.4) {
            if (Math.random() < 0.4) return 'snare'; // More varied snare samples now
            if (Math.random() < 0.2) return 'rimshot';
            if (Math.random() < 0.15) return 'hihat'; // Closed hi-hat
            if (Math.random() < 0.1) return 'hihat_open'; // Occasional open hat
            return 'tom1';
        }

        // Low intensity = basic kit with hi-hat groove
        const basicDrums = ['kick', 'snare', 'hihat', 'ride'];
        let options = basicDrums.filter(drum => drum !== this.lastDrumType);

        // Weighted selection for musical flow with hi-hat groove
        if (this.lastDrumType === 'kick') {
            const roll = Math.random();
            if (roll < 0.5) return 'snare';
            if (roll < 0.75) return 'hihat';
            return 'ride';
        } else if (this.lastDrumType === 'snare') {
            const roll = Math.random();
            if (roll < 0.3) return 'kick';
            if (roll < 0.6) return 'hihat';
            if (roll < 0.85) return 'ride';
            return 'hihat_pedal'; // Pedal hat for groove
        } else if (this.lastDrumType === 'hihat' || this.lastDrumType === 'hihat_pedal') {
            return Math.random() < 0.6 ? 'kick' : 'snare';
        } else {
            return Math.random() < 0.5 ? 'kick' : 'snare';
        }
    }
    
    // Calculate velocity based on gameplay intensity
    calculateVelocity(baseIntensity) {
        const recentHitsCount = this.recentHits.length;
        const velocityMod = 0.3 + (recentHitsCount / 15) * 0.7; // 0.3 to 1.0
        return Math.min(baseIntensity * velocityMod, 1.0);
    }
    
    // Calculate swing timing offset for jazz feel
    calculateSwingOffset() {
        if (!this.chordProgressionActive) return 0;
        
        const beatDuration = 60 / this.bpm;
        const currentBeat = (this.audioContext.currentTime - this.beatStartTime) % beatDuration;
        const beatPhase = currentBeat / beatDuration;
        
        // Add swing to off-beats (swing eighth notes)
        if (beatPhase > 0.25 && beatPhase < 0.75) {
            return this.swingAmount * (beatDuration / 4); // Delay off-beats slightly
        }
        
        return 0;
    }

    // Update gain levels from mixing board
    updateGainLevels(channel, value) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        switch(channel) {
            case 'bass':
                this.basslineGain.gain.setValueAtTime(value, now);
                break;
            case 'chord':
                this.chordGain.gain.setValueAtTime(value, now);
                break;
            case 'arp':
                this.arpGain.gain.setValueAtTime(value, now);
                break;
            case 'impact':
                this.impactGain.gain.setValueAtTime(value, now);
                break;
            case 'hihat':
                this.hiHatGain.gain.setValueAtTime(value, now);
                break;
            case 'jazz':
                this.jazzDrumGain.gain.setValueAtTime(value, now);
                break;
            case 'delay':
                // Delay system removed
                break;
            case 'master':
                this.masterGain.gain.setValueAtTime(value, now);
                break;
        }
    }

    // Sound Sculptor parameter application
    applySculptParameter(type, param, value) {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create sculptor nodes if they don't exist
        if (!this.sculptorFilter) {
            this.sculptorFilter = this.audioContext.createBiquadFilter();
            this.sculptorFilter.type = 'lowpass';
            this.sculptorFilter.frequency.value = 20000;
            this.sculptorFilter.Q.value = 0;
        }

        switch(type) {
            case 'filter':
                if (param === 'cutoff') {
                    this.sculptorFilter.frequency.setValueAtTime(value, now);
                } else if (param === 'resonance') {
                    this.sculptorFilter.Q.setValueAtTime(value, now);
                }
                break;

            case 'mix':
                // Map to existing gain controls
                const channelMap = { drums: 'jazz', bass: 'bass', chords: 'chord' };
                const channel = channelMap[param];
                if (channel) {
                    this.updateGainLevels(channel, value / 100);
                }
                break;

            case 'effects':
                // Store for future reverb/delay implementation
                if (!this.sculptorEffects) this.sculptorEffects = {};
                this.sculptorEffects[param] = value;
                debugLog(`🎛️ Sculptor ${param}: ${value}%`);
                break;

            case 'color':
                // Store drive/bitcrush values
                if (!this.sculptorColor) this.sculptorColor = {};
                this.sculptorColor[param] = value;
                debugLog(`🎛️ Sculptor ${param}: ${value}`);
                break;
        }
    }

    // Removed updateDelayFeedback function

    // Removed scheduleDelayFadeout function
}

// Global audio engine instance
const audioEngine = new GameAudioEngine();
window.audioEngine = audioEngine; // Expose globally for mute controls

// Audio Drop Zone Setup
const audioDropZone = document.getElementById('audioDropZone');

if (audioDropZone) {
    debugLog('✓ Audio drop zone found');
    
audioDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    audioDropZone.classList.add('drag-over');
});

audioDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    audioDropZone.classList.remove('drag-over');
});

audioDropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    audioDropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
        audioDropZone.textContent = 'Please drop audio files only';
        setTimeout(() => {
            audioDropZone.textContent = 'Drop audio files here for custom samples';
        }, 2000);
        return;
    }
    
    await audioEngine.initialize();
    let successCount = 0;
    
    for (const file of audioFiles) {
        const success = await audioEngine.addCustomSample(file);
        if (success) successCount++;
    }
    
    audioDropZone.textContent = `Added ${successCount}/${audioFiles.length} samples`;
    setTimeout(() => {
        audioDropZone.textContent = 'Drop audio files here for custom samples';
    }, 3000);
});

} else {
    console.error('❌ Audio drop zone not found in DOM');
}

// Modern high-quality visual system
const colors = {
    // Atmospheric gradient backgrounds
    bg: {
        primary: '#0a0a23',
        secondary: '#1a1a3a',
        accent: '#2d1b69'
    },
    // Glass morphism elements
    glass: {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.15)',
        dark: 'rgba(255, 255, 255, 0.05)'
    },
    // Enhanced ball system
    ball: {
        primary: '#00ff88',
        glow: '#44ffaa',
        trail: '#88ffcc',
        energy: '#aaffdd'
    },
    // HP-based block colors (1-10+ scale)
    blockByHP: {
        1: { base: '#4CAF50', glow: '#81C784', shadow: '#388E3C' },  // Green
        2: { base: '#8BC34A', glow: '#AED581', shadow: '#689F38' },  // Light Green
        3: { base: '#FFEB3B', glow: '#FFF176', shadow: '#FBC02D' },  // Yellow
        4: { base: '#FFC107', glow: '#FFD54F', shadow: '#FFA000' },  // Amber
        5: { base: '#FF9800', glow: '#FFB74D', shadow: '#F57C00' },  // Orange
        6: { base: '#FF5722', glow: '#FF8A65', shadow: '#E64A19' },  // Deep Orange
        7: { base: '#F44336', glow: '#EF5350', shadow: '#D32F2F' },  // Red
        8: { base: '#E91E63', glow: '#EC407A', shadow: '#C2185B' },  // Pink
        9: { base: '#9C27B0', glow: '#BA68C8', shadow: '#7B1FA2' },  // Purple
        10: { base: '#673AB7', glow: '#9575CD', shadow: '#512DA8' }, // Deep Purple
        // Higher values
        default: { base: '#3F51B5', glow: '#7986CB', shadow: '#303F9F' } // Indigo for 11+
    },
    // Special block types
    special: {
        spawner: { base: '#FFD700', glow: '#FFF59D', shadow: '#F9A825' }, // Gold
        exploder: { base: '#FF6F00', glow: '#FFB300', shadow: '#E65100' }  // Bright Orange
    },
    // Keep old block colors for compatibility
    block: {
        crystal: { base: '#ff6b6b', glow: '#ff8e8e', shadow: '#cc4444' },
        metal: { base: '#ffa726', glow: '#ffcc56', shadow: '#cc7700' },
        energy: { base: '#42a5f5', glow: '#66bbff', shadow: '#2e7dd2' },
        bio: { base: '#26c6da', glow: '#4dd0e1', shadow: '#0097a7' },
        titanium: { base: '#9e9e9e', glow: '#e0e0e0', shadow: '#616161' },
        plasma: { base: '#e91e63', glow: '#ff6ec7', shadow: '#ad1457' },
        quantum: { base: '#9c27b0', glow: '#ce93d8', shadow: '#6a1b9a' }
    },
    // Luxury powerup colors
    powerup: {
        base: '#e1bee7',
        glow: '#f8bbd9',
        core: '#ffffff',
        pulse: '#ff4081'
    },
    // UI elements
    ui: {
        text: '#ffffff',
        accent: '#64ffda',
        warning: '#ff5722',
        success: '#4caf50'
    }
};

// Ball creation function
function createBall(x, y) {
    return {
        x: x || BALL_START_X,
        y: y || BALL_START_Y,
        radius: 8,
        speedX: 0,
        speedY: 0,
        active: false,
        trail: [],
        energy: 1.0
    };
}

// Global particles array
const particles = [];

function createImpactParticles(x, y, color) {
    for (let i = 0; i < 6; i++) {
        particles.push({
            x: x,
            y: y,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            size: Math.random() * 4 + 2,
            color: color,
            life: 1.0,
            decay: 0.02
        });
    }
}

function createDestructionParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x,
            y: y,
            speedX: (Math.random() - 0.5) * 12,
            speedY: (Math.random() - 0.5) * 12,
            size: Math.random() * 6 + 3,
            color: color,
            life: 1.0,
            decay: 0.015
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        // Frame-rate independent particle movement
        particle.x += particle.speedX * deltaMultiplier;
        particle.y += particle.speedY * deltaMultiplier;
        const friction = Math.pow(0.98, deltaMultiplier);
        particle.speedX *= friction;
        particle.speedY *= friction;
        particle.life -= particle.decay;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
}

function checkBlockCollision(ball, block) {
    // Ball-to-rectangle collision detection
    // Find the closest point on the rectangle to the ball center
    const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
    const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));
    
    // Calculate distance from ball center to closest point
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < ball.radius;
}

let gameOverProcessed = false;

function gameOver() {
    if (gameOverProcessed) {
        debugLog('🚨 Game over already processed, skipping');
        return;
    }
    
    debugLog('🚨 GAME OVER! Blocks reached danger line');
    gameOverProcessed = true;
    
    // ⚠️⚠️⚠️ CRITICAL: USE PROTECTED GAME OVER FLOW ⚠️⚠️⚠️
    // This handles score preservation, high score check, and leaderboard submission
    const currentScore = score;
    debugLog(`🔒 Using protected game over flow for score: ${currentScore}`);
    
    // Use the protected game over flow
    if (typeof window.PROTECTED_gameOverFlow === 'function') {
        const finalScore = window.PROTECTED_gameOverFlow(currentScore);
        debugLog(`🔒 Protected flow completed with final score: ${finalScore}`);
    } else {
        console.error('🔒 PROTECTED ERROR: PROTECTED_gameOverFlow not available, using fallback');
        
        // Fallback to original logic
        const finalScore = score;
        debugLog(`💾 Fallback: Saving final score before reset: ${finalScore}`);
        
        stopGame();
        
        if (isHighScore(finalScore)) {
            debugLog(`🎉 Fallback: Showing name input dialog for high score: ${finalScore}`);
            showNameInputDialog(finalScore);
        }
        // DEBUG mode removed - now only records top 15 scores
    }
    // ⚠️⚠️⚠️ END CRITICAL LEADERBOARD CODE ⚠️⚠️⚠️
    
    if (startBtn) {
        startBtn.textContent = 'PLAY AGAIN';
        startBtn.style.display = 'block';
        debugLog('🔴 Start button shown as PLAY AGAIN');
    } else {
        debugWarn('⚠️ Start button not found in DOM');
    }
    
    if (pauseBtn) {
        pauseBtn.style.display = 'none';
    } else {
        debugWarn('⚠️ Pause button not found in DOM');
    }
    
    if (endGameBtn) {
        endGameBtn.style.display = 'none';
    }
}

function drawAnimatedBackground() {
    // Check if canvas and ctx are initialized
    if (!canvas || !ctx) {
        console.error('Canvas or context not initialized in drawAnimatedBackground');
        return;
    }
    
    // Base gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.bg.primary);
    gradient.addColorStop(0.5, colors.bg.secondary);
    gradient.addColorStop(1, colors.bg.accent);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Animated floating shapes
    const time = Date.now() * 0.001;
    
    // Subtle moving patterns
    for (let i = 0; i < 3; i++) {
        const x = (Math.sin(time * 0.5 + i * 2) * 100) + canvas.width / 2;
        const y = (Math.cos(time * 0.3 + i * 1.5) * 80) + canvas.height / 2;
        const radius = 40 + Math.sin(time + i) * 20;
        
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = colors.glass.light;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    // Subtle grid pattern
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = colors.ui.accent;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
}

// Function to set up event listeners after DOM is ready
function setupEventListeners() {
    if (!canvas) {
        console.error('Cannot setup event listeners - canvas not initialized');
        return;
    }
    
    canvas.addEventListener('mousedown', async (e) => {
    debugLog(`Mouse click - Game state: ${gameState}, Turn in progress: ${turnInProgress}, Active balls: ${balls.length}`);
    
    // Start game on first click if idle
    if (gameState === 'idle') {
        await audioEngine.initialize();
        audioEngine.playUIClick();
        startGame();
        return;
    }
    
    // Only allow aiming if game is playing
    if (gameState !== 'playing') {
        debugLog('Cannot aim: game not playing');
        return;
    }
    
    // Sync with window value (for detonator system)
    if (window.turnInProgress !== undefined) {
        turnInProgress = window.turnInProgress;
    }
    
    // Enforce turn-based system - only one shot per turn
    if (turnInProgress) {
        debugLog('❌ Cannot shoot - turn in progress, wait for ball to return');
        return;
    }
    
    await audioEngine.initialize();
    
    const rect = canvas.getBoundingClientRect();
    aimStartX = nextBallStartX;  // Use the remembered position from last turn
    aimStartY = BALL_START_Y;
    aimEndX = e.clientX - rect.left;
    aimEndY = e.clientY - rect.top;
    isAiming = true;
    
    debugLog(`Aiming from position x=${Math.floor(aimStartX)} (where last ball hit)`);
    
    audioEngine.playUIClick();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isAiming) return;
    
    const rect = canvas.getBoundingClientRect();
    aimEndX = e.clientX - rect.left;
    aimEndY = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', (e) => {
    if (!isAiming) return;
    
    const rect = canvas.getBoundingClientRect();
    aimEndX = e.clientX - rect.left;
    aimEndY = e.clientY - rect.top;
    
    // Launch ball
    launchBall();
    isAiming = false;
});

function launchBall() {
    // Start turn
    turnInProgress = true;
    window.turnInProgress = true;
    debugLog(`Turn started - launching ${ballsForNextShot} balls`);
    
    const dx = aimEndX - aimStartX;
    const dy = aimEndY - aimStartY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length > 0) {
        // Calculate dynamic speed based on drag distance
        const minSpeed = 3;
        const maxSpeed = 12;
        const maxDragDistance = 150; // Maximum meaningful drag distance
        
        // Scale speed based on drag distance
        const dragDistance = Math.min(length, maxDragDistance);
        const speed = minSpeed + (maxSpeed - minSpeed) * (dragDistance / maxDragDistance);
        
        // Play launch sound once (not per ball)
        audioEngine.playLaunch();

        // Launch all balls immediately
        for (let i = 0; i < ballsForNextShot; i++) {
            const ball = createBall(nextBallStartX, BALL_START_Y);
            ball.speedX = (dx / length) * speed;
            ball.speedY = (dy / length) * speed;
            ball.active = true;
            balls.push(ball);

            debugLog(`Ball ${i + 1}/${ballsForNextShot} launched! Active balls: ${balls.length}`);
        }
        
        // Next shot will be set when turn ends
    }
}

    if (startBtn) {
        startBtn.addEventListener('click', async () => {
    await audioEngine.initialize();
    audioEngine.playUIClick();
            startGame();
        });
    }
    
    // Test bass button
    const testBassBtn = document.getElementById('testBassBtn');
    if (testBassBtn) {
        testBassBtn.addEventListener('click', async () => {
    await audioEngine.initialize();
            audioEngine.testBassOnly();
        });
    }
    
    // Pause button
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (gameState === 'playing') {
                gameState = 'paused';
                pauseBtn.textContent = 'RESUME';
                pauseBtn.classList.add('resume');

                // Music continues playing when paused (for sound sculpting)
                debugLog('🎵 Music continues during pause');

                // Pause timer when game is paused
                if (window.GlobalTimeTracker) {
                    window.GlobalTimeTracker.stopTracking();
                    debugLog('⏱️ Timer paused');
                }

                debugLog('Game paused');
            } else if (gameState === 'paused') {
                gameState = 'playing';
                pauseBtn.textContent = 'PAUSE';
                pauseBtn.classList.remove('resume');

                // Resume timer when game is resumed
                if (window.GlobalTimeTracker) {
                    window.GlobalTimeTracker.startTracking();
                    debugLog('⏱️ Timer resumed');
                }

                debugLog('Game resumed');
                gameLoop();
            }
        });
    }
    
    // End Game button
    if (endGameBtn) {
        endGameBtn.addEventListener('click', () => {
            if (gameState === 'playing' || gameState === 'paused') {
                debugLog('🛑 End Game button clicked - triggering game over');
                
                // If game is paused, unpause it first so the score is properly handled
                if (gameState === 'paused') {
                    gameState = 'playing';
                }
                
                // Manually trigger game over to check for high score
                gameOver();
            }
        });
        debugLog('✅ End Game button event listener added');
    }
    
    debugLog('Event listeners setup complete');
}

// Mixing board controls
function initializeMixingBoard() {
    if (!document.getElementById('bassGain')) {
        debugLog('Mixing board controls not found yet, skipping initialization');
        return;
    }
    const controls = [
        { id: 'bassGain', channel: 'bass', valueId: 'bassValue' },
        { id: 'chordGain', channel: 'chord', valueId: 'chordValue' },
        { id: 'arpGain', channel: 'arp', valueId: 'arpValue' },
        { id: 'impactGain', channel: 'impact', valueId: 'impactValue' },
        { id: 'hihatGain', channel: 'hihat', valueId: 'hihatValue' },
        { id: 'jazzGain', channel: 'jazz', valueId: 'jazzValue' },
        // Removed delay send control
        { id: 'masterGain', channel: 'master', valueId: 'masterValue' }
    ];

    controls.forEach(control => {
        const slider = document.getElementById(control.id);
        const valueDisplay = document.getElementById(control.valueId);
        
        // Initialize with current slider value
        const initialValue = parseFloat(slider.value);
        valueDisplay.textContent = Math.round(initialValue * 100) + '%';
        audioEngine.updateGainLevels(control.channel, initialValue);
        
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            valueDisplay.textContent = Math.round(value * 100) + '%';
            audioEngine.updateGainLevels(control.channel, value);
        });
    });
    
    // Removed delay feedback control
}

// Initialize mixing board when DOM is ready
document.addEventListener('DOMContentLoaded', initializeMixingBoard);

// Sound Sculpt Popup System
function initializeSoundSculptPopup() {
    console.log('🎛️ Initializing Sound Sculpt Popup...');
    const popup = document.getElementById('soundSculptPopup');
    const openBtn = document.getElementById('soundSculptBtn');
    const closeBtn = document.getElementById('closeSculptBtn');

    console.log('🎛️ Popup element:', popup);
    console.log('🎛️ Open button element:', openBtn);
    console.log('🎛️ Close button element:', closeBtn);

    if (!popup || !openBtn) {
        console.error('❌ Sound sculpt popup elements not found! popup:', popup, 'openBtn:', openBtn);
        return;
    }

    // Open popup
    openBtn.addEventListener('click', () => {
        console.log('🎛️ SCULPT BUTTON CLICKED!');
        popup.style.display = 'flex';
        console.log('🎛️ Sound Sculptor opened, popup display:', popup.style.display);
    });

    // Close popup
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            debugLog('🎛️ Sound Sculptor closed');
        });
    }

    // Close on background click
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.style.display = 'none';
        }
    });

    // Connect sliders to audio engine
    const sliderConfigs = [
        { id: 'sculptFilterCutoff', valueId: 'sculptFilterCutoffVal', type: 'filter', param: 'cutoff', format: v => v >= 1000 ? (v/1000).toFixed(1) + 'kHz' : v + 'Hz' },
        { id: 'sculptFilterRes', valueId: 'sculptFilterResVal', type: 'filter', param: 'resonance', format: v => v.toString() },
        { id: 'sculptDrive', valueId: 'sculptDriveVal', type: 'color', param: 'drive', format: v => v + '%' },
        { id: 'sculptBitCrush', valueId: 'sculptBitCrushVal', type: 'color', param: 'bitcrush', format: v => v.toString() },
        { id: 'sculptReverb', valueId: 'sculptReverbVal', type: 'effects', param: 'reverb', format: v => v + '%' },
        { id: 'sculptDelay', valueId: 'sculptDelayVal', type: 'effects', param: 'delay', format: v => v + '%' },
        { id: 'sculptDrums', valueId: 'sculptDrumsVal', type: 'mix', param: 'drums', format: v => v + '%' },
        { id: 'sculptBass', valueId: 'sculptBassVal', type: 'mix', param: 'bass', format: v => v + '%' },
        { id: 'sculptChords', valueId: 'sculptChordsVal', type: 'mix', param: 'chords', format: v => v + '%' }
    ];

    sliderConfigs.forEach(config => {
        const slider = document.getElementById(config.id);
        const valueDisplay = document.getElementById(config.valueId);

        if (!slider) return;

        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            if (valueDisplay) {
                valueDisplay.textContent = config.format(value);
            }

            // Apply to audio engine
            if (audioEngine && audioEngine.applySculptParameter) {
                audioEngine.applySculptParameter(config.type, config.param, value);
            } else if (audioEngine) {
                // Fallback: use existing gain controls for mix
                if (config.type === 'mix') {
                    const channelMap = { drums: 'jazz', bass: 'bass', chords: 'chord' };
                    const channel = channelMap[config.param];
                    if (channel) {
                        audioEngine.updateGainLevels(channel, value / 100);
                    }
                }
            }
        });
    });

    console.log('✅ Sound Sculpt popup initialized successfully!');
}

// Initialize sound sculpt when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎛️ DOM loaded, calling initializeSoundSculptPopup...');
    initializeSoundSculptPopup();
});

// Pause button event listener moved to setupEventListeners()

// Speed slider disabled - speed locked to 1.0x
// speedSlider.addEventListener('input', () => {
//     blockSpeedMultiplier = parseFloat(speedSlider.value);
//     speedValue.textContent = blockSpeedMultiplier.toFixed(1) + 'x';
// });

function stopGame() {
    debugLog('🛑 Stopping game and resetting all variables...');
    
    // Stop time tracking
    if (window.GlobalTimeTracker && window.GlobalTimeTracker.isTracking()) {
        window.GlobalTimeTracker.stopTracking();
        debugLog('⏱️ Stopped time tracking');
    }
    
    // Stop all audio immediately
    if (audioEngine) {
        audioEngine.pauseAudio();
        audioEngine.stopChordProgression();
        audioEngine.stopGlitchHopTrack();
        debugLog('🔇 All audio stopped');
    }

    // Stop drum layer system
    if (window.DrumLayerSystem) {
        window.DrumLayerSystem.stop();
        debugLog('🥁 Drum layer system stopped');
    }

    // Hide sound sculpt button and close popup
    const soundSculptBtn = document.getElementById('soundSculptBtn');
    const soundSculptPopup = document.getElementById('soundSculptPopup');
    if (soundSculptBtn) soundSculptBtn.style.display = 'none';
    if (soundSculptPopup) soundSculptPopup.style.display = 'none';

    // Reset ALL game variables to initial state
    gameState = 'idle';
    gameOverProcessed = false;
    turnInProgress = false;
    window.turnInProgress = false;
    baseBallCount = 1;
    window.baseBallCount = baseBallCount;
    ballsForNextShot = 1;
    window.ballsForNextShot = ballsForNextShot;
    nextBallStartX = BALL_START_X;
    firstBallOfTurn = true;
    window.firstBallOfTurn = true;
    lastRowSpawnTime = 0;
    
    // Reset powerup tracking
    nextScorePowerup = 500;
    rowsSpawned = 0;
    firstSixRowPowerupGiven = false;
    
    // Clear all arrays
    powerups.length = 0;
    balls.length = 0;
    blocks.length = 0;
    
    // Reset score and level
    score = 0;
    level = 1;
    
    // Reset aiming state
    isAiming = false;
    aimStartX = 0;
    aimStartY = 0;
    aimEndX = 0;
    aimEndY = 0;
    launchIndex = 0;
    
    // Reset timing
    levelTransitioning = false;
    lastRowSpawnTime = 0;
    
    debugLog('✅ Game completely reset to initial state');
}

// Expose stopGame globally
window.stopGame = stopGame;

let startGameInProgress = false;

async function startGame() {
    // Prevent multiple concurrent calls
    if (startGameInProgress) {
        debugLog('⚠️ startGame already in progress, ignoring duplicate call');
        return;
    }
    startGameInProgress = true;

    debugLog('🚀 Starting new game...');

    // First stop any existing game to ensure clean state
    stopGame();

    // Set loading state to prevent input during initialization
    // Must be AFTER stopGame() since stopGame sets state to 'idle'
    gameState = 'loading';
    window.gameState = 'loading';

    // Reload scores from localStorage and refresh leaderboard display
    const currentMode = window.currentGameMode?.id || window.selectedGameMode || 'original';
    if (window.reloadLocalScores) {
        window.reloadLocalScores();
        debugLog(`🏆 Reloaded local scores for all modes`);
    }
    if (window.updateLeaderboardDisplay) {
        window.updateLeaderboardDisplay();
        debugLog(`🏆 Leaderboard display refreshed for ${currentMode}`);
    }

    // Resume audio context (in case it was suspended from pause or menu return)
    if (audioEngine) {
        audioEngine.resumeAudio();
    }

    // Reset spawn timer for this new game
    lastRowSpawnTime = Date.now();

    debugLog('🎵 Starting audio engine...');

    // Initialize audio if not already done
    if (!audioEngine.initialized) {
        await audioEngine.initialize();
        debugLog('✓ Audio initialized');
    }

    // Try to load saved chord progression from audio editor
    // currentMode already declared above
    debugLog('🎵 Detected game mode for music:', currentMode);
    debugLog('🎵 window.currentGameMode:', window.currentGameMode);
    debugLog('🎵 window.selectedGameMode:', window.selectedGameMode);
    debugLog('🎵 audioEngine.loadSavedProgression exists:', typeof audioEngine.loadSavedProgression);

    if (audioEngine.loadSavedProgression && audioEngine.loadSavedProgression(currentMode)) {
        debugLog('✓ Loaded saved chord progression from audio editor');
    } else {
        debugLog('✓ Using default chord progression (no saved pattern found)');
    }

    // Try to load pre-rendered mixdown audio (much better quality)
    // IMPORTANT: Must await this before starting chord progression!
    let mixdownLoaded = false;
    if (audioEngine.loadMixdownAudio) {
        try {
            mixdownLoaded = await audioEngine.loadMixdownAudio(currentMode);
            if (mixdownLoaded) {
                debugLog('✓ Mixdown audio loaded - will use pre-rendered audio');
            } else {
                debugLog('✓ No mixdown found - will use real-time synthesis');
            }
        } catch (e) {
            debugWarn('Failed to load mixdown:', e);
        }
    }

    // DISABLED: Game audio now handled by Audio Editor (iframe sequencer)
    // audioEngine.startChordProgression();
    // audioEngine.startAmbientPleasure();
    // audioEngine.startGlitchHopTrack();
    debugLog('🎵 Game audio disabled - using Audio Editor sequencer');

    // Start drum layer system - loads config from localStorage based on game mode
    // AWAIT this to ensure it's ready before game starts
    if (window.DrumLayerSystem) {
        try {
            await window.DrumLayerSystem.init(currentMode);
            window.DrumLayerSystem.start();
            debugLog(`🥁 Drum layer system started for mode: ${currentMode}`);
        } catch (e) {
            debugWarn('Drum layer system failed to init:', e);
        }
    }

    // Generate level BEFORE setting game to playing state
    debugLog('🏗️ Generating initial level...');
    generateLevel();

    // Verify block colors are correct after generation
    debugLog('🎨 Verifying block theme colors...');
    verifyBlockColorsAfterGeneration();

    pauseBtn.style.display = 'block';
    pauseBtn.textContent = 'PAUSE';
    pauseBtn.classList.remove('resume');

    // Show Sound Sculpt button
    const soundSculptBtn = document.getElementById('soundSculptBtn');
    if (soundSculptBtn) {
        soundSculptBtn.style.display = 'block';
    }

    // Show End Game button
    if (endGameBtn) {
        endGameBtn.style.display = 'block';
    }

    debugLog('📊 Updating UI...');
    updateUI();

    // NOW set to playing state after all loading is complete
    gameState = 'playing';
    window.gameState = 'playing';

    // Start time tracking when game begins (after everything loaded)
    if (window.GlobalTimeTracker) {
        window.GlobalTimeTracker.startTracking();
        debugLog('⏱️ Started time tracking for new game');
    }

    debugLog('🔄 Starting game loop...');
    coreGameLoop(performance.now());

    // Reset the in-progress flag now that game is fully started
    startGameInProgress = false;

    debugLog(`✅ Game started - Level: ${level}, Blocks: ${blocks.length}, Turn ready: ${!turnInProgress}`);
}

// Expose startGame globally - clean architecture approach
window.startGame = startGame;

// Protect core gameLoop from wrapper interference
const coreGameLoop = gameLoop;
window.coreGameLoop = coreGameLoop;

function verifyBlockColorsAfterGeneration() {
    if (!blocks || blocks.length === 0) {
        debugWarn('⚠️ No blocks to verify colors for');
        return;
    }
    
    if (!window.getThemeBlockColors || typeof window.getThemeBlockColors !== 'function') {
        debugWarn('⚠️ Theme color function not available');
        return;
    }
    
    let correctColorsFound = 0;
    let totalBlocksChecked = 0;
    
    // Check first 10 blocks (or all blocks if fewer)
    const blocksToCheck = Math.min(10, blocks.length);
    
    for (let i = 0; i < blocksToCheck; i++) {
        const block = blocks[i];
        if (!block.destroyed) {
            totalBlocksChecked++;
            try {
                const expectedColor = window.getThemeBlockColors(`hp${block.hitPoints}`, 'full');
                if (expectedColor && expectedColor.fill && expectedColor.fill !== '#666666') {
                    correctColorsFound++;
                }
            } catch (error) {
                // Skip this block
            }
        }
    }
    
    const colorSuccess = (correctColorsFound / totalBlocksChecked) * 100;
    
    if (correctColorsFound >= totalBlocksChecked * 0.8) { // 80% success rate
        debugLog(`✅ Block colors verified successfully: ${correctColorsFound}/${totalBlocksChecked} blocks (${colorSuccess.toFixed(1)}%) have correct theme colors`);
    } else if (correctColorsFound > 0) {
        debugWarn(`⚠️ Some blocks may have incorrect colors: ${correctColorsFound}/${totalBlocksChecked} blocks (${colorSuccess.toFixed(1)}%) have correct theme colors`);
    } else {
        console.error(`❌ Block colors verification failed: blocks may appear grey. Check theme integration.`);
    }
}

function generateLevel() {
    debugLog(`🎯 Generating Level ${level} - Calculating difficulty...`);
    
    // Progressive difficulty scaling - start simple
    const difficultyTier = Math.floor((level - 1) / 5); // Every 5 levels = new difficulty tier
    const rows = 6; // Always start with 6 rows
    const blocksPerRow = BLOCKS_PER_ROW;
    
    // Don't count initial rows toward the spawning counter
    debugLog(`📊 Starting with ${rows} rows of blocks`);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < blocksPerRow; col++) {
            // Skip some cells randomly for variety (each cell has random chance to be filled)
            if (Math.random() < 0.4) continue; // 40% chance to skip each cell
            
            const blockX = BLOCK_START_X + col * BLOCK_WIDTH;
            const blockY = BLOCK_START_Y + row * BLOCK_HEIGHT;
            
            // Different block types based on difficulty tier
            let blockTypes = ['crystal', 'metal', 'energy', 'bio'];
            
            // Add special block types at higher difficulty tiers
            if (difficultyTier >= 2) blockTypes.push('titanium'); // Tier 2+ (Level 11+)
            if (difficultyTier >= 4) blockTypes.push('plasma'); // Tier 4+ (Level 21+)
            if (difficultyTier >= 6) blockTypes.push('quantum'); // Tier 6+ (Level 31+)
            
            let blockType = blockTypes[row % blockTypes.length];
            
            // 20% chance for special blocks at higher tiers
            if (difficultyTier >= 2 && Math.random() < 0.2) {
                const specialTypes = ['titanium', 'plasma', 'quantum'].filter(type => blockTypes.includes(type));
                if (specialTypes.length > 0) {
                    blockType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
                }
            }
            
            // HP scaling based on score tiers (every 1000 points)
            const scoreTier = Math.floor(score / 1000);
            let hp;
            
            if (scoreTier === 0) {
                // 0-1000: 75% 1s, 20% 2s, 5% 3s (no higher)
                const rand = Math.random();
                if (rand < 0.75) hp = 1;       // 75% chance of 1
                else if (rand < 0.95) hp = 2;  // 20% chance of 2
                else hp = 3;                   // 5% chance of 3 (max)
            } else {
                // 1000+ points: Only 1s, 2s, and 3s (much more gradual)
                const rand = Math.random();
                if (rand < 0.5) hp = 2;        // 50% chance of 2
                else if (rand < 0.85) hp = 3;  // 35% chance of 3
                else hp = 1;                   // 15% chance of 1 (easier blocks mixed in)
            }
            
            // Small bonuses for special blocks (reduced to keep HP reasonable)
            if (blockType === 'titanium') hp = Math.min(hp + 1, 4); // Max 4 HP
            if (blockType === 'plasma') hp = Math.min(hp + 2, 5);   // Max 5 HP
            if (blockType === 'quantum') hp = Math.min(hp + 2, 6);  // Max 6 HP
            
            // 5% chance for special blocks (2.5% spawner, 2.5% exploder)
            let isSpecial = false;
            let specialType = null;
            if (Math.random() < 0.025) {
                isSpecial = true;
                specialType = 'spawner';
            } else if (Math.random() < 0.025) {
                isSpecial = true;
                specialType = 'exploder';
            } else if (window.currentGameMode?.id === 'iceFrost' && Math.random() < 0.08) {
                isSpecial = true;
                specialType = 'freeze';
            }
            
            blocks.push({
                x: blockX,
                y: blockY,
                width: BLOCK_WIDTH,
                height: BLOCK_HEIGHT,
                hitPoints: hp,
                maxHitPoints: hp,
                type: blockType,
                isSpecial: isSpecial,
                specialType: specialType,
                destroyed: false,
                glow: 0,
                glowDirection: 1
            });
        }
    }
    
    // Place a single +1 ball powerup randomly within the initial 6 rows
    const powerupRow = Math.floor(Math.random() * rows); // Random row 0-5
    const powerupCol = Math.random(); // Random position across width
    const powerupX = 50 + powerupCol * (canvas.width - 100);
    const powerupY = BLOCK_START_Y + powerupRow * BLOCK_HEIGHT + BLOCK_HEIGHT / 2;
    
    // Add the initial +1 ball powerup
    powerups.push({
        x: powerupX,
        y: powerupY,
        radius: 12,
        ballValue: 1,
        glow: Math.random() * Math.PI * 2,
        collected: false,
        type: 'ball'
    });
    
    debugLog(`🎯 Placed initial +1 ball powerup at row ${powerupRow + 1}, position (${Math.floor(powerupX)}, ${Math.floor(powerupY)})`);
    
    // Mark that we've given the first powerup
    firstSixRowPowerupGiven = true;
    
    // Update UI
    updateBlocksLeft();
    
    // Log difficulty stats
    const avgHP = blocks.reduce((sum, block) => sum + block.hitPoints, 0) / blocks.length;
    debugLog(`📊 Level ${level} Stats: ${rows} rows, Tier ${difficultyTier}, Avg HP: ${avgHP.toFixed(1)}, ${blocks.length} total blobs`);
}

function updateBlocksLeft() {
    const remainingBlocks = blocks.filter(block => !block.destroyed).length;
    blocksLeftElement.textContent = remainingBlocks;
    
    // Check if level complete - as soon as all blocks destroyed
    if (remainingBlocks === 0) {
        debugLog('Level complete! Moving to next level...');
        levelComplete();
    }
}

function updateUI() {
    // Sync with window values (for detonator system)
    if (window.baseBallCount !== undefined) {
        baseBallCount = window.baseBallCount;
    }
    if (window.ballsForNextShot !== undefined) {
        ballsForNextShot = window.ballsForNextShot;
    }

    scoreElement.textContent = score;
    levelElement.textContent = level;
    ballsLeftElement.textContent = baseBallCount;
    blocksLeftElement.textContent = blocks.filter(block => !block.destroyed).length;

    // Update drum layer system with current score and ball count (only during active gameplay)
    if (window.DrumLayerSystem && window.DrumLayerSystem.isInitialized && window.DrumLayerSystem.isPlaying) {
        window.DrumLayerSystem.updateScore(score);
        window.DrumLayerSystem.updateBalls(baseBallCount);
    }
}

function advanceBlocks() {
    debugLog('Advancing blocks down one row');
    
    // Move all existing blocks down one row (except frozen ones)
    blocks.forEach(block => {
        if (!block.frozen) {
            block.y += BLOCK_HEIGHT;
        }
    });
    
    // Move all powerups down as well
    powerups.forEach(powerup => {
        if (!powerup.collected) {
            powerup.y += BLOCK_HEIGHT;
        }
    });
    
    // Check if any blocks reached the danger line (game over condition)
    const dangerY = canvas.height - 50; // Danger line very close to bottom for maximum play space
    const blocksInDanger = blocks.filter(block => !block.destroyed && block.y >= dangerY);
    
    if (blocksInDanger.length > 0) {
        debugLog('🚨 Blocks reached danger line - Game Over!');
        gameOver();
        return;
    }
    
    // Add new row of blocks at the top every turn for now
    addNewBlockRow();
    
    updateUI();
}

function addNewBlockRow() {
    debugLog('Adding new block row at top');
    
    const blocksPerRow = BLOCKS_PER_ROW;
    const blocksBeforeAdd = blocks.length;
    
    for (let col = 0; col < blocksPerRow; col++) {
        // Don't skip blocks for now - add them all for testing
        const blockX = BLOCK_START_X + col * BLOCK_WIDTH;
        const blockY = BLOCK_START_Y;
        
        // Random block types
        const blockTypes = ['crystal', 'metal', 'energy', 'bio'];
        const blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
        
        // HP based on current difficulty
        const hp = 1 + Math.floor(Math.random() * 3);
        
        const newBlock = {
            x: blockX,
            y: blockY,
            width: BLOCK_WIDTH,
            height: BLOCK_HEIGHT,
            type: blockType,
            hitPoints: hp,
            maxHitPoints: hp,
            destroyed: false,
            glow: 0,
            glowDirection: 1
        };
        
        blocks.push(newBlock);
        debugLog(`Added block at (${blockX}, ${blockY}) with HP ${hp}`);
    }
    
    debugLog(`Added ${blocks.length - blocksBeforeAdd} new blocks. Total blocks: ${blocks.length}`);
    
    // Don't add powerups after every turn anymore - they come with natural spawning
}

function spawnNewRowAtTop() {
    debugLog('🔄 Spawning new row at top due to continuous movement');
    
    const difficultyTier = Math.floor((level - 1) / 5);
    const blocksPerRow = BLOCKS_PER_ROW;
    const spawnY = BLOCK_START_Y - BLOCK_HEIGHT; // Spawn above visible area
    
    for (let col = 0; col < blocksPerRow; col++) {
        // Skip some cells randomly for variety (each cell has random chance to be filled)
        if (Math.random() < 0.4) continue; // 40% chance to skip each cell
        
        const blockX = BLOCK_START_X + col * BLOCK_WIDTH;
        
        // Block type selection with difficulty scaling
        let blockTypes = ['crystal', 'metal', 'energy', 'bio'];
        if (difficultyTier >= 2) blockTypes.push('titanium');
        if (difficultyTier >= 4) blockTypes.push('plasma');
        if (difficultyTier >= 6) blockTypes.push('quantum');
        
        let blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
        
        // Special block chance
        if (difficultyTier >= 2 && Math.random() < 0.15) {
            const specialTypes = ['titanium', 'plasma', 'quantum'].filter(type => blockTypes.includes(type));
            if (specialTypes.length > 0) {
                blockType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
            }
        }
        
        // HP calculation based on score tiers (every 1000 points)
        const scoreTier = Math.floor(score / 1000);
        let hp;
        
        if (scoreTier === 0) {
            // 0-1000: 75% 1s, 20% 2s, 5% 3s (no higher)
            const rand = Math.random();
            if (rand < 0.75) hp = 1;       // 75% chance of 1
            else if (rand < 0.95) hp = 2;  // 20% chance of 2
            else hp = 3;                   // 5% chance of 3 (max)
        } else {
            // 1000+ points: Only 1s, 2s, and 3s (much more gradual)
            const rand = Math.random();
            if (rand < 0.5) hp = 2;        // 50% chance of 2
            else if (rand < 0.85) hp = 3;  // 35% chance of 3
            else hp = 1;                   // 15% chance of 1 (easier blocks mixed in)
        }
        
        // Small bonuses for special blocks (reduced to keep HP reasonable)
        if (blockType === 'titanium') hp = Math.min(hp + 1, 4); // Max 4 HP
        if (blockType === 'plasma') hp = Math.min(hp + 2, 5);   // Max 5 HP
        if (blockType === 'quantum') hp = Math.min(hp + 2, 6);  // Max 6 HP
        
        // 5% chance for special blocks  
        let isSpecial = false;
        let specialType = null;
        if (Math.random() < 0.025) {
            isSpecial = true;
            specialType = 'spawner';
        } else if (Math.random() < 0.025) {
            isSpecial = true;
            specialType = 'exploder';
        } else if (window.currentGameMode?.id === 'iceFrost' && Math.random() < 0.08) {
            isSpecial = true;
            specialType = 'freeze';
        }
        
        blocks.push({
            x: blockX,
            y: spawnY,
            width: BLOCK_WIDTH,
            height: BLOCK_HEIGHT,
            type: blockType,
            hitPoints: hp,
            maxHitPoints: hp,
            isSpecial: isSpecial,
            specialType: specialType,
            destroyed: false,
            glow: 0,
            glowDirection: 1
        });
    }
    
    // No longer tracking rows for powerups - initial powerup is placed in the first 6 rows
    // Additional powerups come from score milestones only
}

function addSingleBallPowerup() {
    debugLog(`⚡ addSingleBallPowerup() called`);
    
    // Try multiple positions to ensure placement
    let maxAttempts = 10;
    let placed = false;
    
    while (maxAttempts > 0 && !placed) {
        // Simple +1 ball powerup spawner - try random positions
        const x = 50 + Math.random() * (canvas.width - 100);
        const y = BLOCK_START_Y + Math.random() * 200; // Within first few rows area
        
        // Make sure it doesn't overlap with existing blocks
        let validPosition = true;
        for (const block of blocks) {
            if (!block.destroyed && 
                x > block.x - 20 && x < block.x + block.width + 20 &&
                y > block.y - 20 && y < block.y + block.height + 20) {
                validPosition = false;
                break;
            }
        }
        
        if (validPosition) {
            powerups.push({
                x: x,
                y: y,
                radius: 12,
                ballValue: 1, // Always +1 ball
                glow: Math.random() * Math.PI * 2,
                collected: false,
                type: 'ball'
            });
            
            debugLog(`✅ Added +1 ball powerup at (${Math.floor(x)}, ${Math.floor(y)}). Total powerups: ${powerups.length}`);
            placed = true;
        }
        
        maxAttempts--;
    }
    
    if (!placed) {
        // If we couldn't place it in open space, place it in a gap between blocks
        const centerX = canvas.width / 2;
        const safeY = BLOCK_START_Y - 30; // Place above blocks
        
        powerups.push({
            x: centerX,
            y: safeY,
            radius: 12,
            ballValue: 1,
            glow: Math.random() * Math.PI * 2,
            collected: false,
            type: 'ball'
        });
        
        debugLog(`⚠️ Placed powerup in safe zone at (${Math.floor(centerX)}, ${Math.floor(safeY)})`);
        placed = true;
    }
    
    return placed; // Return whether placement was successful
}

function levelComplete() {
    level++;
    score += level * 50; // Bonus for completing level
    
    // Check for 500-point milestone powerup from level bonus
    if (score >= nextScorePowerup) {
        addSingleBallPowerup();
        nextScorePowerup += 500; // Set next milestone
        debugLog(`Score milestone reached! Next powerup at ${nextScorePowerup} points`);
    }
    
    debugLog(`Level ${level-1} complete! Starting level ${level}`);
    
    audioEngine.playLevelComplete();
    
    // Generate next level immediately
    // Clear current level
    blocks.length = 0;
    balls.length = 0;
    
    // Generate new level
    generateLevel();
    updateUI();
    
    // Show level transition effect
    showLevelTransition();
    
    // Reset game state to allow new shots
    gameState = 'playing';
    turnInProgress = false;
    window.turnInProgress = false;  // Reset turn for new level
    isAiming = false;
    levelTransitioning = false;
}

function showLevelTransition() {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(100, 255, 218, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = colors.ui.accent;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${level}`, canvas.width / 2, canvas.height / 2);
}

// Removed old spawnPowerup function - using addSingleBallPowerup only

// Frame rate independent timing
let lastFrameTime = 0;
let deltaMultiplier = 1.0; // Global delta multiplier for frame-rate independence
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // 16.67ms

// Delta smoothing to prevent erratic behavior
let deltaHistory = [];
const DELTA_HISTORY_SIZE = 10;
const MIN_DELTA = 0.3; // Prevent extremely slow motion
const MAX_DELTA = 1.7;  // Prevent extremely fast motion

// Performance monitoring
let frameCount = 0;
let lastFPSUpdate = 0;
let currentFPS = 60;
let fpsMonitorElement, deltaMonitorElement, ballSpeedMonitorElement;

// Update performance monitoring displays
function updatePerformanceMonitors() {
    // Console logging for performance tracking
    const rawDeltaForDisplay = deltaHistory.length > 0 ? deltaHistory[deltaHistory.length - 1] : 1.0;
    
    if (fpsMonitorElement) {
        fpsMonitorElement.textContent = Math.round(currentFPS);
        // Color-code FPS: green >50, yellow 30-50, red <30
        if (currentFPS > 50) {
            fpsMonitorElement.style.color = '#4CAF50';
        } else if (currentFPS > 30) {
            fpsMonitorElement.style.color = '#FFC107';
        } else {
            fpsMonitorElement.style.color = '#F44336';
        }
    }
    
    if (deltaMonitorElement) {
        deltaMonitorElement.textContent = deltaMultiplier.toFixed(2) + 'x';
        // Color-code delta: green ~1.0, yellow >1.2 or <0.8, red >1.5 or <0.6
        if (deltaMultiplier >= 0.8 && deltaMultiplier <= 1.2) {
            deltaMonitorElement.style.color = '#4CAF50';
        } else if (deltaMultiplier >= 0.6 && deltaMultiplier <= 1.5) {
            deltaMonitorElement.style.color = '#FFC107';
        } else {
            deltaMonitorElement.style.color = '#F44336';
        }
    }
    
    if (ballSpeedMonitorElement && balls.length > 0) {
        const ball = balls[0];
        if (ball && ball.active) {
            const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
            const actualSpeed = speed * deltaMultiplier;
            ballSpeedMonitorElement.textContent = Math.round(actualSpeed);
            
            // Additional console logging for ball speed
        } else {
            ballSpeedMonitorElement.textContent = '-';
        }
    }
}

function gameLoop(currentTime) {
    try {
        // Robust parameter handling - defensive against wrapper modules
        const safeCurrentTime = (typeof currentTime === 'number' && currentTime) ? currentTime : performance.now();
        
        // Check if canvas and ctx are initialized
        if (!canvas || !ctx) {
            console.error('Canvas or context not initialized in gameLoop!');
            return;
        }
    
        // Calculate delta time for frame-rate independence
        if (lastFrameTime === 0) lastFrameTime = safeCurrentTime;
    const deltaTime = Math.min(safeCurrentTime - lastFrameTime, TARGET_FRAME_TIME * 3); // Cap to prevent huge jumps
    lastFrameTime = safeCurrentTime;
    
    // Calculate raw delta and smooth it
    let rawDelta = deltaTime / TARGET_FRAME_TIME;
    rawDelta = Math.max(MIN_DELTA, Math.min(MAX_DELTA, rawDelta)); // Clamp to prevent extremes
    
    // Add to history and smooth
    deltaHistory.push(rawDelta);
    if (deltaHistory.length > DELTA_HISTORY_SIZE) {
        deltaHistory.shift();
    }
    
    // Use smoothed average for stable gameplay
    deltaMultiplier = deltaHistory.reduce((sum, d) => sum + d, 0) / deltaHistory.length;
    
    // Update performance monitoring
    frameCount++;
    if (currentTime - lastFPSUpdate >= 500) { // Update every 500ms
        currentFPS = frameCount / ((currentTime - lastFPSUpdate) / 1000);
        frameCount = 0;
        lastFPSUpdate = currentTime;
        
        // Update monitoring displays
        updatePerformanceMonitors();
    }
    
    // Update ball physics and trails (only when playing)
    if (gameState === 'playing') {
        // Use reverse iteration to safely remove balls
        for (let index = balls.length - 1; index >= 0; index--) {
            const ball = balls[index];
            if (ball.active) {
            // Add to trail
            ball.trail.push({ x: ball.x, y: ball.y, alpha: 1.0 });
            if (ball.trail.length > 15) {
                ball.trail.shift();
            }
            
            // Update trail alpha
            ball.trail.forEach((point, i) => {
                point.alpha = (i + 1) / ball.trail.length;
            });
            
            // Frame-rate independent movement
            ball.x += ball.speedX * deltaMultiplier;
            ball.y += ball.speedY * deltaMultiplier;
            
            // Enhanced wall collisions
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
                ball.speedX = -ball.speedX;
                ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
                createImpactParticles(ball.x, ball.y, colors.ball.primary);
                if (SoundMixer.isEnabled('blockHit')) audioEngine.playPleasureSound('softImpact', 0.5);
                // Removed hi-hat trigger on wall bounce
                audioEngine.playGameplayJazzDrum('wall_hit', 0.3); // Softer jazz drum for walls
            }
            if (ball.y - ball.radius <= 0) {
                ball.speedY = -ball.speedY;
                ball.y = ball.radius;
                createImpactParticles(ball.x, ball.y, colors.ball.primary);
                if (SoundMixer.isEnabled('blockHit')) audioEngine.playPleasureSound('softImpact', 0.5);
                // Removed hi-hat trigger on ceiling bounce
                audioEngine.playGameplayJazzDrum('ceiling_hit', 0.4); // Medium jazz drum for ceiling
            }
            
            // Bottom boundary - ball is lost
            if (ball.y + ball.radius >= canvas.height) {
                // Remember where the first ball of this turn hit the bottom
                if (firstBallOfTurn) {
                    nextBallStartX = ball.x;
                    firstBallOfTurn = false;
                    window.firstBallOfTurn = false;
                    debugLog(`First ball hit bottom at x=${Math.floor(ball.x)}, next turn will start here`);
                }
                
                balls.splice(index, 1);
                debugLog(`Ball lost! Remaining active balls: ${balls.length}`);
                
                // End turn when no balls remain
                if (balls.length === 0) {
                    turnInProgress = false;
    window.turnInProgress = false;
                    firstBallOfTurn = true;
                    window.firstBallOfTurn = true; // Reset for next turn
                    ballsForNextShot = baseBallCount;
            window.ballsForNextShot = ballsForNextShot; // Reset to current base count
                    debugLog(`Turn ended - ready for next shot with ${baseBallCount} balls (blocks continue drifting naturally)`);
                    // No more advanceBlocks() - just let them drift naturally
                }
                continue;  // Use continue instead of return in for loop
            }
            
            // Enhanced ball-to-rectangle collisions - find closest collision to prevent bouncing between adjacent blocks
            let closestCollision = null;
            let closestDistance = Infinity;
            
            blocks.forEach(block => {
                if (!block.destroyed && checkBlockCollision(ball, block)) {
                    const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
                    const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));
                    
                    const dx = ball.x - closestX;
                    const dy = ball.y - closestY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Keep track of the closest collision
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestCollision = {
                            block: block,
                            closestX: closestX,
                            closestY: closestY,
                            dx: dx,
                            dy: dy,
                            distance: distance
                        };
                    }
                }
            });
            
            // Process only the closest collision to prevent bouncing between adjacent blocks
            if (closestCollision) {
                const { block, closestX, closestY, dx, dy, distance } = closestCollision;
                
                // Determine collision normal and reflect velocity
                if (distance > 0) {
                    const normalX = dx / distance;
                    const normalY = dy / distance;
                    
                    // Reflect velocity based on collision normal
                    const dotProduct = ball.speedX * normalX + ball.speedY * normalY;
                    ball.speedX = ball.speedX - 2 * dotProduct * normalX;
                    ball.speedY = ball.speedY - 2 * dotProduct * normalY;
                    
                    // Move ball outside the rectangle to prevent sticking
                    const overlap = ball.radius - distance;
                    if (overlap > 0) {
                        ball.x += normalX * overlap;
                        ball.y += normalY * overlap;
                    }
                }
                    
                // Check for freeze blocks first - they trigger on ANY hit
                if (block.isSpecial && block.specialType === 'freeze') {
                    // Create impact particles
                    createImpactParticles(ball.x, ball.y, '#00f5ff');
                    debugLog('🧊 Freeze block hit! Activating freeze effect...');
                    debugLog('🔍 Debug freeze block state:');
                    debugLog('  - window.iceMode exists:', !!window.iceMode);
                    debugLog('  - freezeBlocksInRadius exists:', !!window.iceMode?.freezeBlocksInRadius);
                    debugLog('  - currentGameMode:', window.currentGameMode?.id);
                    
                    // Wrap freeze effect in try-catch to prevent game freeze
                    try {
                        if (window.iceMode && window.iceMode.freezeBlocksInRadius) {
                            debugLog('✅ Calling freezeBlocksInRadius...');
                            window.iceMode.freezeBlocksInRadius(block.x, block.y, 1);
                        } else {
                            debugWarn('❌ Freeze functionality not available!');
                            if (!window.iceMode) {
                                debugWarn('   - window.iceMode is missing');
                            }
                            if (!window.iceMode?.freezeBlocksInRadius) {
                                debugWarn('   - freezeBlocksInRadius function is missing');
                            }
                        }
                    } catch (error) {
                        console.error('Error applying freeze effect:', error);
                    }
                    
                    // Freeze blocks are destroyed immediately on hit
                    block.destroyed = true;
                    score += 10 * level;
                    
                    // Create freeze particles
                    for (let i = 0; i < 15; i++) {
                        const angle = (Math.PI * 2 * i) / 15;
                        const distance = Math.random() * 30 + 10;
                        const x = block.x + BLOCK_WIDTH/2 + Math.cos(angle) * distance;
                        const y = block.y + BLOCK_HEIGHT/2 + Math.sin(angle) * distance;
                        createImpactParticles(x, y, '#00f5ff');
                    }
                    
                    // Play freeze sound
                    if (SoundMixer.isEnabled('blockDestroy')) audioEngine.playPleasureSound('gentleChime', 1.8);
                    
                    // Debug: Check ball speed after freeze block
                } else {
                    // Normal block hit logic
                    // Damage block (ensure HP never goes below 0)
                    block.hitPoints = Math.max(0, block.hitPoints - 1);
                    block.glow = 1.0; // Flash effect

                    // Create impact particles
                    createImpactParticles(ball.x, ball.y, colors.block[block.type].glow);
                    // Use musical hit system if progression is active
                    audioEngine.playMelodicBallHit(block.hitPoints, balls.length);

                    // Removed hi-hat trigger to simplify

                    // Jazz drum solo system
                    const intensity = 1.0 - (block.hitPoints / block.maxHitPoints); // Higher intensity for weaker blocks
                    audioEngine.playGameplayJazzDrum('block_hit', intensity);

                    // Destroy block if HP reaches 0
                    if (block.hitPoints <= 0) {
                        block.destroyed = true;
                        score += 10 * level;
                    
                    // Check for 500-point milestone powerup
                    debugLog(`💰 Score: ${score}, Next milestone: ${nextScorePowerup}`);
                    if (score >= nextScorePowerup) {
                        debugLog(`🎯 Score milestone reached! Spawning powerup...`);
                        addSingleBallPowerup();
                        nextScorePowerup += 500; // Set next milestone
                        debugLog(`Next powerup at ${nextScorePowerup} points`);
                    }
                    
                    // Special block effects
                    if (block.isSpecial) {
                        if (block.specialType === 'spawner') {
                            // Spawner: Create 2-3 new blocks nearby
                            if (SoundMixer.isEnabled('blockDestroy')) audioEngine.playPleasureSound('gentleChime', 1.5);
                            const spawns = 2 + Math.floor(Math.random() * 2);
                            for (let i = 0; i < spawns; i++) {
                                const offsetX = (Math.random() - 0.5) * BLOCK_WIDTH * 3;
                                const offsetY = (Math.random() - 0.5) * BLOCK_HEIGHT * 2;
                                const newX = Math.max(0, Math.min(canvas.width - BLOCK_WIDTH, block.x + offsetX));
                                const newY = block.y + offsetY;
                                
                                // Don't spawn if position is occupied
                                const occupied = blocks.some(b => !b.destroyed && 
                                    Math.abs(b.x - newX) < BLOCK_WIDTH && 
                                    Math.abs(b.y - newY) < BLOCK_HEIGHT);
                                
                                if (!occupied && newY > 0) {
                                    blocks.push({
                                        x: newX,
                                        y: newY,
                                        width: BLOCK_WIDTH,
                                        height: BLOCK_HEIGHT,
                                        hitPoints: 1,
                                        maxHitPoints: 1,
                                        type: 'crystal',
                                        isSpecial: false,
                                        specialType: null,
                                        destroyed: false,
                                        glow: 1.0,
                                        glowDirection: 1
                                    });
                                    createImpactParticles(newX + BLOCK_WIDTH/2, newY + BLOCK_HEIGHT/2, '#FFD700');
                                }
                            }
                        } else if (block.specialType === 'exploder') {
                            // Exploder: Destroy nearby blocks
                            if (SoundMixer.isEnabled('blockDestroy')) audioEngine.playPleasureSound('satisfyingPop', 1.5);
                            const explosionRadius = BLOCK_WIDTH * 2;
                            blocks.forEach(nearBlock => {
                                if (!nearBlock.destroyed && nearBlock !== block) {
                                    const dx = nearBlock.x - block.x;
                                    const dy = nearBlock.y - block.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    if (distance < explosionRadius) {
                                        nearBlock.hitPoints = Math.max(0, nearBlock.hitPoints - 2); // Deal 2 damage, never go negative
                                        nearBlock.glow = 1.0;
                                        if (nearBlock.hitPoints <= 0) {
                                            nearBlock.destroyed = true;
                                            score += 5 * level; // Half score for explosion kills
                                            
                                            // Check for 500-point milestone powerup from explosion kills
                                            if (score >= nextScorePowerup) {
                                                addSingleBallPowerup();
                                                nextScorePowerup += 500; // Set next milestone
                                                debugLog(`Score milestone reached! Next powerup at ${nextScorePowerup} points`);
                                            }
                                            createDestructionParticles(nearBlock.x + BLOCK_WIDTH/2, nearBlock.y + BLOCK_HEIGHT/2, '#FF6F00');
                                        }
                                    }
                                }
                            });
                            // Big explosion effect
                            for (let i = 0; i < 10; i++) {
                                const angle = (Math.PI * 2 * i) / 10;
                                const x = block.x + BLOCK_WIDTH/2 + Math.cos(angle) * explosionRadius;
                                const y = block.y + BLOCK_HEIGHT/2 + Math.sin(angle) * explosionRadius;
                                createImpactParticles(x, y, '#FFB300');
                            }
                        }
                    }
                    
                    // Removed old random powerup spawning - using new system only
                    }
                }
                
                // Only show destruction particles if block was actually destroyed
                if (block.destroyed) {
                    // Destruction particles (use special colors for special blocks)
                    const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                    let particleColor;
                    
                    if (block.isSpecial && colors.special && colors.special[block.specialType]) {
                        particleColor = colors.special[block.specialType].base;
                    } else if (isBoomMode) {
                        // Ball Go Boom volcanic colors for particles
                        const boomParticleColors = {
                            1: '#FF4500', // Orange Red - Lava
                            2: '#FF6600', // Bright Orange - Fire
                            3: '#FFD700', // Gold - Solar Flare
                            4: '#FF0000', // Pure Red - Magma
                            5: '#DC143C', // Crimson - Hot Coal
                            6: '#FF69B4', // Hot Pink - Plasma
                            7: '#8B0000', // Dark Red - Ember
                            8: '#B22222', // Fire Brick - Volcanic Rock
                            9: '#FF7F50', // Coral - Molten Metal
                            10: '#FF8C00', // Dark Orange - Liquid Fire
                            default: '#4B0082' // Indigo - Blue Flame
                        };
                        particleColor = boomParticleColors[block.maxHitPoints] || boomParticleColors.default;
                    } else {
                        particleColor = (colors.blockByHP[block.maxHitPoints] || colors.blockByHP.default).base;
                    }
                    createDestructionParticles(block.x + block.width/2, block.y + block.height/2, particleColor);
                    
                    if (block.isSpecial) {
                        if (SoundMixer.isEnabled('blockDestroy')) audioEngine.playPleasureSound('warmClick', 2.0); // Extra sound for special blocks
                    } else {
                        if (SoundMixer.isEnabled('blockDestroy')) audioEngine.playPleasureSound('satisfyingPop', 1.0);
                    }
                }
                
                updateBlocksLeft();
            }
            
            // Check collisions with ball powerups
            powerups.forEach(powerup => {
                if (!powerup.collected && powerup.type === 'ball') {
                    const dx = ball.x - powerup.x;
                    const dy = ball.y - powerup.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < ball.radius + powerup.radius) {
                        // Collect the ball powerup - permanently increase base ball count
                        powerup.collected = true;
                        baseBallCount += powerup.ballValue;
            window.baseBallCount = baseBallCount;
                        ballsForNextShot = baseBallCount;
            window.ballsForNextShot = ballsForNextShot; // Update next shot to match new base
                        
                        debugLog(`🎯 Ball powerup collected! +${powerup.ballValue} balls. Permanent ball count now: ${baseBallCount}`);
                        
                        // Visual effect
                        createImpactParticles(powerup.x, powerup.y, '#ffff00');
                        if (SoundMixer.isEnabled('powerup')) audioEngine.playPleasureSound('gentleChime', 1.0);
                    }
                }
            });
        }
    } // End of ball for loop
    } // End of gameState === 'playing' check
    
    // Update particles (always update for visual effects)
    updateParticles();
    
    // Continuous downward movement for all blocks - speed based on score (only when playing)
    // RULE: Base speed increased 3x from original - old 1x speed is now too slow
    // Starting speed: 0.09 pixels/frame (was 0.03), increases by 0.18 per 1000 points (was 0.06)
    // But only move if game is not paused
    if (gameState === 'playing') {
        const difficultyTier = Math.floor(score / 1000); // Every 1000 points = new difficulty tier
        const baseSpeed = (0.03 + (difficultyTier * 0.006)) * 3; // 3x faster than original, 10% of old increase rate
        const moveSpeed = baseSpeed * blockSpeedMultiplier; // Apply configurable speed multiplier
        blocks.forEach(block => {
            if (!block.destroyed && !block.frozen) {  // Don't move frozen blocks
                block.y += moveSpeed * deltaMultiplier;
            }
        });
        
        // Move powerups (extra ball prizes) with the same speed as blocks
        powerups.forEach(powerup => {
            if (!powerup.collected) {
                powerup.y += moveSpeed * deltaMultiplier;
            }
        });
    }
    
    // Update glow effects even when paused (visual only)
    blocks.forEach(block => {
        if (block.glow > 0) {
            block.glow -= 0.05;
        }
    });
    
    // Check if any blocks reached danger line during continuous movement
    const gameLoopDangerY = canvas.height - 50;
    const gameLoopBlocksInDanger = blocks.filter(block => !block.destroyed && block.y >= gameLoopDangerY);
    if (gameLoopBlocksInDanger.length > 0) {
        debugLog('🚨 Continuous movement: Blocks reached danger line - Game Over!');
        debugLog(`Blocks in danger: ${gameLoopBlocksInDanger.length}, First block Y: ${gameLoopBlocksInDanger[0].y}, Danger Y: ${gameLoopDangerY}`);
        gameOver();
        return;
    }
    
    // Spawn new rows based on position of existing blocks
    // But only if game is playing (not paused)
    if (gameState === 'playing') {
        const topBlocks = blocks.filter(block => !block.destroyed);
        
        if (topBlocks.length > 0) {
            // Find the topmost block
            const topmostBlockY = Math.min(...topBlocks.map(block => block.y));
            
            // If the topmost row has moved down at all, add a new row to ensure no gaps
            const spawnTriggerDistance = 1; // Spawn as soon as any movement occurs
            
            if (topmostBlockY >= BLOCK_START_Y + spawnTriggerDistance) {
                spawnNewRowAtTop();
            }
        } else {
            // If no blocks exist, spawn one (fallback)
            spawnNewRowAtTop();
        }
    }
    
    // Clear canvas with animated background
    drawAnimatedBackground();
    
    // Draw flame trails for fireballs
    balls.forEach(ball => {
        if (ball.active && ball.trail.length > 0) {
            ball.trail.forEach((point, index) => {
                const trailTime = Date.now() * 0.01 + index * 0.5;
                
                // Flickering flame trail
                ctx.globalAlpha = point.alpha * 0.7;
                const trailColors = ['#ff6600', '#ff4400', '#ff2200'];
                const colorIndex = Math.floor(index % trailColors.length);
                ctx.fillStyle = trailColors[colorIndex];
                
                // Varying trail size with flicker
                const flicker = Math.sin(trailTime) * 0.3 + 0.7;
                const trailRadius = ball.radius * (point.alpha * 0.4) * flicker;
                
                ctx.shadowColor = '#ff4400';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        }
    });
    
    // CLEAN ARCHITECTURE - Use proper renderer system
    // Update GameCore with current blocks
    if (window.gameCore) {
        window.gameCore.blocks = blocks;
        
        // Check if mode changed and update renderer if needed
        const currentMode = window.currentGameMode;
        if (currentMode && window.gameCore.getMode()?.id !== currentMode.id) {
            debugLog(`🔄 Mode changed to: ${currentMode.id}`);
            window.gameCore.setMode(currentMode);
        }
    }
    
    // Render blocks - use GameCore renderer if mode is set, otherwise fallback
    const renderTime = Date.now();
    const hasValidRenderer = window.gameCore && 
                            window.gameCore.renderer && 
                            window.currentGameMode;
    
    let useGameCoreRenderer = false;
    
    if (hasValidRenderer) {
        // Use clean architecture renderer
        try {
            window.gameCore.renderer.renderBlocks(blocks, renderTime);
            useGameCoreRenderer = true;
        } catch (error) {
            console.error('❌ GameCore renderer failed:', error);
            debugLog('🔧 Falling back to basic block rendering');
        }
    } else {
        // Debug why renderer isn't available
        if (!window.gameCore) {
            console.error('❌ window.gameCore not initialized');
        } else if (!window.gameCore.renderer) {
            console.error('❌ window.gameCore.renderer not available');
            debugLog('  - GameCore initialized:', window.gameCore.initialized);
            debugLog('  - GameCore currentMode:', window.gameCore.currentMode);
        } else if (!window.currentGameMode) {
            console.error('❌ window.currentGameMode not set');
            debugLog('  - Available: window.selectedGameMode:', window.selectedGameMode);
        }
    }
    
    // Fallback rendering if GameCore renderer wasn't used
    if (!useGameCoreRenderer) {
        debugLog('📝 Using fallback block rendering');
        // Fallback to basic block rendering
        blocks.forEach(block => {
            if (!block.destroyed) {
                // Check if block is frozen first
                if (block.frozen) {
                    // Ice colors for frozen blocks
                    ctx.fillStyle = '#00e5ff'; // Ice blue
                    ctx.fillRect(block.x, block.y, block.width, block.height);
                    
                    // Add ice border effect
                    ctx.strokeStyle = '#b3e5fc';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(block.x, block.y, block.width, block.height);
                } else {
                    // Normal block colors based on HP
                    const hpRatio = block.hitPoints / block.maxHitPoints;
                    if (hpRatio > 0.7) {
                        ctx.fillStyle = '#4CAF50'; // Green for healthy
                    } else if (hpRatio > 0.3) {
                        ctx.fillStyle = '#FF9800'; // Orange for damaged  
                    } else {
                        ctx.fillStyle = '#F44336'; // Red for critical
                    }
                    ctx.fillRect(block.x, block.y, block.width, block.height);
                }
                
                // Draw border
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.strokeRect(block.x, block.y, block.width, block.height);
            }
        });
    }
    
    // Draw HP numbers and freeze countdown (temporary compatibility layer)  
    blocks.forEach(block => {
            if (!block.destroyed && !block.isSpecial) {
                const centerX = block.x + block.width / 2;
                const centerY = block.y + block.height / 2;
                
                // Large, glowing text
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Check if block is frozen
                if (block.frozen && block.freezeCountdown !== undefined) {
                    // Frozen block - show countdown timer with ice colors
                    ctx.shadowColor = '#00e5ff';
                    ctx.shadowBlur = 12;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(block.freezeCountdown, centerX, centerY);
                    
                    // Add ice effect around the number
                    ctx.strokeStyle = '#00e5ff';
                    ctx.lineWidth = 2;
                    ctx.strokeText(block.freezeCountdown, centerX, centerY);
                } else {
                    // Normal block - show HP
                    const hpRatio = block.hitPoints / block.maxHitPoints;
                    
                    // Glowing text effect
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = 8;
                    
                    // Color based on health ratio
                    if (hpRatio > 0.6) {
                        ctx.fillStyle = '#ffffff'; // Healthy = white
                    } else if (hpRatio > 0.3) {
                        ctx.fillStyle = '#ffff00'; // Damaged = yellow
                    } else {
                        ctx.fillStyle = '#ff4444'; // Critical = red
                    }
                    
                    ctx.fillText(Math.max(0, block.hitPoints), centerX, centerY);
                }
                
                ctx.shadowBlur = 0;
                ctx.textBaseline = 'alphabetic'; // Reset baseline
            }
        });
    
    // Draw balls - use sprite if available, otherwise flame effect
    balls.forEach(ball => {
        if (ball.active) {
            const time = Date.now() * 0.01;
            const isDetonating = ball.detonating === true;

            // Check if sprite is loaded
            if (window.ballSprite && window.ballSprite.complete && window.ballSprite.naturalWidth > 0) {
                // Draw sprite
                ctx.save();
                const spriteSize = ball.radius * 7.7; // 10% larger
                const halfSize = spriteSize / 2;

                // Glow behind sprite
                ctx.shadowColor = isDetonating ? '#ff0000' : '#ff6600';
                ctx.shadowBlur = isDetonating ? 30 : 20;
                const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, spriteSize * 0.5);
                gradient.addColorStop(0, isDetonating ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 100, 50, 0.4)');
                gradient.addColorStop(0.5, isDetonating ? 'rgba(255, 0, 255, 0.3)' : 'rgba(255, 50, 0, 0.2)');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, spriteSize * 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Draw the sprite
                ctx.shadowBlur = 0;
                ctx.drawImage(
                    window.ballSprite,
                    ball.x - halfSize,
                    ball.y - halfSize,
                    spriteSize,
                    spriteSize
                );
                ctx.restore();
            } else {
                // Fallback: Original flame effect
                ctx.shadowColor = isDetonating ? '#ff0000' : '#ff4400';
                ctx.shadowBlur = isDetonating ? 35 : 25;

                const flameLayers = isDetonating ? [
                    { color: '#ff0000', radius: ball.radius * 1.6, alpha: 0.5 },
                    { color: '#ff00ff', radius: ball.radius * 1.2, alpha: 0.6 },
                    { color: '#ffffff', radius: ball.radius * 0.9, alpha: 0.8 }
                ] : [
                    { color: '#ff6600', radius: ball.radius * 1.4, alpha: 0.3 },
                    { color: '#ff4400', radius: ball.radius * 1.1, alpha: 0.5 },
                    { color: '#ff2200', radius: ball.radius * 0.8, alpha: 0.7 }
                ];

                flameLayers.forEach((layer, index) => {
                    ctx.fillStyle = layer.color;
                    ctx.globalAlpha = layer.alpha;

                    ctx.beginPath();
                    const points = 12;
                    for (let i = 0; i <= points; i++) {
                        const angle = (i / points) * Math.PI * 2;
                        const flicker = Math.sin(time * 3 + angle * 2 + index) * 0.3;
                        const radius = layer.radius * (0.8 + flicker);

                        const x = ball.x + Math.cos(angle) * radius;
                        const y = ball.y + Math.sin(angle) * radius;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                });

                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#ffffff';
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffff88';
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
    
    // Draw powerups
    
    powerups.forEach(powerup => {
        if (!powerup.collected && powerup.type === 'ball') {
            powerup.glow += 0.15;
            
            // Enhanced pulsing glow for ball powerups
            const pulseIntensity = (Math.sin(powerup.glow) + 1) / 2;
            const glowSize = 15 + pulseIntensity * 25; // 15-40 glow
            const outerRadius = powerup.radius + pulseIntensity * 3;
            
            // Outer glow ring
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = glowSize;
            ctx.fillStyle = `rgba(255, 255, 0, ${0.2 + pulseIntensity * 0.3})`;
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, outerRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner bright ball
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, powerup.radius - 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Ball value number
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(powerup.ballValue, powerup.x, powerup.y + 4);
            
            ctx.shadowBlur = 0;
            
            // Remove if off screen
            if (powerup.y > canvas.height + powerup.radius) {
                powerup.collected = true;
            }
        }
    });
    
    // Clean up collected powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        if (powerups[i].collected) {
            powerups.splice(i, 1);
        }
    }
    
    // Draw particles
    drawParticles();
    
    // Draw pulsing neon danger line
    const visualDangerY = canvas.height - 50;
    const pulseIntensity = (Math.sin(Date.now() * 0.01) + 1) / 2; // 0 to 1
    const lineAlpha = 0.3 + pulseIntensity * 0.4; // 0.3 to 0.7
    const glowIntensity = 10 + pulseIntensity * 20; // 10 to 30
    
    ctx.strokeStyle = `rgba(255, 0, 100, ${lineAlpha})`;
    ctx.shadowColor = '#ff0064';
    ctx.shadowBlur = glowIntensity;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]); // Dashed line
    ctx.beginPath();
    ctx.moveTo(0, visualDangerY);
    ctx.lineTo(canvas.width, visualDangerY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
    ctx.shadowBlur = 0;
    
    // Draw launcher - show when first ball has hit bottom (next position is set) or not in a turn
    if (!turnInProgress || !firstBallOfTurn) {
        const launcherTime = Date.now() * 0.008;

        if (window.launcherSprite && window.launcherSprite.complete && window.launcherSprite.naturalWidth > 0) {
            ctx.save();
            const launcherSize = 64 * 2; // 2x size
            const halfSize = launcherSize / 2;

            // Optional glow behind launcher
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 25;

            // Check if it's an animated sprite sheet
            if (window.launcherSprite.frameWidth) {
                const now = Date.now();

                // Update animation frame
                if (now - window.launcherSprite.lastFrameChange > window.launcherSprite.frameTime) {
                    window.launcherSprite.currentFrame = (window.launcherSprite.currentFrame + 1) % window.launcherSprite.frameCount;
                    window.launcherSprite.lastFrameChange = now;
                }

                // Random mirror flip every 1-4 seconds
                if (now > window.launcherSprite.nextFlipTime) {
                    window.launcherSprite.mirrored = !window.launcherSprite.mirrored;
                    window.launcherSprite.nextFlipTime = now + 1000 + Math.random() * 3000;
                }

                const frameX = window.launcherSprite.currentFrame * window.launcherSprite.frameWidth;
                const drawX = nextBallStartX - halfSize;
                const drawY = BALL_START_Y - halfSize - 25;

                // Apply mirror if needed
                if (window.launcherSprite.mirrored) {
                    ctx.translate(nextBallStartX, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        window.launcherSprite,
                        frameX, 0,
                        window.launcherSprite.frameWidth, window.launcherSprite.frameHeight,
                        -halfSize, drawY,
                        launcherSize, launcherSize
                    );
                } else {
                    ctx.drawImage(
                        window.launcherSprite,
                        frameX, 0,
                        window.launcherSprite.frameWidth, window.launcherSprite.frameHeight,
                        drawX, drawY,
                        launcherSize, launcherSize
                    );
                }
            } else {
                ctx.drawImage(
                    window.launcherSprite,
                    nextBallStartX - halfSize,
                    BALL_START_Y - halfSize - 25,
                    launcherSize,
                    launcherSize
                );
            }
            ctx.shadowBlur = 0;
            ctx.restore();
        } else {
            // Fallback: original launcher drawing
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ff6600';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();

            const launcherFlicker = Math.sin(launcherTime) * 0.2;
            const launcherRadius = 6 + launcherFlicker;
            ctx.arc(nextBallStartX, BALL_START_Y, launcherRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(nextBallStartX, BALL_START_Y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = colors.ui.accent;
            ctx.fillRect(nextBallStartX - 15, BALL_START_Y + 6, 30, 8);
            ctx.fillRect(nextBallStartX - 10, BALL_START_Y + 14, 20, 4);
        }
    }
    
    // Draw aiming line with power indication
    if (isAiming) {
        const dx = aimEndX - aimStartX;
        const dy = aimEndY - aimStartY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate power percentage for visual feedback
        const maxDragDistance = 150;
        const powerPercent = Math.min(length / maxDragDistance, 1.0);
        
        // Color line based on power: green (low) -> yellow (medium) -> red (high)
        const red = Math.floor(255 * powerPercent);
        const green = Math.floor(255 * (1 - powerPercent * 0.5));
        ctx.strokeStyle = `rgb(${red}, ${green}, 0)`;
        
        // Line thickness based on power
        ctx.lineWidth = 2 + powerPercent * 3;
        
        ctx.beginPath();
        ctx.moveTo(aimStartX, aimStartY);
        ctx.lineTo(aimEndX, aimEndY);
        ctx.stroke();
        
        // Draw power indicator circle at aim point
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(aimEndX, aimEndY, 3 + powerPercent * 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Update score display
    scoreElement.textContent = score;
    
    // Draw "Click to start" message when idle
    if (gameState === 'idle') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('CLICK TO START', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    // Update UI
    updateUI();
    
    // Canvas UI integration removed (conflicts resolved)
    
    // Continue loop
    if (gameState === 'playing') {
        requestAnimationFrame(coreGameLoop);
    } else if (gameState === 'paused') {
        // Draw pause message
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
        requestAnimationFrame(coreGameLoop); // Keep drawing paused state
    } else if (gameState === 'idle') {
        requestAnimationFrame(coreGameLoop); // Keep animating in idle state to show message
    } else {
        debugLog(`🛑 Game loop stopped! Game state: ${gameState}`);
        debugLog(`Turn in progress: ${turnInProgress}, Active balls: ${balls.length}`);
        debugLog(`Blocks remaining: ${blocks.filter(b => !b.destroyed).length}`);
        console.trace();
    }
    } catch (error) {
        console.error('Error in game loop:', error);
        console.trace();
        // Try to continue the game loop despite the error
        if (gameState === 'playing') {
            requestAnimationFrame(coreGameLoop);
        }
    }
}

// Hide loading screen when game is ready
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
        debugLog('✅ Loading screen hidden');
    }
}

// Wait for mode system to be initialized before starting game loop
function waitForModeSystemThenStartGameLoop() {
    let gameLoopStarted = false;

    // Timeout after 10 seconds and start anyway
    const timeoutId = setTimeout(() => {
        clearInterval(checkModeSystem);
        if (!gameLoopStarted) {
            gameLoopStarted = true;
            debugWarn('⚠️ Mode system timeout - starting game loop anyway');
            hideLoadingScreen();
            coreGameLoop(performance.now());
        }
    }, 10000);

    const checkModeSystem = setInterval(() => {
        // Check if mode system is ready
        if (window.currentGameMode && window.gameCore && window.gameCore.renderer) {
            clearInterval(checkModeSystem);
            clearTimeout(timeoutId); // Cancel the timeout since we succeeded
            if (!gameLoopStarted) {
                gameLoopStarted = true;
                debugLog('✅ Mode system ready - starting game loop');
                hideLoadingScreen();
                coreGameLoop(performance.now());
            }
        } else {
            // Log what we're waiting for
            const missing = [];
            if (!window.currentGameMode) missing.push('currentGameMode');
            if (!window.gameCore) missing.push('gameCore');
            if (window.gameCore && !window.gameCore.renderer) missing.push('gameCore.renderer');
            debugLog(`⏳ Waiting for mode system... Missing: ${missing.join(', ')}`);
        }
    }, 100);
}

// Start the game loop in idle state to show "Click to start" message
window.addEventListener('load', () => {
    debugLog('Page loaded - initializing game');
    if (initializeDOMElements()) {
        initializeGameConstants();
        setupEventListeners();
        
        // Load online leaderboard
        loadOnlineLeaderboard();
        
        debugLog('DOM elements, game constants, and event listeners initialized - waiting for mode system...');
        waitForModeSystemThenStartGameLoop();
        
        // Canvas UI system integration removed (conflicts resolved)
    } else {
        console.error('Failed to initialize DOM elements!');
    }
});

// Initialize clean architecture after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    debugLog('🏗️ DOM ready - initializing clean architecture...');
    initializeCleanArchitecture();
});

// The startGame function is already defined above at line 3743
// Let the wrapper system handle the global export properly

window.pauseGame = function() {
    if (gameRunning) {
        gameRunning = false;
        debugLog('⏸️ Game paused');
    } else {
        gameRunning = true;
        gameLoop();
        debugLog('▶️ Game resumed');
    }
};

// Export game state for debugging
window.getGameState = function() {
    return {
        gameRunning,
        score,
        level,
        ballCount,
        blocks: blocks.length,
        balls: balls.length,
        gameCore: !!window.gameCore,
        gameMode: window.currentGameMode?.name || 'none'
    };
};
