import type { Vector2 } from './vector2';
export type MousePositionTransform = (cssX: number, cssY: number) => Vector2;
export declare class Mouse {
    private x;
    private y;
    private buttons;
    onMouseEvent?: (clientX: number, clientY: number, button: number | undefined, type: 'mousemove' | 'mousedown' | 'mouseup') => void;
    private transformFn?;
    private mousemoveHandler;
    private mousedownHandler;
    private mouseupHandler;
    private blurHandler;
    constructor(transformFn?: MousePositionTransform);
    setTransform(transformFn: MousePositionTransform | undefined): void;
    private handleMouseMove;
    private handleMouseDown;
    private handleMouseUp;
    private handleBlur;
    dispose(): void;
    getPosition(): Vector2;
    getX(): number;
    getY(): number;
    isDown(button: number): boolean;
    getPressedButtons(): Set<number>;
    isVisible(): boolean;
    setVisible(visible: boolean, canvas?: HTMLCanvasElement): void;
    getRelativeMode(): boolean;
}
//# sourceMappingURL=mouse.d.ts.map