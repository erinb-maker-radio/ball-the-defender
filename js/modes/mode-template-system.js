/**
 * BALL DEFENDER MODE TEMPLATE SYSTEM
 * ===================================
 * 
 * This is the core template system for creating game modes in Ball Defender.
 * It provides a standardized architecture that ensures all modes share common
 * functionality while allowing for unique features.
 * 
 * ARCHITECTURE PRINCIPLES:
 * 1. Separation of Concerns - Mode definition vs. runtime state
 * 2. Immutability - Mode definitions should never be modified after creation
 * 3. Extensibility - Easy to add new features without breaking existing ones
 * 4. Consistency - All modes follow the same structure and patterns
 * 5. Testability - Each component can be tested in isolation
 */

class GameModeTemplate {
    /**
     * Creates a new game mode from a definition object
     * @param {Object} definition - The mode definition
     */
    constructor(definition) {
        // Validate and freeze the definition to prevent accidental modification
        this.validateDefinition(definition);
        this.definition = Object.freeze(JSON.parse(JSON.stringify(definition)));
        
        // Runtime state - separate from definition
        this.runtimeState = {
            active: false,
            features: new Map(),
            cleanup: []
        };
        
        // Mode identity
        this.id = definition.id;
        this.name = definition.name;
        this.description = definition.description;
    }
    
    /**
     * Validates that a mode definition has all required fields
     */
    validateDefinition(def) {
        const required = ['id', 'name', 'description', 'colorScheme', 'mechanics'];
        const missing = required.filter(field => !def[field]);
        
        if (missing.length > 0) {
            throw new Error(`Mode definition missing required fields: ${missing.join(', ')}`);
        }
        
        // Validate color scheme
        if (!def.colorScheme.background) {
            throw new Error('Mode colorScheme must include background');
        }
        
        // blockByHP and special can be null (disabled) for theme-based modes
        if (def.colorScheme.blockByHP === undefined) {
            throw new Error('Mode colorScheme must define blockByHP (can be null to disable)');
        }
        
        // Validate mechanics
        if (typeof def.mechanics.startingBalls !== 'number' || 
            typeof def.mechanics.ballSpeed !== 'number') {
            throw new Error('Mode mechanics must include startingBalls and ballSpeed as numbers');
        }
    }
    
    /**
     * Activates this game mode
     * This is called when the mode is selected by the player
     */
    async activate() {
        if (this.runtimeState.active) {
            console.warn(`Mode ${this.id} is already active`);
            return;
        }
        
        console.log(`🎮 Activating mode: ${this.name}`);

        // Show loading screen immediately
        this.showLoadingScreen();

        try {
            // Initialize mode step by step with loading progress
            await this.initializeMode();

            // DON'T hide loading screen here - game.js will hide it after blocks are generated
            // This ensures blocks appear with the game field, not 3 seconds later
            console.log(`✅ Mode ${this.name} initialized - waiting for game to generate blocks`);
        } catch (error) {
            console.error(`❌ Failed to load mode ${this.name}:`, error);
            this.hideLoadingScreen();
            throw error;
        }
    }
    
    /**
     * Initialize mode with loading progress tracking
     */
    async initializeMode() {
        this.updateLoadingProgress('Initializing mode...', 0);
        this.runtimeState.active = true;
        await this.delay(50); // Minimal delay for DOM

        // Step 1: Apply theme integration - CRITICAL for block colors
        this.updateLoadingProgress('Loading theme...', 20);
        this.applyThemeIntegration();
        await this.delay(100); // Brief delay for theme to apply

        // Step 2: Apply base settings
        this.updateLoadingProgress('Configuring...', 40);
        this.applyColorScheme();
        this.applyMechanics();
        await this.delay(50);

        // Step 3: Audio and leaderboard
        this.updateLoadingProgress('Setting up...', 60);
        this.applyAudioSettings();
        this.setupLeaderboard();
        await this.delay(50);

        // Step 4: Activate special features
        this.updateLoadingProgress('Activating features...', 75);
        this.activateFeatures();
        await this.delay(50);

        // Step 5: Apply custom styles
        this.updateLoadingProgress('Applying styles...', 85);
        this.applyCustomStyles();
        await this.delay(100);

        // Step 6: Quick theme verification (non-blocking)
        this.updateLoadingProgress('Verifying...', 95);
        await this.verifyThemeLoaded();

        this.updateLoadingProgress('Ready!', 100);
        await this.delay(200); // Brief "Ready!" display
    }
    
