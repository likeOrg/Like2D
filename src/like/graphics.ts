type DrawMode = 'fill' | 'line';

export type Color = [number, number, number, number?] | string;
export type Quad = [number, number, number, number];

export type ShapeProps = {
  color?: Color;
  lineWidth?: number;
};

export type DrawProps = ShapeProps & {
  quad?: Quad;
  r?: number;
  sx?: number;
  sy?: number;
  ox?: number;
  oy?: number;
};

export type PrintProps = {
  color?: Color;
  font?: string;
  limit?: number;
  align?: 'left' | 'center' | 'right';
};

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

  get width(): number {
    return this.element?.width ?? 0;
  }

  get height(): number {
    return this.element?.height ?? 0;
  }

  getElement(): HTMLImageElement | null {
    return this.element;
  }
}

function parseColor(color: Color): string {
  if (typeof color === 'string') {
    return color;
  }
  
  const [r, g, b, a = 1] = color;
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

export class Graphics {
  private ctx: CanvasRenderingContext2D | null = null;
  private backgroundColor: Color = [0, 0, 0, 1];
  private images = new Map<string, ImageHandle>();
  private defaultFont = '16px sans-serif';

  setContext(ctx: CanvasRenderingContext2D | null): void {
    this.ctx = ctx;
    if (ctx) {
      ctx.font = this.defaultFont;
    }
  }

  private applyColor(color?: Color): string {
    return parseColor(color ?? [1, 1, 1, 1]);
  }

  clear(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = parseColor(this.backgroundColor);
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  setBackgroundColor(color: Color): void {
    this.backgroundColor = color;
    this.clear();
  }

  rectangle(mode: DrawMode, x: number, y: number, width: number, height: number, props?: ShapeProps): void {
    if (!this.ctx) return;
    
    const color = this.applyColor(props?.color);
    
    if (mode === 'fill') {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, width, height);
    } else {
      this.ctx.strokeStyle = color;
      if (props?.lineWidth) {
        this.ctx.lineWidth = props.lineWidth;
      }
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  circle(mode: DrawMode, x: number, y: number, radius: number, props?: ShapeProps): void {
    if (!this.ctx) return;
    
    const color = this.applyColor(props?.color);
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (mode === 'fill') {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      if (props?.lineWidth) {
        this.ctx.lineWidth = props.lineWidth;
      }
      this.ctx.stroke();
    }
  }

  line(points: number[], props?: ShapeProps): void {
    if (!this.ctx || points.length < 4) return;
    
    const color = this.applyColor(props?.color);
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0], points[1]);
    
    for (let i = 2; i < points.length; i += 2) {
      if (i + 1 < points.length) {
        this.ctx.lineTo(points[i], points[i + 1]);
      }
    }
    
    this.ctx.strokeStyle = color;
    if (props?.lineWidth) {
      this.ctx.lineWidth = props.lineWidth;
    }
    this.ctx.stroke();
  }

  print(text: string, x: number, y: number, props?: PrintProps): void {
    if (!this.ctx) return;
    
    const color = this.applyColor(props?.color);
    this.ctx.fillStyle = color;
    
    if (props?.font) {
      this.ctx.font = props.font;
    } else {
      this.ctx.font = this.defaultFont;
    }
    
    if (props?.limit !== undefined) {
      const lines = this.wrapText(text, props.limit);
      const lineHeight = this.getFontHeight();
      const align = props.align ?? 'left';
      
      lines.forEach((line, index) => {
        let drawX = x;
        const lineWidth = this.ctx!.measureText(line).width;
        
        if (align === 'center') {
          drawX = x + (props.limit! - lineWidth) / 2;
        } else if (align === 'right') {
          drawX = x + props.limit! - lineWidth;
        }
        
        this.ctx!.fillText(line, drawX, y + index * lineHeight);
      });
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    if (!this.ctx) return [text];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = this.ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  private getFontHeight(): number {
    if (!this.ctx) return 16;
    const match = this.ctx.font.match(/(\d+)px/);
    return match ? parseInt(match[1]) : 16;
  }

  setFont(size: number, font: string = 'sans-serif'): void {
    if (!this.ctx) return;
    this.defaultFont = `${size}px ${font}`;
    this.ctx.font = this.defaultFont;
  }

  getFont(): string {
    return this.defaultFont;
  }

  newImage(path: string): ImageHandle {
    let handle = this.images.get(path);
    if (!handle) {
      handle = new ImageHandle(path);
      this.images.set(path, handle);
    }
    return handle;
  }

  draw(
    handle: ImageHandle | string,
    x: number,
    y: number,
    props?: DrawProps
  ): void {
    if (!this.ctx) return;
    
    let imageHandle: ImageHandle | undefined;
    
    if (typeof handle === 'string') {
      imageHandle = this.images.get(handle);
      if (!imageHandle) {
        return;
      }
    } else {
      imageHandle = this.images.get(handle.path);
    }
    
    if (!imageHandle || !imageHandle.isReady()) {
      return;
    }
    
    const element = imageHandle.getElement();
    if (!element) return;
    
    const r = props?.r ?? 0;
    const sx = props?.sx ?? 1;
    const sy = props?.sy ?? sx;
    const ox = props?.ox ?? 0;
    const oy = props?.oy ?? 0;
    const quad = props?.quad;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(r);
    this.ctx.scale(sx, sy);
    
    if (quad) {
      const [qx, qy, qw, qh] = quad;
      this.ctx.drawImage(element, qx, qy, qw, qh, -ox, -oy, qw, qh);
    } else {
      this.ctx.drawImage(element, -ox, -oy);
    }
    
    this.ctx.restore();
  }

  push(): void {
    if (!this.ctx) return;
    this.ctx.save();
  }

  pop(): void {
    if (!this.ctx) return;
    this.ctx.restore();
  }

  translate(x: number, y: number): void {
    if (!this.ctx) return;
    this.ctx.translate(x, y);
  }

  rotate(angle: number): void {
    if (!this.ctx) return;
    this.ctx.rotate(angle);
  }

  scale(x: number, y: number = x): void {
    if (!this.ctx) return;
    this.ctx.scale(x, y);
  }

  getWidth(): number {
    return this.ctx?.canvas.width ?? 800;
  }

  getHeight(): number {
    return this.ctx?.canvas.height ?? 600;
  }

  polygon(mode: DrawMode, points: number[], props?: ShapeProps): void {
    if (!this.ctx || points.length < 6) return;
    
    const color = this.applyColor(props?.color);
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0], points[1]);
    
    for (let i = 2; i < points.length; i += 2) {
      this.ctx.lineTo(points[i], points[i + 1]);
    }
    
    this.ctx.closePath();
    
    if (mode === 'fill') {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      if (props?.lineWidth) {
        this.ctx.lineWidth = props.lineWidth;
      }
      this.ctx.stroke();
    }
  }

  arc(mode: DrawMode, x: number, y: number, radius: number, angle1: number, angle2: number, props?: ShapeProps): void {
    if (!this.ctx) return;
    
    const color = this.applyColor(props?.color);
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, angle1, angle2);
    
    if (mode === 'fill') {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      if (props?.lineWidth) {
        this.ctx.lineWidth = props.lineWidth;
      }
      this.ctx.stroke();
    }
  }

  points(points: number[], props?: { color?: Color }): void {
    if (!this.ctx) return;
    
    const color = this.applyColor(props?.color);
    this.ctx.fillStyle = color;
    
    for (let i = 0; i < points.length; i += 2) {
      if (i + 1 < points.length) {
        this.ctx.fillRect(points[i], points[i + 1], 1, 1);
      }
    }
  }
}

export const graphics = new Graphics();
