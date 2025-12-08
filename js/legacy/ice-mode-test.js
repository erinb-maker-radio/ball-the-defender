const iceMode = {
    id: 'iceFrost',
    name: 'Ice Mode',
    description: 'Freeze blocks that freeze surrounding blocks in a 2-space radius, showing countdown timers, with neon ice aesthetics and glitchy crackling sounds',
    
    colorScheme: {
        background: { primary: '#0a1a2a', secondary: '#1a2a4a', accent: '#2a4a6a' },
        blockByHP: {
            1: { base: '#4dd0e1', glow: '#80deea', shadow: '#00acc1' },
            2: { base: '#26c6da', glow: '#4dd0e1', shadow: '#0097a7' },
            3: { base: '#00bcd4', glow: '#26c6da', shadow: '#00838f' },
            4: { base: '#00acc1', glow: '#00bcd4', shadow: '#006064' },
            5: { base: '#0097a7', glow: '#00acc1', shadow: '#004d5c' },
            default: { base: '#263238', glow: '#455a64', shadow: '#37474f' }
        },
        special: {
            spawner: { base: '#80deea', glow: '#b2ebf2', shadow: '#4dd0e1' },
            exploder: { base: '#18ffff', glow: '#84ffff', shadow: '#00e5ff' },
            freeze: { base: '#00e5ff', glow: '#b3e5fc', shadow: '#0277bd' }
        }
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
            
            /* ICE MODE THEMED UI ELEMENTS */
            .mode-iceFrost #pauseBtn {
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
                padding: 12px 24px !important;
                font-size: 16px !important;
                transition: all 0.3s ease !important;
                position: relative !important;
            }
            
            .mode-iceFrost #pauseBtn::before {
                content: '❄️';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 16px;
                animation: subzero-rotate 4s linear infinite;
            }
            
            .mode-iceFrost #pauseBtn {
                padding-left: 40px !important; /* Make room for snowflake */
            }
            
            .mode-iceFrost #pauseBtn:hover {
                background: linear-gradient(135deg, #001833 0%, #002952 25%, #003d6b 50%, #005080 75%, #00a3ff 100%) !important;
                box-shadow: 
                    inset 0 0 30px rgba(0, 163, 255, 0.5),
                    0 0 40px rgba(0, 163, 255, 0.7),
                    0 0 60px rgba(0, 128, 204, 0.5) !important;
                transform: scale(1.05) !important;
            }
            
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
                padding: 15px 30px !important;
                font-size: 18px !important;
                transition: all 0.3s ease !important;
                position: relative !important;
            }
            
            .mode-iceFrost #startBtn {
                padding-left: 32px !important; /* Normal padding without icon */
            }
            
            .mode-iceFrost #startBtn:hover {
                background: linear-gradient(135deg, #001833 0%, #002952 25%, #003d6b 50%, #005080 75%, #00a3ff 100%) !important;
                box-shadow: 
                    inset 0 0 30px rgba(0, 163, 255, 0.5),
                    0 0 40px rgba(0, 163, 255, 0.7),
                    0 0 60px rgba(0, 128, 204, 0.5) !important;
                transform: scale(1.05) !important;
            }
            
            /* SUBZERO STYLE FREEZE BLOCKS */
            .freeze-block {
                background: linear-gradient(135deg, #000a1a 0%, #001833 25%, #002952 50%, #003d6b 75%, #005080 100%) !important;
                border: 3px solid #00a3ff !important;
                box-shadow: inset 0 0 40px rgba(0, 163, 255, 0.5), 0 0 30px #0080cc !important;
                animation: subzero-freeze 2.5s ease-in-out infinite !important;
                position: relative !important;
            }
            
            .freeze-block::before {
                content: '❄️';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2.5em;
                text-shadow: 
                    0 0 2px #ffffff,
                    0 0 4px #ffffff,
                    0 0 6px #00a3ff,
                    0 0 10px #0080cc;
                -webkit-text-stroke: 1px white;
                animation: subzero-rotate 4s linear infinite;
                z-index: 1;
            }
            
            @keyframes subzero-freeze {
                0%, 100% { 
                    filter: brightness(0.8) saturate(1); 
                    box-shadow: inset 0 0 40px rgba(0, 163, 255, 0.5), 0 0 30px #0080cc !important;
                }
                50% { 
                    filter: brightness(1.2) saturate(1.5); 
                    box-shadow: inset 0 0 60px rgba(0, 163, 255, 0.7), 0 0 50px #00a3ff !important;
                }
            }
            
            @keyframes subzero-rotate {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            .frozen-block {
                position: relative;
                filter: brightness(0.7) hue-rotate(180deg);
                animation: frozen-shimmer 3s infinite;
            }
            
            @keyframes frozen-shimmer {
                0%, 100% { filter: brightness(0.7) hue-rotate(180deg); }
                50% { filter: brightness(0.9) hue-rotate(200deg); }
            }
            
            .ice-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, 
                    rgba(179, 229, 252, 0.8) 0%,
                    rgba(77, 208, 225, 0.6) 30%,
                    rgba(0, 229, 255, 0.4) 60%,
                    rgba(179, 229, 252, 0.8) 100%);
                border: 2px solid var(--ice-color);
                border-radius: 4px;
                pointer-events: none;
                animation: ice-spread 0.5s ease-out;
            }
            
            @keyframes ice-spread {
                0% { 
                    transform: scale(0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.8;
                }
                100% { 
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
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
                animation: countdown-pulse 1s infinite;
            }
            
            @keyframes countdown-pulse {
                0%, 100% { 
                    transform: translate(-50%, -50%) scale(1);
                    text-shadow: 
                        0 0 10px var(--freeze-glow),
                        0 0 20px var(--accent-color),
                        2px 2px 4px rgba(0, 0, 0, 0.8);
                }
                50% { 
                    transform: translate(-50%, -50%) scale(1.2);
                    text-shadow: 
                        0 0 20px var(--freeze-glow),
                        0 0 40px var(--accent-color),
                        2px 2px 8px rgba(0, 0, 0, 0.8);
                }
            }
            
            .ice-crack-effect {
                position: absolute;
                width: 100%;
                height: 100%;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,50 L90,50 M50,10 L50,90 M20,20 L80,80 M80,20 L20,80" stroke="%2300e5ff" stroke-width="2" opacity="0.6"/></svg>');
                pointer-events: none;
                opacity: 0;
                animation: crack-appear 0.3s ease-in forwards;
            }
            
            @keyframes crack-appear {
                0% { opacity: 0; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1); }
            }
        `
    },
    
    mechanics: {
        startingBalls: 1,
        ballSpeed: 1.0,
        specialFeatures: [
            {
                id: 'freezeBlocks',
                type: 'blockBehavior',
                name: 'Freeze Blocks',
                description: 'Special blocks that freeze surrounding blocks in 2-space radius',
                effect: {
                    freezeRadius: 1,
                    freezeDuration: 5000,
                    countdownInterval: 1000,
                    spreadAnimation: true,
                    stackable: true
                },
                onActivate: function() {
                    console.log('🧊 Freeze blocks system activated - creating freeze functions');
                    console.log('🔍 Debug: onActivate called, setting up window.iceMode with freeze functions');
                    
                    // Create the freeze system (preserve existing iceMode if it exists)
                    const freezeSystem = {
                        frozenBlocks: new Map(),
                        freezeTimers: new Map(),
                        isFreezing: false,
                        
                        freezeBlocksInRadius: function(centerX, centerY, radius) {
                            if (!window.blocks) {
                                console.warn('No blocks array found');
                                return;
                            }
                            
                            // Prevent re-entrance issues and throttle for performance
                            if (this.isFreezing) {
                                console.warn('Already processing freeze effect');
                                return;
                            }
                            this.isFreezing = true;
                            
                            const freezePixelRadius = radius * 100; // 100 pixels per unit
                            const affectedBlocks = [];
                            
                            const centerBlockX = centerX + 30; // Center of freeze block
                            const centerBlockY = centerY + 30;
                            
                            // Use pixel-based distance instead of grid-based
                            window.blocks.forEach((block, index) => {
                                if (block.destroyed || block.frozen) return;
                                
                                const blockCenterX = block.x + block.width / 2;
                                const blockCenterY = block.y + block.height / 2;
                                
                                // Calculate Euclidean distance in pixels
                                const dx = blockCenterX - centerBlockX;
                                const dy = blockCenterY - centerBlockY;
                                const pixelDistance = Math.sqrt(dx * dx + dy * dy);
                                
                                // Only freeze blocks that are close but not the freeze block itself
                                if (pixelDistance > 10 && pixelDistance <= freezePixelRadius) {
                                    affectedBlocks.push({ block, index });
                                }
                            });
                            
                            this.playFreezeSound();
                            
                            affectedBlocks.forEach(({ block, index }) => {
                                this.freezeBlock(block, index);
                            });
                            
                            // Reset flag after processing
                            this.isFreezing = false;
                        },
                        
                        freezeBlock: function(block, index) {
                            // Safety check - don't freeze destroyed blocks
                            if (!block || block.destroyed) {
                                return;
                            }
                            
                            if (this.frozenBlocks.has(index)) {
                                clearInterval(this.freezeTimers.get(index));
                            }
                            
                            block.frozen = true;
                            block.freezeCountdown = 5;
                            this.frozenBlocks.set(index, block);
                            
                            this.addIceOverlay(block);
                            this.startCountdown(block, index);
                        },
                        
                        addIceOverlay: function(block) {
                            console.log('🧊 DISABLED: ice-mode-test.js overlay creation disabled - using canvas rendering');
                            // DISABLED - ice effects now rendered on canvas
                        },
                        
                        startCountdown: function(block, index) {
                            // Reduced timer frequency for better performance
                            const timer = setInterval(() => {
                                // Safety check - stop countdown if block is destroyed
                                if (!block || block.destroyed) {
                                    clearInterval(timer);
                                    this.freezeTimers.delete(index);
                                    if (block && block.iceOverlay) {
                                        block.iceOverlay.remove();
                                    }
                                    return;
                                }
                                
                                block.freezeCountdown--;
                                
                                if (block.countdownElement) {
                                    block.countdownElement.textContent = block.freezeCountdown;
                                }
                                
                                if (block.freezeCountdown <= 0) {
                                    this.unfreezeBlock(block, index);
                                }
                            }, 1000);
                            
                            this.freezeTimers.set(index, timer);
                        },
                        
                        unfreezeBlock: function(block, index) {
                            console.log(`🔥 Unfreezing block at index ${index}`);
                            block.frozen = false;
                            delete block.freezeCountdown;
                            
                            if (block.iceOverlay) {
                                block.iceOverlay.remove();
                                delete block.iceOverlay;
                                delete block.countdownElement;
                            }
                            
                            if (this.freezeTimers.has(index)) {
                                clearInterval(this.freezeTimers.get(index));
                                this.freezeTimers.delete(index);
                            }
                            
                            this.frozenBlocks.delete(index);
                            this.playUnfreezeSound();
                        },
                        
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
                        }
                    };
                    
                    // Assign freeze system to window.iceMode (preserving existing properties)
                    if (!window.iceMode) {
                        window.iceMode = {};
                    }
                    Object.assign(window.iceMode, freezeSystem);
                    
                    console.log('✅ Freeze functions setup complete! window.iceMode.freezeBlocksInRadius exists:', !!window.iceMode.freezeBlocksInRadius);
                }
            }
        ]
    },
    
    musicProgression: [6, 1, 4, 5],
    
    audioConfig: {
        progression: [6, 1, 4, 5],
        key: 'A',
        style: { tempo: 'slow', attack: 'soft', sustain: 'long', timbre: 'crystalline' },
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
    }
};

if (typeof window !== 'undefined') {
    // Preserve any existing freeze system if it was already set up
    const existingFreezeSystem = window.iceMode;
    window.iceMode = iceMode;
    
    // If there was an existing freeze system (from onActivate), merge it back
    if (existingFreezeSystem && existingFreezeSystem.freezeBlocksInRadius) {
        console.log('🔧 Preserving existing freeze system functions...');
        Object.assign(window.iceMode, existingFreezeSystem);
        console.log('✅ Freeze system preserved after mode definition load');
    }
    
    console.log('🧊 Ice Mode definition loaded');
    
    // Try to register immediately
    if (window.ModeFramework) {
        window.ModeFramework.registerMode(iceMode);
        console.log('✅ Ice Mode registered in framework immediately');
    } else {
        // Wait for framework to load
        let attempts = 0;
        const tryRegister = () => {
            attempts++;
            if (window.ModeFramework) {
                window.ModeFramework.registerMode(iceMode);
                console.log('✅ Ice Mode registered in framework after', attempts, 'attempts');
            } else if (attempts < 50) {
                setTimeout(tryRegister, 100);
            } else {
                console.error('❌ Failed to register Ice Mode - ModeFramework not found after 5 seconds');
            }
        };
        setTimeout(tryRegister, 100);
    }
}

if (typeof module !== 'undefined') {
    module.exports = { iceMode };
}