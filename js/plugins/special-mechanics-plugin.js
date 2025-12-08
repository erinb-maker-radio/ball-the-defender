/**
 * Special Mechanics Plugin - Expandable mode-specific abilities
 * Smart architecture for Ball Go Boom, Ice Mode, and future mechanics
 */

class SpecialMechanicsPlugin {
    constructor() {
        this.mechanics = new Map(); // mode -> mechanics object
        this.activeMechanics = null;
        this.currentMode = 'original';
        
        this.registerBuiltInMechanics();
    }
    
    initialize(engine) {
        this.engine = engine;
        this.colorThemes = engine.plugins.get('colorThemes');
        this.particleSystem = engine.plugins.get('particles');
        
        // Listen for theme changes to switch mechanics
        if (this.colorThemes) {
            this.colorThemes.onThemeChange = (themeId) => {
                this.switchMechanics(themeId);
            };
        }
        
        console.log('⚡ Special Mechanics plugin initialized with expandable architecture');
    }
    
    registerBuiltInMechanics() {
        // Ball Go Boom Mode - Explosive balls
        this.registerMechanic('ballGoBoom', {
            name: 'Ball Go Boom',
            description: 'Explosive ball detonation',
            buttonText: 'DETONATE',
            buttonColor: '#ff1744',
            
            // Mode-specific state
            detonationRadius: 150,
            explosionDamage: 999, // Destroys any block
            cooldownTime: 5000, // 5 second cooldown
            lastDetonation: 0,
            
            // Activation method
            activate: (gameData, entities, currentTime) => {
                return this.activateBallGoBoom(gameData, entities, currentTime);
            },
            
            // Check if available
            canActivate: (gameData, entities, currentTime) => {
                return this.canActivateBallGoBoom(gameData, entities, currentTime);
            }
        });
        
        // Ice Mode - Freeze mechanics
        this.registerMechanic('ice', {
            name: 'Ice Mode',
            description: 'Freeze time mechanics',
            buttonText: 'FREEZE',
            buttonColor: '#00e5ff',
            
            // Mode-specific state
            freezeDuration: 3000, // 3 seconds
            freezeCooldown: 8000, // 8 second cooldown
            lastFreeze: 0,
            frozenUntil: 0,
            
            // Activation method
            activate: (gameData, entities, currentTime) => {
                return this.activateFreeze(gameData, entities, currentTime);
            },
            
            // Check if available
            canActivate: (gameData, entities, currentTime) => {
                return this.canActivateFreeze(gameData, entities, currentTime);
            }
        });
        
        // Original Mode - No special mechanics
        this.registerMechanic('original', {
            name: 'Original Mode',
            description: 'Classic gameplay',
            buttonText: null, // No button
            buttonColor: null,
            
            activate: () => false, // No special mechanics
            canActivate: () => false
        });
    }
    
    // Smart architecture - easily add new mechanics
    registerMechanic(modeId, mechanics) {
        this.mechanics.set(modeId, mechanics);
        console.log(`⚡ Registered special mechanics for: ${mechanics.name}`);
    }
    
    switchMechanics(modeId) {
        this.currentMode = modeId;
        this.activeMechanics = this.mechanics.get(modeId);
        
        if (this.activeMechanics) {
            console.log(`⚡ Switched to mechanics: ${this.activeMechanics.name}`);
            this.updateUI();
        }
    }
    
    // Ball Go Boom implementation
    canActivateBallGoBoom(gameData, entities, currentTime) {
        const mechanic = this.mechanics.get('ballGoBoom');
        if (!mechanic) return false;
        
        // Check cooldown
        if (currentTime - mechanic.lastDetonation < mechanic.cooldownTime) {
            return false;
        }
        
        // Need active balls to detonate
        return entities.balls.some(ball => ball.active);
    }
    
    activateBallGoBoom(gameData, entities, currentTime) {
        const mechanic = this.mechanics.get('ballGoBoom');
        if (!mechanic || !this.canActivateBallGoBoom(gameData, entities, currentTime)) {
            return false;
        }
        
        mechanic.lastDetonation = currentTime;
        
        // Find all active balls
        const activeBalls = entities.balls.filter(ball => ball.active);
        if (activeBalls.length === 0) return false;
        
        console.log('💥 Ball Go Boom activated!');
        
        // Detonate all balls
        activeBalls.forEach(ball => {
            this.detonateBall(ball, entities, gameData, mechanic);
        });
        
        return true;
    }
    
