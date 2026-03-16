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

---

## V2 Release!

Execution order: naming cleanup → bug fix → unified event dispatch → tests → docs → publishing infra → version bump + tag.

### 1. API Naming Cleanup
- [ ] `V2` → `Vec2` (V2 sounds like "version 2") — `vector2.ts`, `index.ts`, both adapters, both demos
- [ ] `R` → `Rect` (R conflicts with Ramda convention) — `rect.ts`, `index.ts`, both adapters, both demos
- [ ] Remove wildcard `"./core/*"` export from package.json — keep only `.`, `./callback`, `./scene`
- [ ] Root index.ts re-exports pure libraries (`Vec2`, `Rect`, etc.) — users who want internals type `like2d/core/...` explicitly

### 2. Fix Browser Zoom Bug with Pixel Art
- [ ] `CanvasManager` only recalculates resolution on container resize, not on browser zoom
- [ ] Add `window` resize listener + check for `devicePixelRatio` changes
- [ ] Recalculate pixel art canvas internal resolution when ratio changes

### 3. Automated Tests
- [ ] Add Vitest (zero config, ESM-native, TypeScript)
- [ ] Unit tests for `Timer`: sleep, time tracking, FPS calc
- [ ] Unit tests for `Vector2`: all ops
- [ ] Unit tests for `Rect`: create, contains, intersect
- [ ] Unit tests for `InputState`: action mapping
- [ ] No canvas/DOM tests — those are covered by the demo

### 4. README & Docs
- [ ] Complete `packages/like2d/README.md` (currently has TODO placeholder)
- [ ] Structure: what it is, install, quick start (both patterns), API overview, link to PHILOSOPHY.md
- [ ] Add inline JSDoc to public API types in `index.ts` exports

### 5. Publishing Infrastructure
- [ ] Add `LICENSE` file (MIT) to `packages/like2d/`
- [ ] Add `jsr.json` config for JSR publishing
- [ ] Add GitHub Actions workflow: typecheck → build → publish on tag
- [ ] Update `package.json` version to `2.0.0`

### 6. Unified Event Dispatch API

Engine dispatches all events through a single callback: `engine.start(onEvent)`. No more separate `onKey`/`onMouse`/`onGamepad` callback chains or `update`/`draw` split. The engine normalizes all event sources — lifecycle, input, actions — into one stream.

**Event shape** (all events share this pattern):
```typescript
{ type: 'keypressed', args: [scancode, keycode], timestamp }
{ type: 'update', args: [dt], timestamp }
{ type: 'actionpressed', args: [action], timestamp }
// etc.
```

**Callback adapter** — auto-dispatches by event type:
```typescript
// like.type?.(...args) for direct handlers
like.keypressed = (scancode, keycode) => { ... };

// like.handleEvent for pre-processing — return value feeds into the type handler
like.handleEvent = (event) => {
  if (event.type === 'update') return { ...event, args: [event.args[0] * timeScale] };
  return event;
};
```

**Scene adapter** — same shape, swappable object:
```typescript
const scene: Scene = {
  update(dt) { ... },                          // direct: scene.update(...event.args)
  keypressed(scancode, keycode) { ... },       // direct: scene.keypressed(...event.args)
  handleEvent(event) { ... },                  // OR use switch-case on event.type
};
runner.setScene(scene);                        // swap at any time
```

Scene implementors choose: `myScene.someEvent` for direct handling, or `myScene.handleEvent` with a switch-case for unified processing. Both can coexist — `handleEvent` runs first, then the direct handler if the event wasn't consumed.

**Implementation changes:**
- [ ] Engine: add `onEvent` callback to `start()`, dispatch all events through it (lifecycle + input + actions)
- [ ] Engine: remove `onKey()`, `onMouse()`, `onGamepad()` — engine owns input listening
- [ ] Engine: remove separate `update`/`draw` callbacks from `start()`
- [ ] Events: define unified `Like2DEvent` discriminated union with `{ type, args, timestamp }`
- [ ] Callback adapter: implement `like[type]?.(...args)` dispatch + `handleEvent` pre-processing
- [ ] Scene adapter: implement same dispatch over scene object + `handleEvent` first
- [ ] Update both demos to new API

### 7. Release
- [ ] Tag `v2.0.0`
- [ ] Publish to JSR

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

## After V2

### Publishing Preparation
- [ ] Configure GitHub Pages deployment for website

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

