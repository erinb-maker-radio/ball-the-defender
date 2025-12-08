/**
 * STANDARDIZED MODE LEADERBOARD SYSTEM - SUPABASE EDITION
 * ========================================================
 * 
 * This system provides identical leaderboard behavior for all modes,
 * using Supabase for authenticated cloud storage.
 * 
 * PRINCIPLES:
 * 1. Single implementation for all modes
 * 2. Mode-specific data filtering
 * 3. Consistent data structure  
 * 4. Supabase authentication integration
 * 5. Proper error handling and fallbacks
 */

class ModeLeaderboardManager {
    constructor() {
        this.config = {
            // Supabase configuration
            url: 'https://bxhcbyypjfzpuxhftppv.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGNieXlwamZ6cHV4aGZ0cHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM4MTIsImV4cCI6MjA3MTQ2OTgxMn0.cOakT3KAfQiegW9YuAoS6pXXeo9u5C-xpriWVqLPpGs',
            tableName: 'ball_defender',
            
            // Storage configuration
            storagePrefix: 'ballDefender',
            storageSuffix: 'Leaderboard',
            maxScores: 15,
            
            // Score structure (Supabase format)
            scoreSchema: {
                Player: 'string',    // Supabase field name
                Score: 'number',     // Supabase field name  
                Mode: 'string',      // Supabase field name
                Date: 'string',      // Supabase field name
                client_id: 'string'  // For deduplication
            }
        };
        
        this.cache = new Map(); // Cache for loaded leaderboards
        this.loading = new Map(); // Track loading states
        this.authToken = null;   // Cached authentication token
    }
    
    /**
     * Gets authentication token from SecureHighScoreAuth
     */
    async getAuthToken() {
        if (!window.SecureHighScoreAuth) {
            throw new Error('SecureHighScoreAuth not available');
        }
        
        if (!this.authToken) {
            this.authToken = await window.SecureHighScoreAuth.authenticate();
        }
        
        return this.authToken;
    }
    
    /**
     * Gets the storage key for a specific mode (legacy compatibility)
     */
    getStorageKey(modeId) {
        return `${this.config.storagePrefix}_${modeId}_${this.config.storageSuffix}`;
    }
    
    /**
     * Clear cache for a specific mode
     */
    clearCache(modeId) {
        this.cache.delete(modeId);
        console.log(`🧹 Cleared cache for mode: ${modeId}`);
    }
    
    /**
     * Creates a standardized score object for Supabase
     */
    createScore(name, score, modeId) {
        return {
            Player: String(name).trim().substring(0, 18),  // Supabase field name
            Score: Number(score),                          // Supabase field name
            Mode: modeId,                                  // Supabase field name
            Date: new Date().toISOString(),                // Supabase field name
            client_id: this.generateScoreId()              // For deduplication
        };
    }
    
