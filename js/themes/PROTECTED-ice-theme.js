/**
 * 🔒 PROTECTED FILE - MANDATORY PERMISSION REQUIRED 🔒
 * 
 * Ice Mode Theme Configuration
 * This file defines all visual and audio theme properties for Ice Mode
 * 
 * ENFORCEMENT RULES:
 * 1. AI assistants MUST ask permission before ANY edit
 * 2. Permission must be granted for EACH modification
 * 3. User must explicitly approve with "YES"
 * 4. No blanket permissions allowed
 * 5. Even typos and comments require permission
 * 
 * THEME PROPERTIES:
 * - Mode identification and metadata
 * - Canvas frame colors and effects
 * - Background colors and patterns
 * - Music settings and chord progressions
 * - UI element colors (borders, glows, shadows)
 * - Particle and animation effects
 * 
 * Last verified working: August 2025
 */

// ⚠️⚠️⚠️ CRITICAL: Ice Mode Theme Definition ⚠️⚠️⚠️
window.PROTECTED_ICE_THEME = {
    // === MODE IDENTIFICATION ===
    mode: {
        id: 'iceFrost',
        displayName: 'Ice Mode',
        description: 'Frozen crystalline mode with ice blocks and freeze effects',
        version: '1.0.0'
    },

    // === VISUAL THEME PROPERTIES ===
    colors: {
        // Primary theme color (ice blue/cyan)
        primary: '#00e5ff',           // Bright ice blue
        primaryRgba: 'rgba(0, 229, 255', // For opacity variations
        
        // Accent color system
        accent: '#80deea',            // Light ice blue accent
        accentRgba: 'rgba(128, 222, 234', // Light blue with opacity variations
        
        // Supporting ice tone palette
        iceCyan: '#4dd0e1',           // Medium ice cyan
        deepIce: '#00bcd4',           // Deep ice blue
        lightIce: '#b3e5fc',          // Very light ice
        darkIce: '#006064',           // Dark ice for depth
        
        // Background colors
        gameFieldBackground: 'pattern',      // Will use ice crystal pattern
        canvasBackground: '#000a1a',         // Very dark blue canvas
        
        // UI element colors
        textPrimary: '#00e5ff',             // Main text color
        textSecondary: '#80deea',           // Secondary text
        textHighlight: '#ffffff',           // Highlighted text
        textAccent: '#b3e5fc',              // Light blue text for variety
    },

    // === CANVAS FRAME STYLING ===
    canvas: {
        borderColor: '#00e5ff',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderRadius: '8px',
        
        // Box shadow effects
        glowColor: 'rgba(0, 229, 255, 0.6)',
        glowSize: '25px',
        insetGlow: 'rgba(0, 229, 255, 0.2)',
        insetGlowSize: '15px',
        
        // Additional ice effects
        animation: 'subtle-shimmer',        // Gentle ice shimmer
        filter: 'brightness(1.1)'          // Slight brightness boost
    },

    // === BACKGROUND STYLING ===
    background: {
        gameField: {
            type: 'crystal-formations',     // Geometric ice crystal shapes
            baseColor: '#001a33',           // Very dark ice blue base
            
            // Pattern definition - Crystal formations (geometric ice crystal shapes)
            pattern: {
                type: 'crystal-formations',
                elements: [
                    {
                        type: 'geometric-crystals',
                        color: '#004d5c',       // Dark ice crystals
                        opacity: 0.25,
                        density: 'medium',
                        position: 'background',
                        shapes: ['hexagon', 'diamond', 'triangle']
                    },
                    {
                        type: 'crystal-clusters', 
                        color: '#00bcd4',       // Medium ice blue clusters
                        opacity: 0.2,
                        density: 'sparse',
                        position: 'midground',
                        formation: 'scattered'
                    },
                    {
                        type: 'ice-prisms',
                        color: '#80deea',       // Light ice prisms
                        opacity: 0.15,
                        density: 'minimal',
                        position: 'foreground',
                        orientation: 'random'
                    },
                    {
                        type: 'crystal-grid',
                        color: '#b3e5fc',       // Very light ice grid
                        opacity: 0.08,
                        density: 'subtle',
                        position: 'overlay',
                        pattern: 'hexagonal-grid'
                    }
                ]
            },
            
            animation: {
                enabled: true,
                type: 'crystal-shimmer',    // Subtle crystal formation shimmer
                speed: 'very-slow',
                intensity: 0.15             // Reduced for subtle effect
            },
            
            opacity: 1.0
        }
    },

    // === SIDEBAR UI STYLING ===
    ui: {
        panels: {
            borderColor: '#00e5ff',
            borderWidth: '2px',
            backgroundColor: '#000a1a',
            glowColor: 'rgba(0, 229, 255, 0.5)',
            glowSize: '18px',
            insetGlow: 'rgba(0, 229, 255, 0.15)',
            
            // Ice accent usage for subtle panel details
            accents: {
                enabled: true,
                color: '#80deea',           // Light ice accent
                style: 'frost-highlights', // Ice-themed accents
                opacity: 0.7,               // Subtle but visible
                elements: [
                    {
                        type: 'ice-crystals',   // Small ice crystals at corners
                        size: '4px',
                        position: ['top-left', 'bottom-right']
                    },
                    {
                        type: 'frost-trim',     // Thin frost line
                        width: '1px', 
                        position: 'bottom',
                        length: '40%'           // 40% of the bottom edge
                    }
                ]
            }
        },
        
        buttons: {
            backgroundColor: 'rgba(0, 229, 255, 0.2)',
            borderColor: '#00e5ff',
            textColor: '#ffffff',
            hoverGlow: 'rgba(0, 229, 255, 0.6)',
            accentColor: '#80deea'          // Light ice accents on buttons
        },
        
        leaderboard: {
            borderColor: '#00e5ff',
            borderWidth: '3px',
            headerBorderColor: '#00e5ff',
            glowColor: 'rgba(0, 229, 255, 0.6)',
            
            // Ice accent usage for leaderboard
            accentBorders: {
                enabled: true,
                color: '#80deea',           // Light ice accent borders
                positions: ['second', 'third'], // 2nd and 3rd place get ice highlights
                style: 'left-border'        // Ice left border accent
            },
            
            scoreColors: {
                first: '#ffffff',           // Pure white for first place
                second: '#80deea',          // Light ice for second place
                third: '#4dd0e1',           // Medium ice for third place  
                default: '#00e5ff'          // Ice blue for others
            },
            
            entryAccents: {
                secondPlace: {
                    leftBorder: '#80deea',
                    width: '4px'
                },
                thirdPlace: {
                    leftBorder: '#4dd0e1', 
                    width: '3px'
                }
            }
        }
    },

    // === AUDIO SETTINGS ===
    audio: {
        // Ice mode uses existing soundtrack system
        mode: 'existing-soundtrack',       // Use current audio system
        useCustomMusic: false,             // Don't override existing music
        
        // Keep existing soundtrack intact
        soundtrack: {
            type: 'existing',              // Use the current soundtrack
            override: false,               // Don't replace
            modify: false                  // Don't alter existing music
        },
        
        // Audio effects - keep as-is for now (will customize later)
        effects: {
            reverb: 0.0,                   // No reverb - keep original
            delay: 0.0,                    // No delay - keep original
            distortion: 0.0,               // No distortion
            filter: 'none',                // No filtering
            eq: {
                bass: 1.0,                 // No bass adjustment
                mid: 1.0,                  // No mid adjustment  
                treble: 1.0                // No treble adjustment
            }
        },
        
        // Volume settings - use defaults from existing system
        volumes: {
            useExisting: true,             // Use current volume settings
            master: null,                  // Don't override
            music: null,                   // Don't override
            effects: null                  // Don't override
        },
        
        // Mode-specific audio enhancements (disabled for now)
        enhancements: {
            iceMode: {
                enabled: false,            // No enhancements yet
                type: 'none'               // Will add ice sounds later
            }
        }
    },

    // === BLOCK COLOR CONFIGURATION ===
    blocks: {
        // HP-based block colors - gradient from light ice (HP1) to dark ice (HP5)
        
        // HP 1 blocks - light ice blue gradient (brightest)
        hp1: {
            baseColor: '#80deea',             // Light ice blue base (like Original's medium green)
            glowColor: '#b3e5fc',            // Very light ice blue glow (brightest)
            shadowColor: '#4dd0e1',          // Medium ice blue shadow (darker)
            borderColor: '#00bcd4',          // Deep ice blue border
            borderWidth: 2,
            
            damageStates: {
                full: {
                    fill: '#80deea',          // Light ice blue
                    glow: '#b3e5fc',          // Very light ice blue glow
                    shadow: '#4dd0e1',        // Medium ice blue shadow
                    border: '#00bcd4',        // Deep ice blue border
                    glowAlpha: 0.6
                }
            },
            
            effects: {
                shadow: '#4dd0e1',            // Medium ice blue shadow
                shadowBlur: 4,
                innerGlow: '#b3e5fc',
                outerGlow: '#e1f5fe',
                glowIntensity: 0.5
            }
        },
        
        // HP 2 blocks - medium ice blue gradient  
        hp2: {
            baseColor: '#4dd0e1',             // Medium ice blue base
            glowColor: '#80deea',            // Light ice blue glow  
            shadowColor: '#00bcd4',          // Deep ice blue shadow
            borderColor: '#0097a7',          // Darker ice blue border
            borderWidth: 2,
            
            damageStates: {
                full: {
                    fill: '#4dd0e1',          // Medium ice blue
                    glow: '#80deea',          // Light ice blue glow
                    shadow: '#00bcd4',        // Deep ice blue shadow
                    border: '#0097a7',        // Darker ice blue border
                    glowAlpha: 0.65
                },
                damaged: {
                    fill: '#4dd0e1',
                    glow: '#b3e5fc',
                    shadow: '#29b6f6',
                    border: '#00bcd4',
                    glowAlpha: 0.7
                }
            },
            
            effects: {
                shadow: '#00bcd4',
                shadowBlur: 5,
                innerGlow: '#80deea',
                outerGlow: '#b3e5fc',
                glowIntensity: 0.55
            }
        },
        
        // HP 3 blocks - deep ice blue gradient
        hp3: {
            baseColor: '#00bcd4',             // Deep ice blue base
            glowColor: '#4dd0e1',            // Medium ice blue glow
            shadowColor: '#0097a7',          // Darker ice blue shadow
            borderColor: '#006064',          // Very dark ice blue border
            borderWidth: 2,
            
            damageStates: {
                full: {
                    fill: '#00bcd4',          // Deep ice blue
                    glow: '#4dd0e1',          // Medium ice blue glow
                    shadow: '#0097a7',        // Darker ice blue shadow
                    border: '#006064',        // Very dark ice blue border
                    glowAlpha: 0.7
                },
                damaged: {
                    fill: '#00bcd4',
                    glow: '#80deea',
                    shadow: '#4dd0e1',
                    border: '#0097a7',
                    glowAlpha: 0.75
                },
                critical: {
                    fill: '#ffffff',
                    glow: '#e1f5fe',
                    shadow: '#4fc3f7',
                    border: '#29b6f6',
                    glowAlpha: 0.8
                }
            },
            
            effects: {
                shadow: '#039be5',
                shadowBlur: 6,
                innerGlow: '#ffffff',
                outerGlow: '#81d4fa',
                glowIntensity: 0.6
            }
        },
        
        // HP 4 blocks - darker ice blue gradient
        hp4: {
            baseColor: '#0097a7',             // Darker ice blue base
            glowColor: '#00bcd4',            // Deep ice blue glow
            shadowColor: '#006064',          // Very dark ice blue shadow
            borderColor: '#004d40',          // Darkest ice blue border
            borderWidth: 3,
            
            damageStates: {
                full: {
                    fill: '#0097a7',          // Darker ice blue
                    glow: '#00bcd4',          // Deep ice blue glow
                    shadow: '#006064',        // Very dark ice blue shadow
                    border: '#004d40',        // Darkest ice blue border
                    glowAlpha: 0.75
                },
                damaged: {
                    fill: '#0097a7',
                    glow: '#4dd0e1',
                    shadow: '#00bcd4',
                    border: '#006064',
                    glowAlpha: 0.8
                },
                critical: {
                    fill: '#0097a7',
                    glow: '#80deea',
                    shadow: '#4dd0e1',
                    border: '#00bcd4',
                    glowAlpha: 0.85,
                    pulse: true
                }
            },
            
            effects: {
                shadow: '#006064',
                shadowBlur: 7,
                innerGlow: '#00bcd4',
                outerGlow: '#4dd0e1',
                glowIntensity: 0.65
            }
        },
        
        // HP 5 blocks - darkest ice blue gradient (strongest blocks)
        hp5: {
            baseColor: '#006064',             // Very dark ice blue base
            glowColor: '#0097a7',            // Darker ice blue glow
            shadowColor: '#004d40',          // Darkest ice blue shadow
            borderColor: '#002e2f',          // Nearly black ice border
            borderWidth: 3,
            
            damageStates: {
                full: {
                    fill: '#006064',          // Very dark ice blue
                    glow: '#0097a7',          // Darker ice blue glow
                    shadow: '#004d40',        // Darkest ice blue shadow
                    border: '#002e2f',        // Nearly black ice border
                    glowAlpha: 0.8
                },
                damaged: {
                    fill: '#006064',
                    glow: '#00bcd4',
                    shadow: '#0277bd',
                    border: '#01579b',
                    glowAlpha: 0.85
                },
                critical: {
                    fill: '#006064',
                    glow: '#4dd0e1',
                    shadow: '#0097a7',
                    border: '#006064',
                    glowAlpha: 0.9,
                    pulse: true
                }
            },
            
            effects: {
                shadow: '#004d40',
                shadowBlur: 8,
                innerGlow: '#0097a7',
                outerGlow: '#00bcd4',
                glowIntensity: 0.7,
                pattern: 'thick-ice'
            }
        },
        
        // Keep normal and strong for compatibility
        normal: {
            // Alias for HP 1 - using new ice gradient style
            baseColor: '#80deea',
            glowColor: '#b3e5fc',
            shadowColor: '#4dd0e1',
            borderColor: '#00bcd4',
            borderWidth: 2,
            damageStates: {
                full: {
                    fill: '#80deea',
                    glow: '#b3e5fc',
                    shadow: '#4dd0e1',
                    border: '#00bcd4',
                    glowAlpha: 0.6
                }
            },
            effects: {
                shadow: '#b3e5fc',
                shadowBlur: 4,
                innerGlow: '#ffffff',
                outerGlow: '#e1f5fe',
                glowIntensity: 0.5
            }
        },
        
        strong: {
            // Alias for HP 3 - using new ice gradient style
            baseColor: '#00bcd4',
            glowColor: '#4dd0e1',
            shadowColor: '#0097a7',
            borderColor: '#006064',
            borderWidth: 2,
            damageStates: {
                full: {
                    fill: '#00bcd4',
                    glow: '#4dd0e1',
                    shadow: '#0097a7',
                    border: '#006064',
                    glowAlpha: 0.7
                },
                damaged: {
                    fill: '#00bcd4',
                    glow: '#80deea',
                    shadow: '#4dd0e1',
                    border: '#0097a7',
                    glowAlpha: 0.75
                },
                critical: {
                    fill: '#00bcd4',
                    glow: '#b3e5fc',
                    shadow: '#80deea',
                    border: '#4dd0e1',
                    glowAlpha: 0.8
                }
            },
            effects: {
                shadow: '#039be5',
                shadowBlur: 6,
                innerGlow: '#ffffff',
                outerGlow: '#81d4fa',
                glowIntensity: 0.6
            }
        },
        
        // Exploder blocks - keep bright magenta (consistency across modes)
        exploder: {
            baseColor: '#ff00ff',             // Bright magenta base
            borderColor: '#cc00cc',           // Darker magenta border
            borderWidth: 2,
            
            // Damage states for exploder blocks
            damageStates: {
                full: {
                    fill: '#ff00ff',          // Bright magenta when healthy
                    border: '#cc00cc',
                    glow: 'rgba(255, 0, 255, 0.6)'
                },
                damaged: {
                    fill: '#ff80ff',          // Light magenta when damaged
                    border: '#ff00ff',
                    glow: 'rgba(255, 128, 255, 0.7)'
                },
                critical: {
                    fill: '#ffccff',          // Very light magenta when critical
                    border: '#ff80ff',
                    glow: 'rgba(255, 204, 255, 0.8)',
                    pulse: true               // Pulse effect when critical
                }
            },
            
            // Special pulsing effect for exploders
            animation: {
                type: 'pulse',
                speed: 'fast',
                colors: ['#ff00ff', '#ff80ff', '#ffccff'],
                glowIntensity: 0.8
            },
            
            effects: {
                shadow: 'rgba(255, 0, 255, 0.4)',
                shadowBlur: 8,
                outerGlow: 'rgba(255, 0, 255, 0.6)',
                innerGlow: 'rgba(255, 128, 255, 0.4)',
                particles: {
                    enabled: true,
                    color: '#ff00ff',         // Magenta particles
                    frequency: 'constant'
                }
            },
            
            // Explosion colors
            explosion: {
                colors: ['#ff00ff', '#ff80ff', '#ffccff'],  // Magenta explosion
                particleCount: 20,
                radius: 150
            }
        },
        
        // Freeze blocks - glowing ice (bright white center with blue outer glow)
        freeze: {
            baseColor: '#ffffff',             // Bright white center
            glowColor: '#00e5ff',            // Bright ice blue outer glow
            shadowColor: '#80deea',          // Light ice blue shadow
            borderColor: '#4dd0e1',          // Medium ice blue border
            borderWidth: 2,
            
            // Ice crystal effect (simplified - no complex animations)
            animation: {
                type: 'static-glow',          // Static glow instead of shimmer
                speed: 'none',
                colors: ['#ffffff', '#f0f8ff', '#e1f5fe'],
                crystallize: false            // No complex crystallization
            },
            
            effects: {
                shadow: '#80deea',            // Light ice blue shadow
                shadowBlur: 8,                // Fixed blur for performance
                outerGlow: '#00e5ff',         // Bright ice blue outer glow
                innerGlow: '#ffffff',         // Pure white inner glow
                frost: {
                    enabled: true,
                    opacity: 0.6,
                    pattern: 'simple-ice'     // Simplified ice pattern
                }
            },
            
            // Freeze effect colors
            freezeEffect: {
                colors: ['#ffffff', '#f0f8ff', '#00e5ff'],  // White to ice blue
                duration: 3000,               // 3 second freeze
                spreadRadius: 100
            }
        },
        
        // Spawner blocks - keep honey gold (consistency across modes)
        spawner: {
            baseColor: '#ffd54f',             // Honey Gold base
            borderColor: '#ffb300',          // Deeper gold border
            borderWidth: 3,
            
            // Spawning animation
            animation: {
                type: 'rotate-glow',
                speed: 'medium',
                colors: ['#ffd54f', '#ffecb3', '#fff9c4'],
                spawnPulse: true
            },
            
            effects: {
                shadow: 'rgba(255, 213, 79, 0.4)',
                shadowBlur: 10,
                outerGlow: 'rgba(255, 213, 79, 0.6)',
                innerGlow: 'rgba(255, 235, 59, 0.4)',
                sparkles: {
                    enabled: true,
                    color: '#fff9c4',
                    frequency: 'periodic'
                }
            },
            
            // Spawn effect
            spawnEffect: {
                colors: ['#ffd54f', '#ffe082', '#ffecb3'],
                newBlockColor: '#b3e5fc',    // Light ice blue for spawned blocks
                particleCount: 12
            }
        },
        
        // Power-up blocks - keep dark olive/moss green (consistency)
        powerup: {
            baseColor: '#4a5d23',             // Dark Olive base
            borderColor: '#8b9556',          // Moss Green border
            borderWidth: 2,
            
            animation: {
                type: 'shine',
                speed: 'slow',
                colors: ['#4a5d23', '#697e2e', '#8b9556']
            },
            
            effects: {
                shadow: 'rgba(74, 93, 35, 0.4)',
                shadowBlur: 6,
                outerGlow: 'rgba(139, 149, 86, 0.5)',
                shine: {
                    enabled: true,
                    frequency: 'periodic',
                    color: 'rgba(197, 216, 109, 0.6)'
                }
            }
        },
        
        // Global block settings
        global: {
            cornerRadius: 7,                  // More rounded for softer ice appearance
            defaultShadow: true,
            defaultBorder: true,
            glowOnHover: true,
            damageFlash: {
                enabled: true,
                color: '#80deea',             // Light blue flash for ice theme
                duration: 120                 // Slightly longer flash for ice effect
            }
        }
    },

    // === PARTICLE EFFECTS CONFIGURATION ===
    particles: {
        // Enable particle system for this mode
        enabled: true,
        
        // Particle generation settings
        generation: {
            // When particles are created
            triggers: {
                wallHit: true,              // Create particles on wall collision
                blockDestruction: true,     // Create particles on block destruction  
                ballBounce: true,          // Create particles on ball bounce
                powerupPickup: false       // No particles for powerup pickup
            },
            
            // How many particles to create
            counts: {
                wallHit: {
                    min: 4,                 // Fewer particles for performance
                    max: 8,                 // Maximum particles
                    default: 6              // Default count
                },
                blockDestruction: {
                    min: 6,
                    max: 12, 
                    default: 8
                },
                ballBounce: {
                    min: 3,
                    max: 6,
                    default: 4
                }
            }
        },
        
        // Particle appearance - WHITE TRIANGLES
        appearance: {
            // Particle shapes - ONLY TRIANGLES
            shapes: [
                {
                    type: 'triangle',
                    weight: 1.0,            // 100% triangles
                    sizeRange: { min: 3, max: 6 }
                }
            ],
            
            // Color palette for particles - WHITE ONLY
            colors: [
                {
                    color: '#ffffff',       // Pure white
                    weight: 0.7,            // 70% chance
                    variations: ['#ffffff', '#f8f8ff']
                },
                {
                    color: '#f0f8ff',       // Alice blue (very light)
                    weight: 0.2,            // 20% chance  
                    variations: ['#f0f8ff', '#ffffff']
                },
                {
                    color: '#ffffff',       // Pure white
                    weight: 0.1,            // 10% chance
                    variations: ['#ffffff', '#fafafa']
                }
            ]
        },
        
        // Particle physics and behavior
        physics: {
            // Initial velocity when created
            velocity: {
                speed: { min: 40, max: 100 },      // Faster ice shards
                direction: 'radial',               // Shoot outward from impact
                randomness: 0.4                    // More random variation for ice
            },
            
            // Gravity and movement
            gravity: {
                enabled: true,
                strength: 150,                     // Slightly faster fall
                direction: 'down'
            },
            
            // Air resistance
            friction: {
                enabled: true,
                coefficient: 0.97                  // Less friction (ice is slippery)
            },
            
            // Bouncing off surfaces
            bounce: {
                enabled: true,                     // Ice shards bounce
                damping: 0.4                       // Moderate bounce
            }
        },
        
        // Particle lifecycle
        lifecycle: {
            // How long particles last
            duration: {
                min: 1.2,                         // Minimum 1.2 seconds
                max: 2.8,                         // Maximum 2.8 seconds
                fadeStart: 0.7                    // Start fading at 70% of lifetime
            },
            
            // Fading behavior
            fade: {
                enabled: true,
                type: 'ease-out',                 // Smooth fade out
                startAlpha: 0.9,
                endAlpha: 0.0
            }
        }
    },

    // === ANIMATION SETTINGS ===
    animations: {
        // Ice shimmer for blue elements
        iceShimmer: {
            enabled: true,
            duration: '3s',
            intensity: 0.4
        },
        
        // Subtle ice crystal animations
        modeSpecific: {
            type: 'ice-crystals',
            frequency: 'slow',
            opacity: 0.3
        }
    }
};

