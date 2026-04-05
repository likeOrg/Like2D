
# 3.x release tasks

FULL once-over of the API for breaking changes

# Things that will break API in 3.x
 - [x] Remove ad-hoc line wrapping for text metrics
 - [x] Add fill/line option to start of text print (for consistency)
 - [x] Split scenes into own package; keep in monorepo.
 - [ ] Document
 - [x] Remove timer "sleep" functionality -- could be a middleware.
 - [x] Document and provide an example of middleware
 - [ ] Publish "redirect version" sending to new package
 - [ ] Rename NPM package to @like2d/like
 - [ ] Document this
 
# Package scenes
 - [ ] npm @like2d/scene
 - [ ] jsr @like2d/scene

## JS code examples and starter
 - [ ] Code examples
 - [ ] Starter

## ColorNum helpers
 - [ ] Add method to convert Color to ColorNum.
 - [ ] Don't use ColorNum in any API

## Fix scene time for good!
 - [ ] Discourage use of like.timer.getTime(), encourage
       use of a time accumulating variable.

## Action mapping scene
 - [ ] Copy+modify the gamepad mapping scene to make
       it possible to map actions.
 - [ ] When actions fire, they return a gamepad number if relevant.

## Mouse
 - [ ] Add getDelta, which returns the amount of movement since the last frame. NOT since the last time mousemoved was dispatched.

# 3.1 release tasks

## Sticks!
 - [ ] Figure out Firefox/Chrome deterministic behavior for d-pads and sticks.
 - [ ] Stick digitization deadzone option.
 - [ ] Stick emulation from buttons.
 - [ ] Stick calibration / deadzones.
 - [ ] Add stick mapping to mapGamepad scene.

## Audio
 - [ ] Polyphony? 

## Logging
 - [ ] Put a warning ONLY the first time when audio is (or would be) blocked due to autoplay policy.

## Crash handling
 - [ ] Bare minimum: descibe and test an idiomatic pattern for restoring game state after a critical error.
 - [ ] Make a screen that displays the crash + error message and encourages you to check console

## Timer extensions
 - [ ] Wrap settimeout and give users an API for delayed calls + cancelling them.
 - [ ] Allow setting timer speed.

## Transform objects
 - [ ] Research libraries / builtins for 2d transformation matrices.
 - [ ] Do these transforms during canvas transform operations for mouse transform / camera library purposes.

## Text Overhaul
 - [ ] Add text metrics returning a Rect.
 - [ ] Consider various use cases for text alignment -- simplify API if needed.
 - [ ] Leverage Vec2 and Rect to find cozy, short abstractions for any text alignment in 2-3 LoC.

## Storage module
 - [ ] Investigate: how do we best load previous state back from the last crash?
 - [ ] Investigate: Joypad mapping has autosave / autoload. Should action mapping also? Should this be in `storage`?
   - Thinking: Solve both with a class that basically acts as an indexedDb queue / cache.

