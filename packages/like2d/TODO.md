# Like2D Architecture Refactor TODO

## Overview
Refactor the library to offer multiple ergonomic patterns while sharing the same core functionality. Move away from singleton pattern except when explicitly demanded by the adapter.

### Legend
- **[NEW]** - New functionality being added
- **[REFACTOR]** - Existing code being restructured (same behavior, new implementation)
- **[SPLIT]** - Existing functionality moved to a new location
- **[ENHANCE]** - Existing functionality with added capabilities
- **[DEPRECATED]** - Functionality being removed/moved (migration path provided)

## New File Structure

```
src/
├── core/                           # [SPLIT] Core modules moved from src root
│   ├── graphics.ts                 # [REFACTOR] Graphics as class (was singleton)
│   ├── audio.ts                    # [REFACTOR] Audio as class (was singleton)
│   ├── input.ts                    # [REFACTOR] Input as class (was singleton)
│   ├── timer.ts                    # [REFACTOR] Timer as class (was singleton)
│   ├── keyboard.ts                 # [SPLIT] Moved from src/keyboard.ts
│   ├── mouse.ts                    # [SPLIT] Moved from src/mouse.ts
│   ├── gamepad.ts                  # [SPLIT] Moved from src/gamepad.ts
│   ├── events.ts                   # [ENHANCE] Events with timestamps added
│   ├── gamepad-db.ts               # [SPLIT] Moved from src/gamepad-db.ts
│   ├── gamepad-mapping.ts          # [SPLIT] Moved from src/gamepad-mapping.ts
│   ├── gamepad-button-map.ts       # [SPLIT] Moved from src/gamepad-button-map.ts
│   ├── input-state.ts              # [SPLIT] Moved from src/input-state.ts
│   ├── vector2.ts                  # [SPLIT] Moved from src/vector2.ts
│   └── rect.ts                     # [SPLIT] Moved from src/rect.ts
│
├── adapters/                       # [NEW] API pattern adapters
│   ├── callback/                   # [NEW] Love2D-style callbacks
│   │   ├── index.ts                # [NEW] Singleton exports for Love2D compat
│   │   └── README.md               # [NEW]
│   │
│   └── scene/                      # [NEW] Enhanced Scene adapter
│       ├── index.ts                # [NEW] SceneRunner (replaces Like class)
│       ├── scene.ts                # [SPLIT] Moved from src/scene.ts
│       └── README.md               # [NEW]
│
├── engine.ts                       # [NEW] Shared engine loop (extracted from Like)
└── index.ts                        # [REFACTOR] Re-exports adapters (was singleton entry)
```

## Adapter Models

### [NEW] 1. Callback Model (`adapters/callback/`)
**Pattern**: Love2D-style global callbacks  
**State**: Singleton (as demanded by the pattern)  
**Use Case**: Quick prototypes, Love2D migrants

**Relationship to Current Code**: This is a new adapter that provides Love2D-style callbacks. The current `Like` class in `src/index.ts` uses a scene-based approach; this adapter extracts the callback pattern as a separate option.

```typescript
import { like, graphics } from 'like2d/callback';

like.load = () => {
  // initialize
};

like.update = (dt) => {
  // update logic
};

like.draw = () => {
  graphics.print('Hello', [100, 100]);
};

like.keypressed = (scancode) => {
  // handle key
};
```

**Characteristics**:
- Global singleton instance
- Callback assignment pattern
- Familiar to Love2D users
- Functions injected into global scope (optional)

### [REFACTOR] 2. Scene Model (`adapters/scene/`)
**Pattern**: Class-based scene interface  
**State**: Instance-based  
**Use Case**: Component-based games, object-oriented design

**Relationship to Current Code**: This is a refactoring of the current `Like` class in `src/index.ts`. The scene interface (`src/scene.ts`) remains the same, but the runner logic is extracted from the monolithic `Like` class into a focused `SceneRunner`.

```typescript
import { SceneRunner, Scene, graphics } from 'like2d/scene';

class MyScene implements Scene {
  width = 800;
  height = 600;

  load() { }
  update(dt: number) { }
  draw() { }
  handleEvent(event: Event) { }
}

const runner = new SceneRunner(document.body);
runner.start(new MyScene());
```

**Characteristics**:
- Instance-based (no globals)
- Interface-based scenes (same as current `src/scene.ts`)
- Explicit lifecycle hooks
- Event handling via single method

### 3. Future Adapters (Not in v1)

**Generator Model**: Event bus with generator-based handlers - deferred to v2