// ⚠️⚠️⚠️ CRITICAL: Theme Application Functions ⚠️⚠️⚠️
window.PROTECTED_applyIceTheme = function() {
    console.log('🔒 PROTECTED: Applying Ice Mode theme');
    
    const theme = window.PROTECTED_ICE_THEME;
    
    // Apply CSS custom properties for dynamic theming
    const root = document.documentElement;
    
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-glow', theme.colors.primaryRgba + ', 0.6)');
    root.style.setProperty('--theme-glow-light', theme.colors.primaryRgba + ', 0.3)');
    
    console.log('🔒 PROTECTED: Ice theme CSS variables applied');
    
    return theme;
};

// ⚠️⚠️⚠️ CRITICAL: Theme Health Check ⚠️⚠️⚠️
window.PROTECTED_validateIceTheme = function() {
    console.log('🔒 PROTECTED: Validating Ice theme structure');
    
    const theme = window.PROTECTED_ICE_THEME;
    const required = ['mode', 'colors', 'canvas', 'background', 'ui', 'audio', 'particles', 'blocks'];
    
    const validation = {
        valid: true,
        errors: [],
        warnings: []
    };
    
    required.forEach(section => {
        if (!theme[section]) {
            validation.valid = false;
            validation.errors.push(`Missing required section: ${section}`);
        }
    });
    
    // Validate particle configuration specifically
    if (theme.particles && theme.particles.appearance && theme.particles.appearance.shapes) {
        const triangleShapes = theme.particles.appearance.shapes.filter(s => s.type === 'triangle');
        if (triangleShapes.length === 0) {
            validation.warnings.push('No triangle shapes found in particle configuration');
        }
    }
    
    // Validate blocks configuration specifically
    if (theme.blocks) {
        const requiredBlockTypes = ['normal', 'strong', 'exploder', 'freeze', 'spawner'];
        requiredBlockTypes.forEach(blockType => {
            if (!theme.blocks[blockType]) {
                validation.warnings.push(`Missing block type: ${blockType}`);
            } else if (!theme.blocks[blockType].damageStates) {
                validation.warnings.push(`Block type ${blockType} missing damageStates`);
            }
        });
        
        console.log('🔒 PROTECTED: Ice theme blocks validated:', Object.keys(theme.blocks));
    }
    
    if (!validation.valid) {
        console.error('🔒 PROTECTED ERROR: Ice theme validation failed:', validation.errors);
    } else {
        console.log('🔒 PROTECTED: Ice theme validation passed');
        if (validation.warnings.length > 0) {
            console.warn('🔒 PROTECTED WARNINGS:', validation.warnings);
        }
    }
    
    return validation;
};

// Auto-run validation when this file loads
console.log('🔒 PROTECTED-ice-theme.js loaded');
setTimeout(() => {
    window.PROTECTED_validateIceTheme();
}, 500);

// Expose for debugging
window.PROTECTED_ICE_THEME_MANAGER = {
    version: '1.0.0',
    lastModified: 'August 2025',
    theme: window.PROTECTED_ICE_THEME,
    apply: window.PROTECTED_applyIceTheme,
    validate: window.PROTECTED_validateIceTheme
};