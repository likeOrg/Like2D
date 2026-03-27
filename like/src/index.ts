/**
 * @module like2d
 * @description A cozy web-native 2D game framework.
 */

import { Engine } from './engine';
import type { Like } from './like';

export type { Like, TopLevelEventHandler } from './like';
export type { LikeEvent, EventType, EventMap } from './events';

/**
 * Create a new Like2D game instance attached to a DOM container.
 *
 * This is the entry point for all Like2D games. It creates a canvas element,
 * initializes all subsystems (graphics, audio, input), and returns an object
 * where you can assign game callbacks.
 *
 * @param container - The HTML element to attach the game canvas to.
 * @returns A {@link Like} instance ready for callback assignment
 */
export function createLike(container: HTMLElement): Like {
  const engine = new Engine(container);
  return engine.like;
}
