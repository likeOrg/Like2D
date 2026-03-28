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

import { Vec2, type Vector2 } from "../math/vector2";
import type { Rectangle } from "../math/rect";

export type DrawMode = "fill" | "line";

export type DrawFunctions = {
  clear(ctx: CanvasRenderingContext2D, color?: Color): void;
  rectangle(ctx: CanvasRenderingContext2D, mode: DrawMode, color: Color, rect: Rectangle, props?: ShapeProps): void;
  circle(ctx: CanvasRenderingContext2D, mode: DrawMode, color: Color, position: Vector2, radii: number | Vector2, props?: ShapeProps & {
    arc?: [number, number];
    center?: boolean;
  }): void;
  line(ctx: CanvasRenderingContext2D, color: Color, points: Vector2[], props?: ShapeProps): void;
  print(ctx: CanvasRenderingContext2D, color: Color, text: string, position: Vector2, props?: PrintProps): void;
  draw(ctx: CanvasRenderingContext2D, handle: ImageHandle, position: Vector2, props?: DrawProps): void;
  newImage(_ctx: CanvasRenderingContext2D, path: string): ImageHandle;
  clip(ctx: CanvasRenderingContext2D, rect?: Rectangle): void;
  polygon(ctx: CanvasRenderingContext2D, mode: DrawMode, color: Color, points: Vector2[], props?: ShapeProps): void;
  points(ctx: CanvasRenderingContext2D, color: Color, pts: Vector2[]): void;
  push(ctx: CanvasRenderingContext2D): void;
  pop(ctx: CanvasRenderingContext2D): void;
  translate(ctx: CanvasRenderingContext2D, offset: Vector2): void;
  rotate(ctx: CanvasRenderingContext2D, angle: number): void;
  scale(ctx: CanvasRenderingContext2D, factor: number | Vector2): void;
};

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
  width?: number,
  align?: CanvasTextAlign,
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

/**
 * All of these methods exist on `like.gfx`, but with `ctx`
 * bound to the first arg.
 * 
 * Acts as the core of the graphics system, but can be used separately.
 * 
 * ```ts
 * import { draw } from "like/graphics"
 * draw.clear(my2dContext, "red");
 * ```
 * 
 */
