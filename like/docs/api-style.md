# API Style

## Design Principles

**Named exports only** - No default exports. Every import is explicit.

**0-1 color range** - Colors use 0.0-1.0, not 0-255.

**Seconds** - No milliseconds.

**Canvas coordinates** - (0,0) at top-left, Y increases downward. Matches HTML Canvas and CSS.

**Props tables for optional args** - Required values as positional args, optional values in a trailing object:

```typescript
// Required: path. Optional: volume, pitch, looping in props table
const source = like.audio.newSource('sound.ogg', { volume: 0.5, looping: true });

// Required: mode, color, rect. Optional: lineWidth in props
like.graphics.rectangle('fill', [1, 0, 0], [100, 100, 50, 50]);

// Required: color, text, position. Optional: font, wrapping in props
like.graphics.print([1, 1, 1], 'Hello', [100, 100], { limit: 200, align: 'center' });
```

**Tuple types for coordinates** - Use `Vector2` and `Rect` tuples for geometric data:

```typescript
// Vector2 is a two-item array: [x, y]
type Vector2 = [number, number];

// Rect is a four-item array: [x, y, width, height]
type Rect = [number, number, number, number];

// Use the Vec2 module for vector operations
import { Vec2 } from 'like2d';

const position: Vector2 = [100, 200];
const velocity: Vector2 = [10, 5];
const newPos = Vec2.add(position, velocity);  // [110, 205]
```

## TypeScript First

All APIs are designed for TypeScript:
- Strong typing on all public APIs
- Interfaces for extensibility (Scene, ImageHandle)
- Discriminated unions where appropriate

## Error Handling

**Fail silently for rendering** - Drawing unloaded assets does nothing. Games shouldn't crash because an image hasn't loaded yet.

**Throw for programmer errors** - Invalid arguments, missing required parameters. Fail fast during development.

**Console warnings for recoverable issues** - Audio play failures (browser autoplay policy), missing gamepad mappings. Logged but not fatal.
