// Debug Infinity Mirror Issue
console.log('🐛 DEBUG: Infinity Mirror Debug Script Loaded');

// Track DOM overlay creation
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    
    if (tagName.toLowerCase() === 'div') {
        // Track div creation with stack trace
        const stack = new Error().stack;
        if (stack.includes('addIceOverlay') || stack.includes('ice-overlay')) {
            console.log('🧊 DEBUG: Ice overlay div created!');
            console.log('📍 Stack trace:', stack);
            
            // Set a flag on the element so we can track it
            element._isIceOverlay = true;
            element._creationTime = Date.now();
        }
    }
    
    return element;
};

// Track appendChild calls for ice overlays
const originalAppendChild = Element.prototype.appendChild;
Element.prototype.appendChild = function(child) {
    if (child._isIceOverlay || (child.className && child.className.includes('ice-overlay'))) {
        console.log('🧊 DEBUG: Ice overlay being appended to DOM!');
        console.log('📍 Parent:', this);
        console.log('📍 Child:', child);
        console.log('📍 Current ice overlays in DOM:', document.querySelectorAll('.ice-overlay').length);
        
        // Get stack trace
        const stack = new Error().stack;
        console.log('📍 Append stack:', stack);
    }
    
    return originalAppendChild.call(this, child);
};

// Monitor startGame calls
if (window.startGame) {
    const originalStartGame = window.startGame;
    window.startGame = function() {
        console.log('🎮 DEBUG: startGame() called!');
        console.log('📍 Current ice overlays before startGame:', document.querySelectorAll('.ice-overlay').length);
        
        const result = originalStartGame.apply(this, arguments);
        
        setTimeout(() => {
            console.log('📍 Ice overlays after startGame (100ms later):', document.querySelectorAll('.ice-overlay').length);
        }, 100);
        
        return result;
    };
}

// Monitor ice mode activation
setInterval(() => {
    const overlayCount = document.querySelectorAll('.ice-overlay').length;
    if (overlayCount > 0) {
        console.log(`🧊 DEBUG: Current ice overlay count: ${overlayCount}`);
        
        // Check if overlays are stacking
        if (overlayCount > 10) {
            console.error('🚨 INFINITY MIRROR DETECTED! More than 10 overlays present');
            
            // Get all overlays and show their positions
            const overlays = document.querySelectorAll('.ice-overlay');
            overlays.forEach((overlay, index) => {
                console.log(`📍 Overlay ${index}:`, {
                    left: overlay.style.left,
                    top: overlay.style.top,
                    width: overlay.style.width,
                    height: overlay.style.height,
                    parent: overlay.parentElement
                });
            });
        }
    }
}, 2000);

// Monitor freeze system state
setInterval(() => {
    if (window.iceMode) {
        console.log('🧊 DEBUG: Ice Mode State:', {
            frozenBlocksCount: window.iceMode.frozenBlocks?.size || 0,
            timersCount: window.iceMode.freezeTimers?.size || 0,
            isFreezing: window.iceMode.isFreezing
        });
    }
}, 3000);

// Check if cleanup is being called
if (window.iceMode && window.iceMode.gameRestartCleanup) {
    const originalCleanup = window.iceMode.gameRestartCleanup;
    window.iceMode.gameRestartCleanup = function() {
        console.log('🧹 DEBUG: gameRestartCleanup() called!');
        console.log('📍 Overlays before cleanup:', document.querySelectorAll('.ice-overlay').length);
        
        const result = originalCleanup.apply(this, arguments);
        
        setTimeout(() => {
            console.log('📍 Overlays after cleanup:', document.querySelectorAll('.ice-overlay').length);
        }, 100);
        
        return result;
    };
}

console.log('✅ DEBUG: Infinity mirror debugging active');