import { Graphics } from '../../core/graphics';
import { Audio } from '../../core/audio';
import { Input } from '../../core/input';
import { Timer } from '../../core/timer';
import { Keyboard } from '../../core/keyboard';
import { Mouse } from '../../core/mouse';
import { Gamepad } from '../../core/gamepad';
import { Engine } from '../../engine';
import type { Event } from '../../core/events';

// Re-export types and utilities
export { ImageHandle } from '../../core/graphics';
export { getButtonName } from '../../core/gamepad';
export { V2 } from '../../core/vector2';
export { R } from '../../core/rect';

// Export singleton instances for Love2D-style API
export const graphics = new Graphics();
export const audio = new Audio();
export const timer = new Timer();
export const keyboard = new Keyboard();
export const mouse = new Mouse();
export const gamepad = new Gamepad();

let engine: Engine | null = null;

// Input singleton (depends on keyboard, mouse, gamepad)
export const input = new Input({ keyboard, mouse, gamepad });

export const like = {
  load: undefined as (() => void) | undefined,
  update: undefined as ((dt: number) => void) | undefined,
  draw: undefined as (() => void) | undefined,
  keypressed: undefined as ((scancode: string, keycode: string) => void) | undefined,
  keyreleased: undefined as ((scancode: string, keycode: string) => void) | undefined,
  mousepressed: undefined as ((x: number, y: number, button: number) => void) | undefined,
  mousereleased: undefined as ((x: number, y: number, button: number) => void) | undefined,
  gamepadpressed: undefined as ((gamepadIndex: number, buttonIndex: number, buttonName: string) => void) | undefined,
  gamepadreleased: undefined as ((gamepadIndex: number, buttonIndex: number, buttonName: string) => void) | undefined,
  handleEvent: undefined as ((event: Event) => void) | undefined,

  toggleFullscreen(): void {
    engine?.toggleFullscreen();
  },

  async init(
    container: HTMLElement,
    options: { width?: number; height?: number; showStartupScreen?: boolean; startupText?: string } = {}
  ) {
    const { width = 800, height = 600, showStartupScreen = false, startupText = 'Click to Start' } = options;

    engine = new Engine(container, { graphics, input, timer, audio });
    engine.setSize(width, height);

    // Wire up mouse to canvas for proper coordinate tracking
    mouse.setCanvas(engine.getCanvas());

    await gamepad.init();

    const startGame = () => {
      engine!.onEvent((event: Event) => {
        switch (event.type) {
          case 'load':
            this.load?.();
            break;
          case 'update':
            this.update?.(event.dt);
            break;
          case 'draw':
            this.draw?.();
            break;
          case 'keypressed':
            this.keypressed?.(event.scancode, event.keycode);
            break;
          case 'keyreleased':
            this.keyreleased?.(event.scancode, event.keycode);
            break;
          case 'mousepressed':
            this.mousepressed?.(event.position[0], event.position[1], event.button);
            break;
          case 'mousereleased':
            this.mousereleased?.(event.position[0], event.position[1], event.button);
            break;
          case 'gamepadpressed':
            this.gamepadpressed?.(event.gamepadIndex, event.buttonIndex, event.buttonName);
            break;
          case 'gamepadreleased':
            this.gamepadreleased?.(event.gamepadIndex, event.buttonIndex, event.buttonName);
            break;
          default:
            // All other events (including custom events) go to handleEvent
            this.handleEvent?.(event);
            break;
        }
      });

      engine!.start();
    };

    if (showStartupScreen) {
      const canvas = engine.getCanvas();
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        font-family: sans-serif;
        font-size: 24px;
        cursor: pointer;
        z-index: 1000;
      `;
      overlay.textContent = startupText;
      canvas.parentElement!.appendChild(overlay);

      overlay.addEventListener('click', () => {
        overlay.remove();
        startGame();
      });
    } else {
      startGame();
    }
  }
};

export { like as love };