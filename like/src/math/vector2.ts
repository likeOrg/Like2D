import { mod as mmod } from "./index.js";

/** A pair of numbers `[x, y]`
 * representing for example:
 *  - position in 2D space
 *  - width and height
 *  - velocity
 * 
 * See {@link Vec2} for full library.
 * 
 * ## Examples
 * 
 * #### Constructing a Vector2
 * ```ts
 * const onionSize: Vector2 = [width, height];
 * ```
 * 
 * #### Deconstructing a Vector2
 * ```ts
 * const [width, height] = onionSize;
 * ```
 * 
 * #### Making math less repetitive.
 * ```ts
 * x += dx * speed;
 * y += dy * speed;
 * // becomes...
 * pos = Vec2.add(pos, Vec2.mul(delta, speed))
 * ```
 * 
 * #### Summing an array of Vector2
 * ```ts
 * const nums: Vector2[] = [[50, 100], [-5, -5], [0, 99]];
 * const sum = nums.reduce(Vec2.add);
 * ```
 * 
 * #### Using LIKE graphics API
 * ```ts
 * // Draw a circle in the center of the canvas.
 * const pos = Vec2.div(
 *   like.canvas.getSize(),
 *   2,
 * )
 * like.graphics.circle('fill', 'blue', pos, 20); 
 * ```
 * */
export type Vector2 = [number, number];

/** Library of Vec2 functions. See {@link Vector2} for overview. */
export namespace Vec2 {
  export function add(a: Vector2, b: Vector2): Vector2 {
    return [a[0] + b[0], a[1] + b[1]];
  }

  export function sub(a: Vector2, b: Vector2): Vector2 {
    return [a[0] - b[0], a[1] - b[1]];
  }

  export function mul(v: Vector2, other: Vector2 | number): Vector2 {
    if (typeof other === 'number') {
      return [v[0] * other, v[1] * other];
    }
    return [v[0] * other[0], v[1] * other[1]];
  }

  export function div(v: Vector2, other: Vector2 | number): Vector2 {
    if (typeof other === 'number') {
      return [v[0] / other, v[1] / other];
    }
    return [v[0] / other[0], v[1] / other[1]];
  }

  export function mod(v: Vector2, other: Vector2 | number): Vector2 {
    if (typeof other === 'number') {
      return [mmod(v[0], other), mmod(v[1], other)]
    }
    return [mmod(v[0], other[0]), mmod(v[1], other[1])]
  }

  export function eq(v: Vector2, other: Vector2): boolean {
    return v[0] == other[0] && v[1] == other[1];
  }

  export function dot(a: Vector2, b: Vector2): number {
    return a[0] * b[0] + a[1] * b[1];
  }

  export function cross(a: Vector2, b: Vector2): number {
    return a[0] * b[1] - a[1] * b[0];
  }

  export function lengthSq(v: Vector2): number {
    return v[0] * v[0] + v[1] * v[1];
  }

  export function length(v: Vector2): number {
    return Math.sqrt(lengthSq(v));
  }

  export function normalize(v: Vector2): Vector2 {
    const len = length(v);
    if (len === 0) return [0, 0];
    return div(v, len);
  }

  export function distance(a: Vector2, b: Vector2): number {
    return length(sub(a, b));
  }

  export function lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  export function toPolar(v: Vector2): { r: number, angle: number } {
    return {
      r: Vec2.length(v),
      angle: Vec2.angle(v),
    }
  }

  export function fromPolar(r: number, angle: number): Vector2 {
    return [ r * Math.cos(angle), r * Math.sin(angle) ]
  }

  export function angle(v: Vector2): number {
    return Math.atan2(v[1], v[0]);
  }

  export function rotate(v: Vector2, angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
  }

  export function negate(v: Vector2): Vector2 {
    return [-v[0], -v[1]];
  }

  export function floor(v: Vector2): Vector2 {
    return [Math.floor(v[0]), Math.floor(v[1])];
  }

  export function ceil(v: Vector2): Vector2 {
    return [Math.ceil(v[0]), Math.ceil(v[1])];
  }

  export function round(v: Vector2): Vector2 {
    return [Math.round(v[0]), Math.round(v[1])];
  }

  export function min(a: Vector2, b: Vector2): Vector2 {
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
  }

  export function max(a: Vector2, b: Vector2): Vector2 {
    return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  }

  export function clamp(v: Vector2, min: Vector2, max: Vector2): Vector2 {
    return [
      Math.max(min[0], Math.min(v[0], max[0])),
      Math.max(min[1], Math.min(v[1], max[1])),
    ];
  }

  export function fromAngle(angle: number, len: number = 1): Vector2 {
    return [Math.cos(angle) * len, Math.sin(angle) * len];
  }

  export function zero(): Vector2 {
    return [0, 0];
  }
}
