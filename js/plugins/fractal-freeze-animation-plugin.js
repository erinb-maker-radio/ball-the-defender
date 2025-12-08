/**
 * FRACTAL FREEZE ANIMATION PLUGIN - SMART ARCHITECTURE
 * ====================================================
 * 
 * Beautiful fractal ice animation that spreads across frozen blocks.
 * Uses smart plugin architecture with clean canvas integration.
 * No patches or hacks - pure plugin system.
 */

class FractalFreezeAnimationPlugin {
    constructor() {
        this.name = 'FractalFreezeAnimationPlugin';
        this.version = '1.0.0';
        this.isActive = false;
        this.animationFrameId = null;
        this.freezeAnimations = new Map();
        this.fractalPatterns = [];
        this.canvas = null;
        this.ctx = null;
        this.iceShards = new Map(); // Store shattering ice shards
        
        console.log('❄️ FractalFreezeAnimationPlugin initialized');
    }
    
    /**
     * Activate the plugin
     */
    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.initializeCanvas();
        this.hookIntoFreezeEvents();
        this.registerWithCanvasSystem();
        this.startAnimationLoop();
        
        console.log('✅ FractalFreezeAnimationPlugin activated');
    }
    
    /**
     * Deactivate the plugin
     */
    deactivate() {
        if (!this.isActive) return;
        
        this.cleanup();
        this.isActive = false;
        
        console.log('🧹 FractalFreezeAnimationPlugin deactivated');
    }
    
    /**
     * Initialize smart architecture overlay canvas
     */
    initializeCanvas() {
        const waitForGameCanvas = () => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (!gameCanvas) {
                console.log('⏳ FractalPlugin: Waiting for gameCanvas...');
                setTimeout(waitForGameCanvas, 100);
                return;
            }
            
            // SMART ARCHITECTURE: Create overlay canvas instead of modifying game canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fractalOverlayCanvas';
            this.canvas.width = gameCanvas.width;
            this.canvas.height = gameCanvas.height;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = gameCanvas.offsetTop + 'px';
            this.canvas.style.left = gameCanvas.offsetLeft + 'px';
            this.canvas.style.pointerEvents = 'none'; // Don't interfere with game interactions
            this.canvas.style.zIndex = '10'; // Render on top
            
            // Insert overlay canvas after the game canvas
            gameCanvas.parentNode.insertBefore(this.canvas, gameCanvas.nextSibling);
            
            this.ctx = this.canvas.getContext('2d');
            console.log('✅ Fractal overlay canvas created using smart architecture');
        };
        
        waitForGameCanvas();
    }
    
    /**
     * Hook into freeze system events
     */
    hookIntoFreezeEvents() {
        // Monitor the freeze system for new frozen blocks
        this.monitorFreezeSystem();
        
        // Register with canvas plugin system
        this.registerWithCanvasSystem();
    }
    
    /**
     * Monitor freeze system for new animations and block destruction
     */
    monitorFreezeSystem() {
        const checkInterval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(checkInterval);
                return;
            }
            
            // Check for newly frozen blocks
            if (window.iceMode && window.iceMode.plugin) {
                const freezePlugin = window.iceMode.plugin;
                
                freezePlugin.frozenBlocks.forEach((block, index) => {
                    if (!this.freezeAnimations.has(index)) {
                        this.startFractalAnimation(block, index);
                    }
                });
                
                // Clean up animations for unfrozen blocks
                this.freezeAnimations.forEach((animation, index) => {
                    if (!freezePlugin.frozenBlocks.has(index)) {
                        this.stopFractalAnimation(index);
                    }
                });
            }
            
            // Monitor for frozen block destruction and trigger ice shattering
            this.monitorFrozenBlockDestruction();
        }, 100);
        
        this.monitorInterval = checkInterval;
    }
    
    /**
     * Monitor for frozen blocks being hit/destroyed for ice shattering
     */
    monitorFrozenBlockDestruction() {
        if (!window.blocks) return;
        
        // Check for blocks that were frozen but are now being destroyed
        this.freezeAnimations.forEach((animation, blockIndex) => {
            const block = window.blocks[blockIndex];
            if (block && block.frozen && block.hp <= 0 && !block.destroyed) {
                // Block is about to be destroyed - trigger ice shattering!
                this.triggerIceShattering(animation);
                console.log(`💥 Ice shattering triggered for frozen block ${blockIndex}`);
            }
        });
    }
    
    /**
     * Trigger spectacular ice shattering with triangle shards
     */
    triggerIceShattering(animation) {
        const { block, blockIndex } = animation;
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        
        // Create MASSIVE number of triangle ice shards for spectacular explosion
        const shards = [];
        const numShards = 12 + Math.floor(Math.random() * 8); // 12-20 shards
        
        for (let i = 0; i < numShards; i++) {
            // Create random triangle shard
            const shard = this.createTriangleShard(block, i);
            shards.push(shard);
        }
        
        // Store shards for rendering
        const shatterEffect = {
            blockIndex,
            shards,
            startTime: performance.now(),
            duration: 2000, // 2 seconds of shard physics
            impactX: block.x + blockWidth / 2,
            impactY: block.y + blockHeight / 2
        };
        
        this.iceShards.set(blockIndex, shatterEffect);
        
        // Play dramatic glass breaking sound
        this.playGlassBreakingSound();
        
        console.log(`💥 Created ${numShards} ice shards for spectacular shattering!`);
    }
    
    /**
     * Create a single triangle ice shard with physics
     */
    createTriangleShard(block, shardIndex) {
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        const centerX = block.x + blockWidth / 2;
        const centerY = block.y + blockHeight / 2;
        
        // Random starting position within block
        const startX = block.x + Math.random() * blockWidth;
        const startY = block.y + Math.random() * blockHeight;
        
        // Random triangle size
        const size = 3 + Math.random() * 6;
        
        // Create triangle points relative to center
        const trianglePoints = [
            { x: 0, y: -size },
            { x: -size * 0.8, y: size * 0.6 },
            { x: size * 0.8, y: size * 0.6 }
        ];
        
        // Random velocity - explosive outward from impact
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 120; // 80-200 pixels/second
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed - 50; // Slight upward bias
        
        // Random rotation
        const rotationSpeed = (Math.random() - 0.5) * 0.3; // radians/frame
        
        return {
            x: startX,
            y: startY,
            velocityX,
            velocityY,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed,
            trianglePoints,
            size,
            opacity: 0.9,
            gravity: 200, // pixels/second²
            bounce: 0.3, // bounce dampening
            friction: 0.98, // velocity dampening
            color: this.getRandomIceShardColor(),
            shadow: true
        };
    }
    
    /**
     * Get random ice shard color variation
     */
    getRandomIceShardColor() {
        const colors = [
            'rgba(255, 255, 255, {})',
            'rgba(200, 255, 255, {})',
            'rgba(150, 255, 255, {})',
            'rgba(100, 200, 255, {})',
            'rgba(180, 240, 255, {})'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Update ice shard physics
     */
    updateIceShards(currentTime, deltaTime) {
        this.iceShards.forEach((shatterEffect, blockIndex) => {
            const elapsed = currentTime - shatterEffect.startTime;
            
            if (elapsed > shatterEffect.duration) {
                this.iceShards.delete(blockIndex);
                return;
            }
            
            // Update each shard's physics
            shatterEffect.shards.forEach(shard => {
                // Apply gravity
                shard.velocityY += shard.gravity * (deltaTime / 1000);
                
                // Update position
                shard.x += shard.velocityX * (deltaTime / 1000);
                shard.y += shard.velocityY * (deltaTime / 1000);
                
                // Update rotation
                shard.rotation += shard.rotationSpeed;
                
                // Apply friction
                shard.velocityX *= shard.friction;
                shard.velocityY *= shard.friction;
                
                // Bounce off canvas edges
                if (this.canvas) {
                    if (shard.x < 0 || shard.x > this.canvas.width) {
                        shard.velocityX *= -shard.bounce;
                        shard.x = Math.max(0, Math.min(this.canvas.width, shard.x));
                    }
                    if (shard.y > this.canvas.height) {
                        shard.velocityY *= -shard.bounce;
                        shard.y = this.canvas.height;
                        
                        // Additional friction on ground bounce
                        shard.velocityX *= 0.7;
                    }
                }
                
                // Fade out over time
                const fadeProgress = elapsed / shatterEffect.duration;
                shard.opacity = 0.9 * (1 - fadeProgress * fadeProgress); // Quadratic fade
            });
        });
    }
    
    /**
     * Render all ice shards with physics
     */
    renderIceShards(currentTime) {
        if (this.iceShards.size === 0) return;
        
        this.ctx.save();
        
        this.iceShards.forEach(shatterEffect => {
            shatterEffect.shards.forEach(shard => {
                if (shard.opacity <= 0) return;
                
                this.ctx.save();
                this.ctx.translate(shard.x, shard.y);
                this.ctx.rotate(shard.rotation);
                this.ctx.globalAlpha = shard.opacity;
                
                // Shard styling
                this.ctx.fillStyle = shard.color.replace('{}', shard.opacity);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${shard.opacity * 0.8})`;
                this.ctx.lineWidth = 0.5;
                
                // Shadow for depth
                if (shard.shadow) {
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.shadowBlur = 2;
                    this.ctx.shadowOffsetX = 1;
                    this.ctx.shadowOffsetY = 1;
                }
                
                // Draw triangle shard
                this.ctx.beginPath();
                this.ctx.moveTo(shard.trianglePoints[0].x, shard.trianglePoints[0].y);
                shard.trianglePoints.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
                this.ctx.closePath();
                
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.restore();
            });
        });
        
        this.ctx.restore();
    }
    
    /**
     * Play spectacular glass breaking sound
     */
    playGlassBreakingSound() {
        if (window.audioEngine?.playCustomSound) {
            // Create layered glass breaking sound
            const sounds = [
                // High pitch glass shatter
                {
                    frequency: 3500 + Math.random() * 800,
                    type: 'square',
                    duration: 0.2,
                    volume: 0.25,
                    effects: ['shatter', 'sharp']
                },
                // Mid-range glass break
                {
                    frequency: 2200 + Math.random() * 600,
                    type: 'sawtooth',
                    duration: 0.3,
                    volume: 0.2,
                    effects: ['break', 'brittle']
                },
                // Lower glass fragments
                {
                    frequency: 1400 + Math.random() * 400,
                    type: 'triangle',
                    duration: 0.4,
                    volume: 0.15,
                    effects: ['fragments', 'scatter']
                },
                // Deep impact thump
                {
                    frequency: 180 + Math.random() * 120,
                    type: 'sine',
                    duration: 0.3,
                    volume: 0.12,
                    effects: ['impact', 'thump']
                }
            ];
            
            // Play each layer for maximum impact
            sounds.forEach((sound, index) => {
                setTimeout(() => {
                    window.audioEngine.playCustomSound(sound);
                }, index * 30); // Tight timing for explosive effect
            });
            
            console.log('💥🔊 Spectacular glass breaking sound with 4 layers!');
        } else {
            console.warn('⚠️ Audio engine not available for glass breaking sound');
        }
    }
    
    /**
     * Start fractal animation for a frozen block with cascade support
     */
    startFractalAnimation(block, blockIndex) {
        const cascadeInfo = block.cascadeInfo || {};
        const cascadeDelay = (cascadeInfo.sequenceIndex || 0) * 200; // Match freeze cascade timing
        
        const animation = {
            block,
            blockIndex,
            startTime: performance.now() + cascadeDelay, // Delay start based on cascade
            phase: 0, // 0 = spreading, 1 = sustained, 2 = fading
            spreadProgress: 0,
            intensity: 1.0,
            fractals: this.generateFractalPattern(block),
            pulsePhase: 0,
            sparkles: this.generateSparkles(block),
            cascadeInfo: cascadeInfo,
            isSource: cascadeInfo.isSource || false,
            sequenceIndex: cascadeInfo.sequenceIndex || 0
        };
        
        this.freezeAnimations.set(blockIndex, animation);
        // PERFORMANCE: Remove console logging for better performance
    }
    
    /**
     * Stop fractal animation for a block
     */
    stopFractalAnimation(blockIndex) {
        if (this.freezeAnimations.has(blockIndex)) {
            this.freezeAnimations.delete(blockIndex);
            // PERFORMANCE: Remove console logging for better performance
        }
    }
    
    /**
     * PERFORMANCE: Generate simplified fractal pattern (2 layers instead of 6)
     */
    generateFractalPattern(block) {
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        const centerX = block.x + blockWidth / 2;
        const centerY = block.y + blockHeight / 2;
        
        const layers = {
            // PERFORMANCE: Only core and primary patterns (skip secondary, veins, frost, cracks)
            core: this.generateSimpleCorePattern(centerX, centerY, Math.min(blockWidth, blockHeight) * 0.3),
            primary: this.generateSimplePrimaryBranches(centerX, centerY, blockWidth, blockHeight),
            
            // Keep empty arrays for compatibility
            secondary: [],
            veins: [],
            frost: [],
            cracks: []
        };
        
        return layers;
    }
    
    /**
     * PERFORMANCE: Generate simplified core pattern (3 lines instead of 12)
     */
    generateSimpleCorePattern(centerX, centerY, radius) {
        const core = [];
        
        // Just 3 main spokes for simplicity
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const outerX = centerX + Math.cos(angle) * radius;
            const outerY = centerY + Math.sin(angle) * radius;
            
            core.push({
                type: 'line',
                points: [{ x: centerX, y: centerY }, { x: outerX, y: outerY }],
                weight: 2,
                opacity: 0.9
            });
        }
        
        return core;
    }
    
    /**
     * PERFORMANCE: Generate simplified primary branches (3 branches instead of 6+)
     */
    generateSimplePrimaryBranches(centerX, centerY, blockWidth, blockHeight) {
        const branches = [];
        
        // Just 3 main branches
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const length = Math.min(blockWidth, blockHeight) * 0.35;
            const endX = centerX + Math.cos(angle) * length;
            const endY = centerY + Math.sin(angle) * length;
            
            branches.push({
                type: 'line',
                points: [{ x: centerX, y: centerY }, { x: endX, y: endY }],
                weight: 1.5,
                opacity: 0.8
            });
        }
        
        return branches;
    }

    /**
     * Generate core ice crystal pattern (dense center) - ORIGINAL VERSION
     */
    generateCorePattern(centerX, centerY, radius) {
        const core = [];
        const sides = 6; // Hexagonal ice structure
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const outerX = centerX + Math.cos(angle) * radius;
            const outerY = centerY + Math.sin(angle) * radius;
            
            // Core spokes
            core.push({
                type: 'line',
                points: [{ x: centerX, y: centerY }, { x: outerX, y: outerY }],
                weight: 2,
                opacity: 0.9
            });
            
            // Hexagon outline
            const nextAngle = ((i + 1) / sides) * Math.PI * 2;
            const nextX = centerX + Math.cos(nextAngle) * radius;
            const nextY = centerY + Math.sin(nextAngle) * radius;
            
            core.push({
                type: 'line',
                points: [{ x: outerX, y: outerY }, { x: nextX, y: nextY }],
                weight: 1.5,
                opacity: 0.8
            });
        }
        
        return core;
    }
    
    /**
     * Generate primary growth branches (main dendrite structure)
     */
    generatePrimaryBranches(centerX, centerY, blockWidth, blockHeight) {
        const branches = [];
        const mainBranches = 6;
        
        for (let i = 0; i < mainBranches; i++) {
            const angle = (i / mainBranches) * Math.PI * 2;
            const length = Math.min(blockWidth, blockHeight) * 0.4;
            
            // Main branch
            const endX = centerX + Math.cos(angle) * length;
            const endY = centerY + Math.sin(angle) * length;
            
            branches.push({
                type: 'line',
                points: [{ x: centerX, y: centerY }, { x: endX, y: endY }],
                weight: 1.5,
                opacity: 0.7
            });
            
            // Add side branches
            const sideLength = length * 0.6;
            const sideOffset = Math.PI / 4;
            
            const leftX = endX + Math.cos(angle - sideOffset) * sideLength;
            const leftY = endY + Math.sin(angle - sideOffset) * sideLength;
            const rightX = endX + Math.cos(angle + sideOffset) * sideLength;
            const rightY = endY + Math.sin(angle + sideOffset) * sideLength;
            
            branches.push({
                type: 'line',
                points: [{ x: endX, y: endY }, { x: leftX, y: leftY }],
                weight: 1,
                opacity: 0.6
            });
            
            branches.push({
                type: 'line',
                points: [{ x: endX, y: endY }, { x: rightX, y: rightY }],
                weight: 1,
                opacity: 0.6
            });
        }
        
        return branches;
    }
    
    /**
     * Generate secondary dendrites (finer branching)
     */
    generateSecondaryDendrites(centerX, centerY, blockWidth, blockHeight) {
        const dendrites = [];
        const numDendrites = 12;
        
        for (let i = 0; i < numDendrites; i++) {
            const angle = (i / numDendrites) * Math.PI * 2 + (Math.PI / 12); // Offset from primary
            const baseLength = Math.min(blockWidth, blockHeight) * 0.25;
            
            // Random variation in length and angle
            const length = baseLength * (0.7 + Math.random() * 0.6);
            const finalAngle = angle + (Math.random() - 0.5) * 0.3;
            
            const endX = centerX + Math.cos(finalAngle) * length;
            const endY = centerY + Math.sin(finalAngle) * length;
            
            dendrites.push({
                type: 'line',
                points: [{ x: centerX, y: centerY }, { x: endX, y: endY }],
                weight: 0.8,
                opacity: 0.5
            });
            
            // Add tiny sub-branches
            const subLength = length * 0.4;
            const subAngle1 = finalAngle + Math.PI / 6;
            const subAngle2 = finalAngle - Math.PI / 6;
            
            const sub1X = endX + Math.cos(subAngle1) * subLength;
            const sub1Y = endY + Math.sin(subAngle1) * subLength;
            const sub2X = endX + Math.cos(subAngle2) * subLength;
            const sub2Y = endY + Math.sin(subAngle2) * subLength;
            
            dendrites.push({
                type: 'line',
                points: [{ x: endX, y: endY }, { x: sub1X, y: sub1Y }],
                weight: 0.5,
                opacity: 0.4
            });
            
            dendrites.push({
                type: 'line',
                points: [{ x: endX, y: endY }, { x: sub2X, y: sub2Y }],
                weight: 0.5,
                opacity: 0.4
            });
        }
        
        return dendrites;
    }
    
    /**
     * Generate crystalline veins (connecting internal structures)
     */
    generateCrystallineVeins(block, centerX, centerY) {
        const veins = [];
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        
        // Create organic vein patterns
        const numVeins = 8;
        for (let i = 0; i < numVeins; i++) {
            const startAngle = (i / numVeins) * Math.PI * 2;
            const length = Math.min(blockWidth, blockHeight) * 0.3;
            
            // Create curved veins using multiple points
            const points = [{ x: centerX, y: centerY }];
            const segments = 4;
            
            for (let j = 1; j <= segments; j++) {
                const progress = j / segments;
                const currentLength = length * progress;
                const angle = startAngle + (Math.random() - 0.5) * 0.4 * progress;
                
                const x = centerX + Math.cos(angle) * currentLength;
                const y = centerY + Math.sin(angle) * currentLength;
                points.push({ x, y });
            }
            
            veins.push({
                type: 'curve',
                points: points,
                weight: 0.6,
                opacity: 0.3
            });
        }
        
        return veins;
    }
    
    /**
     * Generate surface frost patterns (edge effects)
     */
    generateSurfaceFrost(block, centerX, centerY) {
        const frost = [];
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        
        // Edge frost patterns
        const edges = [
            // Top edge
            { start: { x: block.x, y: block.y }, end: { x: block.x + blockWidth, y: block.y } },
            // Right edge
            { start: { x: block.x + blockWidth, y: block.y }, end: { x: block.x + blockWidth, y: block.y + blockHeight } },
            // Bottom edge
            { start: { x: block.x + blockWidth, y: block.y + blockHeight }, end: { x: block.x, y: block.y + blockHeight } },
            // Left edge
            { start: { x: block.x, y: block.y + blockHeight }, end: { x: block.x, y: block.y } }
        ];
        
        edges.forEach(edge => {
            const numCrystals = 5;
            for (let i = 0; i < numCrystals; i++) {
                const progress = (i + 1) / (numCrystals + 1);
                const edgeX = edge.start.x + (edge.end.x - edge.start.x) * progress;
                const edgeY = edge.start.y + (edge.end.y - edge.start.y) * progress;
                
                // Small frost crystals pointing inward
                const angle = Math.atan2(centerY - edgeY, centerX - edgeX);
                const length = 3 + Math.random() * 4;
                const endX = edgeX + Math.cos(angle) * length;
                const endY = edgeY + Math.sin(angle) * length;
                
                frost.push({
                    type: 'line',
                    points: [{ x: edgeX, y: edgeY }, { x: endX, y: endY }],
                    weight: 0.3,
                    opacity: 0.6
                });
                
                // Add tiny side crystals
                const sideLength = length * 0.4;
                const leftAngle = angle + Math.PI / 3;
                const rightAngle = angle - Math.PI / 3;
                
                frost.push({
                    type: 'line',
                    points: [
                        { x: endX, y: endY },
                        { x: endX + Math.cos(leftAngle) * sideLength, y: endY + Math.sin(leftAngle) * sideLength }
                    ],
                    weight: 0.2,
                    opacity: 0.4
                });
                
                frost.push({
                    type: 'line',
                    points: [
                        { x: endX, y: endY },
                        { x: endX + Math.cos(rightAngle) * sideLength, y: endY + Math.sin(rightAngle) * sideLength }
                    ],
                    weight: 0.2,
                    opacity: 0.4
                });
            }
        });
        
        return frost;
    }
    
    /**
     * Generate fractal crack patterns for ice breaking
     */
    generateFractalCracks(block, centerX, centerY) {
        const cracks = [];
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        
        // Generate major crack lines from center outward
        const majorCracks = 6;
        for (let i = 0; i < majorCracks; i++) {
            const angle = (i / majorCracks) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const length = Math.min(blockWidth, blockHeight) * (0.8 + Math.random() * 0.4);
            
            // Create jagged crack line with multiple segments
            const segments = 4 + Math.floor(Math.random() * 3);
            const points = [{ x: centerX, y: centerY }];
            
            for (let j = 1; j <= segments; j++) {
                const progress = j / segments;
                const currentLength = length * progress;
                const deviation = (Math.random() - 0.5) * 0.4 * progress; // More deviation further out
                const currentAngle = angle + deviation;
                
                const x = centerX + Math.cos(currentAngle) * currentLength;
                const y = centerY + Math.sin(currentAngle) * currentLength;
                
                // Keep within block bounds
                const clampedX = Math.max(block.x + 2, Math.min(block.x + blockWidth - 2, x));
                const clampedY = Math.max(block.y + 2, Math.min(block.y + blockHeight - 2, y));
                
                points.push({ x: clampedX, y: clampedY });
            }
            
            cracks.push({
                type: 'crack',
                points: points,
                weight: 1.5 + Math.random() * 0.5,
                opacity: 0.9,
                isMainCrack: true
            });
            
            // Add branching sub-cracks
            const subCracks = 2 + Math.floor(Math.random() * 2);
            for (let k = 0; k < subCracks && points.length > 2; k++) {
                const branchPoint = points[1 + Math.floor(Math.random() * (points.length - 2))];
                const branchAngle = angle + (Math.random() - 0.5) * Math.PI * 0.8;
                const branchLength = length * (0.3 + Math.random() * 0.4);
                
                const branchEndX = branchPoint.x + Math.cos(branchAngle) * branchLength;
                const branchEndY = branchPoint.y + Math.sin(branchAngle) * branchLength;
                
                // Keep within bounds
                const clampedBranchX = Math.max(block.x + 1, Math.min(block.x + blockWidth - 1, branchEndX));
                const clampedBranchY = Math.max(block.y + 1, Math.min(block.y + blockHeight - 1, branchEndY));
                
                cracks.push({
                    type: 'crack',
                    points: [branchPoint, { x: clampedBranchX, y: clampedBranchY }],
                    weight: 0.8 + Math.random() * 0.4,
                    opacity: 0.7,
                    isMainCrack: false
                });
            }
        }
        
        // Add fine stress cracks around edges
        const edgeCracks = 8;
        for (let i = 0; i < edgeCracks; i++) {
            const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
            let startX, startY, endX, endY;
            
            if (side === 0) { // Top edge
                startX = block.x + Math.random() * blockWidth;
                startY = block.y;
                endX = startX + (Math.random() - 0.5) * blockWidth * 0.3;
                endY = block.y + Math.random() * blockHeight * 0.4;
            } else if (side === 1) { // Right edge
                startX = block.x + blockWidth;
                startY = block.y + Math.random() * blockHeight;
                endX = block.x + blockWidth - Math.random() * blockWidth * 0.4;
                endY = startY + (Math.random() - 0.5) * blockHeight * 0.3;
            } else if (side === 2) { // Bottom edge
                startX = block.x + Math.random() * blockWidth;
                startY = block.y + blockHeight;
                endX = startX + (Math.random() - 0.5) * blockWidth * 0.3;
                endY = block.y + blockHeight - Math.random() * blockHeight * 0.4;
            } else { // Left edge
                startX = block.x;
                startY = block.y + Math.random() * blockHeight;
                endX = block.x + Math.random() * blockWidth * 0.4;
                endY = startY + (Math.random() - 0.5) * blockHeight * 0.3;
            }
            
            cracks.push({
                type: 'crack',
                points: [{ x: startX, y: startY }, { x: endX, y: endY }],
                weight: 0.4 + Math.random() * 0.3,
                opacity: 0.5,
                isMainCrack: false
            });
        }
        
        return cracks;
    }
    
    /**
     * Generate sparkle effects for ice crystals
     */
    generateSparkles(block) {
        const sparkles = [];
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        
        for (let i = 0; i < 12; i++) {
            sparkles.push({
                x: block.x + Math.random() * blockWidth,
                y: block.y + Math.random() * blockHeight,
                size: Math.random() * 3 + 1,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.05 + 0.02
            });
        }
        
        return sparkles;
    }
    
    /**
     * Register with canvas plugin system
     */
    registerWithCanvasSystem() {
        if (window.CanvasPluginSystem) {
            // Create render plugin interface
            const renderPlugin = {
                name: 'FractalFreezeAnimationPlugin',
                isActive: true,
                render: (ctx, currentTime) => this.renderFractalAnimations(currentTime)
            };
            
            window.CanvasPluginSystem.registerRenderPlugin(renderPlugin);
            window.CanvasPluginSystem.activateRenderPlugin('FractalFreezeAnimationPlugin');
            
            console.log('✅ Registered with CanvasPluginSystem');
        } else {
            console.warn('⚠️ CanvasPluginSystem not available - animations may not render');
        }
    }
    
    /**
     * Start smart architecture overlay rendering
     */
    startAnimationLoop() {
        if (this.animationFrameId) return; // Already running
        
        console.log('🎬 Starting smart architecture overlay rendering');
        
        const overlayAnimationLoop = () => {
            if (!this.isActive) {
                this.animationFrameId = requestAnimationFrame(overlayAnimationLoop);
                return;
            }
            
            // Clear overlay canvas
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                const currentTime = performance.now();
                const deltaTime = 16; // Approximate 60fps delta
                
                // Update and render ice shard physics
                if (this.iceShards.size > 0) {
                    this.updateIceShards(currentTime, deltaTime);
                    this.renderIceShards(currentTime);
                }
                
                // Render fractal animations on overlay
                if (this.freezeAnimations.size > 0) {
                    this.renderFractalAnimations(currentTime);
                }
            }
            
            this.animationFrameId = requestAnimationFrame(overlayAnimationLoop);
        };
        
        this.animationFrameId = requestAnimationFrame(overlayAnimationLoop);
        // PERFORMANCE: Remove console logging for better performance
    }
    
    /**
     * Render all fractal animations - OPTIMIZED single pass
     */
    renderFractalAnimations(currentTime) {
        if (!this.ctx) return;
        if (this.freezeAnimations.size === 0) return;
        
        this.ctx.save();
        
        // PERFORMANCE: Single pass rendering - background + fractals together
        this.freezeAnimations.forEach(animation => {
            this.renderOptimizedFractalAnimation(animation, currentTime);
        });
        
        this.ctx.restore();
    }
    
    /**
     * Render dramatic black background behind ice crystals
     */
    renderBlackBackground(animation, currentTime) {
        const elapsed = currentTime - animation.startTime;
        if (elapsed < 0) return; // Don't render if cascade delay hasn't passed
        
        const { block } = animation;
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        
        // Calculate background intensity based on animation phase
        let backgroundIntensity = 0;
        if (elapsed < 1000) {
            // Fade in black background during spreading phase
            backgroundIntensity = (elapsed / 1000) * 0.85;
        } else if (elapsed < 4000) {
            // Full black background during sustained phase
            backgroundIntensity = 0.85;
        } else if (elapsed < 5000) {
            // Fade out black background during fading phase
            const fadeProgress = (elapsed - 4000) / 1000;
            backgroundIntensity = 0.85 * (1 - fadeProgress);
        }
        
        if (backgroundIntensity <= 0) return;
        
        // Add slight pulsing to the background
        const pulsePhase = animation.pulsePhase || 0;
        const pulse = (Math.sin(pulsePhase * 0.5) + 1) * 0.5;
        const finalIntensity = backgroundIntensity * (0.8 + 0.2 * pulse);
        
        // Render black background with subtle gradient
        const gradient = this.ctx.createRadialGradient(
            block.x + blockWidth/2, block.y + blockHeight/2, 0,
            block.x + blockWidth/2, block.y + blockHeight/2, Math.max(blockWidth, blockHeight)/2
        );
        gradient.addColorStop(0, `rgba(0, 0, 0, ${finalIntensity})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${finalIntensity * 0.7})`);
        
        this.ctx.fillStyle = gradient;
        
        // Add slight border rounding for organic look
        this.ctx.beginPath();
        this.ctx.roundRect(block.x - 1, block.y - 1, blockWidth + 2, blockHeight + 2, 2);
        this.ctx.fill();
        
        // Add subtle dark blue tint around edges for depth
        if (finalIntensity > 0.5) {
            const edgeGradient = this.ctx.createRadialGradient(
                block.x + blockWidth/2, block.y + blockHeight/2, 0,
                block.x + blockWidth/2, block.y + blockHeight/2, Math.max(blockWidth, blockHeight)/2 + 3
            );
            edgeGradient.addColorStop(0, 'rgba(0, 20, 40, 0)');
            edgeGradient.addColorStop(1, `rgba(0, 20, 40, ${(finalIntensity - 0.5) * 0.4})`);
            
            this.ctx.fillStyle = edgeGradient;
            this.ctx.beginPath();
            this.ctx.roundRect(block.x - 3, block.y - 3, blockWidth + 6, blockHeight + 6, 3);
            this.ctx.fill();
        }
    }
    
    /**
     * OPTIMIZED: Render animation with background in single pass
     */
    renderOptimizedFractalAnimation(animation, currentTime) {
        const elapsed = currentTime - animation.startTime;
        if (elapsed < 0) return; // Don't render if cascade delay hasn't passed
        
        const { block } = animation;
        
        // PERFORMANCE: Simple background instead of complex gradients
        let backgroundAlpha = 0;
        if (elapsed < 1000) {
            backgroundAlpha = (elapsed / 1000) * 0.6; // Reduced from 0.85
        } else if (elapsed < 4000) {
            backgroundAlpha = 0.6; // Reduced opacity
        } else if (elapsed < 5000) {
            backgroundAlpha = 0.6 * (1 - (elapsed - 4000) / 1000);
        }
        
        if (backgroundAlpha > 0) {
            // Simple rectangle instead of gradients
            this.ctx.fillStyle = `rgba(0, 0, 0, ${backgroundAlpha})`;
            this.ctx.fillRect(block.x, block.y, block.width || 50, block.height || 25);
        }
        
        // Continue with fractal rendering
        this.renderSimplifiedFractalAnimation(animation, currentTime);
    }

    /**
     * Render simplified fractal animation - PERFORMANCE OPTIMIZED
     */
    renderSimplifiedFractalAnimation(animation, currentTime) {
        const elapsed = currentTime - animation.startTime;
        if (elapsed < 0) return;
        
        // PERFORMANCE: Simplified animation phases
        let intensity = 0;
        if (elapsed < 1000) {
            intensity = elapsed / 1000; // Fade in
        } else if (elapsed < 4000) {
            intensity = 1.0; // Full intensity
        } else if (elapsed < 5000) {
            intensity = 1.0 - (elapsed - 4000) / 1000; // Fade out
        }
        
        if (intensity <= 0) return;
        
        // PERFORMANCE: Only render essential elements
        this.renderSimplifiedFractalBranches(animation, intensity);
        
        // PERFORMANCE: Skip sparkles and overlay for better performance
        // this.renderSparkles(animation, currentTime);
        // this.renderIceCrystalOverlay(animation);
    }
    
    /**
     * PERFORMANCE: Simplified fractal branch rendering (60% fewer operations)
     */
    renderSimplifiedFractalBranches(animation, intensity) {
        const { fractals } = animation;
        
        // PERFORMANCE: Only render core and primary layers (skip secondary, veins, frost)
        this.ctx.strokeStyle = `rgba(200, 255, 255, ${intensity * 0.8})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowColor = `rgba(200, 255, 255, ${intensity * 0.4})`;
        this.ctx.shadowBlur = 4;
        
        // Render core pattern
        fractals.core.forEach(element => {
            if (element.type === 'line' && element.points.length >= 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(element.points[0].x, element.points[0].y);
                this.ctx.lineTo(element.points[1].x, element.points[1].y);
                this.ctx.stroke();
            }
        });
        
        // Render primary branches only
        fractals.primary.forEach(element => {
            if (element.type === 'line' && element.points.length >= 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(element.points[0].x, element.points[0].y);
                this.ctx.lineTo(element.points[1].x, element.points[1].y);
                this.ctx.stroke();
            }
        });
    }
    
    /**
     * Render a single fractal layer with timing
     */
    renderFractalLayer(layer, intensity, spreadProgress, pulsePhase, layerDelay, layerType) {
        // Calculate layer-specific progress (staggered appearance)
        const layerProgress = Math.max(0, Math.min(1, (spreadProgress - layerDelay) / (1 - layerDelay)));
        if (layerProgress <= 0) return;
        
        // Enhanced layer-specific styling for dramatic contrast against black background
        const layerStyles = {
            core: { color: 'rgba(255, 255, 255, {})', weight: 2.5, blur: 8 },
            primary: { color: 'rgba(0, 255, 255, {})', weight: 2, blur: 6 },
            secondary: { color: 'rgba(100, 255, 255, {})', weight: 1.5, blur: 4 },
            veins: { color: 'rgba(150, 255, 255, {})', weight: 1, blur: 3 },
            frost: { color: 'rgba(220, 255, 255, {})', weight: 0.8, blur: 2 }
        };
        
        const style = layerStyles[layerType];
        const pulseIntensity = (Math.sin(pulsePhase) + 1) * 0.5;
        const finalIntensity = intensity * layerProgress * (0.7 + 0.3 * pulseIntensity);
        
        this.ctx.strokeStyle = style.color.replace('{}', finalIntensity);
        this.ctx.shadowColor = style.color.replace('{}', finalIntensity * 0.5);
        this.ctx.shadowBlur = style.blur;
        
        layer.forEach(element => {
            this.ctx.lineWidth = element.weight * style.weight;
            this.ctx.globalAlpha = element.opacity * finalIntensity;
            
            if (element.type === 'line') {
                this.renderLine(element.points);
            } else if (element.type === 'curve') {
                this.renderCurve(element.points);
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Render a straight line
     */
    renderLine(points) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        this.ctx.lineTo(points[1].x, points[1].y);
        this.ctx.stroke();
    }
    
    /**
     * Render a smooth curve
     */
    renderCurve(points) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        if (points.length === 2) {
            this.ctx.lineTo(points[1].x, points[1].y);
        } else {
            // Create smooth curve through points
            for (let i = 1; i < points.length - 1; i++) {
                const current = points[i];
                const next = points[i + 1];
                const controlX = current.x + (next.x - current.x) * 0.5;
                const controlY = current.y + (next.y - current.y) * 0.5;
                this.ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
            }
            // Final point
            const last = points[points.length - 1];
            this.ctx.lineTo(last.x, last.y);
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Render dramatic ice crack layer
     */
    renderCrackLayer(cracks, intensity, crackProgress, pulsePhase) {
        // Cracks appear progressively during cracking phase
        const visibleCrackCount = Math.floor(cracks.length * crackProgress);
        
        this.ctx.save();
        
        // Crack styling - dark fractures in the ice
        this.ctx.strokeStyle = `rgba(20, 20, 20, ${0.8 * intensity})`;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 2;
        this.ctx.lineCap = 'butt';
        
        for (let i = 0; i < visibleCrackCount; i++) {
            const crack = cracks[i];
            
            // Individual crack progress for staggered appearance
            const individualProgress = Math.max(0, Math.min(1, (crackProgress * cracks.length - i) / 2));
            if (individualProgress <= 0) continue;
            
            this.ctx.lineWidth = crack.weight * (crack.isMainCrack ? 1.5 : 1.0);
            this.ctx.globalAlpha = crack.opacity * intensity * individualProgress;
            
            if (crack.points.length >= 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(crack.points[0].x, crack.points[0].y);
                
                // Draw jagged crack line
                for (let j = 1; j < crack.points.length; j++) {
                    const point = crack.points[j];
                    const visibleLength = Math.min(j / (crack.points.length - 1), individualProgress);
                    
                    if (visibleLength >= j / (crack.points.length - 1)) {
                        this.ctx.lineTo(point.x, point.y);
                    } else {
                        // Partial crack - interpolate to current progress
                        const prevPoint = crack.points[j - 1];
                        const segmentProgress = (visibleLength - (j - 1) / (crack.points.length - 1)) * (crack.points.length - 1);
                        const x = prevPoint.x + (point.x - prevPoint.x) * segmentProgress;
                        const y = prevPoint.y + (point.y - prevPoint.y) * segmentProgress;
                        this.ctx.lineTo(x, y);
                        break;
                    }
                }
                
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Play realistic ice cracking sound effect
     */
    playCrackingSound() {
        if (window.audioEngine?.playCustomSound) {
            // Create layered cracking sound with multiple frequencies
            const sounds = [
                // Sharp high crack
                {
                    frequency: 2800 + Math.random() * 400,
                    type: 'square',
                    duration: 0.15,
                    volume: 0.15,
                    effects: ['crack', 'sharp']
                },
                // Mid-range crack
                {
                    frequency: 1200 + Math.random() * 300,
                    type: 'sawtooth',
                    duration: 0.25,
                    volume: 0.12,
                    effects: ['crack', 'brittle']
                },
                // Low rumble/stress
                {
                    frequency: 180 + Math.random() * 80,
                    type: 'triangle',
                    duration: 0.4,
                    volume: 0.08,
                    effects: ['stress', 'deep']
                }
            ];
            
            // Play each layer with slight delay for realism
            sounds.forEach((sound, index) => {
                setTimeout(() => {
                    window.audioEngine.playCustomSound(sound);
                }, index * 50);
            });
            
            console.log('🧊💥 Multi-layer ice cracking sound played');
        } else {
            console.warn('⚠️ Audio engine not available for cracking sound');
        }
    }
    
    
    /**
     * Render enhanced sparkle effects for dramatic contrast
     */
    renderSparkles(animation, currentTime) {
        const { sparkles, intensity } = animation;
        
        sparkles.forEach(sparkle => {
            sparkle.phase += sparkle.speed;
            const sparkleIntensity = (Math.sin(sparkle.phase) + 1) * 0.5 * intensity;
            
            // Enhanced sparkles with cyan-white brilliance against black
            const sparkleColor = sparkleIntensity > 0.7 ? 
                `rgba(255, 255, 255, ${sparkleIntensity})` : 
                `rgba(200, 255, 255, ${sparkleIntensity})`;
            
            this.ctx.fillStyle = sparkleColor;
            this.ctx.shadowColor = sparkleIntensity > 0.6 ? '#ffffff' : '#00ffff';
            this.ctx.shadowBlur = sparkle.size * 3; // Increased glow
            
            // Enhanced sparkle with cross pattern for more brilliance
            this.ctx.save();
            this.ctx.globalAlpha = sparkleIntensity;
            
            // Main sparkle
            this.ctx.beginPath();
            this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add cross-shaped sparkle for extra brilliance
            if (sparkleIntensity > 0.5) {
                this.ctx.strokeStyle = sparkleColor;
                this.ctx.lineWidth = sparkle.size * 0.3;
                this.ctx.lineCap = 'round';
                
                const crossSize = sparkle.size * 2;
                this.ctx.beginPath();
                // Vertical line
                this.ctx.moveTo(sparkle.x, sparkle.y - crossSize);
                this.ctx.lineTo(sparkle.x, sparkle.y + crossSize);
                // Horizontal line  
                this.ctx.moveTo(sparkle.x - crossSize, sparkle.y);
                this.ctx.lineTo(sparkle.x + crossSize, sparkle.y);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    /**
     * Render ice crystal overlay effect
     */
    renderIceCrystalOverlay(animation) {
        const { block, intensity, pulsePhase } = animation;
        const pulseIntensity = (Math.sin(pulsePhase) + 1) * 0.5;
        
        // Ice crystal border
        this.ctx.strokeStyle = `rgba(0, 229, 255, ${0.6 * intensity * pulseIntensity})`;
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#00e5ff';
        this.ctx.shadowBlur = 8;
        
        const blockWidth = block.width || 50;
        const blockHeight = block.height || 25;
        
        this.ctx.beginPath();
        this.ctx.rect(block.x, block.y, blockWidth, blockHeight);
        this.ctx.stroke();
        
        // Ice surface texture
        this.ctx.fillStyle = `rgba(173, 216, 230, ${0.2 * intensity})`;
        this.ctx.fill();
    }
    
    /**
     * Cleanup all resources
     */
    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        // Unregister from canvas plugin system
        if (window.CanvasPluginSystem) {
            window.CanvasPluginSystem.unregisterRenderPlugin('FractalFreezeAnimationPlugin');
        }
        
        this.freezeAnimations.clear();
        this.fractalPatterns = [];
        this.iceShards.clear();
        
        console.log('🧹 Fractal animations cleaned up');
    }
    
    /**
     * Get plugin info
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            isActive: this.isActive,
            activeAnimations: this.freezeAnimations.size,
            canvasAvailable: !!this.ctx
        };
    }
}

// Plugin Manager Integration
if (typeof window.PluginManager !== 'undefined') {
    window.PluginManager.registerPlugin(new FractalFreezeAnimationPlugin());
} else {
    // Create plugin instance for direct use
    window.FractalFreezeAnimationPlugin = new FractalFreezeAnimationPlugin();
    console.log('💡 FractalFreezeAnimationPlugin ready - use window.FractalFreezeAnimationPlugin.activate() to enable');
}

console.log('❄️ FractalFreezeAnimationPlugin loaded - Beautiful fractal ice animations ready');