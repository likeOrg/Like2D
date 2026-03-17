import type { Audio } from './audio';
import type { Timer } from './timer';
import type { Input } from './input';
import type { Keyboard } from './keyboard';
import type { Mouse } from './mouse';
import type { Gamepad } from './gamepad';
import type { Vector2 } from './vector2';
import type { CanvasMode, PartialCanvasMode } from './canvas-config';
import type { BoundGraphics } from './graphics';
import type { Scene } from '../scene';
/**
 * The Like interface provides access to all core systems and APIs
 * that are passed to game callbacks (load, update, draw, etc.).
 *
 * This is the main interface for interacting with the engine's subsystems.
 */
export interface Like {
    /** Audio system for managing and playing sounds */
    readonly audio: Audio;
    /** Timer system for tracking time, delta, and FPS */
    readonly timer: Timer;
    /** Input system for action-based input handling */
    readonly input: Input;
    /** Keyboard input handling */
    readonly keyboard: Keyboard;
    /** Mouse input handling */
    readonly mouse: Mouse;
    /** Gamepad input handling */
    readonly gamepad: Gamepad;
    /** Graphics context for rendering operations */
    readonly gfx: BoundGraphics;
    /**
     * Set the canvas display mode.
     * @param mode - Partial canvas mode configuration
     */
    setMode(mode: PartialCanvasMode): void;
    /**
     * Get the current canvas mode configuration.
     * @returns The current canvas mode or undefined if not available
     */
    getMode(): CanvasMode | undefined;
    /**
     * Get the current canvas size in pixels.
     * @returns The canvas size as a Vector2 [width, height]
     */
    getCanvasSize(): Vector2;
    /**
     * Set the active scene. Pass null to revert to global callbacks.
     */
    setScene(scene: Scene | null): void;
}
export type { Audio, Source, SourceOptions } from './audio';
export type { Timer } from './timer';
export type { Input, InputBinding, InputType } from './input';
export type { Keyboard } from './keyboard';
export type { Mouse, MousePositionTransform } from './mouse';
export type { Gamepad, StickPosition, ButtonCallback } from './gamepad';
export type { CanvasMode, PartialCanvasMode } from './canvas-config';
//# sourceMappingURL=like.d.ts.map