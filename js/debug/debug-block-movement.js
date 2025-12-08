// Debug script to trace block movement and frozen state
console.log('🐛 Block Movement Debug Script Loaded');

// Hook into the block movement logic
let lastBlockCheck = 0;
let blockMovementHookInstalled = false;

function installBlockMovementHook() {
    if (blockMovementHookInstalled) return;
    
    // Look for the main game loop function
    if (window.gameLoop) {
        const originalGameLoop = window.gameLoop;
        
        window.gameLoop = function() {
            // Call original game loop
            const result = originalGameLoop.apply(this, arguments);
            
            // Check block states after movement
            if (window.blocks && Date.now() - lastBlockCheck > 1000) {
                const frozenBlocks = window.blocks.filter(b => b.frozen);
                const normalBlocks = window.blocks.filter(b => !b.frozen && !b.destroyed);
                
                if (frozenBlocks.length > 0) {
                    console.log('🧊 FROZEN BLOCKS DETECTED IN GAME LOOP:');
                    frozenBlocks.forEach((block, i) => {
                        console.log(`  Block ${i}: x=${block.x}, y=${block.y.toFixed(1)}, frozen=${block.frozen}, countdown=${block.freezeCountdown}`);
                    });
                    
                    // Store positions for next check
                    if (!window.frozenBlockPositions) window.frozenBlockPositions = new Map();
                    
                    frozenBlocks.forEach((block, i) => {
                        const key = `block_${i}`;
                        const lastPos = window.frozenBlockPositions.get(key);
                        
                        if (lastPos && Math.abs(block.y - lastPos) > 0.1) {
                            console.log(`⚠️ FROZEN BLOCK MOVED! Block ${i} moved from y=${lastPos} to y=${block.y.toFixed(1)}`);
                        }
                        
                        window.frozenBlockPositions.set(key, block.y);
                    });
                }
                
                lastBlockCheck = Date.now();
            }
            
            return result;
        };
        
        blockMovementHookInstalled = true;
        console.log('✅ Block movement hook installed');
    }
}

// Try to install hook immediately
installBlockMovementHook();

// Also try after delay in case gameLoop isn't ready yet
setTimeout(installBlockMovementHook, 1000);
setTimeout(installBlockMovementHook, 3000);

console.log('✅ Block movement debugging active');