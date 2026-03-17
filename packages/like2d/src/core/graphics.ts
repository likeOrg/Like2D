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

export type GraphicsState = {
  screenCtx: CanvasRenderingContext2D;
  currentCtx: CanvasRenderingContext2D;
  canvases: Map<Canvas, true>;
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
  if (typeof color === 'string') return color;
  const [r, g, b, a = 1] = color;
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

function applyColor(color?: Color): string {
  return parseColor(color ?? [1, 1, 1, 1]);
}

function setStrokeProps(ctx: CanvasRenderingContext2D, props?: ShapeProps): void {
  ctx.lineWidth = props?.lineWidth ?? 1;
  ctx.lineCap = props?.lineCap ?? 'butt';
  ctx.lineJoin = props?.lineJoin ?? 'miter';
  ctx.miterLimit = props?.miterLimit ?? 10;
}

export function newState(ctx: CanvasRenderingContext2D): GraphicsState {
  return {
    screenCtx: ctx,
    currentCtx: ctx,
    canvases: new Map(),
  };
}

export function clear(s: GraphicsState, color: Color = [0, 0, 0, 1]): void {
  const ctx = s.currentCtx;
  ctx.fillStyle = parseColor(color);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function rectangle(s: GraphicsState, mode: DrawMode, color: Color, rect: Rect, props?: ShapeProps): void {
  const ctx = s.currentCtx;
  const [x, y, w, h] = rect;
  const c = applyColor(color);
  if (mode === 'fill') {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  } else {
    setStrokeProps(ctx, props);
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, w, h);
  }
}

export function circle(
  s: GraphicsState,
  mode: DrawMode,
  color: Color,
  position: Vector2,
  radii: number | Vector2,
  props?: ShapeProps & { angle?: number; arc?: [number, number] }
): void {
  const ctx = s.currentCtx;
  const [x, y] = position;
  const c = applyColor(color);
  const [rx, ry] = typeof radii === 'number' ? [radii, radii] : radii;
  const [startAngle, endAngle] = props?.arc ?? [0, Math.PI * 2];
  const rotation = props?.angle ?? 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(rx, ry);
  ctx.beginPath();
  ctx.arc(0, 0, 1, startAngle, endAngle);
  ctx.closePath();
  ctx.restore();

  if (mode === 'fill') {
    ctx.fillStyle = c;
    ctx.fill();
  } else {
    setStrokeProps(ctx, props);
    ctx.strokeStyle = c;
    ctx.stroke();
  }
}

export function line(s: GraphicsState, color: Color, points: Vector2[], props?: ShapeProps): void {
  const ctx = s.currentCtx;
  if (points.length < 2) return;
  setStrokeProps(ctx, props);
  ctx.beginPath();
  const [[x0, y0], ...rest] = points;
  ctx.moveTo(x0, y0);
  rest.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.strokeStyle = applyColor(color);
  ctx.stroke();
}

export function print(s: GraphicsState, color: Color, text: string, position: Vector2, props?: PrintProps): void {
  const ctx = s.currentCtx;
  const [x, y] = position;
  const { font = '16px sans-serif', limit, align = 'left' } = props ?? {};
  ctx.fillStyle = parseColor(color);
  ctx.font = font;

  if (limit !== undefined) {
    const lines = wrapText(ctx, text, limit);
    const lineHeight = getFontHeight(ctx);
    lines.forEach((line, i) => {
      const lineWidth = ctx.measureText(line).width;
      const drawX = align === 'center' ? x + (limit - lineWidth) / 2
                  : align === 'right' ? x + limit - lineWidth
                  : x;
      ctx.fillText(line, drawX, y + i * lineHeight);
    });
  } else {
    ctx.fillText(text, x, y);
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const [first, ...rest] = words;
  const lines: string[] = [];
  let current = first ?? '';
  rest.forEach(word => {
    if (ctx.measureText(current + ' ' + word).width < maxWidth) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  });
  lines.push(current);
  return lines;
}

function getFontHeight(ctx: CanvasRenderingContext2D): number {
  const match = ctx.font.match(/(\d+)px/);
  return match ? parseInt(match[1]) : 16;
}

export function drawImage(s: GraphicsState, handle: ImageHandle, position: Vector2, props?: DrawProps): void {
  const ctx = s.currentCtx;
  if (!handle.isReady()) return;
  const element = handle.getElement();
  if (!element) return;

  const [x, y] = position;
  const { r = 0, scale = 1, origin = 0, quad } = props ?? {};
  const [sx, sy] = typeof scale === 'number' ? [scale, scale] : scale;
  const [ox, oy] = typeof origin === 'number' ? [origin, origin] : origin;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  ctx.scale(sx, sy);
  if (quad) {
    const [qx, qy, qw, qh] = quad;
    ctx.drawImage(element, qx, qy, qw, qh, -ox, -oy, qw, qh);
  } else {
    ctx.drawImage(element, -ox, -oy);
  }
  ctx.restore();
}

export function getCanvasSize(s: GraphicsState): Vector2 {
  return [s.currentCtx.canvas.width, s.currentCtx.canvas.height];
}

export function newImage(_s: GraphicsState, path: string): ImageHandle {
  return new ImageHandle(path);
}

export function newCanvas(s: GraphicsState, size: Vector2): Canvas {
  const [w, h] = size;
  const element = document.createElement('canvas');
  element.width = w;
  element.height = h;
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');
  const canvas: Canvas = { size, element, ctx };
  s.canvases.set(canvas, true);
  return canvas;
}

export function setCanvas(s: GraphicsState, canvas?: Canvas | null): void {
  s.currentCtx = canvas?.ctx ?? s.screenCtx;
}

export function clip(s: GraphicsState, rect?: Rect): void {
  const ctx = s.currentCtx;
  ctx.beginPath();
  if (rect) {
    const [x, y, w, h] = rect;
    ctx.rect(x, y, w, h);
  } else {
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  ctx.clip();
}

export function polygon(s: GraphicsState, mode: DrawMode, color: Color, points: Vector2[], props?: ShapeProps): void {
  const ctx = s.currentCtx;
  if (points.length < 3) return;
  const c = applyColor(color);
  ctx.beginPath();
  const [[x0, y0], ...rest] = points;
  ctx.moveTo(x0, y0);
  rest.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  if (mode === 'fill') {
    ctx.fillStyle = c;
    ctx.fill();
  } else {
    setStrokeProps(ctx, props);
    ctx.strokeStyle = c;
    ctx.stroke();
  }
}

export function points(s: GraphicsState, color: Color, pts: Vector2[]): void {
  const ctx = s.currentCtx;
  ctx.fillStyle = applyColor(color);
  pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
}



type Bind<F> = F extends (s: GraphicsState, ...args: infer A) => infer R ? (...args: A) => R : never;

export type BoundGraphics = {
  [K in keyof typeof graphicsFns]: Bind<(typeof graphicsFns)[K]>;
};

const graphicsFns = {
  clear, rectangle, circle, line, print,
  draw: drawImage, getCanvasSize, newCanvas, setCanvas,
  clip, polygon, points, newImage,
} as const;

export function bindGraphics(s: GraphicsState): BoundGraphics {
  const bound = {} as BoundGraphics;
  for (const [name, fn] of Object.entries(graphicsFns)) {
    (bound as Record<string, any>)[name] = (...args: any[]) => (fn as any)(s, ...args);
  }
  return bound;
}
