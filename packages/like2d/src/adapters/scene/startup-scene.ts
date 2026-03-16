import type { Scene } from './scene';
import type { Graphics } from '../../core/graphics';

export type StartupSceneConfig = {
  nextScene: Scene;
  draw?: (g: Graphics, canvas: HTMLCanvasElement) => void;
};

function defaultDraw(g: Graphics, canvas: HTMLCanvasElement): void {
  g.setBackgroundColor('black');
  g.print('white', 'Click to Start', [canvas.width / 2, canvas.height / 2], { align: 'center' });
}

export class StartupScene implements Scene {
  constructor(
    private graphics: Graphics,
    private config: StartupSceneConfig,
    private onStart: () => void
  ) {}

  update(): void {}

  draw(canvas: HTMLCanvasElement): void {
    (this.config.draw ?? defaultDraw)(this.graphics, canvas);
  }

  handleEvent(event: import('./scene').SceneEvent): void {
    if (event.type === 'mousepressed') this.onStart();
  }
}
