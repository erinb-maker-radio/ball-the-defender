// DEBUG EVERYTHING - Comprehensive diagnostics
(function() {
    console.log('🔍 DEBUG EVERYTHING LOADING...');
    
    let debugInterval = null;
    
    // Start comprehensive diagnostics
    window.startFullDebug = function() {
        console.log('🚀 STARTING FULL DEBUG SESSION...');
        
        if (debugInterval) {
            clearInterval(debugInterval);
        }
        
        debugInterval = setInterval(() => {
            console.log('\n━━━ DEBUG REPORT ━━━');
            console.log('📍 Game State:');
            console.log('  window.gameLoop exists:', !!window.gameLoop);
            console.log('  window.blocks exists:', !!window.blocks);
            console.log('  window.ctx exists:', !!window.ctx);
            console.log('  window.currentGameMode:', window.currentGameMode?.id || 'none');
            
            if (window.blocks) {
                const totalBlocks = window.blocks.length;
                const activeBlocks = window.blocks.filter(b => !b.destroyed);
                const specialBlocks = activeBlocks.filter(b => b.isSpecial);
                const exploderBlocks = activeBlocks.filter(b => b.isSpecial && b.specialType === 'exploder');
                const spawnerBlocks = activeBlocks.filter(b => b.isSpecial && b.specialType === 'spawner');
                
                console.log('📦 Blocks:');
                console.log('  Total blocks:', totalBlocks);
                console.log('  Active blocks:', activeBlocks.length);
                console.log('  Special blocks:', specialBlocks.length);
                console.log('  Exploder blocks:', exploderBlocks.length);
                console.log('  Spawner blocks:', spawnerBlocks.length);
                
                if (exploderBlocks.length > 0) {
                    console.log('💣 Exploder Details:');
                    exploderBlocks.forEach((block, i) => {
                        console.log(`    [${i}] Position: (${block.x}, ${block.y}) Size: ${block.width}x${block.height} HP: ${block.hitPoints}`);
                        console.log(`        isSpecial: ${block.isSpecial}, specialType: "${block.specialType}"`);
                    });
                }
                
                if (specialBlocks.length > 0) {
                    console.log('⭐ All Special Blocks:');
                    specialBlocks.forEach((block, i) => {
                        console.log(`    [${i}] Type: ${block.specialType}, Position: (${block.x}, ${block.y})`);
                    });
                }
            }
            
            console.log('🎨 Strobe Chaos Status:');
            console.log('  testStrobeChaosV3 exists:', !!window.testStrobeChaosV3);
            console.log('  forceExploderTest exists:', !!window.forceExploderTest);
            
            if (window.testStrobeChaosV3) {
                window.testStrobeChaosV3();
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━\n');
        }, 3000);
        
        console.log('✅ Debug session started. Will report every 3 seconds.');
        console.log('💡 Use stopFullDebug() to stop');
    };
    
    window.stopFullDebug = function() {
        if (debugInterval) {
            clearInterval(debugInterval);
            debugInterval = null;
            console.log('🛑 Debug session stopped.');
        }
    };
    
    // Immediate diagnostic
    setTimeout(() => {
        console.log('🔍 IMMEDIATE DIAGNOSTIC:');
        console.log('Scripts loaded:');
        console.log('  gameLoop:', !!window.gameLoop);
        console.log('  strobe chaos V3:', !!window.testStrobeChaosV3);
        console.log('  force exploder:', !!window.forceExploderTest);
        
        if (window.gameLoop) {
            const gameLoopStr = window.gameLoop.toString();
            console.log('  gameLoop contains "strobe":', gameLoopStr.includes('strobe'));
            console.log('  gameLoop contains "exploder":', gameLoopStr.includes('exploder'));
            console.log('  gameLoop contains "STROBE CHAOS":', gameLoopStr.includes('STROBE CHAOS'));
        }
    }, 2000);
    
    console.log('🔍 DEBUG EVERYTHING READY!');
    console.log('💡 Use startFullDebug() for continuous monitoring');
    
})();