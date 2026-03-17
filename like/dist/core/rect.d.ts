import type { Vector2 } from './vector2';
export type Rect = [number, number, number, number];
export declare namespace Rect {
    function fromPoints(a: Vector2, b: Vector2): Rect;
    function fromCenter(center: Vector2, size: Vector2): Rect;
    function position(r: Rect): Vector2;
    function size(r: Rect): Vector2;
    function center(r: Rect): Vector2;
    function topLeft(r: Rect): Vector2;
    function topRight(r: Rect): Vector2;
    function bottomLeft(r: Rect): Vector2;
    function bottomRight(r: Rect): Vector2;
    function area(r: Rect): number;
    function isEmpty(r: Rect): boolean;
    function containsPoint(r: Rect, point: Vector2): boolean;
    function containsRect(r: Rect, other: Rect): boolean;
    function intersects(r: Rect, other: Rect): boolean;
    function intersection(r: Rect, other: Rect): Rect;
    function union(r: Rect, other: Rect): Rect;
    function inflate(r: Rect, amount: number): Rect;
    function offset(r: Rect, delta: Vector2): Rect;
    function setPosition(r: Rect, pos: Vector2): Rect;
    function setSize(r: Rect, size: Vector2): Rect;
    function setCenter(r: Rect, center: Vector2): Rect;
}
//# sourceMappingURL=rect.d.ts.map