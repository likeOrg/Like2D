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
  width = 800;
  height = 600;

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
      console.log('Key pressed:', event.keycode);
    }
  }
}

// Create runner and start
const runner = new SceneRunner(document.body, 800, 600);
await runner.start(new MyScene());
```

## Scene Interface

```typescript
type Scene = {
  width: number;
  height: number;
  load?(): void;
  update(dt: number): void;
  draw(): void;
  handleEvent?(event: Event): void;
};
```

### Required Properties

- `width` - Canvas width in pixels
- `height` - Canvas height in pixels

### Optional Methods

- `load()` - Called once when the scene is set
- `handleEvent(event)` - Called for all input events

### Required Methods

- `update(dt)` - Called every frame with delta time
- `draw()` - Called every frame to render

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

### Constructor

```typescript
new SceneRunner(container: HTMLElement, width?: number, height?: number)
```

Creates a new runner with its own canvas and engine instance.

### Methods

#### setScene(scene: Scene)

Switch to a new scene. The old scene is immediately replaced and `load()` is called on the new scene.

#### async start(scene: Scene)

Set the scene and start the game loop. Returns a Promise that resolves when the scene is loaded.

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
  V2,
  R
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
  width = 800;
  height = 600;
  
  draw() {
    graphics.print('Press SPACE to start', [350, 300]);
  }
  
  handleEvent(event: Event) {
    if (event.type === 'keypressed' && event.keycode === ' ') {
      // Switch to game scene
      runner.setScene(new GameScene());
    }
  }
}

class GameScene implements Scene {
  width = 800;
  height = 600;
  
  update(dt: number) {
    // Game logic
  }
  
  draw() {
    // Render game
  }
}

const runner = new SceneRunner(document.body);
await runner.start(new MenuScene());
```
