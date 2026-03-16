import type { Graphics } from './core/graphics';
import type { Audio } from './core/audio';
import type { Input } from './core/input';
import type { Timer } from './core/timer';
import type { Keyboard } from './core/keyboard';
import type { Mouse } from './core/mouse';
import type { Gamepad } from './core/gamepad';
import type { Like2DEvent, EventType } from './core/events';
import type { CanvasMode, PartialCanvasMode } from './core/canvas-config';
import { CanvasManager } from './core/canvas-manager';

export type EngineDeps = {
  graphics: Graphics;
  input: Input;
  timer: Timer;
  audio: Audio;
  keyboard: Keyboard;
  mouse: Mouse;
  gamepad: Gamepad;
};

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private deps: EngineDeps | null = null;
  private isRunning = false;
  private lastTime = 0;
  private container: HTMLElement;
  private canvasManager: CanvasManager;
  private onEvent: ((event: Like2DEvent) => void) | null = null;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.display = 'block';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;

    this.container = container;
    this.container.appendChild(this.canvas);
    this.canvasManager = new CanvasManager(this.canvas, this.container, this.ctx, { pixelResolution: null, fullscreen: false });

    // Internal listener to forward to onEvent
    this.canvasManager.onResize = (size, pixelSize, fullscreen) => {
      this.dispatchEvent('resize', [size, pixelSize, fullscreen]);
    };

    // Listen for fullscreen changes to update mode
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
  }

  private handleFullscreenChange(): void {
    const mode = this.canvasManager.getMode();
    const isFullscreen = !!document.fullscreenElement;
    if (mode.fullscreen !== isFullscreen) {
      this.canvasManager.setMode({ ...mode, fullscreen: isFullscreen });
    }
  }

  setMode(mode: PartialCanvasMode): void {
    const currentMode = this.canvasManager.getMode();
    const mergedMode = { ...currentMode, ...mode };
    const needsFullscreenChange = mode.fullscreen !== undefined && mode.fullscreen !== currentMode.fullscreen;
    
    if (needsFullscreenChange) {
      if (mergedMode.fullscreen) {
        this.container.requestFullscreen().catch(console.error);
      } else {
        document.exitFullscreen();
      }
    }
    
    this.canvasManager.setMode(mode);
  }

  getMode(): CanvasMode {
    return this.canvasManager.getMode();
  }

  setDeps(deps: EngineDeps): void {
    this.deps = deps;
  }

  dispose(): void {
    this.isRunning = false;
    this.deps?.keyboard.dispose();
    this.deps?.mouse.dispose();
    this.deps?.gamepad.dispose();
    this.canvasManager.dispose();
    if (this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
  }

  private dispatchEvent<T extends EventType>(type: T, args: any): void {
    if (this.onEvent) {
      this.onEvent({ type, args, timestamp: performance.now() } as Like2DEvent);
    }
  }

  start(onEvent: (event: Like2DEvent) => void) {
    if (!this.deps) throw new Error('Engine dependencies not set. Call setDeps() before start().');

    this.onEvent = onEvent;
    this.isRunning = true;
    this.lastTime = performance.now();

    // Listeners for raw input
    this.deps.keyboard.onKeyEvent = (scancode, keycode, type) => {
      this.dispatchEvent(type === 'keydown' ? 'keypressed' : 'keyreleased', [scancode, keycode]);
    };

    this.deps.mouse.onMouseEvent = (clientX, clientY, button, type) => {
      const [x, y] = this.transformMousePosition(clientX, clientY);
      const b = (button ?? 0) + 1;
      this.dispatchEvent(type === 'mousedown' ? 'mousepressed' : 'mousereleased', [x, y, b]);
    };

    this.deps.gamepad.onButtonEvent = (gpIndex, buttonIndex, buttonName, pressed) => {
      this.dispatchEvent(pressed ? 'gamepadpressed' : 'gamepadreleased', [gpIndex, buttonIndex, buttonName]);
    };

    const loop = () => {
      if (!this.isRunning) return;

      const currentTime = performance.now();
      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (!this.deps!.timer.isSleeping()) {
        this.deps!.timer.update(dt);
        const inputEvents = this.deps!.input.update();
        inputEvents.pressed.forEach(action => this.dispatchEvent('actionpressed', [action]));
        inputEvents.released.forEach(action => this.dispatchEvent('actionreleased', [action]));
        this.dispatchEvent('update', [dt]);
      }

      this.deps!.graphics.clear();
      this.dispatchEvent('draw', [this.canvas]);
      this.canvasManager.present();
      requestAnimationFrame(loop);
    };

    this.dispatchEvent('load', []);
    requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getTime(): number {
    return this.deps?.timer.getTime() ?? 0;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  transformMousePosition(cssX: number, cssY: number): [number, number] {
    return this.canvasManager.transformMousePosition(cssX, cssY);
  }

}
