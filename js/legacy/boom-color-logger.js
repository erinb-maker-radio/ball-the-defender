// BOOM COLOR LOGGER - Log everything about color selection
(function() {
    console.log('📝 BOOM COLOR LOGGER ACTIVE');
    
    // Store original console.log for clean logging
    const originalLog = console.log;
    
    // Track color usage
    let colorUsageStats = {
        original: 0,
        boom: 0,
        unknown: 0
    };
    
    // Hook into game loop to add logging
    function hookGameLoop() {
        const checkInterval = setInterval(() => {
            if (window.gameLoop) {
                const originalGameLoop = window.gameLoop;
                let frameCount = 0;
                
                window.gameLoop = function() {
                    frameCount++;
                    
                    // Log every 60 frames (approximately once per second)
                    if (frameCount % 60 === 0) {
                        originalLog('📊 FRAME', frameCount);
                        originalLog('  Mode:', window.currentGameMode?.id);
                        originalLog('  Mode is ballGoBoom:', window.currentGameMode?.id === 'ballGoBoom');
                        originalLog('  Color stats:', colorUsageStats);
                        
                        // Check a sample block
                        if (window.blocks && window.blocks.length > 0) {
                            const sampleBlock = window.blocks.find(b => !b.destroyed);
                            if (sampleBlock) {
                                originalLog('  Sample block HP:', sampleBlock.hitPoints);
                                
                                // Check what color would be selected
                                const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                                originalLog('  Boom mode check result:', isBoomMode);
                                
                                if (window.colors && window.colors.blockByHP) {
                                    const normalColor = window.colors.blockByHP[sampleBlock.hitPoints];
                                    originalLog('  Normal color for HP', sampleBlock.hitPoints + ':', normalColor?.base);
                                }
                            }
                        }
                    }
                    
                    return originalGameLoop.call(this);
                };
                
                clearInterval(checkInterval);
                originalLog('✅ Game loop hooked for logging');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Intercept the actual rendering to see what colors are used
    function interceptCanvasColors() {
        const checkInterval = setInterval(() => {
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx && ctx.createLinearGradient) {
                    const originalCreateLinearGradient = ctx.createLinearGradient;
                    
                    ctx.createLinearGradient = function(...args) {
                        const gradient = originalCreateLinearGradient.apply(this, args);
                        const originalAddColorStop = gradient.addColorStop;
                        
                        gradient.addColorStop = function(offset, color) {
                            // Identify color type
                            if (color.includes('#4CAF50') || color.includes('#8BC34A') || color.includes('#FFEB3B')) {
                                colorUsageStats.original++;
                            } else if (color.includes('#FF4500') || color.includes('#FF6600') || color.includes('#FFD700')) {
                                colorUsageStats.boom++;
                            } else {
                                colorUsageStats.unknown++;
                            }
                            
                            return originalAddColorStop.call(this, offset, color);
                        };
                        
                        return gradient;
                    };
                    
                    clearInterval(checkInterval);
                    originalLog('✅ Canvas gradient interception active');
                }
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Check if our modifications are actually in the code
    function verifyCodeModifications() {
        originalLog('🔍 VERIFYING CODE MODIFICATIONS...');
        
        // Check if gameLoop contains our boom colors
        if (window.gameLoop) {
            const funcString = window.gameLoop.toString();
            
            originalLog('  gameLoop contains "isBallGoBoomMode":', funcString.includes('isBallGoBoomMode'));
            originalLog('  gameLoop contains "#FF4500":', funcString.includes('#FF4500'));
            originalLog('  gameLoop contains "ballGoBoom":', funcString.includes('ballGoBoom'));
            originalLog('  gameLoop contains "boomColors":', funcString.includes('boomColors'));
            
            // Extract the relevant section
            const colorSection = funcString.match(/\/\/ Ball Go Boom mode volcanic colors[\s\S]*?blockColor = colors\.blockByHP/);
            if (colorSection) {
                originalLog('  ✅ Boom color code found in gameLoop');
            } else {
                originalLog('  ❌ Boom color code NOT found in gameLoop');
            }
        }
    }
    
    // Initialize
    function initialize() {
        originalLog('📝 Initializing Boom Color Logger...');
        
        hookGameLoop();
        interceptCanvasColors();
        
        // Verify modifications after a delay
        setTimeout(verifyCodeModifications, 2000);
        
        originalLog('✅ Boom Color Logger ready');
    }
    
    // Make functions available globally
    window.verifyBoomColors = verifyCodeModifications;
    window.colorUsageStats = colorUsageStats;
    
    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();