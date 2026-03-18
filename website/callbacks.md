# Callbacks

Like2D uses a callback-based event system. Events are triggered by the engine and handled by your game code.

## Overview

There are two ways to receive events:

1. **Specific callbacks** - Handle individual event types (e.g., `update`, `keypressed`)
2. **`handleEvent`** - Receive all events as a single stream

## Specific Callbacks

These callbacks are called automatically by the engine when their corresponding events occur:

### Lifecycle

| Callback | Signature | Description |
|----------|-----------|-------------|
| `load` | `() => void` | Called once when the game starts. Use this to load assets and initialize state. |
| `update` | `(dt: number) => void` | Called every frame. `dt` is delta time in seconds since the last frame. |
| `draw` | `(g: GraphicsContext) => void` | Called every frame to render. Receives the graphics context for drawing. |
| `resize` | `(size: Vector2, pixelSize: Vector2, fullscreen: boolean) => void` | Called when the canvas size changes. |

### Input

| Callback | Signature | Description |
|----------|-----------|-------------|
| `keypressed` | `(scancode: string, keycode: string) => void` | Called when a keyboard key is pressed. |
| `keyreleased` | `(scancode: string, keycode: string) => void` | Called when a keyboard key is released. |
| `mousemoved` | `(pos: Vector2, relative: boolean) => void` | Called when mouse moves. `relative=true` means `pos` is delta movement (for FPS controls). |
| `mousepressed` | `(pos: Vector2, button: number) => void` | Called when a mouse button is pressed. Coordinates are in canvas pixels. |
| `mousereleased` | `(pos: Vector2, button: number) => void` | Called when a mouse button is released. |
| `gamepadpressed` | `(gamepadIndex: number, buttonIndex: number, buttonName: string) => void` | Called when a gamepad button is pressed. |
| `gamepadreleased` | `(gamepadIndex: number, buttonIndex: number, buttonName: string) => void` | Called when a gamepad button is released. |
| `actionpressed` | `(action: string) => void` | Called when a mapped action is triggered (see Input system). |
| `actionreleased` | `(action: string) => void` | Called when a mapped action ends. |

## The `handleEvent` Callback

`handleEvent` is special - it receives **all** events, including those that also trigger specific callbacks. This is useful for:

- Logging or debugging all events
- Building custom event systems
- Handling events in a unified way

```typescript
handleEvent(event: Like2DEvent): Like2DEvent {
  // event.type tells you what kind of event it is
  // event.args contains the arguments (same as specific callbacks)
  // event.timestamp is when the event occurred
  
  console.log('Event:', event.type, event.args);
  
  // Return the event (or a modified version)
  return event;
}
```

The `handleEvent` callback must return the event (or a modified version of it). This allows for event transformation or filtering.

### Event Types

All events have this structure:

```typescript
type Like2DEvent = 
  | { type: 'load'; args: []; timestamp: number }
  | { type: 'update'; args: [dt: number]; timestamp: number }
  | { type: 'draw'; args: [canvas: HTMLCanvasElement]; timestamp: number }
  | { type: 'resize'; args: [size: Vector2, pixelSize: Vector2, fullscreen: boolean]; timestamp: number }
  | { type: 'keypressed'; args: [scancode: string, keycode: string]; timestamp: number }
  | { type: 'keyreleased'; args: [scancode: string, keycode: string]; timestamp: number }
  | { type: 'mousemoved'; args: [pos: Vector2, relative: boolean]; timestamp: number }
  | { type: 'mousepressed'; args: [pos: Vector2, button: number]; timestamp: number }
  | { type: 'mousereleased'; args: [pos: Vector2, button: number]; timestamp: number }
  | { type: 'gamepadpressed'; args: [gamepadIndex: number, buttonIndex: number, buttonName: string]; timestamp: number }
  | { type: 'gamepadreleased'; args: [gamepadIndex: number, buttonIndex: number, buttonName: string]; timestamp: number }
  | { type: 'actionpressed'; args: [action: string]; timestamp: number }
  | { type: 'actionreleased'; args: [action: string]; timestamp: number };
```

## Using Callbacks

### With the Callback Adapter

```typescript
import { like } from 'like2d/callback';

// Assign specific callbacks
like.update = (dt) => {
  player.x += player.speed * dt;
};

like.keypressed = (scancode, keycode) => {
  if (keycode === ' ') {
    player.jump();
  }
};

// Or use handleEvent for everything
like.handleEvent = (event) => {
  console.log('Event:', event.type);
  return event;
};
```

### With the Scene Adapter

```typescript
import { Scene } from 'like2d/scene';

class MyScene implements Scene {
  // All callbacks are methods on the class
  update(dt: number) {
    player.x += player.speed * dt;
  }
  
  keypressed(scancode: string, keycode: string) {
    if (keycode === ' ') {
      player.jump();
    }
  }
  
  // handleEvent is special - it returns the event
  handleEvent(event: Like2DEvent) {
    console.log('Event:', event.type);
    return event;
  }
}
```

## When to Use Which?

**Use specific callbacks when:**
- You want clean, readable code for specific behaviors
- You're handling standard game logic (movement, input, etc.)

**Use `handleEvent` when:**
- You need to log or monitor all events
- You're building custom event routing
- You want to modify or filter events before they reach other handlers
