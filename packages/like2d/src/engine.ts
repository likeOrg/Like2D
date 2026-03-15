import type { Graphics } from './core/graphics';
import type { Audio } from './core/audio';
import type { Input } from './core/input';
import type { Timer } from './core/timer';
import type { Keyboard } from './core/keyboard';
import type { Mouse } from './core/mouse';
import type { Gamepad } from './core/gamepad';
import type { Event } from './core/events';

export type EngineDeps = {
  graphics: Graphics;
  input: Input;
  timer: Timer;
  audio: Audio;
  keyboard: Keyboard;
  mouse: Mouse;
  gamepad: Gamepad;
};

export type EventCallback = (event: Event) => void;

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private deps: EngineDeps | null = null;
  private isRunning = false;
  private lastTime = 0;
  private eventCallbacks: EventCallback[] = [];
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.display = 'block';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    this.container = container;
    this.container.appendChild(this.canvas);
  }

  setDeps(deps: EngineDeps): void {
    this.deps = deps;
  }

  dispose(): void {
    this.isRunning = false;

    // Dispose all input modules to remove their listeners
    if (this.deps) {
      this.deps.keyboard.dispose();
      this.deps.mouse.dispose();
      this.deps.gamepad.dispose();
    }

    this.eventCallbacks = [];

    if (this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
  }

  onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.push(callback);
    return () => {
      const idx = this.eventCallbacks.indexOf(callback);
      if (idx !== -1) this.eventCallbacks.splice(idx, 1);
    };
  }

  emit(event: Omit<Event, 'timestamp'>): void {
    const timestamp = this.deps?.timer.getTime() ?? performance.now();
    const fullEvent = { ...event, timestamp } as Event;
    for (const callback of this.eventCallbacks) {
      callback(fullEvent);
    }
  }

  // Note: Browsers block audio autoplay until user interaction.
  // A startup/click-to-start screen should be shown before calling start().
  start(
    onUpdate?: (dt: number) => void,
    onDraw?: () => void,
    options: { showStartupScreen?: boolean; startupText?: string } = {}
  ) {
    const { showStartupScreen = false, startupText = 'Click to Start' } = options;

    if (!this.deps) {
      throw new Error('Engine dependencies not set. Call setDeps() before start().');
    }

    const doStart = () => {
      this.isRunning = true;
      this.lastTime = performance.now();

      const loop = () => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.deps!.timer.update(dt);

        const isSleeping = this.deps!.timer.isSleeping();

        if (!isSleeping) {
          const inputEvents = this.deps!.input.update();

          for (const action of inputEvents.pressed) {
            this.emit({ type: 'actionpressed', action });
          }
          for (const action of inputEvents.released) {
            this.emit({ type: 'actionreleased', action });
          }
          for (const event of inputEvents.gamepadPressed) {
            this.emit({
              type: 'gamepadpressed',
              gamepadIndex: event.gamepadIndex,
              buttonIndex: event.buttonIndex,
              buttonName: event.buttonName,
              rawButtonIndex: event.rawButtonIndex,
            });
          }
          for (const event of inputEvents.gamepadReleased) {
            this.emit({
              type: 'gamepadreleased',
              gamepadIndex: event.gamepadIndex,
              buttonIndex: event.buttonIndex,
              buttonName: event.buttonName,
              rawButtonIndex: event.rawButtonIndex,
            });
          }

          this.emit({ type: 'update', dt });
          if (onUpdate) onUpdate(dt);
        }

        this.deps!.graphics.clear();
        this.emit({ type: 'draw' });
        if (onDraw) onDraw();

        requestAnimationFrame(loop);
      };

      this.emit({ type: 'load' });

      requestAnimationFrame(loop);
    };

    if (showStartupScreen) {
      // Draw startup screen
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '32px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(startupText, this.canvas.width / 2, this.canvas.height / 2);

      // Wait for click to start
      const onClick = () => {
        this.canvas.removeEventListener('click', onClick);
        doStart();
      };
      this.canvas.addEventListener('click', onClick);
    } else {
      doStart();
    }
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

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }
}
