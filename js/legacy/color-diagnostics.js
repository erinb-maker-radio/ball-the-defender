// COLOR DIAGNOSTICS - Comprehensive testing and logging system
(function() {
    console.log('🔍 COLOR DIAGNOSTICS SYSTEM STARTING...');
    
    // Create diagnostic panel
    function createDiagnosticPanel() {
        const panel = document.createElement('div');
        panel.id = 'colorDiagnosticPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 10px;
            border: 2px solid #00ff00;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 400px;
            overflow-y: auto;
        `;
        panel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #00ff00;">🔍 COLOR DIAGNOSTICS</h3>
            <div id="diagnosticContent"></div>
            <button id="testColorsBtn" style="margin-top: 10px; width: 100%;">TEST COLORS NOW</button>
            <button id="interceptRenderBtn" style="margin-top: 5px; width: 100%;">INTERCEPT RENDER</button>
            <button id="forceVolcanicBtn" style="margin-top: 5px; width: 100%;">FORCE VOLCANIC</button>
        `;
        document.body.appendChild(panel);
        
        // Add button handlers
        document.getElementById('testColorsBtn').onclick = runColorTest;
        document.getElementById('interceptRenderBtn').onclick = interceptRendering;
        document.getElementById('forceVolcanicBtn').onclick = forceVolcanicColors;
        
        return panel;
    }
    
    // Update diagnostic display
    function updateDiagnostics(data) {
        const content = document.getElementById('diagnosticContent');
        if (!content) return;
        
        const html = Object.entries(data).map(([key, value]) => {
            let displayValue = value;
            if (typeof value === 'object' && value !== null) {
                displayValue = JSON.stringify(value, null, 2);
            }
            return `<div><strong>${key}:</strong> <span style="color: yellow;">${displayValue}</span></div>`;
        }).join('');
        
        content.innerHTML = html;
    }
    
    // Run comprehensive color test
    function runColorTest() {
        console.log('🧪 RUNNING COLOR TEST...');
        
        const diagnostics = {};
        
        // 1. Check if colors object exists
        diagnostics['colors exists'] = !!window.colors;
        
        // 2. Check current game mode
        diagnostics['currentGameMode'] = window.currentGameMode ? window.currentGameMode.id : 'undefined';
        diagnostics['mode is ballGoBoom'] = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
        
        // 3. Check colors.blockByHP
        if (window.colors && window.colors.blockByHP) {
            diagnostics['HP 1 color'] = window.colors.blockByHP[1] ? window.colors.blockByHP[1].base : 'undefined';
            diagnostics['HP 5 color'] = window.colors.blockByHP[5] ? window.colors.blockByHP[5].base : 'undefined';
        }
        
        // 4. Check if blocks exist
        diagnostics['blocks array exists'] = !!window.blocks;
        diagnostics['block count'] = window.blocks ? window.blocks.length : 0;
        
        // 5. Sample first block if exists
        if (window.blocks && window.blocks.length > 0) {
            const firstBlock = window.blocks[0];
            diagnostics['first block HP'] = firstBlock.hitPoints;
            diagnostics['first block destroyed'] = firstBlock.destroyed;
        }
        
        // 6. Check canvas
        const canvas = document.getElementById('gameCanvas');
        diagnostics['canvas exists'] = !!canvas;
        
        // 7. Check game state
        diagnostics['gameState'] = window.gameState || 'undefined';
        
        // 8. Check if our volcanic colors are defined in game.js
        diagnostics['game.js modified'] = checkIfGameJsModified();
        
        updateDiagnostics(diagnostics);
        console.log('📊 COLOR TEST RESULTS:', diagnostics);
        
        return diagnostics;
    }
    
    // Check if game.js has our modifications
    function checkIfGameJsModified() {
        // Try to find our boom colors in the game loop
        if (window.gameLoop && window.gameLoop.toString) {
            const funcString = window.gameLoop.toString();
            return funcString.includes('ballGoBoom') || funcString.includes('FF4500');
        }
        return false;
    }
    
    // Intercept and log rendering calls
    function interceptRendering() {
        console.log('🎯 INTERCEPTING RENDERING...');
        
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('❌ Canvas not found!');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ Context not found!');
            return;
        }
        
        // Store original methods
        const originalFillStyle = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
        const originalFillRect = ctx.fillRect;
        const originalCreateLinearGradient = ctx.createLinearGradient;
        
        // Track fill colors
        let fillColorLog = [];
        
        // Override fillStyle setter to log colors
        Object.defineProperty(ctx, 'fillStyle', {
            set: function(value) {
                if (typeof value === 'string' && value.includes('#')) {
                    fillColorLog.push(value);
                    console.log('🎨 fillStyle set to:', value);
                    
                    // Check if it's a green/yellow color (original) vs red/orange (boom)
                    if (value.includes('4CAF50') || value.includes('8BC34A') || value.includes('FFEB3B')) {
                        console.warn('⚠️ ORIGINAL COLOR DETECTED:', value);
                    } else if (value.includes('FF4500') || value.includes('FF6600') || value.includes('FFD700')) {
                        console.log('✅ BOOM COLOR DETECTED:', value);
                    }
                }
                originalFillStyle.set.call(this, value);
            },
            get: originalFillStyle.get
        });
        
        // Override createLinearGradient to log gradient colors
        ctx.createLinearGradient = function(...args) {
            const gradient = originalCreateLinearGradient.apply(this, args);
            const originalAddColorStop = gradient.addColorStop;
            
            gradient.addColorStop = function(offset, color) {
                console.log(`🌈 Gradient color at ${offset}:`, color);
                
                // Check color type
                if (color.includes('4CAF50') || color.includes('8BC34A')) {
                    console.warn('⚠️ ORIGINAL GRADIENT COLOR:', color);
                } else if (color.includes('FF4500') || color.includes('FF6600')) {
                    console.log('✅ BOOM GRADIENT COLOR:', color);
                }
                
                return originalAddColorStop.call(this, offset, color);
            };
            
            return gradient;
        };
        
        console.log('✅ Rendering interception active! Watch console for color logs.');
        
        // Show last 10 colors in diagnostic panel
        setInterval(() => {
            if (fillColorLog.length > 0) {
                updateDiagnostics({
                    'Last fill colors': fillColorLog.slice(-5).join(', '),
                    'Total fills': fillColorLog.length
                });
            }
        }, 1000);
    }
    
    // Force volcanic colors by directly modifying the colors object
    function forceVolcanicColors() {
        console.log('🌋 FORCING VOLCANIC COLORS...');
        
        if (!window.colors || !window.colors.blockByHP) {
            console.error('❌ Colors object not found!');
            return;
        }
        
        // Volcanic colors
        const volcanicColors = {
            1: { base: '#FF4500', glow: '#FF8C00', shadow: '#B22222' },
            2: { base: '#FF6600', glow: '#FFA500', shadow: '#CC3300' },
            3: { base: '#FFD700', glow: '#FFFF00', shadow: '#FF8800' },
            4: { base: '#FF0000', glow: '#FF4444', shadow: '#990000' },
            5: { base: '#DC143C', glow: '#FF1493', shadow: '#8B0000' },
            6: { base: '#FF69B4', glow: '#FF00FF', shadow: '#CC0066' },
            7: { base: '#8B0000', glow: '#FF4500', shadow: '#660000' },
            8: { base: '#B22222', glow: '#FF6347', shadow: '#800000' },
            9: { base: '#FF7F50', glow: '#FF6347', shadow: '#CD5C5C' },
            10: { base: '#FF8C00', glow: '#FFD700', shadow: '#FF6600' },
            default: { base: '#4B0082', glow: '#8B00FF', shadow: '#2E0054' }
        };
        
        // Force replace all colors
        Object.keys(volcanicColors).forEach(key => {
            window.colors.blockByHP[key] = volcanicColors[key];
        });
        
        console.log('✅ Volcanic colors forced!');
        console.log('🔍 New HP 1 color:', window.colors.blockByHP[1]);
        console.log('🔍 New HP 5 color:', window.colors.blockByHP[5]);
        
        // Update diagnostics
        updateDiagnostics({
            'Forced': 'YES',
            'HP 1': window.colors.blockByHP[1].base,
            'HP 5': window.colors.blockByHP[5].base
        });
    }
    
    // Monitor mode changes
    function monitorModeChanges() {
        let lastMode = null;
        
        setInterval(() => {
            const currentMode = window.currentGameMode ? window.currentGameMode.id : null;
            
            if (currentMode !== lastMode) {
                console.log(`🔄 MODE CHANGED: ${lastMode} -> ${currentMode}`);
                lastMode = currentMode;
                
                // Run test when mode changes
                runColorTest();
            }
        }, 500);
    }
    
    // Initialize diagnostics
    function initialize() {
        console.log('🔍 Initializing Color Diagnostics...');
        
        // Create panel
        createDiagnosticPanel();
        
        // Start monitoring
        monitorModeChanges();
        
        // Initial test
        setTimeout(runColorTest, 1000);
        
        console.log('✅ Color Diagnostics Ready!');
        console.log('💡 Use the diagnostic panel on screen or these commands:');
        console.log('  - runColorTest() - Run comprehensive test');
        console.log('  - interceptRendering() - Log all render colors');
        console.log('  - forceVolcanicColors() - Force volcanic colors');
    }
    
    // Make functions globally available
    window.runColorTest = runColorTest;
    window.interceptRendering = interceptRendering;
    window.forceVolcanicColors = forceVolcanicColors;
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();