import type { Audio } from './audio/';
import type { Timer } from './timer/';
import type { Input } from './input/';
import type { Keyboard } from './input/keyboard';
import type { Mouse } from './input/mouse';
import type { Gamepad } from './input/gamepad';
import type { Canvas } from './graphics/canvas';
import type { Graphics } from './graphics/';
import { LikeEvent, LikeEventHandlers } from './events';

/** @private */
export type TopLevelEventHandler = (event: LikeEvent) => void;

/**
 * Every possible event handler callback is in this interface.
 *
 * The engine will call these functions when the corresponding
 * events fire unless {@link handleEvent} is customized, for example
 * when the scene system is in use.
 *
 * @interface
 */
export type LikeHandlers = Partial<LikeEventHandlers> & {
  /**
   * LIKE's runtime is concentrated into handleEvent.
   *
   * This function recieves all events.
   * {@link callOwnHandlers} is the default behavior.
   *
   * Otherwise, a custom handler will totally override
   * event handler callbacks like `like.draw`,
   * replacing it with a system of your choice.
   *
   * For example, the scene plugin is built around
   * setting this function.
   *
   * Setting `handleEvent` to `undefined` will revert
   * to default behavior.
   *
   * [How to create middleware with handleEvent](../docs/middleware.md)
   */
   handleEvent?: TopLevelEventHandler
};

/** 
 * The main modules and builtins of `like`.
 * @interface
 */
export type LikeBase = {
  /** Handle a pool of audio sources with global volume control and more. */
  readonly audio: Audio;
  /** Misc. time functions, including sleeping the game. ZZZ */
  readonly timer: Timer;
  /** Bind inputs to actions that call `like.actionpressed`, or query them here also. */
  readonly input: Input;
  /** Check if scancodes are down / pressed. */
  readonly keyboard: Keyboard;
  /** Mouse module: Get a properly scaled mouse position, set capture and more. */
  readonly mouse: Mouse;
  /** Gamepad module: Map gamepads and check their buttons. */
  readonly gamepad: Gamepad;
  /** Get and set screen size, choosing between native and pixel perfect prescaling. Plus fullscreen control. */
  readonly canvas: Canvas;
  /** Graphics module: LOVE-style rendering, plus a pseudo-synchronous way to load images. */
  readonly gfx: Graphics;

  /** @private Use {@link canvas} instead. */
  window?: never;
  /** @private Use {@link gfx} instead. */
  graphics?: never;

  /**
   * Start the game loop. Call this only once.
   * @returns Promise that resolves when the engine is ready
   */
  start(): Promise<void>;

  /**
   * Only call this when you're done with LIKE. Everything will stop
   * running, and probably break if you try to use it.
   */
  dispose(): void;

  /**
   * Deprecated; use {@link like.callOwnHandlers} with `like`
   * as the first parameter.
   * @param event
   */
  callOwnHandlers?: never;
}

/**
 * The main Like instance.
 * Use this object much how you would the `love` object in Love2D.
 * This is the interface returned by {@link createLike}.
 */
export type Like = LikeHandlers & LikeBase;
