import { Vec2, type Vector2 } from '../math/vector2';
import { type Dispatcher, type LikeMouseEvent } from '../events';
import { EngineProps } from '../engine';

export type MouseButton = 'left' | 'middle' | 'right';

const mouseButtons = ["left", "middle", "right"] as const;
const numToButton = (i: number): MouseButton => mouseButtons[i];
import type { LikeCanvasElement, LikeCanvasEventMap } from '../events';

type MouseMoveEvent = LikeCanvasEventMap['like:mousemoved'];

export type MouseMode =
  | { lock: false, visible: boolean, scrollBlock: boolean }
  | { lock: true, speed: number };

export type MouseSetMode = Partial<MouseMode> & { lock: boolean };

/**
 * LIKE's mouse wrapper.
 *  
 * Mouse coordinates are scaled for convenience. For example call:
 * ```
 * like.canvas.setMode([240, 160])
 * ```
 * and your game will now be 240x160 pixels.
 * 
 * Your mouse coords will stay within the rectangle `[0, 0]` and `[240, 160]`.
 * 
 * If you intend to allow scrolling on your page while the mouse is above the game, use:
 * ```
 * like.mouse.setMode({ lock: false, scrollBlock: false })
 * ```
 * 
 * ### Capture
 * 
 * Some games benefit from capture aka pointer lock. Call
 * ```ts
 * like.mouse.setMode({ lock: true, speed: 1 })
 * ```
 * to use capture, and now the mouse is locked to the game.
 * 
 * When you enter capture, the mouse `pos` becomes virtual, bounded to canvas edges, plus controlled via the speed setting and teleport-able via {@link setCapturedPos}.
 * 
 * When you exit capture, the mouse will be in the same spot the capture was started in.
 * 
 * Note that your mode settings from non-capture mode are preserved in capture mode and vice-versa.
 * 
 */
export class Mouse {
  private dispatch: Dispatcher<LikeMouseEvent>;
  private pos: Vector2 = [0, 0];
  private lastPos: Vector2 = [0, 0];
  private buttons = new Set<MouseButton>();
  /** The canvas reference is the DOM / display canvas, this keeps
   * track of the internal (apparent) canvas size.
   */
  private canvasSize: Vector2 = [800, 600];
  private canvas: LikeCanvasElement;

  // We keep track of a locked mode and an unlocked mode, so that when capture changes
  // we can use the settings from last time.
  private lockedMode: MouseMode & {lock: true} = { lock: true, speed: 1 };
  private unlockedMode: MouseMode & {lock: false} = { lock: false, visible: true, scrollBlock: true };
  private enableLock = false;

