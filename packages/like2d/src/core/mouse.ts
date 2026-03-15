import type { Vector2 } from './vector2';

export type MouseEvent = {
  type: 'mousemove' | 'mousedown' | 'mouseup';
  clientX: number;
  clientY: number;
  button?: number;
};

export class Mouse {
  private x = 0;
  private y = 0;
  private buttons = new Set<number>();
  private canvas: HTMLCanvasElement;
  private onEvent?: (event: MouseEvent) => void;

  // Event handler references for cleanup
  private mousemoveHandler: (e: globalThis.MouseEvent) => void;
  private mousedownHandler: (e: globalThis.MouseEvent) => void;
  private mouseupHandler: (e: globalThis.MouseEvent) => void;
  private blurHandler: () => void;

  constructor(canvas: HTMLCanvasElement, onEvent?: (event: MouseEvent) => void) {
    this.canvas = canvas;
    this.onEvent = onEvent;

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

  private handleMouseMove(e: globalThis.MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.x = e.clientX - rect.left;
    this.y = e.clientY - rect.top;

    this.onEvent?.({
      type: 'mousemove',
      clientX: e.clientX,
      clientY: e.clientY,
    });
  }

  private handleMouseDown(e: globalThis.MouseEvent): void {
    this.buttons.add(e.button + 1);

    this.onEvent?.({
      type: 'mousedown',
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button,
    });
  }

  private handleMouseUp(e: globalThis.MouseEvent): void {
    this.buttons.delete(e.button + 1);

    this.onEvent?.({
      type: 'mouseup',
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button,
    });
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
    return [this.x, this.y];
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  isDown(button: number): boolean {
    return this.buttons.has(button);
  }

  getPressedButtons(): Set<number> {
    return new Set(this.buttons);
  }

  isVisible(): boolean {
    return document.pointerLockElement === null;
  }

  setVisible(visible: boolean, canvas?: HTMLCanvasElement): void {
    if (!visible && canvas) {
      canvas.requestPointerLock();
    } else if (visible && canvas && document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }
  }

  getRelativeMode(): boolean {
    return document.pointerLockElement !== null;
  }
}
