# Like2D Scene Adapter

Class-based scene pattern for Like2D. This adapter provides an instance-based API with explicit scene management.

## Installation

```typescript
import { SceneRunner, Scene, Graphics, Audio, Input, Timer } from 'like2d/scene';
```

## Pattern

Create a class implementing the `Scene` interface, then use `SceneRunner` to manage it:

```typescript
import { SceneRunner, Scene, graphics } from 'like2d/scene';
import type { Event } from 'like2d/scene';

class MyScene implements Scene {
  load() {
    console.log('Scene loaded!');
  }

  update(dt: number) {
    // Update logic here
  }

  draw() {
    graphics.print('Hello, World!', [100, 100]);
  }

  handleEvent(event: Event) {
    if (event.type === 'keypressed') {
      console.log('Key pressed:', event.args[1]);
    }
  }
}

// Create runner and start
const runner = new SceneRunner(document.body);
runner.setMode({ pixelResolution: [800, 600] });
await runner.start(new MyScene());
```

## Scene Interface

```typescript
type Scene = {
  load?(): void;
  update(dt: number): void;
  draw(): void;
  handleEvent?(event: Event): void;
};
```

Canvas size is controlled via `runner.setMode()`, not scene properties.

## Events

The `handleEvent` method receives all engine events:

```typescript
handleEvent(event: Event) {
  switch (event.type) {
    case 'keypressed':
      console.log('Key:', event.keycode);
      break;
    case 'mousepressed':
      console.log('Mouse:', event.position);
      break;
    case 'gamepadpressed':
      console.log('Gamepad button:', event.buttonName);
      break;
    case 'actionpressed':
      console.log('Action:', event.action);
      break;
  }
}
```

Available event types:
- `load`, `update`, `draw` - Lifecycle events
- `keypressed`, `keyreleased` - Keyboard input
- `mousepressed`, `mousereleased` - Mouse input
- `gamepadpressed`, `gamepadreleased` - Gamepad input
- `actionpressed`, `actionreleased` - Mapped actions

## SceneRunner API

The runner manages the canvas, engine loop, and scene lifecycle. Create it with a container element, optionally call `setMode()` to configure the canvas, then `start()` with your initial scene.

## Exported Classes

The scene adapter re-exports all core classes for convenience:

```typescript
import { 
  SceneRunner, 
  Scene,
  Graphics,
  Audio,
  Input,
  Timer,
  Keyboard,
  Mouse,
  Gamepad,
  Vec2,
  Rect
} from 'like2d/scene';
```

## When to Use This Adapter

Use the scene adapter when:
- You prefer object-oriented design
- You need multiple scenes (menus, levels, etc.)
- You want instance isolation (no globals)
- You're building a larger application
- You want explicit lifecycle management

For a simpler Love2D-style callback pattern, consider the [Callback Adapter](../callback/) instead.

## Example: Scene Switching

```typescript
class MenuScene implements Scene {
  draw() {
    graphics.print('Press SPACE to start', [350, 300]);
  }
  
  handleEvent(event: Event) {
    if (event.type === 'keypressed' && event.args[1] === ' ') {
      runner.setScene(new GameScene());
    }
  }
}

class GameScene implements Scene {
  update(dt: number) {
    // Game logic
  }
  
  draw() {
    // Render game
  }
}

const runner = new SceneRunner(document.body);
runner.setMode({ pixelResolution: [800, 600] });
await runner.start(new MenuScene());
```
