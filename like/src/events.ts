/**
 * @module events
 * @description All events that flow through the engine.
 */

import type { LikeButton } from './input/';
import type { MouseButton } from './input/mouse';
import type { Vector2 } from './math/vector2';

export type LikeEventHandlers = {
  /** Game initialization. Called once before the first frame. */
  load: () => void;

  /**
   * Game deinit. Called when like is disposed.
   *
   * Use case: you're using native event handlers or global resource
   * allocations that need to be cleared out to avoid memory leaks,
   * regardless of what called like.dispose().
   */
  quit: () => void;

  /** Frame update. dt is delta time in seconds (time since last frame). */
  update: (dt: number) => void;

  /** Render frame. Clear the screen and draw your game here. */
  draw: () => void;

  /** Canvas was resized. Used mostly in native mode, though setMode may send it too. */
  resize: (size: Vector2) => void;

  /** Physical key pressed. scancode is the physical key, keycode is the character. */
  keypressed: (scancode: string, keycode: string) => void;

  /** Physical key released. */
  keyreleased: (scancode: string, keycode: string) => void;

  /** Canvas or tab gained focus. Game may resume audio/updates. */
  focus: (source: 'canvas' | 'tab') => void;

  /** Canvas or tab lost focus. Game may pause audio/updates. */
  blur: (source: 'canvas' | 'tab') => void;

  /** Mouse moved event. `pos` is absolute, `delta` is relative. */
  mousemoved: (pos: Vector2, delta: Vector2) => void;

  /** Mouse button pressed. pos in canvas pixels. Button: 1=left, 2=middle, 3=right. */
  mousepressed: (pos: Vector2, button: MouseButton) => void;

  /** Mouse button released. */
  mousereleased: (pos: Vector2, button: MouseButton) => void;

  /** Gamepad button pressed. `source` is controller index, `name` is derived from a mapping on the raw `num` */
  gamepadpressed: (source: number, name: LikeButton, num: number) => void;

  /** Gamepad button released. `source` is controller index, `name` is derived from a mapping on the raw `num` */
  gamepadreleased: (source: number, name: LikeButton, num: number) => void;

  /** Fires when a gamepad is connected. */
  gamepadconnected: (index: number) => void;

  /** Fires when a gamepad is disconnected. */
  gamepaddisconnected: (index: number) => void;

  /** Mapped action triggered. See {@link input.Input} for action mapping. */
  actionpressed: (action: string) => void;

  /** Mapped action released. */
  actionreleased: (action: string) => void;
};

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
export type Dispatcher<K extends keyof LikeEventHandlers> = (
  type: K,
  args: Parameters<LikeEventHandlers[K]>
) => void;

/**
 * This is what gets passed into {@link LikeHandlers.handleEvent} functions, which are
 * used to filter event streams.
 *
 * Example:
 * ```ts
 * { type: 'mousemoved', args: [ [100, 250], [-5, -5] ], timestamp: 2.56 }
 * ```
 *
 * {@link LikeHandlers} has the full list.
 */
export type LikeEvent = {
  [K in keyof LikeEventHandlers]: { type: K; args: Parameters<LikeEventHandlers[K]>; timestamp: number }
}[keyof LikeEventHandlers];

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
