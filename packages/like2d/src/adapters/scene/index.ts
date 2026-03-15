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

export { Graphics } from '../../core/graphics';
export { Audio } from '../../core/audio';
export { Input } from '../../core/input';
export { Timer } from '../../core/timer';
export { Keyboard } from '../../core/keyboard';
export { Mouse } from '../../core/mouse';
export { Gamepad } from '../../core/gamepad';
export type { Event } from '../../core/events';
export type { Scene } from './scene';
export type { Vector2 } from '../../core/vector2';
export { V2 } from '../../core/vector2';
export type { Rect } from '../../core/rect';
export { R } from '../../core/rect';

export class SceneRunner {
  private engine: Engine;
  private currentScene: Scene | null = null;
  private mouse: Mouse;
  private gamepad: Gamepad;

  constructor(container: HTMLElement, width = 800, height = 600) {
    const graphics = new Graphics();
    const keyboard = new Keyboard();
    this.mouse = new Mouse();
    this.gamepad = new Gamepad();
    const input = new Input({ keyboard, mouse: this.mouse, gamepad: this.gamepad });
    const timer = new Timer();
    const audio = new Audio();

    this.engine = new Engine(container, { graphics, input, timer, audio });
    this.engine.setSize(width, height);

    // Wire up mouse to canvas for proper coordinate tracking
    this.mouse.setCanvas(this.engine.getCanvas());

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
          this.currentScene.draw();
          break;
        default:
          this.currentScene.handleEvent?.(event);
      }
    });
  }

  setScene(scene: Scene) {
    this.currentScene = scene;
    if (scene.width && scene.height) {
      this.engine.setSize(scene.width, scene.height);
    }
  }

  async start(scene: Scene) {
    this.setScene(scene);

    // Initialize gamepad
    await this.gamepad.init();

    this.engine.start();
  }
}