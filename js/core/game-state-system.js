/**
 * Game State System - Beautiful state management architecture
 * Clean separation between Menu, Playing, Paused, GameOver states
 */

class GameStateSystem {
    constructor() {
        this.currentState = null;
        this.states = new Map();
        this.transitions = new Map();
        this.engine = null;
        
        console.log('🎮 Game State System created');
    }
    
    initialize(engine) {
        this.engine = engine;
        this.registerStates();
        this.registerTransitions();
        this.setState('menu');
        console.log('🎮 Game State System initialized');
    }
    
    registerStates() {
        // Menu State - shows mode selection
        const menuState = new MenuState();
        menuState.stateSystem = this;
        this.states.set('menu', menuState);
        
        // Playing State - active gameplay
        this.states.set('playing', new PlayingState());
        
        // Paused State - game paused
        this.states.set('paused', new PausedState());
        
        // Game Over State - end screen
        this.states.set('gameOver', new GameOverState());
        
        console.log('📋 Game states registered:', Array.from(this.states.keys()));
    }
    
    registerTransitions() {
        // Define valid state transitions
        this.addTransition('menu', 'playing', 'startGame');
        this.addTransition('playing', 'paused', 'pauseGame');
        this.addTransition('paused', 'playing', 'resumeGame');
        this.addTransition('playing', 'gameOver', 'endGame');
        this.addTransition('gameOver', 'menu', 'returnToMenu');
        this.addTransition('gameOver', 'playing', 'restartGame');
        
        console.log('🔄 State transitions registered');
    }
    
    addTransition(from, to, trigger) {
        if (!this.transitions.has(from)) {
            this.transitions.set(from, new Map());
        }
        this.transitions.get(from).set(trigger, to);
    }
    
    setState(newStateName, data = {}) {
        const newState = this.states.get(newStateName);
        if (!newState) {
            console.error(`❌ Unknown state: ${newStateName}`);
            return false;
        }
        
        const oldStateName = this.currentStateName;
        
        // Exit current state
        if (this.currentState) {
            this.currentState.exit(this.engine);
        }
        
        // Enter new state
        this.currentState = newState;
        this.currentStateName = newStateName;
        this.currentState.enter(this.engine, data);
        
        // Notify all plugins of state change
        this.engine.plugins.forEach(plugin => {
            if (plugin.onStateChange) {
                plugin.onStateChange(oldStateName, newStateName);
            }
        });
        
        console.log(`🔄 State changed to: ${newStateName}`);
        return true;
    }
    
    transition(trigger, data = {}) {
        if (!this.currentStateName) return false;
        
        const fromTransitions = this.transitions.get(this.currentStateName);
        if (!fromTransitions) return false;
        
        const targetState = fromTransitions.get(trigger);
        if (!targetState) {
            console.warn(`⚠️ No transition for ${trigger} from ${this.currentStateName}`);
            return false;
        }
        
        return this.setState(targetState, data);
    }
    
    update(deltaTime, currentTime) {
        if (this.currentState) {
            this.currentState.update(this.engine, deltaTime, currentTime);
        }
    }
    
    render(ctx, currentTime) {
        if (this.currentState) {
            this.currentState.render(this.engine, ctx, currentTime);
        }
    }
    
    handleInput(event) {
        if (this.currentState) {
            return this.currentState.handleInput(this.engine, event);
        }
        return false;
    }
}

/**
 * Base State Class - Clean interface for all states
 */
class GameState {
    enter(engine, data) {
        // Override in subclasses
    }
    
    exit(engine) {
        // Override in subclasses  
    }
    
    update(engine, deltaTime, currentTime) {
        // Override in subclasses
    }
    
    render(engine, ctx, currentTime) {
        // Override in subclasses
    }
    
    handleInput(engine, event) {
        // Override in subclasses
        return false;
    }
}

/**
 * Menu State - Beautiful mode selection
 */
class MenuState extends GameState {
    constructor() {
        super();
        this.selectedMode = 'original';
        this.modes = [
            { id: 'original', name: '🎯 ORIGINAL', description: 'Classic Ball Defender' },
            { id: 'boom', name: '💥 BALL GO BOOM', description: 'Explosive Action' },
            { id: 'ice', name: '🧊 ICE MODE', description: 'Freeze & Conquer' }
        ];
    }
    
    enter(engine, data) {
        // Hide game canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.style.display = 'none';
        
        // Create menu UI
        this.createMenuUI();
        console.log('🎮 Entered Menu state');
    }
    
