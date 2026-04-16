# Changelog

## [3.0.0] - UNRELEASED

During V2, we experimented heavily with API and architecture.

V3 is the end of that experiment. The goals are clear.

The entire API has been redesigned in 3.x to provide a bedrock for future non-breaking V3 releases.

### Breaking Changes
 - like2d (NPM) has moved to @like2d/like
 - Scenes have now been moved to package @like2d/scene -- a separate pkg
 - Removed ad-hoc line wrapping functionality (text 'width' param)
   - Will be replaced with text metrics in 3.x
 - Removed timer sleep function -- this can be middleware
 - Add `'fill' | 'line'` to first arg of print.
 - Remove `timestamp` field from events.
 - Rename `ready()` to just `ready` on graphics image handle, added error field.
 - Image handle size now returns `Vector2 | undefined` for if image isn't loaded.
 - Deprecate `like.callOwnHandlers(ev)` in favor of `callOwnHandlers(like, ev)`

#### Audio API Redesign
 - The entire audio API has been redesigned to match the WebAudioAPI
   backend (and sane/typical audio practices).
 - 'Pause' function has been removed — though it may be added back, the
   new practice is to read the seek value, then call `play` with the old
   seek value to simulate resuming.
 
### Additions
 - Text can now be stroked
 - For the sanity of JS users wanting to include just one url, math functions now export from root `like`
 - For the same reason as above, culled defaultMapping (silly export) and buttonMap (meh export) and now export `like.input.allButtons`

### Fixes
 - JSR package finally working

## [2.13.0] - 2026-04-02

### Breaking Changes

#### Scene split out

Scenes were always intended to be an _adapter_. A modular piece that gets plugged
into a simpler system.

At first, they were integrated into a monolith. Then, they were split out as we
narrowed into `handleEvent`. Then, they were integrated back into the engine
with the stack system. Finally, they split out again into an adapter.

That's where we are now.

Before:
```typescript
const like = createLike(document.body);
like.start();
like.pushScene(blah);
```

After:
```typescript
const like = createLike(document.body);
const sceneMan = new SceneManager(like);
like.start();
sceneMan.push(blah);
```

All of the `like.*` callbacks related to scene management have been split into
the manager in `like/scene`.

Also, prefab scenes now live in `like/scene/prefab/*`.

#### Scene lifecycle

The scene lifecycle of constructor-load-destructor is _tired_.

Using resources shouldn't force us to choose between null-checking every single resource before use, versus assuming they're non-null and crashing out.

It shouldn't involve the boilerplate of doing deallocations that the garbage
collector should be doing.

Therefore, LÏKE has decided to use a factory pattern for scenes.

What was once idiomatically:
```typescript
class MyScene extends Scene {
  someImage?: ImageHandle;
  
  constructor(private path: string) {}
  
  load(like) {
    this.someImage = like.gfx.newImage(this.path);
  }
  
  draw(like) {
    like.gfx.draw(this.someImage);
  }
  
  actionpressed(like, action) { ... }
};
```
is now:
```typescript
const myScene = (path: string): Scene => (like: Like) => {

  const someImage = like.gfx.newImage(path);

  return {
    draw() {
      like.gfx.draw(someImage);
    }
    
    actionPressed(action) { ... }
  }
}
```

It's also simpler when adopting scenes for the first time; when converting from a callback to a scene pattern, we no longer have to add `like` as the first argument of every callback. Instead, we can use this pattern:
```javascript
// before...
like = createLike(document.body);

like.update = function (dt) {
  foo();
}
// or
like.draw = () => { bar(); }

// after
like = createLike(document.body);

const createScene = (like) => {
  const myScene = {}
  myScene.update = function (dt) {
    foo();
  }
  myScene.draw = () => { bar(); }
  return myScene;
}

like.setScene(createScene)
```
For the vast majority of cases, this is as simple as `s/^like\./myScene./` plus some wrapping.