**Redux Integration** (External Package):
**Pattern**: Redux-style reducer model  
**Package**: `like2d-redux` (separate package)  
**Use Case**: Complex state management, time-travel debugging

```typescript
// In separate package: like2d-redux
import { createLike2DStore } from 'like2d-redux';
```

## [ENHANCE] Unified Event System (`core/events.ts`)

**Relationship to Current Code**: The current `src/events.ts` already has the Event union type. This enhances it by adding timestamps and standardizing how events flow through the system.

**Current** (`src/events.ts`):
```typescript
export type Event =
  | { type: 'keypressed'; scancode: string; keycode: string }
  | { type: 'keyreleased'; scancode: string; keycode: string }
  // ... etc
```

**Enhanced** (`core/events.ts`):

```typescript
// core/events.ts
export type BaseEvent = {
  type: string;
  timestamp: number; // Engine time when event was created
  [key: string]: any;
};

// Lifecycle events
export type LoadEvent = BaseEvent & {
  type: 'load';
};

export type UpdateEvent = BaseEvent & {
  type: 'update';
  dt: number;
};

export type DrawEvent = BaseEvent & {
  type: 'draw';
};

// Input events (easy to type)
export type KeyPressedEvent = BaseEvent & {
  type: 'keypressed';
  scancode: string;
  keycode: string;
};

export type KeyReleasedEvent = BaseEvent & {
  type: 'keyreleased';
  scancode: string;
  keycode: string;
};

export type MousePressedEvent = BaseEvent & {
  type: 'mousepressed';
  x: number;
  y: number;
  button: number;
};

export type MouseReleasedEvent = BaseEvent & {
  type: 'mousereleased';
  x: number;
  y: number;
  button: number;
};

// Action/gamepad events
export type ActionPressedEvent = BaseEvent & {
  type: 'actionpressed';
  action: string;
};

export type ActionReleasedEvent = BaseEvent & {
  type: 'actionreleased';
  action: string;
};

export type GamepadPressedEvent = BaseEvent & {
  type: 'gamepadpressed';
  gamepadIndex: number;
  buttonIndex: number;
  buttonName: string;
};

export type GamepadReleasedEvent = BaseEvent & {
  type: 'gamepadreleased';
  gamepadIndex: number;
  buttonIndex: number;
  buttonName: string;
};

// Unified event type
export type Event =
  | LoadEvent
  | UpdateEvent
  | DrawEvent
  | KeyPressedEvent
  | KeyReleasedEvent
  | MousePressedEvent
  | MouseReleasedEvent
  | ActionPressedEvent
  | ActionReleasedEvent
  | GamepadPressedEvent
  | GamepadReleasedEvent
  | BaseEvent; // Open for user events


```

**Key principles**:
- All events have `type` and `timestamp` (engine time)
- Input events are typed explicitly (easy cases)
- User-defined events extend the union via the open interface
- Lifecycle events (load, update, draw) are first-class events
- Adapters subscribe to events they care about

## Core Changes

### [REFACTOR] Remove Singleton Pattern from Core

**Before** (Current):
```typescript
// src/graphics.ts (current singleton)
export const graphics = new Graphics();

// src/index.ts (current entry point)
export const like = new Like();
export const graphics = like.graphics;  // Singleton instance
```

**After**:
```typescript
// core/graphics.ts
export class Graphics {
  // Instance-based - user creates instances
}

// adapters/callback/index.ts
export const graphics = new Graphics();  // Singleton only at adapter level
```

### [REFACTOR] Core Classes as Injectable Dependencies

Each core module becomes a class that receives dependencies:

```typescript
// core/graphics.ts
export class Graphics {
  private ctx: CanvasRenderingContext2D | null = null;
  
  setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  draw(handle: ImageHandle, position: Vector2) {
    // Implementation (same as current, just not singleton)
  }
}

// core/input.ts
export class Input {
  private keyboard: Keyboard;
  private mouse: Mouse;
  private gamepad: GamepadManager;
  
  constructor(deps: { keyboard: Keyboard; mouse: Mouse; gamepad: GamepadManager }) {
    this.keyboard = deps.keyboard;
    this.mouse = deps.mouse;
    this.gamepad = deps.gamepad;
  }
  
  update() { /* Same logic, instance-based */ }
}
```

### [NEW] Shared Engine (`engine.ts`)

Extract common game loop functionality with unified time management:

