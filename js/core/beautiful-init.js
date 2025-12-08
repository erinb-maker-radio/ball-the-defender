/**
 * Beautiful Initialization - Clean, elegant system startup
 * Replaces chaotic wrapper-based initialization
 */

class BallDefenderApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.engine = null;
        this.gameLogic = null;
        this.initialized = false;
        
        console.log('🎮 Ball Defender App created - Beautiful architecture');
    }
    
    async initialize() {
        if (this.initialized) {
            console.warn('App already initialized');
            return this;
        }
        
        try {
            // Initialize canvas
            await this.initializeCanvas();
            
            // Create game engine
            this.engine = new GameEngine(this.canvas, this.ctx);
            
            // Register beautiful plugins
            await this.registerPlugins();
            
            // Setup input handling
            this.setupInputHandling();
            
            // Setup window exports for compatibility
            this.setupGlobalAPI();
            
            this.initialized = true;
            console.log('✅ Ball Defender beautifully initialized!');
            
            return this;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            throw error;
        }
    }
    
    async initializeCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Could not get 2D context');
        }
        
        // Smart canvas sizing
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        console.log(`🖼️ Canvas initialized: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    resizeCanvas() {
        const availableWidth = window.innerWidth - 330; // Sidebar space
        const availableHeight = window.innerHeight - 40; // Margin
        
        const aspectRatio = 4/3;
        let width, height;
        
        if (availableWidth / availableHeight > aspectRatio) {
            height = Math.floor(availableHeight * 0.95);
            width = Math.floor(height * aspectRatio);
        } else {
            width = Math.floor(availableWidth * 0.95);
            height = Math.floor(width / aspectRatio);
        }
        
        // Ensure reasonable bounds
        width = Math.max(640, Math.min(width, 1200));
        height = Math.max(480, Math.min(height, 900));
        
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    async registerPlugins() {
        // Core plugins in dependency order
        
        // Color theme system - beautiful color management
        const colorThemeSystem = new ColorThemeSystem();
        this.engine.registerPlugin('colorThemes', colorThemeSystem);
        
        // Canvas management (background rendering)
        const canvasPlugin = new CanvasPlugin();
        this.engine.registerPlugin('canvas', canvasPlugin);
        
        // Performance monitoring
        const performancePlugin = new PerformancePlugin();
        this.engine.registerPlugin('performance', performancePlugin);
        
        // Particle system - beautiful visual effects (register before game logic)
        const particleSystemPlugin = new ParticleSystemPlugin();
        this.engine.registerPlugin('particles', particleSystemPlugin);
        
        // Game logic (needs particle system reference)
        this.gameLogic = new GameLogicPlugin();
        this.engine.registerPlugin('gameLogic', this.gameLogic);
        
        // Rendering
        const rendererPlugin = new RendererPlugin();
        this.engine.registerPlugin('renderer', rendererPlugin);
        
        // Audio system - beautiful sound management
        const audioPlugin = new AudioPlugin();
        this.engine.registerPlugin('audio', audioPlugin);
        
        // Time tracking - beautiful time management
        const timeTrackerPlugin = new TimeTrackerPlugin();
        this.engine.registerPlugin('timeTracker', timeTrackerPlugin);
        
        // Leaderboard system - expandable score management
        const leaderboardPlugin = new LeaderboardPlugin();
        this.engine.registerPlugin('leaderboard', leaderboardPlugin);
        
        // Special mechanics - expandable mode abilities
        const specialMechanicsPlugin = new SpecialMechanicsPlugin();
        this.engine.registerPlugin('specialMechanics', specialMechanicsPlugin);
        
        // State system - proper architecture for menu/game states
        const stateSystem = new GameStateSystem();
        this.engine.registerPlugin('stateSystem', stateSystem);
        
        console.log('🔌 All plugins registered beautifully');
    }
    
    setupInputHandling() {
        // Mouse/touch input for ball launching
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
        
        // Keyboard input - forward to state system first
        document.addEventListener('keydown', (e) => {
            const stateSystem = this.engine.plugins.get('stateSystem');
            if (stateSystem && stateSystem.handleInput(e)) {
                // State system handled it
                return;
            }
            
            // Fallback to local handling
            this.handleKeyDown(e);
        });
        
        console.log('🎯 Input handling configured');
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.engine.state === 'idle') {
            // Start new game
            this.startNewGame();
        } else if (this.engine.state === 'playing') {
            // Launch ball towards click position
            this.launchBall(x, y);
        } else if (this.engine.state === 'gameOver') {
            // Restart game
            this.startNewGame();
        }
    }
    
    handleKeyDown(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePause();
                break;
            case 'Enter':
                if (this.engine.state === 'idle' || this.engine.state === 'gameOver') {
                    this.startNewGame();
                }
                break;
        }
    }
    
    launchBall(targetX, targetY) {
        const startX = this.canvas.width / 2;
        const startY = this.canvas.height - 50;
        
        // Calculate direction and speed
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const speed = 8;
        const velocityX = (dx / distance) * speed;
        const velocityY = (dy / distance) * speed;
        
        this.gameLogic.launchBall(startX, startY, velocityX, velocityY);
        console.log(`🚀 Ball launched towards (${Math.round(targetX)}, ${Math.round(targetY)})`);
    }
    
    startNewGame() {
        console.log('🎮 Starting beautiful new game...');
        this.gameLogic.startNewGame();
        this.engine.start();
    }
    
    togglePause() {
        if (this.engine.state === 'playing') {
            this.engine.setState('paused');
        } else if (this.engine.state === 'paused') {
            this.engine.setState('playing');
        }
    }
    
    setupGlobalAPI() {
        // Clean API for external access
        window.ballDefender = {
            app: this,
            engine: this.engine,
            
            // Public methods
            startGame: () => this.startNewGame(),
            pauseGame: () => this.togglePause(),
            
            // Debug access
            getPerformanceReport: () => {
                const perfPlugin = this.engine.plugins.get('performance');
                return perfPlugin ? perfPlugin.getPerformanceReport() : null;
            }
        };
        
        // Legacy compatibility
        window.startGame = () => this.startNewGame();
        window.gameCore = this.engine; // For compatibility
        
        console.log('🌐 Global API configured');
    }
    
    // Lifecycle methods
    start() {
        if (!this.initialized) {
            throw new Error('App not initialized');
        }
        
        // Start the engine (this will start in menu state automatically)
        this.engine.start();
        
        console.log('🚀 Beautiful Ball Defender started!');
        return this;
    }
    
    stop() {
        if (this.engine) {
            this.engine.stop();
        }
        return this;
    }
}

// Beautiful initialization - handle both DOM ready and already loaded states
function initializeBeautifulGame() {
    console.log('🏗️ Initializing beautiful architecture...');
    
    try {
        const app = new BallDefenderApp();
        console.log('🎮 BallDefenderApp created');
        
        app.initialize().then(() => {
            console.log('✅ BallDefenderApp initialized');
            app.start();
            console.log('🚀 BallDefenderApp started');
            
            // Store globally for access
            window.ballDefenderApp = app;
            
        }).catch(error => {
            console.error('❌ Beautiful initialization failed:', error);
        });
        
    } catch (error) {
        console.error('❌ Beautiful app creation failed:', error);
    }
}

// Handle both cases - DOM ready or already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBeautifulGame);
} else {
    // DOM already loaded, initialize immediately
    console.log('🏗️ DOM already ready - initializing immediately...');
    initializeBeautifulGame();
}

console.log('🏗️ Beautiful initialization system loaded');