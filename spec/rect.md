# Rect Type

Type: `Rect = [number, number, number, number]` (x, y, width, height)

A tuple type for rectangles. Use `R` module for operations.

## R Operations

- `create(x, y, w, h)` - Create rect
- `fromPoints(a, b)` - Rect containing two points
- `fromCenter(center, size)` - Center and half-size
- `position(r)` - Get [x, y] as Vector2
- `size(r)` - Get [w, h] as Vector2
- `center(r)` - Center point as Vector2
- `topLeft(r)`, `topRight(r)`, `bottomLeft(r)`, `bottomRight(r)` - Corners
- `area(r)` - Width * height
- `isEmpty(r)` - Zero/negative area check
- `containsPoint(r, point)` - Point inclusion test
- `containsRect(r, other)` - Rect containment test
- `intersects(r, other)` - Overlap test
- `intersection(r, other)` - Overlapping region
- `union(r, other)` - Bounding rect of both
- `inflate(r, amount)` - Grow/shrink by amount
- `offset(r, delta)` - Move by Vector2
- `setPosition(r, pos)` - New rect at position
- `setSize(r, size)` - New rect with size