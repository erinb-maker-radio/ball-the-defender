/**
 * BALL DEFENDER AUTO-UPDATER SYSTEM
 * =================================
 * Automatically checks for and downloads updates from GitHub
 * Provides seamless update experience for end users
 */

console.log('🔄 Auto-Updater System Loading...');

// Configuration
const UPDATE_CONFIG = {
    // GitHub repository information
    GITHUB_USER: 'your-username',  // UPDATE THIS
    GITHUB_REPO: 'ball-defender-game',  // UPDATE THIS
    BRANCH: 'master',
    
    // Update check frequency
    CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
    STARTUP_CHECK_DELAY: 3000, // 3 seconds after startup
    
    // Version info
    CURRENT_VERSION: '8.6.0',
    VERSION_FILE: 'version.json',
    
    // Files to update (core game files)
    UPDATEABLE_FILES: [
        'game.js',
        'performance-optimizer.js',
        'ball-detonator.js',
        'ice-mode-proper.js',
        'ball-go-boom-mode-proper.js',
        'original-mode-proper.js',
        'mode-template-system.js',
        'working-gist-writer.js',
        'style.css',
        'index.html'
    ],
    
    // Files to never update (user settings, local data)
    PROTECTED_FILES: [
        'local-settings.json',
        'user-preferences.js'
    ]
};

// Update state
const updateState = {
    isChecking: false,
    isUpdating: false,
    lastCheck: null,
    availableUpdate: null,
    updateProgress: 0,
    failedAttempts: 0
};

