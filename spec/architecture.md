# Architecture

## Scene System

Scenes are the primary organizational unit. Unlike traditional game loops with global state, Like2D organizes code into self-contained scenes.

### Design Decisions

**One scene active at a time** - Only the active scene receives update and draw calls. This simplifies reasoning about state and prevents accidental coupling between unrelated game states.

**Resolution per scene** - Each scene declares its own `width` and `height`. The canvas resizes automatically when switching scenes. This supports:
- Title screens at different resolutions than gameplay
- Pixel-perfect retro games with integer scaling
- UI scenes that match display resolution

**Lifecycle hooks** - Scenes implement only what they need:
- `load()` - Called once when scene becomes active (after resolution change)
- `update(dt)` - Every frame, receives delta time in seconds
- `draw()` - Every frame after update
- Input callbacks - Optional: `keypressed`, `mousepressed`, `actionpressed`, etc.

### Scene Switching

```typescript
like.setScene(newScene);  // Immediate switch, calls load()
```

Scene stacks will be added later by giving scenes access to their parent/pushing scenes.

## Module Organization

The `like` object exposes all modules:
- `like.graphics` - 2D rendering
- `like.audio` - Sound playback
- `like.input` - Action mapping
- `like.keyboard` - Raw keyboard access
- `like.mouse` - Raw mouse access
- `like.gamepad` - Controller support
- `like.timer` - Time management

Low-level modules (`keyboard`, `mouse`, `gamepad`) remain accessible for edge cases, but most code should use `like.input` for portability.
