// Debug Ice Mode activation
console.log('🐛 Ice Mode Activation Debug Script Loaded');

// Check if Ice Mode is registered
setTimeout(() => {
    console.log('🔍 Checking Ice Mode registration...');
    
    if (window.ModeTemplateSystem) {
        const modes = window.ModeTemplateSystem.listModes();
        console.log('  Available modes:', modes);
        
        const iceMode = window.ModeTemplateSystem.getMode('iceFrost');
        console.log('  Ice Mode definition exists:', !!iceMode);
        
        if (iceMode && iceMode.mechanics && iceMode.mechanics.specialFeatures) {
            console.log('  Special features count:', iceMode.mechanics.specialFeatures.length);
            
            const freezeFeature = iceMode.mechanics.specialFeatures.find(f => f.id === 'freezeBlocks');
            console.log('  Freeze feature exists:', !!freezeFeature);
            console.log('  Freeze feature has onActivate:', !!freezeFeature?.onActivate);
        }
    }
    
    // Try to manually check the current mode
    const currentMode = window.ModeTemplateSystem?.getCurrentMode();
    console.log('  Current mode:', currentMode?.definition?.id);
    
    if (currentMode && currentMode.definition?.id === 'iceFrost') {
        console.log('🧊 Ice Mode is active!');
        console.log('  Mode instance:', currentMode);
        console.log('  Features:', currentMode.features);
        
        // Check if freeze feature was activated
        const freezeFeature = currentMode.getFeature('freezeBlocks');
        console.log('  Freeze feature instance:', freezeFeature);
        
        // Check if window.iceMode exists
        console.log('  window.iceMode exists:', !!window.iceMode);
        
        if (!window.iceMode) {
            console.error('❌ window.iceMode is missing even though Ice Mode is active!');
            console.log('  Trying to get from feature context globals...');
            
            if (freezeFeature && freezeFeature.globals) {
                console.log('  Feature globals:', freezeFeature.globals);
            }
        }
    }
}, 2000);

// Monitor mode changes
if (window.ModeTemplateSystem) {
    const originalActivateMode = window.ModeTemplateSystem.activateMode;
    window.ModeTemplateSystem.activateMode = function(modeId) {
        console.log(`🎮 Activating mode: ${modeId}`);
        
        const result = originalActivateMode.apply(this, arguments);
        
        if (modeId === 'iceFrost') {
            console.log('🧊 Ice Mode activation complete');
            setTimeout(() => {
                console.log('  Checking window.iceMode after activation...');
                console.log('  window.iceMode exists:', !!window.iceMode);
                if (window.iceMode) {
                    console.log('  freezeBlocksInRadius exists:', !!window.iceMode.freezeBlocksInRadius);
                } else {
                    console.error('  ❌ window.iceMode still missing!');
                    
                    // Try to find the feature and its globals
                    const currentMode = window.ModeTemplateSystem.getCurrentMode();
                    if (currentMode) {
                        const freezeFeature = currentMode.getFeature('freezeBlocks');
                        console.log('  Freeze feature:', freezeFeature);
                        
                        // Check feature context
                        if (freezeFeature) {
                            console.log('  Feature context globals:', freezeFeature.globals);
                            console.log('  Feature context globalCleanups:', freezeFeature.globalCleanups);
                        }
                    }
                }
            }, 500);
        }
        
        return result;
    };
}

console.log('✅ Ice Mode activation debugging active');