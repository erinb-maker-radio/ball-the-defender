/**
 * Ball Defender - Game Engine
 * Beautiful, extensible architecture that owns its own destiny
 */

class GameEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Core state
        this.state = 'idle'; // idle, playing, paused, gameOver
        this.running = false;
        this.lastFrameTime = 0;
        
        // Extension system
        this.plugins = new Map();
        this.renderLayers = new Map();
        this.updateHooks = new Map();
        
        // Game data
        this.entities = {
            blocks: [],
            balls: [],
            particles: [],
            powerups: []
        };
        
        this.gameData = {
            score: 0,
            level: 1,
            ballCount: 1
        };
        
        console.log('🏗️ GameEngine created - Beautiful architecture initialized');
    }
    
    /**
     * Plugin Registration - Clean extension points
     */
    registerPlugin(name, plugin) {
        if (this.plugins.has(name)) {
            throw new Error(`Plugin '${name}' already registered`);
        }
        
        this.plugins.set(name, plugin);
        
        // Initialize plugin with engine reference
        if (plugin.initialize) {
            plugin.initialize(this);
        }
        
        console.log(`✅ Plugin registered: ${name}`);
        return this;
    }
    
    /**
     * Render Layer System - Clean rendering pipeline
     */
    registerRenderLayer(name, priority, renderer) {
        this.renderLayers.set(name, { priority, renderer });
        console.log(`🎨 Render layer registered: ${name} (priority: ${priority})`);
        return this;
    }
    
    /**
     * Update Hook System - Clean update pipeline
     */
    registerUpdateHook(name, priority, updater) {
        this.updateHooks.set(name, { priority, updater });
        console.log(`🔄 Update hook registered: ${name} (priority: ${priority})`);
        return this;
    }
    
    /**
     * Game State Management
     */
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        // Notify plugins of state change
        this.plugins.forEach(plugin => {
            if (plugin.onStateChange) {
                plugin.onStateChange(oldState, newState);
            }
        });
        
        console.log(`🎮 State: ${oldState} → ${newState}`);
        return this;
    }
    
    /**
     * Main Game Loop - The heart of the engine
     */
    gameLoop(currentTime = performance.now()) {
        if (!this.running) return;
        
        // Calculate delta time
        const deltaTime = this.lastFrameTime === 0 ? 
            16.67 : Math.min(currentTime - this.lastFrameTime, 50); // Cap at 50ms
        this.lastFrameTime = currentTime;
        
        try {
            // State system update first - handles menu/game transitions
            const stateSystem = this.plugins.get('stateSystem');
            if (stateSystem) {
                stateSystem.update(deltaTime, currentTime);
            }
            
            // Pre-update phase - plugins can prepare
            this.plugins.forEach(plugin => {
                if (plugin.preUpdate) {
                    plugin.preUpdate(deltaTime, currentTime);
                }
            });
            
            // Core update phase - game logic (only if playing)
            this.updateGame(deltaTime, currentTime);
            
            // Post-update phase - plugins can react
            this.plugins.forEach(plugin => {
                if (plugin.postUpdate) {
                    plugin.postUpdate(deltaTime, currentTime);
                }
            });
            
            // Update particle systems
            const particleSystem = this.plugins.get('particles');
            if (particleSystem && particleSystem.update) {
                particleSystem.update(deltaTime);
            }
            
            // Render phase - state system can override rendering
            if (stateSystem && stateSystem.currentStateName === 'menu') {
                // State system handles menu rendering
                stateSystem.render(this.ctx, currentTime);
            } else {
                // Normal game rendering
                this.render(currentTime);
            }
            
        } catch (error) {
            console.error('❌ GameEngine error:', error);
            // Continue running even if there's an error
        }
        
        // Schedule next frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Core Game Update Logic
     */
    updateGame(deltaTime, currentTime) {
        if (this.state !== 'playing') return;
        
        // Execute update hooks in priority order
        const sortedHooks = Array.from(this.updateHooks.values())
            .sort((a, b) => a.priority - b.priority);
        
        for (const hook of sortedHooks) {
            hook.updater(this.entities, this.gameData, deltaTime, currentTime);
        }
    }
    
    /**
     * Render Pipeline
     */
    render(currentTime) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Execute render layers in priority order
        const sortedLayers = Array.from(this.renderLayers.values())
            .sort((a, b) => a.priority - b.priority);
        
        for (const layer of sortedLayers) {
            layer.renderer(this.ctx, this.entities, this.gameData, currentTime);
        }
    }
    
    /**
     * Lifecycle Management
     */
    start() {
        if (this.running) return this;
        
        this.running = true;
        this.lastFrameTime = 0;
        
        console.log('🚀 GameEngine started');
        this.gameLoop();
        
        return this;
    }
    
    stop() {
        this.running = false;
        console.log('⏹️ GameEngine stopped');
        return this;
    }
    
    reset() {
        // Reset game state
        this.entities.blocks = [];
        this.entities.balls = [];
        this.entities.particles = [];
        this.entities.powerups = [];
        
        this.gameData.score = 0;
        this.gameData.level = 1;
        this.gameData.ballCount = 1;
        
        // Notify plugins
        this.plugins.forEach(plugin => {
            if (plugin.onReset) {
                plugin.onReset();
            }
        });
        
        console.log('🔄 GameEngine reset');
        return this;
    }
    
    /**
     * Entity Management - Clean API
     */
    addEntity(type, entity) {
        if (!this.entities[type]) {
            this.entities[type] = [];
        }
        this.entities[type].push(entity);
        return this;
    }
    
    removeEntity(type, entity) {
        if (!this.entities[type]) return this;
        
        const index = this.entities[type].indexOf(entity);
        if (index > -1) {
            this.entities[type].splice(index, 1);
        }
        return this;
    }
    
    getEntities(type) {
        return this.entities[type] || [];
    }
}

// Export for use
window.GameEngine = GameEngine;
console.log('🏗️ Beautiful GameEngine architecture loaded');