    /**
     * Deactivates this game mode
     * Properly cleans up all mode-specific resources
     */
    deactivate() {
        if (!this.runtimeState.active) {
            return;
        }
        
        console.log(`🎮 Deactivating mode: ${this.name}`);
        
        // Restore original leaderboard functions
        this.restoreLeaderboardFunctions();
        
        // Run all cleanup functions
        this.runtimeState.cleanup.forEach(cleanupFn => {
            try {
                cleanupFn();
            } catch (error) {
                console.error(`Error during cleanup: ${error}`);
            }
        });
        
        // Clear runtime state
        this.runtimeState.features.clear();
        this.runtimeState.cleanup = [];
        this.runtimeState.active = false;
        
        // Remove custom styles
        this.removeCustomStyles();
        
        console.log(`✅ Mode ${this.name} deactivated`);
    }
    
    /**
     * Restore original leaderboard functions
     */
    restoreLeaderboardFunctions() {
        if (window._originalLeaderboardFunctions) {
            window.getLeaderboard = window._originalLeaderboardFunctions.getLeaderboard;
            window.addToLeaderboard = window._originalLeaderboardFunctions.addToLeaderboard;
            console.log(`🔧 Original leaderboard functions restored for mode: ${this.id}`);
        }
    }
    
    /**
     * Applies the mode's color scheme to the game
     * Simplified: Theme colors take priority, mode colors are fallback
     */
    applyColorScheme() {
        const scheme = this.definition.colorScheme;
        
        // Initialize window.colors if it doesn't exist
        if (!window.colors) {
            window.colors = {};
        }
        
        // Apply background colors
        if (scheme.background) {
            window.colors.bg = scheme.background;
        }
        
        // Only apply mode colors if no theme is available
        if (!this.runtimeState.themeBlocks) {
            // Apply block colors by HP as fallback (if not null)
            if (scheme && scheme.blockByHP) {
                window.colors.blockByHP = scheme.blockByHP;
            }
            
            // Apply special block colors as fallback (if not null)
            if (scheme && scheme.special) {
                window.colors.special = scheme.special;
            }
        }
        
        // Store original colors for cleanup
        this.runtimeState.cleanup.push(() => {
            // Clear theme colors on deactivation
            delete window.getThemeBlockColors;
            this.runtimeState.themeBlocks = null;
            
            // Restore default colors if needed
            if (window.defaultColors) {
                window.colors = JSON.parse(JSON.stringify(window.defaultColors));
            }
        });
    }
    
    /**
     * Sets up the leaderboard for this mode using Supabase authentication
     */
    setupLeaderboard() {
        console.log(`📊 Setting up leaderboard for mode: ${this.id}`);
        
        // Ensure Supabase authentication is available
        if (!window.SecureHighScoreAuth) {
            console.error('❌ SecureHighScoreAuth not available for mode:', this.id);
            return;
        }
        
        // Clear any cached leaderboard data for this mode
        if (window.SupabaseLeaderboard && window.SupabaseLeaderboard.forceMode) {
            console.log(`🧹 Clearing cache and forcing mode: ${this.id}`);
            window.SupabaseLeaderboard.forceMode(this.id);
        }
        
        // Override the global leaderboard functions for this mode
        this.overrideLeaderboardFunctions();
        
        // Load initial leaderboard data
        this.loadModeLeaderboard();
        
        console.log(`✅ Leaderboard setup complete for mode: ${this.id}`);
    }
    
