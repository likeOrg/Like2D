export type Vector2 = [number, number];
export declare namespace Vec2 {
    function add(a: Vector2, b: Vector2): Vector2;
    function sub(a: Vector2, b: Vector2): Vector2;
    function mul(v: Vector2, other: Vector2 | number): Vector2;
    function div(v: Vector2, other: Vector2 | number): Vector2;
    function dot(a: Vector2, b: Vector2): number;
    function cross(a: Vector2, b: Vector2): number;
    function lengthSq(v: Vector2): number;
    function length(v: Vector2): number;
    function normalize(v: Vector2): Vector2;
    function distance(a: Vector2, b: Vector2): number;
    function lerp(a: Vector2, b: Vector2, t: number): Vector2;
    function angle(v: Vector2): number;
    function rotate(v: Vector2, angle: number): Vector2;
    function negate(v: Vector2): Vector2;
    function floor(v: Vector2): Vector2;
    function ceil(v: Vector2): Vector2;
    function round(v: Vector2): Vector2;
    function min(a: Vector2, b: Vector2): Vector2;
    function max(a: Vector2, b: Vector2): Vector2;
    function clamp(v: Vector2, min: Vector2, max: Vector2): Vector2;
    function fromAngle(angle: number, len?: number): Vector2;
    function zero(): Vector2;
}
//# sourceMappingURL=vector2.d.ts.map