    exit(engine) {
        // Clean up menu UI
        const menu = document.getElementById('gameMenu');
        if (menu) menu.remove();
        
        // Show game canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.style.display = 'block';
        
        console.log('🎮 Exited Menu state');
    }
    
    createMenuUI() {
        const menuDiv = document.createElement('div');
        menuDiv.id = 'gameMenu';
        menuDiv.innerHTML = `
            <div class="menu-container">
                <h1>BALL DEFENDER</h1>
                <div class="modes">
                    ${this.modes.map(mode => `
                        <div class="mode-card" data-mode="${mode.id}">
                            <h3>${mode.name}</h3>
                            <p>${mode.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #gameMenu {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a23 0%, #1a1a3a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: white;
                font-family: 'Courier New', monospace;
            }
            
            .menu-container {
                text-align: center;
            }
            
            .menu-container h1 {
                font-size: 64px;
                color: #64ffda;
                text-shadow: 0 0 30px #64ffda;
                margin-bottom: 50px;
            }
            
            .modes {
                display: flex;
                gap: 30px;
                justify-content: center;
            }
            
            .mode-card {
                background: rgba(0, 0, 0, 0.5);
                border: 3px solid #64ffda;
                border-radius: 15px;
                padding: 30px;
                width: 200px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .mode-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 10px 30px rgba(100, 255, 218, 0.5);
            }
            
            .mode-card h3 {
                font-size: 24px;
                margin-bottom: 15px;
                color: #64ffda;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(menuDiv);
        
        // Add click handlers
        menuDiv.addEventListener('click', (e) => {
            const modeCard = e.target.closest('.mode-card');
            if (modeCard) {
                const mode = modeCard.dataset.mode;
                this.selectMode(mode);
            }
        });
    }
    
    selectMode(mode) {
        this.selectedMode = mode;
        console.log(`🎯 Mode selected: ${mode}`);
        
        // Get engine reference from the state system
        const engine = this.stateSystem?.engine;
        if (!engine) {
            console.error('❌ No engine reference available');
            return;
        }
        
        // Configure audio for selected mode
        const audioPlugin = engine.plugins.get('audio');
        if (audioPlugin) {
            audioPlugin.setModeProgression(mode);
        }
        
        // Configure theme for selected mode
        const colorThemes = engine.plugins.get('colorThemes');
        if (colorThemes) {
            colorThemes.applyTheme(mode);
        }
        
        // Transition to playing state
        this.stateSystem.transition('startGame', { mode: mode });
    }
}

/**
 * Playing State - Active gameplay
 */
class PlayingState extends GameState {
    enter(engine, data) {
        console.log('🎮 Entered Playing state');
        
        // Initialize game with selected mode
        const gameLogic = engine.plugins.get('gameLogic');
        if (gameLogic) {
            gameLogic.startNewGame();
        }
        
        // Set engine state
        engine.setState('playing');
    }
    
    exit(engine) {
        console.log('🎮 Exited Playing state');
    }
    
    update(engine, deltaTime, currentTime) {
        // Game logic updates handled by plugins
    }
    
    handleInput(engine, event) {
        // Handle game input (space for pause, etc.)
        if (event.code === 'Space') {
            const stateSystem = engine.plugins.get('stateSystem');
            stateSystem.transition('pauseGame');
            return true;
        }
        return false;
    }
}

/**
 * Paused State - Game paused
 */
class PausedState extends GameState {
    enter(engine, data) {
        console.log('⏸️ Entered Paused state');
        engine.setState('paused');
    }
    
    exit(engine) {
        console.log('▶️ Exited Paused state');
    }
    
    handleInput(engine, event) {
        if (event.code === 'Space') {
            const stateSystem = engine.plugins.get('stateSystem');
            stateSystem.transition('resumeGame');
            return true;
        }
        return false;
    }
}

/**
 * Game Over State - End screen
 */
class GameOverState extends GameState {
    enter(engine, data) {
        console.log('💀 Entered Game Over state');
        engine.setState('gameOver');
        this.finalScore = data.score || 0;
    }
    
    exit(engine) {
        console.log('🎮 Exited Game Over state');
    }
    
    handleInput(engine, event) {
        if (event.code === 'Enter') {
            const stateSystem = engine.plugins.get('stateSystem');
            stateSystem.transition('returnToMenu');
            return true;
        }
        return false;
    }
}

// Export
window.GameStateSystem = GameStateSystem;
console.log('🎮 Beautiful Game State System loaded');