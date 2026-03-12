# Philosophy

## Clone-and-Modify

Like2D is not a library you install. It's a starting point you fork.

**Why:**
- Game frameworks need customization
- No abstraction overhead for your specific needs
- Full control over the codebase
- Easy to add/remove features

**Implications:**
- Code lives in your repo, not node_modules
- Modify the framework to fit your game
- No versioning concerns - your fork is your version

## Web-Native

Built for the web platform, not ported to it.

**Embraces:**
- HTML5 Canvas for 2D rendering
- Web Audio API for sound
- TypeScript for type safety
- Modern ES modules
- Browser gamepad API with SDL mappings

**Avoids:**
- Abstractions that hide web platform
- Custom rendering engines (use the browser's)
- Plugin architectures (modify the source instead)

## Lightweight

Target: Under 10,000 lines of code.

**Why:**
- Understandable in a single sitting
- Easy to modify
- No bloat for simple games
- Features are integrated, not bolted-on

**Trade-offs:**
- Not as feature-rich as large engines
- Some advanced features deferred
- Assumes 2D, not 3D

## Integrated Core

Features are tightly integrated with the runtime.

**Examples:**
- Input mapping knows about the game loop (triggers callbacks)
- Timer integrates with scene lifecycle
- Graphics context automatically follows scene resolution

**Not:**
- Plugin-based architecture
- Loosely coupled modules
- Framework-agnostic libraries

## Batteries Included

Common game needs are built-in:

- Scene management
- Asset loading
- Input mapping
- Gamepad support with SDL database
- Timer with delta time
- Basic primitives (rect, circle, line, polygon)
- Image loading and drawing
- Audio playback

**Not included** (deferred until game object model established):
- Camera system
- Tweening/animation
- Entity systems
- Particle systems
- Collision detection

These will be added with proper integration, not as standalone libraries.

## Development Workflow

Quality maintained throughout, not added at the end:

- Each feature includes test cases as it's built
- Demo code updated alongside implementation
- Documentation stays in sync
- No separate "testing and polish" phase

This prevents technical debt and ensures features actually work together.
