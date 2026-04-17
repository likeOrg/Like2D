# LÏKE2D

<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg version="1.1" viewBox="0 0 256 85" xmlns="http://www.w3.org/2000/svg">
 <rect x="8.4949" y="14.841" width="239.13" height="60.337" ry="14.369"/>
 <path d="m49.519 2.1933-22.841 22.854-0.01193 0.01193a16.159 16.168 0 0 0 0 22.866 16.159 16.168 0 0 0 20.539 1.9189 16.159 16.168 0 0 1 0.0048 0.39055 16.159 16.168 0 0 1-16.159 16.169h36.935a16.159 16.168 0 0 1-16.159-16.169 16.159 16.168 0 0 1 0.0054-0.39055 16.159 16.168 0 0 0 20.539-1.9193 16.159 16.168 0 0 0-4.76e-4 -22.866z" fill="#ba2b2b" stroke="#ffcf42" stroke-linejoin="round" stroke-width=".5"/>
 <g fill="none" stroke="#ffcf42" stroke-width=".5">
  <circle transform="matrix(-.7069 .70731 -.7069 -.70731 0 0)" cx="-17.311" cy="-68.903" r="16.164"/>
  <circle transform="matrix(-.7069 .70731 -.7069 -.70731 0 0)" cx="-1.147" cy="-52.739" r="16.164"/>
  <ellipse cx="67.986" cy="50.234" rx="16.159" ry="16.168"/>
  <ellipse cx="31.051" cy="50.234" rx="16.159" ry="16.168"/>
 </g>
 <g fill="#ffcf42" stroke="#000" stroke-width=".5">
  <path d="m89.924 21.979v36.375h28.103v-14.771h-12.029v-21.604z"/>
  <path d="m127.94 24.678v7.665h5.0453v11.046h-5.0453v14.966h24.748v-14.966h-5.048v-11.046h5.048v-7.665h-12.377z"/>
  <path d="m206.89 22.088v36.375h33.739v-13.179h-10.908v-5.0678h10.908v-7.109h-10.908v-5.069h10.908v-5.9504z"/>
  <path d="m162.76 19.77v38.693h12.281v-5.069h11.523v5.069h12.281s1.0482-15.115-2.2012-18.768c-3.4704-3.9018-6.3723-4.5209-6.3723-4.5209l8.8848-13.087h-13.615l-6.4108 13.022-4.3423 0.03698-8e-3 -15.377z"/>
  <ellipse cx="132.99" cy="16.122" rx="6.0221" ry="6.1182"/>
  <ellipse cx="147.49" cy="16.122" rx="6.0221" ry="6.1182"/>
 </g>
</svg>

Lightweight web game framework inspired by [LÖVE](https://love2d.org/).

<div style="color:red; text-align:center">—LÏKE 3.x is Beta software—</div>

## What it is

LIKE is a cozy way to make 2d games for browser.

## What LIKE does

- **🔥 Fire-and-forget Assets:** Graphics and audio that pretend to be synchronous.
- **🎯 DWIM graphics:** Turns repetitive draw calls into one while removing state bleed for properties like `lineCap`.
- **↔️ Two Canvas Modes:**
  - 🖊️ Audio-resize the canvas; sharp at any resolution.
  - 👾 For retro-style developers, pixels stay crisp but smooth via prescaling.
- **⭕ Easier Geometry:** `Vector2` and `Rect` are just number tuples (arrays), but a pure-functional library makes them easy to work with and plays nice with `map` and `reduce`.
- **🚲 Easy Input:** Keyboard, Mouse, and Gamepad all are given both event-based and query-based options. Choose what fits your architecture. Most gamepads get auto-mapped perfectly, are easy to remap, and LIKE can load and save user mappings automatically.
- **👟Consistent APIs:** Colors 0-1, not 0-255. Seconds, not milliseconds. Physical gamepad buttons, not "A" or "B".
- **👉 Actions System:** An input layer maps inputs to actions, which fire usable events.
- **🌎 Global control:** Choose how to handle LIKE events, and manage resources with centralized trackers. LIKE is a great foundation for your own engine.
- **🐦 Light and Elegant:** Zero dependencies and less than 5000 lines of code. Size less than 100KiB compressed.

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
npx degit likeOrg/Like2D/examples/starter my-game
```

## Usage Example

HTML that puts LIKE in fullscreen.
```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      html {
        margin: 0;
        height: 100%;
        overflow: hidden;
      }
      body {
        margin: 0;
        height: 100%;
        display: grid;
        place-items: center;
        background: black;
      }
    </style>
  </head>
  <body>
    <script type="module" src="./src/main.ts"></script>
  </body>
</html>
```

TypeScript:
```typescript
import { createLike } from "like2d";

const like = createLike(document.body);

like.load = () => {
  like.canvas.setMode([800, 600]);
  like.input.setAction("jump", ["Space", "BBottom"]);
};

like.update = (dt) => {
  if (like.input.justPressed("jump")) {
    console.log("Jump!");
  }
};

like.draw = () => {
  like.gfx.clear([0.1, 0.1, 0.1, 1]);
  like.gfx.circle("fill", "dodgerblue", [400, 300], 50);
  like.gfx.print("white", "Hello Like2D!", [20, 20]);
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

## Links

[NPM](https://www.npmjs.com/package/@like2d/like)

[JSR](https://jsr.io/@like2d/like)

[GitHub](https://github.com/likeOrg/Like2D)

[Full Documentation](https://likeorg.github.io/Like2D/api/documents/README.html) 

## License

MIT
