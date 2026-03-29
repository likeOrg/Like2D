import { type Dispatcher, type LikeCanvasElement } from "../events";
import { Rect, Rectangle } from "../math/rect";
import { Vec2, type Vector2 } from "../math/vector2";

/**
 * A set of options passed into {@link Canvas.setMode}
 */
export type CanvasModeOptions = { fullscreen: boolean };
export type CanvasSize = Vector2 | 'native';

/**
 * A manager for the HTML canvas element, similar to `love.window`.
 * 
 * Controls game size / scaling -- both native and pixelart mode via {@link Canvas.setMode}, as well as fullscreen functions.
 */
export class Canvas {
    /** The canvas that we're drawing to with `like.gfx` functions.
     * If it's the same as displayCanvas, we're in native mode.
     * Otherwise, we're in pixelart mode, consisting of nearest -> linear scaling.
    */
    private renderCanvas: LikeCanvasElement;

    private resizeTimeoutId: any = 0;

    constructor(
        /** The ultimately visible canvas in the browser */
        private displayCanvas: LikeCanvasElement,
        private dispatch: Dispatcher<'resize'>,
        private abort: AbortSignal,
    ) {
        displayCanvas.tabIndex = 0;
        displayCanvas.style.width = '100%';
        displayCanvas.style.height = '100%';
        this.renderCanvas = this.displayCanvas;
        this.setMode('native');

        /** Only the canvas can really transform the mouse to the game size.
         * This hack sends an event for the mouse module to listen to.
         */
        this.displayCanvas.addEventListener('mousemove', (ev: MouseEvent) => {
            let pos;
            let delta;
            const rawPos: Vector2 = [ev.offsetX, ev.offsetY];
            const rawDelta: Vector2 = [ev.movementX, ev.movementY];

            if (this.renderCanvas == this.displayCanvas) {
                /* Native mode. */
                pos = Vec2.mul(rawPos, window.devicePixelRatio ?? 1);
                delta = Vec2.mul(rawDelta, window.devicePixelRatio ?? 1);
            } else {
                /* Pixelart mode. This math simulates object-fit: contain,
                * which preserves aspect ratio.
                */
                const csize: Vector2 = [
                    this.displayCanvas.clientWidth,
                    this.displayCanvas.clientHeight
                ];
                /* Scale of both dimensions */
                const scale: number = calcAspectFriendlyScale(this.getSize(), csize)
                /* Upper-left corner */
                const offset = Vec2.div(
                    Vec2.sub(csize, Vec2.mul(this.getSize(), scale)),
                    2,
                );
                pos = Vec2.div(
                    Vec2.sub(rawPos, offset),
                    scale
                );
                delta = Vec2.div(rawDelta, scale);

                /* Only handle mousemove events that are in bounds. */
                if (!Rect.containsPoint(this.getRect(), pos)) {
                    return;
                }
            }

            this.displayCanvas.dispatchEvent(new CustomEvent('like:mousemoved', {
                detail: {
                    pos,
                    delta,
                }
            }));
        }, { signal: this.abort })

        this.displayCanvas.addEventListener(
          "like:preDraw",
          this.preDraw.bind(this),
          { signal: this.abort },
        );
        this.displayCanvas.addEventListener(
          "like:postDraw",
          this.postDraw.bind(this),
          { signal: this.abort },
        );
    }

    /** Get a unified canvas info object. */
    getMode(): { size: Vector2, flags: CanvasModeOptions } {
        return {
            size: this.getSize(),
            flags: {
                fullscreen: this.getFullscreen(),
            }
        }
    }

    /** Set the game's apparent resolution, fullscreen, etc.
     * 
     * ### `'native'` mode
     * Keeps the canvas pixel resolution
     * the same as the physical pixel resolution of the
     * device. 
     * 
     * ### Pixel art mode `[width, height]`
     * The canvas will use prescaling to keep your pixel
     * games looking sharp, but without the uneven pixels
     * caused by the naive approach.
     * 
     * @param size 'native' for native mode, otherwise [width, height]
     * @param flags optional options.
     */
    setMode(size: CanvasSize, flags: Partial<CanvasModeOptions> = {}) {
        // set up sizing / render target
        const prevRenderCanvas = this.renderCanvas;
        if (size == 'native') {
            this.displayCanvas.style.objectFit = 'fill';
            this.renderCanvas = this.displayCanvas;
        } else {
            this.displayCanvas.style.objectFit = 'contain';
            this.renderCanvas = document.createElement('canvas');
            const changed = Canvas.setCanvasElemSize(this.renderCanvas, size);
            if (changed) {
                this.dispatchResize(size);
            }
        }
        if (prevRenderCanvas != this.renderCanvas) {
            this.displayCanvas.dispatchEvent(
              new CustomEvent("like:updateRenderTarget", {
                detail: {
                  target: this.renderCanvas,
                },
              }),
            );
        }

        if ('fullscreen' in flags) {
            this.setFullscreen(flags.fullscreen!);
        }
    }

