export type Vector2 = [number, number];

export namespace V2 {
  export function add(a: Vector2, b: Vector2): Vector2 {
    return [a[0] + b[0], a[1] + b[1]];
  }

  export function sub(a: Vector2, b: Vector2): Vector2 {
    return [a[0] - b[0], a[1] - b[1]];
  }

  export function mul(v: Vector2, s: number): Vector2 {
    return [v[0] * s, v[1] * s];
  }

  export function div(v: Vector2, s: number): Vector2 {
    return [v[0] / s, v[1] / s];
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

  export function angle(v: Vector2): number {
    return Math.atan2(v[1], v[0]);
  }

  export function rotate(v: Vector2, angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
  }

  export function perpendicular(v: Vector2): Vector2 {
    return [-v[1], v[0]];
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
}

export const zero: Vector2 = [0, 0];
export const one: Vector2 = [1, 1];
export const up: Vector2 = [0, -1];
export const down: Vector2 = [0, 1];
export const left: Vector2 = [-1, 0];
export const right: Vector2 = [1, 0];
