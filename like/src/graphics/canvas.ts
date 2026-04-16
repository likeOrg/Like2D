// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import { type Dispatcher, type LikeCanvasElement } from "../events";
import { Rect, Rectangle } from "../math/rect";
import { Vec2, type Vector2 } from "../math/vector2";

/** passed into {@link Canvas.setMode} */
export type CanvasModeOptions = { fullscreen: boolean };
/** passed into {@link Canvas.setMode} */
export type CanvasSize = Vector2 | 'native';

/**
 * A manager for the HTML canvas element, similar to `love.window`.
 * 
 * Controls game size / scaling -- both native and pixelart mode via {@link Canvas.setMode}, as well as fullscreen functions.
 * 
 * The canvas keeps two canvases: render and display. Each frame, it copies render to display before the canvas is presented.
 * This allows for pixel-accurate scaling in fixed mode.
 */
export class Canvas {
    /** The canvas that we're drawing to with `like.gfx` functions.  */
    private renderCanvas: LikeCanvasElement;

    private resizeTimeoutId: any = 0;
    private isNativeMode = true;

    constructor(
        /** The ultimately visible canvas in the browser */
        private displayCanvas: LikeCanvasElement,
        private dispatch: Dispatcher<'resize'>,
        private abort: AbortSignal,
    ) {
        displayCanvas.tabIndex = 0;
        displayCanvas.style.width = '100%';
        displayCanvas.style.height = '100%';
        displayCanvas.style.objectFit = 'contain';
        
        // Always create a separate render canvas
        this.renderCanvas = document.createElement('canvas') as LikeCanvasElement;
        
        this.setMode('native');

        /** Only the canvas can really transform the mouse to the game size.
         * This hack sends an event for the mouse module to listen to.
         */
        this.displayCanvas.addEventListener('mousemove', (ev: MouseEvent) => {
            const rawPos: Vector2 = [ev.offsetX, ev.offsetY];
            const rawDelta: Vector2 = [ev.movementX, ev.movementY];

            /* Recreation of object-fit */

            const csize: Vector2 = [
                this.displayCanvas.clientWidth,
                this.displayCanvas.clientHeight
            ];
            /* Scale of both dimensions */
            const scale: number = calcAspectFriendlyScale(this.getSize(), csize);
            /* Upper-left corner */
            const offset = Vec2.div(
                Vec2.sub(csize, Vec2.mul(this.getSize(), scale)),
                2,
            );
            const pos = Vec2.div(
                Vec2.sub(rawPos, offset),
                scale
            );
            const delta = Vec2.div(rawDelta, scale);

            /* Only handle mousemove events that are in bounds. */
            if (!Rect.containsPoint(this.getRect(), pos)) {
                return;
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

    /**
     * Escape hatch: use at your own risk!
     *
     * Get the 2d canvas context that graphics functions render to.
     * This is separate from the display canvas; it is
     * not visibly exposed but rather copied each frame.
    */
    getContext(): CanvasRenderingContext2D {
        return this.renderCanvas.getContext('2d')!;
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
     * @param size
     * ### `'native'`
     * Keeps the canvas pixel resolution
     * the same as the physical pixel resolution of the
     * device.
     *
     * ### Pixel art mode `[width, height]`
     * The canvas will use prescaling to keep your pixel
     * games looking sharp, but without the uneven pixels
     * caused by the naive approach.
     *
     * @param optionally set fullscreen
     */
    setMode(size: CanvasSize, flags: Partial<CanvasModeOptions> = {}) {
        this.isNativeMode = size === 'native';
        
        if (size !== 'native') {
            const changed = Canvas.setCanvasElemSize(this.renderCanvas, size);
            if (changed) {
                this.dispatchResize(size);
            }
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
     * Trigered by `like:preDraw` 
     */
    private preDraw() {
        if (this.isNativeMode) {
            // In native mode, renderCanvas tracks display size
            const realSize = this.getDisplayPixelSize();
            if ((realSize[0] != this.renderCanvas.width ||
              realSize[1] != this.renderCanvas.height) &&
              !this.resizeTimeoutId)
            {
              /** In native scaling mode, zooming and resizing the window cause us
               * to set canvas width and height every frame, which could cause
               * tons of canvas bitmap reallocations. So wait 1/4 second..
               */
              Canvas.setCanvasElemSize(this.renderCanvas, realSize);
              this.dispatchResize(realSize);
              this.resizeTimeoutId = setTimeout(() => { this.resizeTimeoutId = 0; }, 250);
            }
        }
        
        const ctx = this.renderCanvas.getContext('2d')!
        ctx.resetTransform();
        // Enable smoothing in native mode, disable in pixelart mode
        ctx.imageSmoothingEnabled = this.isNativeMode;
    }

    /** Triggered by `like:postDraw` */
    private postDraw() {
        // Always blit from render canvas to display canvas
        if (this.isNativeMode) {
            // In native mode, display canvas matches render canvas size
            Canvas.setCanvasElemSize(this.displayCanvas, this.getSize());
        } else {
            // In pixelart mode, set output canvas size to an ideal integer scale
            Canvas.setCanvasElemSize(
                this.displayCanvas,
                Vec2.mul(
                    this.getSize(),
                    Math.round(calcAspectFriendlyScale(
                        this.getSize(), this.getDisplayPixelSize())
                    )
                )
            );
        }

        // Copy the render canvas to the visible one
        const displayCtx = this.displayCanvas.getContext('2d')!;
        displayCtx.imageSmoothingEnabled = false;
        displayCtx.drawImage(
            this.renderCanvas,
            0, 0, this.renderCanvas.width, this.renderCanvas.height,
            0, 0, this.displayCanvas.width, this.displayCanvas.height,
        );
    }

    /** @returns if size was changed.  */
    static setCanvasElemSize(canvas: LikeCanvasElement, newSize: Vector2): boolean {
        if (canvas.width === newSize[0] && canvas.height === newSize[1]) return false;
        [canvas.width, canvas.height] = newSize;
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
