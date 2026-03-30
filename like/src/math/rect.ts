import { Vec2, type Vector2 } from '../math/vector2';

/**
 * A four-coordinate type `[x, y, width, height]`.
 * Full reference {@link Rect}.
 * 
 * ## Examples
 * 
 * ### Construct a rectangle
 * ```ts
 * const beastPen: Rectangle = [20, 25, 40, 50];
 * ```
 * 
 * ### Construct around a center point and size
 * ```ts
 * const beastPen: Rectangle = Rect.setCenter( 
 *   [0, 0, ...penSize],
 *   beastPos
 * );
 * ```
 * ### Deconstruct a rect
 * ```ts
 * [x, y, w, h] = beastPen;
 * ```
 * ### Deconstruct into points
 * ```ts
 * const penPos = Rect.position(beastPen);
 * const penSize = Rect.size(beastPen);
 * ```
 * 
 * ### Check if beast is in his pen
 * ```ts
 * const isInPen = Rect.containsPoint(
 *   beastPen,
 *   beast.pos,
 * )
 * ```
 * ### Put the beast back in his pen
 * ```ts
 * beast.pos = Rect.clampPoint(beast.pos, beastPen)
 * ```
 * 
 * */
export type Rectangle = [number, number, number, number];

/** The full library of {@link Rectangle} functions. */
export const Rect = {
  fromPoints(a: Vector2, b: Vector2): Rectangle {
    const minX = Math.min(a[0], b[0]);
    const minY = Math.min(a[1], b[1]);
    const maxX = Math.max(a[0], b[0]);
    const maxY = Math.max(a[1], b[1]);
    return [minX, minY, maxX - minX, maxY - minY];
  },

  fromCenter(center: Vector2, size: Vector2): Rectangle {
    return [
      center[0] - size[0] / 2,
      center[1] - size[1] / 2,
      size[0],
      size[1],
    ];
  },

  position(r: Rectangle): Vector2 {
    return [r[0], r[1]];
  },

  size(r: Rectangle): Vector2 {
    return [r[2], r[3]];
  },

  center(r: Rectangle): Vector2 {
    return [r[0] + r[2] / 2, r[1] + r[3] / 2];
  },

  topLeft(r: Rectangle): Vector2 {
    return [r[0], r[1]];
  },

  topRight(r: Rectangle): Vector2 {
    return [r[0] + r[2], r[1]];
  },

  bottomLeft(r: Rectangle): Vector2 {
    return [r[0], r[1] + r[3]];
  },

  bottomRight(r: Rectangle): Vector2 {
    return [r[0] + r[2], r[1] + r[3]];
  },

  area(r: Rectangle): number {
    return r[2] * r[3];
  },

  isEmpty(r: Rectangle): boolean {
    return r[2] <= 0 || r[3] <= 0;
  },

  clampPoint(r: Rectangle, point: Vector2): Vector2 {
    return Vec2.clamp(point, this.position(r), this.bottomRight(r));
  },

  containsPoint(r: Rectangle, point: Vector2): boolean {
    return (
      point[0] >= r[0] &&
      point[0] <= r[0] + r[2] &&
      point[1] >= r[1] &&
      point[1] <= r[1] + r[3]
    );
  },

  containsRect(r: Rectangle, other: Rectangle): boolean {
    return (
      other[0] >= r[0] &&
      other[0] + other[2] <= r[0] + r[2] &&
      other[1] >= r[1] &&
      other[1] + other[3] <= r[1] + r[3]
    );
  },

  intersects(r: Rectangle, other: Rectangle): boolean {
    return (
      r[0] < other[0] + other[2] &&
      r[0] + r[2] > other[0] &&
      r[1] < other[1] + other[3] &&
      r[1] + r[3] > other[1]
    );
  },

  intersection(r: Rectangle, other: Rectangle): Rectangle {
    const x1 = Math.max(r[0], other[0]);
    const y1 = Math.max(r[1], other[1]);
    const x2 = Math.min(r[0] + r[2], other[0] + other[2]);
    const y2 = Math.min(r[1] + r[3], other[1] + other[3]);
    const w = x2 - x1;
    const h = y2 - y1;
    if (w <= 0 || h <= 0) {
      return [0, 0, 0, 0];
    }
    return [x1, y1, w, h];
  },

  union(r: Rectangle, other: Rectangle): Rectangle {
    const x1 = Math.min(r[0], other[0]);
    const y1 = Math.min(r[1], other[1]);
    const x2 = Math.max(r[0] + r[2], other[0] + other[2]);
    const y2 = Math.max(r[1] + r[3], other[1] + other[3]);
    return [x1, y1, x2 - x1, y2 - y1];
  },

  inflate(r: Rectangle, amount: number): Rectangle {
    return [
      r[0] - amount,
      r[1] - amount,
      r[2] + amount * 2,
      r[3] + amount * 2,
    ];
  },

  offset(r: Rectangle, delta: Vector2): Rectangle {
    return [r[0] + delta[0], r[1] + delta[1], r[2], r[3]];
  },

  setPosition(r: Rectangle, pos: Vector2): Rectangle {
    return [pos[0], pos[1], r[2], r[3]];
  },

  setSize(r: Rectangle, size: Vector2): Rectangle {
    return [r[0], r[1], size[0], size[1]];
  },

  setCenter(r: Rectangle, center: Vector2): Rectangle {
    return [
      center[0] - r[2] / 2,
      center[1] - r[3] / 2,
      r[2],
      r[3],
    ];
  },
};
