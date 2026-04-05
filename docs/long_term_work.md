# V3 Research Plan

## Guiding Principle

Like2D is not a Love2D port. We share the same design space but solve problems our own way. We don't add features because Love2D has them — we add features because they solve real problems well, in our style.

## Graphics

Unwrapped Canvas2D features to decide on:

- **Curves** — `bezierCurveTo`, `quadraticCurveTo`, `arcTo`, `roundRect`. Useful but niche. Lean toward ctx access.
- **Freeform paths** — `Path2D`, `beginPath`/`moveTo`/etc. Our `line` and `polygon` cover most cases. Reusable `Path2D` objects could be worth wrapping.
- **Text metrics** — `measureText()` / `TextMetrics`. Needed for layout. Should be exposed.
- **Gradients & patterns** — `createLinearGradient`, `createRadialGradient`, `createPattern`. Powerful but complex. Need proper abstraction.
- **Shadows** — four canvas properties. Worth exposing as shape props.
- **Blend modes** — `globalCompositeOperation`. High value for lighting and masking.
- **Alpha** — `globalAlpha`. Simple to add. Should be a prop or method.
- **Pixel data** — `getImageData` / `putImageData`. Useful for screenshots and procedural effects.
- **Filters** — CSS canvas filters. Modern and powerful, but low priority.

Already handled by `gfx.context` access or intentionally omitted:
- `clip` — removed in V2, stateful and needs proper abstraction before returning.
- Raw transform methods — users can call `gfx.context` directly for `setTransform` etc.

## Audio

Quick wins:
- **`setLooping(bool)`** — currently requires `source.audio.loop = true` directly.
- **`setPlaybackRate(rate)`** — trivial, common for pitch variety.

Bigger questions:
- **Web Audio API** — migrate from HTMLAudioElement? Enables precise timing, spatial audio, real-time effects, and zero-latency playback. High complexity, high value.
- **Procedural audio** — no way to generate audio currently. Is this a gap worth filling?

## Features Worth Adding

| Feature | Notes |
|---|---|
| Touch input | First-class, not just mouse fallback. High priority for mobile. |
| Sprite animation | Sprite sheets + quads (anim8-style). Very common need. |
| Camera / viewport | Scrolling, zoom. Flagged since V2. |
| Text measurement | Expose `measureText` / `TextMetrics`. |
| Blend modes | `globalCompositeOperation`. High value. |
| Math utilities | Noise, lerp, clamp, bezier beyond Vec2/Rect. |
| Pixel data | Screenshots, procedural generation. |
| Multiplayer/player slots | Map controllers to logical player slots; handle disconnect/reconnect. |

## Intentionally Out of Scope

| Feature | Why |
|---|---|
| Built-in physics | Too heavy for core. Recommend a library. |
| Stateful `setColor` | We pass color per-call. Stateful color causes bugs. |
| Collision detection | Recommend bump.lua or similar. |
| Tiled map support | Moving target. Guide instead of core. |
| File I/O | Web has Fetch. |
| Threading | Web Workers are complex and rarely needed. |
| Window title/icon | Browser controls this. |
