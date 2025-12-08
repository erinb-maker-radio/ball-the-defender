/**
 * CANVAS SIZE OPTIMIZER FOR BALL DEFENDER
 * ======================================
 * Provides manual controls for canvas size to improve performance
 */

console.log('📐 Canvas Size Optimizer Loading...');

// Canvas size presets for different performance needs
const CANVAS_PRESETS = {
    performance: { width: 800, height: 600, name: 'Performance (800x600)', stretch: false },
    'performance-stretched': { width: 800, height: 600, name: 'Performance Stretched (800x600 → Large)', stretch: true },
    balanced: { width: 1000, height: 750, name: 'Balanced (1000x750)', stretch: false },
    'balanced-stretched': { width: 1000, height: 750, name: 'Balanced Stretched (1000x750 → Large)', stretch: true },
    quality: { width: 1200, height: 900, name: 'Quality (1200x900)', stretch: false },
    auto: { width: 'auto', height: 'auto', name: 'Auto (Dynamic)', stretch: false }
};

// Canvas stretching functions
function applyCanvasStretching(canvas, config) {
    console.log('🔍 Applying canvas stretching...');
    
    // Calculate target display size (maximize available space)
    const availableWidth = window.innerWidth - 330; // Account for sidebar
    const availableHeight = window.innerHeight - 20;
    
    // Maintain aspect ratio while maximizing size
    const canvasAspectRatio = config.width / config.height;
    let displayWidth, displayHeight;
    
    if (availableWidth / availableHeight > canvasAspectRatio) {
        // Limited by height
        displayHeight = Math.min(availableHeight * 0.99, 900); // Max 900px height
        displayWidth = displayHeight * canvasAspectRatio;
    } else {
        // Limited by width  
        displayWidth = Math.min(availableWidth * 0.99, 1200); // Max 1200px width
        displayHeight = displayWidth / canvasAspectRatio;
    }
    
    // Apply CSS scaling
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.style.imageRendering = 'pixelated'; // Crisp pixel scaling
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = 'crisp-edges';
    
    console.log(`✅ Canvas stretched: ${config.width}x${config.height} → ${displayWidth.toFixed(0)}x${displayHeight.toFixed(0)}`);
    console.log(`⚡ Performance boost: Rendering ${config.width * config.height} pixels instead of ${displayWidth * displayHeight}`);
    
    // Store stretch info for performance reporting
    window.canvasStretchInfo = {
        renderSize: { width: config.width, height: config.height },
        displaySize: { width: displayWidth, height: displayHeight },
        scaleFactor: displayWidth / config.width
    };
}

function removeCanvasStretching(canvas) {
    // Remove CSS scaling
    canvas.style.width = '';
    canvas.style.height = '';
    canvas.style.imageRendering = '';
    window.canvasStretchInfo = null;
    console.log('📐 Canvas stretching removed - using native size');
}

// Apply canvas size preset
window.setCanvasSize = function(preset) {
    if (!CANVAS_PRESETS[preset]) {
        console.log('❌ Invalid preset. Use: performance, balanced, quality, auto');
        console.log('Available presets:');
        Object.entries(CANVAS_PRESETS).forEach(([key, value]) => {
            console.log(`  ${key}: ${value.name}`);
        });
        return;
    }
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.log('❌ Canvas not found!');
        return;
    }
    
    const config = CANVAS_PRESETS[preset];
    
    if (preset === 'auto') {
        // Trigger auto-sizing by reloading the page
        console.log('🔄 Switching to auto canvas sizing - reloading...');
        location.reload();
        return;
    }
    
    // Apply fixed size
    canvas.width = config.width;
    canvas.height = config.height;
    
    // Apply stretching if requested
    if (config.stretch) {
        applyCanvasStretching(canvas, config);
    } else {
        removeCanvasStretching(canvas);
    }
    
    // Update any canvas-dependent calculations
    if (window.BALL_START_X !== undefined) {
        window.BALL_START_X = canvas.width / 2;
        window.BALL_START_Y = canvas.height - 20;
        window.BLOCK_WIDTH = Math.floor((canvas.width - 60) / (window.BLOCKS_PER_ROW || 10));
        window.BLOCK_START_X = (canvas.width - ((window.BLOCKS_PER_ROW || 10) * window.BLOCK_WIDTH)) / 2;
    }
    
    console.log(`✅ Canvas size set to ${config.name}: ${canvas.width}x${canvas.height}`);
    console.log('💡 Tip: Smaller canvas = better performance, larger canvas = better visual quality');
    
    // Store preference
    localStorage.setItem('ballDefenderCanvasPreset', preset);
};

