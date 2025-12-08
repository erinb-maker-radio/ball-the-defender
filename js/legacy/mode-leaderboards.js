// Mode-Specific Leaderboards - Separate leaderboards for each game mode
(function() {
    console.log('📊 Mode-Specific Leaderboards Loading...');
    
    // Store original functions
    let originalGetLeaderboard = null;
    let originalSaveLeaderboard = null;
    let originalAddToLeaderboard = null;
    let originalUpdateLeaderboardDisplay = null;
    
    // Get mode-specific localStorage key
    function getLeaderboardKey() {
        if (!window.currentGameMode) {
            return 'ballDefenderGlobalLeaderboard'; // Fallback
        }
        
        const modeId = window.currentGameMode.id;
        return `ballDefender_${modeId}_Leaderboard`;
    }
    
    // Get mode-specific gist filename
    function getGistFileName() {
        if (!window.currentGameMode) {
            return 'ball-defender-leaderboard.json'; // Fallback
        }
        
        const modeId = window.currentGameMode.id;
        return `ball-defender-${modeId}-leaderboard.json`;
    }
    
    // Override getLeaderboard to use mode-specific key
    function overrideGetLeaderboard() {
        if (window.getLeaderboard) {
            originalGetLeaderboard = window.getLeaderboard;
            
            window.getLeaderboard = function() {
                const key = getLeaderboardKey();
                console.log(`📊 Getting leaderboard for key: ${key}`);
                
                const stored = localStorage.getItem(key);
                if (stored) {
                    try {
                        const leaderboard = JSON.parse(stored);
                        window.currentLeaderboard = leaderboard;
                        return leaderboard;
                    } catch (e) {
                        console.error('Error parsing leaderboard:', e);
                    }
                }
                
                // Return empty leaderboard
                const emptyLeaderboard = [];
                window.currentLeaderboard = emptyLeaderboard;
                return emptyLeaderboard;
            };
            
            console.log('✅ getLeaderboard overridden for mode-specific storage');
        }
    }
    
    // Override saveLeaderboard to use mode-specific key
    function overrideSaveLeaderboard() {
        if (window.saveLeaderboard) {
            originalSaveLeaderboard = window.saveLeaderboard;
            
            window.saveLeaderboard = function(leaderboard) {
                const key = getLeaderboardKey();
                console.log(`📊 Saving leaderboard to key: ${key}`);
                
                localStorage.setItem(key, JSON.stringify(leaderboard));
                window.currentLeaderboard = leaderboard;
                
                // Also trigger online save if available
                if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
                    console.log('📊 Triggering mode-specific online sync...');
                    window.OnlineLeaderboard.mergeAndSync({
                        name: leaderboard[leaderboard.length - 1]?.name,
                        score: leaderboard[leaderboard.length - 1]?.score
                    });
                }
            };
            
            console.log('✅ saveLeaderboard overridden for mode-specific storage');
        }
    }
    
    // Override OnlineLeaderboard for mode-specific gist files
    function overrideOnlineLeaderboard() {
        const checkInterval = setInterval(() => {
            if (window.OnlineLeaderboard && window.AutoGistSync) {
                // Store original AutoGistSync functions
                const originalLoadFromGist = window.AutoGistSync.loadFromGist;
                const originalSaveToGist = window.AutoGistSync.saveToGist;
                
                // Override loadFromGist
                window.AutoGistSync.loadFromGist = async function() {
                    console.log('📊 Loading mode-specific gist data...');
                    
                    const fileName = getGistFileName();
                    const gistId = '40398c32fa6fac004a52ea22d2612d23';
                    const token = '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';
                    
                    try {
                        // First, get the gist to see what files exist
                        const gistResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
                            headers: {
                                'Authorization': `token ${token}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });
                        
                        if (gistResponse.ok) {
                            const gistData = await gistResponse.json();
                            
                            // Check if mode-specific file exists
                            if (gistData.files[fileName]) {
                                const content = gistData.files[fileName].content;
                                const data = JSON.parse(content);
                                console.log(`✅ Loaded ${data.leaderboard?.length || 0} scores from ${fileName}`);
                                return data.leaderboard || [];
                            } else {
                                console.log(`📊 Mode file ${fileName} doesn't exist yet, returning empty`);
                                return [];
                            }
                        }
                    } catch (error) {
                        console.error('Error loading mode-specific gist:', error);
                    }
                    
                    // Fallback to localStorage
                    const key = getLeaderboardKey();
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const scores = JSON.parse(stored);
                        console.log(`📊 Fallback to localStorage: ${scores.length} scores`);
                        return scores;
                    }
                    
                    return [];
                };
                
                // Override saveToGist
                window.AutoGistSync.saveToGist = async function(leaderboard) {
                    console.log('📊 Saving mode-specific gist data...');
                    
                    const fileName = getGistFileName();
                    const gistId = '40398c32fa6fac004a52ea22d2612d23';
                    const token = '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';
                    
                    const gistData = {
                        leaderboard: leaderboard,
                        lastUpdated: new Date().toISOString(),
                        version: Date.now(),
                        gameMode: window.currentGameMode?.id || 'unknown'
                    };
                    
                    const updatePayload = {
                        files: {
                            [fileName]: {
                                content: JSON.stringify(gistData, null, 2)
                            }
                        }
                    };
                    
                    try {
                        console.log(`🌐 Updating gist file: ${fileName}`);
                        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `token ${token}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/vnd.github.v3+json'
                            },
                            body: JSON.stringify(updatePayload)
                        });
                        
                        if (response.ok) {
                            console.log(`✅ Mode-specific gist ${fileName} updated successfully!`);
                            
                            // Also save to localStorage
                            const key = getLeaderboardKey();
                            localStorage.setItem(key, JSON.stringify(leaderboard));
                            
                            return true;
                        } else {
                            const error = await response.text();
                            console.error(`❌ Failed to update mode gist: ${response.status} ${error}`);
                            
                            // Save to localStorage as fallback
                            const key = getLeaderboardKey();
                            localStorage.setItem(key, JSON.stringify(leaderboard));
                            return false;
                        }
                    } catch (error) {
                        console.error('❌ Error saving mode-specific gist:', error);
                        
                        // Save to localStorage as fallback
                        const key = getLeaderboardKey();
                        localStorage.setItem(key, JSON.stringify(leaderboard));
                        return false;
                    }
                };
                
                clearInterval(checkInterval);
                console.log('✅ Online leaderboard overridden for mode-specific storage');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Override updateLeaderboardDisplay to show mode name
    function overrideUpdateLeaderboardDisplay() {
        const checkInterval = setInterval(() => {
            if (window.updateLeaderboardDisplay) {
                originalUpdateLeaderboardDisplay = window.updateLeaderboardDisplay;
                
                window.updateLeaderboardDisplay = function() {
                    // Call original function
                    const result = originalUpdateLeaderboardDisplay.call(this);
                    
                    // Add mode indicator to leaderboard header
                    if (window.currentGameMode) {
                        const headerElement = document.querySelector('.arcade-header');
                        if (headerElement) {
                            const modeName = window.currentGameMode.name;
                            const modeColor = window.currentGameMode.colors?.text || '#64ffda';
                            
                            if (!headerElement.querySelector('.mode-indicator')) {
                                const modeIndicator = document.createElement('div');
                                modeIndicator.className = 'mode-indicator';
                                modeIndicator.style.cssText = `
                                    font-size: 14px;
                                    color: ${modeColor};
                                    margin-top: 5px;
                                    text-shadow: 0 0 10px ${modeColor};
                                `;
                                headerElement.appendChild(modeIndicator);
                            }
                            
                            const indicator = headerElement.querySelector('.mode-indicator');
                            if (indicator) {
                                indicator.textContent = `[ ${modeName.toUpperCase()} MODE ]`;
                                indicator.style.color = modeColor;
                                indicator.style.textShadow = `0 0 10px ${modeColor}`;
                            }
                        }
                    }
                    
                    return result;
                };
                
                clearInterval(checkInterval);
                console.log('✅ updateLeaderboardDisplay overridden to show mode');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Refresh leaderboard when mode changes
    window.refreshModeLeaderboard = function() {
        console.log('📊 Refreshing mode-specific leaderboard...');
        
        // Clear current leaderboard
        window.currentLeaderboard = null;
        
        // Get fresh leaderboard for current mode
        if (window.getLeaderboard) {
            window.getLeaderboard();
        }
        
        // Update display
        if (window.updateLeaderboardDisplay) {
            window.updateLeaderboardDisplay();
        }
        
        // Sync from online if available
        if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
            window.OnlineLeaderboard.mergeAndSync().then(() => {
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
            });
        }
        
        console.log('✅ Mode leaderboard refreshed');
    };
    
    // Hook into game mode changes
    function hookModeChanges() {
        // Store original startGame if it exists
        const checkInterval = setInterval(() => {
            if (window.startGame) {
                const originalStartGame = window.startGame;
                
                window.startGame = function(mode) {
                    console.log(`📊 Mode changed to: ${mode}`);
                    
                    // Call original function
                    const result = originalStartGame.call(this, mode);
                    
                    // Refresh leaderboard for new mode
                    setTimeout(() => {
                        window.refreshModeLeaderboard();
                    }, 500);
                    
                    return result;
                };
                
                clearInterval(checkInterval);
                console.log('✅ Mode change hook installed');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Initialize
    function initialize() {
        console.log('📊 Initializing Mode-Specific Leaderboards...');
        
        overrideGetLeaderboard();
        overrideSaveLeaderboard();
        overrideOnlineLeaderboard();
        overrideUpdateLeaderboardDisplay();
        hookModeChanges();
        
        console.log('📊 Mode-Specific Leaderboards initialized');
    }
    
    // Start after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 500);
        });
    } else {
        setTimeout(initialize, 500);
    }
    
    console.log('📊 Mode-Specific Leaderboards ready');
    console.log('💡 Each game mode now has its own leaderboard!');
    
})();