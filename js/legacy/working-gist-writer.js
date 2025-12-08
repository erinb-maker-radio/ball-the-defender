// Working Gist Writer - Actually write scores to GitHub Gist
(function() {
    console.log('✍️ Working Gist Writer loading...');
    
    // Working GitHub configuration - Make available globally for time tracker
    const GIST_CONFIG = {
        gistId: '40398c32fa6fac004a52ea22d2612d23',
        token: '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',
        apiUrl: 'https://api.github.com/gists/40398c32fa6fac004a52ea22d2612d23',
        // Mode-specific file names (extensible for all modes)
        fileNames: {
            'original': 'ball-defender-original-leaderboard.json',
            'ballGoBoom': 'ball-defender-ballGoBoom-leaderboard.json',
            'iceFrost': 'ball-defender-iceFrost-leaderboard.json'
        }
    };
    
    // Make GIST_CONFIG available globally for time tracker and other modules
    window.GIST_CONFIG = GIST_CONFIG;
    
    // Get filename based on current mode (extensible for all modes)
    function getGistFileName(mode) {
        return GIST_CONFIG.fileNames[mode] || GIST_CONFIG.fileNames['original'];
    }
    
    // Dynamic score storage for all modes
    let modeScores = {
        'original': [],
        'ballGoBoom': [],
        'iceFrost': []
    };
    
    // Legacy variables for backward compatibility
    let currentGistScores = [];
    let ballGoBoomScores = [];
    
    // Get scores for any mode
    function getModeScores(mode) {
        return modeScores[mode] || [];
    }
    
    // Initialize mode if it doesn't exist
    function initializeMode(mode) {
        if (!modeScores[mode]) {
            modeScores[mode] = [];
            console.log(`🆕 Initialized empty leaderboard for mode: ${mode}`);
        }
        
        // Ensure Gist filename is configured
        if (!GIST_CONFIG.fileNames[mode]) {
            GIST_CONFIG.fileNames[mode] = `ball-defender-${mode}-leaderboard.json`;
            console.log(`📝 Auto-configured Gist filename for ${mode}: ${GIST_CONFIG.fileNames[mode]}`);
        }
    }
    
    // Load Ball Go Boom scores
    function loadBoomScores() {
        try {
            const stored = localStorage.getItem('ballDefender_ballGoBoom_Leaderboard');
            if (stored) {
                ballGoBoomScores = JSON.parse(stored).filter(s => typeof s.score === 'number');
                modeScores['ballGoBoom'] = ballGoBoomScores; // Update mode scores for consistency
                console.log(`💣 Loaded ${ballGoBoomScores.length} Ball Go Boom scores`);
            }
        } catch (e) {
            ballGoBoomScores = [];
            modeScores['ballGoBoom'] = [];
        }
    }
    
    // Save Ball Go Boom scores locally
    function saveBoomScores() {
        localStorage.setItem('ballDefender_ballGoBoom_Leaderboard', JSON.stringify(ballGoBoomScores));
    }
    
    // Load Original mode scores from localStorage
    function loadOriginalScores() {
        try {
            // Try multiple possible storage keys for original mode
            let scores = [];
            let sourceKey = '';
            
            // Primary key for original mode
            let stored = localStorage.getItem('ballDefender_original_Leaderboard');
            if (stored) {
                scores = JSON.parse(stored).filter(s => typeof s.score === 'number');
                sourceKey = 'ballDefender_original_Leaderboard';
            }
            // Legacy persistent leaderboard (main storage for original mode)
            else {
                stored = localStorage.getItem('ballDefenderPersistentLeaderboard');
                if (stored) {
                    scores = JSON.parse(stored).filter(s => typeof s.score === 'number');
                    sourceKey = 'ballDefenderPersistentLeaderboard';
                }
                // Even older legacy storage
                else {
                    stored = localStorage.getItem('ballDefenderLeaderboard');
                    if (stored) {
                        scores = JSON.parse(stored).filter(s => typeof s.score === 'number');
                        sourceKey = 'ballDefenderLeaderboard';
                    }
                }
            }
            
            modeScores['original'] = scores;
            currentGistScores = scores; // Update legacy variable for backward compatibility
            if (scores.length > 0) {
                console.log(`🎮 Loaded ${scores.length} Original mode scores from ${sourceKey}`);
            } else {
                console.log(`🎮 No Original mode scores found in localStorage`);
            }
        } catch (e) {
            console.warn('⚠️ Failed to load Original mode scores:', e);
            modeScores['original'] = [];
        }
    }
    
    // Load scores from GitHub Gist for specific mode
    async function loadFromGist(mode = 'original') {
        try {
            // Initialize mode if it doesn't exist
            initializeMode(mode);
            
            const fileName = getGistFileName(mode);
            console.log(`📥 Loading ${mode} scores from GitHub Gist file: ${fileName}`);
            
            const response = await fetch(GIST_CONFIG.apiUrl, {
                headers: {
                    'Authorization': `token ${GIST_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const gistData = await response.json();
                const fileData = gistData.files[fileName];
                
                if (fileData) {
                    const content = JSON.parse(fileData.content);
                    const scores = content.leaderboard || [];
                    
                    // Update the appropriate scores array based on mode
                    modeScores[mode] = scores;
                    console.log(`✅ Loaded ${scores.length} ${mode} scores from Gist`);
                    
                    // Update legacy variables for backward compatibility
                    if (mode === 'ballGoBoom') {
                        ballGoBoomScores = scores;
                    } else if (mode === 'original') {
                        currentGistScores = scores;
                    }
                    
                    return scores;
                } else {
                    console.log(`📄 No ${fileName} found in gist, creating empty leaderboard for ${mode}`);
                    // Create empty leaderboard for new mode
                    await writeToGist([], mode);
                    return [];
                }
            } else {
                console.error(`❌ Failed to load from Gist: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading from Gist:', error);
        }
        
        return getModeScores(mode);
    }
    
    // WRITE scores to GitHub Gist for specific mode
    async function writeToGist(scores, mode = 'original') {
        try {
            // Initialize mode if it doesn't exist
            initializeMode(mode);
            
            const fileName = getGistFileName(mode);
            console.log(`📤 Writing ${scores.length} ${mode} scores to GitHub Gist file: ${fileName}`);
            
            const gistData = {
                leaderboard: scores,
                lastUpdated: new Date().toISOString(),
                version: Date.now(),
                mode: mode
            };
            
            const updatePayload = {
                files: {
                    [fileName]: {
                        content: JSON.stringify(gistData, null, 2)
                    }
                }
            };
            
            const response = await fetch(GIST_CONFIG.apiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GIST_CONFIG.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(updatePayload)
            });
            
            if (response.ok) {
                console.log('✅ Successfully wrote scores to GitHub Gist!');
                const result = await response.json();
                console.log('🌐 Gist updated at:', result.updated_at);
                return true;
            } else {
                const errorText = await response.text();
                console.error(`❌ Failed to write to Gist: ${response.status}`, errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ Error writing to Gist:', error);
            return false;
        }
    }
    
    // Add score and write to Gist (Universal for all modes)
    async function addScoreAndWrite(playerName, playerScore) {
        const mode = window.currentGameMode?.id || window.selectedGameMode || localStorage.getItem('ballDefender_selectedMode');
        if (!mode) {
            console.warn('⚠️ No game mode selected, cannot save score');
            return [];
        }
        const numericScore = parseInt(playerScore) || window.score || 0;
        
        console.log(`🏆 Adding score: ${playerName} - ${numericScore} (${mode})`);
        
        // Initialize mode if it doesn't exist
        initializeMode(mode);
        
        // Load latest scores from Gist first
        await loadFromGist(mode);
        
        // Add new score
        const newScore = {
            name: playerName.substring(0, 18),
            score: numericScore,
            date: new Date().toISOString(),
            id: Date.now() + Math.random(),
            rank: 0
        };
        
        // Update the appropriate scores array
        modeScores[mode].push(newScore);
        
        // Sort and rank
        modeScores[mode].sort((a, b) => b.score - a.score);
        modeScores[mode] = modeScores[mode].slice(0, 15); // Keep top 15
        
        // Update ranks
        modeScores[mode].forEach((score, index) => {
            score.rank = index + 1;
        });
        
        // Update legacy variables for backward compatibility
        if (mode === 'ballGoBoom') {
            ballGoBoomScores = modeScores[mode];
            saveBoomScores(); // Save locally as backup
        } else if (mode === 'original') {
            currentGistScores = modeScores[mode];
        }
        
        // WRITE TO GIST for cross-PC sync
        const success = await writeToGist(modeScores[mode], mode);
        
        const modeDisplayName = mode === 'iceFrost' ? 'Ice Mode' : 
                               mode === 'ballGoBoom' ? 'Ball Go Boom' : 'Original';
        
        if (success) {
            console.log(`✅ ${modeDisplayName} score synced to gist!`);
            showGistSuccessNotification(playerName, numericScore);
        } else {
            console.error(`❌ Failed to write ${modeDisplayName} score to Gist`);
            showGistFailureNotification();
        }
        
        return modeScores[mode];
    }
    
    // Success notification
    function showGistSuccessNotification(name, score) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 25px 35px;
            border-radius: 15px;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            animation: successPulse 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">🌐 SCORE UPLOADED TO GITHUB!</div>
            <div style="font-size: 20px; color: #64ffda; margin-bottom: 10px;">${name} - ${score.toLocaleString()}</div>
            <div style="font-size: 14px; opacity: 0.9;">
                Your score is now visible to all players worldwide!
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
    
    // Failure notification
    function showGistFailureNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            z-index: 10000;
        `;
        notification.textContent = '❌ Failed to upload score to GitHub';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
    
    // Load Ball Go Boom scores from gist on startup
    async function initializeBoomGistSync() {
        console.log('💣 Initializing Ball Go Boom gist sync...');
        try {
            await loadFromGist('ballGoBoom');
            console.log('✅ Ball Go Boom gist sync initialized');
        } catch (error) {
            console.warn('⚠️ Could not load Ball Go Boom scores from gist:', error);
            loadBoomScores(); // Fallback to localStorage
        }
    }
    
    // Override functions
    function overrideFunctions() {
        console.log('✍️ Overriding functions with Gist writer...');
        
        // NO localStorage loading - already loaded from gist in initialize()
        
        // Override addToLeaderboard to write to Gist
        window.addToLeaderboard = async function(playerName, playerScore) {
            const scores = await addScoreAndWrite(playerName, playerScore);
            
            // Update display
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
            }
            
            return scores;
        };
        
        // Override getLeaderboard (Universal for all modes)
        const originalGetLeaderboard = window.getLeaderboard;
        window.getLeaderboard = function() {
            const mode = window.currentGameMode?.id || window.selectedGameMode || localStorage.getItem('ballDefender_selectedMode');
            if (!mode) {
                console.warn('⚠️ No game mode selected, returning empty leaderboard');
                return [];
            }
            
            // Initialize mode if it doesn't exist
            initializeMode(mode);
            
            // Return scores for the current mode
            const scores = getModeScores(mode);
            
            // Update legacy variables for backward compatibility
            if (mode === 'ballGoBoom') {
                ballGoBoomScores = scores;
            } else if (mode === 'original') {
                currentGistScores = scores;
            }
            
            console.log(`📊 Retrieved ${scores.length} scores for ${mode} mode`);
            return scores;
        };
        
        // Enhance refresh button to reload from Gist
        setTimeout(() => {
            const refreshBtn = document.getElementById('leaderboardRefreshBtn');
            if (refreshBtn) {
                const newBtn = refreshBtn.cloneNode(true);
                refreshBtn.parentNode.replaceChild(newBtn, refreshBtn);
                
                newBtn.addEventListener('click', async () => {
                    const mode = window.currentGameMode?.id || window.selectedGameMode || localStorage.getItem('ballDefender_selectedMode');
                    if (!mode) {
                        console.warn('⚠️ No game mode selected, cannot refresh leaderboard');
                        return;
                    }
                    console.log(`🔄 Refresh clicked - loading ${mode} scores from Gist...`);
                    
                    newBtn.innerHTML = '📥 Loading from GitHub...';
                    newBtn.disabled = true;
                    
                    const scores = await loadFromGist(mode);
                    
                    if (scores && scores.length >= 0) { // Allow empty arrays
                        if (window.updateLeaderboardDisplay) {
                            window.updateLeaderboardDisplay();
                        }
                        const modeDisplayName = mode === 'iceFrost' ? 'Ice Mode' : 
                                               mode === 'ballGoBoom' ? 'Ball Go Boom' : 'Original';
                        newBtn.innerHTML = `✅ ${modeDisplayName} Updated!`;
                    } else {
                        newBtn.innerHTML = '❌ Failed';
                    }
                    
                    setTimeout(() => {
                        newBtn.innerHTML = '🔄 Refresh Scores';
                        newBtn.disabled = false;
                    }, 2000);
                });
                
                console.log('✅ Refresh button now loads from Gist');
            }
        }, 2000);
        
        console.log('✅ Functions overridden with Gist writer');
    }
    
    // Initialize
    async function initialize() {
        console.log('✍️ Initializing Working Gist Writer...');
        
        // Wait for DOM
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // NO localStorage loading - gist only!
        console.log('📥 Loading scores from GitHub Gist only...');
        
        // Load all mode scores from gist
        try {
            await loadFromGist('original');
            console.log('✅ Loaded original mode scores from gist');
        } catch (e) {
            console.log('⚠️ Could not load original scores from gist');
        }
        
        try {
            await loadFromGist('ballGoBoom');
            console.log('✅ Loaded ballGoBoom mode scores from gist');
        } catch (e) {
            console.log('⚠️ Could not load ballGoBoom scores from gist');
        }
        
        try {
            await loadFromGist('iceFrost');
            console.log('✅ Loaded iceFrost mode scores from gist');
        } catch (e) {
            console.log('⚠️ Could not load iceFrost scores from gist');
        }
        
        // Override functions
        overrideFunctions();
        
        // Update display
        if (window.updateLeaderboardDisplay) {
            window.updateLeaderboardDisplay();
        }
        
        console.log('✅ Working Gist Writer ready!');
        console.log('🌐 All mode scores loaded from GitHub Gist');
    }
    
    // Test function
    window.testGistWrite = async function() {
        console.log('🧪 Testing Gist write with token...');
        
        const testScore = {
            name: "TEST_WRITE",
            score: 99999,
            date: new Date().toISOString(),
            id: Date.now(),
            rank: 1
        };
        
        const success = await writeToGist([testScore]);
        
        if (success) {
            console.log('✅ TEST SUCCESSFUL: Can write to Gist!');
        } else {
            console.log('❌ TEST FAILED: Cannot write to Gist');
        }
    };
    
    // Reload all scores from localStorage (call this when starting new game)
    function reloadLocalScores() {
        loadOriginalScores();
        loadBoomScores();
        // Load ice mode scores
        try {
            const stored = localStorage.getItem('ballDefender_iceFrost_Leaderboard');
            if (stored) {
                modeScores['iceFrost'] = JSON.parse(stored).filter(s => typeof s.score === 'number');
                console.log(`❄️ Reloaded ${modeScores['iceFrost'].length} Ice mode scores`);
            }
        } catch (e) {
            modeScores['iceFrost'] = [];
        }
        console.log('🔄 Reloaded all scores from localStorage');
    }

    // Expose core functions globally
    window.loadFromGist = loadFromGist;
    window.writeToGist = writeToGist;
    window.initializeMode = initializeMode;
    window.reloadLocalScores = reloadLocalScores;

    // Expose mode score functions globally for leaderboard integration
    window.getModeScores = getModeScores;
    window.getAllModeScores = function() {
        return modeScores;
    };
    
    // Create ModeLeaderboardManager compatibility layer
    window.ModeLeaderboardManager = {
        getLeaderboard: async function(modeId) {
            console.log(`📊 ModeLeaderboardManager.getLeaderboard(${modeId})`);
            const scores = await loadFromGist(modeId);
            
            // Update the current mode's leaderboard display
            if (window.updateLeaderboardDisplay) {
                setTimeout(() => window.updateLeaderboardDisplay(), 100);
            }
            
            return scores;
        },
        
        updateDisplay: function(modeId) {
            console.log(`🖥️ ModeLeaderboardManager.updateDisplay(${modeId})`);
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
            }
        },
        
        clearCache: function(modeId) {
            console.log(`🗑️ ModeLeaderboardManager.clearCache(${modeId})`);
            // Clear any cached data for the mode
            if (modeScores[modeId]) {
                // Don't actually clear, just log
                console.log(`Cache would be cleared for ${modeId} (${modeScores[modeId].length} scores)`);
            }
        },
        
        saveLeaderboard: async function(modeId, scores) {
            console.log(`💾 ModeLeaderboardManager.saveLeaderboard(${modeId}, ${scores.length} scores)`);
            return await writeToGist(scores, modeId);
        }
    };
    
    // Debug function
    window.debugGistWriter = function() {
        console.log('✍️ GIST WRITER DEBUG:');
        console.log('  Gist ID:', GIST_CONFIG.gistId);
        console.log('  Token:', GIST_CONFIG.token.substring(0, 10) + '...');
        console.log('  Current Gist scores:', currentGistScores.length);
        console.log('  Top 3:', currentGistScores.slice(0, 3));
        console.log('  Mode scores:', modeScores);
    };
    
    // Start
    initialize();
    
    console.log('✍️ Working Gist Writer ready!');
    console.log('💡 Type testGistWrite() to test writing to Gist');
    console.log('💡 Type debugGistWriter() to check status');
    
})();