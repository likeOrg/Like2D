
import { type Scene } from '../scene';
import type { ImageHandle } from '../core/graphics';
import { Vec2 } from '../math/vector2';
import { Like } from '..';

const LOGO = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBDcmVhdGVkIHdpdGggSW5rc2NhcGUgKGh0dHA6Ly93d3cuaW5rc2NhcGUub3JnLykgLS0+Cjxzdmcgd2lkdGg9IjMwMG1tIiBoZWlnaHQ9IjEwNW1tIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMDAgMTA1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogPHJlY3QgeD0iMTAiIHk9IjExLjIzIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjgzLjU0NCIgZmlsbD0iI2U0ODA4MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiLz4KIDxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CiAgPHJlY3QgeD0iOTcuNDg0IiB5PSIxMS4yMyIgd2lkdGg9IjUyLjUxNiIgaGVpZ2h0PSI0Ni4yMzciLz4KICA8cmVjdCB4PSIxNTAiIHk9IjExLjIzIiB3aWR0aD0iMzUuMDExIiBoZWlnaHQ9IjQ2LjIzNyIvPgogIDxyZWN0IHg9IjE4NS4wMSIgeT0iMTEuMjMiIHdpZHRoPSI1Mi41MTYiIGhlaWdodD0iNDYuMjM3Ii8+CiAgPHJlY3QgeD0iMjM3LjUzIiB5PSIxMS4yMyIgd2lkdGg9IjUyLjUxNiIgaGVpZ2h0PSI0Ni4yMzciLz4KIDwvZz4KIDxnPgogIDxyZWN0IHg9IjEzMi40OSIgeT0iMTEuMjMiIHdpZHRoPSIxNy41MDUiIGhlaWdodD0iMjcuNDYxIi8+CiAgPHJlY3QgeD0iMTUwIiB5PSIyOS4zMDIiIHdpZHRoPSI4Ljc1MjciIGhlaWdodD0iMTguNzc2Ii8+CiAgPHJlY3QgeD0iMTc2LjI2IiB5PSIyOS4zMDIiIHdpZHRoPSI4Ljc1MjciIGhlaWdodD0iMTguNzc2Ii8+CiA8L2c+CiA8cmVjdCB4PSIxNTAiIHk9IjExLjIzIiB3aWR0aD0iMTcuNTA1IiBoZWlnaHQ9IjguNjg0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiA8cmVjdCB4PSIxNjcuNTEiIHk9IjExLjIzIiB3aWR0aD0iMTcuNTA1IiBoZWlnaHQ9IjguNjg0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiA8Zz4KICA8cGF0aCBkPSJtMjM3LjUzIDM4LjY5MS0xNy41MDUtOS4zODgyIDE3LjUwNS0xOC4wNzN6Ii8+CiAgPHJlY3QgeD0iMjAyLjg4IiB5PSI0OC4wNzkiIHdpZHRoPSIxNi43NzIiIGhlaWdodD0iOS4zODgyIi8+CiAgPHJlY3QgeD0iMjcyLjU0IiB5PSIyMC4yNjYiIHdpZHRoPSIxNi43NzIiIGhlaWdodD0iOS4zODgyIi8+CiAgPHJlY3QgeD0iMjcyLjU0IiB5PSIzOC42OTEiIHdpZHRoPSIxNi43NzIiIGhlaWdodD0iOS4zODgyIi8+CiAgPHBhdGggZD0ibTIwMi41MiAyOS4zMDIgMC4zNjY4NS0xOC4wNzNoMTcuMTM5eiIvPgogPC9nPgogPHBhdGggZD0ibTY0LjA3OCAxLjAwNDItMzMuMzc1IDMzLjM3NS0wLjAxNzQzIDAuMDE3NGEyMy42MTIgMjMuNjEyIDAgMCAwIDAgMzMuMzkyIDIzLjYxMiAyMy42MTIgMCAwIDAgMzAuMDEyIDIuODAyMiAyMy42MTIgMjMuNjEyIDAgMCAxIDdlLTMgMC41NzAzNCAyMy42MTIgMjMuNjEyIDAgMCAxLTIzLjYxMiAyMy42MTJoNTMuOTdhMjMuNjEyIDIzLjYxMiAwIDAgMS0yMy42MTEtMjMuNjEyIDIzLjYxMiAyMy42MTIgMCAwIDEgN2UtMyAtMC41NzAzNCAyMy42MTIgMjMuNjEyIDAgMCAwIDMwLjAxMi0yLjgwMjkgMjMuNjEyIDIzLjYxMiAwIDAgMC02Ljg4ZS00IC0zMy4zOTJ6IiBmaWxsPSIjODBjM2U0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KIDxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIuNSI+CiAgPGNpcmNsZSB0cmFuc2Zvcm09InJvdGF0ZSgxMzUpIiBjeD0iLTIwLjk4OCIgY3k9Ii05My4yNDMiIHI9IjIzLjYxMiIvPgogIDxjaXJjbGUgdHJhbnNmb3JtPSJyb3RhdGUoMTM1KSIgY3g9IjIuNjIzOCIgY3k9Ii02OS42MzIiIHI9IjIzLjYxMiIvPgogIDxjaXJjbGUgY3g9IjkxLjA2MiIgY3k9IjcxLjE2MSIgcj0iMjMuNjEyIi8+CiAgPGNpcmNsZSBjeD0iMzcuMDkzIiBjeT0iNzEuMTYxIiByPSIyMy42MTIiLz4KIDwvZz4KPC9zdmc+Cg=='

