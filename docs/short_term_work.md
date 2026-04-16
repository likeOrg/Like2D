# 3.x tasks

## Packaging / Docs
 - [ ] Verify that JSR package actually works
 - [ ] Twofer: see if you can't include README in root index and then make root redirect to index. In order to solve:
    - [ ] Fix wonky JSR docs if possible, while preserving of course typedoc
    - [ ] Fix weird typedoc wiki where README and like2d/index are different
 - [ ] Check over typedoc error messages

## Audio
 - [ ] Add declicking feature (volume ramp) to every seek and stop
 - [ ] Volume ramp global volume -- must keep internal val?
 - [ ] Determine if declicking is relevant for other params
 - [ ] Enable streaming audio support for large files
 - [ ] Make sure that passing in a whole status object doesn't cause an excess seek.
 
## General
 - [ ] Make APIs more forgiving when possible
   - [ ] Allow calling like.start multiple times
   - [ ] Look for other sharp edges

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
 - [ ] Add getDelta, which returns the amount of movement since the last frame. NOT since the last time mousemoved was dispatched.

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

