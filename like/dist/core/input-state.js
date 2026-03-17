export class InputStateTracker {
    constructor() {
        Object.defineProperty(this, "prevState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "currState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
    }
    update(pressedKeys) {
        const justPressed = [];
        const justReleased = [];
        const nextState = new Set(pressedKeys);
        for (const key of nextState) {
            if (!this.currState.has(key)) {
                justPressed.push(key);
            }
        }
        for (const key of this.currState) {
            if (!nextState.has(key)) {
                justReleased.push(key);
            }
        }
        this.prevState = new Set(this.currState);
        this.currState = nextState;
        return { justPressed, justReleased };
    }
    isDown(key) {
        return this.currState.has(key);
    }
    justPressed(key) {
        return !this.prevState.has(key) && this.currState.has(key);
    }
    justReleased(key) {
        return this.prevState.has(key) && !this.currState.has(key);
    }
    getCurrentState() {
        return new Set(this.currState);
    }
    clear() {
        this.prevState.clear();
        this.currState.clear();
    }
}
