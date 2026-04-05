## Creating your own scenes

Scenes are a function that receives `Like` and `SceneManager`
and returns a {@link SceneInstance | scene instance with event handlers}.

## Examples

Minimal usage:
```typescript
const gameOver: Scene = (like, scenes) => ({
    titleCard: like.gfx.newImage(path);
    spawnTime: like.timer.getTime();
    draw() {
      // draw 'game over' over the lower scene
      like.gfx.draw(this.titleCard);
      scenes.get(-2)?.draw();
    }
    update() {
      // back to title screen after 3 seconds
      if (like.timer.getTime() > spawnTime + 3) {
        while(scenes.pop());
      }
    }
})
```

For configurable scenes, it is reccommended to use a function
that returns a Scene.
```typescript
const myScene = (options: { speed: number }): Scene =>
  (like: Like, scenes: SceneManager) => {

    const playerImage = like.gfx.newImage('player.png');
    let x = 0, y = 0;

    return {
      update(dt) {
        x += options.speed * dt;
      },
      draw() {
        like.gfx.draw(playerImage, [x, y]);
      }
      mousepressed() {
        // exit this scene when user clicks
        scene.pop();
      }
    };
  };
```

Of course, a class pattern is also possible.
```typescript
class ThingDoer extends SceneInstance {
  constructor(like, scenes) {...}
  ...
}

const thingDoerScene: Scene =
  (like, scenes) => new ThingDoer(like, scenes);
```
Or a configurable class:
```typescript
class ThingDoer extends SceneInstance {
  constructor(like, scenes, options) {...}
  ...
}

const thingDoerScene = (options): Scene =>
  (like, scenes) => new ThingDoer(like, scenes, options);
```

## Converting from Callbacks

When converting from global callbacks to a scene:

```typescript
// Before (callbacks)
like.update = function(dt) { player.update(dt); }
like.draw = () => { player.draw(like.gfx); }

// After (scene)
scenes.set((like, scenes) => {
  const scene: SceneInstance = {}
  scene.update = function (dt) { player.update(dt); },
  scene.draw = () => { player.draw(like.gfx); }
  return scene;
});
```
## Composing scenes

A `parent` scene contains a `child` scene, calls it, and
lifecycle via {@link SceneManager.instantiate} and dispatching
the `quit` event if needed.

Just like the `like` object, scenes have handleEvent on them.
So, you could layer them like this, for example:

```typescript
// Composing scenes lets us know about the children.
// This allows communication, for example:
type UISceneInstance = SceneInstance & {
  // Sending events to child scene
  buttonClicked(name: string): void;
  // Getting info from child scene
  getStatus(): string;
};
type UIScene = SceneEx<UISceneInstance>;

const uiScene = (game: UIScene): Scene =>
  (like, scenes) => {
    const childScene = scenes.instantiate(game);
    return {
      handleEvent(event) {
          // Block mouse events in order to create a top bar.
          // Otherwise, propogate them.
          const mouseY = like.mouse.getPosition()[1];
          if (!event.type.startsWith('mouse') || mouseY > 100) {
              // Use likeDispatch so that nested handleEvent can fire,
              // if relevant.
              likeDispatch(childScene, event);
          }
          // Then, call my own callbacks.
          // Using likeDispatch here will result in an infinite loop.
          callOwnHandlers(this, event);
      },
      mousepressed(pos) {
          if (buttonClicked(pos)) {
              childScene.buttonClicked('statusbar')
          }
      },
      draw() {
          drawStatus(like, childScene.getStatus());
      }
    };
  }

const gameScene = (level: number): UIScene =>
  (like, scene) => ({
    update() { ... },
    draw() { ... },
    // mandatory UI methods from interface
    buttonClicked(name) {
      doSomething(),
    },
    getStatus() {
      return 'all good!';
    }
  });

like.pushScene(uiScene(gameScene);
```

The main advance of composing scenes versus the stack-overlay
technique is that the parent scene knows about its child.
Because there's a **known interface**, the two scenes
can communicate.

This makes it perfect for reusable UI,
level editors, debug viewers, and more.

## Scene stacking

Higher on the stack is the `upper` scene, and lower on it
is the `lower`. We use the term `overlay` to refer to an
upper scene that passes `draw` events to a lower one.

You might assume that the purpose of a scene stack is
visual: first push the BG, then the FG, etc.

Actually, composing scenes (above) is a
better pattern for that, since it's both explicit
_and_ the parent can have a known interface on its child.
Here, the **upper** scene only knows that the
**lower** scene _is_ a scene.

That's the tradeoff. Overlay scenes are good for things
like pause screens or gamepad overlays. Anything where
the upper doesn't care _what_ the lower is, and where
the upper scene should be easily addable/removable.

Using `like.getScene(-2)`, the overlay scene can see
the lower scene and choose how to propagate events.

The only technical difference between overlay and
opaque is whether or not the scene we've pushed
on top of stays loaded.
