# Like2D Implementation TODO

## Phase 1: Core Refactor - Scene System ✓

- [x] Redesign Like class to support Scene-based architecture
- [x] Implement Scene interface with width/height resolution setting
- [x] Create `like.setScene(scene)` for scene switching
- [x] Remove old callback-based system
- [x] Update entry point to instantiate and run scenes
- [x] Ensure canvas resizes when switching to scene with different resolution

## Phase 2: Asset Loading Refactor ✓

- [x] Convert to fire-and-forget loading model
- [x] Create `ImageHandle` class with `isReady()` and `ready()` methods
- [x] Modify `newImage()` to return `ImageHandle` synchronously
- [x] Cache `ImageHandle` instances by path
- [x] Update `draw()`/`drawq()` to skip silently if not ready
- [x] Make `newSource()` synchronous (no await)
- [x] Update `play()` to return false silently if not loaded
- [x] Remove `preload` from Scene interface
- [x] Remove preload call from `Like.start()`
- [x] Update demo to use new loading pattern
- [x] Update SPEC.md documentation
- [x] Export `ImageHandle` type from index.ts

## Phase 3: Input Mapping System ✓

Use scancodes for actions, but pass both keycodes and scancodes into callbacks.

- [x] Create `like.input` module
- [x] Implement `like.input.map(action, inputs[])`
- [x] Implement `like.input.isDown(action)` - checks if any mapped input is held
- [x] Implement `like.input.justPressed(action)` - true on first frame of press
- [x] Implement `like.input.justReleased(action)` - true on first frame of release
- [x] Support keyboard keys in mapping (scancodes)
- [x] Support mouse buttons in mapping
- [x] Maintain low-level `like.keyboard`, `like.mouse` access
- [x] Update demo to use input mapping system
- [x] Use SDL's game controller DB to unify controller mappings
- [x] Make sure that gamepad.ts is using our unified input mapping library in input-state.ts.
- [x] Fix bugs with the game controller DB GUID (below)
- [x] Circumvent the GUID limitation somehow (below)

- **GUID Limitation**: The last 8 bytes of the GUID are always zeros because browsers only expose vendor and product IDs (16-bit each), not the full 16 bytes of data that SDL typically includes (version, driver info, etc.). This may cause incorrect mappings if two controllers have the same vendor/product but different capabilities.
  - **Solution**: Match controllers by vendor/product ID only, ignoring the rest of the GUID. The `vendorProductIndex` in gamepad-db.ts allows lookups by just these 4 bytes.

Common mistakes:
 - GUIDs do NOT all end in all zeroes. The first few ones end in zeros, but later on in the db file that's not the case.
 - Name matching is NOT reliable and WILL NOT be used.

Plan:
 - We will match entirely based on vendor and product ID alone.
 - In some edge cases, this may cause problems. We will gather that data from our users in the long run.

## Phase 4: Modernize Existing Modules

- [x] Refactor Graphics module to use 0-1 color range consistently
- [x] Update Audio module API for consistency
- [x] Ensure Timer module works with Scene lifecycle
- [x] Remove `localstorage.ts` (file didn't exist)
- [x] Add analog stick support to gamepad module:
  - `getAxis(gamepadIndex, axisIndex)` - raw axis value with deadzone
  - `getLeftStick(gamepadIndex)` - returns `{x, y}` with radial deadzone
  - `getRightStick(gamepadIndex)` - returns `{x, y}` with radial deadzone
  - Use browser standard mapping (axes[0-3] = leftX, leftY, rightX, rightY)
  - Apply ~0.15 radial deadzone to handle stick drift

## Phase 5: Restructuring

### No default exports ✓
- [x] Remove every default export, replace with explicit import/export
- [x] Document in SPEC.md

### Documentation ✓
- [x] Create concise README.md focused on core functionality
- [x] Break down SPEC.md into spec/ folder with design intent documents
- [x] Remove old SPEC.md (replaced by spec/ folder)

## Phase 6: Objects vs Args API Modernization

**Goal**: Transition from Love2D-style argument lists to modern JavaScript/TypeScript pattern with required args and optional props tables.

### Graphics Module Refactor

- [x] Create Color type alias: `type Color = [number, number, number, number?] | string`
- [x] Create Quad type alias: `type Quad = [number, number, number, number]`
- [x] Update `rectangle(mode, x, y, w, h, props?)` - add color (Color type) and lineWidth to props
- [x] Update `circle(mode, x, y, radius, props?)` - add color (Color type) and lineWidth to props
- [x] Update `line(points, props?)` - change from rest params to array, add color (Color type) and lineWidth to props
- [x] Update `polygon(mode, points, props?)` - change from rest params to array, add color (Color type) and lineWidth to props
- [x] Update `arc(mode, x, y, radius, angle1, angle2, props?)` - add color (Color type) and lineWidth to props
- [x] Update `points(points, props?)` - change from rest params to array, add color (Color type) to props
- [x] **Combine** `draw` and `drawq` into single `draw(handle, x, y, props?)` with optional `quad` prop (Quad type)
  - Props: color (Color type), quad (Quad type), r (rotation), sx, sy, ox, oy
- [x] **Combine** `print` and `printf` into single `print(text, x, y, props?)` with optional `limit` and `align` props
  - Props: color (Color type), font, limit, align
- [x] Update `setBackgroundColor(color)` to accept Color type
- [x] Remove `setColor()` - color now always passed via props
- [x] Remove `getColor()` - no longer needed
- [x] Remove `setFont()` calls before draw operations - font now in props
- [x] Update all internal methods to extract color from props and apply to canvas context

### Audio Module Refactor

- [x] Fix `newSource(path, options?)` to actually pass options to Source constructor
- [x] Verify SourceOptions interface is exported

### Update Demo (main.ts)

- [x] Remove all `setColor()` calls
- [x] Remove all `setFont()` calls before text rendering
- [x] Update `rectangle()` calls to use props for color
- [x] Update `circle()` calls to use props for color
- [x] Update `line()` calls to use array syntax for points
- [x] Update `polygon()` calls to use array syntax for points
- [x] Update `print()` calls to use props for color and font
- [x] Update `draw()` calls - remove drawq usage, add quad to props if needed
- [x] Verify demo still works correctly

### Update Documentation

- [x] Update README.md examples to use new API
- [x] Update ASSET_LOADING_PLAN.md examples to use new API

