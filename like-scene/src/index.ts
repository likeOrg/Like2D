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
 *  - {@link scene/prefab/fadeTransition}
 *
 * @module scene
 */

import { likeDispatch } from '@like2d/like';
import type { LikeEvent, Like, LikeHandlers } from '@like2d/like';

/** {@include creating-scenes.md} */
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
 * @interface
 */
export type SceneInstance = LikeHandlers & {
  /**
   * Called when a scene is started or resumed (pop after a push w/o unload).
   *
   * Use case: This secene is both resource-intensive and state-intensive.
   * It pushes without unload because we want to preserve
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

/** Goofy ahh Typescript thingy to avoid excess generics @private */
export type InstantiateReturn<F> = F extends SceneEx<infer S> ? S & SceneInstance : never;

/**
 * SceneManager is the entry point for the LÏKE scene module.
 *
 * {@include using-scenes.md}
 */
export class SceneManager {
  private scenes: SceneEntry[] = [];

  constructor (private like: Like, options?: { nobind?: boolean }) {
    if (!options?.nobind) {
        like.handleEvent = this.handleEvent.bind(this);
    }
  }

  /**
   * Get the current scene, or a specific index.
   *
   * Uses `Array.at` under the hood, so -1 is the
   * top scene, -2 is the lower scene, etc.
   *
   * During instantiation, Scene.get(-1) is undefined.
   */
  get(pos = -1): SceneInstance | undefined {
    return this.scenes.at(pos)?.instance;
  }

  /**
   * Set the current scene at the top of the scene stack.
   * If the stack is empty, push it onto the stack.
   *
   * The new scene is instantiated after the old one is
   * quit and removed from the stack.
   *
   * Set cannot clear the current scene; for that use {@link pop}.
   *
   * @param scene is a Scene
   * @param instance is an optional preloaded instance.
   */
  set(scene: Scene, instance?: SceneInstance) {
    const idx = Math.max(0, this.scenes.length - 1);
    this.deinstance(-1);
    this.scenes[idx] = { instance, factory: scene };
    this.scenes[idx].instance = instance ?? this.instantiate(scene);
  }

  /**
   * Push a scene to the scene stack and run it.
   *
   * @param scene A function that creates and returns a scene instance, which is just event handlers.
   *
   * @param unload Whether to unload (and later reload) the calling scene.
   *
   * See {@link Scene} for more detail -- while stacking is good for certain
   * things, you're likely looking for Scene Composition.
   *
   */
  push(scene: Scene, unload: boolean): void {
    if (unload) {
      this.deinstance(-1);
    }
    const entry: SceneEntry = { instance: undefined, factory: scene };
    this.scenes.push(entry);
    entry.instance = this.instantiate(entry.factory);
  }

  /**
   * Pop the current scene off the stack, calling `quit` on it and
   * dropping the instance reference.
   *
   * If the lower scene had called `pushScene` with the second arg (unload)
   * set to true, it will be re-loaded. Otherwise it will continue where it
   * left off. Either way its `load` fill fire.
   *
   * To clear the stack, just run:
   * ```ts
   * while (like.popScene());
   * ```
   */
  pop(): Scene | undefined {
    this.deinstance(-1);
    const oldTop = this.scenes.pop();
    const top = this.scenes.at(-1);
    if (top) {
      if (!top.instance) {
        top.instance = this.instantiate(top.factory);
      }
    } else {
      likeDispatch(this.like, { type: 'load', args: [] })
    }
    return oldTop?.factory;
  }

  /**
   * Make a scene into an instance and dispatch `load` into it.
   */
  instantiate<T extends SceneEx<SceneInstance>>(scene: T): InstantiateReturn<T> {
    const inst = scene(this.like, this);
    likeDispatch(inst, { type: 'load', args: [] });
    return inst as InstantiateReturn<T>;
  }

  /**
   * Unload a lower scene. Only use this if the lower scene requested to be
   * unloaded, or if you're certain that you want to reload the lower
   * completely. Otherwise, this can easily lose state or break functions.
   */
  deinstance(pos: number) {
    const scene = this.scenes.at(pos);
    if (scene) {
      if (scene.instance) {
        likeDispatch(scene.instance, { type: 'quit', args: [] })
      }
      scene.instance = undefined;
    }
  }

  debugDraw() {
    const g = this.like.gfx;
    for (const si in this.scenes) {
      const i = Number(si);
      g.print('fill', 'white', `${si}: hasInstance: ${!!this.scenes[i].instance}`, [50, i*20+20]);
    }
  }

  handleEvent(event: LikeEvent) {
    const top = this.scenes.at(-1);
    if (top) {
      if (!top.instance) {
        throw new Error("expected top scene to be loaded");
      }
      likeDispatch(top.instance, event);
    } else {
      this.like.callOwnHandlers(event);
    }
    //if (event.type == 'draw') this.debugDraw();
  }
}
