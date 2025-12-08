// FORCE EXPLODER TEST - For testing strobe chaos implementation
(function() {
    console.log('🧪 FORCE EXPLODER TEST LOADING...');
    
    // Wait for game to be ready
    function waitForGame() {
        if (!window.blocks) {
            setTimeout(waitForGame, 100);
            return;
        }
        
        // Add test function to force create exploder blocks
        window.forceExploderTest = function() {
            console.log('💣 FORCING EXPLODER BLOCKS FOR TESTING...');
            
            if (!window.blocks || window.blocks.length === 0) {
                console.log('❌ No blocks available. Start a game first.');
                return;
            }
            
            // Convert first few blocks to exploder blocks
            let convertedCount = 0;
            for (let i = 0; i < Math.min(3, window.blocks.length); i++) {
                const block = window.blocks[i];
                if (!block.destroyed) {
                    block.isSpecial = true;
                    block.specialType = 'exploder';
                    convertedCount++;
                    console.log(`💣 Converted block ${i} at (${block.x}, ${block.y}) to exploder`);
                }
            }
            
            console.log(`✅ Converted ${convertedCount} blocks to exploders`);
            console.log('🌈 Strobe chaos effect should now be visible!');
            
            // Test the strobe chaos function if available
            if (window.testStrobeChaosV3) {
                setTimeout(window.testStrobeChaosV3, 500);
            }
        };
        
        // Add test function to force create spawner blocks too
        window.forceSpawnerTest = function() {
            console.log('🛡️ FORCING SPAWNER BLOCKS FOR TESTING...');
            
            if (!window.blocks || window.blocks.length === 0) {
                console.log('❌ No blocks available. Start a game first.');
                return;
            }
            
            // Convert some blocks to spawner blocks
            let convertedCount = 0;
            for (let i = 3; i < Math.min(6, window.blocks.length); i++) {
                const block = window.blocks[i];
                if (!block.destroyed) {
                    block.isSpecial = true;
                    block.specialType = 'spawner';
                    convertedCount++;
                    console.log(`🛡️ Converted block ${i} at (${block.x}, ${block.y}) to spawner`);
                }
            }
            
            console.log(`✅ Converted ${convertedCount} blocks to spawners`);
        };
        
        console.log('✅ FORCE EXPLODER TEST READY!');
        console.log('💡 Use forceExploderTest() to create test exploder blocks');
        console.log('💡 Use forceSpawnerTest() to create test spawner blocks');
    }
    
    setTimeout(waitForGame, 1000);
    
})();