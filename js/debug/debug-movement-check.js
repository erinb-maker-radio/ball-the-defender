// Debug script to check the exact moment blocks are moved
console.log('🔍 Movement Check Debug Script Loaded');

// Hook into the exact block movement code
function hookMovementChecks() {
    // Check if the game loop movement code exists
    const gameLoopString = window.gameLoop.toString();
    
    console.log('🔍 Analyzing gameLoop function for block movement...');
    console.log('  Contains "block.y += moveSpeed":', gameLoopString.includes('block.y += moveSpeed'));
    console.log('  Contains "!block.frozen":', gameLoopString.includes('!block.frozen'));
    console.log('  Contains "!block.destroyed":', gameLoopString.includes('!block.destroyed'));
    
    // Hook into forEach calls on blocks
    const originalForEach = Array.prototype.forEach;
    let isInGameLoop = false;
    
    Array.prototype.forEach = function(...args) {
        // Check if this is being called on the blocks array during movement
        if (this === window.blocks && isInGameLoop) {
            const callback = args[0];
            const originalCallback = callback;
            
            args[0] = function(block, index) {
                // Check block state before callback
                const wasFrozen = block.frozen;
                const oldY = block.y;
                
                // Call original callback
                const result = originalCallback.apply(this, arguments);
                
                // Check if block moved
                if (wasFrozen && Math.abs(block.y - oldY) > 0.01) {
                    console.error(`❌ FROZEN BLOCK MOVED IN CALLBACK! Index ${index}: y=${oldY} → y=${block.y}, frozen=${block.frozen}`);
                    console.trace('Movement stack trace');
                }
                
                return result;
            };
        }
        
        return originalForEach.apply(this, args);
    };
    
    // Hook gameLoop to detect when we're in movement phase
    const originalGameLoop = window.gameLoop;
    window.gameLoop = function() {
        isInGameLoop = true;
        const result = originalGameLoop.apply(this, arguments);
        isInGameLoop = false;
        return result;
    };
    
    console.log('✅ Movement check hooks installed');
}

// Try to hook immediately and after delay
setTimeout(hookMovementChecks, 1000);
setTimeout(hookMovementChecks, 3000);

// Also create a simple test to verify the frozen check works
window.testFrozenMovement = function() {
    console.log('🧪 TESTING FROZEN MOVEMENT LOGIC...');
    
    if (!window.blocks || window.blocks.length === 0) {
        console.log('❌ No blocks to test');
        return;
    }
    
    // Find a block to test
    const testBlock = window.blocks[0];
    const originalY = testBlock.y;
    
    console.log(`📦 Testing block at (${testBlock.x}, ${testBlock.y})`);
    console.log(`  Original frozen state: ${testBlock.frozen}`);
    
    // Manually set as frozen
    testBlock.frozen = true;
    console.log(`  Set to frozen: ${testBlock.frozen}`);
    
    // Test the movement condition
    const shouldMove = !testBlock.destroyed && !testBlock.frozen;
    console.log(`  Should move (!destroyed && !frozen): ${shouldMove}`);
    
    if (!shouldMove) {
        console.log('✅ Logic correctly prevents movement of frozen blocks');
    } else {
        console.error('❌ Logic would allow frozen blocks to move!');
    }
    
    // Reset the block
    testBlock.frozen = false;
};

console.log('✅ Movement check debugging active');