// Get current performance info including canvas impact
window.getCanvasPerformanceInfo = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return { error: 'Canvas not found' };
    
    const renderPixels = canvas.width * canvas.height;
    const renderMegapixels = renderPixels / 1000000;
    
    let performanceImpact = 'Unknown';
    if (renderMegapixels < 0.5) performanceImpact = 'Low (Good for slower devices)';
    else if (renderMegapixels < 0.75) performanceImpact = 'Medium (Balanced)';
    else if (renderMegapixels < 1.0) performanceImpact = 'High (May affect performance)';
    else performanceImpact = 'Very High (Performance risk)';
    
    const info = {
        renderSize: `${canvas.width}x${canvas.height}`,
        renderPixels: renderPixels.toLocaleString(),
        renderMegapixels: renderMegapixels.toFixed(2),
        performanceImpact: performanceImpact,
        recommendation: renderMegapixels > 0.75 ? 
            'Consider using setCanvasSize("performance-stretched") for better FPS' : 
            'Canvas size looks good for performance'
    };
    
    // Add stretch information if active
    if (window.canvasStretchInfo) {
        const stretch = window.canvasStretchInfo;
        const displayPixels = stretch.displaySize.width * stretch.displaySize.height;
        const pixelSavings = ((displayPixels - renderPixels) / displayPixels * 100);
        
        info.isStretched = true;
        info.displaySize = `${stretch.displaySize.width.toFixed(0)}x${stretch.displaySize.height.toFixed(0)}`;
        info.scaleFactor = `${stretch.scaleFactor.toFixed(1)}x`;
        info.pixelSavings = `${pixelSavings.toFixed(1)}%`;
        info.performanceBoost = pixelSavings > 50 ? 'Significant' : pixelSavings > 25 ? 'Good' : 'Moderate';
    }
    
    console.log('📐 CANVAS PERFORMANCE INFO:');
    console.log(`  Render Size: ${info.renderSize} (${info.renderMegapixels} MP)`);
    if (info.isStretched) {
        console.log(`  Display Size: ${info.displaySize} (${info.scaleFactor} scaling)`);
        console.log(`  Pixel Savings: ${info.pixelSavings} (${info.performanceBoost} boost)`);
    }
    console.log(`  Performance Impact: ${info.performanceImpact}`);
    console.log(`  Recommendation: ${info.recommendation}`);
    
    return info;
};

// Auto-apply saved preference
function applySavedCanvasPreference() {
    const savedPreset = localStorage.getItem('ballDefenderCanvasPreset');
    if (savedPreset && savedPreset !== 'auto') {
        console.log(`🔧 Applying saved canvas preference: ${savedPreset}`);
        setTimeout(() => setCanvasSize(savedPreset), 1000);
    }
}

// Initialize
setTimeout(applySavedCanvasPreference, 2000);

// Provide easy access instructions
console.log('📐 Canvas Size Optimizer loaded!');
console.log('💡 Usage:');
console.log('  setCanvasSize("performance") - Best FPS (800x600)');
console.log('  setCanvasSize("performance-stretched") - Best FPS + Large Display! 🚀');
console.log('  setCanvasSize("balanced") - Good balance (1000x750)');
console.log('  setCanvasSize("balanced-stretched") - Balanced + Large Display');
console.log('  setCanvasSize("quality") - Best quality (1200x900)');
console.log('  setCanvasSize("auto") - Dynamic sizing (default)');
console.log('  getCanvasPerformanceInfo() - Check current canvas impact');
console.log('');
console.log('🔥 Recommended: "performance-stretched" = 800x600 render → large display!');
