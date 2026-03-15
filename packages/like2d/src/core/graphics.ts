import type { Vector2 } from './vector2';
import type { Rect } from './rect';

type DrawMode = 'fill' | 'line';

export type Color = [number, number, number, number?] | string;
export type Quad = Rect;

export type { Vector2, Rect };

export type Canvas = {
  size: Vector2;
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

export type ShapeProps = {
  color?: Color;
  lineWidth?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'bevel' | 'miter' | 'round';
  miterLimit?: number;
};

export type DrawProps = ShapeProps & {
  quad?: Quad;
  r?: number;
  scale?: number | Vector2;
  origin?: number | Vector2;
};

export type PrintProps = {
  font?: string;
  limit?: number;
  align?: 'left' | 'center' | 'right';
};

export class ImageHandle {
  readonly path: string;
  private element: HTMLImageElement | null = null;
  private loadPromise: Promise<void>;
  private isLoaded = false;

  constructor(path: string) {
    this.path = path;
    
    this.loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.element = img;
        this.isLoaded = true;
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${path}`));
      };
      img.src = path;
    });
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  ready(): Promise<void> {
    return this.loadPromise;
  }

  get size(): Vector2 {
    return [this.element?.width ?? 0, this.element?.height ?? 0];
  }

  getElement(): HTMLImageElement | null {
    return this.element;
  }
}

function parseColor(color: Color): string {
  if (typeof color === 'string') {
    return color;
  }
  
  const [r, g, b, a = 1] = color;
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

export class Graphics {
  private ctx: CanvasRenderingContext2D;
  private readonly screenCtx: CanvasRenderingContext2D;

  private canvases = new Map<Canvas, true>();
  private backgroundColor: Color = [0, 0, 0, 1];
  private images = new Map<string, ImageHandle>();
  private defaultFont = '16px sans-serif';

  constructor(ctx: CanvasRenderingContext2D) {
    this.screenCtx = ctx;
    this.ctx = ctx;
    ctx.font = this.defaultFont;
  }

  private applyColor(color?: Color): string {
    return parseColor(color ?? [1, 1, 1, 1]);
  }

  private setStrokeProps(props?: ShapeProps): void {
    if (!this.ctx) return;
    // Always reset to defaults first, then apply any custom props
    this.ctx.lineWidth = props?.lineWidth ?? 1;
    this.ctx.lineCap = props?.lineCap ?? 'butt';
    this.ctx.lineJoin = props?.lineJoin ?? 'miter';
    this.ctx.miterLimit = props?.miterLimit ?? 10;
  }

  clear(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = parseColor(this.backgroundColor);
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  setBackgroundColor(color: Color): void {
    this.backgroundColor = color;
    this.clear();
  }

  rectangle(mode: DrawMode, color: Color, rect: Rect, props?: ShapeProps): void {
    if (!this.ctx) return;
    
    const [x, y, width, height] = rect;
    const parsedColor = this.applyColor(color);
    
    if (mode === 'fill') {
      this.ctx.fillStyle = parsedColor;
      this.ctx.fillRect(x, y, width, height);
    } else {
      this.setStrokeProps(props);
      this.ctx.strokeStyle = parsedColor;
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  circle(mode: DrawMode, color: Color, position: Vector2, radii: number | Vector2, props?: ShapeProps & { angle?: number; arc?: [number, number] }): void {
    if (!this.ctx) return;
    
    const [x, y] = position;
    const parsedColor = this.applyColor(color);
    const [rx, ry] = typeof radii === 'number' ? [radii, radii] : radii;
    const [startAngle, endAngle] = props?.arc ?? [0, Math.PI * 2];
    const rotation = props?.angle ?? 0;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.scale(rx, ry);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 1, startAngle, endAngle);
    this.ctx.closePath();
    this.ctx.restore();
    
    if (mode === 'fill') {
      this.ctx.fillStyle = parsedColor;
      this.ctx.fill();
    } else {
      this.setStrokeProps(props);
      this.ctx.strokeStyle = parsedColor;
      this.ctx.stroke();
    }
  }

  line(color: Color, points: Vector2[], props?: ShapeProps): void {
    if (!this.ctx || points.length < 2) return;
    
    const parsedColor = this.applyColor(color);
    
    this.setStrokeProps(props);
    this.ctx.beginPath();
    const [[x0, y0], ...rest] = points;
    this.ctx.moveTo(x0, y0);
    rest.forEach(([x, y]) => this.ctx!.lineTo(x, y));
    
    this.ctx.strokeStyle = parsedColor;
    this.ctx.stroke();
  }

  print(color: Color, text: string, position: Vector2, props?: PrintProps): void {
    if (!this.ctx) return;
    
    const [x, y] = position;
    const { font = this.defaultFont, limit, align = 'left' } = props ?? {};
    this.ctx.fillStyle = parseColor(color);
    this.ctx.font = font;
    
    if (limit !== undefined) {
      const lines = this.wrapText(text, limit);
      const lineHeight = this.getFontHeight();
      
      lines.forEach((line, index) => {
        const lineWidth = this.ctx!.measureText(line).width;
        const drawX = align === 'center' ? x + (limit - lineWidth) / 2 :
                      align === 'right' ? x + limit - lineWidth : x;
        this.ctx!.fillText(line, drawX, y + index * lineHeight);
      });
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    if (!this.ctx) return [text];
    
    const words = text.split(' ');
    const [first, ...rest] = words;
    const lines: string[] = [];
    let currentLine = first ?? '';

    rest.forEach((word) => {
      const width = this.ctx!.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    lines.push(currentLine);
    return lines;
  }

  private getFontHeight(): number {
    if (!this.ctx) return 16;
    const match = this.ctx.font.match(/(\d+)px/);
    return match ? parseInt(match[1]) : 16;
  }

  setFont(size: number, font: string = 'sans-serif'): void {
    if (!this.ctx) return;
    this.defaultFont = `${size}px ${font}`;
    this.ctx.font = this.defaultFont;
  }

  getFont(): string {
    return this.defaultFont;
  }

  newImage(path: string): ImageHandle {
    let handle = this.images.get(path);
    if (!handle) {
      handle = new ImageHandle(path);
      this.images.set(path, handle);
    }
    return handle;
  }

  draw(
    handle: ImageHandle,
    position: Vector2,
    props?: DrawProps
  ): void {
    if (!this.ctx) return;

    const imageHandle = this.images.get(handle.path);
    if (!imageHandle?.isReady()) return;

    const element = imageHandle.getElement();
    if (!element) return;

    const [x, y] = position;
    const { r = 0, scale = 1, origin = 0, quad } = props ?? {};
    const [sx, sy] = typeof scale === 'number' ? [scale, scale] : scale;
    const [ox, oy] = typeof origin === 'number' ? [origin, origin] : origin;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(r);
    this.ctx.scale(sx, sy);

    if (quad) {
      const [qx, qy, qw, qh] = quad;
      this.ctx.drawImage(element, qx, qy, qw, qh, -ox, -oy, qw, qh);
    } else {
      this.ctx.drawImage(element, -ox, -oy);
    }

    this.ctx.restore();
  }

  push(): void {
    if (!this.ctx) return;
    this.ctx.save();
  }

  pop(): void {
    if (!this.ctx) return;
    this.ctx.restore();
  }

  translate(delta: Vector2): void {
    if (!this.ctx) return;
    const [x, y] = delta;
    this.ctx.translate(x, y);
  }

  rotate(angle: number): void {
    if (!this.ctx) return;
    this.ctx.rotate(angle);
  }

  scale(s: number | Vector2): void {
    if (!this.ctx) return;
    if (typeof s === 'number') {
      this.ctx.scale(s, s);
    } else {
      const [sx, sy] = s;
      this.ctx.scale(sx, sy);
    }
  }

  getCanvasSize(): Vector2 {
    const width = this.ctx?.canvas.width ?? 800;
    const height = this.ctx?.canvas.height ?? 600;
    return [width, height];
  }

  newCanvas(size: Vector2): Canvas {
    const [width, height] = size;
    const element = document.createElement('canvas');
    element.width = width;
    element.height = height;
    const ctx = element.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    const canvas: Canvas = { size, element, ctx };
    this.canvases.set(canvas, true);
    return canvas;
  }

  setCanvas(canvas?: Canvas | null): void {
    if (canvas) {
      this.ctx = canvas.ctx;
    } else {
      this.ctx = this.screenCtx;
    }
  }

  clip(rect?: Rect): void {
    if (!this.ctx) return;
    
    if (rect) {
      const [x, y, w, h] = rect;
      this.ctx.beginPath();
      this.ctx.rect(x, y, w, h);
      this.ctx.clip();
    } else {
      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.clip();
    }
  }

  polygon(mode: DrawMode, color: Color, points: Vector2[], props?: ShapeProps): void {
    if (!this.ctx || points.length < 3) return;
    
    const parsedColor = this.applyColor(color);
    
    this.ctx.beginPath();
    const [[x0, y0], ...rest] = points;
    this.ctx.moveTo(x0, y0);
    rest.forEach(([x, y]) => this.ctx!.lineTo(x, y));
    this.ctx.closePath();
    
    if (mode === 'fill') {
      this.ctx.fillStyle = parsedColor;
      this.ctx.fill();
    } else {
      this.setStrokeProps(props);
      this.ctx.strokeStyle = parsedColor;
      this.ctx.stroke();
    }
  }

  arc(mode: DrawMode, x: number, y: number, radius: number, angle1: number, angle2: number, props?: ShapeProps): void {
    if (!this.ctx) return;
    
    const color = this.applyColor(props?.color);
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, angle1, angle2);
    
    if (mode === 'fill') {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.setStrokeProps(props);
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  points(color: Color, points: Vector2[]): void {
    if (!this.ctx) return;
    
    const parsedColor = this.applyColor(color);
    this.ctx.fillStyle = parsedColor;
    points.forEach(([x, y]) => this.ctx!.fillRect(x, y, 1, 1));
  }
}
