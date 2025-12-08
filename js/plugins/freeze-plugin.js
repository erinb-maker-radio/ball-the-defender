/**
 * FREEZE PLUGIN - CLEAN ARCHITECTURE
 * ==================================
 * 
 * Smart plugin architecture for freeze block functionality.
 * Integrates cleanly with the game engine without patches or hacks.
 */

class FreezePlugin {
    constructor() {
        this.name = 'FreezePlugin';
        this.version = '1.0.0';
        this.frozenBlocks = new Map();
        this.freezeTimers = new Map();
        this.isFreezing = false;
        this.isActive = false;
        
        console.log('🧊 FreezePlugin initialized');
    }
    
    /**
     * Activate the freeze plugin
     */
    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.registerGlobalAPI();
        this.hookIntoGameEvents();
        
        console.log('✅ FreezePlugin activated');
    }
    
    /**
     * Deactivate the freeze plugin
     */
    deactivate() {
        if (!this.isActive) return;
        
        this.cleanup();
        this.unregisterGlobalAPI();
        this.isActive = false;
        
        console.log('🧹 FreezePlugin deactivated');
    }
    
    /**
     * Register global API for external access
     */
    registerGlobalAPI() {
        window.iceMode = {
            freezeBlocksInRadius: (x, y, radius) => this.freezeBlocksInRadius(x, y, radius),
            unfreezeAllBlocks: () => this.unfreezeAllBlocks(),
            isBlockFrozen: (block) => block.frozen === true,
            plugin: this
        };
    }
    
    /**
     * Unregister global API
     */
    unregisterGlobalAPI() {
        if (window.iceMode?.plugin === this) {
            delete window.iceMode;
        }
    }
    
    /**
     * Hook into game events cleanly
     */
    hookIntoGameEvents() {
        // Store original functions to restore later
        this.originalFunctions = {};
        
        // Hook into block rendering if needed
        this.hookBlockRendering();
        
        // Hook into game reset
        this.hookGameReset();
    }
    
    /**
     * Hook into block rendering system
     */
    hookBlockRendering() {
        // The rendering is already handled by the main game loop
        // This plugin just manages the frozen state
    }
    
    /**
     * Hook into game reset to cleanup
     */
    hookGameReset() {
        const originalStartGame = window.startGame;
        if (originalStartGame) {
            this.originalFunctions.startGame = originalStartGame;
            window.startGame = (...args) => {
                this.cleanup();
                return originalStartGame.apply(this, args);
            };
        }
    }
    
    /**
     * Main freeze functionality - freezes blocks in radius
     */
    freezeBlocksInRadius(centerX, centerY, radius) {
        if (!window.blocks || this.isFreezing) {
            return;
        }
        
        this.isFreezing = true;
        console.log(`🧊 Freezing blocks at (${centerX}, ${centerY}) radius: ${radius}`);
        
        const freezePixelRadius = radius * 100;
        const affectedBlocks = [];
        
        // Find blocks within freeze radius
        window.blocks.forEach((block, index) => {
            if (block.destroyed || block.frozen) return;
            
            const blockCenterX = block.x + (block.width || 50) / 2;
            const blockCenterY = block.y + (block.height || 25) / 2;
            const centerBlockX = centerX + 30;
            const centerBlockY = centerY + 30;
            
            const dx = blockCenterX - centerBlockX;
            const dy = blockCenterY - centerBlockY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10 && distance <= freezePixelRadius) {
                affectedBlocks.push({ block, index });
            }
        });
        
        console.log(`🧊 Found ${affectedBlocks.length} blocks to freeze`);
        
        // Freeze each block
        affectedBlocks.forEach(({ block, index }) => {
            this.freezeBlock(block, index);
        });
        
        // Play freeze sound
        this.playFreezeSound();
        
        this.isFreezing = false;
    }
    
    /**
     * Freeze a specific block
     */
    freezeBlock(block, index) {
        if (!block || block.destroyed) return;
        
        // Clear existing timer if re-freezing
        if (this.freezeTimers.has(index)) {
            clearInterval(this.freezeTimers.get(index));
        }
        
        // Mark as frozen
        block.frozen = true;
        block.freezeCountdown = 5;
        this.frozenBlocks.set(index, block);
        
        console.log(`🧊 Block ${index} frozen - countdown: 5 seconds`);
        
        // Start countdown timer
        this.startCountdown(block, index);
    }
    
    /**
     * Start countdown timer for frozen block
     */
    startCountdown(block, index) {
        const timer = setInterval(() => {
            if (!block || block.destroyed) {
                clearInterval(timer);
                this.freezeTimers.delete(index);
                this.frozenBlocks.delete(index);
                return;
            }
            
            block.freezeCountdown--;
            console.log(`🧊 Block ${index} countdown: ${block.freezeCountdown}`);
            
            if (block.freezeCountdown <= 0) {
                this.unfreezeBlock(block, index);
            }
        }, 1000);
        
        this.freezeTimers.set(index, timer);
    }
    
    /**
     * Unfreeze a specific block
     */
    unfreezeBlock(block, index) {
        if (!block) return;
        
        console.log(`🔥 Unfreezing block ${index}`);
        
        block.frozen = false;
        delete block.freezeCountdown;
        
        // Clear timer
        if (this.freezeTimers.has(index)) {
            clearInterval(this.freezeTimers.get(index));
            this.freezeTimers.delete(index);
        }
        
        this.frozenBlocks.delete(index);
        this.playUnfreezeSound();
    }
    
    /**
     * Unfreeze all blocks
     */
    unfreezeAllBlocks() {
        console.log('🔥 Unfreezing all blocks');
        
        this.frozenBlocks.forEach((block, index) => {
            if (block) {
                block.frozen = false;
                delete block.freezeCountdown;
            }
        });
        
        // Clear all timers
        this.freezeTimers.forEach(timer => clearInterval(timer));
        
        this.frozenBlocks.clear();
        this.freezeTimers.clear();
    }
    
    /**
     * Play freeze sound effect
     */
    playFreezeSound() {
        if (window.audioEngine?.playCustomSound) {
            window.audioEngine.playCustomSound({
                frequency: 800,
                type: 'square',
                duration: 0.3,
                volume: 0.3,
                effects: ['glitch', 'crackle']
            });
        }
    }
    
    /**
     * Play unfreeze sound effect
     */
    playUnfreezeSound() {
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
    
    /**
     * Cleanup all freeze state
     */
    cleanup() {
        console.log('🧹 FreezePlugin cleanup');
        
        this.unfreezeAllBlocks();
        
        // Restore original functions
        if (this.originalFunctions.startGame) {
            window.startGame = this.originalFunctions.startGame;
        }
        
        this.originalFunctions = {};
    }
    
    /**
     * Get plugin info
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            isActive: this.isActive,
            frozenBlockCount: this.frozenBlocks.size,
            activeTimers: this.freezeTimers.size
        };
    }
}

// Plugin Manager Integration
if (typeof window.PluginManager !== 'undefined') {
    window.PluginManager.registerPlugin(new FreezePlugin());
} else {
    // Create plugin instance for direct use
    window.FreezePlugin = new FreezePlugin();
    console.log('💡 FreezePlugin ready - use window.FreezePlugin.activate() to enable');
}

console.log('🧊 FreezePlugin loaded - Smart architecture ready');