/**
 * @module graphics
 * @description a reduced-state, Love2D-like wrapper around browser canvas
 * 
 * # Graphics Module
 * 
 * A wrapper around browser Canvas.
 * In standard usage `like.gfx` gives a {@link BoundGraphics} object with a canvas already on it.
 * So, you can for example call `like.gfx.rectangle('fill', 'green', [10, 10, 30, 30])`
 * 
 * ## State Isolation
 * Each drawing operation resets relevant canvas state before executing:
 * - Stroke properties (`lineWidth`, `lineCap`, `lineJoin`, `miterLimit`) are always set to defaults first
 * - No state leakage between drawing calls
 * 
 * ## Predicable Parameter Ordering
 * - No clunky argument overrides that could affect positionality.
 * - **Required arguments** come first as positional parameters
 * - **Optional arguments** are grouped in a trailing `props` object
 * - **Mode** `'fill' | 'line'` is the first arg if relevent. 
 * - **Color** then {@link Color}, if relevant -- there is no `setColor`.
 * 
 * ## Note: Coordinate System is unchanged from native Canvas.
 * - Origin (0, 0) at top-left
 * - X increases right
 * - Y increases down
 * - Angles in radians, 0 is right, positive is clockwise
 */

import type { Vector2 } from "../math/vector2";
import type { Rectangle } from "../math/rect";

type DrawMode = "fill" | "line";

/**
 * - RGBA array with values 0-1: `[r, g, b, a]`
 * - Alpha defaults to 1 if omitted
 * - CSS color strings also accepted: `"red"`, `"#ff0000"`, `"rgb(255,0,0)"`
 */
export type Color = [number, number, number, number?] | string;

export type ShapeProps = {
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  miterLimit?: number;
};

export type DrawProps = ShapeProps & {
  quad?: Rectangle;
  r?: number;
  scale?: number | Vector2;
  origin?: number | Vector2;
};

