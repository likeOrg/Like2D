// Like2D - Multi-adapter game framework
// Use specific adapters for different patterns:
// - import { createLike, graphics } from 'like2d/callback'  (Love2D-style callbacks)
// - import { SceneRunner, Scene } from 'like2d/scene'  (Class-based scenes)

/**
 * Main API interface containing all core systems.
 * Passed as first argument to all callbacks.
 */
export type { Like } from './core/like';

/**
 * 2D vector as a tuple: [x, y]
 */
export type { Vector2 } from './core/vector2';

/**
 * 2D vector math and utility functions
 */
export { Vec2 } from './core/vector2';

/**
 * Rectangle math and utility functions.
 * Rects are represented as [x, y, width, height] tuples.
 */
export { Rect } from './core/rect';

/**
 * Common event structure for all engine events.
 */
export type { Like2DEvent, EventType, EventMap } from './core/events';
export type { CanvasMode, PartialCanvasMode } from './core/canvas-config';

/**
 * Graphics types for drawing operations.
 */
export type { Color, Quad, ShapeProps, DrawProps, PrintProps } from './core/graphics';

/**
 * Handle to an image asset that may be loading in the background.
 */
export { ImageHandle } from './core/graphics';

/**
 * Audio source types for sound playback.
 */
export type { Source, SourceOptions } from './core/audio';

/**
 * Core Scene interface for class-based game architecture.
 */
export type { Scene } from './adapters/scene/scene';

/**
 * Gamepad utility functions and types.
 */
export { getGPName, GP } from './core/gamepad';
export type { StickPosition } from './core/gamepad';

// Note: For actual usage, import from specific adapters:
// import { createLike, graphics } from 'like2d/callback';
// import { SceneRunner, Scene } from 'like2d/scene';