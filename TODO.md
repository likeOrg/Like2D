# Geometric Data Types Implementation

## Overview
Implement Vector2 and Rect tuple types with pure function libraries.

## TODO

### 1. Create Vector2 type and V2 module
**File:** `src/like/vector2.ts`
**Spec:** `spec/vector2.md`

- [x] Export `Vector2` type alias: `type Vector2 = [number, number]`
- [x] Export `V2` namespace with operations:
  - [x] `add(a, b)`, `sub(a, b)`, `mul(v, s)`, `div(v, s)`
  - [x] `dot(a, b)`, `cross(a, b)`
  - [x] `length(v)`, `lengthSq(v)`, `normalize(v)`
  - [x] `distance(a, b)`, `lerp(a, b, t)`
  - [x] `angle(v)`, `rotate(v, angle)`, `perpendicular(v)`
  - [x] `negate(v)`, `floor(v)`, `ceil(v)`, `round(v)`
  - [x] `min(a, b)`, `max(a, b)`, `clamp(v, min, max)`
  - [x] `fromAngle(angle, length?)`
- [x] Export constants: `zero`, `one`, `up`, `down`, `left`, `right`

### 2. Create Rect type and R module
**File:** `src/like/rect.ts`
**Spec:** `spec/rect.md`

- [x] Export `Rect` type alias: `type Rect = [number, number, number, number]`
- [x] Export `R` namespace with operations:
  - [x] `create(x, y, w, h)`, `fromPoints(a, b)`, `fromCenter(center, size)`
  - [x] `position(r)`, `size(r)`, `center(r)`
  - [x] `topLeft(r)`, `topRight(r)`, `bottomLeft(r)`, `bottomRight(r)`
  - [x] `area(r)`, `isEmpty(r)`
  - [x] `containsPoint(r, point)`, `containsRect(r, other)`, `intersects(r, other)`
  - [x] `intersection(r, other)`, `union(r, other)`
  - [x] `inflate(r, amount)`, `offset(r, delta)`
  - [x] `setPosition(r, pos)`, `setSize(r, size)`, `setCenter(r, center)`

### 3. Update Graphics module
**File:** `src/like/graphics.ts`
**Spec:** `spec/graphics.md`

- [x] Import and re-export `Vector2` and `Rect` types
- [x] Update `Quad` type to be alias of `Rect`
- [x] No API changes needed - internal only

### 4. Update Mouse module  
**File:** `src/like/mouse.ts`
**Spec:** (none - internal change)

- [x] Import `Vector2` type
- [x] Change `getPosition()` return type from `{ x, y }` to `Vector2`

### 5. Export from index
**File:** `src/like/index.ts`

- [x] Export `Vector2` and `V2` from vector2 module
- [x] Export `Rect` and `R` from rect module

### 6. Update PHASES.md
**File:** `PHASES.md`

- [x] Move "Consideration: Geometric Data Types" to DONE section