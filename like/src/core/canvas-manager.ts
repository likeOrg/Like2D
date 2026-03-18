import type { CanvasMode, PartialCanvasMode } from './canvas-config';
import { Vec2, type Vector2 } from './vector2';

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
  private pixelCanvas: HTMLCanvasElement | null = null;
  private pixelCtx: CanvasRenderingContext2D | null = null;

  private onWindowResize = () => this.applyConfig();

  public onResize: ((size: Vector2, pixelSize: Vector2, fullscreen: boolean) => void) | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private container: HTMLElement,
    private ctx: CanvasRenderingContext2D,
    private config: CanvasMode = { pixelResolution: null, fullscreen: false }
  ) {
    this.resizeObserver = new ResizeObserver(() => this.applyConfig());
    this.resizeObserver.observe(this.container);

    window.addEventListener('resize', this.onWindowResize);
    this.listenForPixelRatioChanges();

    this.applyConfig();
  }

  private listenForPixelRatioChanges(): void {
    const media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    media.addEventListener('change', () => {
      this.applyConfig();
      this.listenForPixelRatioChanges();
    }, { once: true });
  }

  setMode(mode: PartialCanvasMode): void {
    this.config = { ...this.config, ...mode } as CanvasMode;
    this.applyConfig();
  }

  getMode(): CanvasMode {
    return { ...this.config };
  }

  private applyConfig(): void {
    const containerSize: Vector2 = document.fullscreenElement
      ? [document.fullscreenElement.clientWidth, document.fullscreenElement.clientHeight]
      : [this.container.clientWidth, this.container.clientHeight];

    if (this.pixelCanvas) {
      this.pixelCanvas.remove();
      this.pixelCanvas = null;
      this.pixelCtx = null;
    }

    if (this.config.pixelResolution) {
      this.applyPixelMode(containerSize);
    } else {
      this.applyNativeMode(containerSize);
    }

    this.onResize?.(
      containerSize,
      [this.canvas.width, this.canvas.height] as Vector2,
      this.config.fullscreen
    );
  }

  private applyPixelMode(csize: Vector2): void {
    const gameSize = this.config.pixelResolution!;
    const pixelRatio = window.devicePixelRatio || 1;
    const scale = Math.min(csize[0] / gameSize[0], csize[1] / gameSize[1]);

    const physicalScale = scale * pixelRatio;
    const intScale = Math.max(1, Math.ceil(physicalScale));

    this.pixelCanvas = document.createElement('canvas');
    this.pixelCtx = this.pixelCanvas.getContext('2d');

    setCanvasSize(this.pixelCanvas, gameSize);
    setCanvasSize(this.canvas, Vec2.mul(gameSize, intScale));

    setCanvasDisplaySize(this.canvas, Vec2.mul(gameSize, scale));
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';
    this.canvas.style.imageRendering = 'auto';
    centerElement(this.canvas);
  }

  private applyNativeMode(csize: Vector2): void {
    const pixelRatio = window.devicePixelRatio || 1;
    const canvasSize = Vec2.mul(csize, pixelRatio);

    setCanvasSize(this.canvas, Vec2.floor(canvasSize));
    setCanvasDisplaySize(this.canvas, csize);

    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.transform = 'none';
    this.canvas.style.margin = '0';
    this.canvas.style.display = 'block';
    this.canvas.style.imageRendering = 'auto';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  dispose(): void {
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    this.pixelCanvas?.remove();
    this.pixelCanvas = null;
    this.pixelCtx = null;
  }

  present(): void {
    if (!this.pixelCtx || !this.pixelCanvas) {
      return;
    }

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      this.pixelCanvas,
      0, 0, this.pixelCanvas.width, this.pixelCanvas.height,
      0, 0, this.canvas.width, this.canvas.height
    );
  }

  getDisplayCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getRenderTarget(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (this.pixelCanvas && this.pixelCtx) {
      return { canvas: this.pixelCanvas, ctx: this.pixelCtx };
    }
    return { canvas: this.canvas, ctx: this.ctx };
  }

  transformMousePosition(offsetX: number, offsetY: number): Vector2 {
    if (this.config.pixelResolution) {
      const rect = this.canvas.getBoundingClientRect();
      return [
        offsetX * (this.config.pixelResolution[0] / rect.width),
        offsetY * (this.config.pixelResolution[1] / rect.height),
      ];
    }

    const pixelRatio = window.devicePixelRatio || 1;
    return [offsetX * pixelRatio, offsetY * pixelRatio];
  }
}
