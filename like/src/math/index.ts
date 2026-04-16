// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

/**
 * A purely functional math library, mostly for 2d.
 * 
 * Check out {@link Vector2} and {@link Rect}
 * 
 * Why purely functional?
 *   1. Plays nice with stream iterators.
 *   2. JS is likely to add a pipe operator in the future.
 *   3. Construction is as easy as building an array.
 * 
 * @module math 
 */

export { type Vector2, type Pair, Vec2 } from "./vector2";
export { type Rectangle, Rect } from "./rect";

/** True modulus, conspicuously missing from JS */
export const mod = (a: number, b: number) => ((a % b) + b) % b;
