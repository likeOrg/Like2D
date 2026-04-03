/**
 * Need some time to load?
 *
 * Or maybe, jump cuts look like garbage. Well, they do.
 *
 * Here's your remedy:
 * ```ts
 * sceneMan.push(fadeTransition(myNextScene, enableUnload), false);
 * ```
 */

import { Scene } from "..";
import { callOwnHandlers, likeDispatch } from "../..";
import { ColorNum } from "../../graphics";

export type FadeProps = Partial<{
  color: ColorNum,
  duration: number,
}>;

/**
 *  The fade scene factory.
 *
 * @param nextF The next scene (not sceneInstance)
 * @param unload Set this rather than unload in `sceneMan.push`, which will cause early unload.`
 * @options color and duration.
 */
export const fadeTransition = (
  nextF: Scene,
  unload: boolean,
  options: FadeProps = {}
): Scene => (like, scenes) => {
  const baseColor = options.color ? options.color.slice(0,3) : [0,0,0];
  const duration = options.duration ?? 1;

  const prev = scenes.get(-2);
  const next = scenes.instantiate(nextF); // load next scene early

  let time = 0;

  return {
    // stack: [prev: -3, next: -2, this: -1]
    load() { time = 0; },
    update(dt) { time += dt },
    handleEvent(ev) {
      let elapsed = time / duration * 2;

      if (ev.type == 'draw') {
        if (elapsed < 1) {
          if (prev) likeDispatch(prev, ev);
          like.gfx.clear([...baseColor, elapsed] as any)
        } else if (elapsed < 2) {
          if (unload) {
            // if we're unloading, unload the prev scene now.
            scenes.deinstance(-2);
            unload = false;
          }
          if (next) {
            likeDispatch(next, ev)
          }
          like.gfx.clear([...baseColor, 2 - elapsed] as any)
        } else {
          scenes.set(nextF, next);
        }
      }
      callOwnHandlers(this, ev);
    }
  }
}
