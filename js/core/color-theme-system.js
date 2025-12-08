/**
 * Color Theme System - Beautiful color management architecture
 * Clean, extensible system for managing game colors and themes
 */

class ColorThemeSystem {
    constructor() {
        this.currentTheme = 'original';
        this.themes = new Map();
        this.registerBuiltInThemes();
        console.log('🎨 Color Theme System created');
    }
    
    initialize(engine) {
        this.engine = engine;
        this.applyTheme(this.currentTheme);
        this.setupGlobalAPI();
        console.log('🎨 Color Theme System initialized');
    }
    
    registerBuiltInThemes() {
        // Original Ball Defender theme
        this.registerTheme('original', {
            name: 'Original Ball Defender',
            blocks: {
                healthy: { base: '#4CAF50', glow: '#81C784', shadow: '#388E3C' },
                damaged: { base: '#FF9800', glow: '#FFB74D', shadow: '#F57C00' },
                critical: { base: '#F44336', glow: '#E57373', shadow: '#D32F2F' }
            },
            special: {
                spawner: { base: '#FFD700', glow: '#FFF59D', shadow: '#F9A825' },
                exploder: { base: '#FF6F00', glow: '#FFB300', shadow: '#E65100' },
                freeze: { base: '#00e5ff', glow: '#b3e5fc', shadow: '#0277bd' }
            },
            hpColors: {
                1: { base: '#F44336', glow: '#E57373', shadow: '#D32F2F' },
                2: { base: '#FF9800', glow: '#FFB74D', shadow: '#F57C00' },
                3: { base: '#4CAF50', glow: '#81C784', shadow: '#388E3C' },
                4: { base: '#2196F3', glow: '#64B5F6', shadow: '#1976D2' },
                5: { base: '#9C27B0', glow: '#BA68C8', shadow: '#7B1FA2' },
                default: { base: '#4CAF50', glow: '#81C784', shadow: '#388E3C' }
            },
            ball: '#2196F3',
            ballTrail: '#64B5F6',
            background: '#0a0a23',
            text: '#FFFFFF'
        });
        
        // Ball Go Boom theme
        this.registerTheme('boom', {
            name: 'Ball Go Boom',
            blocks: {
                healthy: { base: '#FF6B35', glow: '#FF8A50', shadow: '#E65100' },
                damaged: { base: '#FF3D00', glow: '#FF6333', shadow: '#BF360C' },
                critical: { base: '#D32F2F', glow: '#EF5350', shadow: '#B71C1C' }
            },
            special: {
                spawner: { base: '#FFAB00', glow: '#FFC947', shadow: '#FF8F00' },
                exploder: { base: '#FF1744', glow: '#FF5722', shadow: '#D50000' },
                freeze: { base: '#00B0FF', glow: '#40C4FF', shadow: '#0091EA' }
            },
            hpColors: {
                1: { base: '#D32F2F', glow: '#EF5350', shadow: '#B71C1C' },
                2: { base: '#FF3D00', glow: '#FF6333', shadow: '#BF360C' },
                3: { base: '#FF6B35', glow: '#FF8A50', shadow: '#E65100' },
                4: { base: '#FF9800', glow: '#FFB74D', shadow: '#F57C00' },
                5: { base: '#FFAB00', glow: '#FFC947', shadow: '#FF8F00' },
                default: { base: '#FF6B35', glow: '#FF8A50', shadow: '#E65100' }
            },
            ball: '#FF5722',
            ballTrail: '#FF8A65',
            background: '#230a0a',
            text: '#FFFFFF'
        });
        
        // Ice Mode theme
        this.registerTheme('ice', {
            name: 'Ice Mode',
            blocks: {
                healthy: { base: '#00BCD4', glow: '#4DD0E1', shadow: '#0097A7' },
                damaged: { base: '#0277BD', glow: '#29B6F6', shadow: '#01579B' },
                critical: { base: '#1976D2', glow: '#42A5F5', shadow: '#0D47A1' }
            },
            special: {
                spawner: { base: '#00E5FF', glow: '#B3E5FC', shadow: '#0277BD' },
                exploder: { base: '#2979FF', glow: '#82B1FF', shadow: '#1565C0' },
                freeze: { base: '#00E5FF', glow: '#B3E5FC', shadow: '#0277BD' }
            },
            hpColors: {
                1: { base: '#1976D2', glow: '#42A5F5', shadow: '#0D47A1' },
                2: { base: '#0277BD', glow: '#29B6F6', shadow: '#01579B' },
                3: { base: '#00BCD4', glow: '#4DD0E1', shadow: '#0097A7' },
                4: { base: '#00E5FF', glow: '#B3E5FC', shadow: '#0277BD' },
                5: { base: '#40C4FF', glow: '#81D4FA', shadow: '#0288D1' },
                default: { base: '#00BCD4', glow: '#4DD0E1', shadow: '#0097A7' }
            },
            ball: '#00E5FF',
            ballTrail: '#B3E5FC',
            background: '#0a1a2e',
            text: '#FFFFFF'
        });
    }
    
    registerTheme(id, themeData) {
        this.themes.set(id, themeData);
        console.log(`🎨 Theme registered: ${themeData.name}`);
    }
    
    applyTheme(themeId) {
        const theme = this.themes.get(themeId);
        if (!theme) {
            console.error(`❌ Unknown theme: ${themeId}`);
            return false;
        }
        
        this.currentTheme = themeId;
        this.activeTheme = theme;
        
        // Apply theme colors to plugins that need them
        this.notifyPluginsThemeChange();
        
        console.log(`🎨 Theme applied: ${theme.name}`);
        return true;
    }
    
    notifyPluginsThemeChange() {
        if (!this.engine) return;
        
        this.engine.plugins.forEach(plugin => {
            if (plugin.onThemeChange) {
                plugin.onThemeChange(this.activeTheme);
            }
        });
    }
    
    setupGlobalAPI() {
        // Expose colors globally for compatibility
        window.colors = {
            block: this.activeTheme.blocks,
            special: this.activeTheme.special,
            blockByHP: this.activeTheme.hpColors
        };
        
        // Expose theme system
        window.colorThemes = {
            current: () => this.currentTheme,
            apply: (themeId) => this.applyTheme(themeId),
            get: (themeId) => this.themes.get(themeId),
            register: (id, theme) => this.registerTheme(id, theme)
        };
        
        console.log('🎨 Global color theme API configured');
    }
    
    // Get colors for specific block based on HP or special type
    getBlockColors(block) {
        if (block.specialType) {
            return this.activeTheme.special[block.specialType] || this.activeTheme.special.spawner;
        }
        
        if (block.hitPoints !== undefined) {
            return this.activeTheme.hpColors[block.hitPoints] || this.activeTheme.hpColors.default;
        }
        
        // Fallback based on health ratio
        const healthRatio = block.hitPoints / block.maxHitPoints;
        if (healthRatio > 0.66) {
            return this.activeTheme.blocks.healthy;
        } else if (healthRatio > 0.33) {
            return this.activeTheme.blocks.damaged;
        } else {
            return this.activeTheme.blocks.critical;
        }
    }
    
    getBallColors() {
        return {
            main: this.activeTheme.ball,
            trail: this.activeTheme.ballTrail
        };
    }
    
    getBackgroundColor() {
        return this.activeTheme.background;
    }
    
    // Mode-aware theme switching
    onModeChange(mode) {
        this.applyTheme(mode);
    }
}

// Export
window.ColorThemeSystem = ColorThemeSystem;
console.log('🎨 Beautiful Color Theme System loaded');