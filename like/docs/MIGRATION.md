# Migration Guide: LIKE 2.x Restructuring

LIKE has undergone a significant restructuring of its internal modules to improve type safety, reduce friction when importing types, and simplify the API.

## Breaking Changes

### 1. Internal Imports Removed

The `/internal/` path has been removed. All modules are now accessible directly from the root package or through the main entry point.

**Before:**
```typescript
import type { LikeEvent } from 'like2d/internal/events';
import type { CanvasSize } from 'like2d/internal/canvas';
```

**After:**
```typescript
import type { LikeEvent, CanvasSize } from 'like2d';
// OR
import type { LikeEvent } from 'like2d/events';
import type { CanvasSize } from 'like2d/canvas';
import type { Gamepad, LikeButton } from 'like2d/gamepad';
```

### 2. Method Rename: Underscores Removed

Public methods on subsystems that previously had underscores (due to the `Public<T>` utility) are now named directly.

| Subsystem | Old Method | New Method |
|-----------|------------|------------|
| Timer     | `_update`  | `update`   |
| Input     | `_update`  | `update`   |
| Keyboard  | `_dispose` | `dispose`  |
| Mouse     | `_dispose` | `dispose`  |
| Gamepad   | `_dispose` | `dispose`  |
| Canvas    | `_dispose` | `dispose`  |

**Note:** Some methods that are truly internal to the engine still have underscores (e.g., `canvas._present()`), but you should generally not be calling these in your game code.

### 3. Class Name Changes

Internal class names ending in `Internal` have been renamed to their public counterparts.

| Old Class          | New Class |
|--------------------|-----------|
| `KeyboardInternal` | `Keyboard`|
| `MouseInternal`    | `Mouse`   |
| `TimerInternal`    | `Timer`   |
| `AudioInternal`    | `Audio`   |
| `GamepadInternal`  | `Gamepad` |
| `CanvasInternal`   | `Canvas`  |
| `InputInternal`    | `Input`   |

## New Features: Dispatcher Pattern

Modules now use a type-safe `Dispatcher<T>` pattern. Each module declares which events it can emit, and TypeScript enforces this at the engine level. This makes the engine more modular and easier to test or use subsystems in isolation.
