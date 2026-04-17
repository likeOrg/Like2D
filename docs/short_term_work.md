# 3.x tasks

## Packaging / Docs
 - [x] Verify that JSR package actually works
 - [ ] Check over typedoc error messages
 - [ ] Verify that scene package actually works
   - [ ] in NPM
   - [ ] in JSR

## Audio
 - [ ] Add declicking feature (volume ramp) to every seek and stop
 - [ ] Volume ramp global volume -- must keep internal val?
 - [ ] Determine if declicking is relevant for other params
 - [ ] Enable streaming audio support for large files
 - [ ] Make sure that passing in a whole status object doesn't cause an excess seek.
 
## General
 - [ ] Make APIs more forgiving when possible
 - [ ] Allow calling like.start multiple times, which has no effect. Perhaps
 you meant to call `dispose` first?
 - [ ] Ensure that `dispose` followed by `start` works as expected. If not, disallow it.
 
## Async features
Async could make LIKE much more ergonomic when it comes to resource loading,
since nothing is optional. We should expose async behaviors cleanly, as
well as event callbacks on resources in the vanilla API. Make sure they don't escape LIKE -- LIKE dies, the callbacks die.

The cleanest approach is to make all callbacks optionally async, and
resource loading likewise. We create a second type for known-loaded
resources that are async loaded.

handleEventAsync will have to be added, since our API is locked in.
Add handleEvent to future deprecations unless it still proves useful.

The scene system could clean this up perfectly within a loading scene.

## Action mapping scene
 - [ ] Copy+modify the gamepad mapping scene to make
       it possible to map actions.
 - [ ] When actions fire, they return a gamepad number if relevant.

## ColorNum helpers
 - [ ] Add method to convert Color to ColorNum.
 - [ ] Don't use ColorNum in any API

## Sticks!
 - [ ] Figure out Firefox/Chrome deterministic behavior for d-pads and sticks.
 - [ ] Stick digitization deadzone option.
 - [ ] Stick emulation from buttons.
 - [ ] Stick calibration / deadzones.
 - [ ] Add stick mapping to mapGamepad scene.

## Mouse
 - [ ] Allow user to optionally read mouse movements outside of the canvas.
 - [ ] Add getDelta, which returns the amount of movement since the last frame. NOT since the last time mousemoved was dispatched.

## Logging
 - [ ] Put a warning ONLY the first time when audio is (or would be) blocked due to autoplay policy.

## Crash handling
 - [ ] Bare minimum: descibe and test an idiomatic pattern for restoring game state after a critical error.
 - [ ] Make a screen that displays the crash + error message and encourages you to check console
 - [ ] Add internal state tracking to investigate crash causes on
the JS runtime side.

## Timer extensions
 - [ ] Allow the user to create a pausable, variable-speed timer.
 - [ ] Create a middleware in scene that allows this timer to control the scene's dt value.
 - [ ] Allow hooking this timer into audio sources as speed control.
 - [ ] Wrap settimeout with variable-speed timer and give users an API for delayed calls + cancelling them.

## Transform objects
 - [ ] Research libraries / builtins for 2d transformation matrices.
 - [ ] Do these transforms during canvas transform operations for mouse transform / camera library purposes.

## Text Overhaul
 - [ ] Add text metrics returning a Rect.
 - [ ] Consider various use cases for text alignment -- simplify API if needed.
 - [ ] Leverage Vec2 and Rect to find cozy, short abstractions for any text alignment in 2-3 LoC.
 - [ ] Line wrapping: verify that it is possible to write a line wrapping
algorithm easily, given the exposed API.

## Storage module
 - [ ] Investigate: how do we best load previous state back from the last crash?
 - [ ] Investigate: Joypad mapping has autosave / autoload. Should action mapping also? Should this be in `storage`?
   - Thinking: Solve both with a class that basically acts as an indexedDb queue / cache.