    /**
     * Override global leaderboard functions to ensure this mode's data is used
     */
    overrideLeaderboardFunctions() {
        const modeId = this.id;
        
        // Store original functions if not already stored
        if (!window._originalLeaderboardFunctions) {
            window._originalLeaderboardFunctions = {
                getLeaderboard: window.getLeaderboard,
                addToLeaderboard: window.addToLeaderboard
            };
        }
        
        // Override getLeaderboard to always return this mode's data
        window.getLeaderboard = function(gameMode = null) {
            const targetMode = gameMode || modeId;
            console.log(`🎯 getLeaderboard called for mode template: ${modeId}, requested: ${targetMode}`);
            
            // Force the mode if different from current
            if (window.SupabaseLeaderboard && targetMode !== window.SupabaseLeaderboard.getCurrentMode()) {
                console.log(`🔄 Switching leaderboard from ${window.SupabaseLeaderboard.getCurrentMode()} to ${targetMode}`);
                window.SupabaseLeaderboard.forceMode(targetMode);
            }
            
            // Call original function with explicit mode
            return window._originalLeaderboardFunctions.getLeaderboard(targetMode);
        };
        
        // Override addToLeaderboard to always use this mode
        window.addToLeaderboard = async function(playerName, playerScore, gameMode = null) {
            const targetMode = gameMode || modeId;
            console.log(`🏆 addToLeaderboard called for mode template: ${modeId}, using mode: ${targetMode}`);
            
            return await window._originalLeaderboardFunctions.addToLeaderboard(playerName, playerScore, targetMode);
        };
        
        console.log(`🔧 Leaderboard functions overridden for mode: ${modeId}`);
    }
    
    /**
     * Load leaderboard data for this specific mode
     */
    async loadModeLeaderboard() {
        try {
            // Ensure authentication
            if (window.SecureHighScoreAuth) {
                await window.SecureHighScoreAuth.authenticate();
            }
            
            // Load leaderboard data using the Supabase system
            if (window.getLeaderboard) {
                const scores = window.getLeaderboard(this.id);
                console.log(`📊 Loaded ${scores.length} scores for mode: ${this.id}`);
                
                // Update display if available
                setTimeout(() => {
                    if (window.updateLeaderboardDisplay) {
                        window.updateLeaderboardDisplay();
                    }
                }, 100);
            }
        } catch (error) {
            console.error(`❌ Failed to load leaderboard for mode ${this.id}:`, error);
        }
    }
    
    /**
     * Applies the mode's game mechanics
     */
    applyMechanics() {
        const mechanics = this.definition.mechanics;
        
        // Apply ball settings
        if (window.baseBallCount !== undefined) {
            window.baseBallCount = mechanics.startingBalls;
            window.ballsForNextShot = mechanics.startingBalls;
        }
        
        // Apply ball speed
        if (window.baseBallSpeed !== undefined) {
            window.baseBallSpeed = mechanics.ballSpeed;
        }
        
        // Apply any custom mechanics
        if (mechanics.customSettings) {
            Object.entries(mechanics.customSettings).forEach(([key, value]) => {
                if (window[key] !== undefined) {
                    window[key] = value;
                }
            });
        }
    }
    
    /**
     * Applies audio settings for the mode
     */
    applyAudioSettings() {
        if (!this.definition.audioConfig) return;
        
        const audio = this.definition.audioConfig;
        
        // Set music progression
        if (audio.progression && window.audioEngine?.setProgression) {
            window.audioEngine.setProgression(audio.progression);
        }
        
        // Apply audio style
        if (audio.style && window.AudioFramework?.integrateWithAudioEngine) {
            window.AudioFramework.integrateWithAudioEngine(audio);
        }
    }
    
    /**
     * Activates special features for this mode
     */
    activateFeatures() {
        if (!this.definition.mechanics.specialFeatures) return;
        
        this.definition.mechanics.specialFeatures.forEach(feature => {
            console.log(`🔧 Activating feature: ${feature.name} (${feature.id})`);
            
            // Create a feature instance
            const featureInstance = this.createFeatureInstance(feature);
            
            // Store in runtime state
            this.runtimeState.features.set(feature.id, featureInstance);
            
            // Activate the feature
            if (featureInstance.activate) {
                try {
                    featureInstance.activate();
                    console.log(`✅ Feature ${feature.name} activated`);
                } catch (error) {
                    console.error(`❌ Failed to activate feature ${feature.name}:`, error);
                }
            }
        });
    }
    
