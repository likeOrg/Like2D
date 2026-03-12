If you are reading this, it's time to work on the next phase marked "TODO".

We will complete one phase at a time, in order.

1. We investigate whether a phase needs to be done, and if so its scope.
2. We update relevant files in spec/.
3. We create TODO.md items based on the difference between the spec and the relevant code.
4. Don't do the TODO items.

### DONE: Objects vs Args
Love2D was designed for Lua, so it uses arguments for everything, which can vary.
This is kind of antiquated. We should transition our API to:
1. Take in all required values as args
2. Take in all optional values as a props table

### DONE: Consideration: Color handling
Canvases take in CSS colors. Let's have a `Type Color = [number, number, number, number?]`.
When drawing functions encounter a string, they will use a CSS color. If they encounter an array like this, they can use an RGBA color like love2d.
Let's also consider whether a small Color library would be needed.

### DONE: Consideration: Geometric Data Types
Implemented Vector2 and Rect as tuple types with pure function libraries.

- Vector2: `[number, number]` with V2 namespace containing add, sub, mul, div, dot, cross, length, normalize, lerp, rotate, etc.
- Rect: `[number, number, number, number]` with R namespace containing create, fromPoints, fromCenter, position, size, center, contains, intersects, intersection, union, inflate, offset, etc.
- Constants exported for common vectors: zero, one, up, down, left, right
- Quad type in graphics is now an alias of Rect

### TODO: Consideration: reducing state, preferring objects over args.
It is rare that we benefit from setting color, then line width, then calling draw afterwards. 
Instead, let's require that a color be passed into any draw call which requires a color. Line width can be optional.
For example, line drawing take a color argument. However, if images could take an optional tint argument, put that in a props table.
Or, for the best ergonomics, maybe colors should be optional as an argument and override the currently set color.

Are there other parts of the codebase that suffer from too much statefulness? Would they be cleaner if state was handled by the user?

## Future Considerations (Post-Game Object Model)

- Camera system
- Tweening/animation
- Entity systems
- Particle systems
- Collision detection
