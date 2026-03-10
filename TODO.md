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
- [x] Implement keyboard event handling (keypressed, keyreleased)
- [x] Implement mouse event handling (mousepressed, mousereleased)
- [x] Add key state queries (love.keyboard.isDown)
- [x] Add mouse state queries (love.mouse.getPosition)

## Phase 6: User Interface
- [x] Create src/index.html with canvas element
- [x] Add fullscreen button to HTML
- [x] Style the page (center canvas, basic styling)
- [x] Create src/main.ts as user entry point

## Phase 7: Additional Love2D API
- [x] Implement love.load() callback
- [x] ~~Implement love.quit() callback~~ (skipped - not applicable to web)
- [x] Add love.timer.getDelta() / getFPS()
- [x] Add window title management (document.title)
- [x] Add love.filesystem for save/load game state (localStorage/IndexedDB)

## Phase 8: Testing & Polish
- [x] Create example game to test all features (src/main.ts demo)
- [x] Verify hot reload works correctly (Vite dev server)
- [x] Test fullscreen functionality across browsers
- [x] Add error handling and user-friendly messages

## Phase 9: Touch Module (love.touch)
- [ ] Implement touch event handling via Touch Events API
- [ ] Implement love.touch.getTouches() - get active touch IDs
- [ ] Implement love.touch.getPosition(id) - get touch position by ID
- [ ] Add love.touchpressed callback to LikeCallbacks
- [ ] Add love.touchreleased callback to LikeCallbacks
- [ ] Add love.touchmoved callback to LikeCallbacks
- [ ] Support multi-touch tracking (simultaneous touches)
- [ ] Create src/like/touch.ts module

## Phase 10: Joystick/Gamepad Module (love.joystick)
- [ ] Implement gamepad detection via Gamepad API
- [ ] Implement love.joystickadded callback
- [ ] Implement love.joystickremoved callback
- [ ] Implement love.joystickpressed callback
- [ ] Implement love.joystickreleased callback
- [ ] Implement love.joystickaxis callback
- [ ] Implement love.joystickhat callback
- [ ] Implement Joystick class with isDown(), getAxis(), getHat() methods
- [ ] Implement love.joystick.getJoysticks()
- [ ] Create src/like/joystick.ts module

## Phase 11: Sound Module (love.sound - Web Audio API)
- [ ] Implement SoundData class for raw audio data
- [ ] Implement love.sound.newSoundData() constructor
- [ ] Implement Decoder for audio format decoding
- [ ] Implement getDuration(), getSampleRate(), getBitDepth() on SoundData
- [ ] Implement getSample() / setSample() for raw audio manipulation
- [ ] Create src/like/sound.ts module

## Phase 12: Math Module - Random (love.math)
- [ ] Implement love.math.random() with optional min/max args
- [ ] Implement love.math.randomSeed() for seeding RNG
- [ ] Implement RandomGenerator class for stateful random generation
- [ ] Ensure random matches LOVE API exactly
- [ ] Create src/like/math.ts module

## Phase 13: Image Data Module (love.image)
- [ ] Implement ImageData class for pixel manipulation
- [ ] Implement love.image.newImageData(width, height) - create blank
- [ ] Implement love.image.newImageData(filename) - load from file
- [ ] Implement getWidth() / getHeight() on ImageData
- [ ] Implement getPixel() / setPixel() for individual pixel access
- [ ] Implement mapPixel() for batch pixel operations
- [ ] Implement encode() to save ImageData to file
- [ ] Create src/like/image.ts module
