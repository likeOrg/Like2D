// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

/**
 * The main LÏKE entry point and definitions.
 *
 *  - {@link createLike | Instantiate LÏKE}
 *  - {@link LikeBase | Browse the module table}
 *  - {@link LikeHandlers | See all event types}
 *
 * @module like
 */

import { Engine } from './engine';
import type { Like } from './like';

// general
export type { Like, LikeHandlers, LikeBase, TopLevelEventHandler } from './like';
export type { LikeEvent, LikeCanvasElement } from './events';
export { callOwnHandlers, likeDispatch } from './engine';

/** The full library of {@link Vector2} functions. */
export { Vec2 } from './math/vector2';
export { type Vector2 } from './math/vector2';
export { type Pair } from './math/vector2';

/** The full library of {@link Rectangle} functions. */
export { Rect } from "./math/rect";
export { type Rectangle } from './math/rect';
export { mod } from './math';

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
