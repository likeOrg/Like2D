# Like2D TODO

## V2.5.0 - Non-Global Graphics Module

### Architecture Change

Currently, graphics is a global singleton that binds a canvas internally. We split it:

- **Graphics module** - static, only `newImage()` for asset loading
- **GraphicsContext** - bound to canvas, passed to `draw()` callback

```typescript
// Before
import { graphics } from 'like2d/callback';
like.draw = (canvas) => {
  graphics.circle('fill', 'red', [100, 100], 50);
};

// After
import { graphics } from 'like2d/callback';
const image = graphics.newImage('sprite.png');  // static

like.draw = (g) => {
  g.circle('fill', 'red', [100, 100], 50);  // bound context
};
```

### Implementation

- [ ] Create `GraphicsContext` class with canvas-bound methods (drawing + state)
- [ ] Refactor `Graphics` to contain only `newImage()` and `ImageHandle`
  - Remove internal `images` Map tracking - not useful
  - Preserve sync/handle functionality via `ImageHandle` class
- [ ] Update callback adapter: `draw(g: GraphicsContext)`
- [ ] Update scene adapter: `scene.draw(g: GraphicsContext)`
- [ ] Update `StartupScene` to use new pattern
- [ ] Update both demos
- [ ] Add TSDoc comments per V2-5-0.md guidelines
- [ ] Remind to update starter template

### Module Exports

**From `like2d/callback` and `like2d/scene`:**
- `graphics` → static module with `newImage()` only
- `GraphicsContext` → type for the bound object
- Types: `Color`, `ShapeProps`, `DrawProps`, `PrintProps`, `ImageHandle`

### Key Benefits

1. No singleton canvas binding - Graphics doesn't store canvas
2. Explicit context - Drawing functions only available through bound object
3. Clean separation - Asset loading vs. drawing are distinct
4. Future-proof - Pattern extends to V3 considerations for other modules

---

## V2.5.0 - TSDoc Preparation

Per `V2-5-0.md`:

- [ ] Follow docs/PHILOSOPHY.md and README.md guidelines
- [ ] Digest specs/readmes into TSDoc comments within each module
- [ ] Exposed APIs need basic documentation (0-2 lines per function)
- [ ] Delete specs after digesting

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
