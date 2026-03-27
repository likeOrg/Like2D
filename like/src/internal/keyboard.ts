import { EngineDispatch } from "../engine";

export class KeyboardInternal {
  private pressedScancodes = new Set<string>();
  private canvas: HTMLCanvasElement | null = null;
  private abort = new AbortController();

  constructor(canvas: HTMLCanvasElement | null, private dispatch: EngineDispatch) {
    this.canvas = canvas;

    if (this.canvas) {
      this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this), { signal: this.abort.signal });
      this.canvas.addEventListener('keyup', this.handleKeyUp.bind(this), { signal: this.abort.signal });
      this.canvas.addEventListener('blur', this.handleBlur.bind(this), { signal: this.abort.signal });
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

  _dispose(): void {
    this.abort.abort();
    this.pressedScancodes.clear();
  }

  isDown(scancode: string): boolean {
    return this.pressedScancodes.has(scancode);
  }

  isAnyDown(...scancodes: string[]): boolean {
    return scancodes.some(code => this.pressedScancodes.has(code));
  }
}
