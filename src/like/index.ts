import { graphics } from './graphics.ts';
import { audio } from './audio.ts';
import { keyboard } from './keyboard.ts';
import { mouse } from './mouse.ts';
import { input } from './input.ts';
import { gamepad } from './gamepad.ts';
import { timer } from './timer.ts';
import { Scene } from './scene.ts';

class Like {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private currentScene: Scene | null = null;
  private isRunning = false;
  private lastTime = 0;
  private currentWidth = 800;
  private currentHeight = 600;

  graphics = graphics;
  audio = audio;
  keyboard = keyboard;
  mouse = mouse;
  input = input;
  gamepad = gamepad;
  timer = timer;

  constructor() {}

  async init(width: number = 800, height: number = 600): Promise<void> {
    this.currentWidth = width;
    this.currentHeight = height;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.border = '1px solid #ccc';

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Failed to get 2D context');
    }
    
    graphics.setContext(this.ctx);
    mouse.setCanvas(this.canvas);

    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.canvas);
    } else {
      document.body.appendChild(this.canvas);
    }

    this.setupFullscreenButton();
    this.setupInputHandlers();

    // Initialize gamepad mapping database
    await gamepad.init();
  }

  private setupFullscreenButton(): void {
    const button = document.getElementById('fullscreen-btn');
    if (button) {
      button.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }
  }

  toggleFullscreen(): void {
    if (!this.canvas) return;

    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  private setupInputHandlers(): void {
    window.addEventListener('keydown', (e) => {
      if (this.currentScene?.keypressed) {
        this.currentScene.keypressed(e.code, e.key);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.currentScene?.keyreleased) {
        this.currentScene.keyreleased(e.code, e.key);
      }
    });

    if (this.canvas) {
      this.canvas.addEventListener('mousedown', (e) => {
        if (this.currentScene?.mousepressed) {
          const rect = this.canvas!.getBoundingClientRect();
          this.currentScene.mousepressed(
            e.clientX - rect.left,
            e.clientY - rect.top,
            e.button + 1
          );
        }
      });

      this.canvas.addEventListener('mouseup', (e) => {
        if (this.currentScene?.mousereleased) {
          const rect = this.canvas!.getBoundingClientRect();
          this.currentScene.mousereleased(
            e.clientX - rect.left,
            e.clientY - rect.top,
            e.button + 1
          );
        }
      });
    }
  }

  setScene(scene: Scene): void {
    this.currentScene = scene;
    timer.resetSceneTime();

    if (this.canvas) {
      if (scene.width !== this.currentWidth || scene.height !== this.currentHeight) {
        this.currentWidth = scene.width;
        this.currentHeight = scene.height;
        this.canvas.width = scene.width;
        this.canvas.height = scene.height;
      }
    }

    if (this.isRunning && scene.load) {
      scene.load();
    }
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    if (this.currentScene?.load) {
      this.currentScene.load();
    }

    this.lastTime = performance.now();
    this.loop();
  }

  private loop(): void {
    if (!this.isRunning || !this.currentScene) return;

    const currentTime = performance.now();
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (timer.isSleeping()) {
      requestAnimationFrame(() => this.loop());
      return;
    }

    timer.update(dt);
    const { pressed, released, gamepadPressed, gamepadReleased } = input.update();

    // Trigger action callbacks
    if (this.currentScene.actionpressed) {
      for (const action of pressed) {
        this.currentScene.actionpressed(action);
      }
    }
    if (this.currentScene.actionreleased) {
      for (const action of released) {
        this.currentScene.actionreleased(action);
      }
    }

    // Trigger gamepad callbacks
    if (this.currentScene.gamepadpressed) {
      for (const { gamepadIndex, buttonIndex, buttonName } of gamepadPressed) {
        this.currentScene.gamepadpressed(gamepadIndex, buttonIndex, buttonName);
      }
    }
    if (this.currentScene.gamepadreleased) {
      for (const { gamepadIndex, buttonIndex, buttonName } of gamepadReleased) {
        this.currentScene.gamepadreleased(gamepadIndex, buttonIndex, buttonName);
      }
    }

    this.currentScene.update(dt);

    if (this.ctx) {
      graphics.clear();
      this.currentScene.draw();
    }

    requestAnimationFrame(() => this.loop());
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  getWidth(): number {
    return this.currentWidth;
  }

  getHeight(): number {
    return this.currentHeight;
  }
}

export const like = new Like();
export const love = like;
export { Source } from './audio.ts';
export type { SourceOptions } from './audio.ts';
export { timer } from './timer.ts';
export type { Scene } from './scene.ts';
export { ImageHandle } from './graphics.ts';
export type { Color, Quad, ShapeProps, DrawProps, PrintProps } from './graphics.ts';
export { input } from './input.ts';
export { gamepad, getButtonName } from './gamepad.ts';
export type { StickPosition } from './gamepad.ts';
export type { Vector2 } from './vector2.ts';
export { V2 } from './vector2.ts';
export type { Rect } from './rect.ts';
export { R } from './rect.ts';