    /**
     * Creates a runtime instance of a feature
     * This ensures features don't interfere with each other or the mode definition
     */
    createFeatureInstance(featureDefinition) {
        // Create a new object that won't modify the definition
        const instance = {
            id: featureDefinition.id,
            name: featureDefinition.name,
            type: featureDefinition.type,
            config: featureDefinition.effect || {},
            state: {},  // Runtime state for this feature
            
            // Activation function
            activate: () => {
                if (featureDefinition.onActivate) {
                    // Create a sandboxed context for the feature
                    const context = this.createFeatureContext(instance);
                    featureDefinition.onActivate.call(context);
                }
            },
            
            // Deactivation function
            deactivate: () => {
                if (featureDefinition.onDeactivate) {
                    featureDefinition.onDeactivate.call(instance);
                }
            }
        };
        
        return instance;
    }
    
    /**
     * Creates a context object for feature activation
     * This provides features with a clean API to interact with the game
     */
    createFeatureContext(featureInstance) {
        return {
            // Feature identity
            featureId: featureInstance.id,
            featureName: featureInstance.name,
            
            // Feature configuration
            config: featureInstance.config,
            
            // State management
            setState: (key, value) => {
                featureInstance.state[key] = value;
            },
            
            getState: (key) => {
                return featureInstance.state[key];
            },
            
            // Global registration (for features that need to be accessible globally)
            registerGlobal: (namespace, api) => {
                if (!window[namespace]) {
                    window[namespace] = api;
                    
                    // Register cleanup
                    this.runtimeState.cleanup.push(() => {
                        delete window[namespace];
                    });
                }
            },
            
            // Add cleanup function
            addCleanup: (cleanupFn) => {
                this.runtimeState.cleanup.push(cleanupFn);
            }
        };
    }
    
