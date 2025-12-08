/**
 * EXAMPLE MODE TEMPLATE
 * ====================
 * 
 * This is a complete example of how to create a new mode following
 * the standardized leaderboard system and Mode Template System.
 * 
 * Copy this file and modify it to create your own mode!
 */

const exampleModeDefinition = {
    // REQUIRED: Unique identifier (no spaces, camelCase recommended)
    id: 'example',
    
    // REQUIRED: Human-readable name
    name: 'Example Mode',
    
    // REQUIRED: Brief description
    description: 'A template mode showing proper leaderboard integration',
    
    // REQUIRED: Color scheme for visual consistency
    colorScheme: {
        background: { 
            primary: '#1a1a2e',   // Main background
            secondary: '#16213e', // Secondary background
            accent: '#0f4c75'     // Accent color
        },
        blockByHP: {
            1: { base: '#64ffda', glow: '#80ffea', shadow: '#40d0aa' },
            2: { base: '#ffd93d', glow: '#ffe55d', shadow: '#d0b030' },
            3: { base: '#ff6bcb', glow: '#ff8bdb', shadow: '#d050a0' },
            4: { base: '#ff4757', glow: '#ff6777', shadow: '#d03040' },
            5: { base: '#a55eea', glow: '#b57efa', shadow: '#8040c0' },
            default: { base: '#4a4a4a', glow: '#6a6a6a', shadow: '#2a2a2a' }
        },
        special: {
            spawner: { base: '#00ff88', glow: '#40ffaa', shadow: '#00cc66' },
            exploder: { base: '#ff3838', glow: '#ff5858', shadow: '#cc2020' }
        }
    },
    
    // REQUIRED: Game mechanics
    mechanics: {
        startingBalls: 1,
        ballSpeed: 1.0,
        specialFeatures: []  // Add special features here if needed
    },
    
    // OPTIONAL: Audio configuration
    audioConfig: {
        progression: [1, 4, 5, 1],  // Chord progression
        key: 'C',                   // Musical key
        style: { 
            tempo: 'medium', 
            attack: 'normal', 
            sustain: 'medium',
            timbre: 'warm'
        },
        soundEffects: {
            blockHit: { frequency: 800, duration: 0.1, timbre: 'pure' },
            blockDestroy: { frequency: 400, duration: 0.2, timbre: 'warm' },
            ballBounce: { frequency: 1200, duration: 0.05, timbre: 'bright' }
        }
    },
    
    // REQUIRED: Leaderboard configuration (CRITICAL - Must follow naming patterns!)
    leaderboard: {
        // Storage key pattern: ballDefender_${modeId}_Leaderboard
        key: 'ballDefender_example_Leaderboard',
        
        // Gist filename pattern: ball-defender-${modeId}-leaderboard.json
        gistFile: 'ball-defender-example-leaderboard.json'
    },
    
    // OPTIONAL: Custom CSS styling
    stylesheet: {
        customCSS: `
            /* Mode-specific CSS variables */
            .mode-example {
                --primary-color: #64ffda;
                --secondary-color: #ffd93d;
                --accent-color: #ff6bcb;
                --bg-primary: #1a1a2e;
                --bg-secondary: #16213e;
            }
            
            /* Custom background for this mode */
            .mode-example .game-canvas {
                background: radial-gradient(circle at center, var(--bg-primary), var(--bg-secondary));
            }
            
            /* Styled buttons for this mode */
            .mode-example #pauseBtn,
            .mode-example #startBtn {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)) !important;
                border: 2px solid var(--accent-color) !important;
                color: #ffffff !important;
                box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4) !important;
                transition: all 0.3s ease !important;
                font-family: 'Courier New', monospace !important;
                font-weight: bold !important;
                border-radius: 8px !important;
            }
            
            .mode-example #pauseBtn:hover,
            .mode-example #startBtn:hover {
                transform: translateY(-2px) scale(1.05) !important;
                box-shadow: 0 6px 20px rgba(100, 255, 218, 0.6) !important;
            }
            
            /* Optional: Add mode-specific icon to pause button */
            .mode-example #pauseBtn::before {
                content: '🎮';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 16px;
            }
            
            .mode-example #pauseBtn {
                padding-left: 40px !important;
            }
        `
    }
};

// REQUIRED: Register the mode with the template system
if (window.ModeTemplateSystem) {
    try {
        window.ModeTemplateSystem.registerMode(exampleModeDefinition);
        console.log('✅ Example Mode registered successfully');
    } catch (error) {
        console.error('❌ Failed to register Example Mode:', error);
    }
} else {
    console.warn('⚠️ Mode Template System not ready, deferring Example Mode registration');
    
    // RECOMMENDED: Wait for template system to load
    const waitForTemplateSystem = setInterval(() => {
        if (window.ModeTemplateSystem) {
            clearInterval(waitForTemplateSystem);
            try {
                window.ModeTemplateSystem.registerMode(exampleModeDefinition);
                console.log('✅ Example Mode registered successfully (deferred)');
            } catch (error) {
                console.error('❌ Failed to register Example Mode:', error);
            }
        }
    }, 100);
    
    // Stop trying after 5 seconds
    setTimeout(() => clearInterval(waitForTemplateSystem), 5000);
}

// OPTIONAL: Export for debugging
window.exampleModeDefinition = exampleModeDefinition;

/**
 * TESTING YOUR MODE
 * =================
 * 
 * To test this mode, open the browser console and run:
 * 
 * 1. Check if mode is registered:
 *    window.ModeTemplateSystem.listModes()
 * 
 * 2. Activate your mode:
 *    window.ModeTemplateSystem.activateMode('example')
 * 
 * 3. Test leaderboard configuration:
 *    window.ModeLeaderboardManager.getLeaderboard('example')
 * 
 * 4. Add a test score (for testing only):
 *    window.addToLeaderboard('TestPlayer', 12345, 'example')
 * 
 * 5. Check if gist file was created:
 *    window.loadFromGist('example')
 * 
 * IMPORTANT LEADERBOARD NOTES
 * ===========================
 * 
 * ✅ This example follows the EXACT naming patterns required:
 *    - Storage key: ballDefender_example_Leaderboard
 *    - Gist file: ball-defender-example-leaderboard.json
 * 
 * ✅ The leaderboard will automatically:
 *    - Create the gist file when first score is saved
 *    - Sort scores by highest first
 *    - Assign rankings
 *    - Keep only top 15 scores
 *    - Sync to GitHub Gist in real-time
 * 
 * ❌ DO NOT modify the naming patterns or the leaderboard won't work!
 * 
 * MODE CUSTOMIZATION GUIDE
 * ========================
 * 
 * To create your own mode based on this template:
 * 
 * 1. Change the 'id' field to your mode's unique identifier
 * 2. Update the 'name' and 'description' fields
 * 3. Customize the 'colorScheme' object with your colors
 * 4. Modify 'audioConfig' for your preferred sound style
 * 5. Update the CSS in 'stylesheet.customCSS' for your visual style
 * 6. CRITICAL: Update the leaderboard configuration:
 *    - key: 'ballDefender_YOURID_Leaderboard'
 *    - gistFile: 'ball-defender-YOURID-leaderboard.json'
 * 7. Add any special features to 'mechanics.specialFeatures'
 * 8. Test thoroughly using the console commands above
 */