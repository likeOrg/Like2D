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
