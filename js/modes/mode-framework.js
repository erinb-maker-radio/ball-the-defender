/**
 * MODE FRAMEWORK - Ball Defender Game Mode System
 * 
 * ⚠️  DEPLOYMENT VERSION - This is the active framework
 * ===================================================
 * 
 * CRITICAL REQUIREMENTS FOR ALL NEW MODES:
 * =======================================
 * 
 * 1. LEADERBOARD REQUIREMENTS (MANDATORY):
 *    - Each mode MUST have a separate, independent leaderboard
 *    - Leaderboards start empty and record scores separately from other modes
 *    - Must communicate with GitHub Gist for remote score storage/retrieval
 *    - working-gist-writer.js automatically handles mode-specific score storage
 *    - Universal addScoreAndWrite() function supports all modes dynamically
 *    - Auto-initialization of empty Gist files for new modes
 *    - Required leaderboard config structure:
 *      leaderboard: {
 *          key: 'ballDefender_<modeId>_Leaderboard',
 *          gistFile: 'ball-defender-<modeId>-leaderboard.json'
 *      }
 * 
 * 2. COLOR SCHEME REQUIREMENTS (MANDATORY):
 *    - Must define complete colorScheme with background, blockByHP, and special colors
 *    - Regular blocks MUST have themed colors per mode (e.g., ice blocks for Ice Mode, not default green)
 *    - blockByHP defines colors for blocks with different hit points (1-5+ and default)
 *    - Colors automatically applied to all game elements when mode is activated
 *    - Required colorScheme structure:
 *      colorScheme: {
 *          background: { primary: '#color', secondary: '#color', accent: '#color' },
 *          blockByHP: { 1: {base: '#color', glow: '#color', shadow: '#color'}, 2: {...}, default: {...} },
 *          special: { spawner: {...}, exploder: {...}, freeze: {...} }
 *      }
 * 
 * 3. MECHANICS REQUIREMENTS:
 *    - Must define startingBalls, ballSpeed, and any specialFeatures
 *    - Special features are automatically registered and activated
 * 
 * 4. VISUAL STYLING & UI THEMING (MANDATORY):
 *    - Custom CSS is automatically injected when mode is activated
 *    - Use stylesheet.customCSS for mode-specific visual effects
 *    - MUST include themed UI elements: pause button, start button, any controls
 *    - Pattern: .mode-<modeId> #pauseBtn { themed styles go here }
 *    - Include mode-specific icons and animations for immersive experience
 * 
 * 5. SPECIAL BLOCK RENDERING (MANDATORY):
 *    - Special blocks MUST have custom renderers for proper visual effects
 *    - Add renderer to block-renderers.js (e.g., FreezeBlockRenderer)
 *    - Register in game-core.js rendererCache with freeze: new FreezeBlockRenderer()
 *    - Update getBlockRenderer() to handle new specialType
 *    - Special blocks automatically use themed colors and animations
 * 
 * 6. RADIUS-BASED EFFECTS:
 *    - Use RadiusEffectSystem for collision-based area effects
 *    - Proper collision point calculation prevents misaligned overlays
 *    - Support for grid, pixel, manhattan, euclidean distance calculations
 *    - Effect positioning uses canvas.getBoundingClientRect() for accuracy
 *    - Always append overlays to document.body, not canvas.parentElement
 * 
 * COMPLETE MODE STRUCTURE EXAMPLE:
 * {
 *   id: 'myMode',
 *   name: 'My Mode',
 *   colorScheme: { 
 *     background: { primary: '#color', secondary: '#color', accent: '#color' },
 *     blockByHP: { 1: {base: '#color', glow: '#color', shadow: '#color'}, 2: {...}, default: {...} },
 *     special: { spawner: {...}, exploder: {...}, freeze: {...} }
 *   },
 *   mechanics: { 
 *     startingBalls: 1, 
 *     ballSpeed: 1.0,
 *     specialFeatures: [{ id: 'myFeature', type: 'blockBehavior', onActivate: function() {...} }]
 *   },
 *   leaderboard: { 
 *     key: 'ballDefender_myMode_Leaderboard', 
 *     gistFile: 'ball-defender-mymode-leaderboard.json' 
 *   },
 *   stylesheet: { 
 *     customCSS: '.my-special-block { animation: pulse 2s infinite; }' 
 *   },
 *   musicProgression: [6, 1, 4, 5],
 *   audioConfig: { 
 *     progression: [6, 1, 4, 5], 
 *     key: 'A', 
 *     style: { tempo: 'slow', attack: 'soft' } 
 *   }
 * }
 * 
 * CRITICAL INTEGRATION STEPS:
 * 1. Create custom block renderer class extending BlockRenderer
 * 2. Add to game-core.js renderer cache
 * 3. Update getBlockRenderer() method
 * 4. Use RadiusEffectSystem for area effects
 * 5. Position overlays with canvas.getBoundingClientRect()
 * 6. Register mode with ModeFramework.registerMode(modeConfig)
 * 
 * LEADERBOARD INTEGRATION (AUTOMATIC):
 * - working-gist-writer.js handles all mode-specific leaderboard operations
 * - No additional code needed - scores automatically save to correct mode
 * - Gist files created automatically: ball-defender-<modeId>-leaderboard.json
 * - Universal functions work with all modes: loadFromGist(mode), writeToGist(scores, mode)
 * - Mode detection via window.currentGameMode?.id
 * 
 * ========================================================================
 * CRITICAL LESSONS LEARNED FROM ICE MODE DEVELOPMENT
 * ========================================================================
 * 
 * These lessons represent hard-won knowledge from building the first complete
 * mode with special blocks, freeze effects, and separate leaderboards.
 * 
 * 🎓 LESSON 1: EXTENSIBLE LEADERBOARD ARCHITECTURE
 * Problem: Ice Mode showed Original mode scores instead of its own
 * Cause: Hardcoded mode handling in leaderboard system
 * Fix: Dynamic mode detection with window.currentGameMode?.id
 * Rule: NEVER hardcode mode names - always use extensible patterns
 * 
 * 🎓 LESSON 2: SPECIAL BLOCK COLLISION TIMING
 * Problem: Freeze blocks bounced balls instead of triggering effects
 * Cause: Special effects inside if(hitPoints <= 0) - only on destruction
 * Fix: Check block.specialType BEFORE normal damage logic
 * Rule: Special blocks need immediate effect triggers on ANY hit
 * 
 * 🎓 LESSON 3: ARRAY ITERATION SAFETY
 * Problem: Game completely froze when ball hit freeze block
 * Cause: Using forEach() while calling splice() broke iteration
 * Fix: Use reverse for-loops when removing items during iteration
 * Rule: for (let i = array.length - 1; i >= 0; i--) for safe removal
 * 
 * 🎓 LESSON 4: BLOCK MOVEMENT STATE MANAGEMENT
 * Problem: Frozen blocks still moved during freeze countdown
 * Cause: Movement code didn't check block.frozen property
 * Fix: Add state checks to ALL movement logic (drift AND advancement)
 * Rule: All movement code must respect special states (!frozen, !destroyed)
 * 
 * 🎓 LESSON 5: VISUAL-LOGIC SYNCHRONIZATION
 * Problem: Ice overlays appeared in wrong positions
 * Cause: Canvas vs DOM positioning mismatch
 * Fix: Use canvas.getBoundingClientRect() and append to document.body
 * Rule: Visual effects must accurately track game object positions
 * 
 * 🎓 LESSON 6: ERROR ISOLATION & GRACEFUL DEGRADATION
 * Problem: Single error in freeze effect crashed entire game
 * Fix: Wrap risky operations in try-catch blocks
 * Rule: Protect main game loop from subsystem failures with error boundaries
 * 
 * 🎓 LESSON 7: RE-ENTRANCE PROTECTION
 * Problem: Rapid freeze hits could cause infinite loops
 * Fix: Added isFreezing flag to prevent recursive calls
 * Rule: State-changing operations need guards against re-entrance
 * 
 * 🎓 LESSON 8: RENDERER INTEGRATION PATTERNS
 * Problem: Custom renderers weren't integrated with color schemes
 * Fix: Centralized rendering architecture with base classes
 * Rule: All renderers must extend base classes and integrate with color system
 * 
 * 🎓 LESSON 9: MODE INITIALIZATION TIMING
 * Problem: Mode-specific blocks didn't appear until explicit mode selection
 * Cause: Game defaults to Original mode on startup
 * Rule: Document that users must actively select modes for mode-specific features
 * 
 * 🎓 LESSON 10: FRAMEWORK EXTENSIBILITY PATTERNS
 * Success: Universal addScoreAndWrite() works for all modes
 * Pattern: Dynamic mode detection with auto-initialization
 * Rule: Write code for modes that don't exist yet - use extensible patterns
 * 
 * 🎓 LESSON 11: DEBUGGING & OBSERVABILITY
 * Problem: Complex interaction bugs were hard to diagnose
 * Fix: Strategic console logging and error boundaries
 * Rule: Complex systems need built-in diagnostics for state transitions
 * 
 * 🎓 LESSON 12: COLLISION DETECTION ARCHITECTURE
 * Success: RadiusEffectSystem with multiple distance calculations
 * Pattern: Reusable collision systems for spatial effects
 * Rule: Build proper geometric foundations for future special blocks
 * 
 * 🎓 LESSON 13: COMPREHENSIVE PAUSE SYSTEM
 * Problem: Ball kept moving when game was paused, no themed UI
 * Cause: Ball physics not gated by gameState check
 * Fix: Wrap all physics in if(gameState === 'playing') checks
 * Rule: ALL game physics must respect pause state - balls, blocks, sounds
 * 
 * 🎓 LESSON 14: MODE-THEMED UI ELEMENTS
 * Need: Pause buttons and UI should match mode aesthetics
 * Pattern: Use mode-specific CSS classes (.mode-iceFrost #pauseBtn)
 * Elements: Pause button, start button, any mode-specific controls
 * Rule: UI theming creates immersive mode experience
 * 
 * 🎓 LESSON 15: MODE STATE PERSISTENCE & SYSTEM ARCHITECTURE
 * Problem: Mode selection reverts to Original during game state changes (pause, reset, etc.)
 * Cause: Multiple systems defaulting to 'original' instead of preserving selected mode
 * Critical Issue: Original mode was hardcoded as default fallback everywhere
 * Solution: Implement comprehensive mode state persistence system
 * Architecture Changes:
 *   - Remove ALL hardcoded 'original' defaults
 *   - Save selected mode to localStorage: localStorage.setItem('ballDefender_selectedMode', mode)
 *   - Restore mode on page load: localStorage.getItem('ballDefender_selectedMode')
 *   - Multiple fallback layers: window.currentGameMode?.id || window.selectedGameMode || localStorage
 *   - NO default mode in game initialization - require explicit user selection
 * Key Insight: Mode state is FOUNDATIONAL to the entire game system
 * Rule: NEVER assume Original mode - every system must respect user's mode choice
 * Pattern: Always provide mode persistence and restoration across page loads/game states
 * 
 * KEY DEVELOPMENT PRINCIPLES FROM LESSONS:
 * =======================================
 * 1. Design for extensibility from day one
 * 2. Never hardcode mode-specific logic
 * 3. Always protect against iteration bugs when modifying arrays
 * 4. Use comprehensive state management for special block behaviors
 * 5. Build error boundaries around complex subsystems
 * 6. Create reusable patterns that work for unknown future modes
 * 7. Include debugging and observability from the start
 * 8. Test edge cases like rapid successive special block hits
 * 9. Ensure visual effects stay synchronized with game logic
 * 10. Document gotchas and required initialization patterns
 * 11. ALL game physics must respect pause state (balls, blocks, sounds)
 * 12. Create mode-themed UI elements for immersive experience
 * 13. Implement comprehensive mode state persistence - mode selection is foundational
 * 14. Remove all hardcoded mode defaults - respect user's explicit choice always
 * 
 * 🎓 LESSON 16: FRAMEWORK SYNTAX ERRORS & MODE REGISTRATION FAILURES
 * Problem: Single syntax error in framework comments broke entire mode system
 * Cause: Nested /* */ comments inside block comments caused JavaScript parse errors
 * Impact: Ice Mode couldn't register, onActivate never called, no freeze functionality
 * Solution: Avoid nested comment structures, use escaped syntax or alternative text
 * Rule: Framework loading failures prevent ALL mode functionality - test syntax thoroughly
 * Pattern: Always validate framework loads before expecting mode registration to work
 * 
 * 🎓 LESSON 17: PERFORMANCE OPTIMIZATION FOR SPECIAL EFFECTS
 * Problem: Ice Mode freeze effects caused game to feel "chuggy" and unresponsive
 * Cause: Complex radius calculations and DOM manipulations happening every frame
 * Impact: Poor user experience, game stuttering, reduced playability
 * Solution: Throttle expensive operations, optimize distance calculations, reduce timer frequency
 * Rule: Special effects must not compromise core game performance
 * Pattern: Profile performance during development, optimize before adding more features
 * 
 * 🎓 LESSON 18: SAFE COLOR SCHEME APPLICATION
 * Problem: Mode launching crashed with "Cannot read properties of undefined (reading 'primary')"
 * Cause: applyColorScheme assumed all modes have mode.colors.bg.primary structure
 * Impact: Prevented Original and Ball Go Boom modes from launching entirely
 * Solution: Add safety checks before accessing nested properties, provide fallbacks
 * Rule: Never assume object property structure exists - always validate before access
 * Pattern: Use optional chaining or explicit checks: if (mode.colors?.bg?.primary)
 * 
 * 🎓 LESSON 19: LEADERBOARD INITIALIZATION TIMING
 * Problem: Leaderboards remained empty until START clicked, Original mode never populated
 * Cause: Leaderboard loading only happened during mode selection, not on menu creation
 * Impact: Poor user experience, missing data display, confusion about mode differences
 * Solution: Load all mode leaderboards immediately on main menu creation
 * Rule: Critical UI data should load proactively, not reactively to user actions
 * Pattern: Initialize all visible data during app startup, update reactively during gameplay
 * 
 * 🎓 LESSON 20: RADIUS TUNING & PLAYER FEEDBACK LOOPS
 * Problem: Freeze radius too large (7 blocks) when player wanted smaller area (5 blocks)
 * Cause: Grid-based distance then pixel-based distance calculations not well calibrated
 * Impact: Game balance issues, player dissatisfaction with special effect scope
 * Solution: Implement easy-to-adjust radius parameters, iterate based on player feedback
 * Rule: Special effect parameters should be easily tunable without code changes
 * Pattern: Use configurable constants, provide dev tools for real-time adjustment
 * 
 * CRITICAL DEVELOPMENT WORKFLOW LESSONS:
 * ====================================== 
 * 1. Test framework loading first - mode registration depends on clean framework syntax
 * 2. Add comprehensive error boundaries and safety checks for object property access
 * 3. Profile performance early when adding complex visual effects or calculations
 * 4. Initialize all UI data proactively on app startup for better user experience
 * 5. Make game balance parameters easily tunable for rapid iteration
 * 6. Use descriptive error messages and logging to accelerate debugging
 * 7. Test all mode launching paths, not just the one you're actively developing
 * 8. Consider performance impact of special effects from the design phase
 * 
 * 🎓 LESSON 21: UI THEMING & BUTTON CONSISTENCY ARCHITECTURE
 * Problem: Pause and Play Again buttons lacked themed styling and visual consistency
 * Cause: CSS theming was incomplete - only start button had partial styling, no mode-specific themes
 * Critical Issue: UI elements weren't part of mode theming system - broke immersion
 * Solution: Comprehensive themed button system with mode-specific styling
 * Architecture Changes:
 *   - Unified button base styles: #startBtn, #pauseBtn, #prestigeBtn
 *   - Mode-specific CSS classes automatically applied to <body>: .mode-original, .mode-ballGoBoom, .mode-iceFrost
 *   - Mode class application in main-menu.js: document.body.classList.add('mode-{modeId}')
 *   - CSS cascade pattern: .mode-{modeId} #buttonId { themed styles }
 *   - State-dependent styling: pauseBtn.classList.add('resume') for different icons/animations
 *   - Responsive design inclusion: all devices get themed buttons
 * Key Features Implemented:
 *   - Mode-specific color schemes, animations, and icons
 *   - Visual state feedback (pause ⏸️/resume ▶️, Ball Go Boom 🔥/💥, Ice Mode ❄️/🧊)
 *   - Consistent hover effects and transitions across all modes
 *   - Frame-rate independent animations (volcanic-pulse, crystal-glow, ice-sparkle)
 * Rule: ALL interactive UI elements must be themed per mode for immersive experience
 * Pattern: Use CSS class-based theming with body mode classes for scalable mode styling
 * 
 * 🎓 LESSON 22: AVOID UNNECESSARY UI DECORATIONS & ICON CLUTTER
 * Problem: Game controller icon (🎮) on start button added visual noise without functional value
 * Cause: Decorative elements were added without considering overall UI consistency
 * Critical Issue: Icons can detract from clean, professional appearance and accessibility
 * Solution: Remove decorative icons that don't serve functional purposes
 * Design Principles:
 *   - Prioritize clean, readable text over decorative emojis/icons
 *   - Use icons only when they enhance functionality or provide clear state information
 *   - Functional icons (pause ⏸️, resume ▶️) are appropriate - decorative ones (🎮) are not
 *   - Consistent button appearance across all modes without unnecessary visual elements
 * Rule: Every UI element should serve a functional purpose - avoid decoration for decoration's sake
 * Pattern: Clean typography and mode-specific styling over icon-heavy interfaces
 * 
 * 🎓 LESSON 23: MODE CLASS ARCHITECTURE & AUTOMATIC THEMING APPLICATION
 * Problem: Mode-specific styling required manual CSS class application to DOM elements
 * Cause: No systematic approach to applying mode themes - theming was disconnected from mode selection
 * Critical Issue: Manual theming is error-prone and doesn't scale across UI components
 * Solution: Automatic mode class application integrated with mode selection system
 * Architecture Pattern:
 *   - Mode selection automatically applies CSS classes to document.body
 *   - Clear existing mode classes before applying new ones: document.body.classList.remove(...)
 *   - Apply new mode class: document.body.classList.add('mode-{modeId}')
 *   - CSS cascade handles all theming: .mode-{modeId} .component { styles }
 *   - JavaScript state management: button.classList.add('resume') for dynamic states
 * Integration Points:
 *   - main-menu.js startGame() function applies mode classes
 *   - All UI components automatically inherit mode styling through CSS cascade
 *   - Dynamic state classes (resume, active, disabled) work within mode theming
 * Rule: Mode theming must be automatic and systematic - no manual style application
 * Pattern: Body class + CSS cascade for scalable, maintainable mode theming system
 * 
 * 🎓 LESSON 24: GLOBAL SYSTEM INTEGRATION PATTERNS
 * Context: Timer tracking system integration across all game modes
 * Problem: Cross-cutting concerns (like timers) need to work uniformly across modes
 * Solution: Design global systems as mode-agnostic services with consistent APIs
 * Key Patterns Established:
 *   - Global system initialization should be mode-independent
 *   - Use consistent start/stop/pause/resume lifecycle across all modes
 *   - Global systems should hook into existing game state changes (gameState transitions)
 *   - Store system-specific data separately from mode-specific data
 *   - Make global systems available via window.GlobalSystemName for universal access
 * 
 * 🎓 LESSON 25: GAME STATE INTEGRATION ARCHITECTURE  
 * Problem: Timer needed to integrate with game start/pause/resume/stop workflow
 * Discovery: Game state management is critical integration point for all systems
 * Solution: Hook into existing game state transitions rather than duplicating logic
 * Critical Integration Points:
 *   - game.js startGame() function - where games actually begin
 *   - game.js gameOver() function - where games actually end  
 *   - Pause button event listener - for pause/resume cycles
 *   - Game state variable (window.gameState) - the single source of truth
 * Rule: Global systems must integrate at game state transition points, not UI events
 * 
 * 🎓 LESSON 26: UI DISPLAY CONSISTENCY PATTERNS
 * Problem: Timer display needed to fit within existing sidebar layout constraints  
 * Issue: Initial design was too large and broke window layout
 * Solution: Iterative design refinement with user feedback integration
 * Design Process Discovered:
 *   1. Create functional core first (tracking works)
 *   2. Add basic UI display (shows data) 
 *   3. User feedback on layout/visual issues
 *   4. Iterate on design constraints (width matching, visual hierarchy)
 *   5. Add polish (animations, real-time updates, visual effects)
 * Rule: Always design within existing layout constraints, not as isolated components
 * 
 * 🎓 LESSON 27: REAL-TIME SYSTEM PERFORMANCE PATTERNS
 * Problem: Timer needed "live stopwatch" feel with smooth animation
 * Solution: Multi-tier update frequency system based on use case
 * Performance Architecture:
 *   - Display updates: 100ms (for smooth visual animation) 
 *   - Local saves: 10 seconds (for data safety)
 *   - Remote sync: 60 seconds (for bandwidth efficiency)
 *   - Different frequencies for different purposes prevents performance issues
 * Rule: Match update frequency to user expectations and system capabilities
 * 
 * 🎓 LESSON 28: EXTERNAL SERVICE INTEGRATION PATTERNS
 * Context: Timer needed to sync with GitHub Gist for global data aggregation
 * Problem: External services introduce failure modes and timing dependencies
 * Solution: Graceful degradation with local-first architecture
 * Integration Patterns:
 *   - Local storage as primary data source (always works)
 *   - External service as secondary sync layer (may fail)
 *   - Retry logic and error boundaries around external calls  
 *   - System works fully offline, syncs when possible
 *   - Never block core functionality on external service availability
 * Rule: External services enhance but never block core game functionality
 * 
 * UPDATED KEY DEVELOPMENT PRINCIPLES:
 * ==================================
 * 15. Framework integrity is foundational - syntax errors break everything
 * 16. Performance must be considered for all special effects and complex calculations
 * 17. Object property access requires safety checks - never assume structure exists
 * 18. UI data loading should be proactive (startup) not reactive (user action)
 * 19. Game balance parameters need easy iteration support for player feedback
 * 20. Comprehensive error handling prevents cascading failures across modes
 * 21. ALL interactive UI elements must be themed per mode for immersive experience
 * 22. Avoid decorative UI elements - prioritize functional design over visual clutter
 * 23. Mode theming must be automatic and systematic through CSS class cascade architecture
 * 24. Global systems should be mode-agnostic and integrate at game state transitions
 * 25. UI components must respect existing layout constraints during iterative design
 * 26. Real-time systems need tiered update frequencies based on user expectations
 * 27. External services should enhance but never block core functionality
 */

