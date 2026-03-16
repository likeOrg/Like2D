# Like2D Callback Adapter

Love2D-style callback pattern for Like2D. This adapter provides a singleton-based API familiar to Love2D users.

## Installation

```typescript
import { like, graphics, audio, timer, input, keyboard, mouse, gamepad } from 'like2d/callback';
```

## Pattern

Assign callbacks to the `like` object, then call `like.init()` to start:

```typescript
import { like, graphics } from 'like2d/callback';

// Assign callbacks
like.load = () => {
  console.log('Game loaded!');
};

like.update = (dt) => {
  // Update logic here
};

like.draw = () => {
  graphics.print('Hello, World!', [100, 100]);
};

like.keypressed = (scancode, keycode) => {
  console.log('Key pressed:', keycode);
};

// Start the game
const container = document.getElementById('game-container');
await like.init(container);
like.setMode({ pixelResolution: [800, 600] });
```

## Available Callbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| `load` | `() => void` | Called once when the game starts |
| `update` | `(dt: number) => void` | Called every frame with delta time |
| `draw` | `() => void` | Called every frame to render |
| `keypressed` | `(scancode: string, keycode: string) => void` | Called when a key is pressed |
| `keyreleased` | `(scancode: string, keycode: string) => void` | Called when a key is released |
| `mousepressed` | `(x: number, y: number, button: number) => void` | Called when mouse button is pressed |
| `mousereleased` | `(x: number, y: number, button: number) => void` | Called when mouse button is released |
| `gamepadpressed` | `(gamepadIndex: number, buttonIndex: number, buttonName: string) => void` | Called when gamepad button is pressed |
| `gamepadreleased` | `(gamepadIndex: number, buttonIndex: number, buttonName: string) => void` | Called when gamepad button is released |

## Singleton Modules

All core modules are exported as singletons:

- `graphics` - 2D rendering (images, shapes, text)
- `audio` - Audio playback and management
- `timer` - Time tracking, FPS, delta time
- `input` - Action mapping system
- `keyboard` - Direct keyboard access
- `mouse` - Direct mouse access
- `gamepad` - Direct gamepad access

## Love2D Compatibility

For even more compatibility, import as `love`:

```typescript
import { love as like } from 'like2d/callback';

love.load = () => { ... };
love.update = (dt) => { ... };
love.draw = () => { ... };
```

## API Methods

### like.init(container)

Initialize and start the game loop. The canvas is created and attached to the container.

### like.setMode(mode)

Set the canvas display mode. Mode is partial - only specified fields are updated.

```typescript
// Set resolution
like.setMode({ pixelResolution: [800, 600] });

// Toggle fullscreen (preserves other settings)
like.setMode({ fullscreen: true });
```

## When to Use This Adapter

Use the callback adapter when:
- You're porting from Love2D
- You prefer a simple, global-state approach
- You're building a quick prototype
- You want minimal boilerplate

For class-based scene management, consider the [Scene Adapter](../scene/) instead.
