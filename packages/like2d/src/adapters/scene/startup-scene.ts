import type { Scene } from './scene';
import type { Graphics } from '../../core/graphics';
import { ImageHandle } from '../../core/graphics';
import { Vec2, type Vector2 } from '../../core/vector2';
import { Rect } from '../../core/rect';

export type StartupSceneConfig = {
  nextScene: Scene;
  draw?: (g: Graphics, canvas: HTMLCanvasElement) => void;
  logo?: ImageHandle;
};

// Base64-encoded Like2D logo (logo-banner-optimized.svg)
const LOGO_DATA_URI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB3aWR0aD0iMzAwbW0iIGhlaWdodD0iMTA1bW0iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDMwMCAxMDUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8cmVjdCB4PSIxMCIgeT0iMTEuMjMiIHdpZHRoPSIyODAiIGhlaWdodD0iODMuNTQ0IiBmaWxsPSIjZTQ4MDgwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIvPgogPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cmVjdCB4PSI5Ny40ODQiIHk9IjExLjIzIiB3aWR0aD0iNTIuNTE2IiBoZWlnaHQ9IjQ2LjIzNyIvPgogIDxyZWN0IHg9IjE1MCIgeT0iMTEuMjMiIHdpZHRoPSIzNS4wMTEiIGhlaWdodD0iNDYuMjM3Ii8+CiAgPHJlY3QgeD0iMTg1LjAxIiB5PSIxMS4yMyIgd2lkdGg9IjUyLjUxNiIgaGVpZ2h0PSI0Ni4yMzciLz4KICA8cmVjdCB4PSIyMzcuNTMiIHk9IjExLjIzIiB3aWR0aD0iNTIuNTE2IiBoZWlnaHQ9IjQ2LjIzNyIvPgogPC9nPgogPGc+CiAgPHJlY3QgeD0iMTMyLjQ5IiB5PSIxMS4yMyIgd2lkdGg9IjE3LjUwNSIgaGVpZ2h0PSIyNy40NjEiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjI5LjMwMiIgd2lkdGg9IjguNzUyNyIgaGVpZ2h0PSIxOC43NzYiLz4KICA8cmVjdCB4PSIxNzYuMjYiIHk9IjI5LjMwMiIgd2lkdGg9IjguNzUyNyIgaGVpZ2h0PSIxOC43NzYiLz4KIDwvZz4KIDxyZWN0IHg9IjE1MCIgeT0iMTEuMjMiIHdpZHRoPSIxNy41MDUiIGhlaWdodD0iOC42ODQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KIDxyZWN0IHg9IjE2Ny41MSIgeT0iMTEuMjMiIHdpZHRoPSIxNy41MDUiIGhlaWdodD0iOC42ODQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KIDxnPgogIDxwYXRoIGQ9Im0yMzcuNTMgMzguNjkxLTE3LjUwNS05LjM4ODIgMTcuNTA1LTE4LjA3M3oiLz4KICA8cmVjdCB4PSIyMDIuODgiIHk9IjQ4LjA3OSIgd2lkdGg9IjE2Ljc3MiIgaGVpZ2h0PSI5LjM4ODIiLz4KICA8cmVjdCB4PSIyNzIuNTQiIHk9IjIwLjI2NiIgd2lkdGg9IjE2Ljc3MiIgaGVpZ2h0PSI5LjM4ODIiLz4KICA8cmVjdCB4PSIyNzIuNTQiIHk9IjM4LjY5MSIgd2lkdGg9IjE2Ljc3MiIgaGVpZ2h0PSI5LjM4ODIiLz4KICA8cGF0aCBkPSJtMjAyLjUyIDI5LjMwMiAwLjM2Njg1LTE4LjA3M2gxNy4xMzl6Ii8+CiA8L2c+CiA8cGF0aCBkPSJtNjQuMDc4IDEuMDA0Mi0zMy4zNzUgMzMuMzc1LTAuMDE3NDMgMC4wMTc0YTIzLjYxMiAyMy42MTIgMCAwIDAgMCAzMy4zOTIgMjMuNjEyIDIzLjYxMiAwIDAgMCAzMC4wMTIgMi44MDIyIDIzLjYxMiAyMy42MTIgMCAwIDEgN2UtMyAwLjU3MDM0IDIzLjYxMiAyMy42MTIgMCAwIDEtMjMuNjEyIDIzLjYxMmg1My45N2EyMy42MTIgMjMuNjEyIDAgMCAxLTIzLjYxMS0yMy42MTIgMjMuNjEyIDIzLjYxMiAwIDAgMSA3ZS0zIC0wLjU3MDM0IDIzLjYxMiAyMy42MTIgMCAwIDAgMzAuMDEyLTIuODAyOSAyMy42MTIgMjMuNjEyIDAgMCAwLTYuODhlLTQgLTMzLjM5MnoiIGZpbGw9IiM4MGMzZTQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9Ii41Ij4KICA8Y2lyY2xlIHRyYW5zZm9ybT0icm90YXRlKDEzNSkiIGN4PSItMjAuOTg4IiBjeT0iLTkzLjI0MyIgcj0iMjMuNjEyIi8+CiAgPGNpcmNsZSB0cmFuc2Zvcm09InJvdGF0ZSgxMzUpIiBjeD0iMi42MjM4IiBjeT0iLTY5LjYzMiIgcj0iMjMuNjEyIi8+CiAgPGNpcmNsZSBjeD0iOTEuMDYyIiBjeT0iNzEuMTYxIiByPSIyMy42MTIiLz4KICA8Y2lyY2xlIGN4PSIzNy4wOTMiIGN5PSI3MS4xNjEiIHI9IjIzLjYxMiIvPgogPC9nPgo8L3N2Zz4K';

const LOGO_WIDTH_RATIO = 0.5; // Logo takes up 50% of canvas width

function defaultDraw(g: Graphics, canvas: HTMLCanvasElement, logo: ImageHandle): void {
  const size: Vector2 = [canvas.width, canvas.height];
  const center = Vec2.mul(size, 0.5);
  const bottomY = size[1] * 0.85;

  if (logo.isReady()) {
    const imgSize = logo.size;
    // Scale to fit 50% of canvas width, ignoring height constraint
    const scale = (size[0] * LOGO_WIDTH_RATIO) / imgSize[0];
    const drawSize = Vec2.mul(imgSize, scale);
    const rect = Rect.fromCenter(center, drawSize);
    
    g.draw(logo, Rect.position(rect), { scale: [scale, scale] });
  }

  g.print('white', 'Click to Start', [0, bottomY], { 
    align: 'center', 
    limit: size[0], 
    font: '32px sans-serif' 
  });
}

export class StartupScene implements Scene {
  private started = false;
  private logo: ImageHandle;

  constructor(
    private graphics: Graphics,
    private config: StartupSceneConfig,
    private setScene: (scene: Scene) => void
  ) {
    this.graphics.setBackgroundColor('black');
    this.logo = config.logo ?? graphics.newImage(LOGO_DATA_URI);
  }

  draw(canvas: HTMLCanvasElement): void {
    (this.config.draw ?? defaultDraw)(this.graphics, canvas, this.logo);
  }

  mousepressed(_x: number, _y: number, _button: number): void {
    if (!this.started) {
      this.started = true;
      this.setScene(this.config.nextScene);
    }
  }
}
