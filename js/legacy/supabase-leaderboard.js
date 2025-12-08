// Supabase-Based Leaderboard System
// Replaces local storage with cloud-based append-only leaderboard
// All players see the same real-time leaderboard

(function() {
    console.log('☁️ Supabase Leaderboard System Loading...');
    
    // Supabase configuration
    const SUPABASE_CONFIG = {
        url: 'https://bxhcbyypjfzpuxhftppv.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGNieXlwamZ6cHV4aGZ0cHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM4MTIsImV4cCI6MjA3MTQ2OTgxMn0.cOakT3KAfQiegW9YuAoS6pXXeo9u5C-xpriWVqLPpGs',
        tableName: 'ball_defender'
    };
    
    // Simple Supabase client (no external dependencies)
    const SupabaseClient = {
        async request(endpoint, options = {}) {
            const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
            const headers = {
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
                ...options.headers
            };
            
            try {
                const response = await fetch(url, {
                    ...options,
                    headers
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Supabase error ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                return { data, error: null };
            } catch (error) {
                console.error('Supabase request failed:', error);
                return { data: null, error: error.message };
            }
        },
        
        async select(table, options = {}) {
            let endpoint = table;
            const params = new URLSearchParams();
            
            if (options.select) {
                params.append('select', options.select);
            }
            
            if (options.order) {
                params.append('order', options.order);
            }
            
            if (options.limit) {
                params.append('limit', options.limit);
            }
            
            if (options.eq) {
                Object.entries(options.eq).forEach(([key, value]) => {
                    params.append(`${key}`, `eq.${value}`);
                });
            }
            
            if (params.toString()) {
                endpoint += '?' + params.toString();
            }
            
            return this.request(endpoint);
        },
        
        async insert(table, data) {
            return this.request(table, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        async rpc(functionName, params = {}) {
            return this.request(`rpc/${functionName}`, {
                method: 'POST',
                body: JSON.stringify(params)
            });
        }
    };
    
    // Score validation (same as before)
    const ScoreValidator = {
        isValidPlayerName(name) {
            if (!name || typeof name !== 'string') return false;
            if (name.length < 1 || name.length > 20) return false;
            const validNameRegex = /^[a-zA-Z0-9\s._-]+$/;
            return validNameRegex.test(name.trim());
        },
        
        isValidScore(score) {
            if (typeof score !== 'number') return false;
            if (!Number.isInteger(score)) return false;
            if (score < 0 || score > 10000000) return false;
            return true;
        },
        
        sanitizeName(name) {
            return name.trim().substring(0, 20);
        }
    };
    
    // Main Supabase leaderboard interface
    const SupabaseLeaderboard = {
        async addScore(playerName, score, gameMode = 'original') {
            console.log(`🏆 Adding score to Supabase: ${playerName} - ${score} (${gameMode})`);
            
            const sanitizedName = ScoreValidator.sanitizeName(playerName);
            
            if (!ScoreValidator.isValidPlayerName(sanitizedName)) {
                console.warn('❌ Invalid player name:', playerName);
                this.showErrorNotification('Invalid player name');
                return false;
            }
            
            if (!ScoreValidator.isValidScore(score)) {
                console.warn('❌ Invalid score:', score);
                this.showErrorNotification('Invalid score');
                return false;
            }
            
            try {
                const scoreData = {
                    Player: sanitizedName,
                    Score: score,
                    Mode: gameMode,
                    Date: new Date().toISOString()
                };
                
                const { data, error } = await SupabaseClient.insert(SUPABASE_CONFIG.tableName, scoreData);
                
                if (error) {
                    console.error('❌ Failed to save score to Supabase:', error);
                    this.showErrorNotification('Failed to save score');
                    return false;
                }
                
                console.log('✅ Score saved to Supabase:', data);
                this.showSuccessNotification(sanitizedName, score);
                
                // Update display
                this.updateDisplay();
                
                return true;
                
            } catch (error) {
                console.error('❌ Error saving score:', error);
                this.showErrorNotification('Network error');
                return false;
            }
        },
        
        async getLeaderboard(gameMode = 'original', limit = 15) {
            try {
                console.log(`📊 Loading leaderboard from Supabase: ${gameMode}`);
                
                const { data, error } = await SupabaseClient.select(SUPABASE_CONFIG.tableName, {
                    select: '*',
                    order: 'Score.desc,Date.asc',
                    limit: limit,
                    eq: gameMode !== 'all' ? { Mode: gameMode } : undefined
                });
                
                if (error) {
                    console.error('❌ Failed to load leaderboard:', error);
                    return [];
                }
                
                console.log(`✅ Loaded ${data?.length || 0} scores from Supabase`);
                return data || [];
                
            } catch (error) {
                console.error('❌ Error loading leaderboard:', error);
                return [];
            }
        },
        
        async getAllScores(limit = 100) {
            try {
                const { data, error } = await SupabaseClient.select(SUPABASE_CONFIG.tableName, {
                    select: '*',
                    order: 'Score.desc,Date.asc',
                    limit: limit
                });
                
                if (error) {
                    console.error('❌ Failed to load all scores:', error);
                    return [];
                }
                
                return data || [];
                
            } catch (error) {
                console.error('❌ Error loading all scores:', error);
                return [];
            }
        },
        
        async getStats() {
            try {
                const { data, error } = await SupabaseClient.select(SUPABASE_CONFIG.tableName, {
                    select: '*'
                });
                
                if (error) {
                    console.error('❌ Failed to load stats:', error);
                    return { total_scores: 0, unique_players: 0, game_modes: 0, highest_score: 0 };
                }
                
                // Calculate stats from data
                const stats = {
                    total_scores: data.length,
                    unique_players: new Set(data.map(s => s.Player)).size,
                    game_modes: new Set(data.map(s => s.Mode)).size,
                    highest_score: Math.max(...data.map(s => s.Score), 0)
                };
                
                return stats;
                
            } catch (error) {
                console.error('❌ Error loading stats:', error);
                return { total_scores: 0, unique_players: 0, game_modes: 0, highest_score: 0 };
            }
        },
        
        async exportToCSV() {
            try {
                const scores = await this.getAllScores(1000);
                let csvContent = 'Rank,Player,Score,Mode,Date,ID\n';
                
                scores.forEach((score, index) => {
                    const date = new Date(score.Date).toISOString();
                    csvContent += `${index + 1},"${score.Player}",${score.Score},"${score.Mode}","${date}","${score.gameid}"\n`;
                });
                
                // Download CSV
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `ball-defender-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                console.log('📁 CSV file downloaded');
                return true;
                
            } catch (error) {
                console.error('❌ Error exporting CSV:', error);
                return false;
            }
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
                animation: scoreSuccess 0.5s ease-out;
            `;
            
            notification.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">☁️ SCORE SAVED TO CLOUD!</div>
                <div style="font-size: 20px; color: #64ffda; margin-bottom: 10px;">${name} - ${score.toLocaleString()}</div>
                <div style="font-size: 14px; opacity: 0.9;">
                    Now visible to all players worldwide!
                </div>
            `;
            
            // Add CSS animation
            if (!document.getElementById('scoreSuccessStyle')) {
                const style = document.createElement('style');
                style.id = 'scoreSuccessStyle';
                style.textContent = `
                    @keyframes scoreSuccess {
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
            }, 4000);
        },
        
        showErrorNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10000;
            `;
            
            notification.innerHTML = `❌ ${message}`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 3000);
        }
    };
    
    // Override existing leaderboard functions to use Supabase
    function overrideGameFunctions() {
        console.log('🔄 Overriding game leaderboard functions with Supabase...');
        
        // Override addToLeaderboard
        window.addToLeaderboard = async function(playerName, playerScore, gameMode = null) {
            const mode = gameMode || window.currentGameMode?.id || window.selectedGameMode || 'original';
            return await SupabaseLeaderboard.addScore(playerName, playerScore, mode);
        };
        
        // Override getLeaderboard - support both sync and async calls
        window.getLeaderboard = function(gameMode = null) {
            const mode = gameMode || window.currentGameMode?.id || window.selectedGameMode || 'original';
            console.log(`🎮 getLeaderboard called for mode: ${mode}`);
            
            // If we have cached scores for this mode, return them immediately
            if (window.cachedLeaderboard && window.cachedLeaderboardMode === mode) {
                console.log(`🎮 Returning cached scores: ${window.cachedLeaderboard.length} scores`);
                return window.cachedLeaderboard;
            }
            
            // Load scores from Supabase asynchronously
            SupabaseLeaderboard.getLeaderboard(mode).then(scores => {
                console.log(`🎮 Retrieved ${scores.length} scores from Supabase for ${mode}`);
                // Cache the scores with the mode
                window.cachedLeaderboard = scores;
                window.cachedLeaderboardMode = mode;
                
                // DON'T call updateLeaderboardDisplay to avoid infinite loop
                // The game will call getLeaderboard again when it needs fresh data
                
            }).catch(error => {
                console.error('🎮 Error loading scores from Supabase:', error);
            });
            
            // Return cached scores if available, empty array if not
            return window.cachedLeaderboard || [];
        };
        
        // Add new utility functions
        window.exportLeaderboardCSV = function() {
            return SupabaseLeaderboard.exportToCSV();
        };
        
        window.getLeaderboardStats = function() {
            return SupabaseLeaderboard.getStats();
        };
        
        // Real-time leaderboard refresh
        window.refreshLeaderboard = async function() {
            console.log('🔄 Refreshing leaderboard from Supabase...');
            const mode = window.currentGameMode?.id || window.selectedGameMode || 'original';
            const scores = await SupabaseLeaderboard.getLeaderboard(mode);
            
            if (window.updateLeaderboardDisplay) {
                window.updateLeaderboardDisplay();
            }
            
            return scores;
        };
        
        console.log('✅ Game functions overridden with Supabase system');
    }
    
    // Test connection to Supabase
    async function testSupabaseConnection() {
        console.log('🧪 Testing Supabase connection...');
        
        try {
            const { data, error } = await SupabaseClient.select(SUPABASE_CONFIG.tableName, {
                select: 'count',
                limit: 1
            });
            
            if (error) {
                console.error('❌ Supabase connection failed:', error);
                return false;
            }
            
            console.log('✅ Supabase connection successful!');
            return true;
            
        } catch (error) {
            console.error('❌ Supabase connection error:', error);
            return false;
        }
    }
    
    // Initialize the system
    async function initialize() {
        console.log('☁️ Initializing Supabase Leaderboard System...');
        
        // Test connection first
        const connected = await testSupabaseConnection();
        
        if (connected) {
            // Wait for DOM and other scripts to load
            setTimeout(async () => {
                overrideGameFunctions();
                
                // Preload leaderboard data for immediate access
                try {
                    console.log('📊 Preloading leaderboard data...');
                    const scores = await SupabaseLeaderboard.getLeaderboard('original');
                    window.cachedLeaderboard = scores;
                    window.cachedLeaderboardMode = 'original';
                    console.log(`✅ Preloaded ${scores.length} scores for original mode`);
                    
                    // Update display with existing scores
                    SupabaseLeaderboard.updateDisplay();
                } catch (error) {
                    console.error('⚠️ Failed to preload scores:', error);
                }
                
                console.log('✅ Supabase Leaderboard System Ready!');
                
                // Show welcome notification
                setTimeout(showWelcomeNotification, 3000);
                
            }, 2000);
        } else {
            console.error('❌ Failed to connect to Supabase - check configuration');
        }
    }
    
    // Show welcome notification
    function showWelcomeNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 350px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;">☁️ GLOBAL LEADERBOARD ACTIVE!</div>
            <div style="margin-bottom: 10px;">All players now share the same real-time leaderboard!</div>
            <div style="font-size: 12px; opacity: 0.9;">
                ✅ Secure append-only storage<br>
                ✅ Real-time score updates<br>
                ✅ Global competition enabled
            </div>
            <button onclick="this.parentNode.remove()" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid white;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                margin-top: 10px;
                font-family: 'Courier New', monospace;
            ">Got it!</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, 15000);
    }
    
    // Expose the main interface globally
    window.SupabaseLeaderboard = SupabaseLeaderboard;
    window.SupabaseClient = SupabaseClient;
    
    // Debug functions
    window.debugSupabaseLeaderboard = function() {
        console.log('☁️ SUPABASE LEADERBOARD DEBUG:');
        console.log('  URL:', SUPABASE_CONFIG.url);
        console.log('  Table:', SUPABASE_CONFIG.tableName);
        console.log('  Anon key (first 20 chars):', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
    };
    
    window.testSupabaseWrite = async function() {
        console.log('🧪 Testing Supabase write...');
        const result = await SupabaseLeaderboard.addScore('TEST_USER', 99999, 'original');
        if (result) {
            console.log('✅ Write test successful!');
        } else {
            console.log('❌ Write test failed!');
        }
    };
    
    // Start the system
    initialize();
    
    console.log('☁️ Supabase Leaderboard System Loaded!');
    console.log('💡 Features:');
    console.log('  ✅ Real-time global leaderboard');
    console.log('  ✅ Append-only security (anon key safe)');
    console.log('  ✅ Cross-platform score sharing');
    console.log('  ✅ CSV export capability');
    console.log('💡 Type debugSupabaseLeaderboard() for system info');
    console.log('💡 Type testSupabaseWrite() to test score submission');
    
})();
