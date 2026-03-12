import type { Vector2 } from './vector2.ts';

export type Rect = [number, number, number, number];

export namespace R {
  export function create(x: number, y: number, w: number, h: number): Rect {
    return [x, y, w, h];
  }

  export function fromPoints(a: Vector2, b: Vector2): Rect {
    const minX = Math.min(a[0], b[0]);
    const minY = Math.min(a[1], b[1]);
    const maxX = Math.max(a[0], b[0]);
    const maxY = Math.max(a[1], b[1]);
    return [minX, minY, maxX - minX, maxY - minY];
  }

  export function fromCenter(center: Vector2, size: Vector2): Rect {
    return [
      center[0] - size[0] / 2,
      center[1] - size[1] / 2,
      size[0],
      size[1],
    ];
  }

  export function position(r: Rect): Vector2 {
    return [r[0], r[1]];
  }

  export function size(r: Rect): Vector2 {
    return [r[2], r[3]];
  }

  export function center(r: Rect): Vector2 {
    return [r[0] + r[2] / 2, r[1] + r[3] / 2];
  }

  export function topLeft(r: Rect): Vector2 {
    return [r[0], r[1]];
  }

  export function topRight(r: Rect): Vector2 {
    return [r[0] + r[2], r[1]];
  }

  export function bottomLeft(r: Rect): Vector2 {
    return [r[0], r[1] + r[3]];
  }

  export function bottomRight(r: Rect): Vector2 {
    return [r[0] + r[2], r[1] + r[3]];
  }

  export function area(r: Rect): number {
    return r[2] * r[3];
  }

  export function isEmpty(r: Rect): boolean {
    return r[2] <= 0 || r[3] <= 0;
  }

  export function containsPoint(r: Rect, point: Vector2): boolean {
    return (
      point[0] >= r[0] &&
      point[0] <= r[0] + r[2] &&
      point[1] >= r[1] &&
      point[1] <= r[1] + r[3]
    );
  }

  export function containsRect(r: Rect, other: Rect): boolean {
    return (
      other[0] >= r[0] &&
      other[0] + other[2] <= r[0] + r[2] &&
      other[1] >= r[1] &&
      other[1] + other[3] <= r[1] + r[3]
    );
  }

  export function intersects(r: Rect, other: Rect): boolean {
    return (
      r[0] < other[0] + other[2] &&
      r[0] + r[2] > other[0] &&
      r[1] < other[1] + other[3] &&
      r[1] + r[3] > other[1]
    );
  }

  export function intersection(r: Rect, other: Rect): Rect {
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

  export function union(r: Rect, other: Rect): Rect {
    const x1 = Math.min(r[0], other[0]);
    const y1 = Math.min(r[1], other[1]);
    const x2 = Math.max(r[0] + r[2], other[0] + other[2]);
    const y2 = Math.max(r[1] + r[3], other[1] + other[3]);
    return [x1, y1, x2 - x1, y2 - y1];
  }

  export function inflate(r: Rect, amount: number): Rect {
    return [
      r[0] - amount,
      r[1] - amount,
      r[2] + amount * 2,
      r[3] + amount * 2,
    ];
  }

  export function offset(r: Rect, delta: Vector2): Rect {
    return [r[0] + delta[0], r[1] + delta[1], r[2], r[3]];
  }

  export function setPosition(r: Rect, pos: Vector2): Rect {
    return [pos[0], pos[1], r[2], r[3]];
  }

  export function setSize(r: Rect, size: Vector2): Rect {
    return [r[0], r[1], size[0], size[1]];
  }

  export function setCenter(r: Rect, center: Vector2): Rect {
    return [
      center[0] - r[2] / 2,
      center[1] - r[3] / 2,
      r[2],
      r[3],
    ];
  }
}
