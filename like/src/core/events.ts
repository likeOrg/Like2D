/**
 * @module events
 * @description All events that flow through the engine.
 *
 * ## Overview
 *
 * LIKE uses events at its core.
 * These pass through the engine and down to your
 * callbacks or scene.
 * 
 * This module is the single source of truth for what
 * events are possible.
 * 
 * Use it as a reference.
 *
 * @see {@link EventMap} lists every event.
 * @see {@link Scene} for implementing callbacks in a class
 * @see {@link LikeWithCallbacks} for global callback assignment
 * @see {@link Input} for action mapping
 */

import type { Vector2 } from '../math/vector2';
import { LikeButton } from './gamepad-mapping';

export type MouseButton = 'left' | 'middle' | 'right';

declare global {
  interface HTMLElementEventMap {
    ['like:mousemoved']: CustomEvent<{pos: Vector2, delta: Vector2, renderSize: Vector2}>;
    ['like:updateRenderTarget']: CustomEvent<{target: HTMLCanvasElement}>;
  }
}

/**
 * The master type will all events on it.
 * 
 * Each frame:
 * 1. `update(dt)` - Game logic with delta time in seconds
 * 2. `draw` - Render the frame
 *
 * Input events fire immediately when they occur:
 * - `keypressed`/`keyreleased` - Keyboard input
 * - `mousemoved`/`mousepressed`/`mousereleased` - Mouse input
 * - `gamepadpressed`/`gamepadreleased` - Controller input
 * - `actionpressed`/`actionreleased` - Mapped actions (see {@link Input})
 *
 * Window events:
 * - `focus`/`blur` - Tab/window focus changes
 * - `resize` - Canvas size changes
 *
 * Lifecycle:
 * - `load` - Called once when the game starts
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

  /** Mouse moved. pos is absolute, delta is relative.. */
  mousemoved: [pos: Vector2, delta: Vector2];

  /** Mouse button pressed. pos in canvas pixels. Button: 1=left, 2=middle, 3=right. */
  mousepressed: [pos: Vector2, button: MouseButton];

  /** Mouse button released. */
  mousereleased: [pos: Vector2, button: MouseButton];

  /** Gamepad button pressed. index is controller number (0-3). */
  gamepadpressed: [source: number, num: number, name: LikeButton];

  /** Gamepad button released. */
  gamepadreleased: [source: number, num: number, name: LikeButton];

  /** Mapped action triggered. See {@link Input} for action mapping. */
  actionpressed: [action: string];

  /** Mapped action released. */
  actionreleased: [action: string];
};

export type EventType = keyof EventMap;

/**
 * Discriminated union of all event objects.
 * Use this with `handleEvent` to receive all events generically.
 *
 * @example
 * ```typescript
 * handleEvent(like: Like, event: Like2DEvent) {
 *   if (event.type === 'update') {
 *     const dt = event.args[0];
 *   }
 * }
 * ```
 */
export type LikeEvent = {
  [K in EventType]: { type: K; args: EventMap[K]; timestamp: number }
}[EventType];
