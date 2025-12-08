// Ball Go Boom Glow Enhancer
// Adds proper volcanic glow effects to match other modes
(function() {
    console.log('🔥 Ball Go Boom Glow Enhancer Loading...');
    
    // Wait for game to be ready
    function enhanceGlowEffects() {
        const checkInterval = setInterval(() => {
            // Check if we have the renderer system
            if (window.gameCore && window.gameCore.renderer && window.gameCore.renderer.rendererCache) {
                console.log('🔥 Enhancing Ball Go Boom glow effects...');
                
                // Get the normal renderer
                const normalRenderer = window.gameCore.renderer.rendererCache.normal;
                const spawnerRenderer = window.gameCore.renderer.rendererCache.spawner;
                
                if (normalRenderer && spawnerRenderer) {
                    // Store original applyGlowEffect method
                    const originalApplyGlow = normalRenderer.applyGlowEffect;
                    const originalSpawnerApplyGlow = spawnerRenderer.applyGlowEffect;
                    
                    // Enhanced glow for Ball Go Boom mode
                    function enhancedApplyGlow(ctx, colors, isSpecial, glowLevel = 0) {
                        const isBoomMode = window.currentGameMode && window.currentGameMode.id === 'ballGoBoom';
                        
                        if (isBoomMode) {
                            // Ball Go Boom gets enhanced glow
                            if (glowLevel > 0 || isSpecial) {
                                ctx.shadowColor = colors.glow;
                                // Enhanced glow for volcanic theme
                                const baseBlur = isSpecial ? 35 : glowLevel * 25;
                                // Add subtle pulsing for Ball Go Boom
                                const pulseBoost = Math.sin(Date.now() * 0.003) * 5;
                                ctx.shadowBlur = baseBlur + pulseBoost;
                            }
                        } else {
                            // Use original for other modes
                            return originalApplyGlow.call(this, ctx, colors, isSpecial, glowLevel);
                        }
                    }
                    
                    // Apply enhanced glow to renderers
                    normalRenderer.applyGlowEffect = enhancedApplyGlow;
                    spawnerRenderer.applyGlowEffect = enhancedApplyGlow;
                    
                    console.log('✅ Ball Go Boom glow enhancement applied!');
                    console.log('🔥 Volcanic blocks now have enhanced glow effects');
                    
                    clearInterval(checkInterval);
                }
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Start enhancement when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceGlowEffects);
    } else {
        setTimeout(enhanceGlowEffects, 100);
    }
    
    console.log('🔥 Ball Go Boom Glow Enhancer Ready!');
})();