```typescript
// engine.ts
export type EngineDeps = {
  graphics: Graphics;
  input: Input;
  timer: Timer;
  audio: Audio;
};

export type EventCallback = (event: Event) => void;

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private deps: EngineDeps;
  private isRunning = false;
  private lastTime = 0;
  private eventCallbacks: EventCallback[] = [];
  
  constructor(container: HTMLElement, deps: EngineDeps) {
    // Setup canvas
    // Wire up deps
    this.setupInputHandlers();
  }
  
  private setupInputHandlers(): void {
    // Convert DOM input events to unified Event type
    // Call this.emit() for each input event
  }
  
  onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.push(callback);
    return () => {
      const idx = this.eventCallbacks.indexOf(callback);
      if (idx !== -1) this.eventCallbacks.splice(idx, 1);
    };
  }
  
  emit(event: Omit<Event, 'timestamp'>): void {
    const fullEvent = { ...event, timestamp: this.deps.timer.getTime() } as Event;
    for (const callback of this.eventCallbacks) {
      callback(fullEvent);
    }
  }
  
  start(onUpdate?: (dt: number) => void, onDraw?: () => void) {
    this.isRunning = true;
    this.lastTime = performance.now();
    
    const loop = () => {
      if (!this.isRunning) return;
      
      const currentTime = performance.now();
      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      
      // Update timer (central time authority)
      this.deps.timer.update(dt);
      
      // Process input and emit events
      const inputEvents = this.deps.input.update();
      for (const event of inputEvents) {
        this.emit(event);
      }
      
      // Lifecycle events
      this.emit({ type: 'update', dt });
      if (onUpdate) onUpdate(dt);
      
      this.deps.graphics.clear();
      this.emit({ type: 'draw' });
      if (onDraw) onDraw();
      
      requestAnimationFrame(loop);
    };
    
    // Emit load event on start
    this.emit({ type: 'load' });
    
    requestAnimationFrame(loop);
  }
  
  stop() { 
    this.isRunning = false;
  }
  
  setSize(width: number, height: number) { }
  
  getTime(): number {
    return this.deps.timer.getTime();
  }
}
```

## Adapter Implementation Details

### Callback Adapter

Wraps core classes in singleton exports, subscribing to unified events:

```typescript
// adapters/callback/index.ts
import { Graphics } from '../../core/graphics';
import { Input } from '../../core/input';
import { Timer } from '../../core/timer';
import { Audio } from '../../core/audio';
import { Engine } from '../../engine';
import type { Event } from '../../core/events';

// Singleton instances
export const graphics = new Graphics();
export const timer = new Timer();
export const audio = new Audio();
// ... etc

// Engine initialization
let engine: Engine | null = null;

export const like = {
  load: undefined as (() => void) | undefined,
  update: undefined as ((dt: number) => void) | undefined,
  draw: undefined as (() => void) | undefined,
  keypressed: undefined as ((scancode: string, keycode: string) => void) | undefined,
  keyreleased: undefined as ((scancode: string, keycode: string) => void) | undefined,
  mousepressed: undefined as ((x: number, y: number, button: number) => void) | undefined,
  mousereleased: undefined as ((x: number, y: number, button: number) => void) | undefined,
  // ... other callbacks
  
  init(container: HTMLElement, width = 800, height = 600) {
    const input = new Input({ keyboard: new Keyboard(), mouse: new Mouse(), gamepad: new GamepadManager() });
    engine = new Engine(container, { graphics, input, timer, audio });
    
    // Subscribe to unified events, route to callbacks
    engine.onEvent((event: Event) => {
      switch (event.type) {
        case 'load':
          this.load?.();
          break;
        case 'update':
          this.update?.(event.dt);
          break;
        case 'draw':
          this.draw?.();
          break;
        case 'keypressed':
          this.keypressed?.(event.scancode, event.keycode);
          break;
        case 'keyreleased':
          this.keyreleased?.(event.scancode, event.keycode);
          break;
        case 'mousepressed':
          this.mousepressed?.(event.x, event.y, event.button);
          break;
        case 'mousereleased':
          this.mousereleased?.(event.x, event.y, event.button);
          break;
        // ... other input events
      }
    });
    
    engine.start();
  }
};

// Also export as 'love' for Love2D compatibility
export { like as love };
```

### Scene Adapter

Instance-based with clean interface:

