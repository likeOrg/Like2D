import { EngineDispatch } from "../engine";
import { Rect, Rectangle } from "../math/rect";
import { Vec2, type Vector2 } from "../math/vector2";

export type CanvasModeOptions = { fullscreen: boolean };
export type CanvasSize = Vector2 | 'native';

export class CanvasInternal {
    /** The ultimately visible canvas in the browser */
    public _displayCanvas: HTMLCanvasElement;
    /** The canvas that we're drawing to with `like.gfx` functions.
     * If it's the same as _displayCanvas, we're in native mode.
     * Otherwise, we're in pixelart mode, consisting of nearest -> linear scaling.
    */
    public _renderCanvas: HTMLCanvasElement;

    private resizeTimeoutId: number = 0;
    private abort = new AbortController();

    constructor(public dispatch: EngineDispatch) {
        this._displayCanvas = document.createElement('canvas');
        this._displayCanvas.tabIndex = 0;
        this._displayCanvas.style.width = '100%';
        this._displayCanvas.style.height = '100%';
        this._renderCanvas = this._displayCanvas;
        this.setMode('native');

        /** Only the canvas can really transform the mouse to the game size.
         * This hack sends an event for the mouse module to listen to.
         */
        this._displayCanvas.addEventListener('mousemove', (ev: MouseEvent) => {
            let pos;
            let delta;
            const rawPos: Vector2 = [ev.offsetX, ev.offsetY];
            const rawDelta: Vector2 = [ev.movementX, ev.movementY];

            if (this._renderCanvas == this._displayCanvas) {
                /* Native mode. */
                pos = Vec2.mul(rawPos, window.devicePixelRatio ?? 1);
                delta = Vec2.mul(rawDelta, window.devicePixelRatio ?? 1);
            } else {
                /* Pixelart mode. This math simulates object-fit: contain,
                * which preserves aspect ratio.
                */
                const csize: Vector2 = [
                    this._displayCanvas.clientWidth,
                    this._displayCanvas.clientHeight
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

            this._displayCanvas.dispatchEvent(new CustomEvent('like:mousemoved', {
                detail: {
                    pos,
                    delta,
                }
            }));
        }, { signal: this.abort.signal })
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
        const prevRenderCanvas = this._renderCanvas;
        if (size == 'native') {
            this._displayCanvas.style.objectFit = 'fill';
            this._renderCanvas = this._displayCanvas;
        } else {
            this._displayCanvas.style.objectFit = 'contain';
            this._renderCanvas = document.createElement('canvas');
            const changed = CanvasInternal.setCanvasElemSize(this._renderCanvas, size);
            if (changed) {
                this.dispatchResize(size);
            }
        }
        if (prevRenderCanvas != this._renderCanvas) {
            this._displayCanvas.dispatchEvent(
              new CustomEvent("like:updateRenderTarget", {
                detail: {
                  target: this._renderCanvas,
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
        return [this._renderCanvas.width, this._renderCanvas.height];
    }

    dispatchResize(size: Vector2) {
        this._displayCanvas.dispatchEvent(
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
    _getDisplayPixelSize(): Vector2 {
        return Vec2.round(Vec2.mul(
            [this._displayCanvas.clientWidth, this._displayCanvas.clientHeight],
            window.devicePixelRatio ?? 1,
        ));
    }

    /** Are we fullscreen? */
    getFullscreen(): boolean {
        return this._displayCanvas === document.fullscreenElement;
    }

    /** Set fullscreen. */
    setFullscreen(fullscreen: boolean) {
        if (fullscreen) {
            this._displayCanvas.requestFullscreen();
            this._displayCanvas.focus();
        } else {
            document.exitFullscreen();
        }
    }

    /** Called every frame by the engine after drawing */
    _present() {
        if (this._renderCanvas == this._displayCanvas) {
            const realSize = this._getDisplayPixelSize();
            if ((realSize[0] != this._displayCanvas.width ||
              realSize[1] != this._displayCanvas.height) &&
              !this.resizeTimeoutId)
            {
              /** In native scaling mode, zooming and resizing the window cause us
               * to set canvas width and height every frame, which could cause
               * tons of canvas bitmap reallocations. So wait 1/4 second..
               */
              CanvasInternal.setCanvasElemSize(this._displayCanvas, realSize);
              this.dispatchResize(realSize);
              this.resizeTimeoutId = setTimeout(() => { this.resizeTimeoutId = 0; }, 250);
            }
        } else if (this._renderCanvas != this._displayCanvas) {
            /* We're in pixelart mode,
             * so set output canvas size to an ideal integer scale.
             * No debounce: changes to integer ratio are infrequent.
             */
            CanvasInternal.setCanvasElemSize(
                this._displayCanvas,
                Vec2.mul(
                    this.getSize(),
                    Math.round(calcAspectFriendlyScale(
                        this.getSize(), this._getDisplayPixelSize())
                    )
                )
            );

            // Copy the internal canvas to the visible one.
            const ctx = this._displayCanvas.getContext('2d')!;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                this._renderCanvas,
                0, 0, this._renderCanvas.width, this._renderCanvas.height,
                0, 0, this._displayCanvas.width, this._displayCanvas.height,
            );
        }
    }

    /** @returns if size was changed.  */
    static setCanvasElemSize(canvas: HTMLCanvasElement, newSize: Vector2): boolean {
        if (canvas.width != newSize[0] || canvas.height != newSize[1]) {
            [canvas.width, canvas.height] = newSize;
            return true;
        }
        return false;
    }
    static getCanvasElemSize(canvas: HTMLCanvasElement): Vector2 {
        return [canvas.width, canvas.height];
    }

    _dispose(): void {
        this.abort.abort();
    }
}

/** How much could this image be scaled, preserving aspect? */
function calcAspectFriendlyScale(imageSize: Vector2, containerSize: Vector2): number {
    return Math.min(...Vec2.div(containerSize, imageSize));
}
