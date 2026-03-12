# API Style

## Design Principles

**Functions over classes** - Where possible, use functions instead of classes. Easier to tree-shake, simpler to understand.

**Named exports only** - No default exports. Every import is explicit:

```typescript
import { like, Scene } from './like/index.ts';
```

**0-1 color range** - Colors use 0.0-1.0 floats, not 0-255. Matches shaders, easier mental math.

**Canvas coordinates** - (0,0) at top-left, Y increases downward. Matches HTML Canvas and CSS.

**Props tables for optional args** - Required values as positional args, optional values in a trailing object:

```typescript
// Required: path. Optional: volume, pitch, looping in props table
const source = like.audio.newSource('sound.ogg', { volume: 0.5, looping: true });

// Required: mode, position, size. Optional: color, lineWidth in props
like.graphics.rectangle('fill', 100, 100, 50, 50, { color: [1, 0, 0] });

// Required: text, position. Optional: color, font, wrapping in props
like.graphics.print('Hello', 100, 100, { color: [1, 1, 1], limit: 200, align: 'center' });

// Required: image, position. Optional: quad, rotation, scale in props
like.graphics.draw(playerImage, x, y, { quad: spriteQuad, r: rotation, sx: 2 });
```

## Global Singleton

The `like` object is a global singleton. This is intentional:

- Games typically have one graphics context, one audio system
- No dependency injection boilerplate
- Easy to access from anywhere

For testing or multiple instances, create a new Like instance (though this is rarely needed).

## TypeScript First

All APIs are designed for TypeScript:
- Strong typing on all public APIs
- Interfaces for extensibility (Scene, ImageHandle)
- Discriminated unions where appropriate

## Error Handling

**Fail silently for rendering** - Drawing unloaded assets does nothing. Games shouldn't crash because an image hasn't loaded yet.

**Throw for programmer errors** - Invalid arguments, missing required parameters. Fail fast during development.

**Console warnings for recoverable issues** - Audio play failures (browser autoplay policy), missing gamepad mappings. Logged but not fatal.
