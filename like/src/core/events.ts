import type { Vector2 } from './vector2';

/** Game events. All events flow through handleEvent; these are also available as individual callbacks. */
export type EventMap = {
  load: [];
  update: [dt: number];
  draw: [];
  resize: [size: Vector2, pixelSize: Vector2, fullscreen: boolean];
  keypressed: [scancode: string, keycode: string];
  keyreleased: [scancode: string, keycode: string];
  focus: [];
  blur: [];
  /** Mouse moved. relative=true means pos is delta [dx, dy] (pointer lock). */
  mousemoved: [pos: Vector2, relative: boolean];
  /** Mouse button pressed. pos in canvas pixels. Button 1 = left, 2 = middle, 3 = right. */
  mousepressed: [pos: Vector2, button: number];
  /** Mouse button released. */
  mousereleased: [pos: Vector2, button: number];
  gamepadpressed: [gamepadIndex: number, buttonIndex: number, buttonName: string];
  gamepadreleased: [gamepadIndex: number, buttonIndex: number, buttonName: string];
  actionpressed: [action: string];
  actionreleased: [action: string];
};

export type EventType = keyof EventMap;

// Event type with proper args
export type Like2DEvent = {
  [K in EventType]: { type: K; args: EventMap[K]; timestamp: number }
}[EventType];
