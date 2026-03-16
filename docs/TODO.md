# Like2D TODO

## Active Work

### 1. Startup Scene ✅ COMPLETED
Created `StartupScene` class in scene adapter:
- Accepts `nextScene: Scene` - the scene to load after click
- Accepts `text?: string` - custom text to display
- Handles `mousepressed` event to trigger transition
- Usage: Create instance and pass to `runner.start()`

**Future consideration:** Callback adapter could use a similar pattern (pause until click), but not implemented today.

### 4. Graphics Simplification ✅ COMPLETED
- Removed transform wrapper methods (`push`, `pop`, `translate`, `rotate`, `scale`, `resetTransform`) from Graphics class
- Added `graphics.getContext()` method for direct canvas API access
- Users should use `ctx.save()`, `ctx.restore()`, `ctx.setTransform()` directly
- `ctx.__baseTransform` hack was removed with scaled mode

### 6. Cut "scaled" Mode, Add Helper ✅ COMPLETED
- Removed "scaled" mode from CanvasConfig (keep only "fixed" and "native")
- Added helper function `calcFixedScale()` in `canvas-config.ts` for fixed-to-native rendering

### BUG: Browser Zoom with Pixel Art Mode
Browser zooming does not update the pixel canvas resolution. When the user zooms the browser (Ctrl +/-), the pixel art canvas needs to recalculate its internal resolution based on the new pixel ratio, but currently it only responds to container resize events, not zoom events.

### 7. Event System: Native Events Pilot ✅ COMPLETED
**Status:** Implemented - native DOM CustomEvents now used throughout  
**Changes:**
- Replaced custom `EventEmitter` with native `CustomEvent` dispatch on canvas element
- Event names now prefixed with `like2d:` (e.g., `like2d:update`, `like2d:draw`)
- Adapters listen directly to canvas via `addEventListener` - no more callback arrays
- CanvasManager dispatches `like2d:resize` events natively
- ~70 lines of custom event code removed, replaced with ~40 lines of thin wrappers

**Benefits:**
- DevTools shows all events, can breakpoint on dispatch
- Native features: `{ once: true }`, `{ passive: true }`, capture/bubble
- Zero custom event infrastructure to maintain
- Better tree-shaking potential

### 8. Package.json Exports & Naming (Later)
Remove wildcard exports (`core/*`) from package.json:
- Keep only: `.`, `./callback`, `./scene`
- Root index.ts re-exports pure libraries (`Vec2`, `Rect`, etc.) - this is fine
- Users who want internals must type `like2d/core/...` explicitly
- "Core" in the path acts as the gate into internals

**Naming changes:**
- `V2` → `Vec2` (V2 sounds like "version 2")
- `R` → `Rect` (R conflicts with Ramda library convention)

---

## Completed ✅

### Pixel Art Canvas Stretching ✅ FIXED
The pixel art canvas was getting stretched due to component-wise min() clamping. Fixed by using proportional scale calculation in `canvas-manager.ts:109`.

### Mouse Position in Fixed Modes ✅ FIXED
Mouse coordinates were in CSS pixels instead of canvas resolution. Fixed by:
- Refactored Mouse class to track raw CSS coordinates with optional transform function
- Added `engine.transformMousePosition()` that handles all modes (fixed, scaled, native, pixel art)
- Added `canvas-manager.getDisplayCanvas()` for pixel art mode
- Fixed fullscreen mode to use `document.fullscreenElement.clientWidth/Height` instead of `window.screen`

### Scaled Mode Transform Reset ✅ FIXED
In scaled mode, calling `ctx.setTransform()` directly would lose the automatic scaling. Fixed by:
- Added `graphics.resetTransform()` that preserves scaled mode transform
- CanvasManager stores base transform in `ctx.__baseTransform`
- Added documentation warning against direct ctx manipulation

## Canvas Size System ✅

Implementation complete. Canvas sizing system with two modes:
- **fixed**: Fixed internal resolution, CSS-scaled to fit container
- **native**: Full control, programmer handles everything

Use `calcFixedScale()` helper to implement scaled rendering in native mode.

All modes preserve aspect ratio with letterboxing (no stretch/crop).

## Publishing Preparation
- [ ] Add JSR configuration (`jsr.json`)
- [ ] Set up GitHub Actions for publishing
- [ ] Configure GitHub Pages deployment for website
- [ ] Add LICENSE file to packages/like2d

### Website work

Discuss what a homepage should look like. It should contain:
 - Introduction
 - Docs
 - Code Sandbox with interactive tutorial?

The logo is planned to be a spade in a circle, similar to LOVE2D.

## Future Ideas

### Multiplayer System Design
The current action system is designed for single-player use. We need a multiplayer input system that:
- Separates controller management from action mapping (already started by removing GP0/GP1 prefixes)
- Supports player assignment: local players bind to specific gamepads
- Handles controller disconnect/reconnect with graceful player reassignment
- Provides clean API for networked multiplayer (input prediction, reconciliation)
- Consider: Should we have a `PlayerManager` that maps physical controllers to logical player slots?

### Camera System with Mouse Transform
Tenuous idea for camera systems with automatic mouse coordinate transformation:
```typescript
graphics.setCamera(translate, rotate, scale);
const worldPos = mouse.getWorldPosition(); // Applies inverse transform
```
**Research needed:** Study existing Love2D camera libraries (e.g., gamera, STALKER-X, hump.camera) to understand:
- Most popular API patterns
- Common features (follow targets, smooth movement, bounds, zoom)
- Whether users prefer camera-as-separate-object vs graphics-integrated
- Trade-offs between simplicity and flexibility

Decision: Only implement if a clear " winner" pattern emerges from the ecosystem.

