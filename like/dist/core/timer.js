export class Timer {
    constructor() {
        Object.defineProperty(this, "currentDelta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "totalTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "frameCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "fps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "fpsAccumulator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "sleepUntil", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "sceneStartTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    update(dt) {
        this.currentDelta = dt;
        this.totalTime += dt;
        this.frameCount++;
        this.fpsAccumulator += dt;
        if (this.fpsAccumulator >= 1) {
            this.fps = Math.round(this.frameCount / this.fpsAccumulator);
            this.frameCount = 0;
            this.fpsAccumulator = 0;
        }
    }
    resetSceneTime() {
        this.sceneStartTime = this.totalTime;
    }
    getDelta() {
        return this.currentDelta;
    }
    getFPS() {
        return this.fps;
    }
    getTime() {
        return this.totalTime;
    }
    getSceneTime() {
        return this.totalTime - this.sceneStartTime;
    }
    isSleeping() {
        if (this.sleepUntil === null)
            return false;
        const currentTime = performance.now();
        if (currentTime < this.sleepUntil) {
            return true;
        }
        this.sleepUntil = null;
        return false;
    }
    sleep(duration) {
        this.sleepUntil = performance.now() + (duration * 1000);
    }
}
