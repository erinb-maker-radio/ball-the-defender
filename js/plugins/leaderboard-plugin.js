/**
 * Leaderboard Plugin - Beautiful score management system
 * Expandable architecture for multiple game modes
 */

class LeaderboardPlugin {
    constructor() {
        this.scores = new Map(); // mode -> scores array
        this.maxScoresPerMode = 10;
        this.supportedModes = ['original', 'ballGoBoom', 'ice'];
        this.storageKey = 'ballDefender_scores_v3';
        
        this.initializeScoreStorage();
    }
    
    initialize(engine) {
        this.engine = engine;
        this.colorThemes = engine.plugins.get('colorThemes');
        
        // Load existing scores
        this.loadScores();
        
        console.log('🏆 Leaderboard plugin initialized with expandable architecture');
    }
    
    initializeScoreStorage() {
        // Initialize score storage for all supported modes
        this.supportedModes.forEach(mode => {
            this.scores.set(mode, []);
        });
    }
    
    // Smart architecture - easily add new modes
    registerGameMode(modeId, modeName) {
        if (!this.scores.has(modeId)) {
            this.scores.set(modeId, []);
            console.log(`🎮 New game mode registered in leaderboard: ${modeName}`);
        }
    }
    
    submitScore(modeId, playerName, score, level, timeSeconds) {
        if (!this.scores.has(modeId)) {
            console.warn(`Unknown game mode: ${modeId}`);
            return false;
        }
        
        const scoreEntry = {
            playerName: playerName || 'Anonymous',
            score: score,
            level: level,
            timeSeconds: timeSeconds,
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            mode: modeId
        };
        
        // Add to mode's score list
        const modeScores = this.scores.get(modeId);
        modeScores.push(scoreEntry);
        
        // Sort by score descending
        modeScores.sort((a, b) => b.score - a.score);
        
        // Keep only top scores
        if (modeScores.length > this.maxScoresPerMode) {
            modeScores.splice(this.maxScoresPerMode);
        }
        
        // Save to localStorage
        this.saveScores();
        
        // Check if this is a new high score
        const rank = modeScores.findIndex(entry => entry === scoreEntry) + 1;
        const isNewRecord = rank === 1;
        
        console.log(`🏆 Score submitted for ${modeId}: ${score} (Rank #${rank})`);
        
        return {
            rank: rank,
            isNewRecord: isNewRecord,
            totalScores: modeScores.length
        };
    }
    
    getModeScores(modeId) {
        return this.scores.get(modeId) || [];
    }
    
    getAllModeScores() {
        const allScores = {};
        this.scores.forEach((scores, modeId) => {
            allScores[modeId] = [...scores]; // Return copy
        });
        return allScores;
    }
    
    getTopScore(modeId) {
        const modeScores = this.scores.get(modeId);
        return modeScores && modeScores.length > 0 ? modeScores[0] : null;
    }
    
    getAllTimeTopScores() {
        const topScores = {};
        this.scores.forEach((scores, modeId) => {
            if (scores.length > 0) {
                topScores[modeId] = scores[0];
            }
        });
        return topScores;
    }
    
    // Beautiful score display formatting
    formatScore(score) {
        return score.toLocaleString();
    }
    
    formatTime(timeSeconds) {
        const minutes = Math.floor(timeSeconds / 60);
        const seconds = Math.floor(timeSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }
    
    // Storage management
    saveScores() {
        try {
            const scoresData = {};
            this.scores.forEach((scores, modeId) => {
                scoresData[modeId] = scores;
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(scoresData));
            console.log('💾 Scores saved to localStorage');
            
        } catch (error) {
            console.warn('Failed to save scores:', error);
        }
    }
    
    loadScores() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const scoresData = JSON.parse(savedData);
                
                // Load scores for each mode
                Object.entries(scoresData).forEach(([modeId, scores]) => {
                    if (this.scores.has(modeId)) {
                        this.scores.set(modeId, scores);
                    }
                });
                
                console.log('📖 Scores loaded from localStorage');
            }
        } catch (error) {
            console.warn('Failed to load scores:', error);
        }
    }
    
    clearModeScores(modeId) {
        if (this.scores.has(modeId)) {
            this.scores.set(modeId, []);
            this.saveScores();
            console.log(`🗑️ Cleared scores for mode: ${modeId}`);
        }
    }
    
    clearAllScores() {
        this.scores.forEach((scores, modeId) => {
            this.scores.set(modeId, []);
        });
        this.saveScores();
        console.log('🗑️ All scores cleared');
    }
    
    // Smart architecture - expandable leaderboard UI
    renderLeaderboard(ctx, modeId, x, y, width, height) {
        if (!this.colorThemes) return;
        
        const theme = this.colorThemes.activeTheme;
        const modeScores = this.getModeScores(modeId);
        
        ctx.save();
        
        // Beautiful background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, width, height);
        
        // Border with theme color
        ctx.strokeStyle = theme.blocks.normal;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Title
        ctx.fillStyle = theme.text || '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.getModeName(modeId)} - Top Scores`, x + width/2, y + 30);
        
        // Score entries
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        const startY = y + 60;
        const lineHeight = 25;
        
        modeScores.slice(0, 8).forEach((entry, index) => {
            const entryY = startY + index * lineHeight;
            
            // Rank
            ctx.fillStyle = index === 0 ? '#FFD700' : theme.text || '#ffffff';
            ctx.fillText(`#${index + 1}`, x + 10, entryY);
            
            // Score
            ctx.fillText(this.formatScore(entry.score), x + 50, entryY);
            
            // Player name
            ctx.fillText(entry.playerName, x + 150, entryY);
            
            // Level and time
            ctx.fillStyle = theme.blocks.weak || '#888888';
            ctx.fillText(`Lv.${entry.level} ${this.formatTime(entry.timeSeconds)}`, x + 250, entryY);
        });
        
        ctx.restore();
    }
    
    getModeName(modeId) {
        const modeNames = {
            'original': 'Original',
            'ballGoBoom': 'Ball Go Boom',
            'ice': 'Ice Mode'
        };
        return modeNames[modeId] || 'Unknown Mode';
    }
    
    // Game integration
    onGameComplete(modeId, gameData, timeSeconds) {
        // Auto-submit score when game ends
        return this.submitScore(
            modeId, 
            'Player', // Could be expanded to ask for name
            gameData.score,
            gameData.level,
            timeSeconds
        );
    }
    
    // Performance monitoring
    getStorageSize() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? data.length : 0;
        } catch {
            return 0;
        }
    }
    
    getTotalScoreEntries() {
        let total = 0;
        this.scores.forEach(scores => {
            total += scores.length;
        });
        return total;
    }
}

// Export
window.LeaderboardPlugin = LeaderboardPlugin;
console.log('🏆 Beautiful Expandable Leaderboard Plugin loaded');