    /**
     * Generates a unique client ID for a score
     */
    generateScoreId() {
        return `mode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Validates a score object for Supabase format
     */
    validateScore(score) {
        const schema = this.config.scoreSchema;
        
        for (const [field, expectedType] of Object.entries(schema)) {
            if (!(field in score)) {
                throw new Error(`Score missing required field: ${field}`);
            }
            
            const actualType = typeof score[field];
            if (actualType !== expectedType) {
                throw new Error(`Score field ${field} should be ${expectedType}, got ${actualType}`);
            }
        }
        
        if (score.Score < 0) {
            throw new Error('Score cannot be negative');
        }
        
        if (!score.Player.trim()) {
            throw new Error('Player name cannot be empty');
        }
        
        return true;
    }
    
    /**
     * Gets leaderboard scores for a specific mode from Supabase
     */
    async getLeaderboard(modeId) {
        // Check cache first
        if (this.cache.has(modeId)) {
            console.log(`📊 Returning cached leaderboard for ${modeId}`);
            return this.cache.get(modeId);
        }
        
        // Check if already loading
        if (this.loading.has(modeId)) {
            console.log(`⏳ Already loading leaderboard for ${modeId}, waiting...`);
            return await this.loading.get(modeId);
        }
        
        // Start loading
        const loadingPromise = this.loadFromSupabase(modeId);
        this.loading.set(modeId, loadingPromise);
        
        try {
            const scores = await loadingPromise;
            this.cache.set(modeId, scores);
            this.loading.delete(modeId);
            return scores;
        } catch (error) {
            this.loading.delete(modeId);
            console.error(`❌ Failed to load leaderboard for ${modeId}:`, error);
            return [];
        }
    }
    
    /**
     * Loads scores from Supabase
     */
    async loadFromSupabase(modeId) {
        try {
            const token = await this.getAuthToken();
            
            // Build API URL
            let url = `${this.config.url}/rest/v1/${this.config.tableName}`;
            url += `?Mode=eq.${modeId}`;           // Filter by mode
            url += `&order=Score.desc`;            // Sort by score descending
            url += `&limit=${this.config.maxScores}`; // Limit results
            
            console.log(`📡 Loading ${modeId} leaderboard from Supabase...`);
            
            const response = await fetch(url, {
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const rawScores = await response.json();
                console.log(`✅ Loaded ${rawScores.length} scores for ${modeId}`);
                
                // Convert to game format
                const formattedScores = rawScores.map(score => ({
                    name: score.Player,
                    score: score.Score,
                    date: score.Date
                }));
                
                return formattedScores;
            } else {
                throw new Error(`Supabase API error: ${response.status}`);
            }
            
        } catch (error) {
            console.error(`❌ Failed to load from Supabase for ${modeId}:`, error);
            throw error;
        }
    }
    
    /**
     * Adds a score for a specific mode to Supabase
     */
    async addScore(name, score, modeId) {
        try {
            // Create and validate score object
            const scoreObj = this.createScore(name, score, modeId);
            this.validateScore(scoreObj);
            
            console.log(`🏆 Adding score for ${modeId}: ${name} - ${score}`);
            
            // Use SecureHighScoreAuth to submit
            if (window.SecureHighScoreAuth) {
                await window.SecureHighScoreAuth.submitHighScore(name, score, modeId);
                
                // Clear cache to force refresh
                this.clearCache(modeId);
                
                console.log(`✅ Score added successfully for ${modeId}`);
                return true;
            } else {
                throw new Error('SecureHighScoreAuth not available');
            }
            
        } catch (error) {
            console.error(`❌ Failed to add score for ${modeId}:`, error);
            throw error;
        }
    }
    
    /**
     * Updates the leaderboard display for a specific mode
     */
    async updateDisplay(modeId) {
        try {
            // Force refresh from server
            this.clearCache(modeId);
            
            // Load fresh data
            const scores = await this.getLeaderboard(modeId);
            
            // Update global leaderboard display
            if (window.updateLeaderboardDisplay) {
                // Temporarily override the global getLeaderboard to return these scores
                const originalGetLeaderboard = window.getLeaderboard;
                window.getLeaderboard = () => scores;
                
                // Update display
                window.updateLeaderboardDisplay();
                
                // Restore original function
                setTimeout(() => {
                    window.getLeaderboard = originalGetLeaderboard;
                }, 100);
            }
            
            console.log(`📊 Display updated for ${modeId} with ${scores.length} scores`);
        } catch (error) {
            console.error(`❌ Failed to update display for ${modeId}:`, error);
        }
    }
    
}

// Create global instance
window.ModeLeaderboardManager = new ModeLeaderboardManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 ModeLeaderboardManager initialized');
        
        // Pre-authenticate if possible
        if (window.SecureHighScoreAuth) {
            await window.SecureHighScoreAuth.authenticate();
            console.log('✅ Pre-authenticated for leaderboard operations');
        }
    } catch (error) {
        console.warn('⚠️ Pre-authentication failed, will retry on first operation:', error.message);
    }
});

console.log('📊 Mode Leaderboard System (Supabase Edition) loaded');
