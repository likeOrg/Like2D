/**
 * @module engine
 * @description Core game engine - lifecycle management and event dispatch.
 *
 * You've reached the most evil part of the codebase -- the man
 * behind the curtain.
 * 
 * The secret force gluing everything together.
 * 
 * If you want to use modules independently, look here first.
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

import { AudioInternal } from './core/audio';
import { InputInternal } from './core/input';
import { TimerInternal } from './core/timer';
import { KeyboardInternal } from './core/keyboard';
import { MouseInternal } from './core/mouse';
import { GamepadInternal } from './core/gamepad';
import { bindGraphics } from './core/graphics';
import type { LikeEvent, EventType, EventMap } from './core/events';
import type { LikeInternal } from './core/like';
import { CanvasInternal } from './core/canvas';
import { Scene, sceneDispatch } from './scene';

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

  private abort = new AbortController();

  /**
   * The Like interface providing access to all engine subsystems.
   * This object is passed to all scene callbacks and game code.
   */
  readonly like: LikeInternal;

  constructor(private container: HTMLElement) {
    this.canvas = new CanvasInternal(this.dispatch.bind(this));
    const canvas = this.canvas._displayCanvas;
    canvas.addEventListener("like:updateRenderTarget", (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      this.like.gfx = bindGraphics(event.detail.target.getContext('2d')!);
    });

    this.container.appendChild(canvas);

    let gfx = bindGraphics(canvas.getContext('2d')!);

    const dispatch = this.dispatch.bind(this);
    const audio = new AudioInternal();
    const timer = new TimerInternal();
    const keyboard = new KeyboardInternal(canvas, dispatch);
    const mouse = new MouseInternal(canvas, dispatch);
    const gamepad = new GamepadInternal(dispatch);
    const input = new InputInternal({ keyboard, mouse, gamepad }, dispatch);

    this.like = {
      audio,
      timer,
      input,
      keyboard,
      mouse,
      gamepad,
      gfx,
      canvas: this.canvas,
      start: this.start.bind(this),
      dispose: this.dispose.bind(this),
      setScene: (scene?: Scene) => {
        if (scene) {
          this.like.handleEvent = (event) => sceneDispatch(scene, this.like, event);
          this.dispatch("load", []);
        } else {
          this.like.handleEvent = undefined;
        }
      },
      callOwnHandlers: (event: LikeEvent) => {
        if (event.type in this.like)
          (this.like as any)[event.type](...event.args)
      }
    };

    window.addEventListener('focus', () => this.dispatch('focus', ['tab']));
    window.addEventListener('blur', () => this.dispatch('blur', ['tab']));
    canvas.addEventListener('focus', () => this.dispatch('focus', ['canvas']));
    canvas.addEventListener('focus', () => this.dispatch('focus', ['canvas']));
  }

  private dispatch<K extends EventType>(type: K, args: EventMap[K]): void {
    const event = { type, args, timestamp: this.like.timer.getTime() } as LikeEvent;
    if (this.like.handleEvent) {
      this.like.handleEvent(event);
    } else {
      this.like.callOwnHandlers(event);
    }
  }

  /**
   * Start the game loop.
   *
   * @remarks
   * This method:
   * 1. Dispatches the initial `load` event
   * 2. Starts the requestAnimationFrame loop
   *
   * The engine runs until dispose() is called.
   */
  async start(): Promise<void> {
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = () => {
      if (!this.isRunning) return;

      const now = performance.now();
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      if (!this.like.timer.isSleeping()) {
        this.like.timer._update(dt);
        this.like.input._update();
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
    this.like.keyboard._dispose();
    this.like.mouse._dispose();
    this.like.gamepad._dispose();
    this.canvas._dispose();
    this.abort.abort();

    if (canvas.parentNode === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
