// Debug script to monitor when blocks lose their frozen state
console.log('🔍 Frozen State Debug Script Loaded');

// Track frozen blocks and their states
let lastFrozenStates = new Map();

function monitorFrozenStates() {
    if (!window.blocks) return;
    
    const currentFrozen = window.blocks.filter(b => b.frozen);
    const currentNormal = window.blocks.filter(b => !b.frozen && !b.destroyed);
    
    // Check for state changes
    currentFrozen.forEach((block, index) => {
        const key = `${block.x}_${block.y}`;
        const lastState = lastFrozenStates.get(key);
        
        if (!lastState || lastState.frozen !== true) {
            console.log(`🧊 NEW FROZEN: Block at (${block.x}, ${block.y}) countdown=${block.freezeCountdown}`);
        } else if (lastState.y !== block.y) {
            console.error(`❌ FROZEN BLOCK MOVED: (${block.x}, ${block.y}) moved from y=${lastState.y} to y=${block.y}`);
        }
        
        lastFrozenStates.set(key, {
            x: block.x,
            y: block.y,
            frozen: true,
            countdown: block.freezeCountdown
        });
    });
    
    // Check for blocks that lost frozen state
    Array.from(lastFrozenStates.keys()).forEach(key => {
        const lastState = lastFrozenStates.get(key);
        if (!lastState.frozen) return;
        
        const [x, y] = key.split('_').map(Number);
        const currentBlock = window.blocks.find(b => 
            Math.abs(b.x - x) < 5 && Math.abs(b.y - y) < 50
        );
        
        if (!currentBlock) {
            console.log(`🗑️ FROZEN BLOCK REMOVED: Block at (${x}, ${y}) was destroyed`);
            lastFrozenStates.delete(key);
        } else if (!currentBlock.frozen) {
            console.log(`🔥 BLOCK UNFROZEN: Block at (${currentBlock.x}, ${currentBlock.y}) countdown was ${lastState.countdown}`);
            lastFrozenStates.set(key, {
                x: currentBlock.x,
                y: currentBlock.y,
                frozen: false,
                countdown: 0
            });
        }
    });
}

// Monitor every 100ms
setInterval(monitorFrozenStates, 100);

// Also hook into block movement functions
function hookBlockMovement() {
    // Hook advanceBlocks
    if (window.advanceBlocks) {
        const originalAdvanceBlocks = window.advanceBlocks;
        window.advanceBlocks = function() {
            console.log('🔄 ADVANCE BLOCKS CALLED');
            const frozenBefore = window.blocks.filter(b => b.frozen).length;
            console.log(`  Frozen blocks before: ${frozenBefore}`);
            
            const result = originalAdvanceBlocks.apply(this, arguments);
            
            const frozenAfter = window.blocks.filter(b => b.frozen).length;
            console.log(`  Frozen blocks after: ${frozenAfter}`);
            
            if (frozenBefore > 0) {
                console.log('🔍 Checking individual frozen blocks after advanceBlocks:');
                window.blocks.filter(b => b.frozen).forEach((block, i) => {
                    console.log(`    ${i}: x=${block.x}, y=${block.y}, frozen=${block.frozen}, countdown=${block.freezeCountdown}`);
                });
            }
            
            return result;
        };
        
        console.log('✅ Hooked advanceBlocks function');
    }
}

// Try to hook immediately and after delay
setTimeout(hookBlockMovement, 1000);
setTimeout(hookBlockMovement, 3000);

console.log('✅ Frozen state debugging active');