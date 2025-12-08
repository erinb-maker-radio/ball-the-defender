// Debug script to monitor freeze block interactions
console.log('🐛 Freeze Block Debug Script Loaded');

// Override collision detection to see what's happening
if (window.gameLoop) {
    console.log('🔍 Hooking into collision detection...');
    
    // Monitor special block hits
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('🧊 Freeze block hit') || 
            message.includes('Special block hit') || 
            message.includes('freezeBlocksInRadius')) {
            originalConsoleLog.apply(console, ['🚨 FREEZE DEBUG:', ...args]);
        } else {
            originalConsoleLog.apply(console, args);
        }
    };
}

// Monitor block creation to see if freeze blocks are spawning
let originalBlocks = [];
setInterval(() => {
    if (window.blocks && window.blocks.length !== originalBlocks.length) {
        const newBlocks = window.blocks.slice(originalBlocks.length);
        const freezeBlocks = newBlocks.filter(block => block.isSpecial && block.specialType === 'freeze');
        const specialBlocks = newBlocks.filter(block => block.isSpecial);
        
        if (newBlocks.length > 0) {
            console.log('🆕 New blocks created:');
            console.log(`  Total new: ${newBlocks.length}`);
            console.log(`  Special blocks: ${specialBlocks.length}`);
            console.log(`  Freeze blocks: ${freezeBlocks.length}`);
            
            if (freezeBlocks.length > 0) {
                console.log('🧊 FREEZE BLOCKS DETECTED:');
                freezeBlocks.forEach((block, index) => {
                    console.log(`  Block ${index}: x=${block.x}, y=${block.y}, specialType=${block.specialType}`);
                });
            }
            
            if (specialBlocks.length > 0) {
                console.log('⭐ All special blocks:');
                specialBlocks.forEach((block, index) => {
                    console.log(`  Block ${index}: specialType=${block.specialType}, isSpecial=${block.isSpecial}`);
                });
            }
        }
        
        originalBlocks = [...window.blocks];
    }
}, 1000);

// Check current game state every 3 seconds
setInterval(() => {
    if (window.currentGameMode) {
        console.log('🎮 Game State Check:');
        console.log(`  Mode: ${window.currentGameMode.id}`);
        console.log(`  Total blocks: ${window.blocks?.length || 0}`);
        
        if (window.blocks) {
            const freezeBlocks = window.blocks.filter(block => block.isSpecial && block.specialType === 'freeze');
            const specialBlocks = window.blocks.filter(block => block.isSpecial);
            const frozenBlocks = window.blocks.filter(block => block.frozen);
            
            console.log(`  Special blocks: ${specialBlocks.length}`);
            console.log(`  Freeze blocks: ${freezeBlocks.length}`);
            console.log(`  Frozen blocks: ${frozenBlocks.length}`);
            
            if (frozenBlocks.length > 0) {
                console.log('🧊 Frozen blocks found:');
                frozenBlocks.forEach((block, index) => {
                    console.log(`    ${index}: countdown=${block.freezeCountdown}, x=${block.x}, y=${block.y}`);
                });
            }
        }
        
        console.log(`  Ice Mode active: ${!!window.iceMode}`);
        console.log(`  Freeze function: ${!!window.iceMode?.freezeBlocksInRadius}`);
    }
}, 5000);

console.log('✅ Freeze block debugging active');