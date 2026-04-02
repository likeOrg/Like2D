/**
 * Scenes are a modular component of LÏKE based on setting `like.handleEvent`.
 * The scene system is simple and powerful, once understood.
 *
 * For devs using the built-in callback pattern, they're an easy way
 * to stack functionality on to the current project such as
 * gamepad mapping or debug overlays.
 *
 * For multi-scene games, they codify a common state-management pattern based
 * on switching between (or nesting) event handler callbacks. It's
 * a lot better than switch-casing on each handler, or manually setting/clearing
 * handler functions on each transition.
 *
 * Using scenes for your game also replaces the need to pass around global `like`
 * or `sceneManager` wherever it is used.
 *
 * ## Jump in
 *
 * Get started: {@link SceneManager}
 *
 * Make your own scene: {@link Scene}
 *
 * Check out built-in utility scenes:
 *  - {@link scene/prefab/mapGamepad}
 *  - {@link scene/prefab/startScreen}
 *
 * @module scene
 */

import { likeDispatch } from '../engine';
import { LikeEvent } from '../events';
import type { Like, LikeHandlers, } from '../like';

/**
 * ## Creating your own scenes
 *
 * Scenes are a factory function that receives `Like` and `SceneManager`
 * and returns a {@link LikeHandlers | scene instance with event handlers}.
 *
 * ## Examples
 *
 * Minimal usage:
 * ```typescript
 * const gameOver: Scene = (like, scenes) => ({
 *     titleCard: like.gfx.newImage(path);
 *     spawnTime: like.timer.getTime();
 *     draw() {
 *       // draw 'game over' over the parent scene
 *       like.gfx.draw(this.titleCard);
 *       scenes.get(-2)?.draw();
 *     }
 *     update() {
 *       // back to title screen after 3 seconds
         // (assuming title screen is using callback pattern)
 *       if (like.timer.getTime() > spawnTime + 3) {
 *         while(scenes.pop());
 *       }
 *     }
 * })
 * ```
 *
 * For configurable scenes, it is reccommended to use a function
 * that returns a Scene.
 * ```typescript
 * const myScene = (options: { speed: number }): Scene =>
 *   (like: Like, scenes: SceneManager) => {
 *
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
 *       mousepressed() {
 *         // exit this scene when user clicks
 *         scene.pop();
 *       }
 *     };
 *   };
 * ```
 *
 * Of course, a class pattern is also possible.
 * ```typescript
 * class ThingDoer extends SceneInstance {
 *   constructor(like, scenes) {...}
 *   ...
 * }
 *
 * const thingDoerScene: Scene =
 *   (like, scenes) => new ThingDoer(like, scenes);
 * ```
 * Or a configurable class:
 * ```typescript
 * class ThingDoer extends SceneInstance {
 *   constructor(like, scenes, options) {...}
 *   ...
 * }
 *
 * const thingDoerScene = (options): Scene =>
 *   (like, scenes) => new ThingDoer(like, scenes, options);
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
 * scenes.set((like, scenes) => {
 *   const scene: SceneInstance = {}
 *   scene.update = function (dt) { player.update(dt); },
 *   scene.draw = () => { player.draw(like.gfx); }
 *   return scene;
 * });
 * ```
 * ## Composing scenes
 *
 * Just like the `like` object, scenes have handleEvent on them.
 * So, you could layer them like this, for example:
 *
 * ```typescript
 * // Composing scenes lets us know about the children.
 * // This allows communication, for example:
 * type UISceneInstance = SceneInstance & {
 *   // Sending events to child scene
 *   buttonClicked(name: string): void;
 *   // Getting info from child scene
 *   getStatus(): string;
 * };
 * type UIScene = SceneEx<UISceneInstance>;
 *
 * const uiScene = (game: UIScene): Scene =>
 *   (like, scenes) => {
 *     const childScene = scenes.instantiate(game);
 *     return {
 *       handleEvent(event) {
 *           // Block mouse events in order to create a top bar.
 *           // Otherwise, propogate them.
 *           const mouseY = like.mouse.getPosition()[1];
 *           if (!event.type.startsWith('mouse') || mouseY > 100) {
 *               // Use likeDispatch so that nested handleEvent can fire,
 *               // if relevant.
 *               likeDispatch(childScene, event);
 *           }
 *           // Then, call my own callbacks.
 *           // Using likeDispatch here will result in an infinite loop.
 *           callOwnHandlers(this, event);
 *       },
 *       mousepressed(pos) {
 *           if (buttonClicked(pos)) {
 *               childScene.buttonClicked('statusbar')
 *           }
 *       },
 *       draw() {
 *           drawStatus(like, childScene.getStatus());
 *       }
 *     };
 *   }
 *
 * const gameScene = (level: number): UIScene =>
 *   (like, scene) => ({
 *     update() { ... },
 *     draw() { ... },
 *     // mandatory UI methods from interface
 *     buttonClicked(name) {
 *       doSomething(),
 *     },
 *     getStatus() {
 *       return 'all good!';
 *     }
 *   });
 *
 * like.pushScene(uiScene(gameScene);
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
 */
export type Scene = (like: Like, scenes: SceneManager) => SceneInstance;

/**
 * A helper for extending Scenes as to have known interfaces beyond
 * the generic ones. For example:
 *
 * ```ts
 * type UISceneInstance = SceneInstance & {
 *   buttonClicked(name: string) => void;
 * };
 * type UIScene = SceneEx<UISceneInstance>;
 * ```
 *
 * Now, a parent composing scene can take in UIScene rather than Scene,
 * and it has no need to cast anything.
 */
