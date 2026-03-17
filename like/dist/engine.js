import { Audio } from './core/audio';
import { Input } from './core/input';
import { Timer } from './core/timer';
import { Keyboard } from './core/keyboard';
import { Mouse } from './core/mouse';
import { Gamepad } from './core/gamepad';
import { newState, bindGraphics } from './core/graphics';
import { CanvasManager } from './core/canvas-manager';
export class Engine {
    constructor(container) {
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ctx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isRunning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lastTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "canvasManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "handleEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "currentScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "like", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.canvas = document.createElement('canvas');
        this.canvas.style.border = '1px solid #ccc';
        this.canvas.style.display = 'block';
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            throw new Error('Failed to get 2D context');
        this.ctx = ctx;
        this.container = container;
        this.container.appendChild(this.canvas);
        this.canvasManager = new CanvasManager(this.canvas, this.container, this.ctx, { pixelResolution: null, fullscreen: false });
        const gfxState = newState(this.ctx);
        const gfx = bindGraphics(gfxState);
        const audio = new Audio();
        const timer = new Timer();
        const keyboard = new Keyboard();
        const mouse = new Mouse((cssX, cssY) => this.canvasManager.transformMousePosition(cssX, cssY));
        const gamepad = new Gamepad();
        const input = new Input({ keyboard, mouse, gamepad });
        this.like = {
            audio,
            timer,
            input,
            keyboard,
            mouse,
            gamepad,
            gfx,
            setMode: (m) => this.setMode(m),
            getMode: () => this.canvasManager.getMode(),
            getCanvasSize: () => [this.canvas.width, this.canvas.height],
            setScene: (scene) => {
                this.currentScene = scene;
                scene?.load?.(this.like);
            },
        };
        keyboard.onKeyEvent = (scancode, keycode, type) => {
            this.dispatch(type === 'keydown' ? 'keypressed' : 'keyreleased', [scancode, keycode]);
        };
        mouse.onMouseEvent = (clientX, clientY, button, type) => {
            const [x, y] = this.canvasManager.transformMousePosition(clientX, clientY);
            this.dispatch(type === 'mousedown' ? 'mousepressed' : 'mousereleased', [x, y, (button ?? 0) + 1]);
        };
        gamepad.onButtonEvent = (gpIndex, buttonIndex, buttonName, pressed) => {
            this.dispatch(pressed ? 'gamepadpressed' : 'gamepadreleased', [gpIndex, buttonIndex, buttonName]);
        };
        this.canvasManager.onResize = (size, pixelSize, fullscreen) => {
            this.dispatch('resize', [size, pixelSize, fullscreen]);
        };
        document.addEventListener('fullscreenchange', () => {
            const mode = this.canvasManager.getMode();
            const isFullscreen = !!document.fullscreenElement;
            if (mode.fullscreen !== isFullscreen) {
                this.canvasManager.setMode({ ...mode, fullscreen: isFullscreen });
            }
        });
    }
    dispatch(type, args) {
        if (!this.handleEvent)
            return;
        const event = { type, args, timestamp: performance.now() };
        if (this.currentScene) {
            this.currentScene.handleEvent?.(this.like, event);
            const method = this.currentScene[event.type];
            method?.call(this.currentScene, this.like, ...args);
        }
        else {
            this.handleEvent(event);
        }
    }
    setMode(mode) {
        const currentMode = this.canvasManager.getMode();
        const mergedMode = { ...currentMode, ...mode };
        if (mode.fullscreen !== undefined && mode.fullscreen !== currentMode.fullscreen) {
            mergedMode.fullscreen ? this.container.requestFullscreen().catch(console.error) : document.exitFullscreen();
        }
        this.canvasManager.setMode(mode);
    }
    async start(handleEvent) {
        this.handleEvent = handleEvent;
        this.isRunning = true;
        this.lastTime = performance.now();
        await this.like.gamepad.init();
        const loop = () => {
            if (!this.isRunning)
                return;
            const now = performance.now();
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;
            if (!this.like.timer.isSleeping()) {
                this.like.timer.update(dt);
                const { pressed, released } = this.like.input.update();
                pressed.forEach(action => this.dispatch('actionpressed', [action]));
                released.forEach(action => this.dispatch('actionreleased', [action]));
                this.dispatch('update', [dt]);
            }
            this.dispatch('draw', []);
            this.canvasManager.present();
            requestAnimationFrame(loop);
        };
        this.dispatch('load', []);
        requestAnimationFrame(loop);
    }
    dispose() {
        this.isRunning = false;
        this.like.keyboard.dispose();
        this.like.mouse.dispose();
        this.like.gamepad.dispose();
        this.canvasManager.dispose();
        if (this.canvas.parentNode === this.container) {
            this.container.removeChild(this.canvas);
        }
    }
}
