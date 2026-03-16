import type { Graphics } from './core/graphics';
import type { Audio } from './core/audio';
import type { Input } from './core/input';
import type { Timer } from './core/timer';
import type { Keyboard, KeyEvent } from './core/keyboard';
import type { Mouse, MouseEvent } from './core/mouse';
import type { Gamepad } from './core/gamepad';
import type { Event, EventName, EventMap } from './core/events';
import type { CanvasConfig } from './core/canvas-config';
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

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.display = 'block';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;

    this.container = container;
    this.container.appendChild(this.canvas);
    this.canvasManager = new CanvasManager(this.canvas, this.container, this.ctx, { mode: 'native' });
  }

  setScaling(config: CanvasConfig): void {
    this.canvasManager.setConfig(config);
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

  private dispatchEvent<T extends EventName>(type: T, data: Omit<EventMap[T], 'type' | 'timestamp'>): void {
    const timestamp = this.deps?.timer.getTime() ?? performance.now();
    this.canvas.dispatchEvent(new CustomEvent(type, { 
      detail: { type, ...data, timestamp } as Event 
    }));
  }

  start(onUpdate?: (dt: number) => void, onDraw?: () => void) {
    if (!this.deps) throw new Error('Engine dependencies not set. Call setDeps() before start().');

    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = () => {
      if (!this.isRunning) return;

      const currentTime = performance.now();
      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      this.deps!.timer.update(dt);

      if (!this.deps!.timer.isSleeping()) {
        const inputEvents = this.deps!.input.update();
        inputEvents.pressed.forEach(action => this.dispatchEvent('like2d:actionpressed', { action }));
        inputEvents.released.forEach(action => this.dispatchEvent('like2d:actionreleased', { action }));
        this.dispatchEvent('like2d:update', { dt });
        onUpdate?.(dt);
      }

      this.deps!.graphics.clear();
      this.dispatchEvent('like2d:draw', {});
      onDraw?.();
      this.canvasManager.present();
      requestAnimationFrame(loop);
    };

    this.dispatchEvent('like2d:load', {});
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

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  }

  onKey(callbacks: {
    onKeyPressed?: (scancode: string, keycode: string) => void;
    onKeyReleased?: (scancode: string, keycode: string) => void;
  }): (event: KeyEvent) => void {
    return (event: KeyEvent) => {
      if (event.type === 'keydown') callbacks.onKeyPressed?.(event.scancode, event.keycode);
      else callbacks.onKeyReleased?.(event.scancode, event.keycode);
    };
  }

  onMouse(callbacks: {
    onMousePressed?: (x: number, y: number, button: number) => void;
    onMouseReleased?: (x: number, y: number, button: number) => void;
  }): (event: MouseEvent) => void {
    return (event: MouseEvent) => {
      const [x, y] = this.transformMousePosition(event.clientX, event.clientY);
      if (event.type === 'mousedown') callbacks.onMousePressed?.(x, y, (event.button ?? 0) + 1);
      else if (event.type === 'mouseup') callbacks.onMouseReleased?.(x, y, (event.button ?? 0) + 1);
    };
  }

  onGamepad(callbacks: {
    onGamepadPressed?: (i: number, b: number, n: string) => void;
    onGamepadReleased?: (i: number, b: number, n: string) => void;
  }): {
    onButtonPressed: (i: number, b: number, n: string) => void;
    onButtonReleased: (i: number, b: number, n: string) => void;
  } {
    return {
      onButtonPressed: (i, b, n) => callbacks.onGamepadPressed?.(i, b, n),
      onButtonReleased: (i, b, n) => callbacks.onGamepadReleased?.(i, b, n)
    };
  }
}
