# Vector2 Type

Type: `Vector2 = [number, number]`

A tuple type for (x, y) coordinates. Use `V2` module for operations.

## V2 Operations

- `add(a, b)` - Add vectors
- `sub(a, b)` - Subtract vectors  
- `mul(v, s)` - Multiply by scalar
- `div(v, s)` - Divide by scalar
- `dot(a, b)` - Dot product
- `cross(a, b)` - Cross product
- `length(v)` - Magnitude
- `lengthSq(v)` - Squared magnitude (faster)
- `normalize(v)` - Unit vector
- `distance(a, b)` - Distance between points
- `lerp(a, b, t)` - Linear interpolation
- `angle(v)` - Angle in radians
- `rotate(v, angle)` - Rotate by angle
- `perpendicular(v)` - 90° CCW rotation
- `negate(v)` - Negate both components
- `floor(v)`, `ceil(v)`, `round(v)` - Component-wise
- `min(a, b)`, `max(a, b)` - Component-wise
- `clamp(v, min, max)` - Clamp components
- `fromAngle(angle, length?)` - Create from angle

Constants: `zero`, `one`, `up`, `down`, `left`, `right`