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

    // Always clean up pixel canvas first
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

    const displayCanvas = this.pixelCanvas ?? this.canvas;

    this.onResize?.(
      containerSize,
      [displayCanvas.width, displayCanvas.height] as Vector2,
      this.config.fullscreen
    );
  }

  private applyPixelMode(csize: Vector2): void {
    const gameSize = this.config.pixelResolution!;
    const pixelRatio = window.devicePixelRatio || 1;
    const scale = Math.min(csize[0] / gameSize[0], csize[1] / gameSize[1]);

    const physicalScale = scale * pixelRatio;
    const intScale = Math.max(1, Math.floor(physicalScale));

    this.pixelCanvas = document.createElement('canvas');
    this.pixelCtx = this.pixelCanvas.getContext('2d');

    setCanvasSize(this.pixelCanvas, Vec2.mul(gameSize, intScale));
    setCanvasSize(this.canvas, gameSize);
    this.canvas.style.display = 'none';

    const pc = this.pixelCanvas;
    setCanvasDisplaySize(pc, Vec2.mul(gameSize, scale));
    pc.style.maxWidth = '100%';
    pc.style.maxHeight = '100%';
    pc.style.imageRendering = 'auto';
    centerElement(pc);
    this.container.appendChild(pc);
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

    this.pixelCtx.imageSmoothingEnabled = false;
    this.pixelCtx.drawImage(
      this.canvas,
      0, 0, this.canvas.width, this.canvas.height,
      0, 0, this.pixelCanvas.width, this.pixelCanvas.height
    );
  }

  getDisplayCanvas(): HTMLCanvasElement {
    return this.pixelCanvas ?? this.canvas;
  }

  transformMousePosition(cssX: number, cssY: number): Vector2 {
    const displayCanvas = this.getDisplayCanvas();
    const rect = displayCanvas.getBoundingClientRect();
    const relative: Vector2 = [cssX - rect.left, cssY - rect.top];

    if (this.config.pixelResolution) {
      // In pixel mode: CSS position (as fraction of CSS size) × game size = game position
      const gameSize = this.config.pixelResolution;
      return Vec2.mul(relative, [gameSize[0] / rect.width, gameSize[1] / rect.height]);
    } else {
      // In native mode, canvas fills the container completely at position 0,0
      // Mouse coordinates should be relative to the canvas, accounting for the fact
      // that the canvas internal pixel size != CSS size
      const pixelRatio = window.devicePixelRatio || 1;
      return Vec2.mul(relative, pixelRatio);
    }
  }
}
