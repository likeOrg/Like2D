Used to map inputs (from keyboard, mouse, or gamepad) into actions.

{@link setAction} allows for set-and-forget mappings. Good for one-off games.

Example:
```js
// bind action jump
like.load() {
  like.input.setAction('jump', ['KeyX', 'Space', 'ButtonBottom'])
}

like.actionpressed(action) {
  if (action == 'jump') {
    player.tryJumping();
  }
}
```

For more sophisticated games, see also:
 - {@link appendToAction}
 - {@link getActionMapping}

These allow for programmatic binding based on events. For example:
```js
let currentlyMapping = 'jump';

// Watch for gamepad and keyboard events
like.keypressed = (code) => {
  if (currentlyMapping) {
    like.input.appendToAction(currentlyMapping, code);
  }
}
like.gamepadpressed = (name) => {
  if (currentlyMapping) {
    like.input.appendToAction(currentlyMapping, name);
  }
}

// Print some info about the current mapping
like.draw = () => {
  if (currentlyMapping) {
    myGame.statusLine =
      `Mapped ${like.input.getActionMapping(currentlyMapping)} to ${currentlyMapping}`
  }
}

```
