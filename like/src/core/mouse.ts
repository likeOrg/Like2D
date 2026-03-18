import type { Vector2 } from './vector2';

export type MousePositionTransform = (offsetX: number, offsetY: number) => Vector2;

export class Mouse {
  private x = 0;
  private y = 0;
  private buttons = new Set<number>();
  public onMouseEvent?: (x: number, y: number, button: number | undefined, type: 'mousemove' | 'mousedown' | 'mouseup') => void;
  private transformFn?: MousePositionTransform;
  private canvas: HTMLCanvasElement | null = null;

  // Event handler references for cleanup
  private mousemoveHandler: (e: globalThis.MouseEvent) => void;
  private mousedownHandler: (e: globalThis.MouseEvent) => void;
  private mouseupHandler: (e: globalThis.MouseEvent) => void;
  private wheelHandler: (e: WheelEvent) => void;

  constructor(canvas: HTMLCanvasElement | null, transformFn?: MousePositionTransform) {
    this.canvas = canvas;
    this.transformFn = transformFn;

    if (this.canvas) {
      this.canvas.tabIndex = 0;
    }

    this.mousemoveHandler = this.handleMouseMove.bind(this);
    this.mousedownHandler = this.handleMouseDown.bind(this);
    this.mouseupHandler = this.handleMouseUp.bind(this);
    this.wheelHandler = this.handleWheel.bind(this);

    if (this.canvas) {
      this.canvas.addEventListener('mousemove', this.mousemoveHandler);
      this.canvas.addEventListener('mousedown', this.mousedownHandler);
      window.addEventListener('mouseup', this.mouseupHandler);
      this.canvas.addEventListener('wheel', this.wheelHandler, { passive: false });
    }
  }

  setTransform(transformFn: MousePositionTransform | undefined): void {
    this.transformFn = transformFn;
  }

  private handleMouseMove(e: globalThis.MouseEvent): void {
    this.x = e.offsetX;
    this.y = e.offsetY;
    this.onMouseEvent?.(e.offsetX, e.offsetY, undefined, 'mousemove');
  }

  private handleMouseDown(e: globalThis.MouseEvent): void {
    this.buttons.add(e.button + 1);
    this.onMouseEvent?.(e.offsetX, e.offsetY, e.button, 'mousedown');
    this.canvas?.focus();
  }

  private handleMouseUp(e: globalThis.MouseEvent): void {
    this.buttons.delete(e.button + 1);
    this.onMouseEvent?.(e.offsetX, e.offsetY, e.button, 'mouseup');
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.mousemoveHandler);
      this.canvas.removeEventListener('mousedown', this.mousedownHandler);
      this.canvas.removeEventListener('wheel', this.wheelHandler);
    }
    window.removeEventListener('mouseup', this.mouseupHandler);
    this.buttons.clear();
  }

  getPosition(): Vector2 {
    if (this.transformFn) {
      return this.transformFn(this.x, this.y);
    }
    return [this.x, this.y];
  }

  isDown(button: number): boolean {
    return this.buttons.has(button);
  }

  getPressedButtons(): Set<number> {
    return new Set(this.buttons);
  }

  isPointerLocked(): boolean {
    return document.pointerLockElement !== null;
  }

  lockPointer(locked: boolean): void {
    if (!this.canvas) return;
    
    if (locked && document.pointerLockElement !== this.canvas) {
      this.canvas.requestPointerLock();
    } else if (!locked && document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }
}
