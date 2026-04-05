A pair of numbers `[x, y]`
representing for example:
 - position in 2D space
 - width and height
 - velocity

See {@link Vec2} for full library.

Note that mutating Vector2 is allowed, but discouraged
except for memory-demanding situations.
1. Setting `position[0]` has clunky syntax compared to the library
2. Any references to `position` will change their value.

## Examples

#### Constructing a Vector2
```ts
const onionSize: Vector2 = [width, height];
```

#### Deconstructing a Vector2
```ts
const [width, height] = onionSize;
```

#### Making math less repetitive.
```ts
x += dx * speed;
y += dy * speed;
// becomes...
pos = Vec2.add(pos, Vec2.mul(delta, speed))
```

#### Summing an array of Vector2
```ts
const vecs: Vector2[] = [[50, 100], [-5, -5], [0, 99]];
const sum = vecs.reduce(Vec2.add);
```

#### Using LIKE graphics API
```ts
// Draw a circle in the center of the canvas.
const pos = Vec2.div(
  like.canvas.getSize(),
  2,
)
like.graphics.circle('fill', 'blue', pos, 20); 
```

#### Getting the bounding box of an array of `Vector2`s
```ts
const upperLeft = myVector2List.reduce(Vec2.min);
const lowerRight = myVector2List.reduce(Vec2.max);
const boundingBox = Rect.fromPoints(upperLeft, lowerRight);
```

#### Squaring each element of a Vector2
```ts
const squareVec2 = Vec2.map(a: number => a**2);
squareVec2([6, 7]) // returns [36, 49]
// one in one line...
Vec2.map(a: number => a**2)([6, 7]);
```

