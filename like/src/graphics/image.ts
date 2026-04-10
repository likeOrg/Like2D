import { Vector2 } from "../math";

/**
 * An image that can be drawn using {@link Graphics.draw}
 *
 * Unlike raw HTMLImageElement, there is no need to wait for it to load.
 * If the image isn't loaded, it simply won't draw it at all.
 *
 * If you're planning on loading many large images, simply load
 * these image handles beforehand so that they're ready.
 *
 */
export class ImageHandle {
  readonly path: string;
  readonly ready: Promise<void>;
  private element: HTMLImageElement;
  private isLoaded = false;

  constructor(path: string) {
    this.path = path;
    this.element = new Image();

    this.ready = new Promise((resolve, reject) => {
      this.element.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      this.element.onerror = () => {
        reject(new Error(`Failed to load image: ${path}`));
      };
      this.element.src = path;
    });
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  get size(): Vector2 | undefined {
    return this.isReady() ? [this.element.width, this.element.height] : undefined;
  }

  /**
   * Escape hatch:
   *
   * Yes, you can get the underlying image.
   * No, it's not stable in the case we ever switch to webGL.
   */
  getElement(): HTMLImageElement {
    return this.element;
  }
}
