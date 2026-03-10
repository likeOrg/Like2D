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
  preload?: () => Promise<void>;  // Asset preloading (optional)
  load?: () => void;              // Initialization after preload
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

### Asset Preloader

Simple preloading system to avoid runtime stutters:

```typescript
like.assets.preload([
  like.assets.image('player.png'),
  like.assets.audio('jump.ogg'),
  like.assets.json('level1.json'),
  like.assets.text('dialogue.txt'),
]);
```

The `preload()` callback blocks `load()` until all assets are ready. No progress UI - simple and effective.

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
- Images: loading, drawing, sub-regions (quads), transforms
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
- Sleep functionality (`sleep(seconds)`)
- Scheduled callbacks (future)

### Input
- **Keyboard** (`like.keyboard`): Key state queries
- **Mouse** (`like.mouse`): Position and button states
- **Input Mapping** (`like.input`): Action abstraction layer

### Storage (`like.storage`)
Save/load game state:
- localStorage-based persistence
- Type-safe save/load with generics
- Save versioning support

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
│   ├── storage.ts         # Save/load (localStorage)
│   ├── assets.ts          # Asset preloading
│   └── scene.ts           # Scene interface and management
```

## Build System

- **Vite** for development server with hot reload
- **TypeScript** for type safety
- No runtime dependencies (build tools only)
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
- Async asset loading
- Global singleton access: `like.graphics`, `like.audio`, etc.
- Canvas coordinates: (0,0) at top-left

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
- Preloading replaces on-demand loading
- Modern async patterns throughout
