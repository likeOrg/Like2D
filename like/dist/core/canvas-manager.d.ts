import type { CanvasMode, PartialCanvasMode } from './canvas-config';
import { type Vector2 } from './vector2';
export declare class CanvasManager {
    private canvas;
    private container;
    private ctx;
    private config;
    private resizeObserver;
    private pixelCanvas;
    private pixelCtx;
    private onWindowResize;
    onResize: ((size: Vector2, pixelSize: Vector2, fullscreen: boolean) => void) | null;
    constructor(canvas: HTMLCanvasElement, container: HTMLElement, ctx: CanvasRenderingContext2D, config?: CanvasMode);
    private listenForPixelRatioChanges;
    setMode(mode: PartialCanvasMode): void;
    getMode(): CanvasMode;
    private applyConfig;
    private applyPixelMode;
    private applyNativeMode;
    dispose(): void;
    present(): void;
    getDisplayCanvas(): HTMLCanvasElement;
    transformMousePosition(cssX: number, cssY: number): Vector2;
}
//# sourceMappingURL=canvas-manager.d.ts.map