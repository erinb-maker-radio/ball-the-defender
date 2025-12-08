// GLOBAL GAME TIME TRACKER - Ball Defender
// Tracks local game time and syncs with global Gist data
(function() {
    console.log('⏱️ Global Time Tracker loading...');
    
    // Configuration
    const TIME_CONFIG = {
        gistFile: 'ball-defender-global-time-played.json',
        localStorageKey: 'ballDefender_LocalTimePlayed',
        syncInterval: 60000, // Sync every 60 seconds during gameplay
        saveInterval: 10000,  // Save local time every 10 seconds
        updateDisplayInterval: 100 // Update display every 100ms for live stopwatch effect
    };
    
    // Time tracking state
    const timeTracker = {
        sessionStartTime: null,
        sessionTime: 0,
        totalLocalTime: 0,
        totalGlobalTime: 0,
        isTracking: false,
        lastSyncTime: 0,
        syncInterval: null,
        saveInterval: null,
        displayInterval: null,
        supabaseSubmitInterval: null,
        uniquePlayerId: null,
        lastSubmittedTime: 0,  // Track when we last submitted to prevent double submissions
        currentSessionDuration: 0  // Track current session for incremental submissions
    };
    
    // Generate unique player ID for this instance
    function generatePlayerId() {
        let playerId = localStorage.getItem('ballDefender_PlayerId');
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ballDefender_PlayerId', playerId);
        }
        return playerId;
    }
    
    // Initialize time tracker
    async function initialize() {
        timeTracker.uniquePlayerId = generatePlayerId();
        loadLocalTime();
        
        // Load initial time from Supabase if available
        await loadInitialTimeFromSupabase();
        
        loadGlobalTime();
        setupGameStateListeners();
        setupDisplayUpdate();
        
        console.log(`⏱️ Time tracker initialized for player: ${timeTracker.uniquePlayerId}`);
        console.log(`⏱️ Local time played: ${formatTime(timeTracker.totalLocalTime)}`);
        console.log(`⏱️ Global time: ${formatTime(timeTracker.totalGlobalTime)}`);
        
        // Initial display update
        updateTimeDisplay();
    }
    
    // Load local time from localStorage
    function loadLocalTime() {
        try {
            const stored = localStorage.getItem(TIME_CONFIG.localStorageKey);
            if (stored) {
                const data = JSON.parse(stored);
                timeTracker.totalLocalTime = data.totalTime || 0;
                console.log(`⏱️ Loaded local time: ${formatTime(timeTracker.totalLocalTime)}`);
            }
        } catch (e) {
            console.warn('⚠️ Could not load local time data:', e);
            timeTracker.totalLocalTime = 0;
        }
    }
    
    // Load initial global time from Supabase
    async function loadInitialTimeFromSupabase() {
        try {
            // Direct fetch - don't wait for SecureTimeTracker
            const response = await fetch('https://bxhcbyypjfzpuxhftppv.supabase.co/rest/v1/ball_defender_global_stats', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGNieXlwamZ6cHV4aGZ0cHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM4MTIsImV4cCI6MjA3MTQ2OTgxMn0.cOakT3KAfQiegW9YuAoS6pXXeo9u5C-xpriWVqLPpGs'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data[0] && data[0].total_time_played_ms > 0) {
                    timeTracker.totalGlobalTime = data[0].total_time_played_ms;
                    console.log(`⏱️ Loaded global time from Supabase: ${formatTime(timeTracker.totalGlobalTime)}`);
                    updateTimeDisplay();
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load initial global time from Supabase:', error);
        }
    }
    
    // Save local time to localStorage
    function saveLocalTime() {
        try {
            const data = {
                totalTime: timeTracker.totalLocalTime,
                lastPlayed: new Date().toISOString(),
                playerId: timeTracker.uniquePlayerId
            };
            localStorage.setItem(TIME_CONFIG.localStorageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ Could not save local time data:', e);
        }
    }
    
    // Start tracking time for a game session
    function startTracking() {
        if (timeTracker.isTracking) return;
        
        // Submit any pending session time before starting new session
        submitCurrentSessionToSupabase();
        
        timeTracker.sessionStartTime = Date.now();
        timeTracker.sessionTime = 0;
        timeTracker.currentSessionDuration = 0;
        timeTracker.isTracking = true;
        
        // Set up automatic saves and syncs
        timeTracker.saveInterval = setInterval(saveSessionProgress, TIME_CONFIG.saveInterval);
        timeTracker.syncInterval = setInterval(syncWithGist, TIME_CONFIG.syncInterval);
        
        // Set up Supabase submission every 3 minutes (180000ms)
        timeTracker.supabaseSubmitInterval = setInterval(submitIncrementalTimeToSupabase, 180000);
        
        console.log('⏱️ Started tracking game time with 3-minute Supabase submissions');
    }
    
    // Stop tracking time
    function stopTracking() {
        if (!timeTracker.isTracking) return;
        
        // Calculate final session time
        if (timeTracker.sessionStartTime) {
            timeTracker.sessionTime = Date.now() - timeTracker.sessionStartTime;
            timeTracker.totalLocalTime += timeTracker.sessionTime;
        }
        
        timeTracker.isTracking = false;
        timeTracker.sessionStartTime = null;
        
        // Clear intervals
        if (timeTracker.saveInterval) clearInterval(timeTracker.saveInterval);
        if (timeTracker.syncInterval) clearInterval(timeTracker.syncInterval);
        if (timeTracker.supabaseSubmitInterval) clearInterval(timeTracker.supabaseSubmitInterval);
        
        // Final save and submit any remaining session time
        saveLocalTime();
        submitCurrentSessionToSupabase();
        syncWithGist();
        
        console.log(`⏱️ Stopped tracking. Session time: ${formatTime(timeTracker.sessionTime)}`);
        console.log(`⏱️ Total local time: ${formatTime(timeTracker.totalLocalTime)}`);
    }
    
    // Save current session progress
    function saveSessionProgress() {
        if (timeTracker.isTracking && timeTracker.sessionStartTime) {
            const currentSessionTime = Date.now() - timeTracker.sessionStartTime;
            const tempTotalTime = timeTracker.totalLocalTime + currentSessionTime;
            
            try {
                const data = {
                    totalTime: tempTotalTime,
                    lastPlayed: new Date().toISOString(),
                    playerId: timeTracker.uniquePlayerId
                };
                localStorage.setItem(TIME_CONFIG.localStorageKey, JSON.stringify(data));
            } catch (e) {
                console.warn('⚠️ Could not save session progress:', e);
            }
        }
    }
    
    // Load global time from Supabase (preferred) or fallback to Gist
    async function loadGlobalTime() {
        try {
            // Try to load from Supabase first
            if (window.SecureTimeTracker && window.SecureTimeTracker.getGlobalStats) {
                const stats = await window.SecureTimeTracker.getGlobalStats();
                if (stats && stats.total_time_played_ms > 0) {
                    timeTracker.totalGlobalTime = stats.total_time_played_ms;
                    console.log(`⏱️ Loaded global time from Supabase: ${formatTime(timeTracker.totalGlobalTime)}`);
                    updateTimeDisplay(); // Trigger display update
                    return;
                }
            }
            
            // Fallback to Gist if Supabase is not available
            if (!window.GIST_CONFIG) {
                console.warn('⚠️ GIST_CONFIG not available for global time loading');
                return;
            }
            
            const response = await fetch(window.GIST_CONFIG.apiUrl, {
                headers: {
                    'Authorization': `token ${window.GIST_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const gistData = await response.json();
                const fileData = gistData.files[TIME_CONFIG.gistFile];
                
                if (fileData) {
                    const content = JSON.parse(fileData.content);
                    timeTracker.totalGlobalTime = content.totalGlobalTime || 0;
                    timeTracker.lastSyncTime = Date.now();
                    console.log(`⏱️ Loaded global time from Gist: ${formatTime(timeTracker.totalGlobalTime)}`);
                } else {
                    console.log('⏱️ Global time file not found in Gist, will create on first sync');
                }
            }
        } catch (e) {
            console.warn('⚠️ Could not load global time:', e);
        }
    }
    
    // Sync local time contribution to global Gist
    async function syncWithGist() {
        try {
            if (!window.GIST_CONFIG) {
                console.warn('⚠️ GIST_CONFIG not available for sync');
                return;
            }
            
            // First load current global data
            await loadGlobalTime();
            
            // Calculate current total local time (including active session)
            let currentLocalTotal = timeTracker.totalLocalTime;
            if (timeTracker.isTracking && timeTracker.sessionStartTime) {
                currentLocalTotal += (Date.now() - timeTracker.sessionStartTime);
            }
            
            // Prepare time contribution data
            const timeData = {
                totalGlobalTime: timeTracker.totalGlobalTime + currentLocalTotal,
                lastUpdated: new Date().toISOString(),
                contributors: {
                    [timeTracker.uniquePlayerId]: {
                        totalTime: currentLocalTotal,
                        lastActive: new Date().toISOString()
                    }
                }
            };
            
            // Create files object for Gist update
            const files = {};
            files[TIME_CONFIG.gistFile] = {
                content: JSON.stringify(timeData, null, 2)
            };
            
            // Update Gist
            const response = await fetch(window.GIST_CONFIG.apiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${window.GIST_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ files })
            });
            
            if (response.ok) {
                console.log(`⏱️ Synced time to Gist. Local: ${formatTime(currentLocalTotal)}, Global: ${formatTime(timeData.totalGlobalTime)}`);
                timeTracker.totalGlobalTime = timeData.totalGlobalTime;
                updateTimeDisplay();
            } else {
                console.warn('⚠️ Failed to sync time to Gist:', response.status);
            }
            
        } catch (e) {
            console.warn('⚠️ Error syncing time to Gist:', e);
        }
    }
    
    // Format time as professional counter clock (HHH:MM:SS with up to 999 hours for compact display)
    function formatTime(milliseconds) {
        if (!milliseconds) return '000:00:00';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
        
        // Clamp hours to 3 digits for compact display
        const clampedHours = Math.min(hours, 999);
        
        // Format with proper padding
        const pad = (num, digits) => String(num).padStart(digits, '0');
        
        return `${pad(clampedHours, 3)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
    }
    
    // Format time components for individual digit display
    function formatTimeComponents(milliseconds) {
        if (!milliseconds) return { hours: ['0','0','0','0','0','0'], minutes: ['0','0'], seconds: ['0','0'] };
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
        
        const clampedHours = Math.min(hours, 999999);
        const hoursStr = String(clampedHours).padStart(6, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');
        
        return {
            hours: hoursStr.split(''),
            minutes: minutesStr.split(''),
            seconds: secondsStr.split('')
        };
    }
    
    // Update the UI display
    function updateTimeDisplay() {
        // Calculate current local time including active session
        let currentLocalTotal = timeTracker.totalLocalTime;
        if (timeTracker.isTracking && timeTracker.sessionStartTime) {
            currentLocalTotal += (Date.now() - timeTracker.sessionStartTime);
        }
        
        // Update simple time displays
        const timeElement = document.getElementById('globalTimeDisplay');
        if (timeElement) {
            timeElement.textContent = formatTime(timeTracker.totalGlobalTime);
        }
        
        const localTimeElement = document.getElementById('localTimeDisplay');
        if (localTimeElement) {
            localTimeElement.textContent = formatTime(currentLocalTotal);
        }
        
        // Update component-based digital displays (disabled - handled by HTML system)
        // updateDigitalDisplay('globalTimeDigits', timeTracker.totalGlobalTime);
        // updateDigitalDisplay('localTimeDigits', currentLocalTotal);
        
        // Update tracking status indicator
        const indicator = document.getElementById('trackingIndicator');
        const statusText = document.getElementById('trackingStatus');
        if (indicator && statusText) {
            if (timeTracker.isTracking) {
                indicator.textContent = '●';
                indicator.className = 'status-dot tracking';
                statusText.textContent = 'RECORDING';
            } else {
                indicator.textContent = '●';
                indicator.className = 'status-dot idle';
                statusText.textContent = 'IDLE';
            }
        }
        
        // Add tracking animation to timer displays
        const localCounter = document.querySelector('.time-counter.personal');
        const globalCounter = document.querySelector('.time-counter.global');
        
        if (localCounter) {
            if (timeTracker.isTracking) {
                localCounter.classList.add('tracking');
            } else {
                localCounter.classList.remove('tracking');
            }
        }
        
        if (globalCounter) {
            if (timeTracker.isTracking) {
                globalCounter.classList.add('tracking');
            } else {
                globalCounter.classList.remove('tracking');
            }
        }
    }
    
    // Update compact digital display with individual digit elements including milliseconds
    function updateDigitalDisplay(containerId, milliseconds) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const ms = Math.floor(milliseconds % 1000 / 100); // Get tenths of seconds (0-9)
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
        
        // Clamp hours to 3 digits for compact display (999 max)
        const clampedHours = Math.min(hours, 999);
        const hoursStr = String(clampedHours).padStart(3, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');
        const msStr = String(ms);
        
        // Update hours (3 digits for compact view)
        const hourDigits = container.querySelectorAll('.hour-digit');
        hoursStr.split('').forEach((digit, index) => {
            if (hourDigits[index]) {
                if (hourDigits[index].textContent !== digit) {
                    hourDigits[index].textContent = digit;
                    hourDigits[index].classList.add('digit-flip');
                    setTimeout(() => hourDigits[index].classList.remove('digit-flip'), 200);
                }
            }
        });
        
        // Update minutes
        const minuteDigits = container.querySelectorAll('.minute-digit');
        minutesStr.split('').forEach((digit, index) => {
            if (minuteDigits[index]) {
                if (minuteDigits[index].textContent !== digit) {
                    minuteDigits[index].textContent = digit;
                    minuteDigits[index].classList.add('digit-flip');
                    setTimeout(() => minuteDigits[index].classList.remove('digit-flip'), 200);
                }
            }
        });
        
        // Update seconds
        const secondDigits = container.querySelectorAll('.second-digit');
        secondsStr.split('').forEach((digit, index) => {
            if (secondDigits[index]) {
                if (secondDigits[index].textContent !== digit) {
                    secondDigits[index].textContent = digit;
                    secondDigits[index].classList.add('digit-flip');
                    setTimeout(() => secondDigits[index].classList.remove('digit-flip'), 200);
                }
            }
        });
        
        // Update milliseconds (tenths of seconds for fast animation)
        const msDigits = container.querySelectorAll('.ms-digit');
        if (msDigits[0]) {
            if (msDigits[0].textContent !== msStr) {
                msDigits[0].textContent = msStr;
                msDigits[0].classList.add('digit-flip');
                setTimeout(() => msDigits[0].classList.remove('digit-flip'), 100);
            }
        }
        
        // Update the millisecond label
        const msLabels = container.querySelectorAll('.time-unit-small');
        if (msLabels[0]) {
            msLabels[0].textContent = ms + '0ms';
        }
    }
    
    // Setup display update interval
    function setupDisplayUpdate() {
        timeTracker.displayInterval = setInterval(updateTimeDisplay, TIME_CONFIG.updateDisplayInterval);

        // Refresh global time from Supabase every 30 seconds
        setInterval(refreshGlobalTime, 30000);
    }
    
    // Listen for game state changes
    function setupGameStateListeners() {
        // Listen for game start/stop events
        let lastGameState = window.gameState || 'idle';
        
        console.log(`⏱️ Initial game state: ${lastGameState}`);
        
        // Monitor game state changes
        setInterval(() => {
            const currentGameState = window.gameState || 'idle';
            
            // Debug logging
            if (currentGameState !== lastGameState) {
                console.log(`⏱️ Game state changed: ${lastGameState} → ${currentGameState}`);
            }
            
            // Start tracking when game state is 'playing'
            // Simplified detection - just check game state
            const isPlaying = currentGameState === 'playing';

            if (isPlaying && !timeTracker.isTracking) {
                console.log(`⏱️ Starting time tracking - game state: playing`);
                startTracking();
            }
            
            // Stop tracking when game stops playing
            if (currentGameState !== 'playing' && lastGameState === 'playing') {
                console.log(`⏱️ Stopping time tracking`);
                stopTracking();
            }
            
            // Additional safety check: stop tracking if we're clearly not in gameplay
            if (timeTracker.isTracking && currentGameState !== 'playing' && 
                (currentGameState === 'menu' || currentGameState === 'gameOver' || currentGameState === 'paused')) {
                console.log(`⏱️ Stopping tracking - not in active gameplay (${currentGameState})`);
                stopTracking();
            }
            
            lastGameState = currentGameState;
        }, 1000);
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (timeTracker.isTracking) {
                stopTracking();
            }
        });
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && timeTracker.isTracking) {
                stopTracking();
            }
        });
        
        // Handle game mode changes - stop tracking when switching games
        let lastSelectedMode = localStorage.getItem('ballDefender_selectedMode');
        setInterval(() => {
            const currentSelectedMode = localStorage.getItem('ballDefender_selectedMode');
            if (currentSelectedMode !== lastSelectedMode) {
                if (timeTracker.isTracking) {
                    console.log(`⏱️ Stopping tracking - game mode changed: ${lastSelectedMode} → ${currentSelectedMode}`);
                    stopTracking();
                }
                lastSelectedMode = currentSelectedMode;
            }
        }, 500);
    }
    
    // Update global time (called by Supabase tracker)
    function updateGlobalTime(newGlobalTime) {
        timeTracker.totalGlobalTime = newGlobalTime;
        console.log(`⏱️ Global time updated: ${formatTime(newGlobalTime)}`);
        updateTimeDisplay();
    }
    
    // Get current session time including active session
    function getCurrentSessionTime() {
        if (timeTracker.isTracking && timeTracker.sessionStartTime) {
            return timeTracker.totalLocalTime + (Date.now() - timeTracker.sessionStartTime);
        }
        return timeTracker.totalLocalTime;
    }
    
    // Get total time (used by HTML time display)
    function getTotalTime() {
        return getCurrentSessionTime();
    }
    
    // Submit incremental time every 3 minutes during gameplay
    async function submitIncrementalTimeToSupabase() {
        try {
            if (!window.SecureTimeTracker || !timeTracker.isTracking || !timeTracker.sessionStartTime) {
                return;
            }
            
            // Calculate current session duration
            const currentTime = Date.now();
            const totalSessionTime = currentTime - timeTracker.sessionStartTime;
            const incrementalTime = totalSessionTime - timeTracker.currentSessionDuration;
            
            // Only submit if we have at least 30 seconds of new time
            if (incrementalTime < 30000) {
                console.log('⏱️ Skipping incremental submission - less than 30 seconds of new time');
                return;
            }
            
            const gameMode = localStorage.getItem('ballDefender_selectedMode') || 'original';
            const sessionData = {
                player_id: timeTracker.uniquePlayerId,
                timestamp: new Date().toISOString(),
                game_version: '2.0.0',
                incremental: true,
                session_start: new Date(timeTracker.sessionStartTime).toISOString()
            };
            
            await window.SecureTimeTracker.submitSession(incrementalTime, gameMode, sessionData);
            console.log(`⏱️ Incremental time submitted to Supabase: ${formatTime(incrementalTime)} (3-minute interval)`);
            
            // Update the tracked session duration
            timeTracker.currentSessionDuration = totalSessionTime;
            
            // Refresh global time after submission
            await refreshGlobalTime();
            
        } catch (error) {
            console.warn('⚠️ Could not submit incremental time to Supabase:', error);
        }
    }

    // Submit current session when starting new game or switching
    async function submitCurrentSessionToSupabase() {
        try {
            if (!window.SecureTimeTracker) {
                return;
            }
            
            // Calculate any unsent session time
            let unsentTime = 0;
            if (timeTracker.isTracking && timeTracker.sessionStartTime) {
                const totalSessionTime = Date.now() - timeTracker.sessionStartTime;
                unsentTime = totalSessionTime - timeTracker.currentSessionDuration;
            } else if (timeTracker.sessionTime > 0) {
                // Use stored session time if tracking already stopped
                unsentTime = timeTracker.sessionTime - timeTracker.currentSessionDuration;
            }
            
            // Only submit if we have meaningful time (at least 5 seconds)
            if (unsentTime < 5000) {
                console.log('⏱️ No significant unsent time to submit');
                return;
            }
            
            const gameMode = localStorage.getItem('ballDefender_selectedMode') || 'original';
            const sessionData = {
                player_id: timeTracker.uniquePlayerId,
                timestamp: new Date().toISOString(),
                game_version: '2.0.0',
                final_submit: true
            };
            
            await window.SecureTimeTracker.submitSession(unsentTime, gameMode, sessionData);
            console.log(`⏱️ Final session time submitted to Supabase: ${formatTime(unsentTime)}`);
            
            // Reset tracking
            timeTracker.currentSessionDuration = 0;
            
            // Refresh global time after submission
            await refreshGlobalTime();
            
        } catch (error) {
            console.warn('⚠️ Could not submit current session to Supabase:', error);
        }
    }

    // Refresh global time from Supabase
    async function refreshGlobalTime() {
        try {
            const response = await fetch('https://bxhcbyypjfzpuxhftppv.supabase.co/rest/v1/ball_defender_global_stats', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGNieXlwamZ6cHV4aGZ0cHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM4MTIsImV4cCI6MjA3MTQ2OTgxMn0.cOakT3KAfQiegW9YuAoS6pXXeo9u5C-xpriWVqLPpGs'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data[0] && data[0].total_time_played_ms > 0) {
                    timeTracker.totalGlobalTime = data[0].total_time_played_ms;
                    console.log(`⏱️ Refreshed global time: ${formatTime(timeTracker.totalGlobalTime)}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not refresh global time:', error);
        }
        updateTimeDisplay();
    }
    
    // Public API
    window.GlobalTimeTracker = {
        initialize,
        startTracking,
        stopTracking,
        getLocalTime: () => timeTracker.totalLocalTime,
        getGlobalTime: () => timeTracker.totalGlobalTime,
        getCurrentSessionTime,
        getTotalTime,
        updateGlobalTime,
        refreshGlobalTime,
        formatTime,
        formatTimeComponents,
        syncWithGist,
        loadGlobalTime,
        updateTimeDisplay,
        updateDigitalDisplay,
        
        // Debugging and manual control
        isTracking: () => timeTracker.isTracking,
        getSessionTime: () => timeTracker.sessionTime,
        getCurrentState: () => ({
            isTracking: timeTracker.isTracking,
            sessionStartTime: timeTracker.sessionStartTime,
            sessionTime: timeTracker.sessionTime,
            totalLocalTime: timeTracker.totalLocalTime,
            totalGlobalTime: timeTracker.totalGlobalTime,
            gameState: window.gameState
        }),
        
        // Test functions
        testTimer: () => {
            console.log('⏱️ Testing timer functionality...');
            startTracking();
            setTimeout(() => {
                console.log('⏱️ Stopping test timer');
                stopTracking();
                updateTimeDisplay();
            }, 3000);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    console.log('⏱️ Global Time Tracker loaded successfully');
})();