# Changelog

## V2.0.0

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

## V2.0.1

### API Changes
- `SceneRunner` now exposes `toggleFullscreen()` method

### Fixes
- Fixed mouse position calculation in pixelart mode

## V2.1.0

### API Changes
- Merged `setFullscreen()` and scaling config into unified `setMode()` API
- `setMode()` now accepts `PartialCanvasMode` for partial updates
- `CanvasMode` type now includes `type`, `size`, `pixelSize`, and `fullscreen` fields
- Added `getMode()` to retrieve current canvas configuration

### Other Changes
- Added logo assets and branding
- Updated documentation across all adapters
