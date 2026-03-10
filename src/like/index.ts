export interface LikeCallbacks {
  load?: () => void;
  update?: (dt: number) => void;
  draw?: () => void;
  keypressed?: (key: string) => void;
  keyreleased?: (key: string) => void;
  mousepressed?: (x: number, y: number, button: number) => void;
  mousereleased?: (x: number, y: number, button: number) => void;
}

class Like {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private callbacks: LikeCallbacks = {};
  private isRunning = false;
  private lastTime = 0;
  private currentWidth = 800;
  private currentHeight = 600;

  constructor() {}

  init(width: number = 800, height: number = 600): void {
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

    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.canvas);
    } else {
      document.body.appendChild(this.canvas);
    }

    this.setupFullscreenButton();
    this.setupInputHandlers();
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
      if (this.callbacks.keypressed) {
        this.callbacks.keypressed(e.key);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.callbacks.keyreleased) {
        this.callbacks.keyreleased(e.key);
      }
    });

    if (this.canvas) {
      this.canvas.addEventListener('mousedown', (e) => {
        if (this.callbacks.mousepressed) {
          const rect = this.canvas!.getBoundingClientRect();
          this.callbacks.mousepressed(
            e.clientX - rect.left,
            e.clientY - rect.top,
            e.button + 1
          );
        }
      });

      this.canvas.addEventListener('mouseup', (e) => {
        if (this.callbacks.mousereleased) {
          const rect = this.canvas!.getBoundingClientRect();
          this.callbacks.mousereleased(
            e.clientX - rect.left,
            e.clientY - rect.top,
            e.button + 1
          );
        }
      });
    }
  }

  setCallbacks(callbacks: LikeCallbacks): void {
    this.callbacks = callbacks;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    if (this.callbacks.load) {
      this.callbacks.load();
    }

    this.lastTime = performance.now();
    this.loop();
  }

  private loop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.callbacks.update) {
      this.callbacks.update(dt);
    }

    if (this.ctx && this.callbacks.draw) {
      this.ctx.clearRect(0, 0, this.currentWidth, this.currentHeight);
      this.callbacks.draw();
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

const like = new Like();
export default like;
export const love = like;