const ModeFramework = {
    registeredModes: new Map(),
    currentMode: null,
    
    registerMode(modeConfig) {
        if (!this.validateMode(modeConfig)) {
            throw new Error(`Invalid mode configuration: ${modeConfig.id}`);
        }
        
        this.registeredModes.set(modeConfig.id, modeConfig);
        console.log(`✅ Mode registered: ${modeConfig.name}`);
        
        this.setupModeAssets(modeConfig);
        return modeConfig;
    },
    
    validateMode(config) {
        const required = ['id', 'name', 'colorScheme', 'mechanics', 'leaderboard'];
        return required.every(field => config[field] !== undefined);
    },
    
    setupModeAssets(config) {
        if (config.stylesheet?.customCSS) {
            this.injectStylesheet(config.id, config.stylesheet.customCSS);
        }
        
        if (config.mechanics?.specialFeatures) {
            this.registerSpecialFeatures(config.id, config.mechanics.specialFeatures);
        }
    },
    
    injectStylesheet(modeId, css) {
        const styleId = `mode-${modeId}-styles`;
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = css;
    },
    
    registerSpecialFeatures(modeId, features) {
        features.forEach(feature => {
            if (feature.type === 'powerup') {
                this.registerPowerup(modeId, feature);
            } else if (feature.type === 'blockBehavior') {
                this.registerBlockBehavior(modeId, feature);
            } else if (feature.type === 'difficultyModifier') {
                this.registerDifficultyModifier(modeId, feature);
            }
        });
    },
    
    activateMode(modeId) {
        const mode = this.registeredModes.get(modeId);
        if (!mode) {
            throw new Error(`Mode not found: ${modeId}`);
        }
        
        this.deactivateCurrentMode();
        this.currentMode = mode;
        
        this.applyColorScheme(mode.colorScheme);
        this.setupLeaderboard(mode.leaderboard);
        this.initializeMechanics(mode.mechanics);
        
        if (mode.musicProgression) {
            this.setupMusic(mode.musicProgression);
        }
        
        if (mode.audioConfig && window.AudioFramework) {
            window.AudioFramework.integrateWithAudioEngine(mode.audioConfig);
        }
        
        window.currentGameMode = mode;
        console.log(`🎮 Mode activated: ${mode.name}`);
        
        return mode;
    },
    
    deactivateCurrentMode() {
        if (this.currentMode) {
            this.cleanupModeAssets(this.currentMode.id);
            this.currentMode = null;
        }
    },
    
    applyColorScheme(colorScheme) {
        console.log('🎨 Applying color scheme:', colorScheme);
        
        // Update global color variables
        if (window.colors) {
            if (colorScheme.background) {
                window.colors.bg = colorScheme.background;
            }
            if (colorScheme.blockByHP) {
                window.colors.blockByHP = colorScheme.blockByHP;
            }
            if (colorScheme.special) {
                window.colors.special = colorScheme.special;
            }
        }
        
        // Update body background
        if (colorScheme.background) {
            document.body.style.background = `linear-gradient(135deg, ${colorScheme.background.primary} 0%, ${colorScheme.background.secondary} 50%, ${colorScheme.background.accent} 100%)`;
        }
        
        // Update block renderers if game renderer exists
        if (window.gameCore && window.gameCore.renderer && window.gameCore.renderer.setColorScheme) {
            window.gameCore.renderer.setColorScheme(colorScheme);
            console.log('🎨 Updated game renderer with new color scheme');
        } else {
            console.warn('⚠️ Game renderer not found - color scheme may not apply to blocks');
        }
        
        // Store for ColorSchemes system
        if (window.ColorSchemes) {
            Object.assign(window.ColorSchemes, { current: colorScheme });
        }
    },
    
    setupLeaderboard(leaderboardConfig) {
        console.log('📊 Setting up leaderboard for mode:', leaderboardConfig);
        
        // Set the current mode for leaderboard tracking
        if (window.currentModeKey !== undefined) {
            window.currentModeKey = leaderboardConfig.key;
        }
        
        // Initialize empty leaderboard if it doesn't exist
        if (!localStorage.getItem(leaderboardConfig.key)) {
            localStorage.setItem(leaderboardConfig.key, JSON.stringify([]));
            console.log(`📊 Initialized empty leaderboard for ${leaderboardConfig.key}`);
        }
        
        // Refresh the leaderboard display
        if (window.refreshModeLeaderboard) {
            window.refreshModeLeaderboard();
        }
        
        // Load scores from Gist
        if (window.loadFromGist && leaderboardConfig.gistFile) {
            const modeId = leaderboardConfig.key.replace('ballDefender_', '').replace('_Leaderboard', '');
            window.loadFromGist(modeId).then(() => {
                console.log(`✅ Loaded ${modeId} scores from Gist`);
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
            }).catch(err => {
                console.warn(`⚠️ Could not load ${modeId} scores from Gist:`, err);
            });
        }
    },
    
    initializeMechanics(mechanics) {
        if (window.baseBallCount !== undefined) {
            window.baseBallCount = mechanics.startingBalls || 1;
            window.ballsForNextShot = window.baseBallCount;
        }
        
        mechanics.specialFeatures?.forEach(feature => {
            this.activateFeature(feature);
        });
    },
    
    setupMusic(progression) {
        if (window.audioEngine?.setProgression) {
            window.audioEngine.setProgression(progression);
        }
    },
    
    activateFeature(feature) {
        if (feature.onActivate) {
            feature.onActivate();
        }
    },
    
    cleanupModeAssets(modeId) {
        const styleElement = document.getElementById(`mode-${modeId}-styles`);
        if (styleElement) {
            styleElement.remove();
        }
    },
    
    registerPowerup(modeId, powerup) {
        if (!window.customPowerups) {
            window.customPowerups = new Map();
        }
        window.customPowerups.set(`${modeId}-${powerup.id}`, powerup);
    },
    
    registerBlockBehavior(modeId, behavior) {
        if (!window.customBlockBehaviors) {
            window.customBlockBehaviors = new Map();
        }
        window.customBlockBehaviors.set(`${modeId}-${behavior.id}`, behavior);
    },
    
    registerDifficultyModifier(modeId, modifier) {
        if (!window.difficultyModifiers) {
            window.difficultyModifiers = new Map();
        }
        window.difficultyModifiers.set(`${modeId}-${modifier.id}`, modifier);
    },
    
    getMode(modeId) {
        return this.registeredModes.get(modeId);
    },
    
    getAllModes() {
        return Array.from(this.registeredModes.values());
    },
    
    getCurrentMode() {
        return this.currentMode;
    }
};

window.ModeFramework = ModeFramework;

console.log('🏗️ Mode Framework loaded - Ready for mode registration');