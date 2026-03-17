# Scene Adapter

Class-based scene pattern for Like2D. This adapter provides an instance-based API with explicit scene management.

## Quick Start

```typescript
import { SceneRunner, type Scene } from 'like2d/scene';
import type { Like } from 'like2d';

class MyScene implements Scene {
  load(like: Like) {
    console.log('Scene loaded!');
  }

  update(like: Like, dt: number) {
    // Update logic here
  }

  draw(like: Like) {
    like.gfx.print('white', 'Hello, World!', [100, 100]);
  }
}

// Create runner and start
const runner = new SceneRunner(document.body);
runner.setMode({ pixelResolution: [800, 600] });
await runner.start(new MyScene());
```

See the [Callbacks documentation](/callbacks) for a complete list of available callback methods.

## Scene Interface

A scene is a class that implements the `Scene` interface. All callbacks are optional methods:

```typescript
interface Scene {
  load?(like: Like): void;
  update?(like: Like, dt: number): void;
  draw?(like: Like): void;
  resize?(like: Like, size: Vector2, pixelSize: Vector2, fullscreen: boolean): void;
  keypressed?(like: Like, scancode: string, keycode: string): void;
  keyreleased?(like: Like, scancode: string, keycode: string): void;
  mousepressed?(like: Like, x: number, y: number, button: number): void;
  mousereleased?(like: Like, x: number, y: number, button: number): void;
  gamepadpressed?(like: Like, gamepadIndex: number, buttonIndex: number, buttonName: string): void;
  gamepadreleased?(like: Like, gamepadIndex: number, buttonIndex: number, buttonName: string): void;
  actionpressed?(like: Like, action: string): void;
  actionreleased?(like: Like, action: string): void;
  handleEvent?(like: Like, event: Like2DEvent): void;
}
```

All methods receive `like` as the first argument, giving access to all systems (`like.gfx`, `like.input`, etc.).

Canvas size is controlled via `runner.setMode()`, not scene properties.

## SceneRunner API

The runner manages the canvas, engine loop, and scene lifecycle. Create it with a container element, optionally call `setMode()` to configure the canvas, then `start()` with your initial scene.

## Exported Classes

The scene adapter re-exports all core classes for convenience:

```typescript
import { SceneRunner, type Scene } from 'like2d/scene';
import type { Like } from 'like2d';
import { Vec2, Rect } from 'like2d';
```

## When to Use This Adapter

Use the scene adapter when:
- You prefer object-oriented design
- You need multiple scenes (menus, levels, etc.)
- You want instance isolation (no globals)
- You're building a larger application
- You want explicit lifecycle management

For a simpler Love2D-style callback pattern, consider the [Callback Adapter](./callback) instead.

## Example: Scene Switching

```typescript
class MenuScene implements Scene {
  draw(like: Like) {
    like.gfx.print('white', 'Press SPACE to start', [350, 300]);
  }
  
  keypressed(like: Like, scancode: string, keycode: string) {
    if (keycode === ' ') {
      runner.setScene(new GameScene());
    }
  }
}

class GameScene implements Scene {
  update(like: Like, dt: number) {
    // Game logic
  }
  
  draw(like: Like) {
    like.gfx.clear([0, 0, 0, 1]);
    like.gfx.print('white', 'Game Running!', [350, 300]);
  }
}

const runner = new SceneRunner(document.body);
runner.setMode({ pixelResolution: [800, 600] });
await runner.start(new MenuScene());
```

## Full API Reference

For detailed type information and all available methods, see the [Scene Adapter API Documentation](/api/adapters/scene).
