/**
 * @module graphics
 * @description a reduced-state, Love2D-like wrapper around browser canvas
 */

import { draw } from "./drawing";

export type {
  Color,
  DrawMode,
  ShapeProps,
  DrawProps,
  PrintProps,
  ImageHandle,
} from "./drawing";

export { draw } from "./drawing";

export type {
  CanvasModeOptions,
  CanvasSize,
  Canvas,
} from "./canvas";

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
  [K in keyof typeof draw]: Bind<(typeof draw)[K]>;
};

export function bindGraphics(ctx: CanvasRenderingContext2D): BoundGraphics {
  const bound = {} as BoundGraphics;
  for (const [name, fn] of Object.entries(draw)) {
    (bound as any)[name] = (...args: any[]) => (fn as any)(ctx, ...args);
  }
  return bound;
}
