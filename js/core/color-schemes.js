// BALL DEFENDER - CLEAN COLOR SYSTEM
// Centralized color management - NO MORE OVERRIDE CHAOS!

const ColorSchemes = {
    // Original mode colors
    original: {
        blockByHP: {
            1: { base: '#4CAF50', glow: '#81C784', shadow: '#2E7D32' },  // Light Green
            2: { base: '#388E3C', glow: '#66BB6A', shadow: '#1B5E20' },  // Medium Green
            3: { base: '#2E7D32', glow: '#4CAF50', shadow: '#1B5E20' },  // Dark Green
            4: { base: '#F44336', glow: '#EF5350', shadow: '#D32F2F' },  // Red
            5: { base: '#9C27B0', glow: '#BA68C8', shadow: '#7B1FA2' },  // Purple
            6: { base: '#607D8B', glow: '#90A4AE', shadow: '#455A64' },  // Blue Grey
            7: { base: '#795548', glow: '#A1887F', shadow: '#5D4037' },  // Brown
            8: { base: '#E91E63', glow: '#F06292', shadow: '#C2185B' },  // Pink
            9: { base: '#009688', glow: '#4DB6AC', shadow: '#00796B' },  // Teal
            10: { base: '#3F51B5', glow: '#7986CB', shadow: '#303F9F' }, // Indigo
            default: { base: '#9E9E9E', glow: '#BDBDBD', shadow: '#616161' } // Grey
        },
        special: {
            spawner: { base: '#FFD700', glow: '#FFF59D', shadow: '#F9A825' }, // Gold
            exploder: { base: '#FF6F00', glow: '#FFB300', shadow: '#E65100' }  // Orange (not used - rainbow chaos handles this)
        }
    },
    
    // Ball Go Boom mode - VOLCANIC THEME
    ballGoBoom: {
        blockByHP: {
            1: { base: '#FF4500', glow: '#FF8C00', shadow: '#B22222' },  // Orange Red - Lava
            2: { base: '#FF6600', glow: '#FFA500', shadow: '#CC3300' },  // Bright Orange - Fire
            3: { base: '#FFD700', glow: '#FFFF00', shadow: '#FF8800' },  // Gold - Solar Flare
            4: { base: '#FF0000', glow: '#FF4444', shadow: '#990000' },  // Pure Red - Magma
            5: { base: '#DC143C', glow: '#FF1493', shadow: '#8B0000' },  // Crimson - Hot Coal
            6: { base: '#FF69B4', glow: '#FF00FF', shadow: '#CC0066' },  // Hot Pink - Plasma
            7: { base: '#8B0000', glow: '#FF4500', shadow: '#660000' },  // Dark Red - Ember
            8: { base: '#B22222', glow: '#FF6347', shadow: '#800000' },  // Fire Brick - Volcanic Rock
            9: { base: '#FF7F50', glow: '#FF6347', shadow: '#CD5C5C' },  // Coral - Molten Metal
            10: { base: '#FF8C00', glow: '#FFD700', shadow: '#FF6600' }, // Dark Orange - Liquid Fire
            default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' } // Indigo - Blue Flame
        },
        special: {
            spawner: { base: '#FFD700', glow: '#FFFFFF', shadow: '#FFA500' }, // Blazing Gold
            exploder: { base: '#FF0000', glow: '#FFFF00', shadow: '#990000' }  // Red-Hot (not used - rainbow chaos handles this)
        }
    },
    
    // Ice Frost mode - ICE THEME
    iceFrost: {
        blockByHP: {
            1: { base: '#4dd0e1', glow: '#80deea', shadow: '#00acc1' },  // Light Cyan
            2: { base: '#26c6da', glow: '#4dd0e1', shadow: '#0097a7' },  // Cyan
            3: { base: '#00bcd4', glow: '#26c6da', shadow: '#00838f' },  // Dark Cyan
            4: { base: '#00acc1', glow: '#00bcd4', shadow: '#006064' },  // Teal
            5: { base: '#0097a7', glow: '#00acc1', shadow: '#004d5c' },  // Dark Teal
            6: { base: '#00e5ff', glow: '#18ffff', shadow: '#00b8d4' },  // Bright Cyan
            7: { base: '#00b8d4', glow: '#00e5ff', shadow: '#0088a3' },  // Medium Cyan
            8: { base: '#0088a3', glow: '#00b8d4', shadow: '#005662' },  // Deep Cyan
            9: { base: '#40c4ff', glow: '#80d8ff', shadow: '#0091ea' },  // Light Blue
            10: { base: '#0091ea', glow: '#40c4ff', shadow: '#01579b' }, // Blue
            default: { base: '#263238', glow: '#455a64', shadow: '#37474f' } // Blue Grey
        },
        special: {
            spawner: { base: '#80deea', glow: '#b2ebf2', shadow: '#4dd0e1' }, // Icy Blue
            exploder: { base: '#18ffff', glow: '#84ffff', shadow: '#00e5ff' }, // Bright Ice
            freeze: { base: '#00e5ff', glow: '#b3e5fc', shadow: '#0277bd' }    // Freeze Block
        }
    }
};

