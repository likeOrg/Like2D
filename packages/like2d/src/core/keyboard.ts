export type KeyEvent = {
  type: 'keydown' | 'keyup';
  scancode: string;
  keycode: string;
};

export class Keyboard {
  private pressedScancodes = new Set<string>();
  private onEvent?: (event: KeyEvent) => void;

  // Event handler references for cleanup
  private keydownHandler: (e: globalThis.KeyboardEvent) => void;
  private keyupHandler: (e: globalThis.KeyboardEvent) => void;
  private blurHandler: () => void;

  constructor(onEvent?: (event: KeyEvent) => void) {
    this.onEvent = onEvent;

    // Bind event handlers
    this.keydownHandler = this.handleKeyDown.bind(this);
    this.keyupHandler = this.handleKeyUp.bind(this);
    this.blurHandler = this.handleBlur.bind(this);

    // Register event listeners
    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
    window.addEventListener('blur', this.blurHandler);
  }

  private handleKeyDown(e: globalThis.KeyboardEvent): void {
    if (e.code) {
      this.pressedScancodes.add(e.code);
    }
    this.onEvent?.({
      type: 'keydown',
      scancode: e.code,
      keycode: e.key,
    });
  }

  private handleKeyUp(e: globalThis.KeyboardEvent): void {
    if (e.code) {
      this.pressedScancodes.delete(e.code);
    }
    this.onEvent?.({
      type: 'keyup',
      scancode: e.code,
      keycode: e.key,
    });
  }

  private handleBlur(): void {
    this.pressedScancodes.clear();
  }

  dispose(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
    window.removeEventListener('blur', this.blurHandler);
    this.pressedScancodes.clear();
  }

  isDown(scancode: string): boolean {
    return this.pressedScancodes.has(scancode);
  }

  isAnyDown(...scancodes: string[]): boolean {
    return scancodes.some(code => this.pressedScancodes.has(code));
  }
}