    /** Get the apparent (in-game) canvas size. */
    getSize(): Vector2 {
        return [this.renderCanvas.width, this.renderCanvas.height];
    }

    private dispatchResize(size: Vector2) {
        this.displayCanvas.dispatchEvent(
          new CustomEvent("like:resizeCanvas", {
            detail: {
              size,
            },
          }),
        );
        this.dispatch("resize", [size]);
    }

    /** Sometimes you want a screen rect! */
    getRect(): Rectangle {
        return [0, 0, ...this.getSize()];
    }

    /** Get the actual (physical) canvas size on screen. */
    private getDisplayPixelSize(): Vector2 {
        return Vec2.round(Vec2.mul(
            [this.displayCanvas.clientWidth, this.displayCanvas.clientHeight],
            window.devicePixelRatio ?? 1,
        ));
    }

    /** Are we fullscreen? */
    getFullscreen(): boolean {
        return this.displayCanvas === document.fullscreenElement;
    }

    /** Does the canvas have focus? */
    hasFocus(): boolean {
        return document.activeElement === this.displayCanvas;
    }

    /** Set fullscreen. */
    setFullscreen(fullscreen: boolean) {
        if (fullscreen) {
            this.displayCanvas.requestFullscreen();
            this.displayCanvas.focus();
        } else {
            if (this.getFullscreen()) {
                document.exitFullscreen();
            }
        }
    }

    /** 
     * Called internally by the engine before
     * rendering a frame.
     */
    private preDraw() {
        const native = this.renderCanvas == this.displayCanvas;
        if (native) {
            const realSize = this.getDisplayPixelSize();
            if ((realSize[0] != this.displayCanvas.width ||
              realSize[1] != this.displayCanvas.height) &&
              !this.resizeTimeoutId)
            {
              /** In native scaling mode, zooming and resizing the window cause us
               * to set canvas width and height every frame, which could cause
               * tons of canvas bitmap reallocations. So wait 1/4 second..
               */
              Canvas.setCanvasElemSize(this.displayCanvas, realSize);
              this.dispatchResize(realSize);
              this.resizeTimeoutId = setTimeout(() => { this.resizeTimeoutId = 0; }, 250);
            }
        }
        const ctx = this.renderCanvas.getContext('2d')!
        ctx.resetTransform();
        ctx.imageSmoothingEnabled = native;
    }

    /** Called every frame by the engine after drawing */
    private postDraw() {
        if (this.renderCanvas != this.displayCanvas) {
            /* We're in pixelart mode,
             * so set output canvas size to an ideal integer scale.
             * No debounce: changes to integer ratio are infrequent.
             */
            Canvas.setCanvasElemSize(
                this.displayCanvas,
                Vec2.mul(
                    this.getSize(),
                    Math.round(calcAspectFriendlyScale(
                        this.getSize(), this.getDisplayPixelSize())
                    )
                )
            );

            // Copy the internal canvas to the visible one.
            const ctx = this.displayCanvas.getContext('2d')!;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                this.renderCanvas,
                0, 0, this.renderCanvas.width, this.renderCanvas.height,
                0, 0, this.displayCanvas.width, this.displayCanvas.height,
            );
        }
    }

    /** @returns if size was changed.  */
static setCanvasElemSize(canvas: LikeCanvasElement, newSize: Vector2): boolean {
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        if (canvas.width === newSize[0] && canvas.height === newSize[1]) return false;

        canvas.width = newSize[0];
        canvas.height = newSize[1];
        return true;
    }

    static getCanvasElemSize(canvas: LikeCanvasElement): Vector2 {
        return [canvas.width, canvas.height];
    }
}

/** How much could this image be scaled, preserving aspect? */
function calcAspectFriendlyScale(imageSize: Vector2, containerSize: Vector2): number {
    return Math.min(...Vec2.div(containerSize, imageSize));
}
