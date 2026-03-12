# Input System

## Philosophy

Hardcoding keys (`if (key === 'Space')`) creates problems:
- No remapping support
- Awkward multi-input checks (`if (key === 'Space' || key === 'ArrowUp')`)
- Different controllers have different button layouts

Like2D separates **actions** from **physical inputs**.

## Action Mapping

```typescript
// Map abstract actions to physical inputs
like.input.map('jump', ['Space', 'ArrowUp', 'KeyW', 'GP ButtonBottom']);
like.input.map('fire', ['MouseLeft', 'KeyZ', 'GP RT']);

// Query by action
if (like.input.isDown('jump')) { /* ... */ }
if (like.input.justPressed('fire')) { /* ... */ }
```

## Design Decisions

**Scancodes for keyboard** - Physical key positions, not characters. 'KeyW' is the W key regardless of keyboard layout.

**Multiple inputs per action** - Natural way to support alternatives (WASD + arrows, keyboard + gamepad).

**Gamepad abstraction** - SDL game controller database maps physical buttons to standard names (`ButtonBottom`, `RT`, `DPadLeft`). Games work across controller brands without code changes.

**Three query methods**:
- `isDown(action)` - Currently held (for movement)
- `justPressed(action)` - First frame of press (for one-shot actions)
- `justReleased(action)` - First frame of release

**Raw access preserved** - `like.keyboard`, `like.mouse`, `like.gamepad` remain available for:
- Debug overlays
- Text input
- Special controller features (gyro, touchpads)

## Gamepad Mapping

Controllers use vendor/product IDs for identification. The SDL database provides standard mappings.

Browser limitation: Only 4 bytes of GUID available (vendor + product). Matching is by vendor/product only, which may cause issues with variants. This is an accepted trade-off for web compatibility.

## Input String Format

- Keyboard: `'Space'`, `'ArrowLeft'`, `'KeyW'` (scancodes)
- Mouse: `'MouseLeft'`, `'MouseRight'`, `'MouseMiddle'`
- Gamepad: `'GP ButtonBottom'`, `'GP RT'`, `'GP DPadLeft'`
- Specific gamepad: `'GP0 ButtonBottom'` (gamepad 0 only)
