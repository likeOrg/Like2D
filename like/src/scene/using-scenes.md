# Getting started

Do this once to enable scenes:
```typescript
const like = createLike(document.body);
const sceneMan = new SceneManager(like);
```

This will overwrite `like.handleEvent` with `sceneMan.handleEvent`, but so far the game
behaves as if nothing changed.

The scene manager event handler serves mostly as a router to calling `handleEvent` on the
active scene. By default, this results in the active scene calling `this.draw` rather than
`like.draw`, {@link SceneInstance | true of all callbacks.}

This is when we need to call `sceneMan.set` or `sceneMan.push`. Until there is a scene
on the stack, the scene manager defaults to the callback pattern: `like.draw`, `like.update`, etc.

## Graph pattern

For arbitrary scene management (non stack based),
just use {@link SceneManager.set} which switches out the stack top.
This is called the "graph" pattern: any scene can transition to
any other.

## Stack pattern

Use {@link SceneManager.push} and {@link SceneManager.pop} to manage a scene stack.

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

Notice how the function of the stack is _not primarily_ to visually overlay scenes, but to manage logical game state. With `sceneMan.get(-2)`, a scene can see lower scenes and even pass
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

# Using a scene

Every scene should document correct usage.

# Scene lifecycle

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