Scene lifecycle functions have also been fleshed out in terms of sane functionality.
See [the fresh docs](https://likeorg.github.io/Like2D/api/classes/scene.SceneManager.html) for details.

We are implementing this change _without backwards compat_. If you're crying out in pain right now, let me know and I'll consider writing a wrapper around old-style scenes.

### Additions
 - `like.quit` / `sceneInstance.quit` callback added for cleanup
 - `sceneInstance.load` called every time a scene enters the stack top
 - `like/scene/prefab/fadeTransition` added: easy fading between scenes
 - `scene.instance` and `scene.deinstance`

## [2.12.0] - 2026-03-30

### Breaking Changes
 - `like.input.setAction()` no longer has a default value for the `inputs` parameter. Use an explicit empty array `[]` to remove an action.
 - gfx functions no longer accept a single number as `origin`.
 - `r` field of gfx transforms is now `angle`.
 - Remove setClip -- Very incomplete, just use the canvas escape hatch for now.
 - Remove overly stateful `setContext` -- replaced with `withRenderTarget`.
 - Removed redundant radii setting of circle drawing. Just use scale directly
 - Added `position` arg to polygon drawing func.

### Added
 - **Scene Stack architecture**
    - `like.getScene(index)` -- Get stack top or other index.
    - `like.setScene(scene)` -- Now sets stack top
    - `like.pushScene(scene, overlay: boolean)` -- Put a scene on top. `overlay` for pause screens etc.
 - All draw calls now support transforms (`angle`, `scale`, `origin`) in their props table.
 - `like.canvas.hasFocus`
 - `polygon()` has a `translate` prop to offset the entire shape.
 - Expose escape-hatch context in `like.canvas.getContext()`
 - Add `withTransform` for lower-state transform abstraction.

### Updates
 - **Better pixels**: Image smoothing is enabled only in native mode, and disabled in pixel mode

## [2.11.1] - 2026-03-28

Document almost everything and [put up a website.](https://44100hertz.github.io/Like2D/api/documents/README.html)

## [2.11.0] - 2026-03-28

### Breaking Changes
 - Switch out pure graphics funcs + binding for a simple Graphics class.

### Added
 - `like.gfx.setTarget` to change what canvas it draws to.

### Fixes
 - Fix JSR.

## [2.10.1] - 2026-03-28

### Fixes
 - Fix engine dispatching the wrong 'update' event and breaking everything.

### Updates
 - We now load sdl controller db into a JSON file and delete all ambiguous buttons from the mapping.
 - mapGamepad.ts now only maps buttons that aren't unambiguously identified already.

## [2.10.0] - 2026-03-27

### Breaking Changes
 - Imports have been restructured for sanity, thus breaking all of your stuff. Sorry not sorry, this is how it was always supposed to be. Our modules:
    - `like`
    - `like/input`
    - `like/audio`
    - `like/graphics`
    - `like/math`
    - `like/timer`
    - `like/prefab-scenes`
 - `like.mouse.showCursor(boolean)` integrated with `like.mouse.setMode`. Rationale: setVisible is irrelevant in capture mode.
   Note that setting `visible` to `false` in `setMode` will be remembered when capture state is exited.
 - Removed `like.gamepad.getGamepad` -- Redundant with DOM
 - Removed `like.input.clear` -- Why does this exist?
 - `like.mouse.setMode`, replaces `showCursor` and allows setting mouse sensitivity in capture mode, as well as visibility and scroll blocking in non-captured mode.
 - Removed `buttonMenuCenter` mapping -- Relatively uncommon, no games will rely on this.
 - Removed `gfx.circle` angle property -- prefer transforms, we can rotate any shape...
 - Renamed `gamepad.isButtonDown` to `gamepad.isDown`
 - Renamed `gamepad.isButtonJustPressed` to `gamepad.justPressed`
 - Shortened the name of gamepad buttons. "BBottom" instead of "ButtonBottom", "Left" instead of "DPadLeft", "L1" instead of "ButtonL1", etc.
 - Gamepads now have a remapping feature, with auto-save / auto-load to localStorage enabled by default. No more 1:1 relationship between button names and numbers.
 - `like.gfx.print` option `limit` renamed to `width`.
 - `like.gfx.print` made alignment work differently than LOVE, more like browser canvas.

### Added
  - `like.mouse.setCapturedPos`, allows emulated mouse to be teleported while in capture mode.
  - `Vec.map` and `Vec.map2` helpers.
  - `like.gamepad.isDown` and `like.gamepad.isDown` now accept `'any'` as the first argument, to check all gamepads.
  - `like.gamepad.justPressed` now accepts a numeric argument for raw buttons.
  - Gamepad mapping / remapping system brought back with a fury
    - Gamepad now digitizes all axes and triggers automatically.
    - Brought back SDL auto mapping as a best-guess solution, plus:
    - `like.gamepad.setMapping`, `like.gamepad.getMapping`: Set / get active button mappings.
    - `like.gamepad.loadMapping`, `like.gamepad.saveMapping`: Put persistent mappings in localstorage.
    - `like.gamepad.enableAutoLoadMapping`: Always load saved mappings on gamepad connection.
    - `like.gamepad.getSticks`: Get an array of mapped sticks.
    - `like.gamepadconnected` and `like.gamepaddisconnected` events.
  - Documented input module better.
  - `like.input.setAction` now takes string or InputBinding arguments.
  - Added `like.input.appendToAction`
  - Added `like.input.getActionMapping`
  - `like.canvas.getDisplayPixelSize` -- 

### Fixed
 - **Capture Bug** If another element set cursor capture, LIKE would report capture TRUE.
 - Make `gfx.circle` center property actually work.
 - Make `gfx.circle` filled arc actually fill like a pie slice kinda
 - **Double Load** Scene-based games were loading twice. `like.setScene` was dispatching `load` before `like` had actually started running.

## [2.9.0] - 2026-03-23

### Breaking Changes

 - **Rect and type Rectangle now separate.**
 
 - **Named Mouse Buttons** 1, 2, 3 are now `'left' | 'middle' | 'right'`.

 - **No More Physical Mapping** Here lies Sam's attempt at making physical gamepad mappings in the
 browser. At first reading sdlgamecontrollerdb was promising, but the browser wasn't giving enough info for
 an SDL GUID -- it was ambiguous. Then, disaster strikes: Firefox and Chromium don't
 agree on where to map his DPad or analog sticks. **tl;dr
 gamepad physical mapping support has been ended. Use actions bindings.**. A prefab scene for binding controller inputs is in the works.
   - `like.gamepadpressed(gamepad: number, name: string)` event is now `like.gamepadpressed(gamepad: number, buttonNum: number, name: string)` as it was before. 

 - **Updates to mouse moved callback**
   - API is `mousemoved(pos: Vector2, relative: boolean)` => `mousemoved(pos: Vector2, delta: Vector2)` 
   - in non-capture mode, delta is calculated
   - in capture mode, pos is calculated -- clamps to boundaries of canvas

  - `like.getMode` is now `like.canvas.getMode(): { size: Vector2, flags: CanvasModeFlags }`
  - `like.setMode` is now `like.canvas.setmode(size: Vector2 | 'native', flags: Partial<CanvasModeFlags> )`

 - **Resize event** signature is now just  `resize(size: Vector2)`.

 - **Module exports**:
    - `Rect`, `Rectangle`, `Vector2`, and `Vec2` now import from `like/math/rect` and `like/math/vector2` etc.
    - `like/scene` builtins are now in `like/prefab-scenes`

 - **Removed Timer `setSceneTime`** because it doesn't play nice with composed scenes.

 - `LikeWithCallbacks` is now just `Like`
 - `Like` is now `LikeInternal`
 - `Like2DEvent` is now just `LikeEvent`
 - Renamed `Source` to `AudioSource`
 - Renamed `input.map` and `input.unmap` to `input.setAction(string, string[]?)` -- which clears the action if nothing provided.

### Added
 - `like.canvas` module.
 - `like.canvas.getFullscreen(): bool`
 - `like.canvas.setFullscreen(bool)`
 - `like.callOwnHandlers(LikeEvent)`: This has been split out and exposed for the sake of
   ease in writing custom LIKE systems.
 - `callSceneHandlers(LikeEvent)`: Similar, but for a scene to call its own events.
 - `sceneDispatch(Scene, like, LikeEvent)`: Used for passing events into sub-scenes (including root scene).
 - `like.focus` and `like.blur` now have one argument `'tab' | 'canvas'` for source.
 - `like.audio.getAllSources`

### Updated
 - Documented public-facing API with TSDoc

### Fixed
 - canvas resize events now _actually fire_
 - `like.handleEvents` and `scene.handleEvents` now work as expected -- they override the preexisting event handling.
 - All API methods intended to be private have vanished from the user-facing API. Import from `like/internal/[name]` and cast `[Name]` to `[NameInternal]` to retrieve.

## [2.8.0] - 2025-03-18

### Breaking Changes

- **Mouse event signatures changed**: `mousepressed(x, y, button)` → `mousepressed(pos: Vector2, button: number)`
- **Keyboard events now bound to canvas**: Keys only work when canvas is focused
- **Canvas mode refactoring**: Always uses one in-browser canvas, swaps render target internally

### Added

- `mousemoved(pos: Vector2, relative: boolean)` - Mouse movement event
  - `relative=false`: absolute canvas coordinates `[x, y]`
  - `relative=true`: relative movement `[dx, dy]` for FPS controls
- `lockPointer(locked: boolean)` / `isPointerLocked()` - Pointer lock API
- `showCursor(visible: boolean)` / `isCursorVisible()` - Cursor visibility
- `focus` / `blur` events - Canvas focus state
- `getCanvasSize()` now returns render target size (pixel canvas in pixel mode)

### Changed

- Mouse and keyboard events bound to canvas element
- Wheel events preventDefault to stop page scrolling
- Scroll keys preventDefault when canvas focused
- Simplified mouse transform logic using offsetX/Y

## [2.7.1] - 2026-03-17

### Updated

- Game controller database updated to latest from SDL_GameControllerDB

## [2.7.0] - 2026-03-17

### Added

- Transform API: `push()`, `pop()`, `translate()`, `rotate()`, `scale()` for canvas state management
- StartupScene now correctly displays the Like2D logo
- `like.setScene()` method for switching scenes in the unified API

### Removed

- **Adapter modules removed**: `like2d/callback` and `like2d/scene` subpath exports no longer exist
- All functionality is now available from the main `like2d` import

### Breaking Changes

- Adapters removed - import directly from `'like2d'`:
  - `createLike()` is now exported from main module (was `'like2d/callback'`)
  - `Scene` type and `StartupScene` are exported from main module (was `'like2d/scene'`)
  - Scene management now via `like.setScene()` instead of `SceneRunner`

## [2.6.0] - 2026-03-17

### Breaking Changes

- `newImage()` moved from standalone export to `like.gfx.newImage()` - update `import { newImage }` to use `like.gfx.newImage()`

## [2.5.1]

### Fixed

- Updated all documentation (README, website docs) to reflect the actual v2.5.0 API

## [2.5.0]

### Breaking Changes

- **Callback adapter**: Complete API redesign. `createLike()` now returns `Like` synchronously. Callbacks assigned as properties (`like.load`, `like.update`, `like.draw`). Callbacks receive no parameters - they close over `like`. Start loop with `await like.start()`.
- **Scene adapter**: All scene methods receive `like: Like` as first parameter. Use `like.gfx` for drawing.
- **Graphics module split**: Static `newImage()` for asset loading, bound graphics context accessed via `like.gfx`
- Removed stateful methods: `setBackgroundColor()`, `setFont()`, `getFont()`
- Removed `arc()` - use `circle()` with `arc` option
- `ShapeProps` no longer includes `color` (now positional)

### Added

- `Like` interface includes `gfx: BoundGraphics`
- Callback adapter supports property assignment pattern: `like.draw = () => {...}`
- `routeEvents()` exported from callback adapter for custom event handling

### Removed

- `LikeInstance` interface
- `like` parameter from callback adapter callbacks (now closed over)
- `g` parameter from scene adapter `draw` callback (use `like.gfx`)
- Adapter re-exports of core utilities - import from `'like2d'` directly

## [2.4.0]

### Breaking Changes

- **Canvas mode simplified**: `{ type: 'fixed'|'native', ...}` → `{ pixelResolution: Vector2|null, fullscreen: boolean }`
- **StartupScene**: Removed `onStart` callback, now takes `setScene` function directly

## [2.1.0]

- Merged `setFullscreen()` into `setMode()` API
- Added `getMode()` to retrieve canvas configuration

## [2.0.1]

- `SceneRunner.toggleFullscreen()`
- Fixed mouse position calculation in pixel art mode

## [2.0.0] - ALPHA

### Breaking Changes

- `V2` → `Vec2`, `R` → `Rect`
- `Engine.start(update, draw)` → `Engine.start(onEvent)` with `Like2DEvent` discriminated union
- Removed `engine.onKey`, `engine.onMouse`, `engine.onGamepad`
- Scene interface: added optional per-event handlers (`keypressed`, `mousepressed`, etc.)

### Added

- Event system with uniform `{type, args, timestamp}` shape
- Vitest test infrastructure
- MIT License
- JSR publishing config

## [1.0.0] - PILOT

Proof of concept.
