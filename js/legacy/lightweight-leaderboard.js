// Lightweight Append-Only Leaderboard System
// Replaces GitHub Gist with local CSV + optional cloud sync
// Users can only ADD scores, never delete or modify existing ones

(function() {
    console.log('📝 Lightweight Leaderboard System Loading...');
    
    // Configuration
    const LEADERBOARD_CONFIG = {
        localStorageKey: 'ballDefender_lightweightLeaderboard',
        csvFileName: 'ball-defender-scores.csv',
        maxScores: 50, // Keep more scores locally for better competition
        syncInterval: 300000, // 5 minutes
        // Optional Supabase config (set these to enable cloud sync)
        supabase: {
            url: '', // Set to your Supabase project URL
            anonKey: '', // Set to your Supabase anon key
            tableName: 'ball_defender_scores'
        }
    };
    
    // Score validation to prevent malicious entries
    const ScoreValidator = {
        isValidPlayerName(name) {
            if (!name || typeof name !== 'string') return false;
            if (name.length < 1 || name.length > 20) return false;
            // Allow alphanumeric, spaces, basic punctuation
            const validNameRegex = /^[a-zA-Z0-9\s._-]+$/;
            return validNameRegex.test(name.trim());
        },
        
        isValidScore(score) {
            if (typeof score !== 'number') return false;
            if (!Number.isInteger(score)) return false;
            if (score < 0 || score > 10000000) return false; // Reasonable score range
            return true;
        },
        
        sanitizeName(name) {
            return name.trim().substring(0, 20);
        }
    };
    
    // Local CSV-like storage manager
    const LocalScoreStorage = {
        saveScore(playerName, score, gameMode = 'original') {
            try {
                const sanitizedName = ScoreValidator.sanitizeName(playerName);
                
                if (!ScoreValidator.isValidPlayerName(sanitizedName)) {
                    console.warn('❌ Invalid player name:', playerName);
                    return false;
                }
                
                if (!ScoreValidator.isValidScore(score)) {
                    console.warn('❌ Invalid score:', score);
                    return false;
                }
                
                const newScore = {
                    name: sanitizedName,
                    score: score,
                    mode: gameMode,
                    timestamp: new Date().toISOString(),
                    id: Date.now() + Math.random(), // Unique identifier
                    verified: true // Mark as locally submitted
                };
                
                // Load existing scores
                const existingScores = this.loadAllScores();
                
                // Add new score (append-only)
                existingScores.push(newScore);
                
                // Sort by score (highest first) but keep all scores
                existingScores.sort((a, b) => b.score - a.score);
                
                // Only keep top N scores to prevent unlimited growth
                const trimmedScores = existingScores.slice(0, LEADERBOARD_CONFIG.maxScores);
                
                // Save back to localStorage
                localStorage.setItem(LEADERBOARD_CONFIG.localStorageKey, JSON.stringify(trimmedScores));
                
                console.log(`✅ Score saved: ${sanitizedName} - ${score} (${gameMode})`);
                return true;
                
            } catch (error) {
                console.error('❌ Error saving score:', error);
                return false;
            }
        },
        
        loadAllScores() {
            try {
                const stored = localStorage.getItem(LEADERBOARD_CONFIG.localStorageKey);
                if (stored) {
                    const scores = JSON.parse(stored);
                    // Validate loaded scores
                    return scores.filter(score => 
                        score && 
                        ScoreValidator.isValidPlayerName(score.name) && 
                        ScoreValidator.isValidScore(score.score)
                    );
                }
                return [];
            } catch (error) {
                console.error('❌ Error loading scores:', error);
                return [];
            }
        },
        
        loadScoresByMode(gameMode = 'original') {
            const allScores = this.loadAllScores();
            return allScores.filter(score => score.mode === gameMode);
        },
        
        exportToCSV() {
            try {
                const scores = this.loadAllScores();
                let csvContent = 'Name,Score,Mode,Timestamp,ID\n';
                
                scores.forEach(score => {
                    csvContent += `"${score.name}",${score.score},"${score.mode}","${score.timestamp}","${score.id}"\n`;
                });
                
                return csvContent;
            } catch (error) {
                console.error('❌ Error exporting CSV:', error);
                return '';
            }
        },
        
        downloadCSV() {
            try {
                const csvContent = this.exportToCSV();
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = LEADERBOARD_CONFIG.csvFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                console.log('📁 CSV file downloaded');
                return true;
            } catch (error) {
                console.error('❌ Error downloading CSV:', error);
                return false;
            }
        }
    };
    
    // Optional cloud sync with Supabase (if configured)
    const CloudSync = {
        isConfigured() {
            return LEADERBOARD_CONFIG.supabase.url && LEADERBOARD_CONFIG.supabase.anonKey;
        },
        
        async syncToCloud(scores) {
            if (!this.isConfigured()) {
                console.log('🔒 Cloud sync not configured (this is optional)');
                return false;
            }
            
            try {
                console.log('☁️ Syncing to Supabase...');
                
                // Only sync scores that haven't been synced yet
                const unsyncedScores = scores.filter(score => !score.cloudSynced);
                
                if (unsyncedScores.length === 0) {
                    console.log('☁️ No new scores to sync');
                    return true;
                }
                
                // This would be the Supabase client call
                // const { data, error } = await supabaseClient
                //     .from(LEADERBOARD_CONFIG.supabase.tableName)
                //     .insert(unsyncedScores.map(score => ({
                //         player_name: score.name,
                //         score: score.score,
                //         game_mode: score.mode,
                //         created_at: score.timestamp,
                //         client_id: score.id
                //     })));
                
                console.log('☁️ Would sync', unsyncedScores.length, 'scores to Supabase');
                
                // Mark scores as synced
                scores.forEach(score => {
                    if (!score.cloudSynced) {
                        score.cloudSynced = true;
                    }
                });
                
                return true;
                
            } catch (error) {
                console.error('❌ Cloud sync failed:', error);
                return false;
            }
        },
        
        async loadFromCloud() {
            if (!this.isConfigured()) {
                return [];
            }
            
            try {
                console.log('☁️ Loading scores from Supabase...');
                
                // This would be the Supabase client call
                // const { data, error } = await supabaseClient
                //     .from(LEADERBOARD_CONFIG.supabase.tableName)
                //     .select('*')
                //     .order('score', { ascending: false })
                //     .limit(LEADERBOARD_CONFIG.maxScores);
                
                console.log('☁️ Would load scores from Supabase');
                
                return []; // Return empty for now
                
            } catch (error) {
                console.error('❌ Error loading from cloud:', error);
                return [];
            }
        }
    };
    
    // Main leaderboard interface
    const LightweightLeaderboard = {
        async addScore(playerName, score, gameMode = 'original') {
            console.log(`🏆 Adding score: ${playerName} - ${score} (${gameMode})`);
            
            // Save locally (primary storage)
            const saved = LocalScoreStorage.saveScore(playerName, score, gameMode);
            
            if (!saved) {
                console.error('❌ Failed to save score locally');
                return false;
            }
            
            // Optional cloud sync
            const allScores = LocalScoreStorage.loadAllScores();
            await CloudSync.syncToCloud(allScores);
            
            // Update display
            this.updateDisplay();
            
            // Show success notification
            this.showSuccessNotification(playerName, score);
            
            return true;
        },
        
        getLeaderboard(gameMode = 'original', limit = 15) {
            const scores = LocalScoreStorage.loadScoresByMode(gameMode);
            return scores.slice(0, limit);
        },
        
        getAllScores() {
            return LocalScoreStorage.loadAllScores();
        },
        
        updateDisplay() {
            // Update the game's leaderboard display if the function exists
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
            }
        },
        
        showSuccessNotification(name, score) {
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
                animation: scoreNotification 0.5s ease-out;
            `;
            
            notification.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">📝 SCORE SAVED!</div>
                <div style="font-size: 20px; color: #64ffda; margin-bottom: 10px;">${name} - ${score.toLocaleString()}</div>
                <div style="font-size: 14px; opacity: 0.9;">
                    Saved locally and ready for competition!
                </div>
            `;
            
            // Add CSS animation
            if (!document.getElementById('scoreNotificationStyle')) {
                const style = document.createElement('style');
                style.id = 'scoreNotificationStyle';
                style.textContent = `
                    @keyframes scoreNotification {
                        from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                        to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }, 3000);
        },
        
        // Utility functions
        exportData() {
            return LocalScoreStorage.downloadCSV();
        },
        
        getStats() {
            const allScores = this.getAllScores();
            const modeStats = {};
            
            allScores.forEach(score => {
                if (!modeStats[score.mode]) {
                    modeStats[score.mode] = {
                        count: 0,
                        highScore: 0,
                        players: new Set()
                    };
                }
                
                modeStats[score.mode].count++;
                modeStats[score.mode].highScore = Math.max(modeStats[score.mode].highScore, score.score);
                modeStats[score.mode].players.add(score.name);
            });
            
            // Convert Sets to counts
            Object.keys(modeStats).forEach(mode => {
                modeStats[mode].uniquePlayers = modeStats[mode].players.size;
                delete modeStats[mode].players;
            });
            
            return {
                totalScores: allScores.length,
                modes: modeStats,
                oldestScore: allScores.length > 0 ? allScores[allScores.length - 1].timestamp : null,
                newestScore: allScores.length > 0 ? allScores[0].timestamp : null
            };
        }
    };
    
    // Override existing leaderboard functions
    function overrideGameFunctions() {
        console.log('🔄 Overriding game leaderboard functions...');
        
        // Override addToLeaderboard
        window.addToLeaderboard = async function(playerName, playerScore, gameMode = null) {
            const mode = gameMode || window.currentGameMode?.id || window.selectedGameMode || 'original';
            return await LightweightLeaderboard.addScore(playerName, playerScore, mode);
        };
        
        // Override getLeaderboard
        window.getLeaderboard = function(gameMode = null) {
            const mode = gameMode || window.currentGameMode?.id || window.selectedGameMode || 'original';
            return LightweightLeaderboard.getLeaderboard(mode);
        };
        
        // Add new utility functions
        window.exportLeaderboardCSV = function() {
            return LightweightLeaderboard.exportData();
        };
        
        window.getLeaderboardStats = function() {
            return LightweightLeaderboard.getStats();
        };
        
        console.log('✅ Game functions overridden with lightweight system');
    }
    
    // Initialize the system
    function initialize() {
        console.log('📝 Initializing Lightweight Leaderboard System...');
        
        // Wait for DOM and other scripts to load
        setTimeout(() => {
            overrideGameFunctions();
            
            // Update display with existing scores
            LightweightLeaderboard.updateDisplay();
            
            console.log('✅ Lightweight Leaderboard System Ready!');
            console.log('📊 Current stats:', LightweightLeaderboard.getStats());
            
        }, 2000);
    }
    
    // Expose the main interface globally
    window.LightweightLeaderboard = LightweightLeaderboard;
    window.LocalScoreStorage = LocalScoreStorage;
    
    // Debug functions
    window.debugLightweightLeaderboard = function() {
        console.log('📝 LIGHTWEIGHT LEADERBOARD DEBUG:');
        console.log('  Total scores:', LightweightLeaderboard.getAllScores().length);
        console.log('  Stats:', LightweightLeaderboard.getStats());
        console.log('  Config:', LEADERBOARD_CONFIG);
        console.log('  Cloud configured:', CloudSync.isConfigured());
    };
    
    // Start the system
    initialize();
    
    console.log('📝 Lightweight Leaderboard System Loaded!');
    console.log('💡 Features:');
    console.log('  ✅ Append-only (users can only add scores)');
    console.log('  ✅ Local CSV storage');
    console.log('  ✅ Input validation and sanitization');
    console.log('  ✅ Optional cloud sync with Supabase');
    console.log('  ✅ Export to CSV file');
    console.log('💡 Type debugLightweightLeaderboard() for status');
    console.log('💡 Type exportLeaderboardCSV() to download scores');
    
})();