    /**
     * Applies custom CSS styles for the mode
     */
    applyCustomStyles() {
        if (!this.definition.stylesheet?.customCSS) return;
        
        const styleId = `mode-${this.id}-styles`;
        
        // Remove existing style if present
        const existing = document.getElementById(styleId);
        if (existing) {
            existing.remove();
        }
        
        // Create and inject new style element
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = this.definition.stylesheet.customCSS;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Removes custom CSS styles
     */
    removeCustomStyles() {
        const styleId = `mode-${this.id}-styles`;
        const element = document.getElementById(styleId);
        if (element) {
            element.remove();
        }
    }
    
    /**
     * Apply theme if available (integrated from Theme Integration System)
     */
    applyThemeIntegration() {
        // Check if mode has a protected theme
        const themeApplyFunction = this.getProtectedThemeFunction();
        console.log(`🔍 Theme function for ${this.id}:`, !!themeApplyFunction);
        
        if (themeApplyFunction) {
            console.log(`🎨 Applying protected theme for mode: ${this.id}`);
            try {
                const theme = themeApplyFunction();
                console.log(`🔍 Theme returned:`, !!theme, theme ? Object.keys(theme) : 'null');
                
                if (theme && theme.blocks) {
                    console.log(`🔍 Theme blocks found:`, Object.keys(theme.blocks));
                    
                    // Store theme blocks for renderer access
                    this.runtimeState.themeBlocks = theme.blocks;
                    
                    // Set up global function for renderers to get theme colors
                    window.getThemeBlockColors = (blockType, damageState) => {
                        return this.getThemeBlockColors(blockType, damageState);
                    };
                    
                    // Test theme colors immediately
                    const testHp1 = this.getThemeBlockColors('hp1', 'full');
                    const testHp2 = this.getThemeBlockColors('hp2', 'full');
                    const testHp3 = this.getThemeBlockColors('hp3', 'full');
                    
                    console.log(`✅ Theme applied with block colors:`, Object.keys(theme.blocks));
                    console.log(`🔍 Theme color test results:`, {
                        hp1: testHp1?.fill,
                        hp2: testHp2?.fill,
                        hp3: testHp3?.fill
                    });
                } else {
                    console.warn(`⚠️ Theme function returned invalid theme:`, theme);
                }
            } catch (error) {
                console.error(`❌ Theme application failed for mode ${this.id}:`, error);
            }
        } else {
            console.warn(`⚠️ No protected theme function found for mode: ${this.id}`);
        }
    }
    
    /**
     * Get protected theme function for this mode
     */
    getProtectedThemeFunction() {
        const themeFunctions = {
            'original': window.PROTECTED_applyOriginalTheme,
            'iceFrost': window.PROTECTED_applyIceTheme,
            'ballGoBoom': window.PROTECTED_applyBallGoBoomTheme
        };
        return themeFunctions[this.id];
    }
    
    /**
     * Get theme block colors (integrated from Theme Integration System)
     */
    getThemeBlockColors(blockType = 'normal', damageState = 'full') {
        if (!this.runtimeState.themeBlocks) {
            return null;
        }
        
        // Support HP-based lookup (e.g., 'hp1', 'hp2', 'hp3', 'hp4', 'hp5')
        let blockConfig = this.runtimeState.themeBlocks[blockType];
        
        // If blockType is a number, convert to HP format
        if (typeof blockType === 'number' && blockType >= 1 && blockType <= 5) {
            blockConfig = this.runtimeState.themeBlocks[`hp${blockType}`];
        }
        
        // Debug: Log available keys when lookup fails
        if (!blockConfig && Math.random() < 0.01) {
            console.log(`⚠️ No config for ${blockType}, available:`, Object.keys(this.runtimeState.themeBlocks || {}));
        }
        
        if (!blockConfig) {
            // Fallback to normal block if type not found
            return this.getThemeBlockColors('normal', damageState);
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
            glow: stateColors.glow || blockConfig.effects?.outerGlow || 'rgba(0, 0, 0, 0.3)'
        };
    }
    
    /**
     * Gets the feature instance by ID
     */
    getFeature(featureId) {
        return this.runtimeState.features.get(featureId);
    }
    
    /**
     * Checks if the mode is currently active
     */
    isActive() {
        return this.runtimeState.active;
    }
    
    /**
     * Exports the mode definition (for debugging/saving)
     */
    exportDefinition() {
        return JSON.parse(JSON.stringify(this.definition));
    }
    
    /**
     * Show loading screen - now uses zoom animation on clicked mode button
     */
    showLoadingScreen() {
        // Remove existing loading screen if any
        this.hideLoadingScreen();

        // Get the clicked mode button for zoom animation
        const clickedBtn = window._clickedModeButton;
        const menuContainer = document.getElementById('mainMenu');

        if (clickedBtn && menuContainer) {
            // Get the image from the button
            const img = clickedBtn.querySelector('img');
            if (img) {
                // Get button's current position
                const rect = clickedBtn.getBoundingClientRect();

                // Hide other buttons and content
                const otherButtons = menuContainer.querySelectorAll('.mode-image-btn');
                otherButtons.forEach(btn => {
                    if (btn !== clickedBtn) {
                        btn.style.transition = 'opacity 0.3s ease';
                        btn.style.opacity = '0';
                    }
                });

                // Hide the title image
                const titleImg = menuContainer.querySelector('.menu-title-img');
                if (titleImg) {
                    titleImg.style.transition = 'opacity 0.3s ease';
                    titleImg.style.opacity = '0';
                }

                // Determine mode color based on mode id
                const modeId = this.definition?.id || 'original';
                let modeColor = '#00ff00'; // Default green
                if (modeId === 'ballGoBoom') modeColor = '#ff6600';
                else if (modeId === 'iceFrost' || modeId === 'ice') modeColor = '#00c8ff';

                // Create full-screen backdrop to hide everything during loading
                const backdrop = document.createElement('div');
                backdrop.id = 'modeLoadingBackdrop';
                backdrop.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #1a1a2e;
                    z-index: 10000;
                `;
                document.body.appendChild(backdrop);

                // Create a container for the zoom animation
                const zoomContainer = document.createElement('div');
                zoomContainer.id = 'modeZoomImage';
                zoomContainer.style.cssText = `
                    position: fixed;
                    left: ${rect.left}px;
                    top: ${rect.top}px;
                    width: ${rect.width}px;
                    height: ${rect.height}px;
                    z-index: 10001;
                    border-radius: 12px;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                `;

                // Clone the image
                const zoomImg = img.cloneNode(true);
                zoomImg.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                `;
                zoomContainer.appendChild(zoomImg);

                // Add text overlay
                const textOverlay = document.createElement('div');
                textOverlay.id = 'modeLoadingOverlay';
                textOverlay.innerHTML = `
                    <div class="mode-loading-title" style="
                        font-size: 42px;
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        color: ${modeColor};
                        text-shadow: 0 0 20px ${modeColor}, 0 0 40px ${modeColor};
                        margin-bottom: 20px;
                        opacity: 0;
                        animation: fadeInUp 0.5s ease-out 0.4s forwards;
                    ">${this.name}</div>
                    <div class="mode-loading-text" style="
                        font-size: 18px;
                        font-family: 'Courier New', monospace;
                        color: #ffffff;
                        text-shadow: 0 0 10px ${modeColor};
                        opacity: 0;
                        animation: fadeInUp 0.5s ease-out 0.6s forwards;
                    ">Loading...</div>
                `;
                textOverlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.6);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                zoomContainer.appendChild(textOverlay);

                // Add animation keyframes
                const styleSheet = document.createElement('style');
                styleSheet.id = 'modeZoomStyles';
                styleSheet.textContent = `
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `;
                document.head.appendChild(styleSheet);

                document.body.appendChild(zoomContainer);

                // Hide the original button
                clickedBtn.style.opacity = '0';

                // Calculate target size (fill most of screen)
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const targetWidth = Math.min(viewportWidth * 0.85, viewportHeight * 0.85);
                const targetHeight = targetWidth;
                const targetLeft = (viewportWidth - targetWidth) / 2;
                const targetTop = (viewportHeight - targetHeight) / 2;

                // Trigger the zoom animation
                requestAnimationFrame(() => {
                    zoomContainer.style.left = `${targetLeft}px`;
                    zoomContainer.style.top = `${targetTop}px`;
                    zoomContainer.style.width = `${targetWidth}px`;
                    zoomContainer.style.height = `${targetHeight}px`;
                    zoomContainer.style.borderRadius = '20px';
                    zoomContainer.style.boxShadow = `0 0 100px ${modeColor}80`;

                    // Show the text overlay after zoom starts
                    setTimeout(() => {
                        textOverlay.style.opacity = '1';
                    }, 200);
                });

                // Store reference for hideLoadingScreen
                this._zoomImage = zoomContainer;
                return;
            }
        }

        // Fallback: simple black loading screen if no button clicked
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'modeLoadingScreen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <h1 class="loading-title">${this.name}</h1>
            </div>
        `;

        const style = document.createElement('style');
        style.id = 'modeLoadingStyles';
        style.textContent = `
            #modeLoadingScreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .loading-title {
                font-size: 48px;
                color: white;
                font-family: 'Courier New', monospace;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes titleGlow {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loadingScreen);
        
        // Apply mode-specific colors to loading screen
        this.applyLoadingScreenTheme(loadingScreen);
    }
    
