import type { Vector2 } from './vector2';
export type CanvasMode = {
    pixelResolution: Vector2 | null;
    fullscreen: boolean;
};
export type PartialCanvasMode = {
    pixelResolution?: Vector2 | null;
    fullscreen?: boolean;
};
/**
 * Calculate the scale and offset for rendering fixed-size content to a target canvas.
 * This is useful when you want to render in "native" mode but maintain a fixed game resolution.
 *
 * @param canvasSize - The actual canvas size in pixels
 * @param gameSize - The desired game resolution (fixed size)
 * @returns Object containing the scale factor and offset for centering
 */
export declare function calcFixedScale(canvasSize: Vector2, gameSize: Vector2): {
    scale: number;
    offset: Vector2;
};
//# sourceMappingURL=canvas-config.d.ts.map