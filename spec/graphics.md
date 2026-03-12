# Graphics API

This document defines the graphics rendering API for Like2D.

## Design Principles

- **Required args first**: All required values are positional arguments
- **Optional values in props**: All optional values in a trailing props object
- **Color as property**: Color is part of the props, not a separate setColor call
- **Simplified functions**: Combined functions where semantics are similar (draw/drawq, print/printf)

## Type Definitions

```typescript
type Color = [number, number, number, number?] | string;
type Quad = [number, number, number, number];
```

### Color
Colors can be specified in two ways:
- Array form: `[r, g, b, a?]` where values are 0.0-1.0 floats (default alpha: 1.0)
- String form: Any valid CSS color string

### Quad
Defines a sub-region of an image as `[x, y, width, height]`.

## Shape Drawing

### rectangle
Draw a rectangle.

```typescript
rectangle(mode: 'fill' | 'line', x: number, y: number, width: number, height: number, props?: {
  color?: Color;
  lineWidth?: number;
}): void
```

### circle
Draw a circle.

```typescript
circle(mode: 'fill' | 'line', x: number, y: number, radius: number, props?: {
  color?: Color;
  lineWidth?: number;
}): void
```

### line
Draw a polyline connecting points.

```typescript
line(points: number[], props?: {
  color?: Color;
  lineWidth?: number;
}): void
```

Points are specified as a flat array: `[x1, y1, x2, y2, ...]`

### polygon
Draw a polygon.

```typescript
polygon(mode: 'fill' | 'line', points: number[], props?: {
  color?: Color;
  lineWidth?: number;
}): void
```

Points are specified as a flat array: `[x1, y1, x2, y2, ...]`

### arc
Draw an arc (pie slice or arc segment).

```typescript
arc(mode: 'fill' | 'line', x: number, y: number, radius: number, angle1: number, angle2: number, props?: {
  color?: Color;
  lineWidth?: number;
}): void
```

### points
Draw individual points (pixels).

```typescript
points(points: number[], props?: {
  color?: Color;
}): void
```

Points are specified as a flat array: `[x1, y1, x2, y2, ...]`

## Image Drawing

### draw
Draw an image or a sub-region (quad) of an image. If a quad is provided, draws that region.

```typescript
draw(
  handle: ImageHandle | string,
  x: number,
  y: number,
  props?: {
    color?: Color;
    quad?: Quad;
    r?: number;      // rotation in radians (default: 0)
    sx?: number;     // scale x (default: 1)
    sy?: number;     // scale y (default: sx)
    ox?: number;     // origin x offset (default: 0)
    oy?: number;     // origin y offset (default: 0)
  }
): void
```

## Text Rendering

### print
Draw text. If `limit` is provided, wraps text to that width.

```typescript
print(
  text: string,
  x: number,
  y: number,
  props?: {
    color?: Color;
    font?: string;   // font string, e.g., "16px sans-serif"
    limit?: number;  // max width for wrapping (if provided, enables wrapping)
    align?: 'left' | 'center' | 'right';  // alignment when wrapping (default: 'left')
  }
): void
```

## Coordinate Transformations

### push
Save the current transformation state.

```typescript
push(): void
```

### pop
Restore the previous transformation state.

```typescript
pop(): void
```

### translate
Translate the coordinate system.

```typescript
translate(x: number, y: number): void
```

### rotate
Rotate the coordinate system.

```typescript
rotate(angle: number): void
```

### scale
Scale the coordinate system.

```typescript
scale(x: number, y?: number): void  // y defaults to x
```

## State Management

### clear
Clear the canvas with the background color.

```typescript
clear(): void
```

### setBackgroundColor
Set the background color (used by clear).

```typescript
setBackgroundColor(color: number[] | string): void
```

## Font Management

### setFont
Set the current font (used when text props don't specify a font).

```typescript
setFont(size: number, font?: string): void  // font defaults to 'sans-serif'
```

### getFont
Get the current font string.

```typescript
getFont(): string
```

## Image Loading

### newImage
Load an image and return a handle. Images are cached by path.

```typescript
newImage(path: string): ImageHandle
```

### ImageHandle

```typescript
interface ImageHandle {
  readonly path: string;
  isReady(): boolean;
  ready(): Promise<void>;
  readonly width: number;
  readonly height: number;
}
```

## Canvas Info

### getWidth
Get the canvas width in pixels.

```typescript
getWidth(): number
```

### getHeight
Get the canvas height in pixels.

```typescript
getHeight(): number
```

## Examples

### Basic Shapes

```typescript
// Filled red rectangle
like.graphics.rectangle('fill', 100, 100, 50, 50, { color: [1, 0, 0] });

// Outlined green circle
like.graphics.circle('line', 200, 200, 30, { color: [0, 1, 0] });

// Blue line
like.graphics.line([0, 0, 100, 100, 200, 50], { color: [0, 0, 1] });

// Purple polygon
like.graphics.polygon('fill', [100, 100, 150, 150, 100, 200, 50, 150], { 
  color: [0.8, 0.3, 0.8] 
});
```

### Images

```typescript
const img = like.graphics.newImage('player.png');

// Draw at position
like.graphics.draw(img, 100, 100);

// Draw with rotation and scaling
like.graphics.draw(img, 200, 200, { r: Math.PI / 4, sx: 2, sy: 2 });

// Draw with a quad (sub-region)
like.graphics.draw(img, 300, 300, {
  quad: [0, 0, 32, 32],
  sx: 2,
  sy: 2
});
```

### Text

```typescript
// Simple text
like.graphics.print('Hello', 100, 100, { color: [1, 1, 1] });

// With custom font
like.graphics.print('World', 100, 150, { 
  color: [1, 1, 0],
  font: '24px monospace'
});

// Wrapped text
like.graphics.print('This is a long text that will wrap', 100, 200, {
  color: [1, 1, 1],
  limit: 200,
  align: 'center'
});
```

### Coordinate Transformations

```typescript
like.graphics.push();
like.graphics.translate(100, 100);
like.graphics.rotate(Math.PI / 4);
like.graphics.rectangle('fill', -25, -25, 50, 50, { color: [1, 0, 0] });
like.graphics.pop();
```
