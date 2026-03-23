/**
 * @module like
 * @description A catalogue of subsystems
 *
 * This is how we know what's part of like.
 * `like.gfx`, `like.canvas`, and such.
 * 
 */


import type { Audio } from './audio';
import type { Timer } from './timer';
import type { Input } from './input';
import type { Keyboard } from './keyboard';
import type { Mouse } from './mouse';
import type { LikeGamepad } from './gamepad';
import type { CanvasInternal } from './canvas';
import type { BoundGraphics } from './graphics';
import { EventMap, EventType, LikeEvent } from './events';
import { TopLevelEventHandler } from '..';
import { Scene } from '../scene';

type Callback<K extends EventType> = (...args: EventMap[K]) => void;

type Callbacks = {
  [K in EventType]?: Callback<K>;
};

export type LikeInternal = Callbacks & {
  /** Synchronous audio handles with global control. */
  readonly audio: Audio;
  
  /** Timer system for tracking time, delta, FPS, and freezing the whole game. */
  readonly timer: Timer;
  
  /** Input system for action-based input handling */
  readonly input: Input;
  
  /** Keyboard input handling */
  readonly keyboard: Keyboard;
  
  /** Mouse input handling */
  readonly mouse: Mouse;
  
  /** Gamepad input handling */
  readonly gamepad: LikeGamepad;

  canvas: CanvasInternal,

  /** I think you meant to type like.canvas instead.  */
  window?: never;

  /** Look at {@link handleEvent} -- it serves the same purpose. */
  run?: never;

  /** Graphics context for rendering operations */
  gfx: BoundGraphics;

  /**
   * Start the game loop. Call this only once.
   * @returns Promise that resolves when the engine is ready
   */
  start(): Promise<void>;

  /**
   * Clears out event listeners to avoid memory leaks.
   */
  dispose(): void;

  /**
   * A simple way to set the current scene, which acts like a pluggable
   * set of callbacks. 
   * 
   * Translates into `like.handleEvent = (event) => sceneDispatch(scene, like, event)`.
   * 
   * @see Scene 
   * @param scene Scene to load, leave out to use callbacks.
   */
  setScene(scene?: Scene): void;

  /**
   * LIKE's runtime is built around calling handleEvent.
   * 
   * For more advanced LIKE users, overriding this function allows you
   * to create your own fundamental systems by writing an {@link TopLevelEventHandler}
   * 
   * The built-in event handler amounts to calling `like[ev.type](...ev.args)`, as
   * does the scene one which is a bit more like `yourScene[ev.type](like, ...ev.args)`.
   * 
   * The code for them is very short and simple. Take a look if you're interested
   * in building your own.
   */
  handleEvent?: TopLevelEventHandler;

  callOwnHandlers(event: LikeEvent): void;
}

/**
 * A little helper that hides methods with underscores.
 */
type Public<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K]
};

type Canvas = Public<CanvasInternal>; 

/**
 * The main Like instance.
 * Use this object much how you would the `love` object in Love2D.
 * This is the interface returned by {@link createLike}.
 *
 * Assigns callbacks to handle events. See {@link EventMap} for all available events.
 * 
 * Don't forget to call `await start()` when you're ready,
 * and `dispose()` if you're done with it.
 */
export type Like = LikeInternal & {
  /** Canvas settings, including even Pixel Art mode. */
  readonly canvas: Canvas;
}
