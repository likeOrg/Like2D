import type { Audio } from './audio/index';
import type { Timer } from './timer/index';
import type { Input } from './input/index';
import type { Keyboard } from './input/keyboard';
import type { Mouse } from './input/mouse';
import type { Gamepad } from './input/gamepad';
import type { Canvas } from './graphics/canvas';
import type { Graphics } from './graphics/index';
import { EventMap, EventType, LikeEvent } from './events';
import { Scene } from './scene';

/** @private */
export type TopLevelEventHandler = (event: LikeEvent) => void;

/** @private */
export type Callback<K extends EventType> = (...args: EventMap[K]) => void;

/** @private */
export type Callbacks = {
  [K in EventType]?: Callback<K>;
};

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

  /** I think you meant to type `canvas`. */
  window?: never;
  /** Shortened to `like.gfx`. */
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
   * Push a scene to the scene stack.
   * 
   * If the engine is running, this is the new running scene replacing the old one
   * which can, in some cases, call out to the lower scene.
   * 
   * @param overlay Set to true, and the current scene (before pushing) will stay loaded. Otherwise not.
   */
  pushScene(scene: Scene, overlay: boolean): void

  /**
   * Pop the current scene off the stack.
   * 
   * To clear the stack, just run:
   * ```ts
   * while (like.popScene());
   * ```
   */
  popScene(): Scene | undefined,

  /**
   * Set the current scene at the top of the scene stack.
   * If the stack is empty, push it onto the stack.
   * 
   * Equivalent to `popScene` + `pushScene`.
   * 
    * Use {@link index.Like | popScene} to clear away the current scene,
   * and to possibly revert to callback mode.
   */
  setScene(scene: Scene): void;

  /**
   * Get the current scene, or a specific index.
   * 
   * Uses `Array.at` under the hood, so -1 is the
   * top scene, -2 is the parent scene, etc.
   */
  getScene(index?: number): Scene | undefined;

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
  handleEvent?: TopLevelEventHandler;

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
export type Like = Callbacks & LikeBase;