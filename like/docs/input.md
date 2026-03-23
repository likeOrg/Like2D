# Input System

## Philosophy

Hardcoding keys (`if (key === 'Space')`) creates problems:
- No remapping support
- Awkward multi-input checks (`if (key === 'Space' || key === 'ArrowUp')`)
- Different controllers have different button layouts

## Action Mapping

```typescript
// Map abstract actions to physical inputs
like.input.setAction('jump', ['Space', 'ArrowUp', 'KeyW', 'ButtonBottom']);
like.input.setAction('fire', ['MouseLeft', 'KeyZ', 'RT']);

// Query by action
if (like.input.isDown('jump')) { /* ... */ }
if (like.input.justPressed('fire')) { /* ... */ }
```

## Design Decisions

**Scancodes for keyboard** - Physical key positions, not characters. 'KeyW' is the W key regardless of keyboard layout.

**Multiple inputs per action** - Natural way to support alternatives (WASD + arrows, keyboard + gamepad).

**Three query methods**:
- `isDown(action)` - Currently held (for movement)
- `justPressed(action)` - First frame of press (for one-shot actions)
- `justReleased(action)` - First frame of release

**Raw access preserved** - `like.keyboard`, `like.mouse`, `like.gamepad` remain available for:
- Debug overlays
- Text input
- Special controller features (gyro, touchpads)

## Input String Format

- Keyboard: `'Space'`, `'ArrowLeft'`, `'KeyW'` (scancodes)
- Mouse: `'MouseLeft'`, `'MouseRight'`, `'MouseMiddle'`
- Gamepad: `'ButtonBottom'`, `'RT'`, `'DPLeft'`
