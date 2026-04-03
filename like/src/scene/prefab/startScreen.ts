/**
 * ## Why
 *
 *  1. Because the LIKE logo looks awesome.
 *  2. Autoplay restriction; modern browers don't let you play audio until the page is clicked.
 *  3. You have to click on the game in order to send inputs, anyway.
 *  4. It's polite.
 *
 * ## Usage
 *
 * ```typescript
 * import { createLike, createStartScreen } from 'like';
 * import { createGameScene } from './game';
 *
 * // init LIKE with scenes
 * const container = document.getElementById("myGame");
 * const like = createLike(container);
 * const sceneMan = new SceneManager(like);
 *
 * // these callbacks will be ignored until the scene is clicked
 * like.update = function () { ... }
 * like.draw = function () { ... }
 *
 * // Set up the start screen
 * like.start();
 * sceneMan.push(startScreen())
 * ```
 *
 * Alternatively, copy-paste this code into your own project and modify it freely.
 *
 * ## Custom Rendering
 *
 * Pass a custom draw function to replace the default logo:
 *
 * ```typescript
 * const startup = startScreen((like) => {
 *   like.gfx.clear([0, 0, 0, 1]);
 *   like.gfx.print([1, 1, 1], 'Click to Start', [100, 100]);
 * });
 * ```
 * @module scene/prefab/startScreen
 */
import type { Scene } from '..';
import type { Like } from '../..';
import { Vec2 } from '../../math/vector2';

