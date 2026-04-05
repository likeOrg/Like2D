# Versioning
Currently We're on "V2.x.x" and the minor versions are breaking.
This is bad practice.

The next version that _breaks_ the API will be 3.x

Let's identify serious breaking changes that are likely to occur based on short and long term plans.

Then, let's update our API and pull the band-aid off all at once.

# ColorNum helpers
Colors should have some helpers.
 - fromHSV
 - random color
 - setOpacity
 
pull in https://www.npmjs.com/package/color-name and we won't have
to deal with ColorNum existing -- switch colors to just name or RGB

Or, we can get a CSS color parsing library.

# Fix scene time for good!
 - Discourage use of like.timer.getTime(), encourage
   use of a time accumulating variable.

# Scene / state stuff
Carefully consider how much state is in your APIs. Is there a set of functions that would be standard practice to call
at the start of a scene? Should they be required?

# Action mapping scene
 - [ ] Copy+modify the gamepad mapping scene to make
       it possible to map actions.
 - [ ] When actions fire, they return a gamepad number if relevant.

# Sticks!
 - [ ] Figure out Firefox/Chrome deterministic behavior for d-pads and sticks.
 - [ ] Add stick mapping to mapGamepad scene.
 - [ ] Stick digitization deadzone option.
 - [ ] Stick emulation from buttons.

# Javascript
 - [ ] Identify any possible JS hortcomings for JS users.

# Audio
 - [ ] Polyphony? 

# Logging
 - [ ] Put a warning ONLY the first time when audio is (or would be) blocked due to autoplay policy.

# Crash handling
 - [ ] Bare minimum: descibe and test an idiomatic pattern for restoring game state after a critical error.
 - [ ] Make a screen that displays the crash + error message and encourages you to check console

# Timer extensions
 - [ ] Consider renaming `Timer` to `Time` and allowing for multiple timers i.e. true scene time.
 - [ ] Wrap settimeout and give users an API for delayed calls + cancelling them.
 - [ ] Allow setting timer speed.

# Gamepad extensions
 - [ ] Stick calibration / deadzones.
 - [ ] Allow developer to choose their button naming scheme?
 - [ ] [Add name CRC16 and name fallback behavior from SDL.](https://claude.ai/share/9dab1deb-ea35-41dd-8c17-30e9985478da)
   - Note above: This hits 48 bits, awfully close to our floating point limits.

# Transform objects
 - [ ] Research libraries / builtins for 2d transformation matrices.
 - [ ] Do these transforms during canvas transform operations for mouse transform / camera library purposes.

 # Text Overhaul
 - [ ] Add text metrics returning a Rect.
 - [ ] Consider various use cases for text alignment -- simplify API if needed.
 - [ ] Leverage Vec2 and Rect to find cozy, short abstractions for any text alignment in 2-3 LoC.

# Event module
 - [ ] Put callOwnHandlers, scene functions, etc. into like.event
 - [ ] Add generic event extension system: example is adding fixedUpdate event.

# Storage module
 - [ ] Investigate: how do we best load previous state back from the last crash?
 - [ ] Investigate: Joypad mapping has autosave / autoload. Should action mapping also? Should this be in `storage`?
   - Thinking: Solve both with a class that basically acts as an indexedDb queue / cache.

# Mouse
 - [ ] Add getDelta, which returns the amount of movement since the last frame. NOT since the last time mousemoved was dispatched.

# Document input mapping workflow [Unreleased docs for v2.11.0]
