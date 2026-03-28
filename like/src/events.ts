/**
 * @module events
 * @description All events that flow through the engine.
 */

import type { Vector2 } from './math/vector2';
import type { LikeButton } from './input';

export type MouseButton = 'left' | 'middle' | 'right';

export type LikeCustomEventMap = {
  'like:mousemoved': CustomEvent<{pos: Vector2, delta: Vector2}>;
  'like:updateRenderTarget': CustomEvent<{target: HTMLCanvasElement}>;
  'like:resizeCanvas': CustomEvent<{size: Vector2}>;
  'like:preDraw': CustomEvent<{}>;
  'like:postDraw': CustomEvent<{}>;
  'like:update': CustomEvent<{dt: number}>;
};

// Helper type to extract event type from event name
export type LikeEventType<K extends keyof LikeCustomEventMap> = LikeCustomEventMap[K];

// Custom canvas type that uses our event map as the single source of truth
export interface LikeCanvasElement extends HTMLCanvasElement {
  // Overload for our custom events
  addEventListener<K extends keyof LikeCustomEventMap>(
    type: K,
    listener: (this: LikeCanvasElement, ev: LikeCustomEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  
  // Overload for standard DOM events
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: LikeCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  
  // Fallback overload for any string
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  
  // Overload for our custom events
  removeEventListener<K extends keyof LikeCustomEventMap>(
    type: K,
    listener: (this: LikeCanvasElement, ev: LikeCustomEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  
  // Overload for standard DOM events
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: LikeCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  
  // Fallback overload for any string
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  
  dispatchEvent<K extends keyof LikeCustomEventMap>(event: LikeCustomEventMap[K]): boolean;
}

/**
 * The master type will all events on it.
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

  /** Mapped action triggered. See {@link Input} for action mapping. */
  actionpressed: [action: string];

  /** Mapped action released. */
  actionreleased: [action: string];
};

export type EventType = keyof EventMap;

export type LikeMouseEvent = 'mousemoved' | 'mousepressed' | 'mousereleased';
export type LikeKeyboardEvent = 'keypressed' | 'keyreleased';
export type LikeGamepadEvent = 'gamepadpressed' | 'gamepadreleased' | 'gamepadconnected' | 'gamepaddisconnected';

/**
 * Generic dispatcher - each module defines its own event subset
 */
export type Dispatcher<T extends EventType> = <K extends T>(
  type: K,
  args: EventMap[K]
) => void;

/**
 * Discriminated union of all event objects.
 */
export type LikeEvent = {
  [K in EventType]: { type: K; args: EventMap[K]; timestamp: number }
}[EventType];
