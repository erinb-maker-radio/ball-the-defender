// Debug script to test freeze block functionality
(function() {
    console.log('🧊 DEBUGGING FREEZE BLOCK FUNCTIONALITY');
    console.log('=' .repeat(50));
    
    // Check current game mode
    console.log('📊 CURRENT GAME STATE:');
    console.log('  window.currentGameMode:', window.currentGameMode);
    console.log('  window.currentGameMode?.id:', window.currentGameMode?.id);
    console.log('  Is Ice Mode?:', window.currentGameMode?.id === 'iceFrost');
    console.log('');
    
    // Check mode framework
    console.log('🏗️ MODE FRAMEWORK:');
    console.log('  ModeFramework exists:', !!window.ModeFramework);
    if (window.ModeFramework) {
        console.log('  Registered modes:', Array.from(window.ModeFramework.registeredModes.keys()));
        console.log('  Current mode:', window.ModeFramework.getCurrentMode());
        console.log('  Has iceFrost:', window.ModeFramework.registeredModes.has('iceFrost'));
        
        if (window.ModeFramework.registeredModes.has('iceFrost')) {
            const iceFrostMode = window.ModeFramework.getMode('iceFrost');
            console.log('  Ice mode config:', iceFrostMode);
        }
    }
    console.log('');
    
    // Check window.iceMode
    console.log('🧊 ICE MODE FUNCTIONALITY:');
    console.log('  window.iceMode exists:', !!window.iceMode);
    if (window.iceMode) {
        console.log('  Properties:', Object.keys(window.iceMode));
        console.log('  freezeBlocksInRadius exists:', !!window.iceMode.freezeBlocksInRadius);
        console.log('  freezeBlock exists:', !!window.iceMode.freezeBlock);
        console.log('  unfreezeBlock exists:', !!window.iceMode.unfreezeBlock);
    }
    console.log('');
    
    // Check for freeze blocks in current game
    console.log('🎯 FREEZE BLOCKS IN GAME:');
    if (window.blocks) {
        const freezeBlocks = window.blocks.filter(block => block.specialType === 'freeze');
        console.log(`  Found ${freezeBlocks.length} freeze blocks`);
        if (freezeBlocks.length > 0) {
            console.log('  First freeze block:', freezeBlocks[0]);
        }
    } else {
        console.log('  No blocks array found');
    }
    console.log('');
    
    // Test functions
    window.debugActivateIceMode = function() {
        console.log('🧪 MANUALLY ACTIVATING ICE MODE...');
        if (window.ModeFramework && window.ModeFramework.registeredModes.has('iceFrost')) {
            try {
                const result = window.ModeFramework.activateMode('iceFrost');
                console.log('✅ Ice mode activated:', result);
                console.log('✅ window.iceMode now exists:', !!window.iceMode);
                console.log('✅ freezeBlocksInRadius available:', !!window.iceMode?.freezeBlocksInRadius);
            } catch (e) {
                console.error('❌ Failed to activate ice mode:', e);
            }
        } else {
            console.error('❌ Ice mode not registered in framework');
        }
    };
    
    window.debugTestFreeze = function() {
        console.log('🧪 TESTING FREEZE FUNCTIONALITY...');
        if (window.iceMode && window.iceMode.freezeBlocksInRadius) {
            console.log('✅ Calling freezeBlocksInRadius(100, 100, 1)...');
            try {
                window.iceMode.freezeBlocksInRadius(100, 100, 1);
                console.log('✅ Freeze function called successfully');
            } catch (e) {
                console.error('❌ Error calling freeze function:', e);
            }
        } else {
            console.error('❌ Freeze functionality not available');
        }
    };
    
    window.debugCheckBlocks = function() {
        console.log('🔍 CHECKING ALL BLOCKS...');
        if (window.blocks) {
            window.blocks.forEach((block, index) => {
                if (block.specialType === 'freeze') {
                    console.log(`Freeze block ${index}:`, {
                        x: block.x,
                        y: block.y,
                        isSpecial: block.isSpecial,
                        specialType: block.specialType,
                        destroyed: block.destroyed
                    });
                }
                if (block.frozen) {
                    console.log(`Frozen block ${index}:`, {
                        x: block.x,
                        y: block.y,
                        frozen: block.frozen
                    });
                }
            });
        }
    };
    
    console.log('💡 Debug functions available:');
    console.log('  debugActivateIceMode() - manually activate ice mode');
    console.log('  debugTestFreeze() - test freeze functionality');
    console.log('  debugCheckBlocks() - check all blocks for freeze state');
    
})();