    /**
     * Apply mode-specific theme to loading screen
     */
    applyLoadingScreenTheme(loadingScreen) {
        const modeColors = {
            'original': { primary: '#00ff00', secondary: '#88ff88' },
            'iceFrost': { primary: '#00e5ff', secondary: '#80deea' },
            'ballGoBoom': { primary: '#ff9500', secondary: '#ffb040' }
        };
        
        const colors = modeColors[this.id] || modeColors['original'];
        
        const title = loadingScreen.querySelector('.loading-title');
        const fill = loadingScreen.querySelector('.loading-fill');
        
        if (title) {
            title.style.color = colors.primary;
        }
        
        if (fill) {
            fill.style.background = `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`;
        }
    }
    
    /**
     * Update loading progress
     */
    updateLoadingProgress(text, percentage) {
        const loadingText = document.getElementById('loadingText');
        const loadingFill = document.getElementById('loadingFill');
        
        if (loadingText) {
            loadingText.textContent = text;
        }
        
        if (loadingFill) {
            loadingFill.style.width = `${percentage}%`;
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        // Handle backdrop if it exists
        const backdrop = document.getElementById('modeLoadingBackdrop');
        if (backdrop) {
            backdrop.style.transition = 'opacity 0.3s ease';
            backdrop.style.opacity = '0';
            setTimeout(() => backdrop.remove(), 300);
        }

        // Handle zoom image if it exists
        const zoomImg = document.getElementById('modeZoomImage');
        if (zoomImg) {
            zoomImg.style.transition = 'opacity 0.3s ease';
            zoomImg.style.opacity = '0';
            setTimeout(() => {
                zoomImg.remove();
            }, 300);
        }
        this._zoomImage = null;

        // Clean up zoom styles
        const zoomStyles = document.getElementById('modeZoomStyles');
        if (zoomStyles) zoomStyles.remove();

        // Handle traditional loading screen
        const loadingScreen = document.getElementById('modeLoadingScreen');
        const loadingStyles = document.getElementById('modeLoadingStyles');

        if (loadingScreen) {
            loadingScreen.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                loadingScreen.remove();
                if (loadingStyles) {
                    loadingStyles.remove();
                }
            }, 300);
        }
    }
    
    /**
     * Verify theme is properly loaded - quick check with fast timeout
     */
    async verifyThemeLoaded() {
        const maxAttempts = 10; // 500ms max (10 * 50ms)
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (window.getThemeBlockColors) {
                const hp1Colors = window.getThemeBlockColors('hp1', 'full');
                const hp2Colors = window.getThemeBlockColors('hp2', 'full');
                const hp3Colors = window.getThemeBlockColors('hp3', 'full');

                // Check that we have actual theme colors (not default grey)
                const validColors = [hp1Colors, hp2Colors, hp3Colors].filter(color =>
                    color && color.fill && color.fill !== '#666666' && color.fill !== '#999999'
                );

                if (validColors.length >= 3) {
                    console.log(`✅ ${this.id} theme colors loaded`);
                    return;
                }
            }

            attempts++;
            await this.delay(50);
        }

        console.warn(`⚠️ ${this.id} theme verification timeout - continuing anyway`);
    }
    
    /**
     * Wait for initial blocks to be spawned in the game field
     */
    async waitForBlocksToSpawn() {
        const maxAttempts = 30; // 3 seconds max - much longer timeout
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                // Check if blocks array exists and has blocks
                if (window.blocks && Array.isArray(window.blocks) && window.blocks.length > 0) {
                    console.log(`✅ Found ${window.blocks.length} initial blocks spawned`);
                    // Extra delay after finding blocks to ensure they're fully rendered
                    await this.delay(500);
                    return true;
                }
            } catch (error) {
                // Keep trying
            }
            
            attempts++;
            await this.delay(100);
        }
        
        console.log('ℹ️ No blocks found yet - game not started or no blocks generated');
        return false;
    }
    
    /**
     * Verify that spawned blocks have the correct theme colors applied
     */
    async verifyBlockColors() {
        const maxAttempts = 30; // 3 seconds max
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                if (window.blocks && window.blocks.length > 0) {
                    // Check if we can get proper colors for the actual blocks
                    let correctColorsFound = 0;
                    
                    for (let i = 0; i < Math.min(5, window.blocks.length); i++) {
                        const block = window.blocks[i];
                        if (window.getThemeBlockColors) {
                            const expectedColor = window.getThemeBlockColors(`hp${block.hitPoints}`, 'full');
                            
                            if (expectedColor && expectedColor.fill && expectedColor.fill !== '#666666') {
                                correctColorsFound++;
                            }
                        }
                    }
                    
                    if (correctColorsFound >= Math.min(3, window.blocks.length)) {
                        console.log(`✅ Block colors verified - ${correctColorsFound} blocks have correct theme colors`);
                        return true;
                    }
                }
            } catch (error) {
                // Keep trying
            }
            
            attempts++;
            await this.delay(100);
        }
        
        console.error('❌ Block color verification failed - blocks would appear grey');
        return false;
    }
    
    /**
     * Verify theme colors are loaded even without blocks present
     */
    async verifyThemeColorsWithoutBlocks() {
        const maxAttempts = 20; // 2 seconds max
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                // Check if theme color function exists and returns valid colors
                if (window.getThemeBlockColors) {
                    const testColors = ['hp1', 'hp2', 'hp3'].map(hp => {
                        const color = window.getThemeBlockColors(hp, 'full');
                        return color && color.fill && color.fill !== '#666666';
                    });
                    
                    if (testColors.filter(Boolean).length >= 2) {
                        console.log('✅ Theme colors verified without blocks');
                        return true;
                    }
                }
                
                // Fallback: Check if color scheme is properly set
                if (window.colors && window.colors.blockByHP) {
                    const colorCount = Object.keys(window.colors.blockByHP).length;
                    if (colorCount >= 3) {
                        console.log('✅ Fallback color scheme verified');
                        return true;
                    }
                }
                
            } catch (error) {
                // Keep trying
            }
            
            attempts++;
            await this.delay(100);
        }
        
        console.error('❌ Theme color verification failed - colors not properly loaded');
        return false;
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * MODE TEMPLATE MANAGER
 * Manages all game modes and handles transitions between them
 */
