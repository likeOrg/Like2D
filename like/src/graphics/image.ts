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

  /**
   * Escape hatch:
   *
   * Yes, you can get the underlying image.
   * No, it's not stable in the case we ever switch to webGL.
   */
  getElement(): HTMLImageElement | null {
    return this.element;
  }
}
