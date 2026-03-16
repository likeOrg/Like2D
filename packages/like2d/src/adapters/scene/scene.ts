import type { Vector2 } from '../../core/vector2';
import type { Like2DEvent } from '../../core/events';
import type { BoundGraphics } from '../../core/graphics';

export type Scene = {
  load?(): void;
  update?(dt: number): void;
  draw?(g: BoundGraphics): void;
  resize?(size: Vector2, pixelSize: Vector2, fullscreen: boolean): void;
  keypressed?(scancode: string, keycode: string): void;
  keyreleased?(scancode: string, keycode: string): void;
  mousepressed?(x: number, y: number, button: number): void;
  mousereleased?(x: number, y: number, button: number): void;
  gamepadpressed?(gamepadIndex: number, buttonIndex: number, buttonName: string): void;
  gamepadreleased?(gamepadIndex: number, buttonIndex: number, buttonName: string): void;
  actionpressed?(action: string): void;
  actionreleased?(action: string): void;
  handleEvent?(event: Like2DEvent): void;
};
