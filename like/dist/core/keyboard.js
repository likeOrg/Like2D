export class Keyboard {
    constructor() {
        Object.defineProperty(this, "pressedScancodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "onKeyEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Event handler references for cleanup
        Object.defineProperty(this, "keydownHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "keyupHandler", {
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
        // Bind event handlers
        this.keydownHandler = this.handleKeyDown.bind(this);
        this.keyupHandler = this.handleKeyUp.bind(this);
        this.blurHandler = this.handleBlur.bind(this);
        // Register event listeners
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
        window.addEventListener('blur', this.blurHandler);
    }
    handleKeyDown(e) {
        if (e.code) {
            this.pressedScancodes.add(e.code);
        }
        this.onKeyEvent?.(e.code, e.key, 'keydown');
    }
    handleKeyUp(e) {
        if (e.code) {
            this.pressedScancodes.delete(e.code);
        }
        this.onKeyEvent?.(e.code, e.key, 'keyup');
    }
    handleBlur() {
        this.pressedScancodes.clear();
    }
    dispose() {
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
        window.removeEventListener('blur', this.blurHandler);
        this.pressedScancodes.clear();
    }
    isDown(scancode) {
        return this.pressedScancodes.has(scancode);
    }
    isAnyDown(...scancodes) {
        return scancodes.some(code => this.pressedScancodes.has(code));
    }
}
