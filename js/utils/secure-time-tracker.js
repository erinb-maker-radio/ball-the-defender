// SECURE TIME TRACKING (COPYING EXACT HIGHSCORE PATTERN)
// =======================================================
// This copies the exact same working pattern from secure-highscore-auth.js

class SecureTimeTracker {
    constructor() {
        // Same auth config as highscore system (proven to work)
        this.authConfig = {
            url: 'https://bxhcbyypjfzpuxhftppv.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGNieXlwamZ6cHV4aGZ0cHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM4MTIsImV4cCI6MjA3MTQ2OTgxMn0.cOakT3KAfQiegW9YuAoS6pXXeo9u5C-xpriWVqLPpGs',
            gameUser: {
                email: 'game@game.com',
                password: 'test123'
            }
        };
        this.authToken = null;
        this.isAuthenticated = false;
    }

    // EXACT COPY of authenticate() from highscore system
    async authenticate() {
        if (this.isAuthenticated && this.authToken) {
            return this.authToken;
        }

        try {
            console.log('🔐 Auto-authenticating for time tracking...');
            
            const response = await fetch(`${this.authConfig.url}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'apikey': this.authConfig.anonKey,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authConfig.anonKey}`
                },
                body: JSON.stringify({
                    email: this.authConfig.gameUser.email,
                    password: this.authConfig.gameUser.password
                })
            });

            if (response.ok) {
                const authData = await response.json();
                this.authToken = authData.access_token;
                this.isAuthenticated = true;
                console.log('✅ Game user authenticated for time tracking');
                return this.authToken;
            } else {
                const error = await response.text();
                console.error('❌ Time tracking authentication failed:', response.status, error);
                throw new Error(`Authentication failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Time tracking authentication error:', error);
            this.isAuthenticated = false;
            this.authToken = null;
            throw error;
        }
    }

    // Submit session (copying exact pattern from submitHighScore)
    async submitSession(sessionDurationMs, gameMode = 'original', sessionData = {}) {
        try {
            // Ensure we're authenticated (same as highscore)
            const token = await this.authenticate();
            
            console.log(`⏱️ Submitting authenticated session: ${sessionDurationMs}ms (${gameMode})`);
            
            // Validate and sanitize data (same pattern as highscore)
            const validatedDuration = Math.max(0, Math.min(86400000, parseInt(sessionDurationMs) || 0)); // Max 24 hours
            const sanitizedMode = gameMode.substring(0, 50).trim().replace(/[^a-zA-Z0-9\s._-]/g, '_') || 'original';
            
            const sessionRecord = {
                session_duration_ms: validatedDuration,
                game_mode: sanitizedMode,
                session_data: sessionData,
                client_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Same pattern as highscore
            };
            
            console.log(`🔍 Session data:`, sessionRecord);

            // EXACT SAME fetch pattern as highscore system
            const response = await fetch(`${this.authConfig.url}/rest/v1/ball_defender_sessions`, {
                method: 'POST',
                headers: {
                    'apikey': this.authConfig.anonKey,
                    'Authorization': `Bearer ${token}`, // Use authenticated token
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(sessionRecord)
            });

            if (response.ok) {
                console.log('✅ Session submitted successfully with authentication');
                return true;
            } else {
                const error = await response.text();
                console.error('❌ Session submission failed:', response.status, error);
                console.error('🔍 Session data that failed:', sessionRecord);
                
                // Same retry logic as highscore system
                if (response.status === 401) {
                    console.log('🔄 Token expired, retrying authentication...');
                    this.isAuthenticated = false;
                    this.authToken = null;
                    return await this.submitSession(sessionDurationMs, gameMode, sessionData);
                }
                
                throw new Error(`Session submission failed: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.error('❌ Error submitting session:', error);
            throw error;
        }
    }

    // Get global stats (using view - same pattern as reading leaderboard)
    async getGlobalStats() {
        try {
            console.log('📊 Loading global time stats...');
            
            // Try direct view access first (no auth needed, like leaderboard)
            const response = await fetch(`${this.authConfig.url}/rest/v1/ball_defender_global_stats`, {
                headers: {
                    'apikey': this.authConfig.anonKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Global stats loaded from view');
                return data[0] || {
                    total_sessions: 0,
                    total_time_played_ms: 0,
                    average_session_ms: 0
                };
            } else {
                // Fallback to RPC function (same as highscore fallbacks)
                console.log('📊 Trying RPC function fallback...');
                const rpcResponse = await fetch(`${this.authConfig.url}/rest/v1/rpc/get_global_time_stats`, {
                    method: 'POST',
                    headers: {
                        'apikey': this.authConfig.anonKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                if (rpcResponse.ok) {
                    const rpcData = await rpcResponse.json();
                    console.log('✅ Global stats loaded from RPC');
                    return rpcData;
                } else {
                    throw new Error(`Failed to load stats: ${rpcResponse.status}`);
                }
            }
        } catch (error) {
            console.error('❌ Error loading global stats:', error);
            return {
                total_sessions: 0,
                total_time_played_ms: 0,
                average_session_ms: 0
            };
        }
    }
}

// Create global instance (same as highscore)
window.SecureTimeTracker = new SecureTimeTracker();

// Auto-authenticate on load (same as highscore)
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.SecureTimeTracker.authenticate();
        console.log('✅ Time tracking auto-authentication successful');
    } catch (error) {
        console.warn('⚠️ Time tracking auto-authentication failed, will retry on first operation:', error.message);
    }
});

console.log('⏱️ Secure Time Tracker loaded (copying exact highscore pattern)');