const drawImpl: DrawFunctions = {
  /**
   * Clears the canvas with a solid color.
   * @param ctx Canvas context.
   * @param color Fill color.
   */
  clear(ctx: CanvasRenderingContext2D, color: Color = [0, 0, 0, 1]): void {
    ctx.fillStyle = parseColor(color);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  },

  /**
   * Draws a rectangle.
   * @param ctx Canvas context.
   * @param mode Fill or line.
   * @param color Fill or stroke color.
   * @param rect Rectangle [x, y, w, h].
   * @param props Optional stroke properties.
   */
  rectangle(
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
  },

  /**
   * Draws a circle or ellipse.
   * @param ctx Canvas context.
   * @param mode Fill or line.
   * @param color Fill or stroke color.
   * @param position Center position.
   * @param radii Radius (number) or [rx, ry] for ellipse.
   * @param props Optional arc, center, and stroke properties. Center is true by default.
   */
  circle(
    ctx: CanvasRenderingContext2D,
    mode: DrawMode,
    color: Color,
    position: Vector2,
    radii: number | Vector2,
    props?: ShapeProps & {
      arc?: [number, number];
      center?: boolean;
    },
  ): void {
    const center = (props && 'center' in props) ? props.center : true;
    const c = applyColor(color);
    const size: Vector2 = typeof radii === "number" ? [radii, radii] : radii;
    const [startAngle, endAngle] = props?.arc ?? [0, Math.PI * 2];
    if (!center) {
      position = Vec2.add(position, size);
    }

    ctx.save();
    ctx.translate(...position);
    ctx.scale(...size);
    ctx.beginPath();
    ctx.arc(0, 0, 1, startAngle, endAngle);
    if (mode == 'fill') ctx.lineTo(0, 0);
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
  },

  /**
   * Draws connected line segments.
   * @param ctx Canvas context.
   * @param color Stroke color.
   * @param points Array of [x, y] positions.
   * @param props Optional stroke properties.
   */
  line(
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
  },

  /**
   * Draws text at a position.
   * 
   * Keep in mind: if you set `align` without `width` in your props,
   * nothing will happen -- you'll get left-aligned text.
   * 
   * Align works browser-style: if you align center, your text draws
   * to the left and right of its position. If you align right, your position
   * becomes the upper-right corner of the text.
   * 
   * @param ctx Canvas context.
   * @param color Fill color.
   * @param text Text string.
   * @param position Top-left position.
   * @param props {@link PrintProps} Optional font, text limit, or alignment.
   */
  print(
    ctx: CanvasRenderingContext2D,
    color: Color,
    text: string,
    position: Vector2,
    props?: PrintProps,
  ): void {
    const [x, y] = position;
    const { font = "16px sans-serif" } = props ?? {};
    ctx.fillStyle = parseColor(color);
    ctx.font = font;
    ctx.textAlign = props?.align ?? "left";
    if (props && 'width' in props) {
      const { width } = props;
      const lines = wrapText(ctx, text, width as any);
      const lineHeight = getFontHeight(ctx);
      ctx.textBaseline = "top";
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * lineHeight, width);
      });
      ctx.textBaseline = "alphabetic";
    } else {
      ctx.fillText(text, x, y);
    }
  },

  /**
   * Draws an image.
   * 
   * @remarks named "draw" because it draws anything _drawable_
   * in the long run.
   * 
   * @param ctx Canvas context.
   * @param handle Image handle from newImage.
   * @param position Draw position.
   * @param props Optional rotation, scale, origin, or quad.
   */
  draw(
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
  },

  /**
   * Loads an image from a path.
   * Unlike built-in loading, this pretends to be synchronous.
   * @param ctx Canvas context.
   * @param path Image file path.
   * @returns ImageHandle for use with draw.
   */
  newImage(_ctx: CanvasRenderingContext2D, path: string): ImageHandle {
    return new ImageHandle(path);
  },

  /**
   * Sets the clipping region.
   * @param ctx Canvas context.
   * @param rect Clipping rectangle, or full canvas if omitted.
   */
  clip(ctx: CanvasRenderingContext2D, rect?: Rectangle): void {
    ctx.beginPath();
    if (rect) {
      const [x, y, w, h] = rect;
      ctx.rect(x, y, w, h);
    } else {
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctx.clip();
  },

  /**
   * Draws a polygon.
   * @param ctx Canvas context.
   * @param mode Fill or line.
   * @param color Fill or stroke color.
   * @param points Array of [x, y] vertices.
   * @param props Optional stroke properties.
   */
  polygon(
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
  },

  /**
   * Draws individual pixels.
   * @param ctx Canvas context.
   * @param color Fill color.
   * @param pts Array of [x, y] positions.
   */
  points(ctx: CanvasRenderingContext2D, color: Color, pts: Vector2[]): void {
    ctx.fillStyle = applyColor(color);
    pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  },

  /**
   * Saves canvas state.
   * @param ctx Canvas context.
   */
  push(ctx: CanvasRenderingContext2D): void {
    ctx.save();
  },

  /**
   * Restores canvas state.
   * @param ctx Canvas context.
   */
  pop(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  },

  /**
   * Applies a translation.
   * @param ctx Canvas context.
   * @param offset [x, y] offset.
   */
  translate(ctx: CanvasRenderingContext2D, offset: Vector2): void {
    const [x, y] = offset;
    ctx.translate(x, y);
  },

  /**
   * Applies a rotation.
   * @param ctx Canvas context.
   * @param angle Rotation in radians.
   */
  rotate(ctx: CanvasRenderingContext2D, angle: number): void {
    ctx.rotate(angle);
  },

  /**
   * Applies a scale.
   * @param ctx Canvas context.
   * @param factor Scale factor (number or [x, y]).
   */
  scale(ctx: CanvasRenderingContext2D, factor: number | Vector2): void {
    const [sx, sy] = typeof factor === "number" ? [factor, factor] : factor;
    ctx.scale(sx, sy);
  },
};

export const draw: DrawFunctions = drawImpl;
