# Like2D Specification

## Overview

Like2D is a web-native TypeScript game framework designed to be cloned and modified directly. It provides a lightweight, modern foundation for 2D browser games with thoughtful batteries included.

## Design Principles

1. **Web-Native First**: Embraces modern browser APIs, async/await, and TypeScript
2. **Clone-and-Modify**: Designed to be forked and customized, not installed as a library
3. **Integrated Core**: Features are tightly integrated with the runtime rather than loosely coupled
4. **Lightweight Dependencies**: External libraries allowed when they provide clear value, but kept minimal
5. **Under 10,000 LOC**: The complete framework should remain lightweight and understandable

## Architecture

### Scene System

Scenes are the primary organizational unit. A Scene is an object implementing the following interface:

```typescript
interface Scene {
  width: number;        // Canvas resolution width
  height: number;       // Canvas resolution height
  load?: () => void;              // Initialization when scene loads
  update: (dt: number) => void;   // Called every frame
  draw: () => void;               // Called every frame after update
  keypressed?: (key: string) => void;
  keyreleased?: (key: string) => void;
  mousepressed?: (x: number, y: number, button: number) => void;
  mousereleased?: (x: number, y: number, button: number) => void;
}
```

**Key Design Decisions:**
- Scenes run **one at a time** - only the active scene receives updates and draw calls
- Each scene sets its own canvas resolution (`width`, `height`)
- Switch scenes via `like.setScene(scene)`
- Scene stacks will be added later by giving scenes access to their parent scene

### Asset Loading

Fire-and-forget asset loading system:

```typescript
// Load assets in load() - returns immediately, loads in background
const playerImage = like.graphics.newImage('player.png');
const jumpSound = like.audio.newSource('jump.ogg');
```

Handles returned from loading functions provide methods to check loading status:

```typescript
// Check if image is ready
if (playerImage.isReady()) {
  like.graphics.draw(playerImage, x, y);
}

// Wait for asset explicitly if needed
await playerImage.ready();
```

Drawing or playing assets that aren't ready yet will silently skip - no errors or warnings. This allows assets to be used immediately after requesting them, with rendering beginning automatically once loading completes.

### Input Mapping

Abstract actions mapped to physical inputs:

```typescript
like.input.map('jump', ['Space', 'ArrowUp', 'w', 'W']);
like.input.map('fire', ['MouseLeft', 'z']);
like.input.map('move_left', ['GamepadLeftStickLeft', 'GamepadDPadLeft']);

if (like.input.isDown('jump')) { /* ... */ }
if (like.input.justPressed('fire')) { /* ... */ }
```

Maps actions to multiple keys, mouse buttons, and gamepad inputs. Low-level keyboard/mouse/gamepad APIs remain available.

## Core Modules

### Graphics (`like.graphics`)
2D rendering with HTML5 Canvas:
- Primitives: rectangles, circles, lines, polygons
- Images: fire-and-forget loading with ImageHandle, drawing, sub-regions (quads), transforms
- Text: font loading, rendering
- Coordinate transforms: push/pop, translate, rotate, scale
- Color management with 0-1 float range

### Audio (`like.audio`)
Web Audio API based sound:
- Source objects for playback
- Play/pause/stop/resume
- Volume and pitch control
- Looping support
- Common formats: OGG, MP3, WAV

### Timer (`like.timer`)
Time management:
- Delta time (`getDelta()`)
- FPS counter (`getFPS()`)
- Game time (`getTime()`)
- Scene time (`getSceneTime()`)
- Sleep functionality (`sleep(seconds)`)

### Input
- **Keyboard** (`like.keyboard`): Key state queries
- **Mouse** (`like.mouse`): Position and button states
- **Input Mapping** (`like.input`): Action abstraction layer
- **Gamepad** (`like.gamepad`): Controller support with SDL mapping DB, analog stick input

## File Structure

```
src/
├── index.html              # HTML entry with canvas + fullscreen button
├── main.ts                 # User entry point / demo
├── like/                   # Framework core
│   ├── index.ts           # Main Like class, scene management
│   ├── graphics.ts        # 2D rendering
│   ├── audio.ts           # Audio playback
│   ├── keyboard.ts        # Keyboard input
│   ├── mouse.ts           # Mouse input
│   ├── input.ts           # Input mapping system
│   ├── timer.ts           # Time management
│   ├── gamepad.ts         # Gamepad input
│   └── scene.ts           # Scene interface and management
```

## Build System

- **Vite** for development server with hot reload
- **TypeScript** for type safety
- Minimal runtime dependencies
- Run with `pnpm run dev`

## Development Workflow

Features are developed incrementally with immediate testing and demo updates:

- Each feature includes test cases as it's built
- Demo code is updated alongside implementation
- Documentation stays in sync with code changes
- No separate "testing and polish" phase - quality is maintained throughout

## Deferred Features

These will be revisited after establishing a game object model:

- Camera system (pan, zoom, follow)
- Tweening/animation
- Entity systems
- Particle systems
- Collision detection
- Touch input module

## API Style

- Functions over classes where possible
- 0-1 color range (not 0-255)
- Fire-and-forget asset loading (no async/await in game code)
- Global singleton access: `like.graphics`, `like.audio`, etc.
- Canvas coordinates: (0,0) at top-left
- Named exports only (no default exports)

## Dependencies

**Build-time only:**
- vite
- typescript

**Optional runtime (documented per-feature):**
- None currently

## Migration from Love2D

While inspired by Love2D, Like2D is not API-compatible:
- Scenes replace love.load callbacks
- Input mapping replaces direct key checks
- Fire-and-forget asset loading (no preloading phase)
- Modern async patterns where needed