    detonateBall(ball, entities, gameData, mechanic) {
        // Create massive explosion particles
        if (this.particleSystem) {
            this.particleSystem.createExplosionEffect(ball.x, ball.y, 2.0);
        }
        
        // Destroy blocks in radius
        const blocksDestroyed = entities.blocks.filter(block => {
            if (block.destroyed) return false;
            
            const dx = block.x + block.width/2 - ball.x;
            const dy = block.y + block.height/2 - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= mechanic.detonationRadius) {
                block.destroyed = true;
                gameData.score += 25; // Bonus points for boom destruction
                
                // Create destruction particles
                if (this.particleSystem) {
                    this.particleSystem.createDestructionEffect(
                        block.x + block.width/2,
                        block.y + block.height/2
                    );
                }
                
                return true;
            }
            return false;
        });
        
        // Remove ball
        ball.active = false;
        
        console.log(`💥 Detonation destroyed ${blocksDestroyed.length} blocks!`);
    }
    
    // Ice Mode implementation
    canActivateFreeze(gameData, entities, currentTime) {
        const mechanic = this.mechanics.get('ice');
        if (!mechanic) return false;
        
        // Check cooldown
        return currentTime - mechanic.lastFreeze >= mechanic.freezeCooldown;
    }
    
    activateFreeze(gameData, entities, currentTime) {
        const mechanic = this.mechanics.get('ice');
        if (!mechanic || !this.canActivateFreeze(gameData, entities, currentTime)) {
            return false;
        }
        
        mechanic.lastFreeze = currentTime;
        mechanic.frozenUntil = currentTime + mechanic.freezeDuration;
        
        console.log('🧊 Freeze activated!');
        
        // Create freeze effects on all blocks
        entities.blocks.forEach(block => {
            if (!block.destroyed && this.particleSystem) {
                this.particleSystem.createFreezeEffect(
                    block.x + block.width/2,
                    block.y + block.height/2
                );
            }
        });
        
        return true;
    }
    
    // Update mechanics each frame
    update(entities, gameData, deltaTime, currentTime) {
        if (!this.activeMechanics) return;
        
        // Ice Mode - apply freeze effects
        if (this.currentMode === 'ice') {
            this.updateFreezeEffects(entities, currentTime);
        }
    }
    
    updateFreezeEffects(entities, currentTime) {
        const mechanic = this.mechanics.get('ice');
        if (!mechanic) return;
        
        const isFrozen = currentTime < mechanic.frozenUntil;
        
        // Apply freeze to balls (slow them down dramatically)
        if (isFrozen) {
            entities.balls.forEach(ball => {
                if (ball.active) {
                    ball.velocityX *= 0.1; // Slow to 10% speed
                    ball.velocityY *= 0.1;
                }
            });
        }
    }
    
    // UI Integration
    updateUI() {
        if (!this.activeMechanics || !this.activeMechanics.buttonText) {
            this.hideButton();
            return;
        }
        
        this.createOrUpdateButton();
    }
    
    createOrUpdateButton() {
        let button = document.getElementById('specialMechanicButton');
        
        if (!button) {
            button = document.createElement('button');
            button.id = 'specialMechanicButton';
            button.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            
            button.addEventListener('click', () => this.triggerActivation());
            document.body.appendChild(button);
        }
        
        // Update button appearance
        button.textContent = this.activeMechanics.buttonText;
        button.style.backgroundColor = this.activeMechanics.buttonColor;
        
        // Update button state based on availability
        this.updateButtonState(button);
    }
    
    updateButtonState(button) {
        if (!button || !this.activeMechanics) return;
        
        const canActivate = this.activeMechanics.canActivate(
            this.engine.gameData,
            this.engine.entities,
            performance.now()
        );
        
        if (canActivate) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.transform = 'scale(1)';
        } else {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.transform = 'scale(0.9)';
        }
    }
    
    hideButton() {
        const button = document.getElementById('specialMechanicButton');
        if (button) {
            button.style.display = 'none';
        }
    }
    
    triggerActivation() {
        if (!this.activeMechanics) return;
        
        const success = this.activeMechanics.activate(
            this.engine.gameData,
            this.engine.entities,
            performance.now()
        );
        
        if (success) {
            // Update button state immediately
            const button = document.getElementById('specialMechanicButton');
            this.updateButtonState(button);
            
            console.log(`⚡ ${this.activeMechanics.name} triggered successfully!`);
        }
    }
    
    // Game state integration
    onStateChange(oldState, newState) {
        const button = document.getElementById('specialMechanicButton');
        if (!button) return;
        
        // Show button only during gameplay
        if (newState === 'playing') {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    }
    
    // Performance monitoring
    getMechanicStatus() {
        if (!this.activeMechanics) return null;
        
        return {
            mode: this.currentMode,
            mechanicName: this.activeMechanics.name,
            canActivate: this.activeMechanics.canActivate(
                this.engine.gameData,
                this.engine.entities,
                performance.now()
            )
        };
    }
}

// Export
window.SpecialMechanicsPlugin = SpecialMechanicsPlugin;
console.log('⚡ Beautiful Special Mechanics Plugin loaded');