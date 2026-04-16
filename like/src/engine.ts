import { Audio } from './audio/audio';
import { Input } from './input/input';
import { Timer } from './timer/timer';
import { Keyboard } from './input/keyboard';
import { Mouse } from './input/mouse';
import { Gamepad } from './input/gamepad';
import { Graphics } from './graphics/graphics';
import type { LikeEvent, LikeEventHandlers, Dispatcher, LikeCanvasElement } from './events';
import { LikeHandlers, type Like } from './like';
import { Canvas } from './graphics/canvas';

/** @private */
export type EngineDispatcher = Dispatcher<keyof LikeEventHandlers>;
/** @private */
export type EngineProps<K extends keyof LikeEventHandlers> = {
  canvas: LikeCanvasElement,
  abort: AbortSignal,
  dispatch: Dispatcher<K>,
}

/** @private */
export class Engine {
  /** The canvas on which we bind all events. Not always the same canvas
   * that we render to. */
  private canvas: LikeCanvasElement;
  private isRunning = false;
  private lastTime = 0;
  private abort = new AbortController();

  /**
   * The Like interface providing access to all engine subsystems.
   */
  readonly like: Like;

  constructor(private container: HTMLElement) {
    this.canvas = document.createElement('canvas') as LikeCanvasElement;
    const canvas = new Canvas(this.canvas, this.dispatch.bind(this) as any, this.abort.signal);

    this.container.appendChild(this.canvas);

    const props: EngineProps<keyof LikeEventHandlers> = {
      canvas: this.canvas,
      dispatch: this.dispatch.bind(this),
      abort: this.abort.signal,
    }
    
    const gfx =  new Graphics(canvas.getContext());
    const audio = new Audio();
    const timer = new Timer(props);
    const keyboard = new Keyboard(props);
    const mouse = new Mouse(props);
    const gamepad = new Gamepad(props);
    const input = new Input(props, { keyboard, mouse, gamepad });

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
    };

    window.addEventListener('focus', () => this.dispatch('focus', ['tab']));
    window.addEventListener('blur', () => this.dispatch('blur', ['tab']));
    this.canvas.addEventListener('focus', () => this.dispatch('focus', ['canvas']));
  }

  private dispatch<K extends keyof LikeEventHandlers>(
    type: K,
    args: Parameters<LikeEventHandlers[K]>): void
  {
    const event = { type, args } as LikeEvent;
    likeDispatch(this.like, event);
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

      this.canvas.dispatchEvent(
        new CustomEvent("like:update", { detail: { dt } }),
      );
      this.dispatch('update', [dt]);

      this.canvas.dispatchEvent(new CustomEvent<{}>("like:preDraw"));
      this.dispatch('draw', []);
      this.canvas.dispatchEvent(new CustomEvent<{}>("like:postDraw"));
      requestAnimationFrame(loop);
    };

    this.dispatch('load', []);
    requestAnimationFrame(loop);
  }

  /**
   * Clean up all resources and stop the engine.
   */
  dispose(): void {
    this.dispatch('quit', []);
    this.isRunning = false;
    this.abort.abort();
  }
}

/**
 * What calls the root `like` object -- first it tries calling {@link LikeHandlers.handleEvent}
 * and if that doesn't exist, calls {@link callOwnHandlers}.
 *
 * Don't call this from within a handler object's own `handleEvent` unless you like stack overflows.
 *
 * Good for manually composing event handling objects, for example
 * to create your own scene system.
 *
 * If you find yourself using this, look into the [scene plugin.](https://npmjs.com/package/@like2d/like-scene)
 */
export function likeDispatch(obj: LikeHandlers, event: LikeEvent) {
  if (obj.handleEvent) {
    obj.handleEvent(event);
  } else {
    callOwnHandlers(obj, event);
  }
}

/**
 * Call event handlers from an event. For example, an event with `.type = update, .args = [dt]`
 * translates to calling `obj.draw(dt)`.
 *
 * Typically used at the end of a custom {@link LikeHandlers.handleEvent | handleEvent}.
 */
export function callOwnHandlers(obj: LikeHandlers, event: LikeEvent) {
  if (event.type in obj)
    (obj as any)[event.type](...event.args)
}
