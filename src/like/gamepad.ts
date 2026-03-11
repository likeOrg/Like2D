import { getButtonName, getButtonIndex, GAMEPAD_BUTTON_NAMES } from './gamepad-button-map.ts';

export { getButtonName, getButtonIndex, GAMEPAD_BUTTON_NAMES };

export class Gamepad {
  private gamepadStates = new Map<number, Set<number>>();
  private connectedGamepads = new Set<number>();
  private prevStates = new Map<number, Set<number>>();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.connectedGamepads.add(e.gamepad.index);
      this.gamepadStates.set(e.gamepad.index, new Set());
      this.prevStates.set(e.gamepad.index, new Set());
    });

    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      this.connectedGamepads.delete(e.gamepad.index);
      this.gamepadStates.delete(e.gamepad.index);
      this.prevStates.delete(e.gamepad.index);
    });

    window.addEventListener('blur', () => {
      for (const state of this.gamepadStates.values()) {
        state.clear();
      }
    });
  }

  update(): { pressed: Array<{ gamepadIndex: number; buttonIndex: number; buttonName: string }>; released: Array<{ gamepadIndex: number; buttonIndex: number; buttonName: string }> } {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pressed: Array<{ gamepadIndex: number; buttonIndex: number; buttonName: string }> = [];
    const released: Array<{ gamepadIndex: number; buttonIndex: number; buttonName: string }> = [];

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        this.connectedGamepads.add(i);
        
        // Store previous state
        const prevState = this.gamepadStates.get(i) ?? new Set();
        this.prevStates.set(i, new Set(prevState));
        
        // Build new state
        const pressedButtons = new Set<number>();
        for (let j = 0; j < gamepad.buttons.length; j++) {
          if (gamepad.buttons[j].pressed) {
            pressedButtons.add(j);
          }
        }
        this.gamepadStates.set(i, pressedButtons);

        // Check for state changes
        for (const button of pressedButtons) {
          if (!prevState.has(button)) {
            pressed.push({ gamepadIndex: i, buttonIndex: button, buttonName: getButtonName(button) });
          }
        }
        for (const button of prevState) {
          if (!pressedButtons.has(button)) {
            released.push({ gamepadIndex: i, buttonIndex: button, buttonName: getButtonName(button) });
          }
        }
      }
    }

    return { pressed, released };
  }

  isConnected(gamepadIndex: number): boolean {
    return this.connectedGamepads.has(gamepadIndex);
  }

  isButtonDown(gamepadIndex: number, buttonIndex: number): boolean {
    const state = this.gamepadStates.get(gamepadIndex);
    return state ? state.has(buttonIndex) : false;
  }

  isButtonDownOnAny(buttonIndex: number): boolean {
    for (const state of this.gamepadStates.values()) {
      if (state.has(buttonIndex)) {
        return true;
      }
    }
    return false;
  }

  getPressedButtons(gamepadIndex: number): Set<number> {
    const state = this.gamepadStates.get(gamepadIndex);
    return state ? new Set(state) : new Set();
  }

  getConnectedGamepads(): number[] {
    return Array.from(this.connectedGamepads);
  }
}

export const gamepad = new Gamepad();
export default gamepad;
