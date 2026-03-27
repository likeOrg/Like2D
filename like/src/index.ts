/**
 * @module like2d
 * @description A cozy web-native 2D game framework.
 *
 * See main like/README.md file an for overview of Like2D.
 */

import { Engine } from './engine';
import type { LikeEvent } from './internal/events';
import type { Like } from './internal/like';

export type { Like } from './internal/like';
export type { LikeEvent, EventType, EventMap } from './internal/events';
export type { CanvasSize, CanvasModeOptions as CanvasModeFlags } from './internal/canvas';
export type { Color, ShapeProps, DrawProps, PrintProps } from './internal/graphics';
export { ImageHandle } from './internal/graphics';
export type { AudioSource, AudioSourceOptions } from './internal/audio';
export { type LikeButton } from './internal/gamepad';

export type TopLevelEventHandler = (event: LikeEvent) => void;

/**
 * Create a new Like2D game instance attached to a DOM container.
 *
 * This is the entry point for all Like2D games. It creates a canvas element,
 * initializes all subsystems (graphics, audio, input), and returns an object
 * where you can assign game callbacks.
 *
 * ### How to bind callbacks
 * 
 * ```ts
 * const elem = document.getElementById("canvasHolder");
 * export const like = createLike(elem);
 * 
 * like.start();
 * 
 * like.draw = () => { like.gfx.clear('yellow') }
 * 
 * like.update = function (dt: number) {
 *   if (dt === Math.random()) {
 *     console.log("You just won the Powerball!")
 *   }
 * }
 * ```
 *
 * @param container - The HTML element to attach the game canvas to.
 * @returns A {@link Like} instance ready for callback assignment
 * 
 */
export function createLike(container: HTMLElement): Like {
  const engine = new Engine(container);
  return engine.like;
}