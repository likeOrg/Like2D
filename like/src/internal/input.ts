import type { KeyboardInternal } from './keyboard';
import type { MouseInternal } from './mouse';
import { GamepadTarget, GamepadInternal } from './gamepad';
import { allButtons, LikeButton } from './gamepad-mapping';
import { MouseButton } from './events';
import { EngineDispatch } from '../engine';

export type InputType = InputBinding['type'];
export type InputBinding =
  | { type: 'keyboard'; scancode: string }
  | { type: 'mouse'; button: MouseButton }
  | { type: 'gamepad'; gamepad: GamepadTarget, button: LikeButton };

export class InputInternal {
  private currState = new Set<string>();
  private prevState = new Set<string>();
  private actionTable: Record<string, InputBinding[]> = {};
  private keyboard: KeyboardInternal;
  private mouse: MouseInternal;
  private gamepad: GamepadInternal;

  constructor(
    deps: {
      keyboard: KeyboardInternal;
      mouse: MouseInternal;
      gamepad: GamepadInternal;
    },
    private dispatch: EngineDispatch,
  ) {
    this.keyboard = deps.keyboard;
    this.mouse = deps.mouse;
    this.gamepad = deps.gamepad;
  }

  /**
   * This is the easiest way to set-and-forget input => action mapping.
   * 
   * Or, it's a helper to remove actions -- `setAction(action)`
   * will simply clear the action away.
   * 
   * For input strings:
   *  - Mouse is `MouseLeft`, `MouseRight`, or `MouseMiddle`.
   *  - Joypad is 'Left', 'L1', or any joypad button. {@link LikeButton}
   *  - Keyboard is the name of scancodes, which are based on key positions. Choose from a subset of portable, web-safe scancodes:
        - Alphabetical: `KeyA`, `KeyB`, ...
        - Numeric: `Digit0`, `Digit1`, ...
   *    - `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`
   *    - `ShiftLeft`, `ShiftRight`
   *    - `Minus`
   *    - `Equal` (also has a plus sign)
   *    - `BracketLeft` and `BracketRight`
   *    - `Semicolon`
   *    - `Quote`
   *    - `Backquote` (also has tilde)
   *    - `Backslash`
   *    - `Comma`
   *    - `Period`
   *    - `Slash`
   *    - `Backspace`
   *    - `Enter`
   * 
   * ### Example: Using a jump action
   * ```ts
   * setAction("jump", ['KeyX', 'Space', 'BBottom']);
   * 
   * // elsewhere...
   * 
   * like.actionpressed = (action) => {
   *   switch (action) {
   *     case 'jump':
   *       if (player.grounded) player.jumping = true;
   *       break;
   *   }
   * }
   * 
   * // or...
   * 
   * if (like.action.isDown('jump') && player.grounded) {
   *   player.jumping = true;
   * }
   * ```
   * 
   * For projects with custom input binding, use:
   *  - {@link InputInternal.appendToAction}
   *  - {@link InputInternal.getActionMapping}
   *  - {@link InputInternal.setActionMapping}
   * 
   * @param action 
   * @param inputs 
   */
  setAction(action: string, inputs: (string | InputBinding)[] = []): void {
    if (inputs.length) {
      this.actionTable[action] = inputs.map(parseInput);
    } else {
      delete this.actionTable[action];
      this.currState.delete(action);
      this.prevState.delete(action);
    }
  }

  /**
   * Map a single input onto an action.
   * 
   * ### Example: listen for a joypad or keyboard input and map it
   * 
   * ```ts
   * let jumpMapped = false;
   * let statusMessage = "Press the jump button."
   * 
   * like.joypadpressed = (_source, name) => {
   *   if (!jumpMapped) {
   *     like.action.appendToAction('jump', name);
   *     jumpMapped = true;
   *   }
   * }
   * 
   * like.keyboardpressed = (code) => {
   *   if (!jumpMapped) {
   *     like.action.appendToAction('jump', name);
   *     jumpMapped = true;
   *   }
   * }
   * ```
   */
  appendToAction(action: string, input: InputBinding | string) {
    const am = this.actionTable[action] ?? [];
    am.push(parseInput(input));
    this.actionTable[action] = am;
  }

  /**
   * Get the mapping entry for a specific action.
   * 
   * Be findful that modifying it in place will
   * affect the input system in realtime.
   * 
   * ### Example: clear away all keyboard inputs
   * ```ts
   * let am = like.gamepad.getActionMapping(action);
   * am = am.filter(({type}) => type !== 'keyboard');
   * like.gamepad.setActionMapping(am);
   * ```
   */
  getActionMapping(action: string): InputBinding[] {
    return this.actionTable[action] ?? [];
  }

  isDown(action: string): boolean {
    const bindings = this.actionTable[action];
    if (!bindings) return false;
    return bindings.some((binding) => this.isBindingActive(binding));
  }

  justPressed(action: string): boolean {
    return this.currState.has(action) && !this.prevState.has(action);
  }

  justReleased(action: string): boolean {
    return !this.currState.has(action) && this.prevState.has(action);
  }

  _update() {
    this.gamepad._update();
    [this.prevState, this.currState] = [this.currState, this.prevState];
    this.currState.clear();

    for (const action of Object.keys(this.actionTable)) {
      if (this.isDown(action)) {
        if (!this.prevState.has(action)) {
          this.dispatch('actionpressed', [action]);
        }
        this.currState.add(action);
      } else if (this.prevState.has(action)) {
        this.dispatch('actionreleased', [action]);
      }
    }
  }

  private isBindingActive(binding: InputBinding): boolean {
    switch (binding.type) {
      case "keyboard":
        return this.keyboard.isDown(binding.scancode);
      case "mouse":
        return this.mouse.isDown(binding.button);
      case "gamepad": {
        return !!this.gamepad.isDown(binding.gamepad, binding.button);
      }
      default:
        return false;
    }
  }
}

function parseInput(input: string | InputBinding): InputBinding {
  if (typeof input !== "string") return input;
  const normalized = input.trim();

  if (normalized.startsWith("Mouse")) {
    const buttonCode = normalized.replace("Mouse", "");
    return { type: "mouse", button: buttonCode as MouseButton };
  }

  if (
    allButtons.has(input) ||
    normalized.startsWith("Button") ||
    normalized.startsWith("Axis")
  ) {
    return {
      type: "gamepad",
      gamepad: "any",
      button: normalized as LikeButton,
    };
  }

  return { type: "keyboard", scancode: normalized };
}