// Check for updates from GitHub
async function checkForUpdates(silent = false) {
    if (updateState.isChecking || updateState.isUpdating) {
        console.log('⚠️ Update check already in progress');
        return;
    }
    
    updateState.isChecking = true;
    updateState.lastCheck = new Date();
    
    if (!silent) {
        console.log('🔍 Checking for Ball Defender updates...');
        showUpdateStatus('Checking for updates...', 'info');
    }
    
    try {
        // Check version from GitHub
        const versionUrl = `https://raw.githubusercontent.com/${UPDATE_CONFIG.GITHUB_USER}/${UPDATE_CONFIG.GITHUB_REPO}/${UPDATE_CONFIG.BRANCH}/ball-defender-deploy/version.json`;
        
        const response = await fetch(versionUrl, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch version info: ${response.status}`);
        }
        
        const remoteVersion = await response.json();
        
        console.log(`📦 Current version: ${UPDATE_CONFIG.CURRENT_VERSION}`);
        console.log(`🌐 Remote version: ${remoteVersion.version}`);
        
        if (isNewerVersion(remoteVersion.version, UPDATE_CONFIG.CURRENT_VERSION)) {
            updateState.availableUpdate = remoteVersion;
            
            if (!silent) {
                showUpdateNotification(remoteVersion);
            }
            
            console.log(`✨ Update available: ${remoteVersion.version}`);
            console.log(`📝 Changes: ${remoteVersion.description || 'Bug fixes and improvements'}`);
            
            return true; // Update available
        } else {
            if (!silent) {
                showUpdateStatus('Game is up to date!', 'success');
                setTimeout(() => hideUpdateStatus(), 3000);
            }
            
            console.log('✅ Game is up to date');
            return false; // No update needed
        }
        
    } catch (error) {
        console.error('❌ Update check failed:', error);
        updateState.failedAttempts++;
        
        if (!silent) {
            showUpdateStatus('Update check failed. Playing offline.', 'warning');
            setTimeout(() => hideUpdateStatus(), 5000);
        }
        
        return false;
    } finally {
        updateState.isChecking = false;
    }
}

// Compare version strings (semantic versioning)
function isNewerVersion(remote, current) {
    const parseVersion = (v) => v.split('.').map(n => parseInt(n, 10));
    const remoteVer = parseVersion(remote);
    const currentVer = parseVersion(current);
    
    for (let i = 0; i < Math.max(remoteVer.length, currentVer.length); i++) {
        const r = remoteVer[i] || 0;
        const c = currentVer[i] || 0;
        
        if (r > c) return true;
        if (r < c) return false;
    }
    
    return false;
}

// Download and apply updates
async function downloadUpdate() {
    if (updateState.isUpdating) {
        console.log('⚠️ Update already in progress');
        return;
    }
    
    if (!updateState.availableUpdate) {
        console.log('❌ No update available to download');
        return;
    }
    
    updateState.isUpdating = true;
    updateState.updateProgress = 0;
    
    console.log(`📥 Downloading Ball Defender ${updateState.availableUpdate.version}...`);
    showUpdateStatus('Downloading update...', 'info');
    
    try {
        const baseUrl = `https://raw.githubusercontent.com/${UPDATE_CONFIG.GITHUB_USER}/${UPDATE_CONFIG.GITHUB_REPO}/${UPDATE_CONFIG.BRANCH}/ball-defender-deploy/`;
        const filesToUpdate = UPDATE_CONFIG.UPDATEABLE_FILES;
        const totalFiles = filesToUpdate.length;
        let completedFiles = 0;
        
        for (const filename of filesToUpdate) {
            try {
                console.log(`📄 Updating ${filename}...`);
                showUpdateStatus(`Updating ${filename}...`, 'info');
                
                const fileUrl = baseUrl + filename;
                const response = await fetch(fileUrl, {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (!response.ok) {
                    console.warn(`⚠️ Failed to update ${filename}: ${response.status}`);
                    continue;
                }
                
                const content = await response.text();
                
                // For HTML files, inject them into the DOM
                if (filename.endsWith('.html')) {
                    updateHTMLContent(content);
                }
                // For CSS files, update stylesheets
                else if (filename.endsWith('.css')) {
                    updateCSS(content);
                }
                // For JS files, reload scripts
                else if (filename.endsWith('.js')) {
                    await updateJavaScript(filename, content);
                }
                
                completedFiles++;
                updateState.updateProgress = (completedFiles / totalFiles) * 100;
                
                console.log(`✅ Updated ${filename} (${completedFiles}/${totalFiles})`);
                
            } catch (error) {
                console.error(`❌ Failed to update ${filename}:`, error);
            }
        }
        
        // Update version info
        UPDATE_CONFIG.CURRENT_VERSION = updateState.availableUpdate.version;
        updateState.availableUpdate = null;
        
        console.log('🎉 Update completed successfully!');
        showUpdateStatus('Update completed! Refresh recommended.', 'success');
        
        // Offer to refresh the page
        setTimeout(() => {
            if (confirm('Ball Defender has been updated! Refresh the page to use the latest version?')) {
                window.location.reload();
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Update failed:', error);
        showUpdateStatus('Update failed. Game will continue with current version.', 'error');
    } finally {
        updateState.isUpdating = false;
        setTimeout(() => hideUpdateStatus(), 10000);
    }
}

// Update CSS dynamically
function updateCSS(newCSS) {
    // Find existing stylesheet or create new one
    let stylesheet = document.getElementById('game-stylesheet');
    if (!stylesheet) {
        stylesheet = document.createElement('style');
        stylesheet.id = 'game-stylesheet';
        document.head.appendChild(stylesheet);
    }
    
    stylesheet.textContent = newCSS;
    console.log('🎨 CSS updated dynamically');
}

// Update JavaScript files dynamically
async function updateJavaScript(filename, content) {
    // Remove existing script if present
    const existingScript = document.querySelector(`script[data-filename="${filename}"]`);
    if (existingScript) {
        existingScript.remove();
    }
    
    // Create new script element
    const script = document.createElement('script');
    script.setAttribute('data-filename', filename);
    script.textContent = content;
    
    // Add to document
    document.body.appendChild(script);
    
    console.log(`🔧 JavaScript updated: ${filename}`);
}

// Update HTML content (for major changes)
function updateHTMLContent(newHTML) {
    console.log('🔄 HTML update detected - page refresh recommended');
    // For HTML updates, we typically need a page refresh
    // Store the new HTML for next page load
    localStorage.setItem('pendingHTMLUpdate', newHTML);
}

// Create update UI
function createUpdateUI() {
    // Create update status bar
    const statusBar = document.createElement('div');
    statusBar.id = 'update-status-bar';
    statusBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #333;
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        display: none;
    `;
    
    document.body.appendChild(statusBar);
    
    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10001;
        font-family: Arial, sans-serif;
        max-width: 300px;
        display: none;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .update-button {
            background: #fff;
            color: #333;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin: 5px;
            transition: background 0.2s;
        }
        
        .update-button:hover {
            background: #f0f0f0;
        }
    `;
    document.head.appendChild(style);
}

// Show update status
function showUpdateStatus(message, type = 'info') {
    const statusBar = document.getElementById('update-status-bar');
    if (!statusBar) return;
    
    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
    };
    
    statusBar.style.background = colors[type] || colors.info;
    statusBar.textContent = message;
    statusBar.style.display = 'block';
    statusBar.style.transform = 'translateY(0)';
}

// Hide update status
function hideUpdateStatus() {
    const statusBar = document.getElementById('update-status-bar');
    if (statusBar) {
        statusBar.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            statusBar.style.display = 'none';
        }, 300);
    }
}

// Show update notification
function showUpdateNotification(versionInfo) {
    const notification = document.getElementById('update-notification');
    if (!notification) return;
    
    notification.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>🎮 Ball Defender Update Available!</strong>
        </div>
        <div style="margin-bottom: 10px; font-size: 12px;">
            Version ${versionInfo.version}<br>
            ${versionInfo.description || 'Bug fixes and improvements'}
        </div>
        <div>
            <button class="update-button" onclick="downloadUpdate()">Update Now</button>
            <button class="update-button" onclick="dismissUpdate()">Later</button>
        </div>
    `;
    
    notification.style.display = 'block';
}

// Dismiss update notification
function dismissUpdate() {
    const notification = document.getElementById('update-notification');
    if (notification) {
        notification.style.display = 'none';
    }
}

// Initialize auto-updater
function initializeAutoUpdater() {
    console.log('🚀 Initializing Ball Defender Auto-Updater...');
    
    // Create UI elements
    createUpdateUI();
    
    // Initial update check after delay
    setTimeout(() => {
        checkForUpdates(true); // Silent check on startup
    }, UPDATE_CONFIG.STARTUP_CHECK_DELAY);
    
    // Set up periodic checks
    setInterval(() => {
        checkForUpdates(true); // Silent periodic checks
    }, UPDATE_CONFIG.CHECK_INTERVAL);
    
    // Manual update check function
    window.checkForUpdates = () => checkForUpdates(false);
    window.downloadUpdate = downloadUpdate;
    window.dismissUpdate = dismissUpdate;
    
    console.log('✅ Auto-Updater initialized');
    console.log('🔧 Manual commands: window.checkForUpdates(), window.downloadUpdate()');
}

// Start auto-updater when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoUpdater);
} else {
    initializeAutoUpdater();
}

// Export for debugging
window.AutoUpdater = {
    config: UPDATE_CONFIG,
    state: updateState,
    checkForUpdates,
    downloadUpdate,
    dismissUpdate
};

console.log('🔄 Auto-Updater System loaded - updates will be checked automatically!');