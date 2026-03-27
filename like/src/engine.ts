/**
 * @module engine
 * @description Core game engine - lifecycle management and event dispatch.
 */

import { Audio } from './audio/audio';
import { Input } from './input/input';
import { Timer } from './timer/timer';
import { Keyboard } from './input/keyboard';
import { Mouse } from './input/mouse';
import { Gamepad } from './input/gamepad';
import { bindGraphics } from './graphics/index';
import type { LikeEvent, EventType, EventMap, Dispatcher } from './events';
import type { Like } from './like';
import { Canvas } from './graphics/canvas';
import { Scene, sceneDispatch } from './scene';

export type EngineDispatcher = Dispatcher<EventType>;
export type EngineProps<T extends keyof EventMap> = {
  canvas: HTMLCanvasElement,
  abort: AbortSignal,
  dispatch: Dispatcher<T>,
}

/**
 * @private
 * Core game engine managing the event loop and subsystems.
 */
export class Engine {
  /** The canvas on which we bind all events. Not always the same canvas
   * that we render to. */
  private canvas: HTMLCanvasElement;
  private isRunning = false;
  private lastTime = 0;
  private abort = new AbortController();

  /**
   * The Like interface providing access to all engine subsystems.
   */
  readonly like: Like;

  constructor(private container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    const canvas = new Canvas(this.canvas, this.dispatch.bind(this) as any, this.abort.signal);
    this.canvas.addEventListener("like:updateRenderTarget", (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      this.like.gfx = bindGraphics(event.detail.target.getContext('2d')!);
    });

    this.container.appendChild(this.canvas);

    let gfx = bindGraphics(this.canvas.getContext('2d')!);

    const props: EngineProps<keyof EventMap> = {
      canvas: this.canvas,
      dispatch: this.dispatch.bind(this),
      abort: this.abort.signal,
    }

    const audio = new Audio();
    const timer = new Timer(props);
    const keyboard = new Keyboard(props);
    const mouse = new Mouse(props);
    const gamepad = new Gamepad(props);
    const input = new Input(props.dispatch, { keyboard, mouse, gamepad });

    this.like = {
      audio,
      timer,
      input,
      keyboard,
      mouse,
      gamepad,
      gfx,
      canvas,
      start: this.start.bind(this),
      dispose: this.dispose.bind(this),
      setScene: (scene?: Scene) => {
        if (scene) {
          this.like.handleEvent = (event) => sceneDispatch(scene, this.like, event);
          if (this.isRunning) this.dispatch("load", []);
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
    this.canvas.addEventListener('focus', () => this.dispatch('focus', ['canvas']));
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
        this.canvas.dispatchEvent(
          new CustomEvent("update", { detail: { dt } }),
        );
        this.dispatch('update', [dt]);
      }

      this.canvas.dispatchEvent(new CustomEvent("like:preDraw"));
      this.dispatch('draw', []);
      this.canvas.dispatchEvent(new CustomEvent("like:postDraw"));
      requestAnimationFrame(loop);
    };

    this.dispatch('load', []);
    requestAnimationFrame(loop);
  }

  /**
   * Clean up all resources and stop the engine.
   */
  dispose(): void {
    this.isRunning = false;
    this.abort.abort();
  }
}
