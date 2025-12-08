/**
 * Theme Integration System
 * ========================
 * Integrates protected theme files with the game's mode system
 * Applies theme configurations when modes are activated
 */

// Theme Integration Manager
class ThemeIntegrationSystem {
    constructor() {
        this.currentTheme = null;
        this.availableThemes = new Map();
        this.initialized = false;
        
        // CSS custom properties for dynamic theming
        this.cssVariables = new Map();
        
        console.log('🎨 Theme Integration System initialized');
    }
    
    // Initialize and discover available themes
    initialize() {
        console.log('🎨 Initializing theme system...');
        
        try {
            // Register available protected themes
            this.registerTheme('original', window.PROTECTED_ORIGINAL_THEME, window.PROTECTED_applyOriginalTheme);
            
            // Future themes will be registered here when created
            // this.registerTheme('ballGoBoom', window.PROTECTED_BALLGOBOOM_THEME, window.PROTECTED_applyBallGoBoomTheme);
            // this.registerTheme('iceFrost', window.PROTECTED_ICEFROST_THEME, window.PROTECTED_applyIceFrostTheme);
            
            this.initialized = true;
            console.log(`🎨 Theme system ready with ${this.availableThemes.size} themes`);
            
        } catch (error) {
            console.error('❌ Theme system initialization failed:', error);
            this.initialized = false;
        }
    }
    
    // Register a theme configuration
    registerTheme(modeId, themeConfig, applyFunction) {
        if (!themeConfig || !applyFunction) {
            console.warn(`⚠️ Theme registration failed for ${modeId}: missing config or apply function`);
            return false;
        }
        
        this.availableThemes.set(modeId, {
            config: themeConfig,
            apply: applyFunction,
            registered: Date.now()
        });
        
        console.log(`✅ Registered theme for ${modeId}`);
        return true;
    }
    
