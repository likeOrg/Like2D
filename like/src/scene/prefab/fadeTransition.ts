/**
 * Need some time to load?
 *
 * Or maybe, jump cuts look like garbage. Well, they do.
 *
 * Here's your remedy:
 * ```ts
 * scenes.push(fadeTransition(myNextScene), false)
 * ```
 */

import { Scene, SceneInstance } from "..";
import { callOwnHandlers, likeDispatch, LikeEvent } from "../..";
import { ColorNum } from "../../graphics";

/**
 *  Push this and get faded.
 */
export function fadeTransition(
  nextF: Scene,
  baseColor: ColorNum = [0,0,0],
  duration = 1
): Scene {
  return (like, scenes) => {
    const prev = scenes.get(-2);
    const next = scenes.instantiate(nextF);

    baseColor = baseColor.slice(0, 3) as any;

    const fade: SceneInstance = {}

    let instanceTime = 0;

    fade.load = () => {
      instanceTime = like.timer.getTime();
    }

    fade.handleEvent = (ev: LikeEvent) => {
      const elapsed = (like.timer.getTime() - instanceTime) / duration * 2;
      if (ev.type == 'draw') {
        if (elapsed < 1) {
          if (prev) likeDispatch(prev, ev);
          like.gfx.clear([...baseColor, elapsed] as any)
        } else if (elapsed < 2) {
          likeDispatch(next, ev)
          like.gfx.clear([...baseColor, 2 - elapsed] as any)
        } else {
          scenes.set(nextF, next);
        }
      }
      callOwnHandlers(fade, ev);
    };

    return fade;
  }
}
