export class Keyboard {
  private pressedScancodes = new Set<string>();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code) {
        this.pressedScancodes.add(e.code);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code) {
        this.pressedScancodes.delete(e.code);
      }
    });

    window.addEventListener('blur', () => {
      this.pressedScancodes.clear();
    });
  }

  isDown(scancode: string): boolean {
    return this.pressedScancodes.has(scancode);
  }

  isAnyDown(...scancodes: string[]): boolean {
    return scancodes.some(code => this.pressedScancodes.has(code));
  }
}

export const keyboard = new Keyboard();
export default keyboard;
