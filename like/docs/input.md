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
like.input.setAction('jump', ['Space', 'ArrowUp', 'KeyW', 'BBottom']);
like.input.setAction('fire', ['MouseLeft', 'KeyZ', 'R2']);

// Query by action
if (like.input.isDown('jump')) { /* ... */ }
if (like.input.justPressed('fire')) { /* ... */ }
```

## Design Decisions

**Scancodes for keyboard** - Physical key positions, not characters. 'KeyW' is the W key regardless of keyboard layout.

**Multiple inputs per action** - Natural way to support alternatives (WASD + arrows, keyboard + gamepad).

**Gamepad abstraction** - SDL GameControllerDB maps physical buttons to LIKE's standard names (`BBottom`, `R2`, `Left`). Games work across controller brands without code changes.

**Three query methods**:
- `isDown(action)` - Currently held (for movement)
- `justPressed(action)` - First frame of press (for one-shot actions)
- `justReleased(action)` - First frame of release

**Raw access preserved** - `like.keyboard`, `like.mouse`, `like.gamepad` remain available for:
- Debug overlays
- Text input
- Special controller features (gyro, touchpads)

## Gamepad Physical Mapping

Controllers use vendor/product IDs for identification. LIKE parses the browser's gamepad ID string to extract these and looks up standard mappings in the SDL GameControllerDB.

**Supported button names**:
- Face buttons: `BBottom`, `BRight`, `BLeft`, `BTop`
- Shoulders: `L1`, `R1`, `L2`, `R2`
- Menu: `MenuLeft`, `MenuRight`, `LeftStick`, `RightStick`
- D-Pad: `Up`, `Down`, `Left`, `Right`

**Browser limitation**: Browsers don't expose the full SDL GUID. Only vendor and product (4 bytes total) are available. LIKE matches by vendor/product, which may cause issues with variant controllers. This is an accepted trade-off for web compatibility.

**Fallback**: If no SDL mapping is found, LIKE falls back to the standard gamepad mapping for browsers that report `mapping: "standard"`. Non-standard controllers can be remapped using the `MapGamepad` scene.

## Input String Format

- Keyboard: `'Space'`, `'ArrowLeft'`, `'KeyW'` (scancodes)
- Mouse: `'left'`, `'middle'`, `'right'`
- Gamepad: `'BBottom'`, `'R2'`, `'Left'`
