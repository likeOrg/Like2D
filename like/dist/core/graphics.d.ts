import type { Vector2 } from './vector2';
import type { Rect } from './rect';
type DrawMode = 'fill' | 'line';
export type Color = [number, number, number, number?] | string;
export type Quad = Rect;
export type { Vector2, Rect };
export type Canvas = {
    size: Vector2;
    element: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
};
export type ShapeProps = {
    lineWidth?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'bevel' | 'miter' | 'round';
    miterLimit?: number;
};
export type DrawProps = ShapeProps & {
    quad?: Quad;
    r?: number;
    scale?: number | Vector2;
    origin?: number | Vector2;
};
export type PrintProps = {
    font?: string;
    limit?: number;
    align?: 'left' | 'center' | 'right';
};
export type GraphicsState = {
    screenCtx: CanvasRenderingContext2D;
    currentCtx: CanvasRenderingContext2D;
    canvases: Map<Canvas, true>;
};
export declare class ImageHandle {
    readonly path: string;
    private element;
    private loadPromise;
    private isLoaded;
    constructor(path: string);
    isReady(): boolean;
    ready(): Promise<void>;
    get size(): Vector2;
    getElement(): HTMLImageElement | null;
}
export declare function newState(ctx: CanvasRenderingContext2D): GraphicsState;
export declare function clear(s: GraphicsState, color?: Color): void;
export declare function rectangle(s: GraphicsState, mode: DrawMode, color: Color, rect: Rect, props?: ShapeProps): void;
export declare function circle(s: GraphicsState, mode: DrawMode, color: Color, position: Vector2, radii: number | Vector2, props?: ShapeProps & {
    angle?: number;
    arc?: [number, number];
}): void;
export declare function line(s: GraphicsState, color: Color, points: Vector2[], props?: ShapeProps): void;
export declare function print(s: GraphicsState, color: Color, text: string, position: Vector2, props?: PrintProps): void;
export declare function drawImage(s: GraphicsState, handle: ImageHandle, position: Vector2, props?: DrawProps): void;
export declare function getCanvasSize(s: GraphicsState): Vector2;
export declare function newImage(_s: GraphicsState, path: string): ImageHandle;
export declare function newCanvas(s: GraphicsState, size: Vector2): Canvas;
export declare function setCanvas(s: GraphicsState, canvas?: Canvas | null): void;
export declare function clip(s: GraphicsState, rect?: Rect): void;
export declare function polygon(s: GraphicsState, mode: DrawMode, color: Color, points: Vector2[], props?: ShapeProps): void;
export declare function points(s: GraphicsState, color: Color, pts: Vector2[]): void;
export declare function push(s: GraphicsState): void;
export declare function pop(s: GraphicsState): void;
export declare function translate(s: GraphicsState, offset: Vector2): void;
export declare function rotate(s: GraphicsState, angle: number): void;
export declare function scale(s: GraphicsState, factor: number | Vector2): void;
type Bind<F> = F extends (s: GraphicsState, ...args: infer A) => infer R ? (...args: A) => R : never;
export type BoundGraphics = {
    [K in keyof typeof graphicsFns]: Bind<(typeof graphicsFns)[K]>;
};
declare const graphicsFns: {
    readonly clear: typeof clear;
    readonly rectangle: typeof rectangle;
    readonly circle: typeof circle;
    readonly line: typeof line;
    readonly print: typeof print;
    readonly draw: typeof drawImage;
    readonly getCanvasSize: typeof getCanvasSize;
    readonly newCanvas: typeof newCanvas;
    readonly setCanvas: typeof setCanvas;
    readonly clip: typeof clip;
    readonly polygon: typeof polygon;
    readonly points: typeof points;
    readonly newImage: typeof newImage;
    readonly push: typeof push;
    readonly pop: typeof pop;
    readonly translate: typeof translate;
    readonly rotate: typeof rotate;
    readonly scale: typeof scale;
};
export declare function bindGraphics(s: GraphicsState): BoundGraphics;
//# sourceMappingURL=graphics.d.ts.map