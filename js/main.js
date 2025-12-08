/**
 * Ball Defender - Main Application Entry Point
 * ==========================================
 * GitHub Architecture - Direct Canvas Game
 */

// Debug mode - set to true to enable console logging
const MAIN_DEBUG_MODE = false;
function mainDebugLog(...args) { if (MAIN_DEBUG_MODE) console.log(...args); }
function mainDebugWarn(...args) { if (MAIN_DEBUG_MODE) console.warn(...args); }

// Game Configuration - GitHub Version
const BALL_DEFENDER_CONFIG = {
    version: '2.0.0-github',
    architecture: 'github-original',
    modules: [
        // Core GitHub modules
        'js/core/color-schemes.js',
        'js/core/block-renderers.js', 
        'js/core/game-core.js',
        'js/core/plugin-manager.js',
        'js/core/canvas-plugin-system.js',
        
        // GitHub utilities (only existing files)
        'js/utils/force-canvas-clear.js',
        'js/utils/canvas-size-optimizer.js',
        'js/utils/secure-time-tracker.js',
        'js/utils/global-time-tracker.js',
        'js/utils/main-menu.js',
        'js/utils/return-to-menu.js',
        'js/utils/boom-button-manager.js',
        'js/utils/ball-go-boom-glow-enhancer.js',
        
        // GitHub UI
        'js/ui/boom-button-dom.js',
        
        // GitHub Audio
        'js/audio/audio-framework.js',
        'js/audio/mobile-touch-controls.js',
        
        // Smart Plugin Architecture
        'js/plugins/freeze-plugin.js',
        'js/plugins/smart-particle-plugin.js',
        
        // Performance Optimization Systems
        'js/plugins/smart-particle-plugin-optimized.js',
        'js/core/optimized-canvas-system.js',
        'js/utils/performance-monitor.js',
        
        // GitHub Game Modes
        'js/modes/mode-template-system.js',
        'js/modes/original-mode-proper.js',
        'js/modes/ball-go-boom-mode-proper.js',
        'js/modes/ice-mode-proper.js',
        
        // GitHub Leaderboard (migration system removed)
        'js/leaderboard/disable-github-gist.js',
        'js/leaderboard/secure-highscore-auth.js',
        'js/leaderboard/simple-supabase-leaderboard.js',
        
        // Protected Leaderboard System
        'js/leaderboard/PROTECTED-leaderboard-core.js',
        'js/leaderboard/PROTECTED-supabase-integration.js',
        
        // Protected Theme Files (integrated into Mode Template System)
        'js/themes/PROTECTED-original-theme.js',
        'js/themes/PROTECTED-ice-theme.js',
        
        // PROTECTED FIX: Ball detonation logic (MUST NOT BE MODIFIED)
        'js/core/PROTECTED-ball-detonation-fix.js',
        
        // Main game engine (GitHub version)
        'js/core/game.js'
    ]
};

/**
 * GitHub Module Loader - Organized and reliable
 */
class GitHubLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
    }
    
    async loadScript(src) {
        if (this.loadedModules.has(src)) {
            return Promise.resolve();
        }

        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loadedModules.add(src);
                // Module loaded (no logging needed - only log errors)
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });

        this.loadingPromises.set(src, promise);
        return promise;
    }
    
    async loadGitHubArchitecture() {
        mainDebugLog(`🎮 Ball, The Defender ${BALL_DEFENDER_CONFIG.version}`);
        mainDebugLog(`🚀 Loading ${BALL_DEFENDER_CONFIG.modules.length} game modules...`);

        try {
            for (const module of BALL_DEFENDER_CONFIG.modules) {
                await this.loadScript(module);
            }

            mainDebugLog('✅ All modules loaded successfully!');
            this.initializeGame();

        } catch (error) {
            console.error('❌ Module loading failed:', error);
            throw error;
        }
    }

    initializeGame() {
        mainDebugLog('🎯 Initializing Ball, The Defender...');

        // GitHub architecture uses window.gameCore
        if (typeof window.gameCore !== 'undefined') {
            mainDebugLog('✅ Game initialized successfully!');
        } else {
            mainDebugWarn('⚠️ Game core not found - checking compatibility...');
        }
    }
}

/**
 * GitHub Application Startup
 */
document.addEventListener('DOMContentLoaded', async () => {
    mainDebugLog(`🎮 Ball, The Defender v${BALL_DEFENDER_CONFIG.version} - ${BALL_DEFENDER_CONFIG.architecture} Architecture`);
    
    const loader = new GitHubLoader();
    await loader.loadGitHubArchitecture();
});

// Export GitHub API
window.BallDefender = {
    config: BALL_DEFENDER_CONFIG,
    architecture: 'GitHub Original Architecture'
};
