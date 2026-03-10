# Like2D Implementation TODO

## Phase 1: Project Setup
- [x] Initialize project with pnpm and package.json
- [x] Install Vite as dev dependency
- [x] Configure TypeScript (tsconfig.json)
- [x] Set up Vite config for dev server and hot reload
- [x] Create directory structure: src/, src/like/

## Phase 2: Core Infrastructure
- [x] Create src/like/index.ts - singleton Like class
- [x] Implement canvas creation and management
- [x] Add game loop with requestAnimationFrame
- [x] Implement callback registration system (draw, update, keypressed, etc.)
- [x] Create fullscreen toggle functionality

## Phase 3: Graphics Module (High Priority)
- [x] Implement love.graphics.clear()
- [x] Implement love.graphics.rectangle() - draw/fill modes
- [x] Implement love.graphics.circle() - draw/fill modes
- [x] Implement love.graphics.line()
- [x] Implement love.graphics.setColor()
- [x] Implement love.graphics.print() - text rendering
- [x] Implement love.graphics.newImage() and love.graphics.draw() for images
- [x] Add coordinate transformation (push/pop/translate/rotate/scale)

## Phase 4: Audio Module (High Priority)
- [x] Implement love.audio.newSource()
- [x] Implement source:play(), stop(), pause()
- [x] Implement volume control
- [x] Support common formats (ogg, mp3, wav)

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
