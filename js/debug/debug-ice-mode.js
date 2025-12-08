// Debug script to check Ice Mode color initialization
(function() {
    console.log('🔍 ICE MODE DEBUG SCRIPT LOADED');
    
    // Check window.colors when Ice Mode is selected
    window.debugIceMode = function() {
        console.log('=== ICE MODE DEBUG ===');
        console.log('1. window.colors:', window.colors);
        if (window.colors) {
            console.log('   - blockByHP:', window.colors.blockByHP);
            console.log('   - special:', window.colors.special);
            if (window.colors.blockByHP) {
                console.log('   - HP1 color:', window.colors.blockByHP[1]);
                console.log('   - HP2 color:', window.colors.blockByHP[2]);
                console.log('   - default:', window.colors.blockByHP.default);
            }
        }
        
        console.log('2. ModeTemplateSystem:', !!window.ModeTemplateSystem);
        if (window.ModeTemplateSystem) {
            const iceMode = window.ModeTemplateSystem.getMode('iceFrost');
            console.log('   - Ice Mode registered:', !!iceMode);
            if (iceMode) {
                console.log('   - Ice Mode colorScheme:', iceMode.colorScheme);
            }
        }
        
        console.log('3. Current mode:', window.selectedGameMode || window.currentGameMode?.id);
        console.log('4. Renderer:', window.gameCore?.renderer?.constructor.name);
    };
    
    // Hook into mode activation to debug
    const originalStartGame = window.startGame;
    window.startGame = function(mode) {
        console.log(`🎮 [DEBUG] startGame called with mode: ${mode}`);
        
        // Call original
        const result = originalStartGame ? originalStartGame.apply(this, arguments) : undefined;
        
        // Debug after activation
        if (mode === 'iceFrost') {
            setTimeout(() => {
                console.log('🧊 [DEBUG] Ice Mode activated, checking colors...');
                window.debugIceMode();
            }, 100);
        }
        
        return result;
    };
    
    // Also hook ModeTemplateSystem.activateMode
    setTimeout(() => {
        if (window.ModeTemplateSystem && window.ModeTemplateSystem.activateMode) {
            const originalActivate = window.ModeTemplateSystem.activateMode;
            window.ModeTemplateSystem.activateMode = function(modeId) {
                console.log(`📦 [DEBUG] ModeTemplateSystem.activateMode called with: ${modeId}`);
                const result = originalActivate.apply(this, arguments);
                
                if (modeId === 'iceFrost') {
                    console.log('🧊 [DEBUG] Ice Mode activated via template system');
                    setTimeout(() => window.debugIceMode(), 100);
                }
                
                return result;
            };
        }
    }, 1000);
    
    console.log('💡 Type debugIceMode() to check Ice Mode colors');
})();