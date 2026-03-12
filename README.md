# Like2D

A web-native TypeScript game framework for 2D browser games. Inspired by Love2D, rebuilt for the modern web.

## Quick Start

```typescript
import { like, Scene } from './like/index.ts';

const game: Scene = {
  width: 800,
  height: 600,
  
  load() {
    // Assets load in background - no await needed
    like.graphics.newImage('player.png');
    like.audio.newSource('jump.ogg');
    
    // Map actions to inputs
    like.input.map('jump', ['Space', 'ArrowUp', 'GP ButtonBottom']);
  },
  
  update(dt) {
    if (like.input.isDown('jump')) {
      // Jump logic
    }
  },
  
  draw() {
    like.graphics.setColor(1, 0, 0, 1);
    like.graphics.rectangle('fill', 100, 100, 50, 50);
  }
};

await like.init();
like.setScene(game);
like.start();
```

## Core Concepts

**Scenes** - The organizational unit. Each scene sets its own resolution and implements `update(dt)` and `draw()`.

**Fire-and-Forget Loading** - Assets return immediately and load in background. Drawing before ready silently skips. No preload phase, no async/await in game code.

**Input Mapping** - Abstract game actions ("jump", "fire") map to multiple physical inputs across keyboard, mouse, and gamepad. Query with `isDown()`, `justPressed()`, `justReleased()`.

**Gamepad Support** - SDL game controller database integration for consistent mappings across controllers.

## Philosophy

- **Clone-and-modify**: Fork and customize, don't install as a library
- **Web-native**: Embraces browser APIs, TypeScript, and modern patterns
- **Lightweight**: Under 10,000 LOC, minimal dependencies

## Run

```bash
pnpm install
pnpm run dev
```

See `src/main.ts` for a complete demo.
