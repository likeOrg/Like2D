import type { Keyboard } from './keyboard';
import type { Mouse } from './mouse';
import type { Gamepad } from './gamepad';
import { InputStateTracker } from './input-state';
import { GP_NAME_MAP } from './gamepad-buttons';

export type InputType = 'keyboard' | 'mouse' | 'gamepad';

export interface InputBinding {
  type: InputType;
  code: string;
}

const buttonMap: Record<string, number> = {
  'Left': 1,
  'Right': 3,
  'Middle': 2,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
};

export class Input {
  private actionMap = new Map<string, InputBinding[]>();
  private actionStateTracker = new InputStateTracker<string>();
  private keyboard: Keyboard;
  private mouse: Mouse;
  private gamepad: Gamepad;

  constructor(deps: { keyboard: Keyboard; mouse: Mouse; gamepad: Gamepad }) {
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

  update(): { 
    pressed: string[]; 
    released: string[]; 
    gamepadPressed: Array<{ gamepadIndex: number; buttonIndex: number; buttonName: string }>; 
    gamepadReleased: Array<{ gamepadIndex: number; buttonIndex: number; buttonName: string }>;
  } {
    const { pressed: gamepadPressed, released: gamepadReleased } = this.gamepad.update();

    const activeActions = new Set<string>();

    for (const [action] of this.actionMap) {
      if (this.isDown(action)) {
        activeActions.add(action);
      }
    }

    const { justPressed, justReleased } = this.actionStateTracker.update(activeActions);

    return { 
      pressed: justPressed, 
      released: justReleased,
      gamepadPressed,
      gamepadReleased,
    };
  }

  private parseInput(input: string): InputBinding {
    const normalized = input.trim();

    if (normalized.startsWith('Mouse')) {
      const buttonCode = normalized.replace('Mouse', '');
      return { type: 'mouse', code: buttonCode };
    }

    if (normalized.startsWith('Button') || normalized.startsWith('DP')) {
      return { type: 'gamepad', code: normalized };
    }

    return { type: 'keyboard', code: normalized };
  }

  private isBindingActive(binding: InputBinding): boolean {
    switch (binding.type) {
      case 'keyboard':
        return this.keyboard.isDown(binding.code);
      case 'mouse': {
        const button = buttonMap[binding.code];
        if (button !== undefined) {
          return this.mouse.isDown(button);
        }
        return false;
      }
      case 'gamepad': {
        const buttonIndex = GP_NAME_MAP[binding.code];
        if (buttonIndex !== undefined) {
          return this.gamepad.isButtonDownOnAny(buttonIndex);
        }
        return false;
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