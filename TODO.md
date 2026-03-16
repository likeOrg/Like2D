# Like2D TODO

## Bugs 🐛

### Pixel Art Canvas Stretching
The pixel art canvas is getting stretched. The target canvas should maintain the same aspect ratio as the input canvas to prevent distortion.

### Mouse Position in Fixed Modes
The mouse position is incorrect in all fixed modes (both regular and pixel art). The reported coordinates don't properly map to the scaled/letterboxed game canvas.

## Canvas Size System ✅

Implementation complete. Canvas sizing system with three modes:
- **fixed**: Fixed internal resolution, CSS-scaled to fit container
- **scaled**: Canvas matches container, content scaled via ctx.transform
- **native**: Full control, programmer handles everything

All modes preserve aspect ratio with letterboxing (no stretch/crop).

## Publishing Preparation
- [ ] Add JSR configuration (`jsr.json`)
- [ ] Set up GitHub Actions for publishing
- [ ] Configure GitHub Pages deployment for website
- [ ] Add LICENSE file to packages/like2d

## Future Ideas

### Multiplayer System Design
The current action system is designed for single-player use. We need a multiplayer input system that:
- Separates controller management from action mapping (already started by removing GP0/GP1 prefixes)
- Supports player assignment: local players bind to specific gamepads
- Handles controller disconnect/reconnect with graceful player reassignment
- Provides clean API for networked multiplayer (input prediction, reconciliation)
- Consider: Should we have a `PlayerManager` that maps physical controllers to logical player slots?

### Custom Startup Screen
The startup screen currently displays simple text. Future versions should support:
- Custom background images for the startup screen
- Custom styling/fonts
- Animation/transitions
