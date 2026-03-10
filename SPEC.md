This is a Typescript game framework for the browser called Like2D.

It is designed to be cloned and modified directly, not used as a library. It does not have any library dependencies except for the build system.

The love2D library, documented at https://love2d-community.github.io/love-api/, allows for easy game creation.

However, Love2D is highly inefficient on web with Emscripten, and there ought to be a "web native" equivalent.

Raw HTML 2D Canvas is arguably much less ergonomic than Love2D, especially for games.

So, this is a framework (runtime and template) which recreates the parts of Love2D which are simple or efficient enough for a 2D browser canvas.

It WILL NOT reinvent the wheel. The goal is less than 10,000 lines of code for the final product.

Thin wrappers around browser APIs are fine as long as a game developer wouldn't reasonably prefer the raw API over the wrapper.

src/index.html just has a canvas at a specified resolution, with a button to make it full screen. The developer can edit this file, of course.

Meanwhile, src/like/index.ts is the entrypoint for the library.

src/main.ts optionally contains callbacks loaded by like.ts, which are just like the love2d callbacks:
 - love.draw
 - love.update
 - love.keypressed
 - etc.

For now, src/main.ts also contains demos of every single feature.

The "Like" library should be able to be called from any file, rather than being an object passed around. 

The library can run using `pnpm run dev`, which will watch for changes in the source directory, then rebuild and hot reload.

We will use Vite as the build tool.

The highest priority parts of Love2D to implement are graphics and audio. There is no plan to add physics.
