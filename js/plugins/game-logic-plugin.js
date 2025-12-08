/**
 * Game Logic Plugin - Beautiful game mechanics
 * Pure, clean game logic separated from rendering
 */

class GameLogicPlugin {
    constructor() {
        this.ballSpeed = 5;
        this.gravity = 0.2;
        this.bounce = 0.8;
    }
    
    initialize(engine) {
        this.engine = engine;
        
        // Get reference to particle system
        this.particleSystem = engine.plugins.get('particles');
        
        // Get reference to special mechanics
        this.specialMechanics = engine.plugins.get('specialMechanics');
        
        // Register core game update
        engine.registerUpdateHook('gameLogic', 100, this.updateGameLogic.bind(this));
        
        // Register physics update  
        engine.registerUpdateHook('physics', 200, this.updatePhysics.bind(this));
        
        // Register collision detection
        engine.registerUpdateHook('collision', 300, this.updateCollisions.bind(this));
        
        // Register special mechanics update
        engine.registerUpdateHook('specialMechanics', 400, this.updateSpecialMechanics.bind(this));
        
        console.log('🎮 Game Logic plugin initialized');
    }
    
    updateGameLogic(entities, gameData, deltaTime, currentTime) {
        // Clean up destroyed entities
        entities.blocks = entities.blocks.filter(block => !block.destroyed);
        entities.balls = entities.balls.filter(ball => ball.active);
        
        // Particle system manages its own cleanup now
        // entities.particles = entities.particles.filter(particle => particle.life > 0);
        
        // Check win/lose conditions
        this.checkGameConditions(entities, gameData);
    }
    
    updatePhysics(entities, gameData, deltaTime, currentTime) {
        const deltaMultiplier = deltaTime / 16.67; // Normalize to 60fps
        
        // Update balls
        entities.balls.forEach(ball => {
            if (!ball.active) return;
            
            // Apply velocity
            ball.x += ball.velocityX * deltaMultiplier;
            ball.y += ball.velocityY * deltaMultiplier;
            
            // Boundary collisions
            this.handleBoundaryCollisions(ball);
            
            // Update trail
            this.updateBallTrail(ball);
        });
        
        // Particle system handles its own physics now
        // entities.particles.forEach(particle => {
        //     particle.x += particle.velocityX * deltaMultiplier;
        //     particle.y += particle.velocityY * deltaMultiplier;
        //     particle.life -= particle.decay * deltaMultiplier;
        //     particle.alpha = particle.life;
        // });
    }
    
    updateCollisions(entities, gameData, deltaTime, currentTime) {
        // Ball-block collisions
        entities.balls.forEach(ball => {
            if (!ball.active) return;
            
            entities.blocks.forEach(block => {
                if (block.destroyed) return;
                
                if (this.checkBallBlockCollision(ball, block)) {
                    this.handleBallBlockCollision(ball, block, entities, gameData);
                }
            });
        });
    }
    
