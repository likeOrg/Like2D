/**
 * @module math 
 * 
 * A purely functional math library, mostly for 2d.
 * 
 * Check out {@link vector2} and {@link rect}
 * 
 * Why purely functional?
 *   1. About as fast as it can get -- the JIT will pick up on these.
 *   2. Plays nice with stream iterators.
 *   3. JS is likely to add a pipe operator in the future.
 *   4. Construction is as easy as building an array.
 */

/** True modulus, conspicuously missing from JS */
export const mod = (a: number, b: number) => ((a % b) + b) % b;

export { type Vector2, Vec2 } from "./vector2";
export { type Rectangle, Rect } from "./rect";