const LOGO = 
  'data:image/svg+xml;base64,' +
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBDcmVhdGVkIHdpdGgg' +
  'SW5rc2NhcGUgKGh0dHA6Ly93d3cuaW5rc2NhcGUub3JnLykgLS0+Cjxzdmcgd2lkdGg9IjI1Nm1t' +
  'IiBoZWlnaHQ9Ijg1bW0iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI1NiA4NSIgeG1sbnM9' +
  'Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KIDxyZWN0IHg9IjguNDk0OSIgeT0iMTQuODQx' +
  'IiB3aWR0aD0iMjM5LjEzIiBoZWlnaHQ9IjYwLjMzNyIgcnk9IjE0LjM2OSIvPgogPHBhdGggZD0i' +
  'bTQ5LjUxOSAyLjE5MzMtMjIuODQxIDIyLjg1NC0wLjAxMTkzIDAuMDExOTNhMTYuMTU5IDE2LjE2' +
  'OCAwIDAgMCAwIDIyLjg2NiAxNi4xNTkgMTYuMTY4IDAgMCAwIDIwLjUzOSAxLjkxODkgMTYuMTU5' +
  'IDE2LjE2OCAwIDAgMSAwLjAwNDggMC4zOTA1NSAxNi4xNTkgMTYuMTY4IDAgMCAxLTE2LjE1OSAx' +
  'Ni4xNjloMzYuOTM1YTE2LjE1OSAxNi4xNjggMCAwIDEtMTYuMTU5LTE2LjE2OSAxNi4xNTkgMTYu' +
  'MTY4IDAgMCAxIDAuMDA1NC0wLjM5MDU1IDE2LjE1OSAxNi4xNjggMCAwIDAgMjAuNTM5LTEuOTE5' +
  'MyAxNi4xNTkgMTYuMTY4IDAgMCAwLTQuNzZlLTQgLTIyLjg2NnoiIGZpbGw9IiNiYTJiMmIiIHN0' +
  'cm9rZT0iI2ZmY2Y0MiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIuNSIv' +
  'PgogPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZjZjQyIiBzdHJva2Utd2lkdGg9Ii41Ij4KICA8' +
  'Y2lyY2xlIHRyYW5zZm9ybT0ibWF0cml4KC0uNzA2OSAuNzA3MzEgLS43MDY5IC0uNzA3MzEgMCAw' +
  'KSIgY3g9Ii0xNy4zMTEiIGN5PSItNjguOTAzIiByPSIxNi4xNjQiLz4KICA8Y2lyY2xlIHRyYW5z' +
  'Zm9ybT0ibWF0cml4KC0uNzA2OSAuNzA3MzEgLS43MDY5IC0uNzA3MzEgMCAwKSIgY3g9Ii0xLjE0' +
  'NyIgY3k9Ii01Mi43MzkiIHI9IjE2LjE2NCIvPgogIDxlbGxpcHNlIGN4PSI2Ny45ODYiIGN5PSI1' +
  'MC4yMzQiIHJ4PSIxNi4xNTkiIHJ5PSIxNi4xNjgiLz4KICA8ZWxsaXBzZSBjeD0iMzEuMDUxIiBj' +
  'eT0iNTAuMjM0IiByeD0iMTYuMTU5IiByeT0iMTYuMTY4Ii8+CiA8L2c+CiA8ZyBmaWxsPSIjZmZj' +
  'ZjQyIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iLjUiPgogIDxwYXRoIGQ9Im04OS45MjQg' +
  'MjEuOTc5djM2LjM3NWgyOC4xMDN2LTE0Ljc3MWgtMTIuMDI5di0yMS42MDR6Ii8+CiAgPHBhdGgg' +
  'ZD0ibTEyNy45NCAyNC42Nzh2Ny42NjVoNS4wNDUzdjExLjA0NmgtNS4wNDUzdjE0Ljk2NmgyNC43' +
  'NDh2LTE0Ljk2NmgtNS4wNDh2LTExLjA0Nmg1LjA0OHYtNy42NjVoLTEyLjM3N3oiLz4KICA8cGF0' +
  'aCBkPSJtMjA2Ljg5IDIyLjA4OHYzNi4zNzVoMzMuNzM5di0xMy4xNzloLTEwLjkwOHYtNS4wNjc4' +
  'aDEwLjkwOHYtNy4xMDloLTEwLjkwOHYtNS4wNjloMTAuOTA4di01Ljk1MDR6Ii8+CiAgPHBhdGgg' +
  'ZD0ibTE2Mi43NiAxOS43N3YzOC42OTNoMTIuMjgxdi01LjA2OWgxMS41MjN2NS4wNjloMTIuMjgx' +
  'czEuMDQ4Mi0xNS4xMTUtMi4yMDEyLTE4Ljc2OGMtMy40NzA0LTMuOTAxOC02LjM3MjMtNC41MjA5' +
  'LTYuMzcyMy00LjUyMDlsOC44ODQ4LTEzLjA4N2gtMTMuNjE1bC02LjQxMDggMTMuMDIyLTQuMzQy' +
  'MyAwLjAzNjk4LThlLTMgLTE1LjM3N3oiLz4KICA8ZWxsaXBzZSBjeD0iMTMyLjk5IiBjeT0iMTYu' +
  'MTIyIiByeD0iNi4wMjIxIiByeT0iNi4xMTgyIi8+CiAgPGVsbGlwc2UgY3g9IjE0Ny40OSIgY3k9' +
  'IjE2LjEyMiIgcng9IjYuMDIyMSIgcnk9IjYuMTE4MiIvPgogPC9nPgo8L3N2Zz4K';

/** The start screen scene factory. Call this and pass it into {@link scene.SceneManager.push} */
export const startScreen = (
  onDraw?: (like: Like) => void
): Scene => (like, scenes) => {
  const logo = like.gfx.newImage(LOGO);

  like.mouse.setMode({ lock: false, scrollBlock: false });

  return {
    draw() {
      if (onDraw) {
        onDraw(like);
      } else if (logo.isReady()) {
        like.gfx.clear([0.5, 0, 0.5, 1]);
        const winSize = like.canvas.getSize();
        const scale = (winSize[0] * 0.5) / logo.size[0];
        like.gfx.draw(logo, Vec2.div(winSize, 2), {
          scale,
          origin: Vec2.div(logo.size, 2),
        });
        like.gfx.print(
          [1, 1, 0, 0.5 + 0.5 * Math.sin(like.timer.getTime() * 3)],
          "▶️ click to start ◀️",
          Vec2.mul(winSize, [0.5, 0.8]),
          { align: "center", font: "25px sans" },
        );
      }
    },

    mousepressed() {
      scenes.pop();
    }
  };
};
