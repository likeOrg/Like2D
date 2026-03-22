/**
 * @module engine
 * @description Core game engine - lifecycle management and event dispatch.
 *
 * ## Architecture
 *
 * The engine shouldn't exist, but it does.
 * It's our duct tape file.
 * It will get progressively simpler until it doesn't need to exist
 *
 * ## Memory Management
 *
 * Always call `dispose()` when destroying an engine instance:
 * - Removes all event listeners
 * - Stops the game loop
 * - Removes canvas from DOM
 * - Cleans up canvas manager resources
 *
 */

import { Audio } from './core/audio';
import { Input } from './core/input';
import { Timer } from './core/timer';
import { Keyboard } from './core/keyboard';
import { Mouse } from './core/mouse';
import { LikeGamepad } from './core/gamepad';
import { bindGraphics } from './core/graphics';
import type { Like2DEvent, EventType, EventMap } from './core/events';
import type { Like } from './core/like';
import { sceneDispatch, type Scene } from './scene';
import { CanvasInternal } from './core/canvas';

export type EngineDispatch = Engine["dispatch"];

/**
 * Core game engine managing the event loop and subsystems.
 *
 * Normally you don't instantiate this directly - use {@link createLike} instead.
 * The Engine class is exposed for advanced use cases like testing or
 * custom initialization sequences.
 *
 * All subsystems are accessible via the {@link like} property.
 */
export class Engine {
  private canvas: CanvasInternal;
  private isRunning = false;
  private lastTime = 0;
  private container: HTMLElement;
  private handleEvent: ((event: Like2DEvent) => void) | null = null;
  private currentScene?: Scene;

  // Event handler references for cleanup
  private abort = new AbortController();

  /**
   * The Like interface providing access to all engine subsystems.
   * This object is passed to all scene callbacks and game code.
   */
  readonly like: Like;

  constructor(container: HTMLElement) {
    this.canvas = new CanvasInternal(this.dispatch.bind(this));
    const canvas = this.canvas._displayCanvas;
    canvas.addEventListener("like:updateRenderTarget", (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      this.like.gfx = bindGraphics(event.detail.target.getContext('2d')!);
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    this.container = container;
    this.container.appendChild(canvas);

    let gfx = bindGraphics(canvas.getContext('2d')!);

    const dispatch = this.dispatch.bind(this);
    const audio = new Audio();
    const timer = new Timer();
    const keyboard = new Keyboard(canvas, dispatch);
    const mouse = new Mouse(canvas, dispatch);
    const gamepad = new LikeGamepad(dispatch);
    const input = new Input({ keyboard, mouse, gamepad });

    this.like = {
      audio,
      timer,
      input,
      keyboard,
      mouse,
      gamepad,
      gfx,
      canvas: this.canvas,
      setScene: (scene) => {
        this.currentScene = scene;
        scene?.load?.(this.like);
      },
    };

    window.addEventListener('focus', () => this.dispatch('focus', []));
    window.addEventListener('blur', () => this.dispatch('blur', []));
    canvas.addEventListener('focus', () => this.dispatch('focus', []));
    canvas.addEventListener('focus', () => this.dispatch('focus', []));
  }

  private dispatch<K extends EventType>(type: K, args: EventMap[K]): void {
    if (!this.handleEvent) return;
    
    const event = { type, args, timestamp: this.like.timer.getTime() } as Like2DEvent;
    
    if (this.currentScene) {
      sceneDispatch(this.currentScene, this.like, event);
    } else {
      this.handleEvent(event);
    }
  }

  /**
   * Start the game loop.
   *
   * @param handleEvent - Callback to receive events. Used internally by createLike.
   * @returns Promise that resolves when the engine is initialized
   *
   * @remarks
   * This method:
   * 1. Initializes the gamepad mapping database
   * 2. Dispatches the initial `load` event
   * 3. Starts the requestAnimationFrame loop
   *
   * The engine runs until dispose() is called.
   */
  async start(handleEvent: (event: Like2DEvent) => void): Promise<void> {
    this.handleEvent = handleEvent;
    this.isRunning = true;
    this.lastTime = performance.now();

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
      this.canvas._present();
      requestAnimationFrame(loop);
    };

    this.dispatch('load', []);
    requestAnimationFrame(loop);
  }

  /**
   * Clean up all resources and stop the engine.
   *
   * @remarks
   * This method:
   * - Stops the game loop
   * - Removes all event listeners (keyboard, mouse, window, fullscreen)
   * - Disposes canvas manager (removes resize observer)
   * - Removes the canvas element from the DOM
   *
   * The engine cannot be restarted after disposal - create a new instance.
   */
  dispose(): void {
    const canvas = this.canvas._displayCanvas;
    this.isRunning = false;
    this.like.keyboard.dispose();
    this.like.mouse.dispose();
    this.like.gamepad._dispose();
    this.canvas._dispose();
    this.abort.abort();

    if (canvas.parentNode === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
