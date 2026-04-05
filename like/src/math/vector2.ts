import { mod as mmod } from "./index.js";

/** @private */
export type Pair<T> = [T, T];

/** {@include vector2.md} */

export type Vector2 = Pair<number>;

/**
 * According to benchmarks, constructing funcs with these helpers is just as fast as loose coords in v8.
 * Why not, then?
 * If you're writing hyper-optimized Vector2 code, just use loose math anyway
 * -- it will likely logically optimize down further, if you do the algebra.
 */

/** @see {@link Vec2.map} */
function map2x1<I, O>(op: (a: I) => O): (a: Pair<I>) => Pair<O> {
  return (a) => [op(a[0]), op(a[1])];
}

/** @see {@link Vec2.map2} */
function map2x2<I, O>(
  op: (a: I, b: I) => O,
): (a: Pair<I>, b: I | Pair<I>) => Pair<O> {
  return (a, b) =>
    typeof b == "object" && b instanceof Array
      ? [op(a[0], b[0]), op(a[1], b[1])]
      : [op(a[0], b), op(a[1], b)];
}

/** 
 * The full library of {@link Vector2} functions. 
*/
export const Vec2 = {
  /**
   * Turn a unary function into a pair-wise unary function.
   * @param op A function that takes one arg and returns something.
   * @returns A function that takes a pair such as `[number, number]` (Vector2) and transforms it with `op`.
   */
  map: map2x1,
  /**
   * Turn a binary function into a pair-wise binary function, for example one that operates on two `Vector2`s.
   * @param op A function that takes two values and calculates one.
   * @returns A function that runs `op` pair-wise on both arguments, constructing a new pair.
   */
  map2: map2x2,

  add: map2x2((a: number, b) => a + b),
  sub: map2x2((a: number, b) => a - b),
  mul: map2x2((a: number, b) => a * b),
  div: map2x2((a: number, b) => a / b),
  /** Returns the maximum of two coordinates,
   * i.e. the lower right corner of a bounding box containing them. */
  max: map2x2(Math.max),
  /** Returns the minimum of two coordinates,
   * i.e. the upper left corner of a bounding box containing them. */
  min: map2x2(Math.min),
  /** Apply a true modulus (i.e. where -1 % 3 == 2) to a Vector2.
   * 
   * For JS-style modulus (who wants that?) use `Vec2.map2((a,b) => a % b)` */
  mod: map2x2(mmod),

  /** Apply deep (not referential) equality to a pair of Vec2s.
   * @param epsilon Tolerance factor for inexact matches.
   */
  eq(v: Vector2, other: Vector2, epsilon: 0): boolean {
    return epsilon == 0
      ? v[0] == other[0] && v[1] == other[1]
      : Vec2.lengthSq(Vec2.sub(v, other)) < epsilon ** 2;
  },

  dot(a: Vector2, b: Vector2): number {
    return a[0] * b[0] + a[1] * b[1];
  },

  cross(a: Vector2, b: Vector2): number {
    return a[0] * b[1] - a[1] * b[0];
  },

  lengthSq(v: Vector2): number {
    return v[0] * v[0] + v[1] * v[1];
  },

  length(v: Vector2): number {
    return Math.sqrt(this.lengthSq(v));
  },

  /** Set the length of a Vector2 to 1.0 while preserving its angle. */
  normalize(v: Vector2): Vector2 {
    const len = this.length(v);
    if (len === 0) return [0, 0];
    return this.div(v, len);
  },

  distance(a: Vector2, b: Vector2): number {
    return this.length(this.sub(a, b));
  },

  lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  },

  toPolar(v: Vector2): { r: number; angle: number } {
    return {
      r: this.length(v),
      angle: this.angle(v),
    };
  },

  fromPolar(r: number, angle: number): Vector2 {
    return [r * Math.cos(angle), r * Math.sin(angle)];
  },

  angle(v: Vector2): number {
    return Math.atan2(v[1], v[0]);
  },

  rotate(v: Vector2, angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
  },

  negate: map2x1((a: number) => -a),
  floor: map2x1(Math.floor),
  ceil: map2x1(Math.ceil),
  round: map2x1(Math.round),

  clamp(v: Vector2, min: Vector2, max: Vector2): Vector2 {
    return [
      Math.max(min[0], Math.min(v[0], max[0])),
      Math.max(min[1], Math.min(v[1], max[1])),
    ];
  },

  fromAngle(angle: number, len: number = 1): Vector2 {
    return [Math.cos(angle) * len, Math.sin(angle) * len];
  },

  zero(): Vector2 {
    return [0, 0];
  },
};