  constructor(props: EngineProps<LikeMouseEvent>) {
    this.canvas = props.canvas;
    this.dispatch = props.dispatch;
    const { abort } = props;

    this.canvas.addEventListener(
      "like:mousemoved",
      this.handleMouseMove.bind(this) as any,
      { signal: abort },
    );
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this), {
      signal: abort,
    });
    window.addEventListener("mouseup", this.handleMouseUp.bind(this), {
      signal: abort,
    });
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this), {
      passive: false,
      signal: abort,
    });
    this.canvas.addEventListener("mouseleave", () => this.buttons.clear(), {
      signal: abort,
    });
    this.canvas.addEventListener(
      "pointerlockchange" as any, // unsupported on mobile, will have to test.
      () => {
        if (!this.isPointerLocked())
        this.enableLock = false;
      },
      { signal: abort }
    );
    this.canvas.addEventListener(
      "like:resizeCanvas",
      (e: Event) => {
        this.canvasSize = (e as LikeCanvasEventMap['like:resizeCanvas']).detail.size;
      },
      { signal: abort }
    );
  }

  private handleMouseMove(e: MouseMoveEvent): void {
    if (this.isPointerLocked() && this.enableLock) {
      /** In pointer-lock mode, simulate a real cursor bounded by the canvas. */
      this.setCapturedPos(
        Vec2.add(this.pos, Vec2.mul(e.detail.delta, this.lockedMode.speed)),
      );
      this.dispatch('mousemoved', [this.pos, e.detail.delta]);
    } else {
      /** In non-pointer locked mode, calculate deltas ourselves. */
      this.pos = e.detail.pos;
      this.dispatch('mousemoved', [this.pos, Vec2.sub(this.pos, this.lastPos)]);
    }
    this.lastPos = this.pos;
  }

  private handleMouseDown(e: globalThis.MouseEvent): void {
    // hack: ignore right clicks because they cause a refocus
    if (!this.isPointerLocked() && e.button == 2) return;
    this.buttons.add(numToButton(e.button));
    this.dispatch('mousepressed', [[e.offsetX, e.offsetY], numToButton(e.button)]);
    this.canvas?.focus();
  }

  private handleMouseUp(e: globalThis.MouseEvent): void {
    this.buttons.delete(numToButton(e.button));
    this.dispatch('mousereleased', [[e.offsetX, e.offsetY], numToButton(e.button)]);
  }

  private handleWheel(e: WheelEvent): void {
    if (this.unlockedMode.scrollBlock) {
      e.preventDefault();
    }
  }

  /** Mouse position, transformed to canvas pixels. */
  getPosition(): Vector2 {
    return this.pos;
  }

  /** Check if button is held. Button 1 = left, 2 = middle, 3 = right. */
  isDown(button: MouseButton): boolean {
    return this.buttons.has(button);
  }

  /** All currently held buttons. */
  getPressedButtons(): Set<MouseButton> {
    return new Set(this.buttons);
  }

  /**
   * Set the current cursor mode.
   * 
   * ### Normal mode
   * Consider setting `scrollBlock` to false (default is true) if you want
   * your element to blend into the webpage for freer scrolling.
   * 
   * ```ts
   * {
   *   lock: false,
   *   visible: true, // disable to hide cursor.
   *   scrollBlock: true, // disable scroll while hovering canvas. Default: true
   * }
   * ```
   * 
   * ### Captured mode
   * In locked mode, the cursor cannot escape the canvas.
   * It also becomes invisible.
   * However, it can move infinitely, sensitivity can be controlled,
   * and the emulated cursor (in `pos` of {@link like.EventMap.mousemoved}) can be freely repositioned.
   * 
   * ```ts
   * {
   *   lock: true,
   *   speed: 1.0, // mouse sensitivity
   * }
   * ```
   * Avoid binding the `ESC` key in captured mode. This will exit the capture and
   * reset mode to default.
   * 
   * ### Note on `pos` vs `delta`
   * Event {@link like.EventMap.mousemoved} passes both `pos` and `delta` args.
   * 
   * Though the emulated cursor in locked mode
   * (locked mode doesn't natively track absolute position)
   * may be stuck on canvas edges, the `delta` field always
   * represents mouse movement, even against edges.
   */
  setMode(mode: MouseSetMode) {
    this.lockPointer(mode.lock);
    if (mode.lock) {
      this.lockedMode = {
        ...this.lockedMode,
        ...mode,
      };
    } else {
      this.unlockedMode = {
        ...this.unlockedMode,
        ...mode
      };
      this.canvas.style.cursor = this.unlockedMode.visible ? 'auto' : 'none';
    }
  }

  getMode(): MouseMode {
    return this.enableLock ? this.lockedMode : this.unlockedMode;
  }

  /**
   * Only applicable in capture mode -- sets the position
   * of the emulated mouse.
   */
  setCapturedPos(pos: Vector2) {
    if (this.isPointerLocked()) {
      this.pos = Vec2.clamp(pos, [0, 0], this.canvasSize);
    } else {
      console.log("[Mouse] Attempt to set cursor position while not captured.");
    }
  }

  /**
   * Enable/disable pointer lock (capture).
   * 
   * For more fine-grained control, use {@link setMode} which
   * also documents behaviors more thoroughly.
   */
  lockPointer(lock: boolean) {
    this.enableLock = lock;
    const wasLocked = this.isPointerLocked();
    if (lock && !wasLocked) {
      this.canvas.requestPointerLock();
    } else if (!lock && wasLocked) {
      document.exitPointerLock();
    }
  }

  /**
   * True when pointer is locked to canvas.
   */
  isPointerLocked(): boolean {
    return document.pointerLockElement == this.canvas;
  }

  /**
   * @returns whether the pointer is visible.
   */
  isCursorVisible(): boolean {
    return this.enableLock || !this.unlockedMode.visible;
  }

  /** I beleve you wanted to use `like.mouse.setMode({lock: true})`
   * or `like.mouse.lockPointer().
   */
  setRelativeMode?: never;
}
