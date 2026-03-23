/**
 * @module like2d
 * @description A cozy web-native 2D game framework.
 *
 * See main like/README.md file an for overview of Like2D.
 */

import { Engine } from './engine';
import type { LikeEvent } from './core/events';
import type { Like } from './core/like';

export type { Like } from './core/like';
export type { LikeEvent, EventType, EventMap } from './core/events';
export type { CanvasSize, CanvasModeOptions as CanvasModeFlags } from './core/canvas';
export type { Color, ShapeProps, DrawProps, PrintProps } from './core/graphics';
export { ImageHandle } from './core/graphics';
export type { Source, SourceOptions } from './core/audio';
export { type LikeButton } from './core/gamepad';

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
 * export const like = createLike();
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
 *                    Must be in the DOM.
 * @returns A {@link Like} instance ready for callback assignment
 * 
 */
export function createLike(container: HTMLElement): Like {
  const engine = new Engine(container);
  return engine.like;
}