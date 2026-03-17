export class ImageHandle {
    constructor(path) {
        Object.defineProperty(this, "path", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "element", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "loadPromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isLoaded", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
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
    isReady() {
        return this.isLoaded;
    }
    ready() {
        return this.loadPromise;
    }
    get size() {
        return [this.element?.width ?? 0, this.element?.height ?? 0];
    }
    getElement() {
        return this.element;
    }
}
function parseColor(color) {
    if (typeof color === 'string')
        return color;
    const [r, g, b, a = 1] = color;
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}
function applyColor(color) {
    return parseColor(color ?? [1, 1, 1, 1]);
}
function setStrokeProps(ctx, props) {
    ctx.lineWidth = props?.lineWidth ?? 1;
    ctx.lineCap = props?.lineCap ?? 'butt';
    ctx.lineJoin = props?.lineJoin ?? 'miter';
    ctx.miterLimit = props?.miterLimit ?? 10;
}
export function newState(ctx) {
    return {
        screenCtx: ctx,
        currentCtx: ctx,
        canvases: new Map(),
    };
}
export function clear(s, color = [0, 0, 0, 1]) {
    const ctx = s.currentCtx;
    ctx.fillStyle = parseColor(color);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
export function rectangle(s, mode, color, rect, props) {
    const ctx = s.currentCtx;
    const [x, y, w, h] = rect;
    const c = applyColor(color);
    if (mode === 'fill') {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, w, h);
    }
    else {
        setStrokeProps(ctx, props);
        ctx.strokeStyle = c;
        ctx.strokeRect(x, y, w, h);
    }
}
export function circle(s, mode, color, position, radii, props) {
    const ctx = s.currentCtx;
    const [x, y] = position;
    const c = applyColor(color);
    const [rx, ry] = typeof radii === 'number' ? [radii, radii] : radii;
    const [startAngle, endAngle] = props?.arc ?? [0, Math.PI * 2];
    const rotation = props?.angle ?? 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(rx, ry);
    ctx.beginPath();
    ctx.arc(0, 0, 1, startAngle, endAngle);
    ctx.closePath();
    ctx.restore();
    if (mode === 'fill') {
        ctx.fillStyle = c;
        ctx.fill();
    }
    else {
        setStrokeProps(ctx, props);
        ctx.strokeStyle = c;
        ctx.stroke();
    }
}
export function line(s, color, points, props) {
    const ctx = s.currentCtx;
    if (points.length < 2)
        return;
    setStrokeProps(ctx, props);
    ctx.beginPath();
    const [[x0, y0], ...rest] = points;
    ctx.moveTo(x0, y0);
    rest.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = applyColor(color);
    ctx.stroke();
}
export function print(s, color, text, position, props) {
    const ctx = s.currentCtx;
    const [x, y] = position;
    const { font = '16px sans-serif', limit, align = 'left' } = props ?? {};
    ctx.fillStyle = parseColor(color);
    ctx.font = font;
    if (limit !== undefined) {
        const lines = wrapText(ctx, text, limit);
        const lineHeight = getFontHeight(ctx);
        lines.forEach((line, i) => {
            const lineWidth = ctx.measureText(line).width;
            const drawX = align === 'center' ? x + (limit - lineWidth) / 2
                : align === 'right' ? x + limit - lineWidth
                    : x;
            ctx.fillText(line, drawX, y + i * lineHeight);
        });
    }
    else {
        ctx.fillText(text, x, y);
    }
}
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const [first, ...rest] = words;
    const lines = [];
    let current = first ?? '';
    rest.forEach(word => {
        if (ctx.measureText(current + ' ' + word).width < maxWidth) {
            current += ' ' + word;
        }
        else {
            lines.push(current);
            current = word;
        }
    });
    lines.push(current);
    return lines;
}
function getFontHeight(ctx) {
    const match = ctx.font.match(/(\d+)px/);
    return match ? parseInt(match[1]) : 16;
}
export function drawImage(s, handle, position, props) {
    const ctx = s.currentCtx;
    if (!handle.isReady())
        return;
    const element = handle.getElement();
    if (!element)
        return;
    const [x, y] = position;
    const { r = 0, scale = 1, origin = 0, quad } = props ?? {};
    const [sx, sy] = typeof scale === 'number' ? [scale, scale] : scale;
    const [ox, oy] = typeof origin === 'number' ? [origin, origin] : origin;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r);
    ctx.scale(sx, sy);
    if (quad) {
        const [qx, qy, qw, qh] = quad;
        ctx.drawImage(element, qx, qy, qw, qh, -ox, -oy, qw, qh);
    }
    else {
        ctx.drawImage(element, -ox, -oy);
    }
    ctx.restore();
}
export function getCanvasSize(s) {
    return [s.currentCtx.canvas.width, s.currentCtx.canvas.height];
}
export function newImage(_s, path) {
    return new ImageHandle(path);
}
export function newCanvas(s, size) {
    const [w, h] = size;
    const element = document.createElement('canvas');
    element.width = w;
    element.height = h;
    const ctx = element.getContext('2d');
    if (!ctx)
        throw new Error('Failed to create canvas context');
    const canvas = { size, element, ctx };
    s.canvases.set(canvas, true);
    return canvas;
}
export function setCanvas(s, canvas) {
    s.currentCtx = canvas?.ctx ?? s.screenCtx;
}
export function clip(s, rect) {
    const ctx = s.currentCtx;
    ctx.beginPath();
    if (rect) {
        const [x, y, w, h] = rect;
        ctx.rect(x, y, w, h);
    }
    else {
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctx.clip();
}
export function polygon(s, mode, color, points, props) {
    const ctx = s.currentCtx;
    if (points.length < 3)
        return;
    const c = applyColor(color);
    ctx.beginPath();
    const [[x0, y0], ...rest] = points;
    ctx.moveTo(x0, y0);
    rest.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();
    if (mode === 'fill') {
        ctx.fillStyle = c;
        ctx.fill();
    }
    else {
        setStrokeProps(ctx, props);
        ctx.strokeStyle = c;
        ctx.stroke();
    }
}
export function points(s, color, pts) {
    const ctx = s.currentCtx;
    ctx.fillStyle = applyColor(color);
    pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
}
export function push(s) {
    s.currentCtx.save();
}
export function pop(s) {
    s.currentCtx.restore();
}
export function translate(s, offset) {
    const [x, y] = offset;
    s.currentCtx.translate(x, y);
}
export function rotate(s, angle) {
    s.currentCtx.rotate(angle);
}
export function scale(s, factor) {
    const [sx, sy] = typeof factor === 'number' ? [factor, factor] : factor;
    s.currentCtx.scale(sx, sy);
}
const graphicsFns = {
    clear, rectangle, circle, line, print,
    draw: drawImage, getCanvasSize, newCanvas, setCanvas,
    clip, polygon, points, newImage,
    push, pop, translate, rotate, scale,
};
export function bindGraphics(s) {
    const bound = {};
    for (const [name, fn] of Object.entries(graphicsFns)) {
        bound[name] = (...args) => fn(s, ...args);
    }
    return bound;
}
