# Like2D TODO

## V2.6.0 - Released

### Completed Changes

- **Callback adapter redesign** - `createLike()` returns `Like` synchronously, callbacks assigned as properties
- **Graphics module split** - Static `graphics` for asset loading, bound `GraphicsContext` passed to callbacks
- Removed stateful APIs (`setBackgroundColor`, `setFont`, etc.)
- `routeEvents()` exported for custom event handling

### Status: ✅ Complete

---

## After V2

### Publishing Preparation

- [ ] Configure GitHub Pages deployment for website

### Website Work

Discuss homepage contents:
- Introduction
- Docs
- Code Sandbox with interactive tutorial?

Logo: spade in circle (Love2D-style)

---

## Future Ideas

### Multiplayer System Design

- Separates controller management from action mapping
- Supports player assignment: local players bind to specific gamepads
- Handles controller disconnect/reconnect gracefully
- Provides clean API for networked multiplayer
- Consider: `PlayerManager` mapping physical controllers to logical player slots?

### Camera System with Mouse Transform

```typescript
graphics.setCamera(translate, rotate, scale);
const worldPos = mouse.getWorldPosition(); // Applies inverse transform
```

Research needed: Study Love2D camera libraries (gamera, STALKER-X, hump.camera) for patterns.

Decision: Only implement if clear "winner" pattern emerges.
