import { Audio } from './core/audio';
import { Input } from './core/input';
import { Timer } from './core/timer';
import { Keyboard } from './core/keyboard';
import { Mouse } from './core/mouse';
import { Gamepad } from './core/gamepad';
import { newState, bindGraphics } from './core/graphics';
import type { Like2DEvent, EventType } from './core/events';
import type { PartialCanvasMode } from './core/canvas-config';
import type { Like } from './core/like';
import type { Scene } from './scene';
import { CanvasManager } from './core/canvas-manager';

export class Engine {
  private canvas: HTMLCanvasElement;
  private isRunning = false;
  private lastTime = 0;
  private container: HTMLElement;
  private canvasManager: CanvasManager;
  private handleEvent: ((event: Like2DEvent) => void) | null = null;
  private currentScene: Scene | null = null;
  private gfxState: ReturnType<typeof newState>;

  // Event handler references for cleanup
  private windowFocusHandler: (() => void) | null = null;
  private windowBlurHandler: (() => void) | null = null;
  private canvasFocusHandler: (() => void) | null = null;
  private canvasBlurHandler: (() => void) | null = null;
  private fullscreenChangeHandler: (() => void) | null = null;

  readonly like: Like;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.display = 'block';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    this.container = container;
    this.container.appendChild(this.canvas);
    this.canvasManager = new CanvasManager(this.canvas, this.container, ctx, { pixelResolution: null, fullscreen: false });

    const renderTarget = this.canvasManager.getRenderTarget();
    this.gfxState = newState(renderTarget.ctx);
    let gfx = bindGraphics(this.gfxState);

    const audio = new Audio();
    const timer = new Timer();
    const keyboard = new Keyboard();
    const mouse = new Mouse(this.canvas, (cssX, cssY) => this.canvasManager.transformMousePosition(cssX, cssY));
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

    this.canvasManager.onResize = () => {
      const target = this.canvasManager.getRenderTarget();
      this.gfxState = newState(target.ctx);
      this.like.gfx = bindGraphics(this.gfxState);
    };

    keyboard.onKeyEvent = (scancode, keycode, type) => {
      this.dispatch(type === 'keydown' ? 'keypressed' : 'keyreleased', [scancode, keycode]);
    };

    mouse.onMouseEvent = (x, y, button, type) => {
      this.dispatch(type === 'mousedown' ? 'mousepressed' : 'mousereleased', [x, y, (button ?? 0) + 1]);
    };

    gamepad.onButtonEvent = (gpIndex, buttonIndex, buttonName, pressed) => {
      this.dispatch(pressed ? 'gamepadpressed' : 'gamepadreleased', [gpIndex, buttonIndex, buttonName]);
    };

    this.windowFocusHandler = () => this.dispatch('focus', []);
    this.windowBlurHandler = () => this.dispatch('blur', []);
    this.canvasFocusHandler = () => this.dispatch('focus', []);
    this.canvasBlurHandler = () => this.dispatch('blur', []);
    this.fullscreenChangeHandler = () => {
      const mode = this.canvasManager.getMode();
      const isFullscreen = !!document.fullscreenElement;
      if (mode.fullscreen !== isFullscreen) {
        this.canvasManager.setMode({ ...mode, fullscreen: isFullscreen });
      }
    };

    window.addEventListener('focus', this.windowFocusHandler);
    window.addEventListener('blur', this.windowBlurHandler);
    this.canvas.addEventListener('focus', this.canvasFocusHandler);
    this.canvas.addEventListener('blur', this.canvasBlurHandler);
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  private dispatch<T extends EventType>(type: T, args: any[]): void {
    if (!this.handleEvent) return;
    
    const event = { type, args, timestamp: performance.now() } as Like2DEvent;
    
    if (this.currentScene) {
      this.currentScene.handleEvent?.(this.like, event);
      const method = this.currentScene[event.type as keyof Scene] as Function | undefined;
      method?.call(this.currentScene, this.like, ...args);
    } else {
      this.handleEvent(event);
    }
  }

  setMode(mode: PartialCanvasMode): void {
    const currentMode = this.canvasManager.getMode();
    
    if ('fullscreen' in mode && mode.fullscreen !== currentMode.fullscreen) {
      mode.fullscreen ? this.container.requestFullscreen().catch(console.error) : document.exitFullscreen();
    }

    this.canvasManager.setMode({ ...currentMode, ...mode });
  }

  async start(handleEvent: (event: Like2DEvent) => void): Promise<void> {
    this.handleEvent = handleEvent;
    this.isRunning = true;
    this.lastTime = performance.now();

    await this.like.gamepad.init();

    const loop = () => {
      if (!this.isRunning) return;

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

  dispose(): void {
    this.isRunning = false;
    this.like.keyboard.dispose();
    this.like.mouse.dispose();
    this.like.gamepad.dispose();
    this.canvasManager.dispose();
    
    if (this.windowFocusHandler) window.removeEventListener('focus', this.windowFocusHandler);
    if (this.windowBlurHandler) window.removeEventListener('blur', this.windowBlurHandler);
    if (this.canvasFocusHandler) this.canvas.removeEventListener('focus', this.canvasFocusHandler);
    if (this.canvasBlurHandler) this.canvas.removeEventListener('blur', this.canvasBlurHandler);
    if (this.fullscreenChangeHandler) document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);

    if (this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
  }
}
