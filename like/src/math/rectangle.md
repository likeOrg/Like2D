A four-coordinate type `[x, y, width, height]`.
Full reference {@link Rect}.

## Examples

### Construct a rectangle
```ts
const beastPen: Rectangle = [20, 25, 40, 50];
```

### Construct around a center point and size
```ts
const beastPen: Rectangle = Rect.setCenter( 
  [0, 0, ...penSize],
  beastPos
);
```
### Deconstruct a rect
```ts
[x, y, w, h] = beastPen;
```
### Deconstruct into points
```ts
const penPos = Rect.position(beastPen);
const penSize = Rect.size(beastPen);
```

### Check if beast is in his pen
```ts
const isInPen = Rect.containsPoint(
  beastPen,
  beast.pos,
)
```
### Put the beast back in his pen
```ts
beast.pos = Rect.clampPoint(beast.pos, beastPen)
```

