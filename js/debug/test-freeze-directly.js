// Direct test of freeze functionality
console.log('🧊 Direct Freeze Test Script Loaded');

window.testFreezeDirect = function() {
    console.log('🧊 DIRECT FREEZE TEST STARTING...');
    
    // Create test blocks if they don't exist
    if (!window.blocks) {
        window.blocks = [];
    }
    
    // Clear existing blocks
    window.blocks.length = 0;
    
    // Create 5 test blocks in a line
    for (let i = 0; i < 5; i++) {
        window.blocks.push({
            x: 50 + (i * 100),
            y: 200,
            width: 80,
            height: 30,
            hp: 1,
            destroyed: false,
            frozen: false
        });
    }
    
    console.log(`✅ Created ${window.blocks.length} test blocks`);
    
    // Manually freeze the middle 3 blocks
    for (let i = 1; i <= 3; i++) {
        const block = window.blocks[i];
        block.frozen = true;
        block.freezeCountdown = 5;
        console.log(`🧊 Manually froze block ${i} at (${block.x}, ${block.y})`);
    }
    
    // Store initial positions
    const initialPositions = window.blocks.map(b => ({ x: b.x, y: b.y }));
    
    // Check block states after a few game loop iterations
    setTimeout(() => {
        console.log('🔍 CHECKING BLOCK MOVEMENT AFTER 2 SECONDS:');
        
        window.blocks.forEach((block, i) => {
            const moved = Math.abs(block.y - initialPositions[i].y) > 0.1;
            const status = block.frozen ? '🧊 FROZEN' : '🔄 NORMAL';
            const movement = moved ? `MOVED ${(block.y - initialPositions[i].y).toFixed(1)}px` : 'STATIONARY';
            
            console.log(`  Block ${i}: ${status} - ${movement} (y: ${initialPositions[i].y} → ${block.y.toFixed(1)})`);
            
            if (block.frozen && moved) {
                console.error(`❌ FROZEN BLOCK ${i} MOVED! This is the bug!`);
            }
            
            if (!block.frozen && !moved) {
                console.warn(`⚠️ Normal block ${i} didn't move - game might be paused?`);
            }
        });
        
        // Also check frozen counts
        const frozenCount = window.blocks.filter(b => b.frozen).length;
        const movedCount = window.blocks.filter((b, i) => Math.abs(b.y - initialPositions[i].y) > 0.1).length;
        
        console.log(`📊 SUMMARY: ${frozenCount} frozen, ${movedCount} moved out of ${window.blocks.length} total`);
        
    }, 2000);
    
    console.log('⏱️ Waiting 2 seconds to check results...');
};

// Auto-run test after 3 seconds if in Ice Mode
setTimeout(() => {
    if (window.currentGameMode?.id === 'iceFrost') {
        console.log('🧊 Auto-running direct freeze test...');
        window.testFreezeDirect();
    } else {
        console.log('ℹ️ To test freeze functionality, activate Ice Mode and call window.testFreezeDirect()');
    }
}, 3000);

console.log('✅ Direct freeze test ready - call window.testFreezeDirect() to run');