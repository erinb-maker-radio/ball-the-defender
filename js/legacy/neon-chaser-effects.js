// NEON CHASER EFFECTS - Dramatic special block effects for Ball Go Boom mode
(function() {
    console.log('⚡ NEON CHASER EFFECTS LOADING...');
    
    // Track special blocks and their effects
    let specialBlockEffects = new Map();
    
    // Neon chaser animation state
    let chaserTime = 0;
    
    // Override canvas rendering to add special effects
    function addNeonChaserEffects() {
        const checkInterval = setInterval(() => {
            const canvas = document.getElementById('gameCanvas');
            if (canvas && window.gameLoop) {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                // Store original methods
                const originalFillRect = ctx.fillRect;
                const originalStrokeRect = ctx.strokeRect;
                
                // Override fillRect to detect special block rendering
                ctx.fillRect = function(x, y, width, height) {
                    const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                    
                    // Call original first
                    const result = originalFillRect.call(this, x, y, width, height);
                    
                    // Add effects for special blocks in boom mode
                    if (isBoomMode && window.blocks) {
                        // Find the block being rendered
                        const block = window.blocks.find(b => 
                            !b.destroyed && 
                            b.isSpecial &&
                            Math.abs(b.x - x) < 5 && 
                            Math.abs(b.y - y) < 5
                        );
                        
                        if (block) {
                            addSpecialBlockEffect(ctx, block, x, y, width, height);
                        }
                    }
                    
                    return result;
                };
                
                clearInterval(checkInterval);
                console.log('✅ Neon chaser effects hooked into canvas');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Add dramatic neon effects to special blocks
    function addSpecialBlockEffect(ctx, block, x, y, width, height) {
        const time = Date.now() * 0.005; // Animation speed
        
        // Save context state
        ctx.save();
        
        if (block.specialType === 'spawner') {
            // CYAN SHIELD GENERATOR - Pulsing energy field
            drawShieldGeneratorEffect(ctx, x, y, width, height, time);
        } else if (block.specialType === 'exploder') {
            // MAGENTA BOMB CORE - Dangerous energy core
            drawBombCoreEffect(ctx, x, y, width, height, time);
        }
        
        // Restore context
        ctx.restore();
    }
    
    // Shield Generator (Spawner) Effect - Cyan energy field
    function drawShieldGeneratorEffect(ctx, x, y, width, height, time) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Pulsing outer glow
        const pulseIntensity = Math.sin(time * 3) * 0.5 + 0.5;
        const glowRadius = Math.max(width, height) * (1.5 + pulseIntensity * 0.5);
        
        // Outer energy field
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${0.3 + pulseIntensity * 0.2})`);
        gradient.addColorStop(0.7, `rgba(0, 255, 255, ${0.1 + pulseIntensity * 0.1})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - glowRadius/2, y - glowRadius/2, width + glowRadius, height + glowRadius);
        
        // Rotating energy rings
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            const ringRadius = 15 + i * 8;
            const rotation = time + i * Math.PI / 3;
            
            ctx.globalAlpha = 0.6 - i * 0.2;
            ctx.beginPath();
            
            // Draw dashed ring
            for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
                const dashStart = angle + rotation;
                const dashEnd = dashStart + 0.15;
                
                ctx.moveTo(
                    centerX + Math.cos(dashStart) * ringRadius,
                    centerY + Math.sin(dashStart) * ringRadius
                );
                ctx.lineTo(
                    centerX + Math.cos(dashEnd) * ringRadius,
                    centerY + Math.sin(dashEnd) * ringRadius
                );
            }
            ctx.stroke();
        }
        
        // Energy core
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(0, 255, 255, ${0.7 + pulseIntensity * 0.3})`;
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
        
        // Core highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseIntensity * 0.5})`;
        ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
    }
    
    // Bomb Core (Exploder) Effect - Magenta danger core
    function drawBombCoreEffect(ctx, x, y, width, height, time) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Unstable energy pulses
        const pulse1 = Math.sin(time * 5) * 0.5 + 0.5;
        const pulse2 = Math.sin(time * 7 + Math.PI/3) * 0.5 + 0.5;
        const pulse3 = Math.sin(time * 11 + Math.PI/2) * 0.5 + 0.5;
        
        // Danger warning glow
        const warningRadius = Math.max(width, height) * (2 + pulse1 * 0.8);
        const warningGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, warningRadius);
        warningGradient.addColorStop(0, `rgba(255, 0, 255, ${0.4 + pulse1 * 0.3})`);
        warningGradient.addColorStop(0.5, `rgba(255, 0, 255, ${0.2 + pulse2 * 0.2})`);
        warningGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        
        ctx.fillStyle = warningGradient;
        ctx.fillRect(x - warningRadius/2, y - warningRadius/2, width + warningRadius, height + warningRadius);
        
        // Chaotic energy arcs
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        
        for (let i = 0; i < 6; i++) {
            const arcAngle = (time * 2 + i * Math.PI / 3) % (Math.PI * 2);
            const arcRadius = 20 + Math.sin(time * 4 + i) * 10;
            const arcLength = 0.5 + pulse3 * 0.3;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, arcRadius, arcAngle, arcAngle + arcLength);
            ctx.stroke();
        }
        
        // Unstable core
        ctx.globalAlpha = 1;
        const coreIntensity = pulse1 * pulse2 * pulse3;
        
        // Core background
        ctx.fillStyle = `rgba(255, 0, 255, ${0.8 + coreIntensity * 0.2})`;
        ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
        
        // Danger stripes
        ctx.fillStyle = `rgba(255, 255, 0, ${pulse2 * 0.6})`;
        for (let stripe = 0; stripe < height; stripe += 6) {
            if (Math.floor((stripe + time * 50) / 6) % 2 === 0) {
                ctx.fillRect(x + 3, y + stripe, width - 6, 3);
            }
        }
        
        // Critical core
        ctx.fillStyle = `rgba(255, 255, 255, ${coreIntensity * 0.8})`;
        ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
        
        // Warning border flash
        if (pulse1 > 0.7 || pulse2 > 0.7) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.9;
            ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
        }
    }
    
    // Initialize the effects
    function initialize() {
        console.log('⚡ Initializing Neon Chaser Effects...');
        
        addNeonChaserEffects();
        
        console.log('✅ Neon Chaser Effects ready!');
    }
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    console.log('⚡ NEON CHASER EFFECTS READY!');
    
})();