export type PrintProps = {
  font?: string;
  limit?: number;
  align?: CanvasTextAlign;
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
  if (typeof color === "string") return color;
  const [r, g, b, a = 1] = color;
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

function applyColor(color?: Color): string {
  return parseColor(color ?? [1, 1, 1, 1]);
}

function setStrokeProps(
  ctx: CanvasRenderingContext2D,
  props?: ShapeProps,
): void {
  ctx.lineWidth = props?.lineWidth ?? 1;
  ctx.lineCap = props?.lineCap ?? "butt";
  ctx.lineJoin = props?.lineJoin ?? "miter";
  ctx.miterLimit = props?.miterLimit ?? 10;
}

export function clear(
  ctx: CanvasRenderingContext2D,
  color: Color = [0, 0, 0, 1],
): void {
  ctx.fillStyle = parseColor(color);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function rectangle(
  ctx: CanvasRenderingContext2D,
  mode: DrawMode,
  color: Color,
  rect: Rectangle,
  props?: ShapeProps,
): void {
  const c = applyColor(color);
  if (mode === "fill") {
    ctx.fillStyle = c;
    ctx.fillRect(...rect);
  } else {
    setStrokeProps(ctx, props);
    ctx.strokeStyle = c;
    ctx.strokeRect(...rect);
  }
}

export function circle(
  ctx: CanvasRenderingContext2D,
  mode: DrawMode,
  color: Color,
  position: Vector2,
  radii: number | Vector2,
  props?: ShapeProps & { angle?: number; arc?: [number, number], center: boolean },
): void {
  const [x, y] = position;
  const c = applyColor(color);
  const [rx, ry] = typeof radii === "number" ? [radii, radii] : radii;
  const [startAngle, endAngle] = props?.arc ?? [0, Math.PI * 2];
  const rotation = props?.angle ?? 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(rx, ry);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.arc(0, 0, 1, startAngle, endAngle);
  ctx.closePath();
  ctx.restore();

  if (mode === "fill") {
    ctx.fillStyle = c;
    ctx.fill();
  } else {
    setStrokeProps(ctx, props);
    ctx.strokeStyle = c;
    ctx.stroke();
  }
}

export function line(
  ctx: CanvasRenderingContext2D,
  color: Color,
  points: Vector2[],
  props?: ShapeProps,
): void {
  if (points.length < 2) return;
  setStrokeProps(ctx, props);
  ctx.beginPath();
  const [[x0, y0], ...rest] = points;
  ctx.moveTo(x0, y0);
  rest.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.strokeStyle = applyColor(color);
  ctx.stroke();
}

export function print(
  ctx: CanvasRenderingContext2D,
  color: Color,
  text: string,
  position: Vector2,
  props?: PrintProps,
): void {
  const [x, y] = position;
  const { font = "16px sans-serif", limit, align = "left" } = props ?? {};
  ctx.fillStyle = parseColor(color);
  ctx.font = font;

  if (limit !== undefined) {
    const lines = wrapText(ctx, text, limit);
    const lineHeight = getFontHeight(ctx);
    lines.forEach((line, i) => {
      const lineWidth = ctx.measureText(line).width;
      const drawX =
        align === "center"
          ? x + (limit - lineWidth) / 2
          : align === "right"
            ? x + limit - lineWidth
            : x;
      ctx.fillText(line, drawX, y + i * lineHeight);
    });
  } else {
    ctx.fillText(text, x, y);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const [first, ...rest] = words;
  const lines: string[] = [];
  let current = first ?? "";
  rest.forEach((word) => {
    if (ctx.measureText(current + " " + word).width < maxWidth) {
      current += " " + word;
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

export function drawImage(
  ctx: CanvasRenderingContext2D,
  handle: ImageHandle,
  position: Vector2,
  props?: DrawProps,
): void {
  if (!handle.isReady()) return;
  const element = handle.getElement();
  if (!element) return;

  const [x, y] = position;
  const { r = 0, scale = 1, origin = 0, quad } = props ?? {};
  const [sx, sy] = typeof scale === "number" ? [scale, scale] : scale;
  const [ox, oy] = typeof origin === "number" ? [origin, origin] : origin;

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

/**
 * Get an {@link ImageHandle} that pretends to be synchronous.
 */
export function newImage(
  _ctx: CanvasRenderingContext2D,
  path: string,
): ImageHandle {
  return new ImageHandle(path);
}

export function clip(ctx: CanvasRenderingContext2D, rect?: Rectangle): void {
  ctx.beginPath();
  if (rect) {
    const [x, y, w, h] = rect;
    ctx.rect(x, y, w, h);
  } else {
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  ctx.clip();
}

export function polygon(
  ctx: CanvasRenderingContext2D,
  mode: DrawMode,
  color: Color,
  points: Vector2[],
  props?: ShapeProps,
): void {
  if (points.length < 3) return;
  const c = applyColor(color);
  ctx.beginPath();
  const [[x0, y0], ...rest] = points;
  ctx.moveTo(x0, y0);
  rest.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  if (mode === "fill") {
    ctx.fillStyle = c;
    ctx.fill();
  } else {
    setStrokeProps(ctx, props);
    ctx.strokeStyle = c;
    ctx.stroke();
  }
}

export function points(
  ctx: CanvasRenderingContext2D,
  color: Color,
  pts: Vector2[],
): void {
  ctx.fillStyle = applyColor(color);
  pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
}

export function push(ctx: CanvasRenderingContext2D): void {
  ctx.save();
}

export function pop(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}

export function translate(
  ctx: CanvasRenderingContext2D,
  offset: Vector2,
): void {
  const [x, y] = offset;
  ctx.translate(x, y);
}

export function rotate(ctx: CanvasRenderingContext2D, angle: number): void {
  ctx.rotate(angle);
}

export function scale(
  ctx: CanvasRenderingContext2D,
  factor: number | Vector2,
): void {
  const [sx, sy] = typeof factor === "number" ? [factor, factor] : factor;
  ctx.scale(sx, sy);
}

type Bind<F> = F extends (
  ctx: CanvasRenderingContext2D,
  ...args: infer A
) => infer R
  ? (...args: A) => R
  : never;

/**
 * A graphics object with a canvas already attatched to it.
 * Calling its methods will draw to the render canvas.
 * See {@link graphics} for more info.
 */
export type BoundGraphics = {
  [K in keyof typeof graphicsFns]: Bind<(typeof graphicsFns)[K]>;
};

const graphicsFns = {
  clear,
  rectangle,
  circle,
  line,
  print,
  draw: drawImage,
  clip,
  polygon,
  points,
  newImage,
  push,
  pop,
  translate,
  rotate,
  scale,
} as const;

export function bindGraphics(ctx: CanvasRenderingContext2D): BoundGraphics {
  const bound = {} as BoundGraphics;
  for (const [name, fn] of Object.entries(graphicsFns)) {
    (bound as any)[name] = (...args: any[]) => (fn as any)(ctx, ...args);
  }
  return bound;
}
