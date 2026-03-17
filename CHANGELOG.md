# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - Unreleased

### Breaking Changes

- `newImage()` moved from standalone export to `like.gfx.newImage()` - update `import { newImage }` to use `like.gfx.newImage()`

## [2.5.1]

### Fixed

- Updated all documentation (README, website docs) to reflect the actual v2.5.0 API

## [2.5.0]

### Breaking Changes

- **Callback adapter**: Complete API redesign. `createLike()` now returns `Like` synchronously. Callbacks assigned as properties (`like.load`, `like.update`, `like.draw`). Callbacks receive no parameters - they close over `like`. Start loop with `await like.start()`.
- **Scene adapter**: All scene methods receive `like: Like` as first parameter. Use `like.gfx` for drawing.
- **Graphics module split**: Static `newImage()` for asset loading, bound graphics context accessed via `like.gfx`
- Removed stateful methods: `setBackgroundColor()`, `setFont()`, `getFont()`
- Removed `arc()` - use `circle()` with `arc` option
- `ShapeProps` no longer includes `color` (now positional)

### Added

- `Like` interface includes `gfx: BoundGraphics`
- Callback adapter supports property assignment pattern: `like.draw = () => {...}`
- `routeEvents()` exported from callback adapter for custom event handling

### Removed

- `LikeInstance` interface
- `like` parameter from callback adapter callbacks (now closed over)
- `g` parameter from scene adapter `draw` callback (use `like.gfx`)
- Adapter re-exports of core utilities - import from `'like2d'` directly

## [2.4.0]

### Breaking Changes

- **Canvas mode simplified**: `{ type: 'fixed'|'native', ...}` → `{ pixelResolution: Vector2|null, fullscreen: boolean }`
- **StartupScene**: Removed `onStart` callback, now takes `setScene` function directly

## [2.1.0]

- Merged `setFullscreen()` into `setMode()` API
- Added `getMode()` to retrieve canvas configuration

## [2.0.1]

- `SceneRunner.toggleFullscreen()`
- Fixed mouse position calculation in pixel art mode

## [2.0.0] - ALPHA

### Breaking Changes

- `V2` → `Vec2`, `R` → `Rect`
- `Engine.start(update, draw)` → `Engine.start(onEvent)` with `Like2DEvent` discriminated union
- Removed `engine.onKey`, `engine.onMouse`, `engine.onGamepad`
- Scene interface: added optional per-event handlers (`keypressed`, `mousepressed`, etc.)

### Added

- Event system with uniform `{type, args, timestamp}` shape
- Vitest test infrastructure
- MIT License
- JSR publishing config

## [1.0.0] - PILOT

Proof of concept.
