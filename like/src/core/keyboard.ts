import { EngineDispatch } from "../engine";

export class Keyboard {
  private pressedScancodes = new Set<string>();
  private canvas: HTMLCanvasElement | null = null;

  // Event handler references for cleanup
  private keydownHandler: (e: globalThis.KeyboardEvent) => void;
  private keyupHandler: (e: globalThis.KeyboardEvent) => void;
  private blurHandler: () => void;

  constructor(canvas: HTMLCanvasElement | null, private dispatch: EngineDispatch) {
    this.canvas = canvas;

    this.keydownHandler = this.handleKeyDown.bind(this);
    this.keyupHandler = this.handleKeyUp.bind(this);
    this.blurHandler = this.handleBlur.bind(this);

    if (this.canvas) {
      this.canvas.addEventListener('keydown', this.keydownHandler);
      this.canvas.addEventListener('keyup', this.keyupHandler);
      this.canvas.addEventListener('blur', this.blurHandler);
    }
  }

  private handleKeyDown(e: globalThis.KeyboardEvent): void {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
    if (scrollKeys.includes(e.code)) {
      e.preventDefault();
    }

    if (e.code) {
      this.pressedScancodes.add(e.code);
    }
    this.dispatch('keypressed', [e.code, e.key]);
  }

  private handleKeyUp(e: globalThis.KeyboardEvent): void {
    if (e.code) {
      this.pressedScancodes.delete(e.code);
    }
    this.dispatch('keyreleased', [e.code, e.key]);
  }

  private handleBlur(): void {
    this.pressedScancodes.clear();
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('keydown', this.keydownHandler);
      this.canvas.removeEventListener('keyup', this.keyupHandler);
      this.canvas.removeEventListener('blur', this.blurHandler);
    }
    this.pressedScancodes.clear();
  }

  isDown(scancode: string): boolean {
    return this.pressedScancodes.has(scancode);
  }

  isAnyDown(...scancodes: string[]): boolean {
    return scancodes.some(code => this.pressedScancodes.has(code));
  }
}
