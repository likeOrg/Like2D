/**
 * @module like2d
 * @description A cozy web-native 2D game framework.
 *
 * See main like/README.md file an for overview of Like2D.
 */

import { Engine } from './engine';
import type { Like2DEvent, EventMap, EventType } from './core/events';
import type { Like } from './core/like';

export type { Like } from './core/like';
export type { Like2DEvent, EventType, EventMap } from './core/events';
export type { CanvasSize, CanvasModeOptions as CanvasModeFlags } from './core/canvas';
export type { Color, ShapeProps, DrawProps, PrintProps } from './core/graphics';
export { ImageHandle } from './core/graphics';
export type { Source, SourceOptions } from './core/audio';
export type { Scene } from './scene';
export { StartupScene } from './scenes/startup';
export { type LikeButton } from './core/gamepad';

type Callback<K extends EventType> = (...args: EventMap[K]) => void;

type Callbacks = {
  [K in EventType]?: Callback<K>;
};

/**
 * The main Like instance.
 * Use this object much how you would the `love` object in Love2D.
 * This is the interface returned by {@link createLike}.
 *
 * Assigns callbacks to handle events. See {@link EventMap} for all available events.
 * 
 * Don't forget to call `await start()` when you're ready,
 * and `dispose()` if you're done with it.
 */
export type LikeWithCallbacks = Like & Callbacks & {
  /**
   * Start the game loop. Call this only once.
   * @returns Promise that resolves when the engine is ready
   */
  start(): Promise<void>;

  /**
   * Clears out event listeners to avoid memory leaks.
   */
  dispose(): void;
};

/**
 * Create a new Like2D game instance attached to a DOM container.
 *
 * This is the entry point for all Like2D games. It creates a canvas element,
 * initializes all subsystems (graphics, audio, input), and returns an object
 * where you can assign game callbacks.
 *
 * ### How to bind callbacks
 * 
 * ```ts
 * export const like = createLike();
 * 
 * like.start();
 * 
 * like.draw = () => { like.gfx.clear('yellow') }
 * 
 * like.update = function (dt: number) {
 *   if (dt === Math.random()) {
 *     console.log("You just won the Powerball!")
 *   }
 * }
 * ```
 *
 * @param container - The HTML element to attach the game canvas to.
 *                    Must be in the DOM.
 * @returns A {@link LikeWithCallbacks} instance ready for callback assignment
 * 
 */
export function createLike(container: HTMLElement): LikeWithCallbacks {
  const engine = new Engine(container);
  const callbacks: Callbacks = {};

  const handleEvent = (event: Like2DEvent): void => {
    const cb = callbacks[event.type];
    if (cb) (cb as Function)(...event.args);
  };

  return Object.assign(engine.like, callbacks, {
    start: () => engine.start(handleEvent),
    dispose: () => engine.dispose(),
  }) as LikeWithCallbacks;
}
