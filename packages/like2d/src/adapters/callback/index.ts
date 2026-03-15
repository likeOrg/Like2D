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

// Singleton instances for Love2D-style API (initialized in init())
export let graphics: Graphics;
export const audio = new Audio();
export const timer = new Timer();
export let keyboard: Keyboard;
export let mouse: Mouse;
export const gamepad = new Gamepad();

let engine: Engine | null = null;

// Input singleton (initialized in init())
export let input: Input;

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
    const { width = 800, height = 600, showStartupScreen = true, startupText = 'Click to Start' } = options;

    engine = new Engine(container);
    engine.setSize(width, height);

    const ctx = engine.getContext();
    const canvas = engine.getCanvas();

    // Initialize graphics and mouse with canvas reference
    graphics = new Graphics(ctx);
    keyboard = new Keyboard((event) => {
      if (event.type === 'keydown') {
        engine?.emit({
          type: 'keypressed',
          scancode: event.scancode,
          keycode: event.keycode,
        });
      } else {
        engine?.emit({
          type: 'keyreleased',
          scancode: event.scancode,
          keycode: event.keycode,
        });
      }
    });
    mouse = new Mouse(canvas, (event) => {
      if (event.type === 'mousedown') {
        const rect = canvas.getBoundingClientRect();
        engine?.emit({
          type: 'mousepressed',
          position: [event.clientX - rect.left, event.clientY - rect.top],
          button: (event.button ?? 0) + 1,
        });
      } else if (event.type === 'mouseup') {
        const rect = canvas.getBoundingClientRect();
        engine?.emit({
          type: 'mousereleased',
          position: [event.clientX - rect.left, event.clientY - rect.top],
          button: (event.button ?? 0) + 1,
        });
      }
    });
    input = new Input({ keyboard, mouse, gamepad });

    engine.setDeps({ graphics, input, timer, audio, keyboard, mouse, gamepad });

    await gamepad.init();

    // Register event handlers before starting
    engine.onEvent((event: Event) => {
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

    // Start the engine with startup screen support
    engine.start(undefined, undefined, { showStartupScreen, startupText });
  },

  dispose(): void {
    engine?.dispose();
    engine = null;
    this.load = undefined;
    this.update = undefined;
    this.draw = undefined;
    this.keypressed = undefined;
    this.keyreleased = undefined;
    this.mousepressed = undefined;
    this.mousereleased = undefined;
    this.gamepadpressed = undefined;
    this.gamepadreleased = undefined;
    this.handleEvent = undefined;
  }
};

export { like as love };
