/**
 * @module events
 * @description All events that flow through the engine.
 */

import type { Vector2 } from './math/vector2';
import type { LikeButton } from './input';
import { MouseButton } from './input/mouse';

/** @private */
export type LikeCanvasEventMap = HTMLElementEventMap & {
  'like:mousemoved': CustomEvent<{pos: Vector2, delta: Vector2}>;
  'like:resizeCanvas': CustomEvent<{size: Vector2}>;
  'like:preDraw': CustomEvent<{}>;
  'like:postDraw': CustomEvent<{}>;
  'like:update': CustomEvent<{dt: number}>;
};

/** @private Custom canvas type that uses our event map as the single source of truth */
export interface LikeCanvasElement extends HTMLCanvasElement {
  // Overload for our custom events
  addEventListener<K extends keyof LikeCanvasEventMap>(
    type: K,
    listener: (this: LikeCanvasElement, ev: LikeCanvasEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
}

/**
 * It's a list of every possible event in like2d!
 * 
 * Not just that, but these events translate directly into `like` callbacks.
 * 
 * For example: `keypressed: [scancode: string, keycode: string]` translates to
 * setting `like.keypressed = (scancode, keycode) => { ... }`!
 * 
 */
export type EventMap = {
  /** Game initialization. Called once before the first frame. */
  load: [];

  /** Frame update. dt is delta time in seconds (time since last frame). */
  update: [dt: number];

  /** Render frame. Clear the screen and draw your game here. */
  draw: [];

  /** Canvas was resized. Used mostly in native mode, though setMode may send it too. */
  resize: [size: Vector2];

  /** Physical key pressed. scancode is the physical key, keycode is the character. */
  keypressed: [scancode: string, keycode: string];

  /** Physical key released. */
  keyreleased: [scancode: string, keycode: string];

  /** Canvas or tab gained focus. Game may resume audio/updates. */
  focus: [source: 'canvas' | 'tab'];

  /** Canvas or tab lost focus. Game may pause audio/updates. */
  blur: [source: 'canvas' | 'tab'];

  /** Mouse moved event. `pos` is absolute, `delta` is relative. */
  mousemoved: [pos: Vector2, delta: Vector2];

  /** Mouse button pressed. pos in canvas pixels. Button: 1=left, 2=middle, 3=right. */
  mousepressed: [pos: Vector2, button: MouseButton];

  /** Mouse button released. */
  mousereleased: [pos: Vector2, button: MouseButton];

  /** Gamepad button pressed. `source` is controller index, `name` is derived from a mapping on the raw `num` */
  gamepadpressed: [source: number, name: LikeButton, num: number];

  /** Gamepad button released. `source` is controller index, `name` is derived from a mapping on the raw `num` */
  gamepadreleased: [source: number, name: LikeButton, num: number];

  /**
   * Fires when a gamepad is connected.
   */
  gamepadconnected: [index: number];

  /** Fires when a gamepad is disconnected. */
  gamepaddisconnected: [index: number];

  /** Mapped action triggered. See {@link input.Input} for action mapping. */
  actionpressed: [action: string];

  /** Mapped action released. */
  actionreleased: [action: string];
};

/** @private */
export type EventType = keyof EventMap;

/** @private */
export type LikeMouseEvent = 'mousemoved' | 'mousepressed' | 'mousereleased';
/** @private */
export type LikeKeyboardEvent = 'keypressed' | 'keyreleased';
/** @private */
export type LikeGamepadEvent = 'gamepadpressed' | 'gamepadreleased' | 'gamepadconnected' | 'gamepaddisconnected';
/** @private */
export type LikeActionEvent = 'actionpressed' | 'actionreleased';

/**
 * @private
 * Generic dispatcher - each module defines its own event subset
 */
export type Dispatcher<T extends EventType> = <K extends T>(
  type: K,
  args: EventMap[K]
) => void;

/**
 * @private
 * Discriminated union of all event objects.
 */
export type LikeEvent = {
  [K in EventType]: { type: K; args: EventMap[K]; timestamp: number }
}[EventType];