export type SceneEx<S> =
  (like: Like, scenes: SceneManager) => S & SceneInstance

/**
 * A scene instance is just an object with event handlers. It's
 * the `like` object but without the modules -- just the event handling
 * callbacks.
 *
 * See {@link Scene} for usage.
 */
export type SceneInstance = LikeHandlers & {
  /**
   * Called when a scene is started or resumed (pop after a push w/o unload).
   * Prefer to initialize in the scene constructor.
   *
   * Use case: This secene does a push without unload because we want to preserve
   * its state, but we unload a few large assets before doing the push. When
   * upper scene is popped, `load` fires so we can get those assets back.
   *
   * (Same signature as the one in {@link LikeHandlers}, just redeclared for docs)
   */
  load?: () => void;

  /**
   * Called when a scene is pushed with unload, or popped off.
   *
   * Use case: We want to clear out any native event handlers or global resource
   * allocations (LÏKE has neither, but maybe you do?) in case another scene
   * kicks this one off the stack.
   *
   * (Same signature as the one in {@link LikeHandlers}, just redeclared for docs)
   */
  quit?: () => void;
};

type SceneEntry = {
  instance: SceneInstance | undefined,
  factory: Scene,
};

/** Goofy ahh Typescript thingy to avoid excess generics */
type InstantiateReturn<F> = F extends SceneEx<infer S> ? S & SceneInstance : never;

/**
 * Scenemanager is the entry point for the LÏKE scene system.
 * Without it, there are no scene functions; it's entirely modular.
 *
 * Usage:
 * ```typescript
 * const like = createLike(document.body);
 * const sceneMan = new SceneManager(like);
 * sceneMan.push(myScene)
 * ```
 * For arbitrary scene management (non stack based),
 * just use {@link SceneManager.set} which switches out the stack top.
 *
 * For stack-based, use {@link SceneManager.push} and {@link SceneManager.pop}.
 * Note that for stack-based games, it is wise to put the first initialization in as
 * a callback-based system rather than going straight to scene. This allows
 * for easy resets / game overs.
 *
 * Note that the SceneManager sets {@link LikeHandlers.handleEvent | like.handleEvent}.
 * To get rid of scene functionality entirely, simply set it back to default.
 * ```typescript
 * like.handleEvent = undefined;
 * ```
 * Otherwise, the `SceneManager` stays allocated even if the scene stack was cleared.
 */
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
   * The calling scene will always have `dispose` called.
   *
   * Set cannot clear the current scene; for that use {@link pop}.
   *
   * @param scene is a Scene (factory pattern).
   * @param instance is an optional instance of said factory.
   */
  set(scene: Scene, instance = this.instantiate(scene)) {
    const idx = Math.max(0, this.scenes.length - 1);
    const top = this.scenes.at(-1);
    if (top) {
      likeDispatch(top.instance!, {
        type: 'quit', args: [], timestamp: this.like.timer.getTime()
      });
    }

    this.scenes[idx] = { instance, factory: scene };
  }

  /**
   * Make a scene into an instance and dispatch `load` into it.
   * Good for composition.
   */
  instantiate<T extends SceneEx<SceneInstance>>(scene: T): InstantiateReturn<T> {
    const inst = scene(this.like, this);
    likeDispatch(inst, { type: 'load', args: [], timestamp: this.like.timer.getTime() });
    return inst as InstantiateReturn<T>;
  }

  /**
   * Push a scene to the scene stack and run it.
   *
   * @param scene A function that creates and returns a scene instance, which is just event handlers.
   * @param _unload
   *
   * If a scene calls `scenes.push(nextScene, true)`, it will be unloaded
   * and re-constructed upon the parent scene calling `scenes.pop()`.
   * Good for resource-intensive
   * scenes or ones that rely heavily on their lifecycle. If you do want
   * the lower scene to know what happened in the upper while unloaded, (i.e. overworld
   * updating with a battle), consider using scene composition or
   * using localStorage to track persistent game state.
   *
   * If this scene calls `scenes.push(nextScene, false)`, it will stay loaded:
   * this means when we pop its parent, it will simply continue running. Assets
   * will stay loaded in. Further, with unload disabled the upper scene now has the ability to reference
   * the instance that called `scene.push` and call down to it in a generic way
   * via `scene.get(-2)`
   *
   * See {@link Scene} for more detail -- while stacking is good for certain
   * things, you're likely looking for Scene Composition.
   */
  push(scene: Scene, unload: boolean): void {
    if (unload) {
      const top = this.scenes.at(-1);
      if (top) {
        likeDispatch(top.instance!, {
          type: 'quit', args: [], timestamp: this.like.timer.getTime()
        });
        top.instance = undefined;
      }
    }
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
    const oldTop = this.scenes.pop();
    const top = this.scenes.at(-1);
    if (top) {
      if (!top.instance) {
        top.instance = top.factory(this.like, this);
      }
      likeDispatch(top.instance, {
        type: 'load', args: [], timestamp: this.like.timer.getTime()
      });
    }
    return oldTop?.factory;
  }


  private handleEvent(event: LikeEvent) {
    const top = this.scenes.at(-1)?.instance;
    if (top) {
      likeDispatch(top, event);
    } else {
      this.like.callOwnHandlers(event);
    }
  }
}
