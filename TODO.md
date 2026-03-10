# Like2D Implementation TODO

## Phase 1: Core Refactor - Scene System

- [ ] Redesign Like class to support Scene-based architecture
- [ ] Implement Scene interface with width/height resolution setting
- [ ] Create `like.setScene(scene)` for scene switching
- [ ] Remove old callback-based system
- [ ] Update entry point to instantiate and run scenes
- [ ] Ensure canvas resizes when switching to scene with different resolution

## Phase 2: Asset Preloader

- [ ] Create `like.assets` module
- [ ] Implement `like.assets.preload([...])` returning Promise
- [ ] Support image preloading (`like.assets.image(path)`)
- [ ] Support audio preloading (`like.assets.audio(path)`)
- [ ] Support JSON preloading (`like.assets.json(path)`)
- [ ] Support text preloading (`like.assets.text(path)`)
- [ ] Block scene.load() until preload completes
- [ ] Cache loaded assets for reuse

## Phase 3: Input Mapping System

- [ ] Create `like.input` module
- [ ] Implement `like.input.map(action, inputs[])`
- [ ] Implement `like.input.isDown(action)` - checks if any mapped input is held
- [ ] Implement `like.input.justPressed(action)` - true on first frame of press
- [ ] Implement `like.input.justReleased(action)` - true on first frame of release
- [ ] Support keyboard keys in mapping
- [ ] Support mouse buttons in mapping
- [ ] Support gamepad buttons, axes, and D-pad in mapping
- [ ] Maintain low-level `like.keyboard`, `like.mouse`, and `like.gamepad` access

## Phase 4: Modernize Existing Modules

- [ ] Refactor Graphics module to use 0-1 color range consistently
- [ ] Update Audio module API for consistency
- [ ] Ensure Timer module works with Scene lifecycle
- [ ] Rename `localstorage.ts` to `storage.ts` with cleaner API
- [ ] Update all module imports/exports

## Future Considerations (Post-Game Object Model)

- Camera system
- Tweening/animation
- Entity systems
- Particle systems
- Collision detection
