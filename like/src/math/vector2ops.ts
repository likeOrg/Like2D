
/**
 * The full library of {@link Vector2} functions.
*/

import { Vector2, Pair, mod as mmod } from ".";

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
 * Turn a unary function into a pair-wise unary function.
 * @param op A function that takes one arg and returns something.
 * @returns A function that takes a pair such as `[number, number]` (Vector2) and transforms it with `op`.
 */
export const map = map2x1;
/**
 * Turn a binary function into a pair-wise binary function, for example one that operates on two `Vector2`s.
 * @param op A function that takes two values and calculates one.
 * @returns A function that runs `op` pair-wise on both arguments, constructing a new pair.
 */
export const map2 = map2x2;

export const add = map2x2((a: number, b) => a + b);
export const sub = map2x2((a: number, b) => a - b);
export const mul = map2x2((a: number, b) => a * b);
export const div = map2x2((a: number, b) => a / b);
/** Returns the maximum of two coordinates,
 * i.e. the lower right corner of a bounding box containing them. */
export const max = map2x2(Math.max);
/** Returns the minimum of two coordinates,
 * i.e. the upper left corner of a bounding box containing them. */
export const min = map2x2(Math.min);
/** Apply a true modulus (i.e. where -1 % 3 == 2) to a Vector2.
 *
 * For JS-style modulus (who wants that?) use `Vec2.map2((a,b) => a % b)` */
export const mod = map2x2(mmod);

/** Apply deep (not referential) equality to a pair of Vec2s.
 * @param epsilon Tolerance factor for inexact matches.
 */
export const eq = (v: Vector2, other: Vector2, epsilon: 0): boolean =>
  epsilon == 0
    ? v[0] == other[0] && v[1] == other[1]
    : lengthSq(sub(v, other)) < epsilon ** 2;

export const dot = (a: Vector2, b: Vector2): number =>
  a[0] * b[0] + a[1] * b[1];

export const cross = (a: Vector2, b: Vector2): number => a[0] * b[1] - a[1] * b[0];
export const lengthSq = (v: Vector2): number => v[0] * v[0] + v[1] * v[1];
export const length = (v: Vector2): number => Math.sqrt(lengthSq(v));

/** Set the length of a Vector2 to 1.0 while preserving its angle. */
export const normalize = (v: Vector2): Vector2 => {
  const len = length(v);
  if (len === 0) return [0, 0];
  return div(v, len);
};

export const distance = (a: Vector2, b: Vector2): number =>
  length(sub(a, b));

export const lerp = (a: Vector2, b: Vector2, t: number): Vector2 =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const toPolar = (v: Vector2): { r: number; angle: number } =>
({
  r: length(v),
  angle: angle(v),
});

export const fromPolar = (r: number, angle: number): Vector2 =>
  [r * Math.cos(angle), r * Math.sin(angle)];

export const angle = (v: Vector2): number => Math.atan2(v[1], v[0]);

export const rotate = (v: Vector2, angle: number): Vector2 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
};

export const negate = map2x1((a: number) => -a);
export const floor = map2x1(Math.floor);
export const ceil = map2x1(Math.ceil);
export const round = map2x1(Math.round);

export const clamp = (v: Vector2, min: Vector2, max: Vector2): Vector2 =>
  [
    Math.max(min[0], Math.min(v[0], max[0])),
    Math.max(min[1], Math.min(v[1], max[1])),
  ];

export const fromAngle = (angle: number, len: number = 1): Vector2 =>
  [Math.cos(angle) * len, Math.sin(angle) * len];

export const zero = (): Vector2 => [0, 0];
