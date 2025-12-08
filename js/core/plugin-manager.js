/**
 * PLUGIN MANAGER - SMART ARCHITECTURE
 * ===================================
 * 
 * Clean plugin coordination system that manages game plugins
 * without patches or hacks to the core game engine.
 */

class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.activePlugins = new Set();
        this.hooks = new Map();
        
        console.log('🔧 PluginManager initialized');
    }
    
    /**
     * Register a plugin with the manager
     */
    registerPlugin(plugin) {
        if (!plugin.name) {
            console.error('❌ Plugin must have a name property');
            return false;
        }
        
        if (this.plugins.has(plugin.name)) {
            console.warn(`⚠️ Plugin ${plugin.name} is already registered`);
            return false;
        }
        
        this.plugins.set(plugin.name, plugin);
        console.log(`✅ Plugin registered: ${plugin.name}`);
        return true;
    }
    
    /**
     * Activate a plugin by name
     */
    activatePlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            console.error(`❌ Plugin ${pluginName} not found`);
            return false;
        }
        
        if (this.activePlugins.has(pluginName)) {
            console.warn(`⚠️ Plugin ${pluginName} is already active`);
            return true;
        }
        
        try {
            if (plugin.activate) {
                plugin.activate();
            }
            this.activePlugins.add(pluginName);
            console.log(`✅ Plugin activated: ${pluginName}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to activate plugin ${pluginName}:`, error);
            return false;
        }
    }
    
    /**
     * Deactivate a plugin by name
     */
    deactivatePlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            console.error(`❌ Plugin ${pluginName} not found`);
            return false;
        }
        
        if (!this.activePlugins.has(pluginName)) {
            console.warn(`⚠️ Plugin ${pluginName} is not active`);
            return true;
        }
        
        try {
            if (plugin.deactivate) {
                plugin.deactivate();
            }
            this.activePlugins.delete(pluginName);
            console.log(`🧹 Plugin deactivated: ${pluginName}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to deactivate plugin ${pluginName}:`, error);
            return false;
        }
    }
    
    /**
     * Get a plugin instance
     */
    getPlugin(pluginName) {
        return this.plugins.get(pluginName);
    }
    
    /**
     * Check if a plugin is active
     */
    isPluginActive(pluginName) {
        return this.activePlugins.has(pluginName);
    }
    
    /**
     * Get all registered plugins
     */
    getRegisteredPlugins() {
        return Array.from(this.plugins.keys());
    }
    
    /**
     * Get all active plugins
     */
    getActivePlugins() {
        return Array.from(this.activePlugins);
    }
    
    /**
     * Activate plugins for a specific game mode
     */
    activatePluginsForMode(modeId) {
        console.log(`🎮 Activating plugins for mode: ${modeId}`);
        
        // Mode-specific plugin activation
        const modePlugins = {
            'iceFrost': ['FreezePlugin', 'SmartParticlePlugin'],
            'ballGoBoom': [], // Boom mode doesn't need plugins currently
            'original': []
        };
        
        // Deactivate all plugins first
        this.deactivateAllPlugins();
        
        // Activate plugins for this mode
        const pluginsToActivate = modePlugins[modeId] || [];
        pluginsToActivate.forEach(pluginName => {
            this.activatePlugin(pluginName);
        });
        
        console.log(`✅ Mode ${modeId} plugins activated: ${pluginsToActivate.join(', ') || 'none'}`);
    }
    
    /**
     * Deactivate all active plugins
     */
    deactivateAllPlugins() {
        console.log('🧹 Deactivating all plugins');
        
        const activePlugins = Array.from(this.activePlugins);
        activePlugins.forEach(pluginName => {
            this.deactivatePlugin(pluginName);
        });
    }
    
    /**
     * Get plugin status information
     */
    getStatus() {
        const status = {
            totalPlugins: this.plugins.size,
            activePlugins: this.activePlugins.size,
            plugins: {}
        };
        
        this.plugins.forEach((plugin, name) => {
            status.plugins[name] = {
                active: this.activePlugins.has(name),
                version: plugin.version || 'unknown',
                info: plugin.getInfo ? plugin.getInfo() : 'no info available'
            };
        });
        
        return status;
    }
    
    /**
     * Debug function to log status
     */
    debugStatus() {
        const status = this.getStatus();
        console.log('🔧 Plugin Manager Status:', status);
        return status;
    }
}

// Create global instance
window.PluginManager = new PluginManager();

// Hook into mode changes to automatically activate/deactivate plugins
if (window.addEventListener) {
    // Listen for mode changes
    let currentMode = null;
    const checkModeChange = () => {
        const newMode = window.currentGameMode?.id;
        if (newMode && newMode !== currentMode) {
            currentMode = newMode;
            window.PluginManager.activatePluginsForMode(newMode);
        }
    };
    
    // Check for mode changes periodically
    setInterval(checkModeChange, 1000);
}

console.log('🔧 PluginManager loaded - Smart architecture ready');