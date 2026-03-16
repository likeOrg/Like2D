# LÏKE2D

<p align="center">
  <img src="./assets/logo-banner.svg" alt="Like2D Logo" width="400">
</p>

A web-native 2D game framework inspired by [LÖVE](https://love2d.org/), built for simplicity and the modern web.

## What it is

Like2D is a thin, performant wrapper around the browser's Canvas and Web Audio APIs. It provides:
- **Stateless Graphics:** No more `ctx.save()` and `ctx.restore()` for colors and transforms.
- **Fire-and-forget Assets:** Synchronous handles for images and audio that load in the background.
- **Unified Input:** Normalized keyboard, mouse, and gamepad support with action mapping.
- **Scaling Modes:** Built-in support for "pixel" resolution with pixel-perfect scaling.
- **Flexible Patterns:** Use Love2D-style global callbacks or class-based scenes.

## Installation

```bash
npm install like2d
# or
pnpm add like2d
```

## Quick Start

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

## API Overview

Like2D exports pure library functions for math and geometry that work with native arrays.

- **Vec2:** Vector operations using `[number, number]` tuples.
- **Rect:** Rectangle operations using `[x, y, w, h]` tuples.
- **Graphics:** Stateless drawing commands.
- **Audio:** Simple source/playback management.
- **Input:** Action-based input mapping.

See the [PHILOSOPHY.md](./docs/PHILOSOPHY.md) for the principles behind the design.

## Quick Start Template

Get started quickly with the [Like2D Starter](https://github.com/44100hertz/Like2D-starter) template!

## License

MIT