// Game mode definitions
const GameModes = {
    ORIGINAL: {
        id: 'original',
        name: 'Original',
        description: 'Classic Ball Defender',
        colors: ColorSchemes.original,
        progression: [1, 6, 4, 5] // I-V-vi-IV progression
    },
    
    BALL_GO_BOOM: {
        id: 'ballGoBoom',
        name: 'Ball Go Boom',
        description: 'Volcanic chaos mode with explosive effects',
        colors: ColorSchemes.ballGoBoom,
        progression: [1, 6, 4, 5] // Same progression
    },
    
    ICE_FROST: {
        id: 'iceFrost',
        name: 'Ice Mode',
        description: 'Freezing cold mode with ice blocks and freeze effects',
        colors: ColorSchemes.iceFrost,
        progression: [6, 1, 4, 5] // vi-I-IV-V progression for icy feel
    }
};

// Color utility functions
const ColorUtils = {
    // Get color scheme for current mode
    getCurrentColorScheme() {
        const mode = window.gameCore?.getMode();
        if (!mode) {
            console.warn('⚠️ No mode set in GameCore, cannot get color scheme');
            return null;
        }
        return mode.colors;
    },
    
    // Get block color by HP for current mode
    getBlockColor(hp) {
        const scheme = this.getCurrentColorScheme();
        return scheme.blockByHP[hp] || scheme.blockByHP.default;
    },
    
    // Get special block color for current mode
    getSpecialColor(type) {
        const scheme = this.getCurrentColorScheme();
        return scheme.special[type] || scheme.special.spawner;
    },
    
    // Create particle color for destruction effects
    getParticleColor(block) {
        if (block.isSpecial) {
            if (block.specialType === 'exploder') {
                // Rainbow chaos system handles exploder particles
                return '#FF1744'; // Electric red default
            }
            return this.getSpecialColor(block.specialType).base;
        }
        
        return this.getBlockColor(block.hitPoints).base;
    },
    
    // Validate color object
    isValidColor(color) {
        return color && color.base && color.glow && color.shadow;
    }
};

// Mode management
const ModeManager = {
    currentMode: null,
    
    setMode(modeId) {
        const mode = this.getModeById(modeId);
        if (!mode) {
            throw new Error(`Unknown mode: ${modeId}`);
        }
        
        this.currentMode = mode;
        
        // Update global gameCore if it exists
        if (window.gameCore) {
            window.gameCore.setMode(mode);
        }
        
        console.log(`🎯 Mode set to: ${mode.name}`);
        return mode;
    },
    
    getModeById(id) {
        return Object.values(GameModes).find(mode => mode.id === id);
    },
    
    getCurrentMode() {
        return this.currentMode || window.gameCore?.getMode();
    },
    
    getAvailableModes() {
        return Object.values(GameModes);
    }
};

// Export for global access (transitional)
window.ColorSchemes = ColorSchemes;
window.GameModes = GameModes;
window.ColorUtils = ColorUtils;
window.ModeManager = ModeManager;

console.log('🎨 Color Schemes loaded - Centralized color management ready');
console.log('Available modes:', Object.keys(GameModes));