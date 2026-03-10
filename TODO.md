# Like2D Implementation TODO

## Phase 1: Project Setup
- [ ] Initialize project with pnpm and package.json
- [ ] Install Vite as dev dependency
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Set up Vite config for dev server and hot reload
- [ ] Create directory structure: src/, src/like/

## Phase 2: Core Infrastructure
- [ ] Create src/like/index.ts - singleton Like class
- [ ] Implement canvas creation and management
- [ ] Add game loop with requestAnimationFrame
- [ ] Implement callback registration system (draw, update, keypressed, etc.)
- [ ] Create fullscreen toggle functionality

## Phase 3: Graphics Module (High Priority)
- [ ] Implement love.graphics.clear()
- [ ] Implement love.graphics.rectangle() - draw/fill modes
- [ ] Implement love.graphics.circle() - draw/fill modes
- [ ] Implement love.graphics.line()
- [ ] Implement love.graphics.setColor()
- [ ] Implement love.graphics.print() - text rendering
- [ ] Implement love.graphics.newImage() and love.graphics.draw() for images
- [ ] Add coordinate transformation (push/pop/translate/rotate/scale)

## Phase 4: Audio Module (High Priority)
- [ ] Implement love.audio.newSource()
- [ ] Implement source:play(), stop(), pause()
- [ ] Implement volume control
- [ ] Support common formats (ogg, mp3, wav)

## Phase 5: Input Handling
- [ ] Implement keyboard event handling (keypressed, keyreleased)
- [ ] Implement mouse event handling (mousepressed, mousereleased)
- [ ] Add key state queries (love.keyboard.isDown)
- [ ] Add mouse state queries (love.mouse.getPosition)

## Phase 6: User Interface
- [ ] Create src/index.html with canvas element
- [ ] Add fullscreen button to HTML
- [ ] Style the page (center canvas, basic styling)
- [ ] Create src/main.ts as user entry point

## Phase 7: Additional Love2D API
- [ ] Implement love.load() callback
- [ ] Implement love.quit() callback
- [ ] Add love.timer.getDelta() / getFPS()
- [ ] Add window title management
- [ ] Add love.filesystem for asset loading

## Phase 8: Testing & Polish
- [ ] Create example game to test all features
- [ ] Verify hot reload works correctly
- [ ] Test fullscreen functionality across browsers
- [ ] Add error handling and user-friendly messages
