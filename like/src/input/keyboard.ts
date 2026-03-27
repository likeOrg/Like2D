import type { Dispatcher } from "../events";

export class Keyboard {
  private pressedScancodes = new Set<string>();
  private canvas: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement | null, private dispatch: Dispatcher<'keypressed' | 'keyreleased'>, abort: AbortSignal) {
    this.canvas = canvas;

    if (this.canvas) {
      this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this), { signal: abort });
      this.canvas.addEventListener('keyup', this.handleKeyUp.bind(this), { signal: abort });
      this.canvas.addEventListener('blur', this.handleBlur.bind(this), { signal: abort });
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

  isDown(scancode: string): boolean {
    return this.pressedScancodes.has(scancode);
  }

  isAnyDown(...scancodes: string[]): boolean {
    return scancodes.some(code => this.pressedScancodes.has(code));
  }
}
