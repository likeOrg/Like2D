import { Graphics } from '../../core/graphics';
import { Audio } from '../../core/audio';
import { Input } from '../../core/input';
import { Timer } from '../../core/timer';
import { Keyboard } from '../../core/keyboard';
import { Mouse } from '../../core/mouse';
import { Gamepad } from '../../core/gamepad';
import { Engine } from '../../engine';
import type { Event } from '../../core/events';
import type { Scene } from './scene';
import type { CanvasConfig } from '../../core/canvas-config';

export { Graphics, ImageHandle } from '../../core/graphics';
export { Audio } from '../../core/audio';
export { Input } from '../../core/input';
export { Timer } from '../../core/timer';
export { Keyboard } from '../../core/keyboard';
export { Mouse } from '../../core/mouse';
export { Gamepad, getGPName, GP } from '../../core/gamepad';
export type { Event } from '../../core/events';
export type { Scene } from './scene';
export type { Vector2 } from '../../core/vector2';
export { V2 } from '../../core/vector2';
export type { Rect } from '../../core/rect';
export { R } from '../../core/rect';
export type { CanvasConfig } from '../../core/canvas-config';
export { calcFixedScale } from '../../core/canvas-config';

export class SceneRunner {
  private engine: Engine;
  private currentScene: Scene | null = null;

  // Expose the instances so the Scene can use them
  readonly graphics: Graphics;
  readonly audio: Audio;
  readonly timer: Timer;
  readonly input: Input;
  readonly keyboard: Keyboard;
  readonly mouse: Mouse;
  readonly gamepad: Gamepad;

  constructor(container: HTMLElement) {
    this.engine = new Engine(container);

    const ctx = this.engine.getContext();

    this.graphics = new Graphics(ctx);
    this.keyboard = new Keyboard((event) => {
      if (event.type === 'keydown') {
        this.engine.emit({
          type: 'keypressed',
          scancode: event.scancode,
          keycode: event.keycode,
        });
      } else {
        this.engine.emit({
          type: 'keyreleased',
          scancode: event.scancode,
          keycode: event.keycode,
        });
      }
    });
    this.mouse = new Mouse(
      (event) => {
        if (event.type === 'mousedown') {
          const position = this.engine.transformMousePosition(event.clientX, event.clientY);
          this.engine.emit({
            type: 'mousepressed',
            position,
            button: (event.button ?? 0) + 1,
          });
        } else if (event.type === 'mouseup') {
          const position = this.engine.transformMousePosition(event.clientX, event.clientY);
          this.engine.emit({
            type: 'mousereleased',
            position,
            button: (event.button ?? 0) + 1,
          });
        }
      },
      (cssX, cssY) => this.engine.transformMousePosition(cssX, cssY)
    );
    this.gamepad = new Gamepad();
    this.input = new Input({ keyboard: this.keyboard, mouse: this.mouse, gamepad: this.gamepad });
    this.timer = new Timer();
    this.audio = new Audio();

    this.engine.setDeps({ 
      graphics: this.graphics, 
      input: this.input, 
      timer: this.timer, 
      audio: this.audio,
      keyboard: this.keyboard,
      mouse: this.mouse,
      gamepad: this.gamepad
    });

    this.engine.onEvent((event: Event) => {
      if (!this.currentScene) return;

      switch (event.type) {
        case 'load':
          this.currentScene.load?.();
          break;
        case 'update':
          this.currentScene.update(event.dt);
          break;
        case 'draw':
          this.currentScene.draw(this.engine.getCanvas());
          break;
        default:
          this.currentScene.handleEvent?.(event);
      }
    });
  }

  /**
   * Set canvas scaling configuration
   */
  setScaling(config: CanvasConfig): void {
    this.engine.setScaling(config);
  }

  setScene(scene: Scene) {
    this.currentScene = scene;
  }

  async start(
    scene: Scene,
    options: { showStartupScreen?: boolean; startupText?: string } = {}
  ) {
    const { showStartupScreen = true, startupText = 'Click to Start' } = options;

    this.setScene(scene);

    // Initialize gamepad
    await this.gamepad.init();

    // Start the engine with startup screen
    this.engine.start(undefined, undefined, { showStartupScreen, startupText });
  }

  dispose(): void {
    this.engine.dispose();
    this.currentScene = null;
  }
}
