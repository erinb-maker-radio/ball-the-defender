/**
 * Menu Plugin - Beautiful menu system
 * Clean, elegant game mode selection
 */

class MenuPlugin {
    constructor() {
        this.isVisible = true;
        this.selectedMode = 'original';
        this.gameModes = [
            {
                id: 'original',
                name: '🎯 ORIGINAL',
                description: 'Classic Ball Defender',
                theme: 'original',
                colors: {
                    border: '#64ffda',
                    header: '#64ffda',
                    button: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    hover: 'rgba(102, 126, 234, 0.4)'
                }
            },
            {
                id: 'boom',
                name: '💥 BALL GO BOOM',
                description: 'Explosive Action',
                theme: 'boom',
                colors: {
                    border: '#ff6b6b',
                    header: '#ffa500',
                    button: 'linear-gradient(135deg, #ff6b6b 0%, #ff4500 100%)',
                    hover: 'rgba(255, 107, 107, 0.4)'
                }
            },
            {
                id: 'ice',
                name: '🧊 ICE MODE',
                description: 'Freeze & Conquer',
                theme: 'ice',
                colors: {
                    border: '#4dd0e1',
                    header: '#4dd0e1',
                    button: 'linear-gradient(135deg, #4dd0e1 0%, #00bcd4 100%)',
                    hover: 'rgba(77, 208, 225, 0.4)'
                }
            }
        ];
    }
    
    initialize(engine) {
        this.engine = engine;
        this.createBeautifulMenu();
        
        // Hide game canvas initially like original
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'none';
        }
        
