/**
 * 🔒 PROTECTED FILE - MANDATORY PERMISSION REQUIRED 🔒
 * 
 * Original Mode Theme Configuration
 * This file defines all visual and audio theme properties for Original Mode
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

// ⚠️⚠️⚠️ CRITICAL: Original Mode Theme Definition ⚠️⚠️⚠️
window.PROTECTED_ORIGINAL_THEME = {
    // === MODE IDENTIFICATION ===
    mode: {
        id: 'original',
        displayName: 'Original Mode',
        description: 'Classic ball defender with retro arcade aesthetics',
        version: '1.0.0'
    },

    // === VISUAL THEME PROPERTIES ===
    colors: {
        // Primary theme color (used for borders, accents)
        primary: '#00ff00',           // Bright green - classic arcade
        primaryRgba: 'rgba(0, 255, 0', // For opacity variations
        
        // Accent color system
        accent: '#8B4513',            // Brown - earth tone accent
        accentRgba: 'rgba(139, 69, 19', // Brown with opacity variations
        
        // Supporting earth tone palette
        forestGreen: '#228B22',       // Forest green for backgrounds
        darkOlive: '#556B2F',         // Dark olive for subtle details
        lightGreen: '#88ff88',        // Light green for highlights
        darkBrown: '#654321',         // Darker brown for depth
        
        // Background colors
        gameFieldBackground: 'pattern',      // Will use organic forest pattern
        canvasBackground: '#000000',         // Canvas stays black
        
        // UI element colors
        textPrimary: '#00ff00',             // Main text color
        textSecondary: '#88ff88',           // Secondary text
        textHighlight: '#ffffff',           // Highlighted text
        textAccent: '#8B4513',              // Brown text for variety
    },

    // === CANVAS FRAME STYLING ===
    canvas: {
        borderColor: '#00ff00',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderRadius: '8px',
        
        // Box shadow effects
        glowColor: 'rgba(0, 255, 0, 0.5)',
        glowSize: '20px',
        insetGlow: 'rgba(0, 255, 0, 0.1)',
        insetGlowSize: '20px',
        
        // Additional effects
        animation: null,                    // No special animations for original
        filter: null                        // No special filters
    },

    // === BACKGROUND STYLING ===
    background: {
        gameField: {
            type: 'organic-forest',         // Organic forest/nature pattern
            baseColor: '#0d1a0d',          // Very dark forest green base
            
            // Pattern definition
            pattern: {
                type: 'organic-forest',
                elements: [
                    {
                        type: 'tree-silhouettes',
                        color: '#228B22',      // Forest green
                        opacity: 0.15,
                        density: 'sparse',
                        position: 'background'
                    },
                    {
                        type: 'leaf-clusters', 
                        color: '#8B4513',      // Brown accent
                        opacity: 0.1,
                        density: 'medium',
                        position: 'midground'
                    },
                    {
                        type: 'organic-shapes',
                        color: '#556B2F',      // Dark olive
                        opacity: 0.08,
                        density: 'light',
                        position: 'foreground'
                    },
                    {
                        type: 'texture-grain',
                        color: '#654321',      // Dark brown
                        opacity: 0.05,
                        density: 'subtle',
                        position: 'overlay'
                    }
                ]
            },
            
            animation: {
                enabled: true,
                type: 'gentle-sway',        // Subtle movement like wind
                speed: 'slow',
                intensity: 0.3
            },
            
            opacity: 1.0
        }
    },

    // === SIDEBAR UI STYLING ===
    ui: {
        panels: {
            borderColor: '#00ff00',
            borderWidth: '2px',
            backgroundColor: '#000000',
            glowColor: 'rgba(0, 255, 0, 0.4)',
            glowSize: '15px',
            insetGlow: 'rgba(0, 255, 0, 0.1)',
            
            // Brown accent usage for subtle panel details
            accents: {
                enabled: true,
                color: '#8B4513',           // Brown accent color
                style: 'corner-highlights', // Subtle corner accents
                opacity: 0.6,               // Subtle, not overwhelming
                elements: [
                    {
                        type: 'corner-dots',    // Small brown dots at corners
                        size: '3px',
                        position: ['top-right', 'bottom-left']
                    },
                    {
                        type: 'inner-trim',     // Thin inner brown line
                        width: '1px', 
                        position: 'top',
                        length: '30%'           // Only 30% of the top edge
                    }
                ]
            }
        },
        
        buttons: {
            backgroundColor: 'rgba(0, 255, 0, 0.25)',
            borderColor: '#00ff00',
            textColor: '#ffffff',
            hoverGlow: 'rgba(0, 255, 0, 0.4)',
            accentColor: '#8B4513'          // Brown accents on buttons
        },
        
        leaderboard: {
            borderColor: '#00ff00',
            borderWidth: '3px',
            headerBorderColor: '#00ff00',
            glowColor: 'rgba(0, 255, 0, 0.5)',
            
            // Brown accent usage for leaderboard
            accentBorders: {
                enabled: true,
                color: '#8B4513',           // Brown accent borders
                positions: ['second', 'third'], // 2nd and 3rd place get brown highlights
                style: 'left-border'        // Brown left border accent
            },
            
            scoreColors: {
                first: '#ffff00',           // Gold for first place
                second: '#8B4513',          // Brown for second place
                third: '#654321',           // Dark brown for third place  
                default: '#00ff00'          // Green for others
            },
            
            entryAccents: {
                secondPlace: {
                    leftBorder: '#8B4513',
                    width: '4px'
                },
                thirdPlace: {
                    leftBorder: '#654321', 
                    width: '3px'
                }
            }
        }
    },

    // === MUSIC AND AUDIO SETTINGS ===
    audio: {
        // Original mode uses existing soundtrack system
        mode: 'existing-soundtrack',       // Use current audio system
        useCustomMusic: false,             // Don't override existing music
        
        // Keep existing soundtrack intact
        soundtrack: {
            type: 'existing',              // Use the current soundtrack
            override: false,               // Don't replace
            modify: false                  // Don't alter existing music
        },
        
        // Audio effects - keep minimal for original authenticity
        effects: {
            reverb: 0.0,                   // No reverb - keep clean
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
        
        // Mode-specific audio enhancements (when other modes are active)
        enhancements: {
            originalMode: {
                enabled: false,            // No enhancements for original
                type: 'none'               // Keep pure original sound
            }
        }
    },

    // === BLOCK COLOR CONFIGURATION ===
    blocks: {
        // Normal blocks - bright green tones with Ball Go Boom style gradients
        normal: {
            // Base colors using Ball Go Boom gradient structure
            baseColor: '#4CAF50',            // Medium Green base (like Ball Go Boom's base)
            glowColor: '#81C784',            // Light Green glow (like Ball Go Boom's glow)
            shadowColor: '#388E3C',          // Medium Green shadow (lighter, not dark)
            borderColor: '#2E7D32',          // Darker green border
            borderWidth: 2,
            
            // Damage states with gradient structure matching Ball Go Boom
            damageStates: {
                full: {
                    fill: '#4CAF50',          // Medium Green base
                    glow: '#81C784',          // Light Green glow
                    shadow: '#388E3C',        // Medium Green shadow (lighter)
                    border: '#2E7D32',        // Darker green border
                    glowAlpha: 0.6            // Strong glow like Ball Go Boom
                },
                damaged: {
                    fill: '#66BB6A',          // Lighter Green when damaged
                    glow: '#A5D6A7',          // Very light Green glow
                    shadow: '#4CAF50',        // Light-medium Green shadow
                    border: '#388E3C',        // Medium border when damaged
                    glowAlpha: 0.7            // Increased glow when damaged
                },
                critical: {
                    fill: '#81C784',          // Light Green when critical
                    glow: '#C8E6C9',          // Very pale Green glow
                    shadow: '#66BB6A',        // Light Green shadow (already light)
                    border: '#4CAF50',        // Medium green border
                    glowAlpha: 0.8,           // Maximum glow when critical
                    pulse: true               // Pulse effect when critical
                }
            },
            
            // Visual effects matching Ball Go Boom intensity
            effects: {
                shadow: '#388E3C',            // Medium Green shadow (lighter)
                shadowBlur: 6,                // Increased blur like Ball Go Boom
                innerGlow: '#81C784',         // Light Green inner glow
                outerGlow: '#A5D6A7',         // Very light Green outer glow
                glowIntensity: 0.6            // Match Ball Go Boom glow intensity
            }
        },
        
        // HP-based block colors - gradient from light green (HP1) to dark green (HP5)
        
        // HP 1 blocks - bright green gradient with translucency (Ball Go Boom style)
        hp1: {
            baseColor: 'rgba(0, 255, 0, 0.8)',       // Bright green base with 80% opacity
            glowColor: 'rgba(136, 255, 136, 0.9)',   // Light bright green glow with 90% opacity
            shadowColor: 'rgba(0, 204, 0, 0.7)',     // Vibrant green shadow with 70% opacity
            borderColor: 'rgba(0, 170, 0, 0.9)',     // Medium green border with 90% opacity
            borderWidth: 2,
            
            damageStates: {
                full: {
                    fill: 'rgba(0, 255, 0, 0.8)',    // Bright green with translucency
                    glow: 'rgba(136, 255, 136, 0.9)', // Light bright green glow
                    shadow: 'rgba(0, 204, 0, 0.7)',   // Translucent vibrant green shadow
                    border: 'rgba(0, 170, 0, 0.9)',   // Medium green border
                    glowAlpha: 0.7                     // Increased glow alpha
                }
            },
            
            effects: {
                shadow: 'rgba(0, 204, 0, 0.7)',      // Translucent vibrant green shadow
                shadowBlur: 4,
                innerGlow: 'rgba(136, 255, 136, 0.8)',
                outerGlow: 'rgba(170, 255, 170, 0.6)',
                glowIntensity: 0.6                    // Increased glow intensity
            }
        },
        
        // HP 2 blocks - bright green gradient with translucency (Ball Go Boom style)  
        hp2: {
            baseColor: 'rgba(0, 238, 0, 0.8)',       // Bright green base with 80% opacity
            glowColor: 'rgba(119, 255, 119, 0.9)',   // Light green glow with 90% opacity
            shadowColor: 'rgba(0, 187, 0, 0.7)',     // Vibrant green shadow with 70% opacity
            borderColor: 'rgba(0, 153, 0, 0.9)',     // Medium green border with 90% opacity
            borderWidth: 2,
            
            damageStates: {
                full: {
                    fill: 'rgba(0, 238, 0, 0.8)',    // Bright green with translucency
                    glow: 'rgba(119, 255, 119, 0.9)', // Light green glow
                    shadow: 'rgba(0, 187, 0, 0.7)',   // Translucent vibrant green shadow
                    border: 'rgba(0, 153, 0, 0.9)',   // Medium green border
                    glowAlpha: 0.7                     // Increased glow alpha
                },
                damaged: {
                    fill: 'rgba(0, 238, 0, 0.8)',
                    glow: 'rgba(136, 255, 136, 0.9)',
                    shadow: 'rgba(0, 204, 0, 0.7)',
                    border: 'rgba(0, 170, 0, 0.9)',
                    glowAlpha: 0.75
                }
            },
            
            effects: {
                shadow: 'rgba(0, 187, 0, 0.7)',      // Translucent shadow
                shadowBlur: 5,
                innerGlow: 'rgba(119, 255, 119, 0.8)',
                outerGlow: 'rgba(153, 255, 153, 0.6)',
                glowIntensity: 0.6                    // Increased glow intensity
            }
        },
        
        // HP 3 blocks - bright green gradient with translucency (Ball Go Boom style)
        hp3: {
            baseColor: 'rgba(0, 221, 0, 0.8)',       // Bright green base with 80% opacity
            glowColor: 'rgba(102, 255, 102, 0.9)',   // Light green glow with 90% opacity
            shadowColor: 'rgba(0, 170, 0, 0.7)',     // Vibrant green shadow with 70% opacity
            borderColor: 'rgba(0, 136, 0, 0.9)',     // Medium green border with 90% opacity
            borderWidth: 2,
            
            damageStates: {
                full: {
                    fill: 'rgba(0, 221, 0, 0.8)',    // Bright green with translucency
                    glow: 'rgba(102, 255, 102, 0.9)', // Light green glow
                    shadow: 'rgba(0, 170, 0, 0.7)',   // Translucent vibrant green shadow
                    border: 'rgba(0, 136, 0, 0.9)',   // Medium green border
                    glowAlpha: 0.75                    // Increased glow alpha
                },
                damaged: {
                    fill: 'rgba(0, 221, 0, 0.8)',
                    glow: 'rgba(119, 255, 119, 0.9)',
                    shadow: 'rgba(0, 187, 0, 0.7)',
                    border: 'rgba(0, 153, 0, 0.9)',
                    glowAlpha: 0.8
                },
                critical: {
                    fill: 'rgba(0, 221, 0, 0.8)',
                    glow: 'rgba(136, 255, 136, 0.9)',
                    shadow: 'rgba(0, 204, 0, 0.7)',
                    border: 'rgba(0, 170, 0, 0.9)',
                    glowAlpha: 0.85
                }
            },
            
            effects: {
                shadow: 'rgba(0, 170, 0, 0.7)',      // Translucent shadow
                shadowBlur: 6,
                innerGlow: 'rgba(102, 255, 102, 0.8)',
                outerGlow: 'rgba(136, 255, 136, 0.6)',
                glowIntensity: 0.65                   // Increased glow intensity
            }
        },
        
        // HP 4 blocks - bright green gradient with translucency (Ball Go Boom style)
        hp4: {
            baseColor: 'rgba(0, 204, 0, 0.8)',       // Bright green base with 80% opacity
            glowColor: 'rgba(85, 255, 85, 0.9)',     // Light green glow with 90% opacity
            shadowColor: 'rgba(0, 153, 0, 0.7)',     // Vibrant green shadow with 70% opacity
            borderColor: 'rgba(0, 119, 0, 0.9)',     // Medium green border with 90% opacity
            borderWidth: 3,
            
            damageStates: {
                full: {
                    fill: 'rgba(0, 204, 0, 0.8)',    // Bright green with translucency
                    glow: 'rgba(85, 255, 85, 0.9)',  // Light green glow
                    shadow: 'rgba(0, 153, 0, 0.7)',  // Translucent vibrant green shadow
                    border: 'rgba(0, 119, 0, 0.9)',  // Medium green border
                    glowAlpha: 0.8                    // Increased glow alpha
                },
                damaged: {
                    fill: 'rgba(0, 204, 0, 0.8)',
                    glow: 'rgba(102, 255, 102, 0.9)',
                    shadow: 'rgba(0, 170, 0, 0.7)',
                    border: 'rgba(0, 136, 0, 0.9)',
                    glowAlpha: 0.85
                },
                critical: {
                    fill: 'rgba(0, 204, 0, 0.8)',
                    glow: 'rgba(119, 255, 119, 0.9)',
                    shadow: 'rgba(0, 187, 0, 0.7)',
                    border: 'rgba(0, 153, 0, 0.9)',
                    glowAlpha: 0.9,
                    pulse: true
                }
            },
            
            effects: {
                shadow: 'rgba(0, 153, 0, 0.7)',      // Translucent shadow
                shadowBlur: 7,
                innerGlow: 'rgba(85, 255, 85, 0.8)',
                outerGlow: 'rgba(119, 255, 119, 0.6)',
                glowIntensity: 0.7                    // Increased glow intensity
            }
        },
        
        // HP 5 blocks - bright green gradient with translucency (Ball Go Boom style, strongest blocks)
        hp5: {
            baseColor: 'rgba(0, 187, 0, 0.8)',       // Bright green base with 80% opacity
            glowColor: 'rgba(68, 255, 68, 0.9)',     // Light green glow with 90% opacity
            shadowColor: 'rgba(0, 136, 0, 0.7)',     // Vibrant green shadow with 70% opacity
            borderColor: 'rgba(0, 102, 0, 0.9)',     // Medium green border with 90% opacity
            borderWidth: 3,
            
            damageStates: {
                full: {
                    fill: 'rgba(0, 187, 0, 0.8)',    // Bright green with translucency
                    glow: 'rgba(68, 255, 68, 0.9)',  // Light green glow
                    shadow: 'rgba(0, 136, 0, 0.7)',  // Translucent vibrant green shadow
                    border: 'rgba(0, 102, 0, 0.9)',  // Medium green border
                    glowAlpha: 0.85                   // Increased glow alpha
                },
                damaged: {
                    fill: 'rgba(0, 187, 0, 0.8)',
                    glow: 'rgba(85, 255, 85, 0.9)',
                    shadow: 'rgba(0, 153, 0, 0.7)',
                    border: 'rgba(0, 119, 0, 0.9)',
                    glowAlpha: 0.9
                },
                critical: {
                    fill: 'rgba(0, 187, 0, 0.8)',
                    glow: 'rgba(102, 255, 102, 0.9)',
                    shadow: 'rgba(0, 170, 0, 0.7)',
                    border: 'rgba(0, 136, 0, 0.9)',
                    glowAlpha: 0.95,
                    pulse: true
                }
            },
            
            effects: {
                shadow: 'rgba(0, 136, 0, 0.7)',      // Translucent shadow
                shadowBlur: 8,
                innerGlow: 'rgba(68, 255, 68, 0.8)',
                outerGlow: 'rgba(102, 255, 102, 0.6)',
                glowIntensity: 0.75,                  // Increased glow intensity
                pattern: 'thick-wood'
            }
        },
        
        // Strong blocks - earth/wood tones
        strong: {
            baseColor: '#5d4037',             // Coffee Brown base
            borderColor: '#3e2723',          // Dark Walnut border
            borderWidth: 3,
            
            damageStates: {
                full: {
                    fill: '#5d4037',          // Coffee Brown
                    border: '#3e2723',
                    glow: 'rgba(93, 64, 55, 0.3)'
                },
                damaged: {
                    fill: '#795548',          // Medium Brown
                    border: '#5d4037',
                    glow: 'rgba(121, 85, 72, 0.4)'
                },
                critical: {
                    fill: '#a1887f',          // Light Clay
                    border: '#795548',
                    glow: 'rgba(161, 136, 127, 0.5)',
                    pulse: true
                }
            },
            
            effects: {
                shadow: 'rgba(0, 0, 0, 0.4)',
                shadowBlur: 6,
                innerGlow: 'rgba(93, 64, 55, 0.25)',
                pattern: 'wood-grain'         // Wood grain texture
            }
        },
        
        // Exploder blocks - bright magenta (matching Ball Go Boom mode)
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
        
        // Freeze blocks - mint/pale stone combinations
        freeze: {
            baseColor: '#81c784',             // Mint Green base
            borderColor: '#4caf50',          // Deeper mint border
            borderWidth: 2,
            
            // Ice crystal effect
            animation: {
                type: 'shimmer',
                speed: 'slow',
                colors: ['#81c784', '#a5d6a7', '#c8e6c9'],
                crystallize: true
            },
            
            effects: {
                shadow: 'rgba(129, 199, 132, 0.3)',
                shadowBlur: 6,
                outerGlow: 'rgba(129, 199, 132, 0.5)',
                innerGlow: 'rgba(255, 255, 255, 0.3)',
                frost: {
                    enabled: true,
                    opacity: 0.4,
                    pattern: 'crystalline'
                }
            },
            
            // Freeze effect colors
            freezeEffect: {
                colors: ['#e0f2f1', '#b2dfdb', '#80cbc4'],
                duration: 3000,               // 3 second freeze
                spreadRadius: 100
            }
        },
        
        // Spawner blocks - honey gold tones
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
                newBlockColor: '#a8b545',    // Yellow-Green for spawned blocks
                particleCount: 12
            }
        },
        
        // Power-up blocks (if any)
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
            cornerRadius: 4,                  // Slight rounding on all blocks
            defaultShadow: true,
            defaultBorder: true,
            glowOnHover: true,
            damageFlash: {
                enabled: true,
                color: 'rgba(255, 255, 255, 0.6)',
                duration: 100                 // 100ms flash on hit
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
                    min: 6,                 // Minimum particles
                    max: 10,                // Maximum particles
                    default: 8              // Default count
                },
                blockDestruction: {
                    min: 10,
                    max: 16, 
                    default: 12
                },
                ballBounce: {
                    min: 4,
                    max: 8,
                    default: 6
                }
            }
        },
        
        // Particle appearance
        appearance: {
            // Particle shapes
            shapes: [
                {
                    type: 'circle',
                    weight: 0.7,            // 70% circles
                    sizeRange: { min: 2, max: 6 }
                },
                {
                    type: 'square', 
                    weight: 0.3,            // 30% squares
                    sizeRange: { min: 1, max: 4 }
                }
            ],
            
            // Color palette for particles
            colors: [
                {
                    color: '#00ff00',       // Bright green
                    weight: 0.5,            // 50% chance
                    variations: ['#88ff88', '#44ff44']
                },
                {
                    color: '#8B4513',       // Brown accent
                    weight: 0.3,            // 30% chance  
                    variations: ['#654321', '#A0522D']
                },
                {
                    color: '#228B22',       // Forest green
                    weight: 0.2,            // 20% chance
                    variations: ['#32CD32', '#006400']
                }
            ]
        },
        
        // Particle physics and behavior
        physics: {
            // Initial velocity when created
            velocity: {
                speed: { min: 50, max: 150 },      // Pixels per second
                direction: 'radial',               // Shoot outward from impact
                randomness: 0.3                    // 30% random variation
            },
            
            // Gravity and movement
            gravity: {
                enabled: true,
                strength: 200,                     // Pixels/second²
                direction: 'down'
            },
            
            // Air resistance
            friction: {
                enabled: true,
                coefficient: 0.98                  // Slight slowdown over time
            },
            
            // Bouncing off surfaces
            bounce: {
                enabled: false,                    // No bouncing for original mode
                damping: 0.7
            }
        },
        
        // Particle lifecycle
        lifecycle: {
            // How long particles last
            duration: {
                min: 1.0,                         // Minimum 1 second
                max: 2.5,                         // Maximum 2.5 seconds
                fadeStart: 0.6                    // Start fading at 60% of lifetime
            },
            
            // Fading behavior
            fade: {
                enabled: true,
                type: 'linear',                   // Linear fade out
                startAlpha: 1.0,
                endAlpha: 0.0
            }
        }
    },

    // === ANIMATION SETTINGS ===
    animations: {
        // Glow pulse for green elements
        glowPulse: {
            enabled: true,
            duration: '2s',
            intensity: 0.3
        },
        
        // No special mode animations
        modeSpecific: null
    }
};

// ⚠️⚠️⚠️ CRITICAL: Theme Application Functions ⚠️⚠️⚠️
window.PROTECTED_applyOriginalTheme = function() {
    console.log('🔒 PROTECTED: Applying Original Mode theme');
    
    const theme = window.PROTECTED_ORIGINAL_THEME;
    
    // Apply CSS custom properties for dynamic theming
    const root = document.documentElement;
    
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-glow', theme.colors.primaryRgba + ', 0.5)');
    root.style.setProperty('--theme-glow-light', theme.colors.primaryRgba + ', 0.3)');
    
    console.log('🔒 PROTECTED: Original theme CSS variables applied');
    
    return theme;
};

// ⚠️⚠️⚠️ CRITICAL: Theme Health Check ⚠️⚠️⚠️
window.PROTECTED_validateOriginalTheme = function() {
    console.log('🔒 PROTECTED: Validating Original theme structure');
    
    const theme = window.PROTECTED_ORIGINAL_THEME;
    const required = ['mode', 'colors', 'canvas', 'background', 'ui', 'audio'];
    
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
    
    if (!validation.valid) {
        console.error('🔒 PROTECTED ERROR: Original theme validation failed:', validation.errors);
    } else {
        console.log('🔒 PROTECTED: Original theme validation passed');
    }
    
    return validation;
};

// Auto-run validation when this file loads
console.log('🔒 PROTECTED-original-theme.js loaded');
setTimeout(() => {
    window.PROTECTED_validateOriginalTheme();
}, 500);

// Expose for debugging
window.PROTECTED_ORIGINAL_THEME_MANAGER = {
    version: '1.0.0',
    lastModified: 'August 2025',
    theme: window.PROTECTED_ORIGINAL_THEME,
    apply: window.PROTECTED_applyOriginalTheme,
    validate: window.PROTECTED_validateOriginalTheme
};