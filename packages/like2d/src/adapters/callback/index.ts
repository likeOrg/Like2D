import { Graphics } from '../../core/graphics';
import { Audio } from '../../core/audio';
import { Input } from '../../core/input';
import { Timer } from '../../core/timer';
import { Keyboard } from '../../core/keyboard';
import { Mouse } from '../../core/mouse';
import { Gamepad } from '../../core/gamepad';
import { Engine } from '../../engine';
import type { CanvasConfig } from '../../core/canvas-config';
import type { SceneEvent } from '../scene/scene';

export { ImageHandle } from '../../core/graphics';
export { getGPName, GP } from '../../core/gamepad';
export { V2 } from '../../core/vector2';
export { R } from '../../core/rect';
export { calcFixedScale } from '../../core/canvas-config';

export let graphics: Graphics;
export const audio = new Audio();
export const timer = new Timer();
export let keyboard: Keyboard;
export let mouse: Mouse;
export let gamepad: Gamepad;
export let input: Input;

let engine: Engine | null = null;

export const like = {
  load: undefined as (() => void) | undefined,
  update: undefined as ((dt: number) => void) | undefined,
  draw: undefined as ((canvas: HTMLCanvasElement) => void) | undefined,
  keypressed: undefined as ((scancode: string, keycode: string) => void) | undefined,
  keyreleased: undefined as ((scancode: string, keycode: string) => void) | undefined,
  mousepressed: undefined as ((x: number, y: number, button: number) => void) | undefined,
  mousereleased: undefined as ((x: number, y: number, button: number) => void) | undefined,
  gamepadpressed: undefined as ((i: number, b: number, n: string) => void) | undefined,
  gamepadreleased: undefined as ((i: number, b: number, n: string) => void) | undefined,
  handleEvent: undefined as ((event: SceneEvent) => void) | undefined,

  toggleFullscreen(): void {
    engine?.toggleFullscreen();
  },

  setScaling(config: CanvasConfig): void {
    engine?.setScaling(config);
  },

  async init(container: HTMLElement) {
    engine = new Engine(container);
    graphics = new Graphics(engine.getContext());

    keyboard = new Keyboard(engine.onKey({
      onKeyPressed: (scancode: string, keycode: string) => like.keypressed?.(scancode, keycode),
      onKeyReleased: (scancode: string, keycode: string) => like.keyreleased?.(scancode, keycode)
    }));

    mouse = new Mouse(
      engine.onMouse({
        onMousePressed: (x: number, y: number, button: number) => like.mousepressed?.(x, y, button),
        onMouseReleased: (x: number, y: number, button: number) => like.mousereleased?.(x, y, button)
      }),
      (cssX, cssY) => engine!.transformMousePosition(cssX, cssY)
    );

    gamepad = new Gamepad(engine.onGamepad({
      onGamepadPressed: (i: number, b: number, n: string) => like.gamepadpressed?.(i, b, n),
      onGamepadReleased: (i: number, b: number, n: string) => like.gamepadreleased?.(i, b, n)
    }));

    input = new Input({ keyboard, mouse, gamepad });
    engine.setDeps({ graphics, input, timer, audio, keyboard, mouse, gamepad });

    // Listen for engine events
    engine.getCanvas().addEventListener('like2d:load', ((e: CustomEvent) => {
      like.load?.();
      like.handleEvent?.(e.detail);
    }) as EventListener);
    engine.getCanvas().addEventListener('like2d:actionpressed', ((e: CustomEvent) => {
      like.handleEvent?.(e.detail);
    }) as EventListener);
    engine.getCanvas().addEventListener('like2d:actionreleased', ((e: CustomEvent) => {
      like.handleEvent?.(e.detail);
    }) as EventListener);

    await gamepad.init();
    engine.start(
      (dt) => like.update?.(dt),
      () => like.draw?.(engine!.getCanvas())
    );
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
