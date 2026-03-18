import type { Vector2 } from './vector2';

export type MousePositionTransform = (offsetX: number, offsetY: number) => Vector2;
export type MouseMoveHandler = (pos: Vector2, relative: boolean) => void;
export type MouseButtonHandler = (pos: Vector2, button: number) => void;

/**
 * Mouse input handling. Bound to canvas. Emits relative movement when pointer locked.
 * Buttons: 1 = left, 2 = middle, 3 = right.
 */
export class Mouse {
  private x = 0;
  private y = 0;
  private buttons = new Set<number>();
  private cursorVisible = true;
  public onMouseMove?: MouseMoveHandler;
  public onMouseDown?: MouseButtonHandler;
  public onMouseUp?: MouseButtonHandler;
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
    if (this.isPointerLocked()) {
      // When locked, emit relative movement
      this.onMouseMove?.([e.movementX, e.movementY], true);
    } else {
      // Normal mode: track position and emit absolute coords
      this.x = e.offsetX;
      this.y = e.offsetY;
      const pos = this.getPosition();
      this.onMouseMove?.(pos, false);
    }
  }

  private handleMouseDown(e: globalThis.MouseEvent): void {
    this.buttons.add(e.button + 1);
    const pos: Vector2 = this.transformFn ? this.transformFn(e.offsetX, e.offsetY) : [e.offsetX, e.offsetY];
    this.onMouseDown?.(pos, e.button + 1);
    this.canvas?.focus();
  }

  private handleMouseUp(e: globalThis.MouseEvent): void {
    this.buttons.delete(e.button + 1);
    const pos: Vector2 = this.transformFn ? this.transformFn(e.offsetX, e.offsetY) : [e.offsetX, e.offsetY];
    this.onMouseUp?.(pos, e.button + 1);
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

  /** Mouse position in canvas pixels. */
  getPosition(): Vector2 {
    if (this.transformFn) {
      return this.transformFn(this.x, this.y);
    }
    return [this.x, this.y];
  }

  /** Check if button is held. Button 1 = left, 2 = middle, 3 = right. */
  isDown(button: number): boolean {
    return this.buttons.has(button);
  }

  /** All currently held buttons. */
  getPressedButtons(): Set<number> {
    return new Set(this.buttons);
  }

  /** True when pointer is locked to canvas. */
  isPointerLocked(): boolean {
    return document.pointerLockElement !== null;
  }

  /** Lock or unlock pointer. When locked, mousemoved emits relative deltas. */
  lockPointer(locked: boolean): void {
    if (!this.canvas) return;

    if (locked && document.pointerLockElement !== this.canvas) {
      this.canvas.requestPointerLock();
    } else if (!locked && document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  /** Show or hide cursor. Unlike pointer lock, cursor can still leave canvas. */
  showCursor(visible: boolean): void {
    this.cursorVisible = visible;
    if (this.canvas) {
      this.canvas.style.cursor = visible ? 'auto' : 'none';
    }
  }

  /** Current cursor visibility state. */
  isCursorVisible(): boolean {
    return this.cursorVisible;
  }
}
