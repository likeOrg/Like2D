import { Vec2 } from './vector2';
function setCanvasSize(canvas, size) {
    canvas.width = size[0];
    canvas.height = size[1];
}
function setCanvasDisplaySize(canvas, size) {
    canvas.style.width = `${size[0]}px`;
    canvas.style.height = `${size[1]}px`;
}
function centerElement(el) {
    el.style.position = 'absolute';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.transform = 'translate(-50%, -50%)';
}
export class CanvasManager {
    constructor(canvas, container, ctx, config = { pixelResolution: null, fullscreen: false }) {
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: canvas
        });
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: container
        });
        Object.defineProperty(this, "ctx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ctx
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "resizeObserver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "pixelCanvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "pixelCtx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "onWindowResize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.applyConfig()
        });
        Object.defineProperty(this, "onResize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.resizeObserver = new ResizeObserver(() => this.applyConfig());
        this.resizeObserver.observe(this.container);
        window.addEventListener('resize', this.onWindowResize);
        this.listenForPixelRatioChanges();
        this.applyConfig();
    }
    listenForPixelRatioChanges() {
        const media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        media.addEventListener('change', () => {
            this.applyConfig();
            this.listenForPixelRatioChanges();
        }, { once: true });
    }
    setMode(mode) {
        this.config = { ...this.config, ...mode };
        this.applyConfig();
    }
    getMode() {
        return { ...this.config };
    }
    applyConfig() {
        const containerSize = document.fullscreenElement
            ? [document.fullscreenElement.clientWidth, document.fullscreenElement.clientHeight]
            : [this.container.clientWidth, this.container.clientHeight];
        // Always clean up pixel canvas first
        if (this.pixelCanvas) {
            this.pixelCanvas.remove();
            this.pixelCanvas = null;
            this.pixelCtx = null;
        }
        if (this.config.pixelResolution) {
            this.applyPixelMode(containerSize);
        }
        else {
            this.applyNativeMode(containerSize);
        }
        const displayCanvas = this.pixelCanvas ?? this.canvas;
        this.onResize?.(containerSize, [displayCanvas.width, displayCanvas.height], this.config.fullscreen);
    }
    applyPixelMode(csize) {
        const gameSize = this.config.pixelResolution;
        const pixelRatio = window.devicePixelRatio || 1;
        const scale = Math.min(csize[0] / gameSize[0], csize[1] / gameSize[1]);
        const physicalScale = scale * pixelRatio;
        const intScale = Math.max(1, Math.floor(physicalScale));
        this.pixelCanvas = document.createElement('canvas');
        this.pixelCtx = this.pixelCanvas.getContext('2d');
        setCanvasSize(this.pixelCanvas, Vec2.mul(gameSize, intScale));
        setCanvasSize(this.canvas, gameSize);
        this.canvas.style.display = 'none';
        const pc = this.pixelCanvas;
        setCanvasDisplaySize(pc, Vec2.mul(gameSize, scale));
        pc.style.maxWidth = '100%';
        pc.style.maxHeight = '100%';
        pc.style.imageRendering = 'auto';
        centerElement(pc);
        this.container.appendChild(pc);
    }
    applyNativeMode(csize) {
        const pixelRatio = window.devicePixelRatio || 1;
        const canvasSize = Vec2.mul(csize, pixelRatio);
        setCanvasSize(this.canvas, Vec2.floor(canvasSize));
        setCanvasDisplaySize(this.canvas, csize);
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.style.transform = 'none';
        this.canvas.style.margin = '0';
        this.canvas.style.display = 'block';
        this.canvas.style.imageRendering = 'auto';
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    dispose() {
        this.resizeObserver?.disconnect();
        window.removeEventListener('resize', this.onWindowResize);
        this.pixelCanvas?.remove();
        this.pixelCanvas = null;
        this.pixelCtx = null;
    }
    present() {
        if (!this.pixelCtx || !this.pixelCanvas) {
            return;
        }
        this.pixelCtx.imageSmoothingEnabled = false;
        this.pixelCtx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.pixelCanvas.width, this.pixelCanvas.height);
    }
    getDisplayCanvas() {
        return this.pixelCanvas ?? this.canvas;
    }
    transformMousePosition(cssX, cssY) {
        const displayCanvas = this.getDisplayCanvas();
        const rect = displayCanvas.getBoundingClientRect();
        const relative = [cssX - rect.left, cssY - rect.top];
        if (this.config.pixelResolution) {
            // In pixel mode: CSS position (as fraction of CSS size) × game size = game position
            const gameSize = this.config.pixelResolution;
            return Vec2.mul(relative, [gameSize[0] / rect.width, gameSize[1] / rect.height]);
        }
        else {
            // In native mode, canvas fills the container completely at position 0,0
            // Mouse coordinates should be relative to the canvas, accounting for the fact
            // that the canvas internal pixel size != CSS size
            const pixelRatio = window.devicePixelRatio || 1;
            return Vec2.mul(relative, pixelRatio);
        }
    }
}
