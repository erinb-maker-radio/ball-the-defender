// Force create window.iceMode when Ice Mode is active
console.log('🔧 Force Ice Mode Creation Script Loaded');

function forceCreateIceMode() {
    console.log('🧊 FORCE CREATING WINDOW.ICEMODE...');
    
    if (window.iceMode) {
        console.log('✅ window.iceMode already exists');
        return;
    }
    
    // Create the freeze system manually
    const frozenBlocks = new Map();
    const freezeTimers = new Map();
    
    window.iceMode = {
        frozenBlocks: frozenBlocks,
        freezeTimers: freezeTimers,
        isFreezing: false,
        
        freezeBlocksInRadius: function(centerX, centerY, radius) {
            console.log(`🧊 ENHANCED FREEZE: Called at (${centerX}, ${centerY}) with radius ${radius}`);
            console.log('  Blocks available:', window.blocks?.length || 0);
            
            if (!window.blocks) {
                console.warn('❌ No blocks array found');
                return;
            }
            
            if (this.isFreezing) {
                console.warn('⚠️ Already processing freeze effect');
                return;
            }
            
            this.isFreezing = true;
            
            const freezePixelRadius = radius * 150; // 150 pixel radius
            const affectedBlocks = [];
            
            const centerBlockX = centerX + 40; // Center of freeze block
            const centerBlockY = centerY + 15;
            
            // Find blocks within radius
            window.blocks.forEach((block, index) => {
                if (block.destroyed || block.frozen) return;
                
                const blockCenterX = block.x + block.width / 2;
                const blockCenterY = block.y + block.height / 2;
                
                const dx = blockCenterX - centerBlockX;
                const dy = blockCenterY - centerBlockY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 10 && distance <= freezePixelRadius) {
                    affectedBlocks.push({ block, index });
                }
            });
            
            console.log(`🧊 Found ${affectedBlocks.length} blocks to freeze`);
            
            // Freeze each affected block
            affectedBlocks.forEach(({ block, index }) => {
                this.freezeBlock(block, index);
            });
            
            this.isFreezing = false;
        },
        
        freezeBlock: function(block, index) {
            if (!block || block.destroyed) return;
            
            // Clear existing freeze timer if re-freezing
            if (this.frozenBlocks.has(index)) {
                console.log(`🔄 Re-freezing block ${index}, clearing old timer`);
                const oldTimer = this.freezeTimers.get(index);
                if (oldTimer) {
                    clearInterval(oldTimer);
                    this.freezeTimers.delete(index);
                }
            }
            
            console.log(`🧊 Freezing block at index ${index}`);
            
            // Mark block as frozen
            block.frozen = true;
            block.freezeCountdown = 5;
            this.frozenBlocks.set(index, block);
            
            // Add visual ice overlay
            console.log(`🔧 About to call addIceOverlay for block ${index}`);
            try {
                this.addIceOverlay(block, index);
            } catch (error) {
                console.error(`❌ Error adding ice overlay:`, error);
            }
            
            // Start countdown
            const timer = setInterval(() => {
                // Check if block still exists and isn't destroyed
                if (!block || block.destroyed || !this.frozenBlocks.has(index)) {
                    console.log(`🧹 Cleaning up timer for block ${index} (destroyed or missing)`);
                    clearInterval(timer);
                    this.freezeTimers.delete(index);
                    this.frozenBlocks.delete(index);
                    if (block && block.iceOverlay) {
                        block.iceOverlay.remove();
                        delete block.iceOverlay;
                        delete block.countdownElement;
                    }
                    return;
                }
                
                // Decrease countdown
                if (block.freezeCountdown > 0) {
                    block.freezeCountdown--;
                    console.log(`  Block ${index} countdown: ${block.freezeCountdown}`);
                    
                    // Update visual countdown
                    if (block.countdownElement) {
                        block.countdownElement.textContent = block.freezeCountdown;
                    }
                    
                    // Unfreeze when countdown reaches zero
                    if (block.freezeCountdown <= 0) {
                        clearInterval(timer);
                        this.freezeTimers.delete(index);
                        this.unfreezeBlock(block, index);
                    }
                } else {
                    // Safety cleanup if countdown is already 0 or negative
                    console.log(`🧹 Safety cleanup for block ${index} with countdown ${block.freezeCountdown}`);
                    clearInterval(timer);
                    this.freezeTimers.delete(index);
                    this.unfreezeBlock(block, index);
                }
            }, 1000);
            
            this.freezeTimers.set(index, timer);
        },
        
        unfreezeBlock: function(block, index) {
            console.log(`🔥 Unfreezing block at index ${index}`);
            
            block.frozen = false;
            delete block.freezeCountdown;
            
            // Remove visual overlay
            if (block.iceOverlay) {
                block.iceOverlay.remove();
                delete block.iceOverlay;
                delete block.countdownElement;
            }
            
            // Clear timer
            if (this.freezeTimers.has(index)) {
                clearInterval(this.freezeTimers.get(index));
                this.freezeTimers.delete(index);
            }
            
            this.frozenBlocks.delete(index);
        },
        
        addIceOverlay: function(block, index) {
            console.log('🧊 DISABLED: force-ice-mode-creation.js overlay creation disabled - using canvas rendering');
            // DISABLED - ice effects now rendered on canvas
        },
        
        // Cleanup function
        cleanup: function() {
            this.freezeTimers.forEach(timer => clearInterval(timer));
            this.freezeTimers.clear();
            this.frozenBlocks.clear();
        }
    };
    
    console.log('✅ window.iceMode created manually');
    console.log('✅ freezeBlocksInRadius function available:', !!window.iceMode.freezeBlocksInRadius);
}

// Try to create immediately
setTimeout(forceCreateIceMode, 100);

// Also monitor for Ice Mode activation
setInterval(() => {
    if (window.currentGameMode?.id === 'iceFrost' && !window.iceMode) {
        console.log('🔍 Ice Mode detected but window.iceMode missing - creating...');
        forceCreateIceMode();
    }
}, 1000);

console.log('✅ Force Ice Mode creation script active');