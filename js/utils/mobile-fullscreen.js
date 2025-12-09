// MOBILE FULLSCREEN & LANDSCAPE MODE
// ===================================
// Forces landscape orientation and fullscreen on mobile devices

(function() {
    console.log('📱 Mobile Fullscreen System Loading...');

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isMobile) {
        console.log('📱 Not a mobile device, skipping fullscreen setup');
        return;
    }

    console.log('📱 Mobile device detected');

    // Request fullscreen
    function requestFullscreen() {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    // Lock to landscape orientation
    function lockLandscape() {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => {
                console.log('Orientation lock not supported:', err);
            });
        }
    }

    // Check if in fullscreen
    function isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement ||
                  document.mozFullScreenElement || document.msFullscreenElement);
    }

    // Show fullscreen prompt overlay
    function showFullscreenPrompt() {
        // Don't show if already in fullscreen
        if (isFullscreen()) return;

        // Check if user dismissed it this session
        if (sessionStorage.getItem('fullscreenDismissed')) return;

        const overlay = document.createElement('div');
        overlay.id = 'mobileFullscreenPrompt';
        overlay.innerHTML = `
            <div class="fullscreen-prompt-content">
                <div class="prompt-icon">📱</div>
                <h2>Play in Fullscreen</h2>
                <p>For the best experience, play in fullscreen landscape mode</p>
                <button id="goFullscreenBtn" class="fullscreen-btn">
                    🎮 GO FULLSCREEN
                </button>
                <button id="skipFullscreenBtn" class="skip-btn">
                    Continue anyway
                </button>
            </div>
        `;

        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        document.body.appendChild(overlay);

        // Style the content
        const content = overlay.querySelector('.fullscreen-prompt-content');
        content.style.cssText = `
            padding: 30px;
            max-width: 320px;
        `;

        const icon = overlay.querySelector('.prompt-icon');
        icon.style.cssText = `
            font-size: 60px;
            margin-bottom: 15px;
        `;

        const h2 = overlay.querySelector('h2');
        h2.style.cssText = `
            font-size: 24px;
            margin: 0 0 10px 0;
            color: #64ffda;
        `;

        const p = overlay.querySelector('p');
        p.style.cssText = `
            font-size: 14px;
            opacity: 0.8;
            margin: 0 0 25px 0;
        `;

        const goBtn = overlay.querySelector('#goFullscreenBtn');
        goBtn.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            color: white;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 10px;
            cursor: pointer;
            display: block;
            width: 100%;
            margin-bottom: 15px;
        `;

        const skipBtn = overlay.querySelector('#skipFullscreenBtn');
        skipBtn.style.cssText = `
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: rgba(255,255,255,0.6);
            padding: 10px 20px;
            font-size: 14px;
            border-radius: 8px;
            cursor: pointer;
        `;

        // Go fullscreen button
        goBtn.addEventListener('click', () => {
            overlay.remove();
            requestFullscreen();
            lockLandscape();
        });

        // Skip button
        skipBtn.addEventListener('click', () => {
            sessionStorage.setItem('fullscreenDismissed', 'true');
            overlay.remove();
        });
    }

    // Show rotate device message if in portrait - ALWAYS on mobile, not just fullscreen
    function checkOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        let rotateOverlay = document.getElementById('rotateDeviceOverlay');

        if (isPortrait) {
            if (!rotateOverlay) {
                rotateOverlay = document.createElement('div');
                rotateOverlay.id = 'rotateDeviceOverlay';
                rotateOverlay.innerHTML = `
                    <div class="rotate-icon">📱↻</div>
                    <div class="rotate-text">Rotate your device to landscape</div>
                    <div class="rotate-subtext">This game is designed for landscape mode</div>
                    <button class="rotate-fullscreen-btn">🎮 TAP TO GO FULLSCREEN</button>
                `;
                rotateOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #1a1a2e;
                    z-index: 99999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;

                const icon = rotateOverlay.querySelector('.rotate-icon');
                icon.style.cssText = `font-size: 80px; animation: rotateAnim 2s ease-in-out infinite;`;

                const text = rotateOverlay.querySelector('.rotate-text');
                text.style.cssText = `font-size: 22px; margin-top: 20px; font-weight: bold;`;

                const subtext = rotateOverlay.querySelector('.rotate-subtext');
                subtext.style.cssText = `font-size: 14px; margin-top: 10px; opacity: 0.7;`;

                const btn = rotateOverlay.querySelector('.rotate-fullscreen-btn');
                btn.style.cssText = `
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;
                    color: white;
                    padding: 15px 30px;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 10px;
                    cursor: pointer;
                    margin-top: 30px;
                `;
                btn.addEventListener('click', () => {
                    requestFullscreen();
                    lockLandscape();
                });

                // Add animation keyframes
                if (!document.getElementById('rotateAnimStyle')) {
                    const style = document.createElement('style');
                    style.id = 'rotateAnimStyle';
                    style.textContent = `
                        @keyframes rotateAnim {
                            0%, 100% { transform: rotate(0deg); }
                            50% { transform: rotate(90deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                document.body.appendChild(rotateOverlay);
            }
        } else {
            if (rotateOverlay) {
                rotateOverlay.remove();
            }
            // Re-lock landscape when back in landscape
            if (isFullscreen()) {
                lockLandscape();
            }
        }
    }

    // Maximize game area in fullscreen
    function setupFullscreenStyles() {
        const style = document.createElement('style');
        style.id = 'mobileFullscreenStyles';
        style.textContent = `
            /* Fullscreen mobile layout - maximize game area */
            :fullscreen,
            :-webkit-full-screen,
            :-moz-full-screen {
                width: 100vw !important;
                height: 100dvh !important; /* dynamic viewport height */
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            :fullscreen body,
            :-webkit-full-screen body,
            :-moz-full-screen body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
            }

            :fullscreen .game-layout,
            :-webkit-full-screen .game-layout,
            :-moz-full-screen .game-layout {
                flex-direction: row !important;
                padding: 0 !important;
                margin: 0 !important;
                gap: 0 !important;
                height: 100dvh !important;
                width: 100vw !important;
                overflow: hidden !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
            }

            :fullscreen .game-area,
            :-webkit-full-screen .game-area,
            :-moz-full-screen .game-area {
                width: 100vw !important;
                height: 100dvh !important;
                max-height: 100dvh !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }

            :fullscreen #gameCanvas,
            :-webkit-full-screen #gameCanvas,
            :-moz-full-screen #gameCanvas {
                max-width: 100vw !important;
                max-height: 100dvh !important;
                width: auto !important;
                height: 100% !important;
                border-radius: 0 !important;
                object-fit: contain !important;
            }

            :fullscreen .game-sidebar,
            :-webkit-full-screen .game-sidebar,
            :-moz-full-screen .game-sidebar {
                display: none !important;
            }

            :fullscreen .arcade-leaderboard,
            :-webkit-full-screen .arcade-leaderboard,
            :-moz-full-screen .arcade-leaderboard {
                max-height: 35vh !important;
            }

            :fullscreen .time-panel,
            :-webkit-full-screen .time-panel,
            :-moz-full-screen .time-panel {
                padding: 5px !important;
            }

            :fullscreen .geo-stats-panel,
            :-webkit-full-screen .geo-stats-panel,
            :-moz-full-screen .geo-stats-panel {
                padding: 4px 6px !important;
                margin-top: 4px !important;
            }

            :fullscreen .geo-stats-header,
            :-webkit-full-screen .geo-stats-header,
            :-moz-full-screen .geo-stats-header {
                font-size: 0.6rem !important;
            }

            /* Hide loading screen in fullscreen */
            :fullscreen #loadingScreen.hidden,
            :-webkit-full-screen #loadingScreen.hidden {
                display: none !important;
            }

            /* Fullscreen exit button */
            .fullscreen-exit-btn {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.5);
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                z-index: 10001;
                opacity: 0.6;
                transition: opacity 0.2s;
            }

            .fullscreen-exit-btn:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // Add exit fullscreen button when in fullscreen
    function addExitButton() {
        if (document.getElementById('exitFullscreenBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'exitFullscreenBtn';
        btn.className = 'fullscreen-exit-btn';
        btn.textContent = '✕ Exit';
        btn.onclick = () => {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        };
        document.body.appendChild(btn);
    }

    function removeExitButton() {
        const btn = document.getElementById('exitFullscreenBtn');
        if (btn) btn.remove();
    }

    // Scale canvas display to fit fullscreen (canvas resolution stays fixed at 800x600)
    function resizeCanvasForFullscreen() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        // Small delay to let CSS apply
        setTimeout(() => {
            // Use screen dimensions for fullscreen
            const availableWidth = window.innerWidth;
            const availableHeight = window.innerHeight;

            // Game uses 4:3 aspect ratio (800x600 = fixed game world)
            const targetRatio = 4 / 3;
            let displayWidth, displayHeight;

            if (availableWidth / availableHeight > targetRatio) {
                // Height is the constraint - use full height
                displayHeight = availableHeight;
                displayWidth = displayHeight * targetRatio;
            } else {
                // Width is the constraint
                displayWidth = availableWidth;
                displayHeight = displayWidth / targetRatio;
            }

            // DO NOT change canvas.width/height - game world is fixed at 800x600
            // Only change CSS display size to scale the fixed game world
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';

            console.log(`📱 Canvas display scaled to ${displayWidth}x${displayHeight} (internal: ${canvas.width}x${canvas.height})`);

            // Trigger game resize if available
            if (window.resizeCanvas) {
                window.resizeCanvas();
            }
        }, 100);
    }

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
        if (isFullscreen()) {
            addExitButton();
            lockLandscape();
            resizeCanvasForFullscreen();
        } else {
            removeExitButton();
        }
        checkOrientation();
    });

    document.addEventListener('webkitfullscreenchange', () => {
        if (isFullscreen()) {
            addExitButton();
            lockLandscape();
            resizeCanvasForFullscreen();
        } else {
            removeExitButton();
        }
        checkOrientation();
    });

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
        checkOrientation();
        if (isFullscreen()) {
            resizeCanvasForFullscreen();
        }
    });

    window.addEventListener('resize', () => {
        checkOrientation();
        if (isFullscreen()) {
            resizeCanvasForFullscreen();
        }
    });

    // Initialize
    function init() {
        setupFullscreenStyles();

        // Check orientation immediately - show rotate overlay if portrait
        checkOrientation();

        // Show fullscreen prompt after a short delay (only if in landscape)
        setTimeout(() => {
            const isPortrait = window.innerHeight > window.innerWidth;
            if (!isPortrait) {
                showFullscreenPrompt();
            }
        }, 1000);
    }

    // Expose API
    window.MobileFullscreen = {
        requestFullscreen,
        lockLandscape,
        isFullscreen,
        isMobile
    };

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('📱 Mobile Fullscreen System Loaded');

})();
