// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { Keyboard } from './keyboard';
import type { Mouse, MouseButton } from './mouse';
import { Gamepad, GamepadTarget } from './gamepad';
import { allButtons, LikeButton } from './gamepad-mapping';
import { Dispatcher, LikeActionEvent } from '../events';
import { EngineProps } from '../engine';

/** @private */
export type InputType = InputBinding['type'];

export type InputBinding =
  | { type: 'keyboard'; scancode: string }
  | { type: 'mouse'; button: MouseButton }
  | { type: 'gamepad'; gamepad: GamepadTarget, button: LikeButton };

/** {@include input.md} */
export class Input {
  /** Set of all standard gamepad button names */
  static allButtons = allButtons;

  private currState = new Set<string>();
  private prevState = new Set<string>();
  private actionTable: Record<string, InputBinding[]> = {};
  private keyboard: Keyboard;
  private mouse: Mouse;
  private gamepad: Gamepad;
  private dispatch: Dispatcher<LikeActionEvent>

  constructor(
    props: EngineProps<LikeActionEvent>,
    deps: {
      keyboard: Keyboard;
      mouse: Mouse;
      gamepad: Gamepad;
    },
  ) {
    this.keyboard = deps.keyboard;
    this.mouse = deps.mouse;
    this.gamepad = deps.gamepad;

    this.dispatch = props.dispatch;
    props.canvas.addEventListener("like:update", () => this.update(), {
      signal: props.abort,
    });
  }

  /**
   * This is the easiest way to set-and-forget input => action mapping.
   * 
   * Or, it's a helper to remove actions -- `setAction(action, [])`
   * will simply clear the action away.
   *
   * For input strings:
   *  - Mouse is `MouseLeft`, `MouseRight`, or `MouseMiddle`.
   *  - Joypad is 'Left', 'L1', or any joypad button. {@link LikeButton}
   *  - Keyboard is the name of scancodes, which are based on key positions. Choose from a subset of portable, web-safe scancodes:
   *    - Alphabetical: `KeyA`, `KeyB`, ...
   *    - Numeric: `Digit0`, `Digit1`, ...
   *    - `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`
   *    - `ShiftLeft`, `ShiftRight`
   *    - `Space`
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
   * @param action 
   * @param inputs 
   */
  setAction(action: string, inputs: (string | InputBinding)[]): void {
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
   */
  appendToAction(action: string, input: InputBinding | string) {
    const am = this.actionTable[action] ?? [];
    am.push(parseInput(input));
    this.actionTable[action] = am;
  }

/** {@include input.md} */
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

  private update() {
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
    const buttonCode = normalized.replace("Mouse", "").toLowerCase();
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
