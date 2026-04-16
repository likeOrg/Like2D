
import { Vec2, Vector2 } from "./";

/** {@include rectangle.md} */
export type Rectangle = [number, number, number, number];

export namespace Rect {
  export function fromPoints(a: Vector2, b: Vector2): Rectangle {
    const minX = Math.min(a[0], b[0]);
    const minY = Math.min(a[1], b[1]);
    const maxX = Math.max(a[0], b[0]);
    const maxY = Math.max(a[1], b[1]);
    return [minX, minY, maxX - minX, maxY - minY];
  }

  export function fromCenter(center: Vector2, size: Vector2): Rectangle {
    return [
      center[0] - size[0] / 2,
      center[1] - size[1] / 2,
      size[0],
      size[1],
    ];
  }

  export function position(r: Rectangle): Vector2 {
    return [r[0], r[1]];
  }

  export function size(r: Rectangle): Vector2 {
    return [r[2], r[3]];
  }

  export function center(r: Rectangle): Vector2 {
    return [r[0] + r[2] / 2, r[1] + r[3] / 2];
  }

  export function topLeft(r: Rectangle): Vector2 {
    return [r[0], r[1]];
  }

  export function topRight(r: Rectangle): Vector2 {
    return [r[0] + r[2], r[1]];
  }

  export function bottomLeft(r: Rectangle): Vector2 {
    return [r[0], r[1] + r[3]];
  }

  export function bottomRight(r: Rectangle): Vector2 {
    return [r[0] + r[2], r[1] + r[3]];
  }

  export function area(r: Rectangle): number {
    return r[2] * r[3];
  }

  export function isEmpty(r: Rectangle): boolean {
    return r[2] <= 0 || r[3] <= 0;
  }

  export function clampPoint(r: Rectangle, point: Vector2): Vector2 {
    return Vec2.clamp(point, position(r), bottomRight(r));
  }

  export function containsPoint(r: Rectangle, point: Vector2): boolean {
    return (
      point[0] >= r[0] &&
      point[0] <= r[0] + r[2] &&
      point[1] >= r[1] &&
      point[1] <= r[1] + r[3]
    );
  }

  export function containsRect(r: Rectangle, other: Rectangle): boolean {
    return (
      other[0] >= r[0] &&
      other[0] + other[2] <= r[0] + r[2] &&
      other[1] >= r[1] &&
      other[1] + other[3] <= r[1] + r[3]
    );
  }

  export function intersects(r: Rectangle, other: Rectangle): boolean {
    return (
      r[0] < other[0] + other[2] &&
      r[0] + r[2] > other[0] &&
      r[1] < other[1] + other[3] &&
      r[1] + r[3] > other[1]
    );
  }

  export function intersection(r: Rectangle, other: Rectangle): Rectangle {
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
  }

  export function union(r: Rectangle, other: Rectangle): Rectangle {
    const x1 = Math.min(r[0], other[0]);
    const y1 = Math.min(r[1], other[1]);
    const x2 = Math.max(r[0] + r[2], other[0] + other[2]);
    const y2 = Math.max(r[1] + r[3], other[1] + other[3]);
    return [x1, y1, x2 - x1, y2 - y1];
  }

  export function inflate(r: Rectangle, amount: number): Rectangle {
    return [
      r[0] - amount,
      r[1] - amount,
      r[2] + amount * 2,
      r[3] + amount * 2,
    ];
  }

  export function offset(r: Rectangle, delta: Vector2): Rectangle {
    return [r[0] + delta[0], r[1] + delta[1], r[2], r[3]];
  }

  export function setPosition(r: Rectangle, pos: Vector2): Rectangle {
    return [pos[0], pos[1], r[2], r[3]];
  }

  export function setSize(r: Rectangle, size: Vector2): Rectangle {
    return [r[0], r[1], size[0], size[1]];
  }

  export function setCenter(r: Rectangle, center: Vector2): Rectangle {
    return [
      center[0] - r[2] / 2,
      center[1] - r[3] / 2,
      r[2],
      r[3],
    ];
  }
}
