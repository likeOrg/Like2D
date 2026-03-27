/**
 * @module like
 * @description A catalogue of subsystems
 */

import type { Audio } from './audio/index';
import type { Timer } from './timer/index';
import type { Input } from './input/index';
import type { Keyboard } from './input/keyboard';
import type { Mouse } from './input/mouse';
import type { Gamepad } from './input/gamepad';
import type { Canvas } from './graphics/canvas';
import type { BoundGraphics } from './graphics/index';
import { EventMap, EventType, LikeEvent } from './events';
import { Scene } from './scene';

export type TopLevelEventHandler = (event: LikeEvent) => void;

type Callback<K extends EventType> = (...args: EventMap[K]) => void;

type Callbacks = {
  [K in EventType]?: Callback<K>;
};

/**
 * The main Like instance.
 * Use this object much how you would the `love` object in Love2D.
 * This is the interface returned by {@link createLike}.
 */
export type Like = Callbacks & {
  readonly audio: Audio;
  readonly timer: Timer;
  readonly input: Input;
  readonly keyboard: Keyboard;
  readonly mouse: Mouse;
  readonly gamepad: Gamepad;
  readonly canvas: Canvas;

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
   */
  setScene(scene?: Scene): void;

  /**
   * LIKE's runtime is built around calling handleEvent.
   */
  handleEvent?: TopLevelEventHandler;

  callOwnHandlers(event: LikeEvent): void;
}