        console.log('🎮 Menu plugin initialized');
    }
    
    generateModeCards() {
        return this.gameModes.map((mode, index) => `
            <div class="mode-card ${mode.theme}-card ${index === 0 ? 'active' : ''}" 
                 data-mode="${mode.id}"
                 style="--border-color: ${mode.colors.border}; --header-color: ${mode.colors.header};">
                <div class="card-content">
                    <h3>${mode.name}</h3>
                    <p>${mode.description}</p>
                </div>
                <button class="play-button" style="background: ${mode.colors.button};">PLAY</button>
            </div>
        `).join('');
    }
    
    addGameMode(modeConfig) {
        this.gameModes.push(modeConfig);
        // Refresh menu if it exists
        const existingMenu = document.getElementById('beautifulMenu');
        if (existingMenu) {
            this.refreshMenu();
        }
        console.log(`🎮 Added new game mode: ${modeConfig.name}`);
    }
    
    refreshMenu() {
        const modeSelection = document.querySelector('.mode-selection');
        if (modeSelection) {
            modeSelection.innerHTML = this.generateModeCards();
            this.setupMenuEvents(document.getElementById('beautifulMenu'));
        }
    }

    createBeautifulMenu() {
        // Create beautiful menu overlay
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'beautifulMenu';
        menuOverlay.className = 'beautiful-menu';
        menuOverlay.innerHTML = `
            <div class="menu-content">
                <h1 class="game-title">BALL, THE DEFENDER</h1>
                <h2 class="game-subtitle">Beautiful Architecture</h2>
                
                <div class="mode-selection">
                    ${this.generateModeCards()}
                </div>
                
                <div class="instructions">
                    <p>Click on the canvas to launch balls • Space to pause</p>
                </div>
            </div>
        `;
        
        // Add beautiful styles
        const style = document.createElement('style');
        style.textContent = `
            .beautiful-menu {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a23 0%, #1a1a3a 50%, #2a2a4a 100%);
                display: flex;
                align-items: flex-start;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.5s ease-in;
                overflow-y: auto;
                padding: 20px 0;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .menu-content {
                text-align: center;
                color: white;
                width: 100%;
                max-width: 1400px;
                padding: 20px;
                min-height: calc(100vh - 40px);
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .game-title {
                font-size: clamp(48px, 8vw, 64px);
                color: #64ffda;
                text-shadow: 0 0 30px #64ffda;
                margin-bottom: 10px;
                font-family: 'Courier New', monospace;
                letter-spacing: 4px;
                animation: glow 2s ease-in-out infinite;
            }
            
            @keyframes glow {
                0%, 100% { text-shadow: 0 0 30px #64ffda; }
                50% { text-shadow: 0 0 50px #64ffda, 0 0 80px #64ffda; }
            }
            
            .game-subtitle {
                font-size: 20px;
                color: #f093fb;
                margin-bottom: 40px;
                font-family: 'Courier New', monospace;
            }
            
            .mode-selection {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 25px;
                justify-content: center;
                margin-bottom: 30px;
                max-width: 1200px;
                margin-left: auto;
                margin-right: auto;
                padding: 0 20px;
            }
            
            /* Responsive breakpoints */
            @media (max-width: 768px) {
                .mode-selection {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    padding: 0 15px;
                }
            }
            
            @media (max-width: 480px) {
                .mode-selection {
                    grid-template-columns: 1fr;
                    gap: 15px;
                    padding: 0 10px;
                }
            }
            
            .mode-card {
                background: rgba(0, 0, 0, 0.5);
                border: 3px solid var(--border-color, #64ffda);
                border-radius: 15px;
                padding: 25px;
                min-height: 200px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .mode-card:hover, .mode-card.active {
                transform: translateY(-10px);
                box-shadow: 0 10px 40px rgba(100, 255, 218, 0.6);
            }
            
            /* Dynamic mode card styling handled by CSS custom properties */
            
            .mode-card h3 {
                font-size: 24px;
                margin-bottom: 15px;
                color: var(--header-color, #64ffda);
            }
            
            .mode-card p {
                color: #ffffff;
                margin-bottom: 20px;
                font-size: 16px;
            }
            
            .play-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
            }
            
            .play-button:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            }
            
            /* Dynamic button styling handled inline */
            
            .instructions {
                color: #ffffff;
                opacity: 0.8;
                font-size: 14px;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(menuOverlay);
        
        // Add event listeners
        this.setupMenuEvents(menuOverlay);
    }
    
    setupMenuEvents(menuOverlay) {
        const modeCards = menuOverlay.querySelectorAll('.mode-card');
        const playButtons = menuOverlay.querySelectorAll('.play-button');
        
        // Mode selection
        modeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Remove active from all cards
                modeCards.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked card
                card.classList.add('active');
                
                // Store selected mode
                this.selectedMode = card.dataset.mode;
                
                console.log(`🎯 Mode selected: ${this.selectedMode}`);
            });
        });
        
        // Play buttons
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startGame();
            });
        });
    }
    
    startGame() {
        console.log(`🚀 Starting game with mode: ${this.selectedMode}`);
        
        // Hide menu
        const menu = document.getElementById('beautifulMenu');
        if (menu) {
            menu.style.display = 'none';
        }
        
        this.isVisible = false;
        
        // Show game canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'block';
        }
        
        // Start the game with blocks like original
        const gameLogic = this.engine.plugins.get('gameLogic');
        if (gameLogic) {
            gameLogic.startNewGame();
        }
        this.engine.setState('playing');
        
        console.log('🎮 Beautiful game started!');
    }
    
    showMenu() {
        const menu = document.getElementById('beautifulMenu');
        if (menu) {
            menu.style.display = 'flex';
        }
        this.isVisible = true;
        this.engine.setState('idle');
    }
    
    hideMenu() {
        const menu = document.getElementById('beautifulMenu');
        if (menu) {
            menu.style.display = 'none';
        }
        this.isVisible = false;
    }
}

// Export
window.MenuPlugin = MenuPlugin;

// Example of how to add a new game mode:
/* 
window.ballDefenderApp.engine.plugins.get('menu').addGameMode({
    id: 'laser',
    name: '⚡ LASER MODE',
    description: 'High-tech precision',
    theme: 'laser',
    colors: {
        border: '#00ff41',
        header: '#00ff41',
        button: 'linear-gradient(135deg, #00ff41 0%, #00cc33 100%)',
        hover: 'rgba(0, 255, 65, 0.4)'
    }
});
*/

console.log('🎮 Beautiful Menu Plugin loaded');
console.log('💡 To add new modes: ballDefenderApp.engine.plugins.get("menu").addGameMode(config)');