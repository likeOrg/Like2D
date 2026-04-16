# Middleware

Events in LÏKE all flow into the engine, which checks for
`like.handleEvent`. If handleEvent is undefined, it calls `like.callOwnHandlers` to activate `like.draw`, `like.update`, etc.

Events consist of:
```
{ 
  type: LikeEvent, // (string) 'update', 'draw', etc.
  args: any[],     // actually is strongly typed but, you get it...
}
```

And thus `callOwnHandlers` is roughly:
```typescript
function callOwnHandlers(obj, ev) {
  if (ev.type in obj) obj[ev.type](...ev.args);
}
```

Because of this unified point of contact, it is easy enough to
add top-level functionality to your game, for example:

## Replace update with fixed update

```typescript
// options
const frameTime = 1 / 60
const maxLagFrames = 1

let currentFrameTime = 0

like.handleEvent = function (event) {
    if (event.type == 'update') {
        const [dt] = event.args;
        currentFrameTime += dt;
        let lagFrames = 0;
        while (currentFrameTime > frameTime) {
            // always subtract instead of setting to zero;
            // this keeps frame rates even.
            currentFrameTime -= frameTime;
            // construct your own event
            callOwnHandlers(like, {
                type: 'update',
                args: [framestep],
            })
            // keep things from getting out of control
            if (lagFrames > maxLagFrames) {
                currentFrameTime /= 2;
                break;
            }
            ++lagFrames;
        }
    } else {
        callOwnHandlers(like, ev);
    }
}
```

## When to use scenes

Sometimes, you want a modular middleware;
easily be added or removed.

Plus, you want your game's overall state tied to this middleware.

This is where the [scene system](../../like-scene/README.md)
becomes relevant.

