// Like2D - Multi-adapter game framework
// Use specific adapters for different patterns:
// - import { like, graphics } from 'like2d/callback'  (Love2D-style callbacks)
// - import { SceneRunner, Scene } from 'like2d/scene'  (Class-based scenes)

// Re-export types that are commonly needed
export type { Vector2 } from './core/vector2';
export { V2 } from './core/vector2';
export type { Rect } from './core/rect';
export { R } from './core/rect';
export type { Event } from './core/events';
export type { Color, Quad, ShapeProps, DrawProps, PrintProps } from './core/graphics';
export { ImageHandle } from './core/graphics';
export type { Source, SourceOptions } from './core/audio';
export type { Scene } from './adapters/scene/scene';
export { getButtonName } from './core/gamepad';

// Note: For actual usage, import from specific adapters:
// import { like, graphics } from 'like2d/callback';
// import { SceneRunner, Scene } from 'like2d/scene';