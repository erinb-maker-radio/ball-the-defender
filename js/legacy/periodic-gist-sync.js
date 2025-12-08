// Periodic Gist Sync - Updates every 2 minutes
(function() {
    console.log('⏰ Periodic Gist Sync Loading...');
    
    let syncInterval = null;
    let lastSyncTime = 0;
    
    async function syncFromGist() {
        try {
            const now = Date.now();
            console.log('⏰ PERIODIC: Starting 2-minute sync...');
            
            if (window.OnlineLeaderboard && window.OnlineLeaderboard.mergeAndSync) {
                // Get fresh data from gist without adding new scores
                const freshScores = await window.OnlineLeaderboard.mergeAndSync();
                
                console.log(`⏰ PERIODIC: Synced ${freshScores.length} scores from gist`);
                
                // Update display if it changed
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                    console.log('⏰ PERIODIC: Display updated with fresh scores');
                }
                
                lastSyncTime = now;
                console.log('✅ PERIODIC: 2-minute sync completed successfully');
                
            } else {
                console.warn('⏰ PERIODIC: OnlineLeaderboard not available');
            }
            
        } catch (error) {
            console.error('❌ PERIODIC: Sync failed:', error);
        }
    }
    
    function startPeriodicSync() {
        if (syncInterval) {
            clearInterval(syncInterval);
        }
        
        console.log('⏰ PERIODIC: Starting 2-minute automatic sync...');
        
        // Sync every 2 minutes (120,000 ms)
        syncInterval = setInterval(syncFromGist, 120000);
        
        // Also do an initial sync after 30 seconds
        setTimeout(syncFromGist, 30000);
        
        console.log('✅ PERIODIC: 2-minute sync timer started');
    }
    
    function stopPeriodicSync() {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
            console.log('⏰ PERIODIC: Sync timer stopped');
        }
    }
    
    // Manual sync function
    window.forcePeriodic Sync = async function() {
        console.log('⏰ MANUAL: Force periodic sync...');
        await syncFromGist();
    };
    
    // Status function
    window.getSyncStatus = function() {
        const timeSinceLastSync = Date.now() - lastSyncTime;
        const minutesSinceSync = Math.floor(timeSinceLastSync / 60000);
        
        console.log('⏰ SYNC STATUS:');
        console.log(`  - Periodic sync: ${syncInterval ? 'ACTIVE' : 'STOPPED'}`);
        console.log(`  - Last sync: ${minutesSinceSync} minutes ago`);
        console.log(`  - Next sync: ${syncInterval ? '2 minutes (max)' : 'N/A'}`);
        
        return {
            active: !!syncInterval,
            lastSyncTime: lastSyncTime,
            minutesSinceSync: minutesSinceSync
        };
    };
    
    // Start/stop functions
    window.startPeriodicSync = startPeriodicSync;
    window.stopPeriodicSync = stopPeriodicSync;
    
    // Pause sync when game is not visible (optional optimization)
    function handleVisibilityChange() {
        if (document.hidden) {
            console.log('⏰ PERIODIC: Page hidden, sync continues in background');
        } else {
            console.log('⏰ PERIODIC: Page visible, sync active');
            // Do an immediate sync when page becomes visible again
            setTimeout(syncFromGist, 1000);
        }
    }
    
    // Initialize periodic sync
    function initialize() {
        console.log('⏰ Initializing periodic gist sync...');
        
        // Start the periodic sync
        startPeriodicSync();
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        console.log('⏰ Periodic sync system initialized');
    }
    
    // Start after everything else is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 2000);
        });
    } else {
        setTimeout(initialize, 2000);
    }
    
    console.log('⏰ Periodic Gist Sync ready - will sync every 2 minutes');
    console.log('💡 Functions available:');
    console.log('  - getSyncStatus() - Check sync status');
    console.log('  - forcePeriodicSync() - Manual sync');
    console.log('  - startPeriodicSync() - Start timer');
    console.log('  - stopPeriodicSync() - Stop timer');
    
})();