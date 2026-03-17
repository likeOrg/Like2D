export class Mouse {
    constructor(transformFn) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "buttons", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "onMouseEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "transformFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Event handler references for cleanup
        Object.defineProperty(this, "mousemoveHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mousedownHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mouseupHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "blurHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.transformFn = transformFn;
        // Bind event handlers
        this.mousemoveHandler = this.handleMouseMove.bind(this);
        this.mousedownHandler = this.handleMouseDown.bind(this);
        this.mouseupHandler = this.handleMouseUp.bind(this);
        this.blurHandler = this.handleBlur.bind(this);
        // Register event listeners
        window.addEventListener('mousemove', this.mousemoveHandler);
        window.addEventListener('mousedown', this.mousedownHandler);
        window.addEventListener('mouseup', this.mouseupHandler);
        window.addEventListener('blur', this.blurHandler);
    }
    setTransform(transformFn) {
        this.transformFn = transformFn;
    }
    handleMouseMove(e) {
        // Store raw CSS coordinates - transformation to game coordinates
        // should be done by the consumer using engine.transformMousePosition()
        this.x = e.clientX;
        this.y = e.clientY;
        this.onMouseEvent?.(e.clientX, e.clientY, undefined, 'mousemove');
    }
    handleMouseDown(e) {
        this.buttons.add(e.button + 1);
        this.onMouseEvent?.(e.clientX, e.clientY, e.button, 'mousedown');
    }
    handleMouseUp(e) {
        this.buttons.delete(e.button + 1);
        this.onMouseEvent?.(e.clientX, e.clientY, e.button, 'mouseup');
    }
    handleBlur() {
        this.buttons.clear();
    }
    dispose() {
        window.removeEventListener('mousemove', this.mousemoveHandler);
        window.removeEventListener('mousedown', this.mousedownHandler);
        window.removeEventListener('mouseup', this.mouseupHandler);
        window.removeEventListener('blur', this.blurHandler);
        this.buttons.clear();
    }
    getPosition() {
        if (this.transformFn) {
            return this.transformFn(this.x, this.y);
        }
        return [this.x, this.y];
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    isDown(button) {
        return this.buttons.has(button);
    }
    getPressedButtons() {
        return new Set(this.buttons);
    }
    isVisible() {
        return document.pointerLockElement === null;
    }
    setVisible(visible, canvas) {
        if (!visible && canvas) {
            canvas.requestPointerLock();
        }
        else if (visible && canvas && document.pointerLockElement === canvas) {
            document.exitPointerLock();
        }
    }
    getRelativeMode() {
        return document.pointerLockElement !== null;
    }
}
