# Asset Loading

## Philosophy

Traditional game frameworks require a preload phase where all assets load before the game starts. This creates friction:
- Long startup times
- Complex dependency management
- Async/await pollution in game code

Like2D uses **fire-and-forget loading**: request assets and use them immediately. The framework handles the complexity.

## Pattern

```typescript
// In scene.load() - returns immediately
const playerImage = like.gfx.newImage('player.png');
const jumpSound = like.audio.newSource('jump.ogg');

// In scene.draw() - silently skips if not ready
like.gfx.draw(playerImage, x, y);

// In scene.update() - silently returns false if not ready
jumpSound.play();
```

## Design Decisions

**Synchronous API** - `newImage()` and `newSource()` return handles immediately. No async/await in game code.

**Silent failure** - Drawing or playing unloaded assets does nothing. No errors, no warnings. The game continues running and automatically starts using assets once loaded.

**Caching** - Same path returns cached handle. Load once, use everywhere.

**Explicit waiting when needed** - For cases where you must wait (level transitions, cutscenes):

```typescript
if (bossImage.isReady()) {
  // Draw boss
} else {
  // Draw loading indicator
}

// Or explicitly await
await bossImage.ready();
```

## Trade-offs

**Pros:**
- No preload phase
- Immediate startup
- Simpler game code
- Assets can stream in during gameplay

**Cons:**
- First few frames may not show all assets
- Need to handle "not ready" state for critical assets

For critical assets, check `isReady()` in `load()` and show a loading scene if needed.
