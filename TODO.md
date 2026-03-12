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

### Nailing down the spec
What parts of the codebase are implict, and should be in the spec?
What good parts of the code do we notice, philosophically, and what bad parts?
What parts of the spec are outdated? Let's review the spec and fix these problems.

Then, after updating the spec, let's compare the codebase against it.

### Objects vs Args
Love2D was designed for Lua, so it uses arguments for everything, which can vary.
This is kind of antiquated. We should transition our API to:
1. Take in all required values as args
2. Take in all optional values as a props table

We need to write out a plan in TODO for completing this task, and add it to the spec.

### Consideration: Geometric Data Types
It's much easier to manipulate coordinates if they're stored as a two-item array, which can be typed as Vector2.
Vector2 should not be an object, just a two-item array. `Type Vector2 = [number, number]`
There should be a set of common (pure) functions on the Vector2 inside of a library, and x,y / w,h coordinate pairs passed around should be put inside of them.
A common pattern would be `import { V2 } from Vector2`, then for example `V2.mul(a, b)`.
Further, maybe x,y,w,h coord sets should be stored as four-item arrays, typed as Rect and again with a library.
Maybe circles as well.

We need to consider whether this would simplify our library and increase ergonomics, and if so write a plan in TODO and put it in the Spec.

### Consideration: Color handling
Canvases take in CSS colors. Let's have a `Type Color = [number, number, number, number?]`.
When drawing functions encounter a string, they will use a CSS color. If they encounter an array like this, they can use an RGBA color like love2d.
Let's also consider whether a small Color library would be needed.
Based on this, write a plan in TODO and put it in the spec.

### Consideration: reducing state, preferring objects over args.
It is rare that we benefit from setting color, then line width, then calling draw afterwards. 
Instead, let's require that a color be passed into any draw call which requires a color. Line width can be optional.
For example, line drawing take a color argument. However, if images could take an optional tint argument, put that in a props table.
Or, for the best ergonomics, maybe colors should be optional as an argument and override the currently set color.

Are there other parts of the codebase that suffer from too much statefulness? Would they be cleaner if state was handled by the user?

Let's think about this, then write a plan in TODO if needed and put it in the spec.

## Future Considerations (Post-Game Object Model)

- Camera system
- Tweening/animation
- Entity systems
- Particle systems
- Collision detection
