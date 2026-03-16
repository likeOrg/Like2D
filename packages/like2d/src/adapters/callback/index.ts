import { Graphics } from '../../core/graphics';
import { Audio } from '../../core/audio';
import { Input } from '../../core/input';
import { Timer } from '../../core/timer';
import { Keyboard } from '../../core/keyboard';
import { Mouse } from '../../core/mouse';
import { Gamepad } from '../../core/gamepad';
import { Engine } from '../../engine';
import type { Event } from '../../core/events';
import type { CanvasConfig } from '../../core/canvas-config';

// Re-export types and utilities
export { ImageHandle } from '../../core/graphics';
export { getGPName, GP } from '../../core/gamepad';
export { V2 } from '../../core/vector2';
export { R } from '../../core/rect';
export { calcFixedScale } from '../../core/canvas-config';

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
  /**
   * Draw callback. Called every frame.
   * @param canvas - The current canvas element. WARNING: Do not save this reference!
   * The canvas can change (e.g., when switching scaling modes or entering fullscreen),
   * so always use the passed canvas parameter rather than storing it.
   */
  draw: undefined as ((canvas: HTMLCanvasElement) => void) | undefined,
  keypressed: undefined as ((scancode: string, keycode: string) => void) | undefined,
  keyreleased: undefined as ((scancode: string, keycode: string) => void) | undefined,
  mousepressed: undefined as ((x: number, y: number, button: number) => void) | undefined,
  mousereleased: undefined as ((x: number, y: number, button: number) => void) | undefined,
  gamepadpressed: undefined as ((gamepadIndex: number, buttonIndex: number, buttonName: string) => void) | undefined,
  gamepadreleased: undefined as ((gamepadIndex: number, buttonIndex: number, buttonName: string) => void) | undefined,
  resize: undefined as ((size: [number, number], pixelSize: [number, number], wasFullscreen: boolean, fullscreen: boolean) => void) | undefined,
  handleEvent: undefined as ((event: Event) => void) | undefined,

  toggleFullscreen(): void {
    engine?.toggleFullscreen();
  },

  setScaling(config: CanvasConfig): void {
    engine?.setScaling(config);
  },

  async init(
    container: HTMLElement,
    options: { showStartupScreen?: boolean; startupText?: string } = {}
  ) {
    const { showStartupScreen = true, startupText = 'Click to Start' } = options;

    engine = new Engine(container);

    const ctx = engine.getContext();

    // Initialize graphics and mouse
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
    mouse = new Mouse(
      (event) => {
        if (event.type === 'mousedown') {
          const position = engine?.transformMousePosition(event.clientX, event.clientY) ?? [0, 0];
          engine?.emit({
            type: 'mousepressed',
            position,
            button: (event.button ?? 0) + 1,
          });
        } else if (event.type === 'mouseup') {
          const position = engine?.transformMousePosition(event.clientX, event.clientY) ?? [0, 0];
          engine?.emit({
            type: 'mousereleased',
            position,
            button: (event.button ?? 0) + 1,
          });
        }
      },
      (cssX, cssY) => engine?.transformMousePosition(cssX, cssY) ?? [cssX, cssY]
    );
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
          this.draw?.(engine!.getCanvas());
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
        case 'resize':
          this.resize?.(event.size, event.pixelSize, event.wasFullscreen, event.fullscreen);
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
    this.resize = undefined;
    this.handleEvent = undefined;
  }
};

export { like as love };
