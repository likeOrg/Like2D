# Like2D TODO

## V2.2.0

### 1. Rename 'fixed' mode to 'pixel' mode ✅
- [x] Simplified CanvasMode to `{ pixelResolution: Vector2 | null, fullscreen: boolean }`
- [x] `pixelResolution: null` = native mode, `pixelResolution: [w, h]` = pixel-perfect scaling mode
- [x] Updated all demos and documentation

### 2. Fix startup screen click transition ✅
- [x] Removed onStart callback - now accepts setScene function directly
- [x] Changed from handleEvent to mousepressed callback method
- [x] Scene transition happens immediately on click

---

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
