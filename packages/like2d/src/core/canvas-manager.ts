import type { CanvasConfig } from './canvas-config';
import { V2, type Vector2 } from './vector2';
import type { ResizeEvent } from './events';

export type ResizeCallback = (event: Omit<ResizeEvent, 'timestamp'>) => void;

function setCanvasSize(canvas: HTMLCanvasElement, size: Vector2): void {
  canvas.width = size[0];
  canvas.height = size[1];
}

function setCanvasDisplaySize(canvas: HTMLCanvasElement, size: Vector2): void {
  canvas.style.width = `${size[0]}px`;
  canvas.style.height = `${size[1]}px`;
}

function centerElement(el: HTMLElement): void {
  el.style.position = 'absolute';
  el.style.left = '50%';
  el.style.top = '50%';
  el.style.transform = 'translate(-50%, -50%)';
}

export class CanvasManager {
  private resizeObserver: ResizeObserver | null = null;
  private pixelArtCanvas: HTMLCanvasElement | null = null;
  private pixelArtCtx: CanvasRenderingContext2D | null = null;
  private emitResize: ResizeCallback | null = null;
  private wasFullscreen = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private container: HTMLElement,
    private ctx: CanvasRenderingContext2D,
    private config: CanvasConfig = { mode: 'native' }
  ) {
    this.resizeObserver = new ResizeObserver(() => this.applyConfig());
    this.resizeObserver.observe(this.container);

    window.addEventListener('resize', () => this.applyConfig());
    document.addEventListener('fullscreenchange', () => this.applyConfig());

    this.applyConfig();
  }

  setResizeCallback(callback: ResizeCallback): void {
    this.emitResize = callback;
  }

  setConfig(config: CanvasConfig): void {
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

  private applyConfig(): void {
    const containerSize: Vector2 = document.fullscreenElement
      ? [document.fullscreenElement.clientWidth, document.fullscreenElement.clientHeight]
      : [this.container.clientWidth, this.container.clientHeight];

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

    const displayCanvas = this.isPixelArtMode(this.config) && this.pixelArtCanvas
      ? this.pixelArtCanvas
      : this.canvas;

    const isFullscreen = !!document.fullscreenElement;

    this.emitResize?.({
      type: 'resize',
      size: containerSize,
      pixelSize: [displayCanvas.width, displayCanvas.height],
      wasFullscreen: this.wasFullscreen,
      fullscreen: isFullscreen,
    });

    this.wasFullscreen = isFullscreen;
  }

  private applyFixedMode(csize: Vector2): void {
    const { size: gameSize, pixelArt } = this.config as { mode: 'fixed'; size: Vector2; pixelArt?: boolean };
    const scale = Math.min(csize[0] / gameSize[0], csize[1] / gameSize[1]);

    if (pixelArt && scale > 1) {
      const intScale = Math.floor(scale);

      if (!this.pixelArtCanvas) {
        this.pixelArtCanvas = document.createElement('canvas');
        this.pixelArtCtx = this.pixelArtCanvas.getContext('2d');
      }

      setCanvasSize(this.pixelArtCanvas, V2.mul(gameSize, intScale));
      setCanvasSize(this.canvas, gameSize);
      this.canvas.style.display = 'none';

      const pac = this.pixelArtCanvas;
      setCanvasDisplaySize(pac, V2.mul(gameSize, scale));
      pac.style.maxWidth = '100%';
      pac.style.maxHeight = '100%';
      pac.style.imageRendering = 'auto';
      centerElement(pac);

      if (pac.parentElement !== this.container) {
        this.container.appendChild(pac);
      }
    } else {
      this.removePixelArtCanvas();
      setCanvasSize(this.canvas, gameSize);
      this.canvas.style.display = 'block';
      setCanvasDisplaySize(this.canvas, V2.mul(gameSize, scale));
      this.canvas.style.imageRendering = pixelArt ? 'pixelated' : 'auto';
      this.ctx.imageSmoothingEnabled = !pixelArt;
      centerElement(this.canvas);
    }
  }

  private applyScaledOrNativeMode(mode: 'scaled' | 'native', csize: Vector2): void {
    this.removePixelArtCanvas();

    const pixelRatio = window.devicePixelRatio || 1;
    const gameSize: Vector2 = mode === 'scaled'
      ? (this.config as { size: Vector2 }).size
      : csize;

    const canvasSize = V2.mul(csize, pixelRatio);
    setCanvasSize(this.canvas, V2.floor(canvasSize));
    setCanvasDisplaySize(this.canvas, csize);

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

  dispose(): void {
    this.resizeObserver?.disconnect();
    this.removePixelArtCanvas();
    this.pixelArtCanvas = null;
    this.pixelArtCtx = null;
    this.emitResize = null;
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

  getDisplayCanvas(): HTMLCanvasElement {
    return this.isPixelArtMode(this.config) && this.pixelArtCanvas
      ? this.pixelArtCanvas
      : this.canvas;
  }

  transformMousePosition(cssX: number, cssY: number): Vector2 {
    const displayCanvas = this.getDisplayCanvas();
    const rect = displayCanvas.getBoundingClientRect();
    const relative: Vector2 = [cssX - rect.left, cssY - rect.top];

    switch (this.config.mode) {
      case 'fixed': {
        const scale: Vector2 = [displayCanvas.width / rect.width, displayCanvas.height / rect.height];
        return V2.mul(relative, scale);
      }

      case 'scaled': {
        // Reverse the transform applied in applyScaledOrNativeMode
        const invTransform = this.ctx.getTransform().invertSelf();
        const canvasPos = V2.mul(relative, window.devicePixelRatio || 1);
        return [
          invTransform.a * canvasPos[0] + invTransform.c * canvasPos[1] + invTransform.e,
          invTransform.b * canvasPos[0] + invTransform.d * canvasPos[1] + invTransform.f,
        ];
      }

      case 'native':
      default: {
        return V2.mul(relative, window.devicePixelRatio || 1);
      }
    }
  }
}
