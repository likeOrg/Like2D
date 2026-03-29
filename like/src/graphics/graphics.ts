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
import { ImageHandle } from "./image";

export type DrawMode = "fill" | "line";

/**
 * - RGBA array with values 0-1: `[r, g, b, a]`
 * - Alpha defaults to 1 if omitted
 * - CSS color strings also accepted: `"red"`, `"#ff0000"`, `"rgb(255,0,0)"`
 */
export type Color = [number, number, number, number?] | string;

export type TransformProps = {
  angle?: number;
  scale?: number | Vector2;
  origin?: Vector2;
};

export type ShapeProps = {
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  miterLimit?: number;
} & TransformProps;

export type DrawProps = ShapeProps & {
  quad?: Rectangle;
};

export type PrintProps = {
  font?: string;
  width?: number,
  align?: CanvasTextAlign,
} & TransformProps;

export type PolygonProps = ShapeProps & {
  translate?: Vector2;
};


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
 * LIKE's way of drawing to the screen.
 * 
 * More specifically: a system for wrapping canvas draw calls conveniently.
 * 
 *  - Reduces state in calls -- no `setColor`, etc. Everything is passed in.
 *  - Abstracts away common drawing operations.
 * 
 * ### Examples
 * Draw a spinning symbol in the center of the screen using transforms.
 * ```ts
 * function drawSpinningYinYang(like: Like) {
 *   const color1 = "black";
 *   const color2 = "white";
 *   const size = 50;
 *   const pos = Vec2.div(like.canvas.getSize(), 2); // calc center of screen
 *   const speed = 0.5; // rotations per second
 * 
 *   like.gfx.push();
 *   like.gfx.translate(pos);
 *   like.gfx.rotate(like.timer.getTime() * Math.PI * 2.0 * speed);
 *   like.gfx.scale(size);
 *   like.gfx.circle("fill", color1, [0, 0], 2);
 *   // use the arc parameter to fill in a semicircle. Note that it's clockwise from {x:1, y:0}.
 *   like.gfx.circle("fill", color2, [0, 0], 2, { arc: [Math.PI/2, Math.PI*3/2] });
 *   like.gfx.circle("fill", color2, [0, -1], 1);
 *   like.gfx.circle("fill", color1, [0, 1], 1);
 *   like.gfx.circle("fill", color2, [0, 1], 1/3);
 *   like.gfx.circle("fill", color1, [0, -1], 1/3);
 *   like.gfx.pop();
 * }
 * 
 * like.draw = (like: Like) => {
 *   drawSpinningYinYang(like);
 * }
 * ```
 */
export class Graphics {
  constructor(private ctx: CanvasRenderingContext2D) {}

