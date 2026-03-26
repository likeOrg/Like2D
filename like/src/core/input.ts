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
  private actionMap = new Map<string, InputBinding[]>();
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

  setAction(action: string, inputs: string[] = []): void {
    if (inputs.length) {
      const bindings: InputBinding[] = inputs.map((input) =>
        this.parseInput(input),
      );
      this.actionMap.set(action, bindings);
    } else {
      this.actionMap.delete(action);
      this.currState.delete(action);
      this.prevState.delete(action);
    }
  }

  isDown(action: string): boolean {
    const bindings = this.actionMap.get(action);
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

    for (const [action] of this.actionMap) {
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

  private parseInput(input: string): InputBinding {
    const normalized = input.trim();

    if (normalized.startsWith("Mouse")) {
      const buttonCode = normalized.replace("Mouse", "");
      return { type: "mouse", button: buttonCode as MouseButton };
    }

    if (allButtons.has(input) || normalized.startsWith("Button") || normalized.startsWith("Axis")) {
      return {
        type: "gamepad",
        gamepad: "any",
        button: normalized as LikeButton,
      };
    }

    return { type: "keyboard", scancode: normalized };
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