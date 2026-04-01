import type { LikeEventHandlers, Like, } from './like';

/**
 * A scene is just an object with event handlers.
 * 
 * ## Factory Pattern
 * 
 * Scenes are created via a factory function that receives the `like` object
 * and returns a scene with event handlers. This eliminates the need to pass
 * `like` as the first argument to every handler, and allows proper resource
 * lifecycle management through closures.
 * 
 * ```typescript
 * const createMyScene = (options: { speed: number }): SceneFactory => 
 *   (like: Like) => {
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
 * like.pushScene(createMyScene({ speed: 100 }));
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

export type Scene = (like: Like) => SceneInstance;

export type SceneInstance = LikeEventHandlers;
