/**
 *  @module scene
 */

import { likeDispatch } from '../engine';
import { LikeEvent } from '../events';
import type { LikeEventHandlers, Like, } from '../like';

/**
 * A scene instance is just an object with event handlers. It's kind of like
 * the `like` object but without the modules -- just the event handling
 * callbacks.
 *
 * ## Creating scenes
 *
 * Scenes are created via a factory function that receives the `like` object
 * and returns a scene instance with event handlers.
 *
 * ```typescript
 * const myScene = (options: { speed: number }): Scene =>
 *   (like: Like, scenes: SceneManager) => {
 *     // Resources loaded here are available via closure
 *     const playerImage = like.gfx.newImage('player.png');
 *     let x = 0, y = 0;
 *
 *     return {
 *       update(dt) {
 *         x += options.speed * dt;
 *       },
 *       draw() {
 *         like.gfx.draw(playerImage, [x, y]);
 *       }
 *     };
 *   };
 *
 * const sceneMan = new SceneManager(like);
 * sceneMan.push(myScene({ speed: 100 }))
 * ```
 *
 * Note that the SceneManager sets {@link Like.handleEvent | like.handleEvent}.
 * To get rid of scene functionality entirely, simply set it back to default.
 * ```typescript
 * like.handleEvent = like.callOwnHandlers;
 * ```
 *
 * ## Converting from Callbacks
 *
 * When converting from global callbacks to a scene:
 *
 * ```typescript
 * // Before (callbacks)
 * like.update = function(dt) { player.update(dt); }
 * like.draw = () => { player.draw(like.gfx); }
 *
 * // After (scene)
 * like.setScene((like) => {
 *   const scene = {}
 *     like.update function (dt) => { player.update(dt); },
 *     like.draw = () => { player.draw(like.gfx); }
 *   };
 *   return scene;
 * });
 * ```
 *
 * ## The Scene Stack
 *
 * There is a stack of scenes for state management and/or overlays.
 *
 * Use {@link LikeBase.pushScene | pushScene} and {@link LikeBase.popScene | Like.popScene} to manage the stack.
 *
 * {@link LikeBase.setScene | setScene} Sets the top of the stack only, replacing the current scene if any.
 *
 * ## Composing scenes
 *
 * Just like the `like` object, scenes have handleEvent on them.
 * So, you could layer them like this, for example:
 *
 * ```typescript
 * const createUI = (game: Scene): SceneFactory => (like) => ({
 *   handleEvent(event) {
 *     // Block mouse events in order to create a top bar.
 *     const mouseY = like.mouse.getPosition()[1];
 *     if (!event.type.startsWith('mouse') || mouseY > 100) {
 *       sceneDispatch(game, event);
 *     }
 *     // Then, call my own callbacks.
 *     callSceneHandlers(this, like, event);
 *   },
 *   draw() {
 *     // Draw UI on top
 *   }
 * });
 *
 * const createGame = (): SceneFactory => (like) => ({ ... });
 *
 * like.pushScene(createUI(createGame()));
 * ```
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
export type SceneInstance = LikeEventHandlers;

/**
 * Just called "Scene" for simplicity's sake,
 * this is actually a generator for a {@link SceneInstance}.
 */
export type Scene = (like: Like, scenes: SceneManager) => SceneInstance;

type SceneEntry = {
  instance: SceneInstance,
  factory: Scene,
};

export class SceneManager {
  private scenes: SceneEntry[] = [];

  constructor (private like: Like) {
    like.handleEvent = this.handleEvent.bind(this);
  }

  /**
   * Get the current scene, or a specific index.
   *
   * Uses `Array.at` under the hood, so -1 is the
   * top scene, -2 is the parent scene, etc.
   */
  get(pos = -1): SceneInstance | undefined {
    return this.scenes.at(pos)?.instance;
  }

  /**
   * Set the current scene at the top of the scene stack.
   * If the stack is empty, push it onto the stack.
   *
   * Equivalent to `popScene` + `pushScene`.
   *
   * Use {@link index.Like | popScene} to clear away the current scene,
   * and to possibly revert to callback mode.
   *
   * The scene is created via a factory function. See {@link pushScene} for details.
   */
  set(scene: Scene) {
    const idx = Math.max(0, this.scenes.length - 1);
    this.scenes[idx] = { instance: scene(this.like, this), factory: scene };
  }

  /**
   * Push a scene to the scene stack and run it.
   *
   * If a scene calls `pushScene(nextScene, true)`, it will be unloaded
   * and re-constructed upon the parent scene calling `like.popScene'.
   * Good for resource-intensive
   * scenes or ones that rely heavily on their lifecycle. If you do want
   * the lower scene to know what happened in the upper, (i.e. overworld
   * updating with a battle), consider using scene composition or
   * using localStorage to track persistent game state.
   *
   * If this scene calls `like.pushScene(nextScene, false)`, it will stay loaded:
   * this means when we pop its parent, it will simply continue running. Assets
   * will stay loaded in.
   *
   * Further, with unload=false the upper scene now has the ability to reference
   * the instance that called `pushScene` and call down to it in a generic way
   * via `like.getScene(-2)`
   *
   * See {@link Scene} for more detail -- while stacking is good for certain
   * things, you're likely looking for Scene Composition.
   *
   * @param scene A function that creates and returns a scene instance, which is just event handlers.
   * @param unload Set to true, and the current scene (before pushing) will unload.
   */
  push(scene: Scene, _unload: boolean): void {
    this.scenes.push({ instance: scene(this.like, this), factory: scene });
  }

  /**
   * Pop the current scene off the stack.
   *
   * If the lower scene had called `pushScene` with the second arg (unload)
   * set to true, it will be re-loaded. Otherwise it will continue where it
   * left off.
   *
   * To clear the stack, just run:
   * ```ts
   * while (like.popScene());
   * ```
   */
  pop(): Scene | undefined {
    const top = this.scenes.pop();
    return top?.factory;
  }


  handleEvent(event: LikeEvent) {
    const top = this.scenes.at(-1)?.instance;
    if (top) {
      likeDispatch(top, event);
    } else {
      this.like.callOwnHandlers(event);
    }
  }
}
