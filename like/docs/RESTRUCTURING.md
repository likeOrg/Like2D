# Like2D Module Restructuring Plan

## The Problem

Currently, `like/internal/*` contains mixed public/private code, and users must import from `like/internal/*` to access types. The `Public<T>` utility filters out underscore-prefixed methods, creating friction.

## The Solution: Dispatcher Pattern

Replace `EngineDispatch` with a generic `Dispatcher<T>` type where `T` is the set of events a module can emit.

### Core Design

```typescript
// events.ts (moved from internal/)
export type EventMap = { /* ... all events ... */ };
export type EventType = keyof EventMap;

// Generic dispatcher - each module defines its own event subset
type Dispatcher<T extends EventType> = <K extends T>(
  type: K,
  args: EventMap[K]
) => void;

// Example: Mouse can only emit mouse events
type MouseEvent = 'mousemoved' | 'mousepressed' | 'mousereleased';

class Mouse {
  constructor(private dispatch: Dispatcher<MouseEvent>) {}
  
  private onMouseDown(e: MouseEvent) {
    this.dispatch('mousepressed', [pos, button]); // Type-safe!
  }
}

// Engine provides a dispatcher that handles ALL events
type EngineDispatcher = Dispatcher<EventType>;
```

### Module Structure After

```
src/
├── events.ts          # All event types (public)
├── types.ts           # Shared types like Color, Vector2, etc.
├── graphics.ts        # Graphics module (pure + BoundGraphics)
├── audio.ts           # Audio module (public class)
├── timer.ts           # Timer module (public class)
├── keyboard.ts        # Keyboard module (public class)
├── mouse.ts           # Mouse module (public class)
├── input.ts           # Input module (public class)
├── gamepad.ts         # Gamepad module (public class)
├── canvas.ts          # Canvas module (public class)
├── engine.ts          # Engine - wires everything together
├── scene.ts           # Scene interface
├── index.ts           # Main entry point, createLike()
└── prefab-scenes/     # Scene implementations
```

**Key Principle**: If it's in `src/` (not in a subfolder), it's public. No `internal/` folder needed.

## Key Decisions

1. **No Event Bus**: Direct function calls via `Dispatcher<T>`, no pub/sub overhead
2. **Type-Safe Events**: Each module declares which events it CAN emit, TypeScript enforces it
3. **No More `Public<T>`**: Public classes expose public methods directly
4. **Engine is the Only "Internal" Thing**: All other modules are designed for public use
5. **Move Events to Root**: `events.ts` at `src/` level since users need these types

## Implementation Steps

### Step 1: Create Dispatcher Types and Move Events (1 hour)
- Create `src/events.ts` with `EventMap`, `EventType`, and `Dispatcher<T>` type
- Move event types out of `internal/events.ts`
- Update all imports referencing old events location
- Verify build passes

### Step 2: Refactor Keyboard Module (1 hour)
- Move `src/internal/keyboard.ts` → `src/keyboard.ts`
- Change constructor to accept `Dispatcher<'keypressed' | 'keyreleased'>`
- Remove `KeyboardInternal` class, rename to `Keyboard`
- Remove underscore prefixes from methods (they're all public now)
- Update exports in `index.ts`
- Update `engine.ts` import and usage

### Step 3: Refactor Mouse Module (1 hour)
- Move `src/internal/mouse.ts` → `src/mouse.ts`
- Change constructor to accept `Dispatcher<MouseEvent>`
- Remove `MouseInternal` class, rename to `Mouse`
- Remove underscore prefixes from methods
- Update exports and engine integration

### Step 4: Refactor Timer Module (1 hour)
- Move `src/internal/timer.ts` → `src/timer.ts`
- Remove `TimerInternal` class, rename to `Timer`
- Remove `_update` underscore - it's called by engine but is part of public API
- Note: Timer doesn't emit events, so no Dispatcher needed
- Update exports and engine integration

### Step 5: Refactor Audio Module (1 hour)
- Move `src/internal/audio.ts` → `src/audio.ts`
- Remove `AudioInternal` class, rename to `Audio`
- Remove underscore prefixes from methods
- Note: Audio doesn't emit events
- Update exports and engine integration

### Step 6: Refactor Gamepad Module (1 hour)
- Move `src/internal/gamepad.ts` → `src/gamepad.ts`
- Move `src/internal/gamepad-mapping.ts` → `src/gamepad-mapping.ts`
- Change constructor to accept `Dispatcher<GamepadEvent>`
- Remove `GamepadInternal` class, rename to `Gamepad`
- Remove underscore prefixes (except `_onGamepadConnected` which is private)
- Update exports and engine integration

### Step 7: Refactor Canvas Module (1 hour)
- Move `src/internal/canvas.ts` → `src/canvas.ts`
- Change constructor to accept `Dispatcher<'resize'>`
- Remove `CanvasInternal` class, rename to `Canvas`
- Keep underscore for truly private methods (`_present`, `_dispose`, `_getDisplayPixelSize`)
- Update exports and engine integration

### Step 8: Refactor Input Module (1 hour)
- Move `src/internal/input.ts` → `src/input.ts`
- Change constructor to accept dependencies and `Dispatcher<'actionpressed' | 'actionreleased'>`
- Remove `InputInternal` class, rename to `Input`
- Update exports and engine integration

### Step 9: Update Engine and Remove Internal Folder (1 hour)
- Update `src/engine.ts`:
  - Import all modules from new locations
  - Create `EngineDispatcher` type as `Dispatcher<EventType>`
  - Pass typed dispatchers to each module constructor
  - Remove `LikeInternal` type usage
- Delete `src/internal/` folder entirely
- Update `src/index.ts` exports

### Step 10: Update Package Exports and Verify (1 hour)
- Update `package.json` exports - remove `./internal/*` path
- Update any documentation references
- Run full test suite
- Verify TypeScript compilation
- Create migration guide for users

## Migration Path for Users

**Before:**
```typescript
import type { LikeEvent } from 'like/internal/events';
import type { CanvasSize } from 'like/internal/canvas';
```

**After:**
```typescript
import type { LikeEvent } from 'like/events';
import type { CanvasSize } from 'like/canvas';
// OR from main entry:
import type { LikeEvent, CanvasSize } from 'like';
```

## Success Criteria

- [ ] No `internal/` folder exists in `src/`
- [ ] No `*Internal` class names in codebase
- [ ] No `Public<T>` type usage
- [ ] Users can import all types from `like` or `like/*` without `/internal/`
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to runtime behavior
