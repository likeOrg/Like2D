/**
 * @module scene
 * @description A helpful callback / state management layer, plus utility scenes.
 * 
 */

import type { LikeEvent, EventMap, EventType } from './core/events';
import type { Like } from './core/like';

/**
 * An interface for creating scenes.
 * 
 * ## Why Scenes?
 * 
 * For any game with more than one scene, we have to either:
 *  - switch-case on game state in every single callback
 *  - rebind all of the callbacks ourselves
 *  - wrap handleEvent (hint: that's what this does)
 * 
 * Also, some no need to pass around a `like` object.
 * Here, `like` instead piggybacks on a closure that follows around
 * your running scene and shows up as an additional first argument
 * to every callback.
 * 
 * ## Quick Start
 *
 * Have a scene handle all the callbacks, disabling global
 * callbacks.
 * ```typescript
 * // set up a scene
 * class MagicalGrowingRectangle extends Scene {
 *   rectangleSize = 10;
 *   constructor() {}
 * 
 *   keypressed(_like: Like) {
 *     this.rectangleSize += 10;
 *   }
 * 
 *   draw(like: Like) {
 *     like.gfx.rectangle('fill', 'green',
 *       [10, 10, this.rectangleSize, this.rectangleSize])
 *   }
 * }
 * 
 * like.setScene(new MagicalGrowingRectangle());
 * ```
 * 
 * To get back to global callbacks, just use `like.handleEvent = undefined`
 *
 * ## Scene Lifecycle
 * 
 * Works a lot like global callbacks.
 *
 * 1. `like.setScene(scene)` is called
 * 2. Scene's `load` callback fires immediately
 * 3. `update` and `draw` begin on next frame
 * 4. Scene receives input events as they occur
 *
 * ## Composing scenes
 * 
 * Thought you'd never ask.
 * Just like the `like` object, scenes have handleEvent on them.
 * So, you could layer them like this, for example:
 * 
 * ```typescript
 * class UI implements Scene {
 *   constructor(public game: Game) {}
 * 
 *   handleEvent(like: Like, event: Like2DEvent) {
 *     // Block mouse events in order to create a top bar. 
 *     const mouseY = like.mouse.getPosition()[1];
 *     if (!event.type.startsWith('mouse') || mouseY > 100) {
 *       sceneDispatch(this.game, like, event);
 *     } 
 * 
 *     // Then, call my own callbacks.
 *     // By calling it here, the UI draws on top.
 *     callSceneHandlers(this, like, event);
 *   }
 *   ...
 * }
 * 
 * class Game implements Scene {
 *   ...
 * }
 * 
 * like.setScene(new UI(new Game()))
 * ```
 * 
 * Composing scenes lets you filter events, layer game elements,
 * and more. Don't sleep on it.
 */

export type Scene = {
  [K in EventType]?: EventHandler<K>;
} & {
  handleEvent?(like: Like, event: LikeEvent): void;
};

type EventHandler<K extends EventType> = (like: Like, ...args: EventMap[K]) => void;

/**
 * Used to call a scene's own handlers like `update` or `draw`,
 * typically at the end of handleEvent
 * after modifying the event stream or composing sub-scenes.
 */
export const callSceneHandlers = (scene: Scene, like: Like, event: LikeEvent) => {
  if (event.type in scene) {
    (scene as any)[event.type](like, ...event.args);
  }
}

/**
 * Used to call sub scenes while respecting potential `handleEvent` within them.
 * The main scene is similar to a sub-scene of the root (like) object in this
 * regard.
 */
export const sceneDispatch = (scene: Scene, like: Like, event: LikeEvent) => {
    if (scene.handleEvent) {
      scene.handleEvent(like, event);
    } else {
      callSceneHandlers(scene, like, event);
    }
}