    handleBoundaryCollisions(ball) {
        const canvas = this.engine.canvas;
        
        // Left/right walls
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.velocityX = Math.abs(ball.velocityX);
        } else if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.velocityX = -Math.abs(ball.velocityX);
        }
        
        // Top wall
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.velocityY = Math.abs(ball.velocityY);
        }
        
        // Bottom - ball lost
        if (ball.y - ball.radius > canvas.height) {
            ball.active = false;
        }
    }
    
    checkBallBlockCollision(ball, block) {
        // AABB collision with circle
        const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
        const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));
        
        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        
        return (dx * dx + dy * dy) < (ball.radius * ball.radius);
    }
    
    handleBallBlockCollision(ball, block, entities, gameData) {
        // Create impact particles using sophisticated particle system
        if (this.particleSystem) {
            this.particleSystem.createImpactEffect(ball.x, ball.y);
        }
        
        // Damage block
        block.hitPoints--;
        
        if (block.hitPoints <= 0) {
            block.destroyed = true;
            gameData.score += 10;
            
            // Handle special block effects before destruction
            this.handleSpecialBlockDestruction(block, entities, gameData);
            
            // Create destruction particles using sophisticated particle system
            if (this.particleSystem) {
                this.particleSystem.createDestructionEffect(
                    block.x + block.width/2, 
                    block.y + block.height/2
                );
            }
        }
        
        // Bounce ball
        const blockCenterX = block.x + block.width / 2;
        const blockCenterY = block.y + block.height / 2;
        
        const dx = ball.x - blockCenterX;
        const dy = ball.y - blockCenterY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            ball.velocityX = -ball.velocityX;
        } else {
            ball.velocityY = -ball.velocityY;
        }
    }
    
    updateBallTrail(ball) {
        if (!ball.trail) ball.trail = [];
        
        ball.trail.push({ x: ball.x, y: ball.y, alpha: 1.0 });
        
        // Limit trail length
        if (ball.trail.length > 10) {
            ball.trail.shift();
        }
        
        // Fade trail
        ball.trail.forEach((point, i) => {
            point.alpha = (i + 1) / ball.trail.length;
        });
    }
    
    // Particle creation now handled by sophisticated ParticleSystemPlugin
    // Old methods removed to prevent duplication
    
    updateSpecialMechanics(entities, gameData, deltaTime, currentTime) {
        if (this.specialMechanics && this.specialMechanics.update) {
            this.specialMechanics.update(entities, gameData, deltaTime, currentTime);
        }
        
        // Handle delayed spawner effects
        this.updateSpawnerBlocks(entities, gameData, currentTime);
    }
    
    handleSpecialBlockDestruction(block, entities, gameData) {
        switch (block.specialType) {
            case 'exploder':
                this.handleExploderDestruction(block, entities, gameData);
                break;
                
            case 'freeze':
                this.handleFreezeDestruction(block, entities, gameData);
                break;
                
            case 'spawner':
                this.handleSpawnerDestruction(block, entities, gameData);
                break;
        }
    }
    
    handleExploderDestruction(block, entities, gameData) {
        // Create massive explosion effect
        if (this.particleSystem) {
            this.particleSystem.createExplosionEffect(
                block.x + block.width/2,
                block.y + block.height/2,
                1.5
            );
        }
        
        // Damage nearby blocks
        const centerX = block.x + block.width/2;
        const centerY = block.y + block.height/2;
        
        entities.blocks.forEach(otherBlock => {
            if (otherBlock === block || otherBlock.destroyed) return;
            
            const dx = (otherBlock.x + otherBlock.width/2) - centerX;
            const dy = (otherBlock.y + otherBlock.height/2) - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= block.explosionRadius) {
                otherBlock.hitPoints = Math.max(0, otherBlock.hitPoints - 2);
                
                if (otherBlock.hitPoints <= 0) {
                    otherBlock.destroyed = true;
                    gameData.score += 15; // Bonus for chain destruction
                    
                    // Chain explosions for other exploders
                    if (otherBlock.specialType === 'exploder' && block.chainExplosion) {
                        setTimeout(() => {
                            if (!otherBlock.hasExploded) {
                                otherBlock.hasExploded = true;
                                this.handleExploderDestruction(otherBlock, entities, gameData);
                            }
                        }, 200); // Small delay for chain effect
                    }
                }
            }
        });
        
        gameData.score += 25; // Bonus for exploder destruction
        console.log('💥 Exploder block destroyed with area damage!');
    }
    
    handleFreezeDestruction(block, entities, gameData) {
        // Create freeze effect
        if (this.particleSystem) {
            this.particleSystem.createFreezeEffect(
                block.x + block.width/2,
                block.y + block.height/2
            );
        }
        
        // Freeze nearby balls
        const centerX = block.x + block.width/2;
        const centerY = block.y + block.height/2;
        
        entities.balls.forEach(ball => {
            if (!ball.active) return;
            
            const dx = ball.x - centerX;
            const dy = ball.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= block.freezeRadius) {
                // Apply freeze effect
                ball.frozen = true;
                ball.frozenUntil = performance.now() + block.freezeDuration;
                ball.originalVelocityX = ball.velocityX;
                ball.originalVelocityY = ball.velocityY;
                ball.velocityX *= 0.1; // Slow to 10%
                ball.velocityY *= 0.1;
            }
        });
        
        gameData.score += 20; // Bonus for freeze destruction
        console.log('🧊 Freeze block destroyed - balls frozen!');
    }
    
    handleSpawnerDestruction(block, entities, gameData) {
        // Create golden spawn effect
        if (this.particleSystem) {
            this.particleSystem.createSpawnEffect(
                block.x + block.width/2,
                block.y + block.height/2
            );
        }
        
        // Schedule block spawning
        block.spawnTime = performance.now() + block.spawnDelay;
        block.pendingSpawn = true;
        
        gameData.score += 30; // Bonus for spawner destruction
        console.log('⭐ Spawner block destroyed - blocks will spawn!');
    }
    
    updateSpawnerBlocks(entities, gameData, currentTime) {
        entities.blocks.forEach(block => {
            if (block.pendingSpawn && !block.hasSpawned && currentTime >= block.spawnTime) {
                this.spawnNewBlocks(block, entities, gameData);
                block.hasSpawned = true;
                block.pendingSpawn = false;
            }
        });
        
        // Update frozen balls
        entities.balls.forEach(ball => {
            if (ball.frozen && currentTime >= ball.frozenUntil) {
                ball.frozen = false;
                ball.velocityX = ball.originalVelocityX;
                ball.velocityY = ball.originalVelocityY;
            }
        });
    }
    
    spawnNewBlocks(spawnerBlock, entities, gameData) {
        const spawnPositions = this.getSpawnPositions(spawnerBlock, entities);
        
        for (let i = 0; i < Math.min(spawnerBlock.spawnCount, spawnPositions.length); i++) {
            const pos = spawnPositions[i];
            
            const newBlock = {
                x: pos.x,
                y: pos.y,
                width: spawnerBlock.width,
                height: spawnerBlock.height,
                hitPoints: Math.max(1, Math.floor(spawnerBlock.hitPoints * 0.6)),
                maxHitPoints: Math.max(1, Math.floor(spawnerBlock.hitPoints * 0.6)),
                destroyed: false,
                specialType: null, // Spawned blocks are normal
                color: this.getBlockColor(1), // Always green/weak
                isSpawned: true
            };
            
            entities.blocks.push(newBlock);
            
            // Create spawn particles
            if (this.particleSystem) {
                this.particleSystem.createSpawnEffect(pos.x + pos.width/2, pos.y + pos.height/2);
            }
        }
        
        console.log(`⭐ Spawned ${Math.min(spawnerBlock.spawnCount, spawnPositions.length)} new blocks!`);
    }
    
    getSpawnPositions(spawnerBlock, entities) {
        const positions = [];
        const blockWidth = spawnerBlock.width;
        const blockHeight = spawnerBlock.height;
        
        // Try to spawn around the original spawner position
        const spawnOffsets = [
            { dx: 0, dy: -35 }, // Above
            { dx: 0, dy: 35 },  // Below
            { dx: blockWidth + 5, dy: 0 }, // Right
            { dx: -(blockWidth + 5), dy: 0 }, // Left
        ];
        
        spawnOffsets.forEach(offset => {
            const x = spawnerBlock.x + offset.dx;
            const y = spawnerBlock.y + offset.dy;
            
            // Check if position is valid (not overlapping and in bounds)
            if (this.isValidSpawnPosition(x, y, blockWidth, blockHeight, entities)) {
                positions.push({ x, y, width: blockWidth, height: blockHeight });
            }
        });
        
        return positions;
    }
    
    isValidSpawnPosition(x, y, width, height, entities) {
        // Check canvas bounds
        if (x < 0 || y < 0 || x + width > this.engine.canvas.width || y + height > this.engine.canvas.height) {
            return false;
        }
        
        // Check for overlapping blocks
        for (const block of entities.blocks) {
            if (block.destroyed) continue;
            
            if (x < block.x + block.width &&
                x + width > block.x &&
                y < block.y + block.height &&
                y + height > block.y) {
                return false; // Overlapping
            }
        }
        
        return true;
    }
    
    checkGameConditions(entities, gameData) {
        // Level complete
        if (entities.blocks.length === 0 && this.engine.state === 'playing') {
            this.levelComplete(gameData);
        }
        
        // Game over - only if we've launched at least one ball and now have none
        if (entities.balls.length === 0 && 
            this.engine.state === 'playing' && 
            gameData.ballsLaunched > 0) {
            this.engine.setState('gameOver');
        }
    }
    
    levelComplete(gameData) {
        gameData.level++;
        gameData.score += gameData.level * 50;
        
        console.log(`🎯 Level ${gameData.level} complete!`);
        
        // Generate new level after delay
        setTimeout(() => {
            this.generateLevel(gameData);
            this.engine.setState('playing');
        }, 1000);
    }
    
    generateLevel(gameData) {
        const entities = this.engine.entities;
        entities.blocks = [];
        
        const rows = Math.min(3 + Math.floor(gameData.level / 2), 8);
        const cols = 10;
        const blockWidth = (this.engine.canvas.width - 60) / cols;
        const blockHeight = 25;
        const startX = (this.engine.canvas.width - (cols * blockWidth)) / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const block = {
                    x: startX + col * blockWidth,
                    y: 50 + row * (blockHeight + 5),
                    width: blockWidth - 2,
                    height: blockHeight,
                    hitPoints: Math.min(1 + Math.floor(gameData.level / 3), 5),
                    maxHitPoints: Math.min(1 + Math.floor(gameData.level / 3), 5),
                    destroyed: false,
                    specialType: this.determineSpecialType(row, col, gameData.level),
                    color: this.getBlockColor(Math.min(1 + Math.floor(gameData.level / 3), 5))
                };
                
                // Add special properties based on type
                this.initializeSpecialBlock(block, gameData.level);
                
                entities.blocks.push(block);
            }
        }
        
        console.log(`🏗️ Generated level ${gameData.level}: ${entities.blocks.length} blocks`);
    }
    
    determineSpecialType(row, col, level) {
        // No special blocks in early levels
        if (level < 2) return null;
        
        const random = Math.random();
        const specialChance = Math.min(0.15 + (level * 0.02), 0.35); // Max 35% special blocks
        
        if (random > specialChance) return null;
        
        // Determine type based on level and randomization
        const typeRandom = Math.random();
        
        if (level >= 5 && typeRandom < 0.3) {
            return 'spawner'; // 30% of special blocks are spawners (level 5+)
        } else if (level >= 3 && typeRandom < 0.6) {
            return 'exploder'; // 30% of special blocks are exploders (level 3+)
        } else if (level >= 2) {
            return 'freeze'; // 40% of special blocks are freeze (level 2+)
        }
        
        return null;
    }
    
    initializeSpecialBlock(block, level) {
        switch (block.specialType) {
            case 'exploder':
                block.hitPoints = Math.max(1, Math.floor(block.hitPoints * 0.7)); // Slightly weaker
                block.explosionRadius = 80;
                block.chainExplosion = true;
                break;
                
            case 'freeze':
                block.hitPoints = Math.max(1, Math.floor(block.hitPoints * 0.8)); // Slightly weaker
                block.freezeDuration = 2000; // 2 second freeze
                block.freezeRadius = 60;
                break;
                
            case 'spawner':
                block.hitPoints = Math.max(2, Math.floor(block.hitPoints * 1.5)); // Stronger
                block.spawnCount = Math.min(2 + Math.floor(level / 4), 4);
                block.spawnDelay = 1000; // 1 second delay after destruction
                block.hasSpawned = false;
                break;
        }
    }
    
    getBlockColor(hp) {
        const colors = ['#4CAF50', '#FF9800', '#FF5722', '#F44336', '#9C27B0'];
        return colors[Math.min(hp - 1, colors.length - 1)];
    }
    
    // Public API
    launchBall(x, y, velocityX, velocityY) {
        // Track that we've launched a ball
        this.engine.gameData.ballsLaunched++;
        
        this.engine.addEntity('balls', {
            x: x,
            y: y,
            velocityX: velocityX,
            velocityY: velocityY,
            radius: 8,
            active: true,
            trail: []
        });
        
        console.log(`🚀 Ball launched (${this.engine.gameData.ballsLaunched} total)`);
    }
    
    startNewGame() {
        this.engine.reset();
        
        // Initialize ball launch tracking
        this.engine.gameData.ballsLaunched = 0;
        this.engine.gameData.ballCount = 3; // Player starts with 3 balls
        
        this.generateLevel(this.engine.gameData);
        // Don't set engine state - let the State System manage this
        console.log('🎮 New game started with blocks generated');
    }
}

// Export
window.GameLogicPlugin = GameLogicPlugin;
console.log('🎮 Beautiful Game Logic Plugin loaded');