// Legacy GitHub Gist System Compatibility
// Provides no-op functions for any legacy code that might reference gist functions

(function() {
    // Provide no-op functions for any legacy references
    if (!window.loadFromGist) {
        window.loadFromGist = function() {
            // No-op: Gist system not used
            return Promise.resolve([]);
        };
    }
    
    if (!window.writeToGist) {
        window.writeToGist = function() {
            // No-op: Gist system not used
            return Promise.resolve(false);
        };
    }
    
    // Minimal initialization - no more verbose logging
    console.log('📝 Leaderboard compatibility layer ready');
    
})();