    // Apply theme for a specific mode
    applyTheme(modeId) {
        if (!this.initialized) {
            console.warn('⚠️ Theme system not initialized, attempting to initialize...');
            this.initialize();
        }
        
        const theme = this.availableThemes.get(modeId);
        if (!theme) {
            console.warn(`⚠️ No theme available for mode: ${modeId}`);
            return false;
        }
        
        try {
            console.log(`🎨 Applying ${modeId} theme...`);
            
            // Apply the theme using its protected function
            const appliedTheme = theme.apply();
            console.log(`🎨 Theme data retrieved:`, appliedTheme);
            
            // Apply CSS custom properties
            this.applyCSSVariables(appliedTheme);
            
            // Apply background styling
            this.applyBackgroundStyling(appliedTheme);
            
            // Apply particle configuration
            this.applyParticleConfiguration(appliedTheme);
            
            // Store theme data properly for block colors
            this.currentTheme = appliedTheme;
            this.currentTheme.modeId = modeId;
            
            // Apply block colors to game renderer
            this.applyBlockColors();
            
            console.log(`✅ ${modeId} theme applied successfully`);
            console.log(`🎨 Block colors available:`, this.currentTheme.blocks ? Object.keys(this.currentTheme.blocks) : 'none');
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to apply ${modeId} theme:`, error);
            return false;
        }
    }
    
    // Apply CSS custom properties for dynamic styling
    applyCSSVariables(theme) {
        const root = document.documentElement;
        
        // Apply color variables
        if (theme.colors) {
            root.style.setProperty('--theme-primary', theme.colors.primary);
            root.style.setProperty('--theme-accent', theme.colors.accent);
            root.style.setProperty('--theme-forest-green', theme.colors.forestGreen);
            root.style.setProperty('--theme-dark-olive', theme.colors.darkOlive);
            root.style.setProperty('--theme-light-green', theme.colors.lightGreen);
            root.style.setProperty('--theme-dark-brown', theme.colors.darkBrown);
        }
        
        console.log('🎨 CSS variables applied');
    }
    
    // Apply background styling
    applyBackgroundStyling(theme) {
        if (!theme.background || !theme.background.gameField) {
            return;
        }
        
        const gameArea = document.querySelector('.game-area');
        const gameField = theme.background.gameField;
        
        if (gameArea && gameField.type === 'organic-forest') {
            // Apply the organic forest background
            gameArea.style.backgroundColor = gameField.baseColor;
            
            // Create background pattern (simplified implementation)
            const patternCSS = this.createBackgroundPattern(gameField.pattern);
            gameArea.style.backgroundImage = patternCSS;
            
            console.log('🌲 Forest background pattern applied');
        }
    }
    
    // Create CSS background pattern from theme configuration
    createBackgroundPattern(patternConfig) {
        if (!patternConfig || !patternConfig.elements) {
            return 'none';
        }
        
        // Create a layered background pattern
        const layers = [];
        
        patternConfig.elements.forEach(element => {
            switch (element.type) {
                case 'tree-silhouettes':
                    // Simplified tree pattern using CSS
                    layers.push(`radial-gradient(ellipse at 20% 80%, ${element.color} 0%, transparent 50%)`);
                    break;
                    
                case 'leaf-clusters':
                    // Leaf cluster pattern
                    layers.push(`radial-gradient(circle at 70% 30%, ${element.color} 0%, transparent 30%)`);
                    break;
                    
                case 'organic-shapes':
                    // Organic shapes pattern
                    layers.push(`linear-gradient(45deg, ${element.color} 0%, transparent 20%)`);
                    break;
                    
                case 'texture-grain':
                    // Texture overlay
                    layers.push(`repeating-linear-gradient(0deg, ${element.color}, ${element.color} 1px, transparent 1px, transparent 3px)`);
                    break;
            }
        });
        
        return layers.join(', ');
    }
    
    // Apply particle configuration to particle system
    applyParticleConfiguration(theme) {
        if (!theme.particles || !theme.particles.enabled) {
            console.log('🎨 No particles configured for this theme');
            return;
        }
        
        // Integrate with existing particle system
        if (window.SmartParticleSystem) {
            try {
                window.SmartParticleSystem.applyThemeConfiguration(theme.particles);
                console.log('✨ Particle theme configuration applied');
            } catch (error) {
                console.warn('⚠️ Could not apply particle configuration:', error);
            }
        } else {
            console.warn('⚠️ SmartParticleSystem not available for theme integration');
        }
    }
    
    // Get current theme information
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // Check if a theme is available
    isThemeAvailable(modeId) {
        return this.availableThemes.has(modeId);
    }
    
    // Get theme health status
    getHealthStatus() {
        return {
            initialized: this.initialized,
            availableThemes: Array.from(this.availableThemes.keys()),
            currentTheme: this.currentTheme?.modeId || null,
            cssVariablesActive: this.cssVariables.size > 0
        };
    }
    
    // Get block colors for the current theme
    getBlockColors(blockType = 'normal', damageState = 'full') {
        if (!this.currentTheme || !this.currentTheme.blocks) {
            // Return default colors if no theme
            return {
                fill: '#667eea',
                border: '#764ba2',
                glow: 'rgba(102, 126, 234, 0.5)'
            };
        }
        
        const blockConfig = this.currentTheme.blocks[blockType];
        if (!blockConfig) {
            // Fallback to normal block if type not found
            return this.getBlockColors('normal', damageState);
        }
        
        // Return base color if no damage states defined
        if (!blockConfig.damageStates) {
            return {
                fill: blockConfig.baseColor || '#667eea',
                border: blockConfig.borderColor || '#764ba2',
                glow: blockConfig.effects?.outerGlow || 'rgba(102, 126, 234, 0.5)'
            };
        }
        
        // Return colors for specific damage state
        const stateColors = blockConfig.damageStates[damageState] || blockConfig.damageStates.full;
        return {
            fill: stateColors.fill || blockConfig.baseColor,
            border: stateColors.border || blockConfig.borderColor,
            glow: stateColors.glow || blockConfig.effects?.outerGlow || 'rgba(0, 0, 0, 0.3)',
            pulse: stateColors.pulse || false,
            shadow: blockConfig.effects?.shadow,
            shadowBlur: blockConfig.effects?.shadowBlur
        };
    }
    
    // Apply block colors to game renderer
    applyBlockColors() {
        if (!this.currentTheme || !this.currentTheme.blocks) {
            console.log('⚠️ No block colors in current theme');
            return;
        }
        
        // Store theme block colors globally for game renderer access
        window.themeBlockColors = this.currentTheme.blocks;
        
        // Override the getBlockColor function if it exists
        if (window.getBlockColor) {
            const originalGetBlockColor = window.getBlockColor;
            window.getBlockColor = (blockType, health, maxHealth) => {
                // Calculate damage state
                const healthPercent = health / maxHealth;
                let damageState = 'full';
                if (healthPercent <= 0.3) {
                    damageState = 'critical';
                } else if (healthPercent <= 0.6) {
                    damageState = 'damaged';
                }
                
                // Get theme colors
                const colors = this.getBlockColors(blockType, damageState);
                return colors.fill;
            };
            console.log('✅ Block color function overridden with theme colors');
        }
        
        // Also set a global function for renderers to use
        window.getThemeBlockColors = (blockType, damageState) => {
            return this.getBlockColors(blockType, damageState);
        };
        
        console.log('🎨 Block colors applied from theme:', Object.keys(this.currentTheme.blocks));
    }
}

// Create global theme integration system
window.ThemeIntegrationSystem = new ThemeIntegrationSystem();

// MODE-FIRST ARCHITECTURE: DISABLE AUTO-INITIALIZATION OF THEMES
// document.addEventListener('DOMContentLoaded', () => {
//     window.ThemeIntegrationSystem.initialize();
// });

console.log('🔒 Theme system auto-initialization disabled - will initialize after mode selection');

// Expose for debugging
window.THEME_INTEGRATION = {
    system: window.ThemeIntegrationSystem,
    applyTheme: (modeId) => window.ThemeIntegrationSystem.applyTheme(modeId),
    getStatus: () => window.ThemeIntegrationSystem.getHealthStatus()
};

console.log('🎨 Theme Integration System loaded');