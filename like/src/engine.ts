import { Audio } from './audio/audio';
import { Input } from './input/input';
import { Timer } from './timer/timer';
import { Keyboard } from './input/keyboard';
import { Mouse } from './input/mouse';
import { Gamepad } from './input/gamepad';
import { Graphics } from './graphics/graphics';
import type { LikeEvent, EventType, EventMap, Dispatcher, LikeCanvasElement } from './events';
import { type Like, LikeEventHandlers } from './like';
import { Canvas } from './graphics/canvas';

/** @private */
export type EngineDispatcher = Dispatcher<EventType>;
/** @private */
export type EngineProps<T extends keyof EventMap> = {
  canvas: LikeCanvasElement,
  abort: AbortSignal,
  dispatch: Dispatcher<T>,
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

    const props: EngineProps<keyof EventMap> = {
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
      handleEvent: (ev) => callOwnHandlers(this.like, ev),
      callOwnHandlers: (ev) => callOwnHandlers(this.like, ev),
    };

    window.addEventListener('focus', () => this.dispatch('focus', ['tab']));
    window.addEventListener('blur', () => this.dispatch('blur', ['tab']));
    this.canvas.addEventListener('focus', () => this.dispatch('focus', ['canvas']));
  }

  private dispatch<K extends EventType>(type: K, args: EventMap[K]): void {
    const event = { type, args, timestamp: this.like.timer.getTime() } as LikeEvent;
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

      if (!this.like.timer.isSleeping()) {
        this.canvas.dispatchEvent(
          new CustomEvent("like:update", { detail: { dt } }),
        );
        this.dispatch('update', [dt]);
      }

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
    this.isRunning = false;
    this.abort.abort();
  }
}

export function likeDispatch(obj: LikeEventHandlers, event: LikeEvent) {
  if (obj.handleEvent) {
    obj.handleEvent(event);
  } else {
    callOwnHandlers(obj, event);
  }
}

/**
 * Allows us to call event handlers on any object with them.
 * Typically used at the end of a custom {@link Like.handleEvent | like.handleEvent}
 * in order to propogate an event normally after processing it.
 */
export function callOwnHandlers(obj: LikeEventHandlers, event: LikeEvent) {
  if (event.type in obj)
    (obj as any)[event.type](...event.args)
}
