import type { Vector2 } from './vector2';

export class Mouse {
  private x = 0;
  private y = 0;
  private buttons = new Set<number>();
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.setupEventListeners();
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  private setupEventListeners(): void {
    window.addEventListener('mousemove', (e) => {
      if (this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this.x = e.clientX - rect.left;
        this.y = e.clientY - rect.top;
      } else {
        this.x = e.clientX;
        this.y = e.clientY;
      }
    });

    window.addEventListener('mousedown', (e) => {
      this.buttons.add(e.button + 1);
    });

    window.addEventListener('mouseup', (e) => {
      this.buttons.delete(e.button + 1);
    });

    window.addEventListener('blur', () => {
      this.buttons.clear();
    });
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

  setVisible(visible: boolean): void {
    if (!visible && this.canvas) {
      this.canvas.requestPointerLock();
    } else if (visible && document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  getRelativeMode(): boolean {
    return document.pointerLockElement !== null;
  }
}
