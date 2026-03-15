import type { Vector2 } from './vector2';

export type BaseEvent = {
  type: string;
  timestamp: number;
  [key: string]: any;
};

export type LoadEvent = BaseEvent & {
  type: 'load';
};

export type UpdateEvent = BaseEvent & {
  type: 'update';
  dt: number;
};

export type DrawEvent = BaseEvent & {
  type: 'draw';
};

export type KeyPressedEvent = BaseEvent & {
  type: 'keypressed';
  scancode: string;
  keycode: string;
};

export type KeyReleasedEvent = BaseEvent & {
  type: 'keyreleased';
  scancode: string;
  keycode: string;
};

export type MousePressedEvent = BaseEvent & {
  type: 'mousepressed';
  position: Vector2;
  button: number;
};

export type MouseReleasedEvent = BaseEvent & {
  type: 'mousereleased';
  position: Vector2;
  button: number;
};

export type ActionPressedEvent = BaseEvent & {
  type: 'actionpressed';
  action: string;
};

export type ActionReleasedEvent = BaseEvent & {
  type: 'actionreleased';
  action: string;
};

export type GamepadPressedEvent = BaseEvent & {
  type: 'gamepadpressed';
  gamepadIndex: number;
  buttonIndex: number;
  buttonName: string;
};

export type GamepadReleasedEvent = BaseEvent & {
  type: 'gamepadreleased';
  gamepadIndex: number;
  buttonIndex: number;
  buttonName: string;
};

export type Event =
  | LoadEvent
  | UpdateEvent
  | DrawEvent
  | KeyPressedEvent
  | KeyReleasedEvent
  | MousePressedEvent
  | MouseReleasedEvent
  | ActionPressedEvent
  | ActionReleasedEvent
  | GamepadPressedEvent
  | GamepadReleasedEvent
  | BaseEvent;