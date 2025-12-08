// Force Canvas Clear - DISABLED (no longer needed)
// This aggressive system was created to fix trail issues but is now unnecessary
// The game properly clears the canvas without this intervention

(function() {
    // System disabled - the game now properly clears canvas without aggressive overrides
    return;
    
    let clearForced = false;
    
    function aggressiveCanvasFix() {
        const checkInterval = setInterval(() => {
            if (window.canvas && window.ctx && !clearForced) {
                console.log('🔥 FORCE: Applying aggressive canvas clearing...');
                
                // Store original fillRect to detect when drawing starts
                const originalFillRect = window.ctx.fillRect;
                const originalDrawImage = window.ctx.drawImage;
                const originalBeginPath = window.ctx.beginPath;
                const originalArc = window.ctx.arc;
                const originalFill = window.ctx.fill;
                const originalStroke = window.ctx.stroke;
                
                let drawingStarted = false;
                
                // Override ALL drawing operations to clear first
                window.ctx.fillRect = function(x, y, w, h) {
                    if (!drawingStarted) {
                        drawingStarted = true;
                        // FORCE clear the entire canvas before ANY drawing
                        this.clearRect(0, 0, window.canvas.width, window.canvas.height);
                        console.log('🔥 FORCE: Canvas cleared before fillRect');
                    }
                    return originalFillRect.call(this, x, y, w, h);
                };
                
                window.ctx.drawImage = function(...args) {
                    if (!drawingStarted) {
                        drawingStarted = true;
                        this.clearRect(0, 0, window.canvas.width, window.canvas.height);
                        console.log('🔥 FORCE: Canvas cleared before drawImage');
                    }
                    return originalDrawImage.apply(this, args);
                };
                
                window.ctx.beginPath = function() {
                    if (!drawingStarted) {
                        drawingStarted = true;
                        this.clearRect(0, 0, window.canvas.width, window.canvas.height);
                        console.log('🔥 FORCE: Canvas cleared before beginPath');
                    }
                    return originalBeginPath.call(this);
                };
                
                window.ctx.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
                    if (!drawingStarted) {
                        drawingStarted = true;
                        this.clearRect(0, 0, window.canvas.width, window.canvas.height);
                        console.log('🔥 FORCE: Canvas cleared before arc');
                    }
                    return originalArc.call(this, x, y, radius, startAngle, endAngle, anticlockwise);
                };
                
                window.ctx.fill = function() {
                    if (!drawingStarted) {
                        drawingStarted = true;
                        this.clearRect(0, 0, window.canvas.width, window.canvas.height);
                        console.log('🔥 FORCE: Canvas cleared before fill');
                    }
                    return originalFill.call(this);
                };
                
                window.ctx.stroke = function() {
                    if (!drawingStarted) {
                        drawingStarted = true;
                        this.clearRect(0, 0, window.canvas.width, window.canvas.height);
                        console.log('🔥 FORCE: Canvas cleared before stroke');
                    }
                    return originalStroke.call(this);
                };
                
                // Override requestAnimationFrame to reset the drawing flag
                const originalRAF = window.requestAnimationFrame;
                window.requestAnimationFrame = function(callback) {
                    return originalRAF.call(this, function() {
                        drawingStarted = false; // Reset for next frame
                        return callback.apply(this, arguments);
                    });
                };
                
                // Nuclear option: Clear canvas every 16ms regardless
                const forceClearInterval = setInterval(() => {
                    if (window.ctx && window.canvas) {
                        window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
                    }
                }, 16); // 60 FPS clearing
                
                // Stop after 30 seconds to avoid performance issues
                setTimeout(() => {
                    clearInterval(forceClearInterval);
                    console.log('🔥 FORCE: Stopping nuclear clear interval after 30 seconds');
                }, 30000);
                
                clearForced = true;
                clearInterval(checkInterval);
                
                console.log('✅ FORCE: Aggressive canvas clearing applied - trails WILL be eliminated');
                
                // Test function
                window.testCanvasClear = function() {
                    console.log('🔥 Testing aggressive clear...');
                    if (window.ctx && window.canvas) {
                        window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
                        window.ctx.fillStyle = 'red';
                        window.ctx.fillRect(10, 10, 100, 100);
                        setTimeout(() => {
                            window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
                            console.log('✅ Clear test completed');
                        }, 1000);
                    }
                };
            }
        }, 50);
        
        // Safety timeout
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 10000);
    }
    
    // Start immediately and on DOM ready
    aggressiveCanvasFix();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aggressiveCanvasFix);
    }
    
    console.log('🔥 Force Canvas Clear ready - NUCLEAR trail elimination mode');
    console.log('💡 Type testCanvasClear() to test clearing');
    
})();