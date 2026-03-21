/**
 * @module like
 * @description A catalogue of subsystems
 *
 * This is how we know what's part of like.
 * `like.gfx`, `like.canvas`, and such.
 * 
 */

/**
 * A little helper that hides methods with underscores.
 */
type Public<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K]
};


import type { Audio } from './audio';
import type { Timer } from './timer';
import type { Input } from './input';
import type { Keyboard } from './keyboard';
import type { Mouse } from './mouse';
import type { LikeGamepad } from './gamepad';
import type { CanvasInternal } from './canvas';
import type { BoundGraphics } from './graphics';
import type { Scene } from '../scene';

type Canvas = Public<CanvasInternal>; 

/**
 * The Like interface provides access to all core systems and APIs
 * that are passed to game callbacks (load, update, draw, etc.).
 *
 * This is the main interface for interacting with the engine's subsystems.
 */
export interface Like {
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

  /** Canvas settings, including even Pixel Art mode. */
  readonly canvas: Canvas;

  /** I think you meant to type like.canvas instead.  */
  window?: never;

  /** Graphics context for rendering operations */
  gfx: BoundGraphics;
  
  /**
   * Set the active {@link Scene}. Pass null to revert to global callbacks.
   */
  setScene(scene?: Scene): void;
}
