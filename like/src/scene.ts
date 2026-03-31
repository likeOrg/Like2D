import type { LikeEvent, EventMap } from './events';
import type { Like } from './like';

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
 * Also, no need to pass around a `like` object.
 * Here, `like` instead piggybacks on a closure that follows around
 * your running scene and shows up as an additional first argument
 * to every callback.
 * 
 * ## The scene stack
 * 
 * There is a stack of scenes for state management and/or overlays.
 * 
 * Use {@link LikeBase.pushScene | pushScene} and {@link LikeBase.popScene | Like.popScene} to manage the stack.
 * 
 * {@link LikeBase.setScene | setScene} Sets the top of the stack only, replacing the current scene if any.
 * 
 * ## Quick Start
 *
 * Have a scene handle all the callbacks, disabling global
 * callbacks.
 * ```typescript
 * // set up a scene
 * class MagicalGrowingRectangle implements Scene {
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
 * like.pushScene(new MagicalGrowingRectangle(), false);
 * ```
 * 
 * To get back to global callbacks, just use {@link Like.popScene | like.popScene}
 *
 * ## Scene Lifecycle
 * 
 * Works a lot like global callbacks.
 *
 * 1. `like.setScene(scene)` or `like.pushScene(scene)` is called
 * 2. Scene's `load` callback fires immediately
 * 3. `update` and `draw` begin on next frame
 * 4. Scene receives input events as they occur
 * 
 * However, make sure to configure your scene in the `load` function using {@link Mouse.setMode} and {@link LikeCanvas.setMode}.
 * 
 * Consider your action bindings and gamepad -- have they been set up yet?
 * 
 * And of course, consider firing {@link Audio.stopAll}.
 *
 * ## Composing scenes
 * 
 * Thought you'd never ask.
 * Just like the `like` object, scenes have handleEvent on them.
 * So, you could layer them like this, for example:
 * 
 * ```typescript
 * class UI implements Scene {
 *   constructor(public game: Scene) {}
 * 
 *   handleEvent(like: Like, event: LikeEvent) {
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
 * like.pushScene(new UI(new Game()), false)
 * ```
 * 
 * Composing scenes lets you filter events, layer game elements,
 * and more. Don't sleep on it.
 * 
 * The main advance of composing scenes versus the stack-overlay
 * technique is that the parent scene knows about its child.
 * Because there's a **known interface**, the two scenes
 * can communicate.
 * 
 * This makes it perfect for reusable UI,
 * level editors, debug viewers, and more.
 * 
 * ## Overlay scenes
 * 
 * You might assume that the purpose of a scene stack is
 * visual: first push the BG, then the FG, etc.
 * 
 * Actually, composing scenes (above) is a
 * better pattern for that, since it's both explicit
 * _and_ the parent can have a known interface on its child.
 * Here, the **upper** scene only knows that the
 * **lower** scene _is_ a scene.
 * 
 * That's the tradeoff. Overlay scenes are good for things
 * like pause screens or gamepad overlays. Anything where
 * the upper doesn't care _what_ the lower is, and where
 * the upper scene should be easily addable/removable.
 * 
 * Using `like.getScene(-2)`, the overlay scene can see
 * the lower scene and choose how to propagate events.
 * 
 * The only technical difference between overlay and
 * opaque is whether or not the scene we've pushed
 * on top of stays loaded.
 * 
 * @interface
 * 
 */

export type Scene = {
  [K in keyof EventMap]?: (like: Like, ...args: EventMap[K]) => void;
} & {
  handleEvent?(like: Like, event: LikeEvent): void;
};

export type SceneFactory = (like: Like) => Scene;

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
