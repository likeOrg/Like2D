# LÏKE2D

<p align="center">
  <img src="./assets/logo-banner.svg" alt="Like2D Logo" width="400">
</p>

A web-native 2D game framework inspired by [LÖVE](https://love2d.org/), built for simplicity and the modern web.

## What it is

LIKE is a **curated toolkit** around browser APIs.

It does less, because it **does the right thing**. And when that's not the right thing for you, we hand you the wrench.

- **Stateless Graphics:** Forget to reset native Canvas state (like LineCap) between calls and things break mysteriously. We make drawing explicit: what you see is what you set.

- **Fire-and-forget Assets:** Async asset loading directly on realtime web games is annoying. We let you pretend it's instant and synchronous.

- **Physical Joypad:** Our gamepad module auto-maps to physical buttons like "bottom" and "top". Because A isn't always in the same spot.

- **Actions System:** Of course you can use device input callbacks just like love2d -- but you can also map inputs to actions and get callbacks on that.

- **Scaling Modes:** Pixel art games need pixel-perfect scaling. So we do that: integer nearest -> linear. Or not; turn off pixelart mode to have a canvas that stays at native resolution.

- **Sane Architecture:** Everything is built around a centralized event handler for browser-native events. We won't reinvent the wheel.

## Installation

```bash
npm install like2d
# or
pnpm add like2d
```

## Quick Start

[Like2D Starter Template](https://github.com/44100hertz/Like2D-starter)

## Usage Examples

### Callback Pattern (Love2D-style)

Ideal for small games, jams, or prototyping.

```typescript
import { love, graphics, input } from 'like2d/callback';

love.load = () => {
  love.setMode({ pixelResolution: [800, 600] });
  input.map('jump', ['Space', 'ButtonBottom']);
};

love.update = (dt) => {
  if (input.justPressed('jump')) {
    console.log('Jump!');
  }
};

love.draw = () => {
  graphics.clear([0.1, 0.1, 0.1, 1]);
  graphics.circle('fill', 'dodgerblue', [400, 300], 50);
  graphics.print('white', 'Hello Like2D!', [20, 20]);
};

love.init(document.body);
```

### Scene Pattern (Class-based)

Ideal for larger projects with menus, levels, and explicit state management.

```typescript
import { SceneRunner, type Scene, Vec2 } from 'like2d/scene';

class MyScene implements Scene {
  load() {
    console.log('Scene loaded!');
  }

  update(dt: number) {
    // update logic
  }

  draw(canvas: HTMLCanvasElement) {
    // draw logic
  }
}

const runner = new SceneRunner(document.body);
await runner.start(new MyScene());
```

## Module Overview

Pick your pattern, import what you need:

```typescript
import { love, graphics, input } from 'like2d/callback';  // Love2D-style
import { SceneRunner, type Scene } from 'like2d/scene';    // Class-based scenes
import { Vec2, Rect } from 'like2d/math';                  // Pure math functions
```

See the [PHILOSOPHY.md](./docs/PHILOSOPHY.md) for the principles behind the design.

## License

MIT
