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

    // Show rotate device message if in portrait
    function checkOrientation() {
        if (!isFullscreen()) return;

        const isPortrait = window.innerHeight > window.innerWidth;
        let rotateOverlay = document.getElementById('rotateDeviceOverlay');

        if (isPortrait) {
            if (!rotateOverlay) {
                rotateOverlay = document.createElement('div');
                rotateOverlay.id = 'rotateDeviceOverlay';
                rotateOverlay.innerHTML = `
                    <div class="rotate-icon">📱↻</div>
                    <div class="rotate-text">Rotate your device</div>
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
                text.style.cssText = `font-size: 20px; margin-top: 20px; opacity: 0.8;`;

                // Add animation keyframes
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes rotateAnim {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(90deg); }
                    }
                `;
                document.head.appendChild(style);

                document.body.appendChild(rotateOverlay);
            }
        } else {
            if (rotateOverlay) {
                rotateOverlay.remove();
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
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
            }

            :fullscreen .game-layout,
            :-webkit-full-screen .game-layout,
            :-moz-full-screen .game-layout {
                flex-direction: row !important;
                padding: 0 !important;
                gap: 0 !important;
                height: 100% !important;
                width: 100% !important;
                overflow: hidden !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
            }

            :fullscreen .game-area,
            :-webkit-full-screen .game-area,
            :-moz-full-screen .game-area {
                flex: 1 !important;
                width: auto !important;
                height: 100% !important;
                padding: 0 !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: stretch !important;
            }

            :fullscreen #gameCanvas,
            :-webkit-full-screen #gameCanvas,
            :-moz-full-screen #gameCanvas {
                width: 100% !important;
                height: 100% !important;
                max-height: none !important;
                max-width: none !important;
                border-radius: 0 !important;
                object-fit: contain !important;
            }

            :fullscreen .game-sidebar,
            :-webkit-full-screen .game-sidebar,
            :-moz-full-screen .game-sidebar {
                width: 160px !important;
                min-width: 160px !important;
                max-width: 160px !important;
                height: 100% !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                padding: 5px !important;
                font-size: 11px !important;
                border-left: 2px solid #333 !important;
                border-top: none !important;
                flex-shrink: 0 !important;
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

    // Resize canvas to fit fullscreen
    function resizeCanvasForFullscreen() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        // Get the game area dimensions
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;

        // Small delay to let CSS apply
        setTimeout(() => {
            const rect = gameArea.getBoundingClientRect();
            const availableWidth = rect.width;
            const availableHeight = rect.height;

            // Maintain aspect ratio (roughly 4:5 for this game)
            const targetRatio = 4 / 5;
            let newWidth, newHeight;

            if (availableWidth / availableHeight > targetRatio) {
                // Height is the constraint
                newHeight = availableHeight;
                newWidth = newHeight * targetRatio;
            } else {
                // Width is the constraint
                newWidth = availableWidth;
                newHeight = newWidth / targetRatio;
            }

            // Update canvas internal resolution
            canvas.width = Math.floor(newWidth);
            canvas.height = Math.floor(newHeight);

            console.log(`📱 Canvas resized to ${canvas.width}x${canvas.height}`);

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

        // Show fullscreen prompt after a short delay
        setTimeout(() => {
            showFullscreenPrompt();
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