```typescript
// adapters/scene/scene.ts
import type { Event } from '../../core/events';

export type Scene = {
  width: number;
  height: number;
  load?(): void;
  update(dt: number): void;
  draw(): void;
  handleEvent?(event: Event): void;
};

// adapters/scene/index.ts
export class SceneRunner {
  private engine: Engine;
  private currentScene: Scene | null = null;
  
  constructor(container: HTMLElement, width = 800, height = 600) {
    // Create deps and engine
    const graphics = new Graphics();
    const input = new Input({ keyboard: new Keyboard(), mouse: new Mouse(), gamepad: new GamepadManager() });
    const timer = new Timer();
    const audio = new Audio();
    
    this.engine = new Engine(container, { graphics, input, timer, audio });
    
    // Subscribe to unified events, route to scene
    this.engine.onEvent((event: Event) => {
      if (!this.currentScene) return;
      
      switch (event.type) {
        case 'load':
          this.currentScene.load?.();
          break;
        case 'update':
          this.currentScene.update(event.dt);
          break;
        case 'draw':
          this.currentScene.draw();
          break;
        default:
          // All other events go to handleEvent
          this.currentScene.handleEvent?.(event);
      }
    });
  }
  
  setScene(scene: Scene) {
    this.currentScene = scene;
    // Resize canvas if needed
    if (this.engine) {
      // resize logic
    }
    // Load will be called via 'load' event
  }
  
  start(scene: Scene) {
    this.setScene(scene);
    this.engine.start();
  }
}

// Export core classes for user instantiation
export { Graphics } from '../../core/graphics';
export { Scene } from './scene';
// ... etc
```

## Package Exports

```json
// package.json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./callback": {
      "import": "./dist/adapters/callback/index.js",
      "types": "./dist/adapters/callback/index.d.ts"
    },
    "./scene": {
      "import": "./dist/adapters/scene/index.js",
      "types": "./dist/adapters/scene/index.d.ts"
    },
    "./core/*": {
      "import": "./dist/core/*.js",
      "types": "./dist/core/*.d.ts"
    }
  }
}
```

## Migration Path

### Development Phases

1. **Phase 1** [REFACTOR]: Core modules to classes (graphics, audio, input, timer)
   - ✅ Split: Move files from `src/*.ts` to `src/core/*.ts`
   - ✅ Refactor: Convert singleton exports to classes
   - ✅ Files affected: graphics.ts, audio.ts, input.ts, timer.ts, keyboard.ts, mouse.ts, gamepad.ts

2. **Phase 2** [NEW]: Create `engine.ts` 
   - ✅ Extract game loop from current `Like` class
   - ✅ Create unified event emission system
   - ✅ New file: src/engine.ts

3. **Phase 3** [NEW]: Callback adapter
   - ✅ Create `adapters/callback/` directory
   - ✅ New pattern: Love2D-style callbacks
   - ✅ Provides singleton for users who want global state

4. **Phase 4** [REFACTOR]: Scene adapter
   - ✅ Move: `src/scene.ts` → `adapters/scene/scene.ts`
   - ✅ Extract: `Like` class → `SceneRunner` class
   - ✅ Refactor: Use new `Engine` instead of inline loop

5. **Phase 5** [ENHANCE]: Update root `index.ts`
   - ✅ Change from singleton entry point to adapter re-export
   - ⏳ Update documentation and examples

6. **Phase 6** [DEPRECATED]: Old API compatibility
   - ⏳ Update package.json exports
   - ⏳ Add migration guide to README

## Benefits

1. **Flexibility**: Users choose the pattern that fits their mental model
2. **Testability**: Instance-based cores are easier to test
3. **Composability**: Mix and match adapters if needed
4. **Tree-shaking**: Only import what you use

## Notes

- Keep core modules free of DOM dependencies where possible
- Ensure all adapters can share the same canvas/context
- Document which adapter is best for which use case

## Migration Guide

### [DEPRECATED] Current API → New API

| Old (Current) | New | Notes |
|--------------|-----|-------|
| `import { like } from 'like2d'` | `import { like } from 'like2d/callback'` | Scene users: use `like2d/scene` instead |
| `like.init(container, w, h)` | `like.init(container, w, h)` | Same for callback adapter |
| `like.setScene(scene)` / `like.start(scene)` | `new SceneRunner(container).start(scene)` | For scene adapter |
| `like.graphics` | `graphics` (from `like2d/callback` or `like2d/scene`) | Direct import |
| `like.audio` | `audio` | Direct import |
| `like.timer` | `timer` | Direct import |
| `like.keyboard` | `keyboard` | Direct import |
| `like.mouse` | `mouse` | Direct import |
| `like.input` | `input` | Direct import |
| `like.gamepad` | `gamepad` | Direct import |
| `export { like as love }` | `export { like as love }` from callback adapter | Maintained for compat |

### Breaking Changes

1. **Root import changes**: `import { like } from 'like2d'` will no longer work as the primary entry point
2. **Core classes require instantiation**: Core modules (graphics, audio, etc.) are no longer singletons
3. **SceneRunner replaces Like class**: The monolithic `Like` class is split into reusable components
