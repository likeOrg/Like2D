import type { Event } from '../../core/events';

export type Scene = {
  load?(): void;
  update(dt: number): void;
  /**
   * Draw the scene.
   * @param canvas - The current canvas element. WARNING: Do not save this reference!
   * The canvas can change (e.g., when switching scaling modes or entering fullscreen),
   * so always use the passed canvas parameter rather than storing it.
   */
  draw(canvas: HTMLCanvasElement): void;
  handleEvent?(event: Event): void;
};