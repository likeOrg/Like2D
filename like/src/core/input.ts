import type { KeyboardInternal } from './keyboard';
import type { MouseInternal } from './mouse';
import { GamepadTarget, GamepadInternal } from './gamepad';
import { InputStateTracker } from './input-state';
import { LikeButton } from './gamepad-mapping';
import { MouseButton } from './events';

export type InputType = InputBinding['type'];
export type InputBinding =
  | { type: 'keyboard'; scancode: string }
  | { type: 'mouse'; button: MouseButton }
  | { type: 'gamepad'; gamepad: GamepadTarget, button: number };

export class InputInternal {
  private actionMap = new Map<string, InputBinding[]>();
  private actionStateTracker = new InputStateTracker<string>();
  private keyboard: KeyboardInternal;
  private mouse: MouseInternal;
  private gamepad: GamepadInternal;

  constructor(deps: { keyboard: KeyboardInternal; mouse: MouseInternal; gamepad: GamepadInternal }) {
    this.keyboard = deps.keyboard;
    this.mouse = deps.mouse;
    this.gamepad = deps.gamepad;
  }

  setAction(action: string, inputs: string[] = []): void {
    if (inputs.length) {
      const bindings: InputBinding[] = inputs.map(input => this.parseInput(input));
      this.actionMap.set(action, bindings);
    } else {
      this.actionMap.delete(action);
      this.actionStateTracker.currState.delete(action);
      this.actionStateTracker.prevState.delete(action);
    }
  }

  isDown(action: string): boolean {
    const bindings = this.actionMap.get(action);
    if (!bindings) return false;

    return bindings.some(binding => this.isBindingActive(binding));
  }

  justPressed(action: string): boolean {
    return this.actionStateTracker.justPressed(action);
  }

  justReleased(action: string): boolean {
    return this.actionStateTracker.justReleased(action);
  }

  _update(): { pressed: string[]; released: string[] } {
    this.gamepad._update();

    const activeActions = new Set<string>();

    for (const [action] of this.actionMap) {
      if (this.isDown(action)) {
        activeActions.add(action);
      }
    }

    const { justPressed, justReleased } = this.actionStateTracker.update(activeActions);

    return { pressed: justPressed, released: justReleased };
  }

  private parseInput(input: string): InputBinding {
    const normalized = input.trim();

    if (normalized.startsWith('Mouse')) {
      const buttonCode = normalized.replace('Mouse', '');
      return { type: 'mouse', button: buttonCode as MouseButton };
    }

    if (normalized.startsWith('Button') || normalized.startsWith('DP')) {
      return {
        type: "gamepad",
        gamepad: 0,
        button: GamepadInternal.getButtonNumber(normalized as LikeButton),
      };
    }

    return { type: 'keyboard', scancode: normalized };
  }

  private isBindingActive(binding: InputBinding): boolean {
    switch (binding.type) {
      case 'keyboard':
        return this.keyboard.isDown(binding.scancode);
      case 'mouse':
        return this.mouse.isDown(binding.button);
      case 'gamepad': {
        return !!this.gamepad.isButtonDown(binding.gamepad, binding.button);
      }
      default:
        return false;
    }
  }

  clear(): void {
    this.actionMap.clear();
    this.actionStateTracker.clear();
  }
}