/**
 * ## Why
 * 
 *  1. Because the LIKE logo looks awesome.
 *  2. Autoplay restriction, doesn't let you play audio until the page is clicked.
 *  3. You have to click on the game in order to send inputs, anyway. 
 *  4. It's polite.
 * 
 * ## Usage
 *
 * ```typescript
 * import { createLike, StartScreen } from 'like';
 * import { GameScene } from './game';
 *
 * const container = document.getElementById("myGame");
 * const like = createLike(container);
 * 
 * // these callbacks will be ignored until the scene is clicked
 * like.update = function () { ... }
 * like.draw = function () { ... }
 *
 * // Set up the start screen
 * like.setScene(new StartScreen())
 * like.start();
 * ```
 * 
 * Alternatively, copy-paste this code into your own project and modify it freely.
 * Update imports:
 * 
 * ```ts
 * import { type Scene } from 'like/scene';
 * import type { ImageHandle } from 'like/core/graphics';
 * import { Vec2 } from 'like/math/vector2';
 * import { Like } from 'like';
 * ```
 *
 * ## Custom Rendering
 *
 * Pass a custom draw function to replace the default logo:
 *
 * ```typescript
 * const startup = new StartupScene(gameScene, (like) => {
 *   like.gfx.clear([0, 0, 0, 1]);
 *   like.gfx.print([1, 1, 1], 'Click to Start', [100, 100]);
 * });
 * ```
 */
export class StartScreen implements Scene {
  private logo!: ImageHandle;

  constructor(
    private next: Scene,
    private onDraw?: (like: Like) => void
  ) { }

  load(like: Like): void {
    this.logo = like.gfx.newImage(LOGO);
  }

  draw(like: Like): void {
    if (this.onDraw) {
      this.onDraw(like);
    } else if (this.logo.isReady()) {
      like.gfx.clear([0.05, 0.05, 0.08, 1]);
      const winSize = like.canvas.getSize();
      const scale = (winSize[0] * 0.5) / this.logo.size[0];
      like.gfx.draw(this.logo, Vec2.div(winSize, 2), { scale, origin: Vec2.div(this.logo.size, 2) });
    }
  }

  mousepressed(like: Like): void {
    like.setScene(this.next);
  }
}
