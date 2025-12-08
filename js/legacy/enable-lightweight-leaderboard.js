// Enable Lightweight Leaderboard System
// Load this script in index.html to replace the GitHub gist system

(function() {
    console.log('🚀 Enabling Lightweight Leaderboard System...');
    
    // Check if we're in the main game
    if (typeof document !== 'undefined') {
        // Load the lightweight leaderboard system
        const loadLightweightSystem = function() {
            // First disable the old gist system
            const disableScript = document.createElement('script');
            disableScript.src = 'disable-github-gist.js';
            disableScript.onload = function() {
                console.log('✅ Old gist system disabled');
                
                // Then load the new lightweight system
                const lightweightScript = document.createElement('script');
                lightweightScript.src = 'lightweight-leaderboard.js';
                lightweightScript.onload = function() {
                    console.log('✅ Lightweight leaderboard system loaded');
                    
                    // Show welcome message
                    setTimeout(showWelcomeMessage, 3000);
                };
                lightweightScript.onerror = function() {
                    console.error('❌ Failed to load lightweight leaderboard system');
                };
                document.head.appendChild(lightweightScript);
            };
            disableScript.onerror = function() {
                console.warn('⚠️ Could not load gist disabler, loading lightweight system anyway');
                
                // Load lightweight system directly
                const lightweightScript = document.createElement('script');
                lightweightScript.src = 'lightweight-leaderboard.js';
                document.head.appendChild(lightweightScript);
            };
            document.head.appendChild(disableScript);
        };
        
        // Show welcome message about the new system
        const showWelcomeMessage = function() {
            // Only show if we're on the main game page
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    font-family: 'Courier New', monospace;
                    font-size: 16px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    z-index: 10000;
                    max-width: 500px;
                    text-align: center;
                    animation: welcomeFadeIn 0.5s ease-out;
                `;
                
                notification.innerHTML = `
                    <div style="font-size: 24px; margin-bottom: 15px;">🎉 LEADERBOARD UPGRADED!</div>
                    <div style="margin-bottom: 15px;">Your leaderboard is now more secure and lightweight!</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 20px;">
                        ✅ No more exposed tokens<br>
                        ✅ Append-only (users can only add scores)<br>
                        ✅ Export to CSV/JSON<br>
                        ✅ Optional cloud sync with Supabase
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="window.open('leaderboard-manager.html', '_blank')" style="
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: 'Courier New', monospace;
                            font-weight: bold;
                        ">🔧 Manage Scores</button>
                        <button onclick="this.parentNode.parentNode.remove()" style="
                            background: rgba(255,255,255,0.2);
                            color: white;
                            border: 1px solid white;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: 'Courier New', monospace;
                        ">Continue Playing</button>
                    </div>
                `;
                
                // Add CSS animation
                if (!document.getElementById('welcomeStyle')) {
                    const style = document.createElement('style');
                    style.id = 'welcomeStyle';
                    style.textContent = `
                        @keyframes welcomeFadeIn {
                            from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(notification);
                
                // Auto-dismiss after 10 seconds
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
                }, 10000);
            }
        };
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadLightweightSystem);
        } else {
            loadLightweightSystem();
        }
        
    } else {
        console.warn('⚠️ Not in browser environment, skipping lightweight leaderboard');
    }
    
    console.log('🚀 Lightweight leaderboard enabler ready');
    
})();
