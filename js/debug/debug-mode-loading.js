// Debug Mode Loading
console.log('🔍 DEBUG: Checking mode loading status');

setTimeout(() => {
    console.log('🔍 DEBUG: Mode definitions loaded:');
    console.log('  - originalModeDefinition:', !!window.originalModeDefinition);
    console.log('  - ballGoBoomModeDefinition:', !!window.ballGoBoomModeDefinition);
    console.log('  - iceModeDefinition:', !!window.iceModeDefinition);
    
    console.log('🔍 DEBUG: Mode Template System status:');
    console.log('  - ModeTemplateSystem:', !!window.ModeTemplateSystem);
    
    if (window.ModeTemplateSystem) {
        console.log('  - Registered modes:', window.ModeTemplateSystem.listModes());
    }
    
    console.log('🔍 DEBUG: Leaderboard system status:');
    console.log('  - ModeLeaderboardManager:', !!window.ModeLeaderboardManager);
    console.log('  - working-gist-writer functions:', {
        loadFromGist: !!window.loadFromGist,
        writeToGist: !!window.writeToGist,
        getModeScores: !!window.getModeScores
    });
}, 2000);