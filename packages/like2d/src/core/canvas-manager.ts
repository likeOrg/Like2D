import type { CanvasConfig } from './canvas-config';
import { V2, type Vector2 } from './vector2';

export class CanvasManager {
  private resizeObserver: ResizeObserver | null = null;
  private pixelArtCanvas: HTMLCanvasElement | null = null;
  private pixelArtCtx: CanvasRenderingContext2D | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private container: HTMLElement,
    private ctx: CanvasRenderingContext2D,
    private config: CanvasConfig = { mode: 'native' }
  ) {
    this.setupResizeObserver();
    this.applyConfig();
  }

  setConfig(config: CanvasConfig): void {
    if (this.isPixelArtMode(this.config) && !this.isPixelArtMode(config)) {
      this.removePixelArtCanvas();
    }
    this.config = config;
    this.applyConfig();
  }

  getConfig(): CanvasConfig {
    return { ...this.config };
  }

  private isPixelArtMode(config: CanvasConfig): boolean {
    return config.mode === 'fixed' && !!(config as { pixelArt?: boolean }).pixelArt;
  }

  private removePixelArtCanvas(): void {
    if (this.pixelArtCanvas?.parentElement) {
      this.pixelArtCanvas.parentElement.removeChild(this.pixelArtCanvas);
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => this.applyConfig());
    this.resizeObserver.observe(this.container);
  }

  private getScale(container: Vector2, game: Vector2): number {
    return Math.min(container[0] / game[0], container[1] / game[1]);
  }

  private applyConfig(): void {
    // Use screen size when in fullscreen, otherwise use container size
    const containerSize: Vector2 = document.fullscreenElement
      ? [window.screen.width, window.screen.height]
      : [this.container.getBoundingClientRect().width, this.container.getBoundingClientRect().height];

    switch (this.config.mode) {
      case 'fixed':
        this.applyFixedMode(containerSize);
        break;
      case 'scaled':
        this.applyScaledOrNativeMode('scaled', containerSize);
        break;
      case 'native':
        this.applyScaledOrNativeMode('native', containerSize);
        break;
    }
  }

  private applyFixedMode(csize: Vector2): void {
    const { size: gameSize, pixelArt } = this.config as { mode: 'fixed'; size: Vector2; pixelArt?: boolean };
    const scale = this.getScale(csize, gameSize);

    if (pixelArt && scale > 1) {
      const intScale = Math.floor(scale);
      const cssScale = scale / intScale;

      if (!this.pixelArtCanvas) {
        this.pixelArtCanvas = document.createElement('canvas');
        this.pixelArtCtx = this.pixelArtCanvas.getContext('2d');
      }

      const pacSize = V2.mul(gameSize, intScale);
      this.pixelArtCanvas.width = pacSize[0];
      this.pixelArtCanvas.height = pacSize[1];

      this.canvas.width = gameSize[0];
      this.canvas.height = gameSize[1];
      this.canvas.style.display = 'none';

      const pac = this.pixelArtCanvas;
      let displaySize = V2.mul(pacSize, cssScale);
      
      // Ensure it fits within container (prevents overflow/cropping)
      displaySize = V2.min(displaySize, csize);
      
      pac.style.width = `${displaySize[0]}px`;
      pac.style.height = `${displaySize[1]}px`;
      pac.style.maxWidth = '100%';
      pac.style.maxHeight = '100%';
      pac.style.imageRendering = 'auto';
      this.centerElement(pac);

      if (pac.parentElement !== this.container) {
        this.container.appendChild(pac);
      }
    } else {
      this.removePixelArtCanvas();
      this.canvas.width = gameSize[0];
      this.canvas.height = gameSize[1];
      this.canvas.style.display = 'block';
      const displaySize = V2.mul(gameSize, scale);
      this.canvas.style.width = `${displaySize[0]}px`;
      this.canvas.style.height = `${displaySize[1]}px`;
      this.canvas.style.imageRendering = pixelArt ? 'pixelated' : 'auto';
      this.ctx.imageSmoothingEnabled = !pixelArt;
      this.centerElement(this.canvas);
    }
  }

  private applyScaledOrNativeMode(mode: 'scaled' | 'native', csize: Vector2): void {
    this.removePixelArtCanvas();
    
    const pixelRatio = window.devicePixelRatio || 1;
    const gameSize: Vector2 = mode === 'scaled'
      ? (this.config as { size: Vector2 }).size
      : csize;

    const canvasSize = V2.mul(csize, pixelRatio);
    this.canvas.width = Math.floor(canvasSize[0]);
    this.canvas.height = Math.floor(canvasSize[1]);
    this.canvas.style.width = `${csize[0]}px`;
    this.canvas.style.height = `${csize[1]}px`;

    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.transform = 'none';
    this.canvas.style.margin = '0';
    this.canvas.style.display = 'block';
    this.canvas.style.imageRendering = 'auto';

    if (mode === 'scaled') {
      const scale = Math.min(this.canvas.width / gameSize[0], this.canvas.height / gameSize[1]);
      const scaledGame = V2.mul(gameSize, scale);
      const offset = V2.mul(V2.sub([this.canvas.width, this.canvas.height], scaledGame), 0.5);
      this.ctx.setTransform(scale, 0, 0, scale, offset[0], offset[1]);
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  private centerElement(el: HTMLElement): void {
    el.style.position = 'absolute';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.transform = 'translate(-50%, -50%)';
  }

  dispose(): void {
    this.resizeObserver?.disconnect();
    this.removePixelArtCanvas();
    this.pixelArtCanvas = null;
    this.pixelArtCtx = null;
  }

  present(): void {
    if (!this.isPixelArtMode(this.config) || !this.pixelArtCanvas || !this.pixelArtCtx) {
      return;
    }

    this.pixelArtCtx.imageSmoothingEnabled = false;
    this.pixelArtCtx.drawImage(
      this.canvas,
      0, 0, this.canvas.width, this.canvas.height,
      0, 0, this.pixelArtCanvas.width, this.pixelArtCanvas.height
    );
  }
}