  /**
   * Set the 2d drawing context for graphics. 
   * 
   * Be aware that that `like` can set this value at any time.
   */
  setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Clears the canvas with a solid color.
   * @param color Fill color.
   */
  clear(color: Color = [0, 0, 0, 1]): void {
    this.ctx.fillStyle = parseColor(color);
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /**
   * Draws a rectangle.
   * @param mode Fill or line.
   * @param color Fill or stroke color.
   * @param rect Rectangle [x, y, w, h].
   * @param props Optional stroke properties.
   */
  rectangle(
    mode: DrawMode,
    color: Color,
    rect: Rectangle,
    props?: ShapeProps,
  ): void {
    const c = applyColor(color);
    this.ctx.save();
    const [x, y, w, h] = rect;
    this.applyTransform([x, y], props);
    if (mode === "fill") {
      this.ctx.fillStyle = c;
      this.ctx.fillRect(0, 0, w, h);
    } else {
      setStrokeProps(this.ctx, props);
      this.ctx.strokeStyle = c;
      this.ctx.strokeRect(0, 0, w, h);
    }
    this.ctx.restore();
  }

  /**
   * Draws a circle or ellipse.
   
   * @param mode Fill or line.
   * @param color Fill or stroke color.
   * @param position Center position.
   * @param radii Radius (number) or [rx, ry] for ellipse.
   * @param props Optional arc, center, and stroke properties. Center is true by default.
   */
  circle(
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
    
    this.ctx.save();
    this.applyTransform(position, props);
    if (!center) {
      this.ctx.translate(...size);
    }
    this.ctx.scale(...size);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 1, startAngle, endAngle);
    if (mode == 'fill') this.ctx.lineTo(0, 0);
    this.ctx.closePath();

    if (mode === "fill") {
      this.ctx.fillStyle = c;
      this.ctx.fill();
    } else {
      setStrokeProps(this.ctx, props);
      this.ctx.strokeStyle = c;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Draws connected line segments.
   
   * @param color Stroke color.
   * @param points Array of [x, y] positions.
   * @param props Optional stroke properties.
   */
  line(
    color: Color,
    points: Vector2[],
    props?: ShapeProps,
  ): void {
    if (points.length < 2) return;
    setStrokeProps(this.ctx, props);
    this.ctx.beginPath();
    const [[x0, y0], ...rest] = points;
    this.ctx.moveTo(x0, y0);
    rest.forEach(([x, y]) => this.ctx.lineTo(x, y));
    this.ctx.strokeStyle = applyColor(color);
    this.ctx.stroke();
  }

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
   
   * @param color Fill color.
   * @param text Text string.
   * @param position Top-left position.
   * @param props {@link PrintProps} Optional font, text limit, or alignment.
   */
  print(
    color: Color,
    text: string,
    position: Vector2,
    props?: PrintProps,
  ): void {
    const { font = "16px sans-serif" } = props ?? {};
    this.ctx.save();
    this.applyTransform(position, props);
    this.ctx.fillStyle = parseColor(color);
    this.ctx.font = font;
    this.ctx.textAlign = props?.align ?? "left";
    if (props && 'width' in props) {
      const { width } = props;
      const lines = wrapText(this.ctx, text, width as any);
      const lineHeight = getFontHeight(this.ctx);
      this.ctx.textBaseline = "top";
      lines.forEach((line, i) => {
        this.ctx.fillText(line, 0, i * lineHeight, width);
      });
      this.ctx.textBaseline = "alphabetic";
    } else {
      this.ctx.fillText(text, 0, 0);
    }
    this.ctx.restore();
  }

  /**
   * Draws an image.
   * 
   * @remarks named "draw" because it draws anything _drawable_
   * in the long run.
   
   * @param handle Image handle from newImage.
   * @param position Draw position.
   * @param props Optional rotation, scale, origin, or quad.
   */
  draw(
    handle: ImageHandle,
    position: Vector2,
    props?: DrawProps,
  ): void {
    if (!handle.isReady()) return;
    const element = handle.getElement();
    if (!element) return;

    const { quad } = props ?? {};

    this.ctx.save();
    this.applyTransform(position, props);
    if (quad) {
      const [,, qw, qh] = quad;
      this.ctx.drawImage(element, ...quad, 0, 0, qw, qh);
    } else {
      this.ctx.drawImage(element, 0, 0);
    }
    this.ctx.restore();
  }

  /**
   * Loads an image from a path.
   * Unlike built-in loading, this pretends to be synchronous.
   
   * @param path Image file path.
   * @returns ImageHandle for use with draw.
   */
  newImage(path: string): ImageHandle {
    return new ImageHandle(path);
  }

  /**
   * Sets the clipping region.
   
   * @param rect Clipping rectangle, or full canvas if omitted.
   */
  clip(rect?: Rectangle): void {
    this.ctx.beginPath();
    if (rect) {
      const [x, y, w, h] = rect;
      this.ctx.rect(x, y, w, h);
    } else {
      this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    this.ctx.clip();
  }

  /**
   * Draws a polygon.
    
   * @param mode Fill or line.
   * @param color Fill or stroke color.
   * @param points Array of [x, y] vertices.
   * @param props Optional stroke and transform properties.
   */
  polygon(
    mode: DrawMode,
    color: Color,
    points: Vector2[],
    props?: PolygonProps,
  ): void {
    if (points.length < 3) return;
    const c = applyColor(color);
    const translate = props?.translate ?? [0, 0];
    this.ctx.save();
    this.applyTransform(translate, props);
    this.ctx.beginPath();
    const [[x0, y0], ...rest] = points;
    this.ctx.moveTo(x0, y0);
    rest.forEach(([x, y]) => this.ctx.lineTo(x, y));
    this.ctx.closePath();
    if (mode === "fill") {
      this.ctx.fillStyle = c;
      this.ctx.fill();
    } else {
      setStrokeProps(this.ctx, props);
      this.ctx.strokeStyle = c;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Draws individual pixels.
   
   * @param color Fill color.
   * @param pts Array of [x, y] positions.
   */
  points(
    color: Color,
    pts: Vector2[],
    props?: TransformProps,
  ): void {
    this.ctx.save();
    this.applyTransform([0, 0], props);
    this.ctx.fillStyle = applyColor(color);
    pts.forEach(([x, y]) => this.ctx.fillRect(x, y, 1, 1));
    this.ctx.restore();
  }

  private applyTransform(position: Vector2, props?: TransformProps): void {
    const { angle = 0, scale = 1, origin = [0, 0] } = props ?? {};
    this.ctx.translate(...position);
    if (angle !== 0) this.ctx.rotate(angle);
    if (scale !== 1) {
      const [sx, sy] = typeof scale === "number" ? [scale, scale] : scale;
      this.ctx.scale(sx, sy);
    }
    this.ctx.translate(-origin[0], -origin[1]);
  }

  /**
   * Saves canvas state.
    
   */
  push(): void {
    this.ctx.save();
  }

  /**
   * Restores canvas state.
   
   */
  pop(): void {
    this.ctx.restore();
  }

  /**
   * Applies a translation.
   
   * @param offset [x, y] offset.
   */
  translate(offset: Vector2): void {
    const [x, y] = offset;
    this.ctx.translate(x, y);
  }

  /**
   * Applies a rotation.
   
   * @param angle Rotation in radians.
   */
  rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  /**
   * Applies a scale.
   
   * @param factor Scale factor (number or [x, y]).
   */
  scale(factor: number | Vector2): void {
    const [sx, sy] = typeof factor === "number" ? [factor, factor] : factor;
    this.ctx.scale(sx, sy);
  }
};
