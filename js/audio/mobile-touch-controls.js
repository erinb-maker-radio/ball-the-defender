/**
 * MOBILE TOUCH CONTROLS FOR BALL DEFENDER
 * =======================================
 * Implements touch controls for mobile and tablet devices
 * Responsive design for all screen sizes
 */

console.log('📱 Mobile Touch Controls Loading...');

// Mobile detection and configuration
const MobileControls = {
    isMobile: false,
    isTablet: false,
    touchSupported: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    
    // Touch state
    currentTouch: null,
    aimingTouch: null,
    lastTap: 0,
    
    // UI elements
    aimLine: null,
    touchZone: null,
    mobileUI: {},
    
    // Settings
    minAimDistance: 20,
    maxAimDistance: 150,
    doubleTapTime: 300,
    
    init() {
        this.detectDevice();
        this.setupTouchEvents();
        this.createMobileUI();
        this.setupResponsiveLayout();
        this.optimizeForMobile();
        
        console.log(`📱 Mobile controls initialized - Device: ${this.getDeviceType()}`);
    },
    
    detectDevice() {
        // Check for touch support
        this.touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Screen dimensions
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.orientation = this.screenWidth > this.screenHeight ? 'landscape' : 'portrait';
        
        // Device detection
        const userAgent = navigator.userAgent.toLowerCase();
        this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                        (this.touchSupported && Math.max(this.screenWidth, this.screenHeight) < 1024);
        this.isTablet = this.touchSupported && Math.max(this.screenWidth, this.screenHeight) >= 768 && 
                       Math.max(this.screenWidth, this.screenHeight) < 1366;
        
        console.log(`📊 Device Info:`, {
            mobile: this.isMobile,
            tablet: this.isTablet,
            touch: this.touchSupported,
            size: `${this.screenWidth}x${this.screenHeight}`,
            orientation: this.orientation
        });
    },
    
    getDeviceType() {
        if (this.isMobile) return 'Mobile';
        if (this.isTablet) return 'Tablet';
        if (this.touchSupported) return 'Touch Desktop';
        return 'Desktop';
    },
    
    setupTouchEvents() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas || !this.touchSupported) return;
        
        // Prevent default touch behaviors
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Prevent zoom and scroll
        document.addEventListener('touchstart', this.preventZoom.bind(this), { passive: false });
        document.addEventListener('touchmove', this.preventZoom.bind(this), { passive: false });
        
        console.log('✅ Touch events configured');
    },
    
    preventZoom(e) {
        // Prevent pinch zoom
        if (e.touches && e.touches.length > 1) {
            e.preventDefault();
        }
        
        // Prevent double tap zoom
        const now = Date.now();
        if (now - this.lastTap < this.doubleTapTime) {
            e.preventDefault();
        }
        this.lastTap = now;
    },
    
    handleTouchStart(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Scale coordinates to canvas size
        const canvas = e.target;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        this.currentTouch = {
            id: touch.identifier,
            startX: x * scaleX,
            startY: y * scaleY,
            currentX: x * scaleX,
            currentY: y * scaleY,
            startTime: Date.now()
        };
        
        // Start aiming if ball is ready
        if (window.gameState === 'aiming' || (window.balls && window.balls.some(b => !b.active))) {
            this.startAiming(this.currentTouch.startX, this.currentTouch.startY);
        }
        
        console.log('👆 Touch start:', this.currentTouch);
    },
    
    handleTouchMove(e) {
        e.preventDefault();
        
        if (!this.currentTouch) return;
        
        const touch = Array.from(e.touches).find(t => t.identifier === this.currentTouch.id);
        if (!touch) return;
        
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Scale coordinates
        const canvas = e.target;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        this.currentTouch.currentX = x * scaleX;
        this.currentTouch.currentY = y * scaleY;
        
        // Update aiming
        if (this.aimingTouch) {
            this.updateAiming(this.currentTouch.currentX, this.currentTouch.currentY);
        }
    },
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        if (!this.currentTouch) return;
        
        const touchDuration = Date.now() - this.currentTouch.startTime;
        const dx = this.currentTouch.currentX - this.currentTouch.startX;
        const dy = this.currentTouch.currentY - this.currentTouch.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Quick tap (< 200ms, < 20px) = click/tap
        if (touchDuration < 200 && distance < 20) {
            this.handleTap(this.currentTouch.startX, this.currentTouch.startY);
        }
        // Drag gesture = aim and shoot
        else if (distance >= this.minAimDistance) {
            this.handleShoot(dx, dy, distance);
        }
        
        this.endAiming();
        this.currentTouch = null;
        
        console.log('👆 Touch end:', { duration: touchDuration, distance, action: distance < 20 ? 'tap' : 'shoot' });
    },
    
    handleTap(x, y) {
        // Check if tapping detonator button in Ball Go Boom mode
        const detonatorBtn = document.getElementById('detonatorButton');
        if (detonatorBtn && window.currentGameMode?.id === 'ballGoBoom') {
            const rect = detonatorBtn.getBoundingClientRect();
            const canvas = document.getElementById('gameCanvas');
            const canvasRect = canvas.getBoundingClientRect();
            
            // Convert canvas coordinates to screen coordinates
            const screenX = (x / canvas.width) * canvasRect.width + canvasRect.left;
            const screenY = (y / canvas.height) * canvasRect.height + canvasRect.top;
            
            if (screenX >= rect.left && screenX <= rect.right && screenY >= rect.top && screenY <= rect.bottom) {
                if (window.ballDetonator?.canDetonate && window.ballDetonator.canDetonate()) {
                    window.ballDetonator.startDetonation();
                    return;
                }
            }
        }
        
        // Regular tap handling - simulate mouse click
        const clickEvent = new MouseEvent('click', {
            clientX: x,
            clientY: y,
            bubbles: true
        });
        
        document.getElementById('gameCanvas').dispatchEvent(clickEvent);
    },
    
    startAiming(x, y) {
        this.aimingTouch = { startX: x, startY: y };
        
        // Create aim line if it doesn't exist
        if (!this.aimLine) {
            this.createAimLine();
        }
        
        this.showAimLine(x, y, x, y);
    },
    
    updateAiming(x, y) {
        if (!this.aimingTouch) return;
        
        this.showAimLine(this.aimingTouch.startX, this.aimingTouch.startY, x, y);
    },
    
    endAiming() {
        this.aimingTouch = null;
        this.hideAimLine();
    },
    
    handleShoot(dx, dy, distance) {
        // Limit distance for consistent power
        const clampedDistance = Math.min(distance, this.maxAimDistance);
        const power = clampedDistance / this.maxAimDistance;
        
        // Calculate angle and velocity
        const angle = Math.atan2(dy, dx);
        const velocityX = Math.cos(angle) * power * 15; // Scale velocity
        const velocityY = Math.sin(angle) * power * 15;
        
        // Trigger ball launch if possible
        if (window.launchBall) {
            window.launchBall(velocityX, velocityY);
        } else if (window.shootBall) {
            window.shootBall(angle, power);
        }
        
        console.log(`🎯 Touch shoot: angle=${(angle * 180 / Math.PI).toFixed(1)}°, power=${(power * 100).toFixed(1)}%`);
    },
    
    createAimLine() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Create aim line overlay
        this.aimLine = document.createElement('div');
        this.aimLine.style.cssText = `
            position: absolute;
            background: linear-gradient(90deg, transparent, #ff4444, transparent);
            height: 3px;
            transform-origin: left center;
            pointer-events: none;
            z-index: 1000;
            display: none;
            box-shadow: 0 0 10px #ff4444;
        `;
        
        canvas.parentElement.appendChild(this.aimLine);
    },
    
    showAimLine(startX, startY, endX, endY) {
        if (!this.aimLine) return;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.minAimDistance) {
            this.aimLine.style.display = 'none';
            return;
        }
        
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        this.aimLine.style.cssText += `
            display: block;
            left: ${startX}px;
            top: ${startY - 1.5}px;
            width: ${Math.min(distance, this.maxAimDistance)}px;
            transform: rotate(${angle}deg);
            opacity: ${Math.min(distance / this.maxAimDistance, 1)};
        `;
    },
    
    hideAimLine() {
        if (this.aimLine) {
            this.aimLine.style.display = 'none';
        }
    },
    
    createMobileUI() {
        if (!this.isMobile && !this.isTablet) return;
        
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-device');
        if (this.isMobile) document.body.classList.add('phone');
        if (this.isTablet) document.body.classList.add('tablet');
        document.body.classList.add(`orientation-${this.orientation}`);
        
        // Create mobile help text
        this.createTouchInstructions();
        
        // Enlarge important buttons for touch
        this.enlargeTouchTargets();
        
        console.log('📱 Mobile UI elements created');
    },
    
    createTouchInstructions() {
        const instructions = document.getElementById('instructions');
        if (!instructions) return;
        
        const mobileInstructions = document.createElement('div');
        mobileInstructions.className = 'mobile-instructions';
        mobileInstructions.innerHTML = `
            <div class="instruction-item">📱 <strong>Aim:</strong> Drag from ball to aim</div>
            <div class="instruction-item">🎯 <strong>Shoot:</strong> Release to fire</div>
            <div class="instruction-item">💥 <strong>Detonate:</strong> Tap the red button</div>
            <div class="instruction-item">🎮 <strong>Menu:</strong> Tap game area when paused</div>
        `;
        
        instructions.appendChild(mobileInstructions);
    },
    
    enlargeTouchTargets() {
        // Make buttons bigger for touch
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device button {
                min-height: 44px;
                min-width: 44px;
                font-size: 16px;
                padding: 12px 16px;
            }
            
            .mobile-device #detonatorButton {
                transform: scale(1.2);
            }
            
            .mobile-device .mixer-channel input[type="range"] {
                height: 40px;
            }
            
            .mobile-device .mixer-solo,
            .mobile-device .mixer-mute {
                padding: 8px 12px;
                font-size: 14px;
            }
        `;
        
        document.head.appendChild(style);
    },
    
    setupResponsiveLayout() {
        // Add viewport meta tag if missing
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(viewport);
        }
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    },
    
    handleOrientationChange() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.orientation = this.screenWidth > this.screenHeight ? 'landscape' : 'portrait';
        
        document.body.classList.remove('orientation-portrait', 'orientation-landscape');
        document.body.classList.add(`orientation-${this.orientation}`);
        
        console.log(`📱 Orientation changed to: ${this.orientation} (${this.screenWidth}x${this.screenHeight})`);
        
        // Adjust game canvas if needed
        if (window.resizeCanvas) {
            setTimeout(() => window.resizeCanvas(), 200);
        }
    },
    
    handleResize() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
        // Update mobile/tablet detection on resize
        this.detectDevice();
    },
    
    optimizeForMobile() {
        if (!this.isMobile && !this.isTablet) return;
        
        // Set mobile-optimized performance mode
        setTimeout(() => {
            if (window.setPerformanceMode) {
                const mode = this.isMobile ? 'low' : 'medium';
                window.setPerformanceMode(mode);
                console.log(`📱 Mobile performance mode set to: ${mode}`);
            }
        }, 1000);
        
        // Disable some desktop-only features
        window.MOBILE_MODE = true;
        window.DISABLE_PARTICLE_GLOW = true;
        window.SIMPLIFIED_RENDERING = true;
        
        console.log('📱 Mobile optimizations applied');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => MobileControls.init(), 500);
    });
} else {
    setTimeout(() => MobileControls.init(), 500);
}

// Export for debugging and external access
window.MobileControls = MobileControls;

console.log('📱 Mobile Touch Controls loaded - will initialize after DOM ready');