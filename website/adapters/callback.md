# Callback Adapter

Love2D-style callback pattern for Like2D. This adapter provides a familiar, simple API.

## Quick Start

```typescript
import { createLike } from 'like2d/callback';

const like = createLike(document.getElementById('game-container'));

let image;

like.load = () => {
  image = like.gfx.newImage('sprite.png');
};

like.update = (dt) => {
  // Update logic here
};

like.draw = () => {
  like.gfx.clear([0, 0, 0, 1]);
  like.gfx.print('white', 'Hello, World!', [100, 100]);
};

like.keypressed = (scancode, keycode) => {
  console.log('Key pressed:', keycode);
};

await like.start();
```

## Custom Event Handling

Override `like.handleEvent` to intercept events before they reach callbacks:

```typescript
import { routeEvents } from 'like2d/callback';

like.handleEvent = (event) => {
  console.log('Event:', event.type);
  // Call default routing to callbacks
  routeEvents(like)(event);
};
```

Or completely override event handling:

```typescript
like.handleEvent = (event) => {
  // Custom handling only
  if (event.type === 'keypressed') {
    const [scancode] = event.args;
    if (scancode === 'Escape') like.dispose();
  }
};
```

## API

### createLike(container)

Creates a new Like instance attached to the container element. Returns synchronously.

### like.start()

Starts the game loop. Returns a Promise that resolves when the loop begins.

```typescript
await like.start();
```

### like.dispose()

Stops the game loop and cleans up resources.

### like.setMode(mode)

Set the canvas display mode. Mode is partial - only specified fields are updated.

```typescript
// Set resolution
like.setMode({ pixelResolution: [800, 600] });

// Toggle fullscreen (preserves other settings)
like.setMode({ fullscreen: true });
```

### routeEvents(like)

Returns a function that routes events to callback properties. Useful when composing custom `handleEvent`.

```typescript
import { createLike, routeEvents } from 'like2d/callback';

const like = createLike(container);
like.handleEvent = (event) => {
  // Custom logic
  routeEvents(like)(event);  // Route to callbacks
};
```

## Callbacks

Assign functions to these properties:

- `like.load()` - Called once when game starts
- `like.update(dt)` - Called every frame with delta time
- `like.draw()` - Called every frame for rendering
- `like.resize(size, pixelSize, fullscreen)` - Called when canvas resizes
- `like.keypressed(scancode, keycode)` - Key pressed
- `like.keyreleased(scancode, keycode)` - Key released
- `like.mousemoved(pos, relative)` - Mouse moved
- `like.mousepressed(pos, button)` - Mouse button pressed
- `like.mousereleased(pos, button)` - Mouse button released
- `like.gamepadpressed(index, buttonIndex, buttonName)` - Gamepad button pressed
- `like.gamepadreleased(index, buttonIndex, buttonName)` - Gamepad button released
- `like.actionpressed(action)` - Action mapping triggered
- `like.actionreleased(action)` - Action mapping released

## Systems

Access via the like object:

- `like.gfx` - Graphics context for rendering
- `like.audio` - Audio playback
- `like.timer` - Time tracking, FPS, delta time
- `like.input` - Action mapping system
- `like.keyboard` - Direct keyboard access
- `like.mouse` - Direct mouse access
- `like.gamepad` - Direct gamepad access

## When to Use This Adapter

Use the callback adapter when:
- You're porting from Love2D
- You prefer a simple, callback-based approach
- You're building a quick prototype
- You want minimal boilerplate

For class-based scene management, consider the [Scene Adapter](./scene) instead.

## Full API Reference

For detailed type information, see the [Callback Adapter API Documentation](/api/adapters/callback).
