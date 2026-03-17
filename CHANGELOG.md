# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - Unreleased

### Breaking Changes

- **Callback adapter**: Complete API redesign. `createLike()` now returns `Like` synchronously. Callbacks assigned as properties (`like.load`, `like.update`, `like.draw`). Callbacks receive no parameters - they close over `like`. Start loop with `await like.start()`.
- **Scene adapter**: `draw` callback no longer receives `g` parameter - use `like.gfx`
- **Graphics module split**: Static `graphics` module for `newImage()`, bound `GraphicsContext` passed to `draw()` callback
- Removed stateful methods: `setBackgroundColor()`, `setFont()`, `getFont()`
- Removed `arc()` - use `circle()` with `arc` option
- `ShapeProps` no longer includes `color` (now positional)

### Added

- `Like` interface includes `gfx: BoundGraphics`
- Callback adapter supports property assignment pattern: `like.draw = () => {...}`
- `routeEvents()` exported from callback adapter for custom event handling

### Removed

- `LikeInstance` interface
- `like` parameter from callback adapter callbacks
- `g` parameter from scene adapter `draw` callback
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
