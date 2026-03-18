import type { Vector2 } from './vector2';

export type MousePositionTransform = (clientX: number, clientY: number) => Vector2;

export class Mouse {
  private x = 0;
  private y = 0;
  private buttons = new Set<number>();
  public onMouseEvent?: (clientX: number, clientY: number, button: number | undefined, type: 'mousemove' | 'mousedown' | 'mouseup') => void;
  private transformFn?: MousePositionTransform;
  private canvas: HTMLCanvasElement | null = null;

  // Event handler references for cleanup
  private mousemoveHandler: (e: globalThis.MouseEvent) => void;
  private mousedownHandler: (e: globalThis.MouseEvent) => void;
  private mouseupHandler: (e: globalThis.MouseEvent) => void;
  private blurHandler: () => void;

  constructor(canvas: HTMLCanvasElement | null, transformFn?: MousePositionTransform) {
    this.canvas = canvas;
    this.transformFn = transformFn;

    // Bind event handlers
    this.mousemoveHandler = this.handleMouseMove.bind(this);
    this.mousedownHandler = this.handleMouseDown.bind(this);
    this.mouseupHandler = this.handleMouseUp.bind(this);
    this.blurHandler = this.handleBlur.bind(this);

    // Register event listeners
    window.addEventListener('mousemove', this.mousemoveHandler);
    window.addEventListener('mousedown', this.mousedownHandler);
    window.addEventListener('mouseup', this.mouseupHandler);
    window.addEventListener('blur', this.blurHandler);
  }

  setTransform(transformFn: MousePositionTransform | undefined): void {
    this.transformFn = transformFn;
  }

  private handleMouseMove(e: globalThis.MouseEvent): void {
    // Store raw CSS coordinates - transformation to game coordinates
    // should be done by the consumer using engine.transformMousePosition()
    this.x = e.clientX;
    this.y = e.clientY;

    this.onMouseEvent?.(e.clientX, e.clientY, undefined, 'mousemove');
  }

  private handleMouseDown(e: globalThis.MouseEvent): void {
    this.buttons.add(e.button + 1);
    this.onMouseEvent?.(e.clientX, e.clientY, e.button, 'mousedown');
  }

  private handleMouseUp(e: globalThis.MouseEvent): void {
    this.buttons.delete(e.button + 1);
    this.onMouseEvent?.(e.clientX, e.clientY, e.button, 'mouseup');
  }

  private handleBlur(): void {
    this.buttons.clear();
  }

  dispose(): void {
    window.removeEventListener('mousemove', this.mousemoveHandler);
    window.removeEventListener('mousedown', this.mousedownHandler);
    window.removeEventListener('mouseup', this.mouseupHandler);
    window.removeEventListener('blur', this.blurHandler);
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
