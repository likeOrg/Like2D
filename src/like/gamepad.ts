import { getButtonName, getButtonIndex } from './gamepad-button-map.ts';
import { InputStateTracker } from './input-state.ts';
import { gamepadMapping, ButtonMapping } from './gamepad-mapping.ts';

export { getButtonName, getButtonIndex };

export interface GamepadButtonEvent {
  gamepadIndex: number;
  buttonIndex: number;
  buttonName: string;
  rawButtonIndex: number;
}

export class Gamepad {
  private buttonTrackers = new Map<number, InputStateTracker<number>>();
  private connectedGamepads = new Map<number, globalThis.Gamepad>();
  private buttonMappings = new Map<number, ButtonMapping>();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize the gamepad system and load the mapping database
   */
  async init(): Promise<void> {
    await gamepadMapping.loadDatabase();
  }

  private setupEventListeners(): void {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.connectedGamepads.set(e.gamepad.index, e.gamepad);
      this.buttonTrackers.set(e.gamepad.index, new InputStateTracker<number>());
      const mapping = gamepadMapping.getMapping(e.gamepad);
      this.buttonMappings.set(e.gamepad.index, mapping);
      console.log(`[Gamepad] Connected: ${mapping.controllerName}${mapping.hasMapping ? '' : ' (unmapped)'}`);
    });

    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      this.connectedGamepads.delete(e.gamepad.index);
      this.buttonTrackers.delete(e.gamepad.index);
      this.buttonMappings.delete(e.gamepad.index);
    });

    window.addEventListener('blur', () => {
      for (const tracker of this.buttonTrackers.values()) {
        tracker.clear();
      }
    });
  }

  update(): { pressed: GamepadButtonEvent[]; released: GamepadButtonEvent[] } {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pressed: GamepadButtonEvent[] = [];
    const released: GamepadButtonEvent[] = [];

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        this.connectedGamepads.set(i, gamepad);
        
        let tracker = this.buttonTrackers.get(i);
        if (!tracker) {
          tracker = new InputStateTracker<number>();
          this.buttonTrackers.set(i, tracker);
        }

        // Get or update the button mapping for this gamepad
        let mapping = this.buttonMappings.get(i);
        if (!mapping) {
          mapping = gamepadMapping.getMapping(gamepad);
          this.buttonMappings.set(i, mapping);
        }
        
        const pressedButtons = new Set<number>();
        for (let j = 0; j < gamepad.buttons.length; j++) {
          if (gamepad.buttons[j].pressed) {
            // Map the raw button index to standard button index
            const standardIndex = mapping.toStandard.get(j);
            if (standardIndex !== undefined) {
              pressedButtons.add(standardIndex);
            }
          }
        }
        
        const changes = tracker.update(pressedButtons);
        
        for (const buttonIndex of changes.justPressed) {
          pressed.push({ 
            gamepadIndex: i, 
            buttonIndex, 
            buttonName: getButtonName(buttonIndex),
            rawButtonIndex: mapping.fromStandard.get(buttonIndex) ?? buttonIndex,
          });
        }
        for (const buttonIndex of changes.justReleased) {
          released.push({ 
            gamepadIndex: i, 
            buttonIndex, 
            buttonName: getButtonName(buttonIndex),
            rawButtonIndex: mapping.fromStandard.get(buttonIndex) ?? buttonIndex,
          });
        }
      }
    }

    return { pressed, released };
  }

  isConnected(gamepadIndex: number): boolean {
    return this.connectedGamepads.has(gamepadIndex);
  }

  /**
   * Check if a button is currently pressed on a specific gamepad
   * Uses mapped button indices (standard layout)
   */
  isButtonDown(gamepadIndex: number, button: number | string): boolean {
    const buttonIndex = typeof button === 'string' ? getButtonIndex(button) : button;
    if (buttonIndex === undefined) return false;
    const tracker = this.buttonTrackers.get(gamepadIndex);
    return tracker ? tracker.isDown(buttonIndex) : false;
  }

  isButtonDownOnAny(button: number | string): boolean {
    const buttonIndex = typeof button === 'string' ? getButtonIndex(button) : button;
    if (buttonIndex === undefined) return false;
    for (const tracker of this.buttonTrackers.values()) {
      if (tracker.isDown(buttonIndex)) return true;
    }
    return false;
  }

  getPressedButtons(gamepadIndex: number): Set<number> {
    const tracker = this.buttonTrackers.get(gamepadIndex);
    return tracker ? tracker.getCurrentState() : new Set();
  }

  getConnectedGamepads(): number[] {
    return Array.from(this.connectedGamepads.keys());
  }

  /**
   * Get the raw Gamepad object for a specific index
   */
  getGamepad(gamepadIndex: number): globalThis.Gamepad | undefined {
    return this.connectedGamepads.get(gamepadIndex);
  }

  /**
   * Get the button mapping for a specific gamepad
   */
  getButtonMapping(gamepadIndex: number): ButtonMapping | undefined {
    return this.buttonMappings.get(gamepadIndex);
  }

  /**
   * Check if a gamepad has a known mapping from the database
   */
  hasMapping(gamepadIndex: number): boolean {
    const mapping = this.buttonMappings.get(gamepadIndex);
    return mapping?.hasMapping ?? false;
  }

  /**
   * Get the controller name for a specific gamepad
   */
  getControllerName(gamepadIndex: number): string | undefined {
    const mapping = this.buttonMappings.get(gamepadIndex);
    return mapping?.controllerName;
  }
}

export const gamepad = new Gamepad();
export default gamepad;
