/**
 * Time Tracker Plugin - Beautiful time management
 * Tracks session and global play time with state awareness
 */

class TimeTrackerPlugin {
    constructor() {
        this.sessionStartTime = null;
        this.sessionTime = 0;
        this.totalLocalTime = 0;
        this.totalGlobalTime = 0;
        this.isTracking = false;
        this.displayInterval = null;
        this.saveInterval = null;
        
        this.config = {
            localStorageKey: 'ballDefender_LocalTimePlayed',
            saveInterval: 10000, // Save every 10 seconds
            displayInterval: 100 // Update display every 100ms
        };
    }
    
    initialize(engine) {
        this.engine = engine;
        this.loadLocalTime();
        this.setupGlobalAPI();
        this.setupDisplayUpdate();
        console.log('⏱️ Time Tracker plugin initialized');
    }
    
    setupGlobalAPI() {
        // Expose GlobalTimeTracker for HTML compatibility
        window.GlobalTimeTracker = {
            getCurrentSessionTime: () => this.getCurrentSessionTime(),
            getGlobalTime: () => this.totalGlobalTime,
            getLocalTime: () => this.totalLocalTime,
            getCurrentState: () => ({
                sessionTime: this.sessionTime,
                totalLocalTime: this.totalLocalTime,
                totalGlobalTime: this.totalGlobalTime,
                isTracking: this.isTracking
            }),
            
            formatTime: (milliseconds) => this.formatTime(milliseconds),
            formatTimeCompact: (milliseconds) => this.formatTimeCompact(milliseconds),
            
            startTracking: () => this.startTracking(),
            stopTracking: () => this.stopTracking()
        };
        
        console.log('⏱️ Global time tracker API configured');
    }
    
    // State-aware time tracking
    onStateChange(oldState, newState) {
        switch (newState) {
            case 'playing':
                this.startTracking();
                break;
            case 'menu':
            case 'paused':
            case 'gameOver':
                this.stopTracking();
                break;
        }
    }
    
    startTracking() {
        if (this.isTracking) return;
        
        this.isTracking = true;
        this.sessionStartTime = Date.now();
        
        // Start save interval
        this.saveInterval = setInterval(() => {
            this.saveLocalTime();
        }, this.config.saveInterval);
        
        console.log('⏱️ Time tracking started');
    }
    
    stopTracking() {
        if (!this.isTracking) return;
        
        this.isTracking = false;
        
        // Add session time to totals
        if (this.sessionStartTime) {
            this.sessionTime = Date.now() - this.sessionStartTime;
            this.totalLocalTime += this.sessionTime;
        }
        
        // Clear intervals
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
        
        // Save immediately
        this.saveLocalTime();
        
        console.log(`⏱️ Time tracking stopped. Session: ${this.formatTime(this.sessionTime)}`);
    }
    
    getCurrentSessionTime() {
        if (!this.isTracking || !this.sessionStartTime) {
            return this.sessionTime;
        }
        
        return Date.now() - this.sessionStartTime;
    }
    
    setupDisplayUpdate() {
        // Update display every 100ms for smooth counters
        this.displayInterval = setInterval(() => {
            this.updateTimeDisplays();
        }, this.config.displayInterval);
    }
    
    updateTimeDisplays() {
        // Update HTML time displays if they exist
        const localTimeElement = document.getElementById('localTimeDigits');
        const globalTimeElement = document.getElementById('globalTimeDigits');
        
        if (localTimeElement) {
            this.updateDigitalTime('localTimeDigits', Math.floor(this.getCurrentSessionTime() / 1000), false);
        }
        
        if (globalTimeElement) {
            this.updateDigitalTime('globalTimeDigits', Math.floor(this.totalGlobalTime / 1000), true);
        }
    }
    
    updateDigitalTime(containerId, totalSeconds, isGlobal = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Update hour digits
        const hourDigits = container.querySelectorAll('.hour-digit');
        if (isGlobal) {
            // Global time has 3 hour digits (000-999)
            const hourStr = String(hours).padStart(3, '0');
            hourDigits.forEach((digit, index) => {
                digit.textContent = hourStr[index] || '0';
            });
        } else {
            // Local time has 2 hour digits (00-99)
            const hourStr = String(hours).padStart(2, '0');
            hourDigits.forEach((digit, index) => {
                digit.textContent = hourStr[index] || '0';
            });
        }

        // Update minute digits
        const minuteDigits = container.querySelectorAll('.minute-digit');
        const minuteStr = String(minutes).padStart(2, '0');
        minuteDigits.forEach((digit, index) => {
            digit.textContent = minuteStr[index] || '0';
        });

        // Update second digits (only for local time)
        if (!isGlobal) {
            const secondDigits = container.querySelectorAll('.second-digit');
            const secondStr = String(seconds).padStart(2, '0');
            secondDigits.forEach((digit, index) => {
                digit.textContent = secondStr[index] || '0';
            });
        }
    }
    
    loadLocalTime() {
        try {
            const saved = localStorage.getItem(this.config.localStorageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.totalLocalTime = data.totalTime || 0;
                console.log(`⏱️ Loaded local time: ${this.formatTime(this.totalLocalTime)}`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load local time:', error);
        }
    }
    
    saveLocalTime() {
        try {
            const data = {
                totalTime: this.totalLocalTime,
                lastUpdated: Date.now()
            };
            localStorage.setItem(this.config.localStorageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ Failed to save local time:', error);
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    formatTimeCompact(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Cleanup
    destroy() {
        if (this.displayInterval) {
            clearInterval(this.displayInterval);
        }
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        this.stopTracking();
    }
}

// Export
window.TimeTrackerPlugin = TimeTrackerPlugin;
console.log('⏱️ Beautiful Time Tracker Plugin loaded');