class ModeTemplateManager {
    constructor() {
        this.modes = new Map();
        this.currentMode = null;
        this.defaultModeId = 'original';
    }
    
    /**
     * Registers a new mode
     */
    registerMode(definition) {
        if (this.modes.has(definition.id)) {
            console.warn(`Mode ${definition.id} is already registered`);
            return;
        }
        
        try {
            const mode = new GameModeTemplate(definition);
            this.modes.set(definition.id, mode);
            console.log(`✅ Registered mode: ${definition.name}`);
            return mode;
        } catch (error) {
            console.error(`❌ Failed to register mode: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Activates a mode by ID
     */
    async activateMode(modeId) {
        const mode = this.modes.get(modeId);
        if (!mode) {
            throw new Error(`Mode not found: ${modeId}`);
        }
        
        // Deactivate current mode if active
        if (this.currentMode) {
            this.currentMode.deactivate();
        }
        
        // Activate new mode with loading screen
        await mode.activate();
        this.currentMode = mode;
        
        // Update global reference
        window.currentGameMode = mode.definition;
        
        // Notify listeners
        this.notifyModeChange(mode);
        
        return mode;
    }
    
    /**
     * Gets a mode by ID
     */
    getMode(modeId) {
        return this.modes.get(modeId);
    }
    
    /**
     * Gets the current active mode
     */
    getCurrentMode() {
        return this.currentMode;
    }
    
    /**
     * Lists all registered modes
     */
    listModes() {
        return Array.from(this.modes.values()).map(mode => ({
            id: mode.id,
            name: mode.name,
            description: mode.description,
            active: mode.isActive()
        }));
    }
    
    /**
     * Notifies listeners of mode changes
     */
    notifyModeChange(mode) {
        // Dispatch custom event
        const event = new CustomEvent('modechange', {
            detail: {
                mode: mode.id,
                name: mode.name
            }
        });
        window.dispatchEvent(event);
        
        // Update body class
        document.body.className = document.body.className.replace(/mode-\w+/g, '');
        document.body.classList.add(`mode-${mode.id}`);
        
        // Refresh leaderboard if available
        if (window.refreshModeLeaderboard) {
            window.refreshModeLeaderboard();
        }
    }
}

// Create and export the global manager instance
window.ModeTemplateSystem = new ModeTemplateManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameModeTemplate, ModeTemplateManager };
}

console.log('✅ Mode Template System loaded');