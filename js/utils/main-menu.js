// Main Menu System - Game Mode Selection Screen
(function() {
    console.log('🎮 Main Menu System Loading...');
    
    // Game modes configuration
    window.GAME_MODES = {
        ORIGINAL: {
            id: 'original',
            name: 'Original',
            description: 'The Classic Experience',
            colors: {
                bg: {
                    primary: '#0a0a23',
                    secondary: '#1a1a3a',
                    accent: '#2a2a4a'
                },
                text: '#64ffda',
                blocks: '#667eea',
                ball: '#f093fb',
                accent: '#764ba2'
            },
            progression: [1, 6, 4, 5] // Original progression
        },
        BALL_GO_BOOM: {
            id: 'ballGoBoom',
            name: 'Ball Go Boom!',
            description: 'Explosive Action Mode',
            colors: {
                bg: {
                    primary: '#230a0a',
                    secondary: '#3a1a1a',
                    accent: '#4a2a2a'
                },
                text: '#ffa500',
                blocks: '#ff6b6b',
                ball: '#ffff00',
                accent: '#ff4500'
            },
            progression: [1, 3, 6, 4] // New 1-3-6-4 progression
        }
    };
    
    // Current game mode
    window.currentGameMode = null;
    window.gameStarted = false;
    window.selectedGameMode = null;
    
    // Restore mode from localStorage
    function restoreSelectedMode() {
        const savedMode = localStorage.getItem('ballDefender_selectedMode');
        if (savedMode) {
            window.selectedGameMode = savedMode;
            console.log(`🔄 Restored mode from localStorage: ${savedMode}`);
            return savedMode;
        }
        return null;
    }
    
    // Ball Go Boom state
    window.ballGoBoomState = {
        explosionReady: false,
        explosionTimer: null,
        flashInterval: null,
        explosionPower: 150,
        explosionRadius: 200,
        flashStartTime: null
    };
    
    // Create cinematic animated background for menu
    function createMenuBackgroundAnimation(menuContainer) {
        const canvas = document.createElement('canvas');
        canvas.id = 'menuBackgroundCanvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.2;
        `;
        menuContainer.style.position = 'relative';
        menuContainer.insertBefore(canvas, menuContainer.firstChild);

        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;

        function resize() {
            canvas.width = menuContainer.offsetWidth;
            canvas.height = menuContainer.offsetHeight;
            initBlocks();
        }

        // Game objects
        const balls = [];
        const blocks = [];
        const particles = [];
        const trails = [];
        const shockwaves = [];

        // Color palettes
        const neonColors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6b6b', '#667eea', '#f093fb'];
        const blockColors = [
            { fill: '#1a1a3a', border: '#667eea', glow: '#667eea' },
            { fill: '#2a1a2a', border: '#f093fb', glow: '#f093fb' },
            { fill: '#1a2a2a', border: '#00ffff', glow: '#00ffff' },
            { fill: '#2a2a1a', border: '#ffff00', glow: '#ffff00' },
            { fill: '#2a1a1a', border: '#ff6b6b', glow: '#ff6b6b' }
        ];

        function initBlocks() {
            blocks.length = 0;
            const blockWidth = 80;
            const blockHeight = 32;
            const spacingX = 30;
            const spacingY = 40;
            const cols = Math.floor(canvas.width / (blockWidth + spacingX));
            const rows = Math.floor(canvas.height / (blockHeight + spacingY));
            const offsetX = (canvas.width - cols * (blockWidth + spacingX)) / 2;
            const offsetY = 40;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (Math.random() > 0.5) { // 50% chance - more sparse
                        const colorSet = blockColors[Math.floor(Math.random() * blockColors.length)];
                        blocks.push({
                            x: col * (blockWidth + spacingX) + offsetX + (row % 2 ? (blockWidth + spacingX) / 2 : 0),
                            y: row * (blockHeight + spacingY) + offsetY,
                            width: blockWidth,
                            height: blockHeight,
                            health: Math.ceil(Math.random() * 4),
                            maxHealth: 4,
                            colors: colorSet,
                            pulse: Math.random() * Math.PI * 2,
                            shakeX: 0,
                            shakeY: 0
                        });
                    }
                }
            }
        }

        // Create cinematic balls
        function createBall() {
            const color = neonColors[Math.floor(Math.random() * neonColors.length)];
            balls.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height - 100,
                vx: (Math.random() - 0.5) * 8,
                vy: -6 - Math.random() * 4,
                radius: 8,
                color: color,
                trail: [],
                maxTrail: 20,
                glowIntensity: 1
            });
        }

        // Initialize balls
        for (let i = 0; i < 3; i++) {
            createBall();
            balls[i].y = Math.random() * canvas.height * 0.6 + 100;
        }

        // Cinematic particle burst
        function createParticleBurst(x, y, color, intensity = 1) {
            const count = Math.floor(15 * intensity);
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
                const speed = 3 + Math.random() * 6 * intensity;
                particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    maxLife: 1,
                    color,
                    size: 2 + Math.random() * 4,
                    type: 'glow'
                });
            }

            // Add shockwave
            shockwaves.push({
                x, y,
                radius: 0,
                maxRadius: 80 * intensity,
                life: 1,
                color
            });
        }

        // Draw block with modern style
        function drawBlock(block) {
            if (block.health <= 0) return;

            const { x, y, width, height, colors, health, maxHealth, pulse, shakeX, shakeY } = block;
            const px = x + shakeX;
            const py = y + shakeY;

            // Outer glow
            const glowPulse = 0.5 + Math.sin(time * 0.003 + pulse) * 0.3;
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 15 * glowPulse;

            // Block gradient fill
            const gradient = ctx.createLinearGradient(px, py, px, py + height);
            gradient.addColorStop(0, colors.fill);
            gradient.addColorStop(0.5, colors.border + '40');
            gradient.addColorStop(1, colors.fill);

            // Draw block body
            ctx.fillStyle = gradient;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 2;

            // Rounded rectangle
            const r = 4;
            ctx.beginPath();
            ctx.moveTo(px + r, py);
            ctx.lineTo(px + width - r, py);
            ctx.quadraticCurveTo(px + width, py, px + width, py + r);
            ctx.lineTo(px + width, py + height - r);
            ctx.quadraticCurveTo(px + width, py + height, px + width - r, py + height);
            ctx.lineTo(px + r, py + height);
            ctx.quadraticCurveTo(px, py + height, px, py + height - r);
            ctx.lineTo(px, py + r);
            ctx.quadraticCurveTo(px, py, px + r, py);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;

            // Health indicator - glowing number
            ctx.fillStyle = colors.glow;
            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 10;
            ctx.fillText(health, px + width/2, py + height/2);
            ctx.shadowBlur = 0;

            // Health bar
            const barWidth = width - 10;
            const barHeight = 3;
            const barX = px + 5;
            const barY = py + height - 6;
            const healthPercent = health / maxHealth;

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = colors.glow;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }

        // Draw ball with trail and glow
        function drawBall(ball) {
            // Draw trail
            for (let i = 0; i < ball.trail.length; i++) {
                const t = ball.trail[i];
                const alpha = (i / ball.trail.length) * 0.6;
                const size = ball.radius * (i / ball.trail.length);

                ctx.beginPath();
                ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
                ctx.fillStyle = ball.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();
            }

            // Main ball glow layers
            const glow1 = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 4);
            glow1.addColorStop(0, ball.color + '40');
            glow1.addColorStop(0.5, ball.color + '10');
            glow1.addColorStop(1, 'transparent');
            ctx.fillStyle = glow1;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 4, 0, Math.PI * 2);
            ctx.fill();

            // Inner glow
            const glow2 = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 2);
            glow2.addColorStop(0, ball.color);
            glow2.addColorStop(0.3, ball.color + 'cc');
            glow2.addColorStop(1, 'transparent');
            ctx.fillStyle = glow2;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = ball.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Animation loop
        function animate() {
            time++;

            // Cinematic fade trail effect
            ctx.fillStyle = 'rgba(10, 10, 35, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw blocks
            blocks.forEach(block => {
                block.shakeX *= 0.9;
                block.shakeY *= 0.9;
                drawBlock(block);
            });

            // Update and draw shockwaves
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                sw.radius += 4;
                sw.life -= 0.03;

                if (sw.life <= 0) {
                    shockwaves.splice(i, 1);
                } else {
                    ctx.beginPath();
                    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = sw.color + Math.floor(sw.life * 100).toString(16).padStart(2, '0');
                    ctx.lineWidth = 3 * sw.life;
                    ctx.stroke();
                }
            }

            // Update and draw balls
            balls.forEach(ball => {
                // Store trail
                ball.trail.push({ x: ball.x, y: ball.y });
                if (ball.trail.length > ball.maxTrail) {
                    ball.trail.shift();
                }

                // Physics
                ball.x += ball.vx;
                ball.y += ball.vy;

                // Wall bounce with effect
                if (ball.x < ball.radius) {
                    ball.vx = Math.abs(ball.vx);
                    ball.x = ball.radius;
                    createParticleBurst(ball.x, ball.y, ball.color, 0.3);
                }
                if (ball.x > canvas.width - ball.radius) {
                    ball.vx = -Math.abs(ball.vx);
                    ball.x = canvas.width - ball.radius;
                    createParticleBurst(ball.x, ball.y, ball.color, 0.3);
                }
                if (ball.y < ball.radius) {
                    ball.vy = Math.abs(ball.vy);
                    ball.y = ball.radius;
                    createParticleBurst(ball.x, ball.y, ball.color, 0.3);
                }

                // Reset if off bottom
                if (ball.y > canvas.height + 50) {
                    ball.y = canvas.height - 80;
                    ball.x = canvas.width / 2 + (Math.random() - 0.5) * 300;
                    ball.vy = -6 - Math.random() * 4;
                    ball.vx = (Math.random() - 0.5) * 8;
                    ball.trail = [];
                }

                // Block collision
                blocks.forEach(block => {
                    if (block.health > 0) {
                        const bx = block.x, by = block.y, bw = block.width, bh = block.height;

                        if (ball.x + ball.radius > bx && ball.x - ball.radius < bx + bw &&
                            ball.y + ball.radius > by && ball.y - ball.radius < by + bh) {

                            // Determine collision side
                            const overlapLeft = ball.x + ball.radius - bx;
                            const overlapRight = bx + bw - (ball.x - ball.radius);
                            const overlapTop = ball.y + ball.radius - by;
                            const overlapBottom = by + bh - (ball.y - ball.radius);

                            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                            if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                                ball.vy *= -1;
                            } else {
                                ball.vx *= -1;
                            }

                            block.health--;
                            block.shakeX = (Math.random() - 0.5) * 8;
                            block.shakeY = (Math.random() - 0.5) * 8;

                            createParticleBurst(ball.x, ball.y, block.colors.glow, block.health <= 0 ? 1.5 : 0.7);

                            if (block.health <= 0) {
                                // Respawn after delay
                                setTimeout(() => {
                                    block.health = Math.ceil(Math.random() * 4);
                                    block.colors = blockColors[Math.floor(Math.random() * blockColors.length)];
                                }, 3000 + Math.random() * 2000);
                            }
                        }
                    }
                });

                drawBall(ball);
            });

            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98;
                p.vy *= 0.98;
                p.vy += 0.1; // gravity
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                } else {
                    const alpha = p.life;
                    const size = p.size * p.life;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color + Math.floor(alpha * 200).toString(16).padStart(2, '0');
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            // Ambient floating particles
            if (Math.random() < 0.1) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height + 10,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -0.5 - Math.random() * 1,
                    life: 1,
                    maxLife: 1,
                    color: neonColors[Math.floor(Math.random() * neonColors.length)],
                    size: 1 + Math.random() * 2,
                    type: 'glow'
                });
            }

            animationId = requestAnimationFrame(animate);
        }

        resize();
        window.addEventListener('resize', resize);
        animate();

        menuContainer._stopAnimation = () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }

    // Create main menu
    function createMainMenu() {
        console.log('🎮 Creating main menu...');
        console.log('🎮 DOM ready state:', document.readyState);
        console.log('🎮 Body exists:', !!document.body);
        
        // Hide game canvas initially
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'none';
        }

        // Hide game controls
        const controls = document.querySelector('.game-controls');
        if (controls) {
            controls.style.display = 'none';
        }

        // Hide game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.style.display = 'none';
        }

        // Hide entire game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }

        // Hide left sidebar
        const leftSidebar = document.querySelector('.left-sidebar');
        if (leftSidebar) {
            leftSidebar.style.display = 'none';
        }
        
        // Create menu container
        const menuContainer = document.createElement('div');
        menuContainer.id = 'mainMenu';
        menuContainer.className = 'main-menu';
        menuContainer.innerHTML = `
            <div class="menu-content">
                <img src="assets/images/menu-title.png" alt="Ball The Defender" class="menu-title-img">
                <div class="mode-cards">
                    <div class="mode-image-btn" data-mode="original">
                        <img src="assets/images/mode-original.png" alt="Original Mode">
                        <div class="mode-image-overlay">
                            <span>PLAY</span>
                        </div>
                    </div>

                    <div class="mode-image-btn" data-mode="ballGoBoom">
                        <img src="assets/images/mode-boom.png" alt="Ball Go Boom Mode">
                        <div class="mode-image-overlay">
                            <span>PLAY</span>
                        </div>
                    </div>

                    <div class="mode-image-btn" data-mode="iceFrost">
                        <img src="assets/images/mode-ice.png" alt="Ice Mode">
                        <div class="mode-image-overlay">
                            <span>PLAY</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .main-menu {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000000 url('assets/images/menu-background.png') center center / cover no-repeat;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.5s ease-in;
                overflow-y: auto;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .menu-content {
                text-align: center;
                max-width: 1200px;
                padding: 20px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 25px;
                min-height: 100vh;
            }
            
            .menu-title {
                font-size: 48px;
                color: #ffffff;
                text-shadow: 0 0 30px #ffffff, 0 0 60px #aaaaaa;
                margin: 5px 0;
                font-family: 'Courier New', monospace;
                letter-spacing: 5px;
                animation: glow 2s ease-in-out infinite;
            }

            @keyframes glow {
                0%, 100% { text-shadow: 0 0 30px #ffffff, 0 0 60px #aaaaaa; }
                50% { text-shadow: 0 0 40px #ffffff, 0 0 80px #cccccc, 0 0 100px #ffffff; }
            }

            .menu-subtitle {
                font-size: 16px;
                color: #888;
                margin: 0 0 15px 0;
                font-family: 'Courier New', monospace;
                font-weight: normal;
            }

            .menu-title-img {
                max-width: 500px;
                width: 70%;
                height: auto;
                margin-top: -75px;
                filter: drop-shadow(0 0 30px rgba(255,255,255,0.7));
            }
            
            .mode-cards {
                display: flex;
                gap: 20px;
                justify-content: center;
                align-items: stretch;
                flex-wrap: wrap;
                margin: -300px auto 0 auto;
                max-width: 1200px;
            }

            .mode-image-btn {
                position: relative;
                width: 286px;
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
                border: 5px solid #888;
            }

            .mode-image-btn[data-mode="original"] {
                border-color: #00ff00;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5), 0 8px 30px rgba(0, 0, 0, 0.5);
            }

            .mode-image-btn[data-mode="ballGoBoom"] {
                border-color: #ff6600;
                box-shadow: 0 0 20px rgba(255, 100, 0, 0.5), 0 8px 30px rgba(0, 0, 0, 0.5);
            }

            .mode-image-btn[data-mode="iceFrost"] {
                border-color: #00c8ff;
                box-shadow: 0 0 20px rgba(0, 200, 255, 0.5), 0 8px 30px rgba(0, 0, 0, 0.5);
            }

            .mode-image-btn img {
                width: 100%;
                height: auto;
                display: block;
                transition: transform 0.3s ease;
            }

            .mode-image-btn:hover {
                transform: translateY(-10px) scale(1.03);
                box-shadow: 0 20px 50px rgba(255, 255, 255, 0.3);
                border-color: #fff;
            }

            .mode-image-btn:hover img {
                transform: scale(1.05);
            }

            .mode-image-btn:active {
                transform: translateY(-5px) scale(0.98);
            }

            .mode-image-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.9));
                padding: 40px 20px 20px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .mode-image-btn:hover .mode-image-overlay {
                opacity: 1;
            }

            .mode-image-overlay span {
                display: block;
                text-align: center;
                color: #fff;
                font-size: 24px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                text-shadow: 0 0 20px #fff;
                letter-spacing: 4px;
            }

            /* Mode-specific hover glows - brighter on hover */
            .mode-image-btn[data-mode="original"]:hover {
                box-shadow: 0 0 40px rgba(0, 255, 0, 0.8), 0 20px 50px rgba(0, 255, 0, 0.5);
                border-color: #00ff00;
            }

            .mode-image-btn[data-mode="ballGoBoom"]:hover {
                box-shadow: 0 0 40px rgba(255, 100, 0, 0.8), 0 20px 50px rgba(255, 100, 0, 0.5);
                border-color: #ff6600;
            }

            .mode-image-btn[data-mode="iceFrost"]:hover {
                box-shadow: 0 0 40px rgba(0, 200, 255, 0.8), 0 20px 50px rgba(0, 200, 255, 0.5);
                border-color: #00c8ff;
            }

            @media (max-width: 1200px) {
                .menu-title-img {
                    max-width: 450px;
                    width: 65%;
                    margin-top: -50px;
                }
                .mode-cards {
                    margin: -250px auto 0 auto;
                    gap: 15px;
                }
                .mode-image-btn {
                    width: 242px;
                }
            }

            @media (max-width: 900px) {
                .menu-title-img {
                    max-width: 400px;
                    width: 60%;
                    margin-top: -30px;
                }
                .mode-cards {
                    margin: -200px auto 0 auto;
                    gap: 12px;
                }
                .mode-image-btn {
                    width: 198px;
                }
            }

            @media (max-width: 700px) {
                .menu-title-img {
                    max-width: 350px;
                    width: 70%;
                    margin-top: -20px;
                }
                .mode-cards {
                    flex-direction: column;
                    align-items: center;
                    margin: -150px auto 0 auto;
                    gap: 15px;
                }
                .mode-image-btn {
                    width: 220px;
                }
            }

            @media (max-width: 500px) {
                .menu-title-img {
                    max-width: 280px;
                    width: 80%;
                    margin-top: -10px;
                }
                .mode-cards {
                    margin: -100px auto 0 auto;
                    gap: 12px;
                }
                .mode-image-btn {
                    width: 176px;
                }
            }

            @media (max-height: 700px) {
                .menu-title-img {
                    max-width: 350px;
                    margin-top: -40px;
                }
                .mode-cards {
                    margin: -180px auto 0 auto;
                }
                .mode-image-btn {
                    width: 198px;
                }
            }

            @media (max-height: 500px) {
                .main-menu {
                    align-items: flex-start;
                    padding-top: 10px;
                }
                .menu-content {
                    min-height: auto;
                    padding: 10px;
                    gap: 10px;
                }
                .menu-title-img {
                    max-width: 180px;
                    margin-top: 0;
                }
                .mode-cards {
                    flex-direction: row;
                    margin: 0 auto;
                    gap: 10px;
                }
                .mode-image-btn {
                    width: 120px;
                }
            }

            /* Ultra-short landscape (phones in landscape fullscreen) */
            @media (max-height: 400px) {
                .main-menu {
                    align-items: flex-start;
                    padding-top: 5px;
                }
                .menu-content {
                    min-height: auto;
                    padding: 5px;
                    gap: 5px;
                }
                .menu-title-img {
                    max-width: 140px;
                    margin-top: 0;
                }
                .mode-cards {
                    flex-direction: row;
                    margin: 0 auto;
                    gap: 8px;
                }
                .mode-image-btn {
                    width: 100px;
                }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            #ballGoBoomBtn {
                display: none;
                width: 100%;
                padding: 20px;
                margin-top: 20px;
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                color: #1a1a2e;
                border: none;
                border-radius: 10px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                animation: pulse 2s infinite;
                box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
                transition: all 0.3s;
            }
            
            #ballGoBoomBtn:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(250, 112, 154, 0.6);
            }
            
            #ballGoBoomBtn.flashing {
                animation: flash 0.1s infinite;
            }
            
            @keyframes flash {
                0% { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
                50% { background: linear-gradient(135deg, #fff 0%, #ff0000 100%); }
                100% { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
            }
            
            .explosion-effect {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,0,1) 0%, rgba(255,165,0,1) 30%, rgba(255,0,0,0.8) 60%, rgba(255,0,0,0) 100%);
                pointer-events: none;
                animation: explode 0.5s ease-out forwards;
                z-index: 9999;
            }
            
            @keyframes explode {
                0% {
                    width: 20px;
                    height: 20px;
                    opacity: 1;
                }
                100% {
                    width: 400px;
                    height: 400px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add menu to page
        document.body.appendChild(menuContainer);
        console.log('🎮 Menu container added to body');
        console.log('🎮 Menu container HTML:', menuContainer.outerHTML.substring(0, 200) + '...');

        // Background animation disabled - using solid black
        
        // Add event listeners to mode image buttons
        const modeButtons = menuContainer.querySelectorAll('.mode-image-btn');
        console.log(`🎮 Found ${modeButtons.length} mode buttons`);

        modeButtons.forEach(btn => {
            const mode = btn.dataset.mode;
            console.log(`🎮 Adding click listener to mode button: ${mode}`);

            // Make the entire button clickable
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log(`🎮 Mode button clicked: ${mode}`);
                try {
                    // Store clicked button for zoom animation
                    window._clickedModeButton = btn;
                    await selectGameMode(mode);
                } catch (error) {
                    console.error(`❌ Failed to load ${mode} mode from card click:`, error);
                }
            });
        });
        
        // Also keep the original button listeners as backup
        const playButtons = menuContainer.querySelectorAll('.mode-play-btn');
        console.log(`🎮 Found ${playButtons.length} play buttons (backup listeners)`);
        
        playButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent double-triggering from card click
                e.preventDefault();
                const mode = btn.dataset.mode;
                console.log(`🎮 Play button clicked: ${mode}`);
                console.log(`🎮 Mode selected: ${mode} - Loading game systems...`);
                try {
                    await selectGameMode(mode);
                    console.log(`✅ ${mode} mode loaded successfully`);
                } catch (error) {
                    console.error(`❌ Failed to load ${mode} mode from button click:`, error);
                }
            });
        });
    }
    
    // Select and setup game mode - USES ONLY MODE TEMPLATE SYSTEM
    async function selectGameMode(mode) {
        try {
            console.log(`🎮 Starting selectGameMode for: ${mode}`);
            
            // Clear any existing mode classes
            document.body.classList.remove('mode-original', 'mode-ballGoBoom', 'mode-iceFrost');
            
            // USE ONLY MODE TEMPLATE SYSTEM FOR ALL MODES
            if (window.ModeTemplateSystem && window.ModeTemplateSystem.getMode(mode)) {
                console.log(`📦 Activating ${mode} through Mode Template System`);
                
                // Activate mode through template system
                const modeInstance = await window.ModeTemplateSystem.activateMode(mode);
                console.log(`📦 Mode instance created:`, modeInstance);
                
                // Set global references for compatibility
                window.currentGameMode = modeInstance.definition;
                window.selectedGameMode = mode;
                
                // Update body class
                document.body.classList.add(`mode-${mode}`);
                
                // Save to localStorage
                localStorage.setItem('ballDefender_selectedMode', mode);
                
                console.log(`✅ ${mode} mode activated through template system`);
            } else {
                // Mode Template System not ready yet - this is normal during initial load
                // The system will retry when modules are loaded
                return;
            }
        } catch (error) {
            console.error(`❌ Failed to load ${mode} mode:`, error);
            
            // Show user-friendly error message
            if (error.message.includes('colors failed to load')) {
                alert(`❌ ${mode} mode failed to load properly.\n\nThe theme colors didn't load correctly. Please:\n1. Refresh the page\n2. Try again\n3. Check your internet connection\n\nMode activation cancelled.`);
            } else {
                alert(`❌ Failed to load ${mode} mode.\n\nError: ${error.message}`);
            }
            
            // Don't throw - just return to menu
            return;
        }
        
        // Expose mode globally for other systems
        window.selectedGameMode = mode;
        
        // Initialize GameCore renderer with the selected mode
        if (window.gameCore && window.currentGameMode) {
            try {
                window.gameCore.setMode(window.currentGameMode);
                console.log(`🎨 GameCore renderer initialized for ${mode} mode`);
            } catch (error) {
                console.error(`❌ Failed to set GameCore mode:`, error);
            }
        } else {
            console.warn('⚠️ GameCore or currentGameMode not available for renderer initialization');
        }
        
        // Load mode-specific leaderboard scores (only for non-framework modes)
        try {
            if (mode !== 'iceFrost') {
                console.log(`📊 Loading ${mode} mode scores...`);
                if (window.refreshModeLeaderboard) {
                    window.refreshModeLeaderboard();
                }
                // Also ensure the correct mode scores are loaded from Gist
                if (window.loadFromGist) {
                    window.loadFromGist(mode).then(() => {
                        console.log(`✅ ${mode} scores loaded from Gist`);
                        if (window.updateLeaderboardDisplay) {
                            window.updateLeaderboardDisplay();
                        }
                    }).catch((error) => {
                        console.warn(`⚠️ Could not load ${mode} scores from Gist:`, error);
                    });
                }
            } else {
                console.log('🧊 Skipping manual leaderboard setup for Ice Mode - handled by framework');
                
                // Force mode switch in the Supabase leaderboard system
                if (window.forceLeaderboardMode) {
                    console.log(`🧊 Forcing leaderboard mode to: ${mode}`);
                    await window.forceLeaderboardMode(mode);
                } else {
                    console.log('🧊 forceLeaderboardMode not available');
                }
            }
        } catch (error) {
            console.error(`❌ Error setting up leaderboard for ${mode}:`, error);
            // Don't throw - leaderboard issues shouldn't prevent mode activation
        }
        
        // Apply color scheme and music (only for non-framework modes)
        if (mode !== 'iceFrost') {
            applyColorScheme(window.currentGameMode);
            applyMusicProgression(window.currentGameMode);
        } else {
            console.log('🧊 Skipping manual color/music application for Ice Mode - handled by framework');
        }
        
        // Hide menu
        const menu = document.getElementById('mainMenu');
        if (menu) {
            menu.style.display = 'none';
        }
        
        // Show game canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'block';
        }
        
        // Show game controls
        const controls = document.querySelector('.game-controls');
        if (controls) {
            controls.style.display = 'block';
        }

        // Show game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.style.display = 'block';
        }

        // Show game container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        }

        // Show left sidebar
        const leftSidebar = document.querySelector('.left-sidebar');
        if (leftSidebar) {
            leftSidebar.style.display = 'flex';
        }

        // No start button needed - game auto-starts
        
        // Ball Go Boom button is now handled by boom-button-manager.js via Canvas UI

        // Mode transition - let mode-template-system handle the zoom animation
        function startModeTransition(callback) {
            // Hide the main menu immediately
            const menuContainer = document.getElementById('mainMenu');
            if (menuContainer) {
                menuContainer.style.display = 'none';
            }

            // Call callback immediately - mode system will handle loading screen
            if (callback) callback();
        }

        // Guard to prevent multiple startGame calls
        let gameStartCalled = false;

        // Auto-start with proper state checking
        function checkAndStartGame() {
            // Prevent multiple calls
            if (gameStartCalled) {
                console.log('⏳ Game start already called, skipping...');
                return true;
            }

            console.log('🔍 Checking if all systems are ready for game start...');

            // Check if core systems are ready
            const gameReady = window.startGame && typeof window.startGame === 'function';
            const modeReady = window.currentGameMode && window.selectedGameMode;
            const rendererReady = window.gameCore && window.gameCore.currentMode;

            console.log(`📋 System status: Game=${gameReady}, Mode=${modeReady}, Renderer=${rendererReady}`);

            if (gameReady && modeReady && rendererReady) {
                console.log('✅ All systems ready - starting game!');
                gameStartCalled = true; // Set flag BEFORE calling
                try {
                    window.startGame();
                    console.log('✅ window.startGame() called successfully');
                } catch (error) {
                    console.error('❌ Error calling window.startGame():', error);
                    gameStartCalled = false; // Reset on error
                }
                return true;
            } else {
                console.log('⏳ Systems not ready yet, will retry...');
                return false;
            }
        }

        // Start mode transition, then start game when ready
        startModeTransition(() => {
            // After zoom completes, start game or poll until ready
            if (!checkAndStartGame()) {
                const startPolling = setInterval(() => {
                    if (checkAndStartGame()) {
                        clearInterval(startPolling);
                    }
                }, 100);

                // Failsafe: stop polling after 3 seconds and force start
                setTimeout(() => {
                    clearInterval(startPolling);
                    if (!gameStartCalled && window.startGame && typeof window.startGame === 'function') {
                        console.log('🚨 FALLBACK: Forcing game start');
                        gameStartCalled = true;
                        window.startGame();
                    }
                }, 3000);
            }
        });
        
        window.gameStarted = true;

        // Note: initGame and gameState setup removed to prevent interference
        // startGame() handles all initialization now
        
        // Refresh mode-specific leaderboard
        setTimeout(() => {
            if (window.refreshModeLeaderboard) {
                window.refreshModeLeaderboard();
            }
        }, 1000);
        
        // console.log(`✅ Game started in ${mode} mode`);
    }
    
    // Apply color scheme based on mode
    function applyColorScheme(mode) {
        if (!mode || (!mode.colors && !mode.colorScheme)) {
            console.warn('Mode has no colors defined:', mode);
            return;
        }
        
        console.log(`🎨 Applying ${mode.name} color scheme`);
        
        // Override color variables
        const colors = mode.colors || mode.colorScheme;
        if (window.colors) {
            Object.assign(window.colors, colors);
        } else {
            window.colors = colors;
        }
        
        // Safety check for bg properties
        if (colors.bg && colors.bg.primary) {
            // Update CSS variables
            const root = document.documentElement;
            root.style.setProperty('--bg-primary', colors.bg.primary);
            root.style.setProperty('--bg-secondary', colors.bg.secondary);
            root.style.setProperty('--text-color', colors.text);
            root.style.setProperty('--accent-color', colors.accent);
            
            // Update existing elements
            document.body.style.background = `linear-gradient(135deg, ${colors.bg.primary} 0%, ${colors.bg.secondary} 50%, ${colors.bg.accent} 100%)`;
        } else {
            console.warn('Mode colors missing bg properties:', colors);
        }
    }
    
    // Apply music progression based on mode
    function applyMusicProgression(mode) {
        if (!mode || !mode.progression) return;
        
        console.log(`🎵 Applying ${mode.name} progression:`, mode.progression);
        
        // Override chord progression
        if (window.audioEngine && window.audioEngine.chordProgression) {
            window.audioEngine.chordProgression = mode.progression;
            console.log('✅ Music progression updated');
        } else {
            // Store for later application
            window.pendingProgression = mode.progression;
            console.log('⏳ Music progression stored for later');
        }
    }
    
    // Create Ball Go Boom button
    function createBallGoBoomButton() {
        console.log('💣 Creating Ball Go Boom button...');
        
        const controls = document.querySelector('.game-controls');
        if (!controls) return;
        
        // Check if button already exists
        if (document.getElementById('ballGoBoomBtn')) return;
        
        // Create button
        const boomBtn = document.createElement('button');
        boomBtn.id = 'ballGoBoomBtn';
        boomBtn.innerHTML = '💣 BALL GO BOOM! 💥';
        boomBtn.style.display = 'none';
        controls.appendChild(boomBtn);
        
        // Add event listener
        boomBtn.addEventListener('click', triggerBallExplosion);
        
        console.log('✅ Ball Go Boom button created');
    }
    
    // Check if Ball Go Boom button should be shown
    window.checkBallGoBoomButton = function() {
        if (!window.currentGameMode || window.currentGameMode.id !== 'ballGoBoom') return;
        
        const boomBtn = document.getElementById('ballGoBoomBtn');
        if (!boomBtn) return;
        
        // Check if there's exactly one ball and game is playing
        if (window.balls && window.balls.length === 1 && window.gameState === 'playing') {
            boomBtn.style.display = 'block';
            window.ballGoBoomState.explosionReady = true;
            console.log('💣 Ball Go Boom button shown');
        } else {
            boomBtn.style.display = 'none';
            window.ballGoBoomState.explosionReady = false;
        }
    };
    
    // Trigger ball explosion
    function triggerBallExplosion() {
        if (!window.ballGoBoomState.explosionReady) return;
        if (!window.balls || window.balls.length !== 1) return;
        
        const ball = window.balls[0];
        if (!ball) return;
        
        console.log('💥 BALL GO BOOM! Triggering explosion...');
        
        const boomBtn = document.getElementById('ballGoBoomBtn');
        boomBtn.disabled = true;
        boomBtn.classList.add('flashing');
        
        // Start flashing animation
        let flashSpeed = 500;
        const startTime = Date.now();
        
        window.ballGoBoomState.flashInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            // Speed up flashing over 2 seconds
            flashSpeed = Math.max(50, 500 - (elapsed / 4));
            
            // Make ball flash
            if (ball) {
                ball.isFlashing = !ball.isFlashing;
                
                // Change ball color when flashing
                if (ball.isFlashing) {
                    ball.flashColor = `hsl(${Math.random() * 60}, 100%, 50%)`; // Yellow to red
                }
            }
            
            // After 2 seconds, explode!
            if (elapsed > 2000) {
                clearInterval(window.ballGoBoomState.flashInterval);
                explodeBall(ball);
            }
        }, 200); // Reduced from 50ms to 200ms - much less aggressive
    }
    
    // Explode the ball
    function explodeBall(ball) {
        if (!ball) return;
        
        console.log('💥 KA-BLOOEY! Ball exploding at:', ball.x, ball.y);
        
        // Create explosion visual effect
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const explosion = document.createElement('div');
            explosion.className = 'explosion-effect';
            
            // Get canvas position
            const rect = canvas.getBoundingClientRect();
            explosion.style.left = (ball.x - 200 + rect.left) + 'px';
            explosion.style.top = (ball.y - 200 + rect.top) + 'px';
            explosion.style.position = 'fixed';
            
            document.body.appendChild(explosion);
            
            // Remove explosion after animation
            setTimeout(() => {
                document.body.removeChild(explosion);
            }, 500);
        }
        
        // Apply explosion physics to nearby blocks
        if (window.blocks) {
            window.blocks.forEach(block => {
                if (block.destroyed) return;
                
                // Calculate distance from explosion
                const dx = block.x + block.width/2 - ball.x;
                const dy = block.y + block.height/2 - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If within explosion radius
                if (distance < window.ballGoBoomState.explosionRadius) {
                    const force = (1 - distance / window.ballGoBoomState.explosionRadius) * window.ballGoBoomState.explosionPower;
                    
                    // Destroy very close blocks
                    if (distance < 50) {
                        block.destroyed = true;
                        if (window.score !== undefined) {
                            window.score += block.points || 10;
                            window.updateScore(window.score);
                        }
                        console.log('💥 Block destroyed by explosion!');
                    } 
                    // Push blocks away
                    else {
                        // Add velocity to blocks
                        block.vx = (dx / distance) * force * 0.1;
                        block.vy = (dy / distance) * force * 0.1;
                        block.isMoving = true;
                        console.log('💨 Block pushed by explosion force:', force);
                    }
                }
            });
        }
        
        // Play explosion sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.type = 'sawtooth';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.warn('Could not play explosion sound:', e);
        }
        
        // Remove the ball
        const ballIndex = window.balls.indexOf(ball);
        if (ballIndex > -1) {
            window.balls.splice(ballIndex, 1);
        }
        
        // Reset button
        const boomBtn = document.getElementById('ballGoBoomBtn');
        if (boomBtn) {
            boomBtn.disabled = false;
            boomBtn.classList.remove('flashing');
            boomBtn.style.display = 'none';
        }
        
        // Allow player to shoot again
        if (window.canShoot !== undefined) {
            window.canShoot = true;
        }
        
        console.log('✅ Explosion complete! Player can shoot again.');
    }
    
    // Note: Game loop hook removed to prevent infinite loop conflict with ball-detonator.js
    // Ball Go Boom button visibility is now handled by the ball detonator system
    
    // Load leaderboards for all modes on startup
    function loadAllModeLeaderboards(selectedMode) {
        console.log('📊 Loading leaderboards for all modes...');
        
        // Load original mode leaderboard
        if (window.loadFromGist) {
            window.loadFromGist('original').then(() => {
                console.log('✅ Original mode scores loaded');
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
            }).catch(err => {
                console.warn('⚠️ Could not load original scores:', err);
            });
            
            // Load Ball Go Boom mode leaderboard  
            window.loadFromGist('ballGoBoom').then(() => {
                console.log('✅ Ball Go Boom mode scores loaded');
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
            }).catch(err => {
                console.warn('⚠️ Could not load ballGoBoom scores:', err);
            });
            
            // Load Ice Mode leaderboard
            window.loadFromGist('iceFrost').then(() => {
                console.log('✅ Ice Mode scores loaded');
                if (window.updateLeaderboardDisplay) {
                    window.updateLeaderboardDisplay();
                }
            }).catch(err => {
                console.warn('⚠️ Could not load iceFrost scores:', err);
            });
        }
        
        // Refresh the mode leaderboard display
        if (window.refreshModeLeaderboard) {
            setTimeout(() => {
                window.refreshModeLeaderboard();
                console.log('✅ Mode leaderboards refreshed on startup');
            }, 1000); // Small delay to let gist loading complete
        }
    }
    
    // Initialize
    function initialize() {
        console.log('🎮 Initializing Main Menu System...');
        
        createMainMenu();
        // hookGameLoop(); // Removed to prevent infinite loop conflict
        
        // Check for pending progression
        const checkProgression = setInterval(() => {
            if (window.audioEngine && window.pendingProgression) {
                window.audioEngine.chordProgression = window.pendingProgression;
                delete window.pendingProgression;
                clearInterval(checkProgression);
                console.log('✅ Pending progression applied');
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkProgression), 10000);
        
        // Restore selected mode from localStorage
        const restoredMode = restoreSelectedMode();
        
        // Load leaderboards for all modes immediately on menu creation
        loadAllModeLeaderboards(restoredMode);
        
        console.log('🎮 Main Menu System initialized');
    }
    
    // Debug function to manually start Ball Go Boom
    window.debugStartBallGoBoom = function() {
        console.log('🔧 DEBUG: Manually selecting Ball Go Boom mode');
        selectGameMode('ballGoBoom');
    };
    
    // Debug function to manually start game
    window.debugStartGame = function() {
        console.log('🔧 DEBUG: Starting game directly');
        if (window.startGame && typeof window.startGame === 'function') {
            console.log('🔧 Calling window.startGame() directly');
            window.startGame();
        } else {
            console.warn('🔧 window.startGame not available');
        }
    };
    
    // Debug function to check menu state
    window.debugCheckMenu = function() {
        console.log('🔧 DEBUG: Menu state check');
        console.log('  - Menu exists:', !!document.getElementById('mainMenu'));
        console.log('  - Buttons exist:', document.querySelectorAll('.mode-play-btn').length);
        console.log('  - Current mode:', window.currentGameMode);
        console.log('  - Game started:', window.gameStarted);
    };
    
    // Start after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    console.log('🎮 Main Menu System ready');
    console.log('💡 Debug commands:');
    console.log('  - debugStartBallGoBoom() - Start Ball Go Boom mode');
    console.log('  - debugStartGame() - Start game directly');
    console.log('  - debugCheckMenu() - Check menu state');
    
})();/* Deploy trigger Thu Nov 27 01:30:33 PST 2025 */
