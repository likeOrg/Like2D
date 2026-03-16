# Changelog

## V2.5.0

### Graphics API Refactor

**Removed stateful methods:**
- `setBackgroundColor(color)` → Use `clear(color)` directly
- `setFont(size, font)` → Pass `font` prop to `print()`
- `getFont()` → Removed (no global font state)

**Removed functions:**
- `arc(mode, x, y, radius, angle1, angle2, props)` → Use `circle()` with `arc` prop:
  ```typescript
  // Before: g.arc('fill', 100, 100, 50, 0, Math.PI)
  // After:
  g.circle('fill', 'red', [100, 100], 50, { arc: [0, Math.PI] });
  ```

**New architecture:**
```typescript
// Before
import { graphics } from 'like2d/callback';
like.draw = (canvas) => {
  graphics.setBackgroundColor('black');
  graphics.setFont(24);
  graphics.circle('fill', 'red', [100, 100], 50);
};

// After
import { graphics, love } from 'like2d/callback';
const image = graphics.newImage('sprite.png');

like.draw = (g) => {
  g.clear('black');
  const [w, h] = love.getCanvasSize();
  g.circle('fill', 'red', [w / 2, h / 2], 50);
  g.print('white', 'Hello', [10, 10], { font: '24px sans-serif' });
};
```

**Module exports:**

From `like2d/callback`:
- `graphics` - static module with `newImage()` only
- `love` - includes `getCanvasSize()` for canvas dimensions
- `GraphicsContext` - type alias for bound graphics object
- Types: `Color`, `ShapeProps`, `DrawProps`, `PrintProps`, `Canvas`, `ImageHandle`

From `like2d/scene`:
- `graphics` - static module with `newImage()` only
- `runner` - includes `getCanvasSize()` for canvas dimensions
- `GraphicsContext` - type alias for bound graphics object
- Types: `Color`, `ShapeProps`, `DrawProps`, `PrintProps`, `Canvas`, `ImageHandle`

**Other changes:**
- `ShapeProps` no longer includes `color` (color is always a positional arg)
- `bindGraphics()` now derives bindings programmatically from a function registry

## V2.4.0

Alas, release V2.2 and V2.3 were broken, so we skipped to V2.4.

## Breaking Changes

### Canvas Mode Simplification
Replaced the `type: 'fixed' | 'native'` discriminated union in Canvas setMode with a simpler configuration:

```typescript
// Before
{ type: 'fixed', size: [800, 600], pixelArt: true }
{ type: 'native' }

// After  
{ pixelResolution: [800, 600] }  // Pixel-perfect scaling mode
{ pixelResolution: null }        // Native mode
```

- `pixelResolution: Vector2 | null` - Set to game resolution for pixel-perfect scaling, or `null` for native resolution
- `fullscreen: boolean` - Whether to use fullscreen

The pixel scaling mode now always uses the pixel canvas (previously only when `pixelArt: true`).

### StartupScene API Changes
- Removed `onStart` callback parameter
- Now accepts `setScene: (scene: Scene) => void` function directly
- Changed from `handleEvent` to `mousepressed` callback method
- Scene transition happens immediately when clicked

**Usage:**
```typescript
const startupScene = new StartupScene(graphics, { nextScene: demoScene }, runner.setScene.bind(runner));
await runner.start(startupScene);
```

## V2.1.0

### API Changes
- Merged `setFullscreen()` and scaling config into unified `setMode()` API
- `setMode()` now accepts `PartialCanvasMode` for partial updates
- `CanvasMode` type now includes `type`, `size`, `pixelSize`, and `fullscreen` fields
- Added `getMode()` to retrieve current canvas configuration

### Other Changes
- Added logo assets and branding
- Updated documentation across all adapters

## V2.0.1

### API Changes
- `SceneRunner` now exposes `toggleFullscreen()` method

### Fixes
- Fixed mouse position calculation in pixelart mode

## V2.0.0 - ALPHA

V2.x.x represents gradual maturing.

Replacing AI slop with human-AI harmony.

The module - engine - adapter architecture.

[The development of a philosophy.](./PHILOSOPHY.md)

A changing API, but a relatively stable feature set.

From here, we mostly aim to _reduce_ the amount of code and its complexity.

### Breaking API Changes

**Renamed exports:**
- `V2` → `Vec2` (vector math functions)
- `R` → `Rect` (rectangle math functions)

**Engine callback architecture:**
- `Engine.start(update, draw)` → `Engine.start(onEvent)` - Single unified callback receiving `Like2DEvent` discriminated union
- Removed `engine.onKey`, `engine.onMouse`, `engine.onGamepad` injection methods
- Events now dispatch through `like[type](...args)` or `scene[type](...args)` adapters

**Event system:**
- All events now use uniform shape: `{type, args, timestamp}`
- `Like2DEvent` is a discriminated union type

**Scene interface:**
- Added optional per-event handlers: `keypressed`, `keyreleased`, `mousepressed`, `mousereleased`, `mousemoved`, `gamepadpressed`, `gamepadreleased`, `gamepadaxis`, `resize`
- `StartupScene` now uses `handleEvent` guard against double-trigger

### Other Changes
- Added Vitest test infrastructure
- Fixed listener leaks in CanvasManager
- Replaced synthetic `like2d:resize` event with callback
- CanvasManager now handles devicePixelRatio changes
- Added MIT LICENSE
- Added JSR publishing config (jsr.json)
- Added GitHub Actions workflow for CI/CD

## V1.0.0 - PILOT

Proof of concept, highly untested. V1 was just happy to exist.
