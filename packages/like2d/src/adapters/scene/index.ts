import {
  newState,
  bindGraphics,
  clear,
  newImage,
  type GraphicsState,
  type BoundGraphics,
  ImageHandle,
  type Color,
  type ShapeProps,
  type DrawProps,
  type PrintProps,
  type Canvas,
} from '../../core/graphics';
import { Audio } from '../../core/audio';
import { Input } from '../../core/input';
import { Timer } from '../../core/timer';
import { Keyboard } from '../../core/keyboard';
import { Mouse } from '../../core/mouse';
import { Gamepad } from '../../core/gamepad';
import { Engine } from '../../engine';
import type { Scene } from './scene';
import type { CanvasMode, PartialCanvasMode } from '../../core/canvas-config';
import { StartupScene } from './startup-scene';
import type { Like2DEvent } from '../../core/events';

export { ImageHandle, newImage };
export type { BoundGraphics as GraphicsContext, Color, ShapeProps, DrawProps, PrintProps, Canvas };
export { StartupScene };
export { Audio } from '../../core/audio';
export { Input } from '../../core/input';
export { Timer } from '../../core/timer';
export { Keyboard } from '../../core/keyboard';
export { Mouse } from '../../core/mouse';
export { Gamepad, getGPName, GP } from '../../core/gamepad';
export type { Like2DEvent as Event } from '../../core/events';
export type { Scene } from './scene';
export type { Vector2 } from '../../core/vector2';
export { Vec2 } from '../../core/vector2';
export { Rect } from '../../core/rect';
export type { CanvasMode, PartialCanvasMode } from '../../core/canvas-config';
export { calcFixedScale } from '../../core/canvas-config';

export const graphics = { newImage };

export class SceneRunner {
  private engine: Engine;
  private scene: Scene | null = null;
  private gfxState: GraphicsState;
  private gfx: BoundGraphics;

  readonly audio: Audio;
  readonly timer: Timer;
  readonly input: Input;
  readonly keyboard: Keyboard;
  readonly mouse: Mouse;
  readonly gamepad: Gamepad;

  constructor(container: HTMLElement) {
    this.engine = new Engine(container);
    this.gfxState = newState(this.engine.getContext());
    this.gfx = bindGraphics(this.gfxState);
    this.keyboard = new Keyboard();
    this.mouse = new Mouse((cssX, cssY) => this.engine.transformMousePosition(cssX, cssY));
    this.gamepad = new Gamepad();
    this.input = new Input({ keyboard: this.keyboard, mouse: this.mouse, gamepad: this.gamepad });
    this.timer = new Timer();
    this.audio = new Audio();
  }

  setMode(mode: PartialCanvasMode): void {
    this.engine.setMode(mode);
  }

  getMode(): CanvasMode {
    return this.engine.getMode();
  }

  getCanvasSize(): [number, number] {
    return this.engine.getCanvasSize();
  }

  setScene(scene: Scene) {
    this.scene = scene;
    this.scene.load?.();
  }

  async start(scene: Scene) {
    this.setScene(scene);
    this.engine.setDeps({
      input: this.input,
      timer: this.timer,
      keyboard: this.keyboard,
      mouse: this.mouse,
      gamepad: this.gamepad,
      clear: () => clear(this.gfxState),
    });
    await this.gamepad.init();
    
    this.engine.start((event: Like2DEvent) => {
      this.scene?.handleEvent?.(event);
      const handler = this.scene?.[event.type as keyof Scene] as Function | undefined;
      if (handler) {
        if (event.type === 'draw') {
          handler.apply(this.scene, [this.gfx]);
        } else {
          handler.apply(this.scene, event.args);
        }
      }
    });
  }

  dispose(): void {
    this.engine.stop();
    this.engine.dispose();
    this.scene = null;
  }
}
