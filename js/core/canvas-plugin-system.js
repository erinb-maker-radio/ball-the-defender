/**
 * CANVAS PLUGIN SYSTEM - SMART ARCHITECTURE
 * =========================================
 * 
 * Clean plugin system for canvas rendering extensions.
 * No patches or hacks to core game - pure event-driven architecture.
 */

class CanvasPluginSystem {
    constructor() {
        this.renderPlugins = new Map();
        this.isActive = false;
        
        console.log('🎨 CanvasPluginSystem initialized');
    }
    
    /**
     * Initialize the plugin system
     */
    initialize() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.setupCanvasHooks();
        
        console.log('✅ CanvasPluginSystem activated');
    }
    
    /**
     * Setup canvas rendering hooks using events
     */
    setupCanvasHooks() {
        // Create custom events for canvas rendering phases
        this.createRenderingEvents();
        
        // Hook into existing canvas operations
        this.hookCanvasOperations();
    }
    
    /**
     * Create custom rendering events
     */
    createRenderingEvents() {
        // Create custom events that can be dispatched
        this.events = {
            preRender: new CustomEvent('canvasPreRender'),
            postRender: new CustomEvent('canvasPostRender'),
            blockRender: new CustomEvent('canvasBlockRender')
        };
    }
    
    /**
     * Hook into canvas operations cleanly
     */
    hookCanvasOperations() {
        // Smart canvas detection - wait for canvas to be available
        const waitForCanvas = () => {
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                console.log('⏳ Waiting for gameCanvas to be available...');
                setTimeout(waitForCanvas, 100);
                return;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.log('⏳ Waiting for canvas context...');
                setTimeout(waitForCanvas, 100);
                return;
            }
            
            // Hook into both clearRect AND fillRect methods to trigger our rendering
            const originalClearRect = ctx.clearRect;
            const originalFillRect = ctx.fillRect;
            
            ctx.clearRect = (...args) => {
                // Call original
                originalClearRect.apply(ctx, args);
                
                // Trigger our post-render plugins
                this.triggerRenderPlugins(ctx);
            };
            
            ctx.fillRect = (...args) => {
                // Call original
                originalFillRect.apply(ctx, args);
                
                // Check if this is a full-canvas clear (background fill)
                const [x, y, width, height] = args;
                if (x === 0 && y === 0 && width === canvas.width && height === canvas.height) {
                    // This is a canvas clear operation - trigger plugins
                    this.triggerRenderPlugins(ctx);
                }
            };
            
            console.log('✅ Canvas operations hooked successfully (clearRect + fillRect)');
        };
        
        waitForCanvas();
    }
    
    /**
     * Trigger all render plugins
     */
    triggerRenderPlugins(ctx) {
        if (!this.isActive) return;
        
        const currentTime = performance.now();
        
        this.renderPlugins.forEach((plugin, name) => {
            try {
                if (plugin.isActive && plugin.render) {
                    plugin.render(ctx, currentTime);
                }
            } catch (error) {
                console.error(`Canvas plugin error (${name}):`, error);
            }
        });
    }
    
    /**
     * Register a render plugin
     */
    registerRenderPlugin(plugin) {
        if (!plugin.name) {
            console.error('❌ Canvas plugin must have a name property');
            return false;
        }
        
        this.renderPlugins.set(plugin.name, plugin);
        console.log(`✅ Canvas render plugin registered: ${plugin.name}`);
        return true;
    }
    
    /**
     * Unregister a render plugin
     */
    unregisterRenderPlugin(pluginName) {
        if (this.renderPlugins.has(pluginName)) {
            this.renderPlugins.delete(pluginName);
            console.log(`🧹 Canvas render plugin unregistered: ${pluginName}`);
            return true;
        }
        return false;
    }
    
    /**
     * Activate a render plugin
     */
    activateRenderPlugin(pluginName) {
        const plugin = this.renderPlugins.get(pluginName);
        if (plugin) {
            plugin.isActive = true;
            console.log(`✅ Canvas render plugin activated: ${pluginName}`);
            return true;
        }
        return false;
    }
    
    /**
     * Deactivate a render plugin
     */
    deactivateRenderPlugin(pluginName) {
        const plugin = this.renderPlugins.get(pluginName);
        if (plugin) {
            plugin.isActive = false;
            console.log(`🧹 Canvas render plugin deactivated: ${pluginName}`);
            return true;
        }
        return false;
    }
    
    /**
     * Get plugin status
     */
    getStatus() {
        const status = {
            isActive: this.isActive,
            totalPlugins: this.renderPlugins.size,
            activePlugins: 0,
            plugins: {}
        };
        
        this.renderPlugins.forEach((plugin, name) => {
            const isActive = plugin.isActive || false;
            if (isActive) status.activePlugins++;
            
            status.plugins[name] = {
                active: isActive,
                hasRender: typeof plugin.render === 'function'
            };
        });
        
        return status;
    }
    
    /**
     * Debug status
     */
    debugStatus() {
        const status = this.getStatus();
        console.log('🎨 CanvasPluginSystem Status:', status);
        return status;
    }
    
    /**
     * Cleanup
     */
    cleanup() {
        this.renderPlugins.clear();
        this.isActive = false;
        console.log('🧹 CanvasPluginSystem cleaned up');
    }
}

// Create global instance
window.CanvasPluginSystem = new CanvasPluginSystem();

// Auto-initialize when canvas is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (document.getElementById('gameCanvas')) {
            window.CanvasPluginSystem.initialize();
        }
    }, 1000); // Wait for game initialization
});

console.log('🎨 CanvasPluginSystem loaded - Smart canvas rendering architecture ready');