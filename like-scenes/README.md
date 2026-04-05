# @like2d/like-scenes

Scene management system for [LÏKE](https://jsr.io/@like2d/like).

Scenes are a modular component of LÏKE based on setting `like.handleEvent`.
The scene system is simple and powerful, once understood.

It's a bit like running LÏKE inside of LÏKE.

For devs using the built-in callback pattern, scenes
can stack functionality on to the current project such as
gamepad mapping or debug overlays.

For multi-scene games, they codify a common state-management pattern based
on switching between (or nesting) event handler callbacks. It's
a lot better than switch-casing on each handler, or manually setting/clearing
handler functions on each transition.

Using scenes for your game also replaces the need to pass around global `like`
or `sceneManager` wherever it is used.

# Getting started

Install like-scenes:

``` bash
npm install @like2d/scenes
# or
deno add jsr:@like2d/scenes
```

Do this once to enable scenes:
```typescript
import { createLike } from "like";
import { SceneManager } from "like-scenes";

const like = createLike(document.body);
const sceneMan = new SceneManager(like);
```

This will overwrite `like.handleEvent` with `sceneMan.handleEvent`, but so far the game behaves as if nothing changed.

This handler serves as a router to calling
`handleEvent` on the active scene as opposed to `like`.

This is when we can push our scene:
``` typescript
const myScene: Scene = (like, sceneMan) => {
    const frogImage = like.gfx.newImage("tinyfrog.svg");
    const scene = {}

    scene.draw = function () {
        like.gfx.draw(frogImage, [0, 0]);
        like.gfx.print("fill", "YOU JUST GOT FROGGED (Q to quit)", [20,20]);
    }
    
    scene.keypressed = function (code) {
        if (code == "KeyQ") {
            sceneManager.pop();
        }
    }
    
    return scene;
}

sceneMan.push(myScene, true);
```

Notice how scenes have the same structure as the base `like` event
handler callbacks.

# Included scenes

The `prefab/` dir contains built-in utility scenes.

`startScreen` Lets you create a simple click-to-start screen, which can
be useful for defeating autoplay and getting user focus. It's polite.

`mapGamepad` Is an _essential_ companion to gamepad auto-mapping, which
allows you to bind ambiguous inputs.

`fadeTransition` Is an example of how to transition between scenes.
It can be used directly, but copy-and-modify is a good idea, too.

# Scene Management

## Graph pattern

For arbitrary scene management (non stack based), use `sceneMan.set()` which switches out the stack top.
This is called the "graph" pattern: any scene can transition to
any other.

`set` also allows you to pass an instance as the second argument, so that preloading becomes possible.

## Stack pattern

Use `sceneMan.push` and `sceneMan.pop` to manage a scene stack.

It may be logical to lay a game state out with a stack, such as:
```
title => overworld => battle => battleMenu
```
For example, we can `pop` from a battle to get back to `overworld` (the battle ended),
then we can `push` a menu from the overworld to enter a new state:
```
title => overworld => overworldMenu
```
Or, let's say we have a battle test feature on the title screen.
```
title => battle
```
The battle doesn't have to _know_ that it was called from the title in order to return
to it. It can simply `pop` and return to the previous state.

Notice how the function of the stack is _not primarily_ to visually overlay scenes, but to manage logical game state.

Though with `sceneMan.get(-2)`, a scene can see lower scenes and even pass
events to them by setting their own `handleEvent` callback.

If using stack, it is wise to push the title screen scene in the root `like.load`
function so that we can clear the stack and return to it:
```typescript
while (sceneMan.pop())
```
Otherwise, an empty scene stack without callbacks will result in a broken game.

## Stopping the Scene manager

To get rid of scene functionality entirely, simply set it back to default.
It is good practice to pop the whole scene stack in order to deinit them all, first.
```typescript
while (sceneMan.pop());
like.handleEvent = undefined;
```

## Preserving handleEvent

The SceneManager overwrites {@link index.LikeHandlers.handleEvent | like.handleEvent} to
its own {@link SceneManager.handleEvent}.

The code
```typescript
const sceneMan = new SceneManager(like);
```
is equivalent to:
```typescript
const sceneMan = new SceneManager(like, {nobind: true});
like.handleEvent = sceneMan.handleEvent.bind(sceneMan);
```

So if you want to layer top-level functionality onto the scene system, use `nobind: true`
and connect things as intended.

## Save/Load the entire stack

Use one SceneManager per stack and simply switch handleEvent from one
to the other.

## Understanding Scene lifecycle

A Scene consists of a function that creates a scene instance:
```typescript
type Scene = (like: Like, scenes: SceneManager) => SceneInstance
```

When we call `sceneMan.push` or `sceneMan.set`, the scene is put on the stack _without an instance_, then instantiated. The scene fuction is called, and then `load` is fired.

Now, a few things can happen:

If a scene calls `sceneMan.pop` or `sceneMan.set`, it will have `quit` called and subsequently be removed from the stack. If there is no other reference, the scene will be Garbage Collected eventually.

If a scene calles `sceneMan.push(newScene, true)`, it will have `quit` called and
be unloaded, but reinstantiated when the upper scene is popped. This is good for
resource-heavy scenes that can be safely re-instantiated without losing game state.
If you need the upper and lower scenes to communicate, consider {@link Scene | using composition}
instead. Otherwise, consider storing save data in `localStorage`.

If a scene calls `sceneMan.push(newScene, false)`, it will neither have `quit` called
nor be unloaded. However, `load` will be called when the scene is once again at stack top
(due to the upper scene calling `pop`).
This is good for overlay scenes, or resource-light scenes made to be resumable.
In the most intense cases (state-heavy AND resource-heavy scenes), an effort will
have to be made: Unload heavy resources before calling `pop`, and reload them
in `load`.

# Creating your own scenes

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

## License

MIT
