import type { Keyboard } from './keyboard';
import type { Mouse } from './mouse';
import type { LikeGamepad } from './gamepad';
import { InputStateTracker } from './input-state';
import { LikeButton } from './gamepad-mapping';
import { MouseButton } from './events';

export type InputType = InputBinding['type'];
export type InputBinding =
  | { type: 'keyboard'; code: string }
  | { type: 'mouse'; code: MouseButton }
  | { type: 'gamepad'; code: LikeButton };

export class Input {
  private actionMap = new Map<string, InputBinding[]>();
  private actionStateTracker = new InputStateTracker<string>();
  private keyboard: Keyboard;
  private mouse: Mouse;
  private gamepad: LikeGamepad;

  constructor(deps: { keyboard: Keyboard; mouse: Mouse; gamepad: LikeGamepad }) {
    this.keyboard = deps.keyboard;
    this.mouse = deps.mouse;
    this.gamepad = deps.gamepad;
  }

  map(action: string, inputs: string[]): void {
    const bindings: InputBinding[] = inputs.map(input => this.parseInput(input));
    this.actionMap.set(action, bindings);
  }

  unmap(action: string): void {
    this.actionMap.delete(action);
    this.actionStateTracker.clear();
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

  update(): { pressed: string[]; released: string[] } {
    this.gamepad.update();

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
      return { type: 'mouse', code: buttonCode as MouseButton };
    }

    if (normalized.startsWith('Button') || normalized.startsWith('DP')) {
      return { type: 'gamepad', code: normalized as LikeButton };
    }

    return { type: 'keyboard', code: normalized };
  }

  private isBindingActive(binding: InputBinding): boolean {
    switch (binding.type) {
      case 'keyboard':
        return this.keyboard.isDown(binding.code);
      case 'mouse':
        return this.mouse.isDown(binding.code);
      case 'gamepad': {
        return this.gamepad.isButtonDown(binding.code);
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