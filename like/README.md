# LÏKE2D

<svg version="1.1" viewBox="0 0 300 105" xmlns="http://www.w3.org/2000/svg">
 <rect x="10" y="11.23" width="280" height="83.544" fill="#e48080" stroke="#000" stroke-linejoin="round" stroke-width="2"/>
 <g fill="none" stroke="#000" stroke-linejoin="round">
  <rect x="97.484" y="11.23" width="52.516" height="46.237"/>
  <rect x="150" y="11.23" width="35.011" height="46.237"/>
  <rect x="185.01" y="11.23" width="52.516" height="46.237"/>
  <rect x="237.53" y="11.23" width="52.516" height="46.237"/>
 </g>
 <g>
  <rect x="132.49" y="11.23" width="17.505" height="27.461"/>
  <rect x="150" y="29.302" width="8.7527" height="18.776"/>
  <rect x="176.26" y="29.302" width="8.7527" height="18.776"/>
 </g>
 <rect x="150" y="11.23" width="17.505" height="8.6845" fill="none" stroke="#000" stroke-linejoin="round"/>
 <rect x="167.51" y="11.23" width="17.505" height="8.6845" fill="none" stroke="#000" stroke-linejoin="round"/>
 <g>
  <path d="m237.53 38.691-17.505-9.3882 17.505-18.073z"/>
  <rect x="202.88" y="48.079" width="16.772" height="9.3882"/>
  <rect x="272.54" y="20.266" width="16.772" height="9.3882"/>
  <rect x="272.54" y="38.691" width="16.772" height="9.3882"/>
  <path d="m202.52 29.302 0.36685-18.073h17.139z"/>
 </g>
 <path d="m64.078 1.0042-33.375 33.375-0.01743 0.0174a23.612 23.612 0 0 0 0 33.392 23.612 23.612 0 0 0 30.012 2.8022 23.612 23.612 0 0 1 7e-3 0.57034 23.612 23.612 0 0 1-23.612 23.612h53.97a23.612 23.612 0 0 1-23.611-23.612 23.612 23.612 0 0 1 7e-3 -0.57034 23.612 23.612 0 0 0 30.012-2.8029 23.612 23.612 0 0 0-6.88e-4 -33.392z" fill="#80c3e4" stroke="#000" stroke-linejoin="round"/>
 <g fill="none" stroke="#000" stroke-width=".5">
  <circle transform="rotate(135)" cx="-20.988" cy="-93.243" r="23.612"/>
  <circle transform="rotate(135)" cx="2.6238" cy="-69.632" r="23.612"/>
  <circle cx="91.062" cy="71.161" r="23.612"/>
  <circle cx="37.093" cy="71.161" r="23.612"/>
 </g>
</svg>

Lightweight Web framework inspired by [LÖVE](https://love2d.org/).

## <div style="color:red">During v2.x.x, LIKE's API will change.</div>
## What it is

LIKE is a cozy way to make 2d games for browser.

## What LIKE does

- **🔥 Fire-and-forget Assets:** Graphics and audio that pretend to be synchronous.
- **🎯 DWIM graphics:** Turns repetitive draw calls into one while removing state bleed for properties like `lineCap`.
- **↔️ Two Canvas Modes:**
   - 🖊️ Audio-resize the canvas; sharp at any resolution.
   - 👾 For retro-style developers, pixels stay crisp but smooth via prescaling.
- **⭕ Easier Geometry:** `Vector2` and `Rect` are just number tuples (arrays), but a pure-functional library makes them easy to work with and plays nice with `map` and `reduce`. 
- **🚲 Easy Input:** Keyboard, Mouse, and Gamepad all are given both event-based and tracking-based options. Choose what fits your architecture.
- **👟 Consistent APIs:** Colors 0-1, not 0-255. Seconds, not milliseconds.
- **👉 Actions System:** An input layer maps inputs to actions, which fire usable events.
- **🌎 Global control:** Choose how to handle LIKE events, and manage resources with centralized trackers. LIKE is a great foundation for your own engine.
- **🐦 Light and Elegant:** Zero dependencies and less than 5000 lines of code -- focused entirely on what matters.

## Installation

Most package managers will work.
```bash
npm install like2d
# or ...
deno add jsr:@like2d/like
# or...
```

## Quick Start

To try Like2D quickly, use this starter with
hot reloading and a basic webpage.
```bash
npx degit 44100hertz/Like2D/examples/starter my-game
```

## Usage Example

```typescript
import { createLike } from 'like2d';

const like = createLike(document.body);

like.load = () => {
  like.setMode([800, 600]);
  like.input.setAction('jump', ['Space', 'ButtonBottom']);
};

like.update = (dt) => {
  if (like.input.justPressed('jump')) {
    console.log('Jump!');
  }
};

like.draw = () => {
  like.gfx.clear([0.1, 0.1, 0.1, 1]);
  like.gfx.circle('fill', 'dodgerblue', [400, 300], 50);
  like.gfx.print('white', 'Hello Like2D!', [20, 20]);
};

await like.start();
```

## For Love2D Developers

LIKE's API is not the same as LOVE, but similar in spirit. Notable differences:
 - Draw your graphics in one call, that's all. No setup or state bleed.
 - You manage your own instance of like in a big friendly object. This allows us to have multiple games on one page.
 - We use Vector2 and Rect tuples (like `[x, y]`) instead of loose coordinates.
 - Theres an actions system -- `input.setAction` / `actionpressed` and `actionreleased` callbacks.
 - Some things are missing either due to browser limitations or smaller scope.

## Feedback welcome

[LIKE is on GitHub.](https://github.com/44100hertz/Like2D)

[Check out the docs for our long-term vision.](https://github.com/44100hertz/Like2D/tree/master/docs)

[Feature requests welcome. PRs discouraged for now.](https://github.com/44100hertz/Like2D/issues/)

## License

MIT
