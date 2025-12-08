/**
 * Canvas UI System - Clean Architecture
 * ====================================
 * Provides canvas-native UI elements that integrate cleanly with the game loop
 * No separate render loops, no game loop wrapping, no interference
 */

class CanvasUI {
    constructor() {
        this.elements = new Map();
        this.isInitialized = false;
        this.canvas = null;
        this.ctx = null;
        
        console.log('🎨 CanvasUI system created');
    }
    
    /**
     * Initialize with existing canvas - no interference
     */
    initialize(canvas, ctx) {
        if (!canvas || !ctx) {
            console.error('❌ CanvasUI: Invalid canvas or context');
            return false;
        }
        
        this.canvas = canvas;
        this.ctx = ctx;
        this.isInitialized = true;
        
        // Set up mouse event handlers
        this.setupMouseHandlers();
        
        console.log('✅ CanvasUI initialized with existing canvas');
        return true;
    }
    
    /**
     * Add a UI element
     */
    addElement(id, element) {
        if (!this.isInitialized) {
            console.warn('⚠️ CanvasUI not initialized, element will be added when ready');
        }
        
        this.elements.set(id, element);
        console.log(`✅ UI element added: ${id}`);
    }
    
    /**
     * Remove a UI element
     */
    removeElement(id) {
        this.elements.delete(id);
        console.log(`🗑️ UI element removed: ${id}`);
    }
    
    /**
     * Get a UI element
     */
    getElement(id) {
        return this.elements.get(id);
    }
    
    /**
     * Render all UI elements - called by game loop
     */
    render() {
        if (!this.isInitialized || this.elements.size === 0) return;
        
        // Render each visible element
        for (const [id, element] of this.elements) {
            if (element.isVisible && element.render) {
                this.ctx.save();
                element.render(this.ctx);
                this.ctx.restore();
            }
        }
    }
    
    /**
     * Handle mouse events for UI elements - NON-INTERFERING
     */
    setupMouseHandlers() {
        console.log('⚠️ Canvas UI mouse handlers DISABLED to prevent interference');
        console.log('   UI elements will use polling for interaction detection');
        
        // DISABLED: Mouse event handlers to prevent interference with game
        // Instead, UI elements will check mouse position via polling
        
        // Store mouse position for polling
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Light mouse tracking (no preventDefault or event handling)
        this.canvas.addEventListener('mousemove', (event) => {
            const coords = this.getMouseCoordinates(event);
            this.mouseX = coords.x;
            this.mouseY = coords.y;
        }, { passive: true });
        
        console.log('✅ Non-interfering mouse tracking set up');
    }
    
    /**
     * Convert mouse event to canvas coordinates
     */
    getMouseCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }
    
    /**
     * Update all UI elements - called by game loop
     */
    update() {
        if (!this.isInitialized) return;
        
        // Update mouse interactions via polling
        for (const [id, element] of this.elements) {
            if (element.isVisible && element.handleMouseMove) {
                element.handleMouseMove(this.mouseX, this.mouseY);
            }
            
            if (element.update) {
                element.update();
            }
        }
    }
}

/**
 * Boom Button - Canvas UI Element
 * ===============================
 * Clean boom button implementation that follows launcher position
 */
class BoomButton {
    constructor(options = {}) {
        // Visual properties
        this.radius = options.radius || 40;
        this.text = options.text || '💥';
        this.fontSize = options.fontSize || 16;
        this.color = options.color || '#ff4444';
        this.textColor = options.textColor || '#ffffff';
        
        // Position properties
        this.offsetX = options.offsetX || 0;
        this.offsetY = options.offsetY || -60; // Above launcher
        
        // State
        this.isVisible = false;
        this.isHovered = false;
        this.isPressed = false;
        
        // Animation
        this.pulseTime = 0;
        this.hoverScale = 1.1;
        this.pressScale = 0.9;
        
        // Callback
        this.onClick = options.onClick || (() => {});
        
        console.log('💥 BoomButton created');
    }
    
    /**
     * Get current position based on launcher
     */
    getPosition() {
        const launcherX = window.nextBallStartX || (window.canvas?.width / 2) || 0;
        const launcherY = window.BALL_START_Y || (window.canvas?.height - 20) || 0;
        
        return {
            x: launcherX + this.offsetX,
            y: launcherY + this.offsetY
        };
    }
    
    /**
     * Check if point is inside button
     */
    isPointInside(mouseX, mouseY) {
        const pos = this.getPosition();
        const distance = Math.sqrt(
            Math.pow(mouseX - pos.x, 2) + 
            Math.pow(mouseY - pos.y, 2)
        );
        return distance <= this.radius;
    }
    
    /**
     * Handle mouse move
     */
    handleMouseMove(mouseX, mouseY) {
        const wasHovered = this.isHovered;
        this.isHovered = this.isPointInside(mouseX, mouseY);
        
        // Change cursor
        if (this.isHovered && !wasHovered) {
            document.body.style.cursor = 'pointer';
        } else if (!this.isHovered && wasHovered) {
            document.body.style.cursor = 'default';
        }
    }
    
    /**
     * Handle mouse down
     */
    handleMouseDown(mouseX, mouseY) {
        if (this.isPointInside(mouseX, mouseY)) {
            this.isPressed = true;
            return true; // Event handled
        }
        return false;
    }
    
    /**
     * Handle mouse up
     */
    handleMouseUp(mouseX, mouseY) {
        if (this.isPressed) {
            this.isPressed = false;
            
            if (this.isPointInside(mouseX, mouseY)) {
                this.onClick();
            }
            return true; // Event handled
        }
        return false;
    }
    
    /**
     * Update animation
     */
    update() {
        this.pulseTime += 0.05;
    }
    
    /**
     * Render button
     */
    render(ctx) {
        const pos = this.getPosition();
        
        // Calculate current scale
        let scale = 1;
        if (this.isPressed) {
            scale = this.pressScale;
        } else if (this.isHovered) {
            scale = this.hoverScale;
        }
        
        // Add pulse effect
        const pulse = 1 + Math.sin(this.pulseTime) * 0.1;
        scale *= pulse;
        
        const finalRadius = this.radius * scale;
        
        // Draw shadow
        ctx.save();
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        
        // Draw button background
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, finalRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw button border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw text
        ctx.fillStyle = this.textColor;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, pos.x, pos.y);
        
        ctx.restore();
    }
    
    /**
     * Show/hide button
     */
    show() { this.isVisible = true; }
    hide() { this.isVisible = false; }
}

// Create global canvas UI instance
window.canvasUI = new CanvasUI();
window.BoomButton = BoomButton;

console.log('🎨 Canvas UI System ready');