import type { Vector2 } from './vector2';

export type CanvasMode = 'fixed' | 'scaled' | 'native';

export type CanvasConfig =
  | { mode: 'fixed'; size: Vector2; pixelArt?: boolean }
  | { mode: 'scaled'; size: Vector2 }
  | { mode: 'native' };
