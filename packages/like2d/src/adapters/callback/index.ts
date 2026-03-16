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
import type { CanvasMode, PartialCanvasMode } from '../../core/canvas-config';
import type { Like2DEvent } from '../../core/events';
import type { Vector2 } from '../../core/vector2';

export { ImageHandle, newImage };
export type { BoundGraphics as GraphicsContext, Color, ShapeProps, DrawProps, PrintProps, Canvas };
export { getGPName, GP } from '../../core/gamepad';
export { Vec2 } from '../../core/vector2';
export { Rect } from '../../core/rect';
export { calcFixedScale } from '../../core/canvas-config';
export type { CanvasMode, PartialCanvasMode } from '../../core/canvas-config';

export const graphics = { newImage };
export const audio = new Audio();
export const timer = new Timer();
export let keyboard: Keyboard;
export let mouse: Mouse;
export let gamepad: Gamepad;
export let input: Input;

let engine: Engine | null = null;
let gfxState: GraphicsState;
let gfx: BoundGraphics;

export const like = {
  load: undefined as (() => void) | undefined,
  update: undefined as ((dt: number) => void) | undefined,
  draw: undefined as ((g: BoundGraphics) => void) | undefined,
  resize: undefined as ((size: Vector2, pixelSize: Vector2, fullscreen: boolean) => void) | undefined,
  keypressed: undefined as ((scancode: string, keycode: string) => void) | undefined,
  keyreleased: undefined as ((scancode: string, keycode: string) => void) | undefined,
  mousepressed: undefined as ((x: number, y: number, button: number) => void) | undefined,
  mousereleased: undefined as ((x: number, y: number, button: number) => void) | undefined,
  gamepadpressed: undefined as ((i: number, b: number, n: string) => void) | undefined,
  gamepadreleased: undefined as ((i: number, b: number, n: string) => void) | undefined,
  actionpressed: undefined as ((action: string) => void) | undefined,
  actionreleased: undefined as ((action: string) => void) | undefined,
  handleEvent: undefined as ((event: Like2DEvent) => void) | undefined,

  setMode(mode: PartialCanvasMode): void {
    engine?.setMode(mode);
  },

  getMode(): CanvasMode | undefined {
    return engine?.getMode();
  },

  getCanvasSize(): Vector2 {
    if (!engine) return [0, 0];
    return engine.getCanvasSize();
  },

  async init(container: HTMLElement) {
    engine = new Engine(container);
    gfxState = newState(engine.getContext());
    gfx = bindGraphics(gfxState);

    keyboard = new Keyboard();
    mouse = new Mouse((cssX, cssY) => engine!.transformMousePosition(cssX, cssY));
    gamepad = new Gamepad();

    input = new Input({ keyboard, mouse, gamepad });
    engine.setDeps({ input, timer, keyboard, mouse, gamepad, clear: () => clear(gfxState) });

    await gamepad.init();
    
    engine.start((event: Like2DEvent) => {
      like.handleEvent?.(event);
      const handler = (like as any)[event.type];
      if (handler) {
        if (event.type === 'draw') {
          handler(gfx);
        } else {
          handler(...event.args);
        }
      }
    });
  },

  dispose(): void {
    engine?.stop();
    engine?.dispose();
    engine = null;
    this.load = undefined;
    this.update = undefined;
    this.draw = undefined;
    this.resize = undefined;
    this.keypressed = undefined;
    this.keyreleased = undefined;
    this.mousepressed = undefined;
    this.mousereleased = undefined;
    this.gamepadpressed = undefined;
    this.gamepadreleased = undefined;
    this.actionpressed = undefined;
    this.actionreleased = undefined;
    this.handleEvent = undefined;
  }
};

export { like as love };
