import { Graphics } from '../../core/graphics';
import { Audio } from '../../core/audio';
import { Input } from '../../core/input';
import { Timer } from '../../core/timer';
import { Keyboard } from '../../core/keyboard';
import { Mouse } from '../../core/mouse';
import { Gamepad } from '../../core/gamepad';
import { Engine } from '../../engine';
import type { Scene } from './scene';
import type { CanvasConfig } from '../../core/canvas-config';
import { StartupScene } from './startup-scene';

export { Graphics, ImageHandle } from '../../core/graphics';
export { StartupScene };
export { Audio } from '../../core/audio';
export { Input } from '../../core/input';
export { Timer } from '../../core/timer';
export { Keyboard } from '../../core/keyboard';
export { Mouse } from '../../core/mouse';
export { Gamepad, getGPName, GP } from '../../core/gamepad';
export type { Event } from '../../core/events';
export type { Scene, SceneEvent } from './scene';
export type { Vector2 } from '../../core/vector2';
export { V2 } from '../../core/vector2';
export type { Rect } from '../../core/rect';
export { R } from '../../core/rect';
export type { CanvasConfig } from '../../core/canvas-config';
export { calcFixedScale } from '../../core/canvas-config';

export class SceneRunner {
  private engine: Engine;
  private scene: Scene | null = null;

  readonly graphics: Graphics;
  readonly audio: Audio;
  readonly timer: Timer;
  readonly input: Input;
  readonly keyboard: Keyboard;
  readonly mouse: Mouse;
  readonly gamepad: Gamepad;

  constructor(container: HTMLElement) {
    this.engine = new Engine(container);
    this.graphics = new Graphics(this.engine.getContext());

    this.keyboard = new Keyboard(this.engine.onKey({
      onKeyPressed: (scancode: string, keycode: string) => {
        this.scene?.handleEvent?.({ type: 'keypressed', scancode, keycode, timestamp: performance.now() });
      },
      onKeyReleased: (scancode: string, keycode: string) => {
        this.scene?.handleEvent?.({ type: 'keyreleased', scancode, keycode, timestamp: performance.now() });
      }
    }));

    this.mouse = new Mouse(
      this.engine.onMouse({
        onMousePressed: (x: number, y: number, button: number) => {
          this.scene?.handleEvent?.({ type: 'mousepressed', x, y, button, timestamp: performance.now() });
        },
        onMouseReleased: (x: number, y: number, button: number) => {
          this.scene?.handleEvent?.({ type: 'mousereleased', x, y, button, timestamp: performance.now() });
        }
      }),
      (cssX, cssY) => this.engine.transformMousePosition(cssX, cssY)
    );

    this.gamepad = new Gamepad(this.engine.onGamepad({
      onGamepadPressed: (gamepadIndex: number, buttonIndex: number, buttonName: string) => {
        this.scene?.handleEvent?.({ type: 'gamepadpressed', gamepadIndex, buttonIndex, buttonName, timestamp: performance.now() });
      },
      onGamepadReleased: (gamepadIndex: number, buttonIndex: number, buttonName: string) => {
        this.scene?.handleEvent?.({ type: 'gamepadreleased', gamepadIndex, buttonIndex, buttonName, timestamp: performance.now() });
      }
    }));

    this.input = new Input({ keyboard: this.keyboard, mouse: this.mouse, gamepad: this.gamepad });
    this.timer = new Timer();
    this.audio = new Audio();

    // Listen for engine events
    this.engine.getCanvas().addEventListener('like2d:load', ((e: CustomEvent) => {
      this.scene?.load?.();
      this.scene?.handleEvent?.(e.detail);
    }) as EventListener);
    this.engine.getCanvas().addEventListener('like2d:actionpressed', ((e: CustomEvent) => {
      this.scene?.handleEvent?.(e.detail);
    }) as EventListener);
    this.engine.getCanvas().addEventListener('like2d:actionreleased', ((e: CustomEvent) => {
      this.scene?.handleEvent?.(e.detail);
    }) as EventListener);
  }

  setScaling(config: CanvasConfig): void {
    this.engine.setScaling(config);
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  async start(scene: Scene) {
    this.setScene(scene);
    this.engine.setDeps({ graphics: this.graphics, input: this.input, timer: this.timer, audio: this.audio, keyboard: this.keyboard, mouse: this.mouse, gamepad: this.gamepad });
    await this.gamepad.init();
    this.engine.start(
      (dt) => this.scene?.update(dt),
      () => this.scene?.draw(this.engine.getCanvas())
    );
  }

  dispose(): void {
    this.engine.dispose();
    this.scene = null;
  }
}
