# v2.8.0 TODO - Focus & Event Handling

## Refactor canvas
 - [x] Make the canvas manager always display the same in-browser canvas, only changing the render target.
 - [x] Use algebra to fix and/or simplify mouse coord transform logic, broken by this change.

## Mouse API updates (in progress?)
 - [x] Replace setVisible and getPointerLock with lockPointer and isPointerLocked
 - [x] replace mouse getX and getY with getPosition in API
 - [ ] test pointer lock in feature demo

## Focus Blur (in progress?)
 - [ ] Add 'focus' and 'blur' events in the engine.
 - [ ] (refactor) Make sure all event listeners are cleaned up on dispose.


## Adding PreventDefault to avoid scrolling the page etc while game is focused. (in progress?)
 - [ ] Consider binding mouse movement and click events to the canvas element, which can be focused. Else, use preventDefault conditionally with hit testing (use Rect library) in both mouse and keyboard, as a pseudo-capture
 - [ ] Consider an option to preserve old behavior w/r/t capture, while still calling preventDefault -- on events that could cause scrolling.
 - [ ] Implement your decision.

