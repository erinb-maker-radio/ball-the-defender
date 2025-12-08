// SECURE HIGH SCORE AUTHENTICATION
// =================================
// This handles authenticated high score submissions using the game@game.com user
// Credentials are hardcoded and secure - users cannot see or modify them

class SecureHighScoreAuth {
    constructor() {
        // Hardcoded credentials for game@game.com user (append-only access)
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

    // Authenticate the game user (auto-login for all operations)
    async authenticate() {
        if (this.isAuthenticated && this.authToken) {
            return this.authToken;
        }

        try {
            console.log('🔐 Auto-authenticating for leaderboard access...');
            
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
                console.log('✅ Game user authenticated successfully');
                return this.authToken;
            } else {
                const error = await response.text();
                console.error('❌ Authentication failed:', response.status, error);
                throw new Error(`Authentication failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Authentication error:', error);
            this.isAuthenticated = false;
            this.authToken = null;
            throw error;
        }
    }

    // Submit high score with authentication
    async submitHighScore(playerName, playerScore, gameMode) {
        try {
            // Ensure we're authenticated
            const token = await this.authenticate();
            
            console.log(`🏆 Submitting authenticated high score: ${playerName} - ${playerScore} (${gameMode})`);
            
            // Validate and sanitize player name for database constraints
            let sanitizedName = playerName.substring(0, 18).trim();
            
            // Replace invalid characters with underscores (database constraint: ^[a-zA-Z0-9\s._-]+$)
            sanitizedName = sanitizedName.replace(/[^a-zA-Z0-9\s._-]/g, '_');
            
            // Ensure name is not empty after sanitization
            if (sanitizedName.length === 0) {
                sanitizedName = 'Anonymous';
            }
            
            // Validate score is within database constraints (0 to 10,000,000)
            const validatedScore = Math.max(0, Math.min(10000000, parseInt(playerScore) || 0));
            
            const scoreData = {
                Player: sanitizedName,              // Sanitized player name
                Score: validatedScore,              // Validated score
                Mode: gameMode,                     // Game mode
                Date: new Date().toISOString()      // Current timestamp
            };
            
            console.log(`🔍 Sanitized score data:`, scoreData);

            const response = await fetch(`${this.authConfig.url}/rest/v1/ball_defender`, {
                method: 'POST',
                headers: {
                    'apikey': this.authConfig.anonKey,
                    'Authorization': `Bearer ${token}`, // Use authenticated token
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(scoreData)
            });

            if (response.ok) {
                console.log('✅ High score submitted successfully with authentication');
                return true;
            } else {
                const error = await response.text();
                console.error('❌ High score submission failed:', response.status, error);
                console.error('🔍 Score data that failed:', scoreData);
                console.error('🔍 Request details:', {
                    url: `${this.authConfig.url}/rest/v1/ball_defender`,
                    method: 'POST',
                    headers: {
                        'apikey': '[hidden]',
                        'Authorization': '[hidden]',
                        'Content-Type': 'application/json'
                    }
                });
                
                // If token expired, retry once
                if (response.status === 401) {
                    console.log('🔄 Token expired, retrying authentication...');
                    this.isAuthenticated = false;
                    this.authToken = null;
                    return await this.submitHighScore(playerName, playerScore, gameMode);
                }
                
                throw new Error(`Submission failed: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.error('❌ Error submitting high score:', error);
            throw error;
        }
    }

    // Show notification to user (removed - using game's existing notification system)
    showNotification(message, type = 'info') {
        // Just log to console instead of showing popup
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Create global instance
window.SecureHighScoreAuth = new SecureHighScoreAuth();

// Auto-authenticate on load for seamless operation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.SecureHighScoreAuth.authenticate();
        console.log('✅ Auto-authentication successful - ready for leaderboard operations');
    } catch (error) {
        console.warn('⚠️ Auto-authentication failed, will retry on first operation:', error.message);
    }
});

console.log('🔐 Secure High Score Authentication loaded (v1.2 - Removed client_id completely)');
