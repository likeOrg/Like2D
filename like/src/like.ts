import type { Audio } from './audio/index';
import type { Timer } from './timer/index';
import type { Input } from './input/index';
import type { Keyboard } from './input/keyboard';
import type { Mouse } from './input/mouse';
import type { Gamepad } from './input/gamepad';
import type { Canvas } from './graphics/canvas';
import type { Graphics } from './graphics/index';
import { EventMap, EventType, LikeEvent } from './events';

/** @private */
export type TopLevelEventHandler = (event: LikeEvent) => void;

type EventHandler<K extends EventType> = (...args: EventMap[K]) => void;

/** @private */
export type LikeEventHandlers = {
  [K in EventType]?: EventHandler<K>;
} & { handleEvent?: TopLevelEventHandler };

/** 
 * The main modules and builtins of `like`, aside from {@link EventMap | optional callbacks}.
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
   * LIKE's runtime is built around calling handleEvent.
   * 
   * This function recieves all events. If set to undefined,
    * {@link index.Like | Like.callOwnHandlers} is the default behavior.
   * 
   * Otherwise, you can really customize LIKE by setting this
   * to a custom handler.
   * 
   * For example, the scene architecture is built around
   * setting this function. Setting it to a custom
   * function will disable the scene system.
   */
  handleEvent: TopLevelEventHandler;

  /**
   * Used as the default `like.handleEvent`, simply dispatches
   * an event into LIKE callbacks.
   * @param event 
   */
  callOwnHandlers(event: LikeEvent): void;
}

/**
 * The main Like instance.
 * Use this object much how you would the `love` object in Love2D.
 * This is the interface returned by {@link createLike}.
 * 
 * Check out all the {@link EventMap | callbacks}.
 */
export type Like = LikeEventHandlers & LikeBase;
