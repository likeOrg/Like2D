---
layout: home

hero:
  name: "Like2D"
  text: "Web-native Game Framework"
  tagline: A modern, Love2D-inspired framework for building games in the browser
  image:
    src: /logo.svg
    alt: Like2D Logo
  actions:
    - theme: brand
      text: API Reference
      link: /api/
    - theme: alt
      text: View on GitHub
      link: https://github.com/44100hertz/like2d

features:
  - title: 🎮 Love2D Compatible
    details: Familiar API inspired by the popular Love2D framework
  - title: 🌐 Web Native
    details: Built for modern browsers with TypeScript support
  - title: 🎯 Type Safe
    details: Full TypeScript support with comprehensive type definitions
  - title: 🕹️ Input Handling
    details: Keyboard, mouse, and gamepad support out of the box
  - title: 🔊 Audio System
    details: Simple and powerful audio management
  - title: 📦 Scene Management
    details: Built-in scene system for organizing your game
---

## Quick Start

Like2D uses an **adapter pattern** - you choose how to structure your game. The most common is the **callback adapter** (Love2D-style):

### 1. HTML Setup

Create an `index.html` file:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Like2D Game</title>
  <style>
    body { margin: 0; overflow: hidden; background: #000; }
    #game { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="game"></div>
  <script type="module" src="./main.ts"></script>
</body>
</html>
```

### 2. Game Code

Create a `main.ts` file that binds to the DOM element:

```typescript
import { createLike } from 'like2d/callback';

// Create the engine attached to a DOM element
const like = createLike(document.getElementById('game')!);

// Set up callbacks (Love2D style)
like.load = () => {
  console.log('Game loaded!');
};

like.update = (dt) => {
  // Update game logic here
  // dt is delta time in seconds
};

like.draw = () => {
  // Clear screen with dark color
  like.gfx.clear([0.1, 0.1, 0.1]);
  
  // Draw some text
  like.gfx.print('white', 'Hello, Like2D!', [100, 100]);
};

like.keypressed = (scancode, keycode) => {
  console.log(`Key pressed: ${keycode}`);
};

// Start the game loop
await like.start();
```

### 3. Using the Scene Adapter

For class-based architecture:

```typescript
import { SceneRunner, type Scene } from 'like2d/scene';
import type { Like } from 'like2d';

class MyScene implements Scene {
  update(like: Like, dt: number) {
    // Update logic
  }
  
  draw(like: Like) {
    like.gfx.clear([0.1, 0.1, 0.1]);
    like.gfx.print('white', 'Hello from Scene!', [100, 100]);
  }
}

// Bind to DOM element and start
const runner = new SceneRunner(document.getElementById('game')!);
await runner.start(new MyScene());
```

### Starter Template

For a complete, ready-to-use template with Vite configured, check out the [Like2D Starter](https://github.com/44100hertz/like2d-starter) repository.

## Installation

```bash
npm install like2d
```

Or with pnpm:

```bash
pnpm add like2d
```

## Adapters

Like2D provides multiple adapters for different coding styles:

- **`like2d/callback`** - Love2D-style callback functions
- **`like2d/scene`** - Class-based scene system
- **`like2d`** - Core types and utilities only
