import { LikeButton, nameToNumber, numberToName } from './gamepad-mapping';
import { EngineDispatch } from '../engine';
import { Vector2 } from '../math/vector2';

export type { LikeButton };

/** A selector for a gamepad. */
export type GamepadTarget = number | "any";

type Mapping = {
  buttons: number[],
  sticks: StickMapping[],
}
type StickMapping = [StickAxisMapping, StickAxisMapping];
type StickAxisMapping = {index: number, invert: boolean};

const defaultMapping = (stickCount: number): Mapping => ({
  buttons: [],
  sticks: Array(stickCount / 2).fill(0).map((_, i) => [
    { index: i * 2, invert: false },
    { index: i * 2 + 1, invert: false },
  ]),
});

/** LIKE Gamepad Wrapper
 * 
 *  - Allows events/callbacks to be sent from joy buttons
 *  - Can track if any gamepad has a button pressed.
 * 
 * # Examples
 * 
 * ### Binding events
 * ```ts
 * like.gamepadpressed = (idx: number, _num: number, button: string) => {
 *   console.log(`Button ${button} pressed on controller ${idx}`);
 * }
 * ```
 */
export class GamepadInternal {
  private gamepads = new Map<number, GamepadState>();
  private abort = new AbortController();
  private autoLoadMapping = true;

  constructor(private dispatch: EngineDispatch) {
    // Register event listeners
    window.addEventListener(
      "gamepadconnected",
      this._onGamepadConnected.bind(this),
      {
        signal: this.abort.signal,
      },
    );
    window.addEventListener(
      "gamepaddisconnected",
      (ev: GamepadEvent) => {
        console.log(`[Gamepad] Disconnected ${ev.gamepad.id}`);
        this.gamepads.delete(ev.gamepad.index);
      },
      { signal: this.abort.signal },
    );
    window.addEventListener(
      "blur",
      () => {
        this.gamepads.forEach((gps) => gps.clear());
      },
      { signal: this.abort.signal },
    );
  }

  _onGamepadConnected(ev: GamepadEvent) {
    const gps = new GamepadState(ev.gamepad.index);
    this.gamepads.set(ev.gamepad.index, gps);

    const mapping = this.loadMapping(ev.gamepad.index);
    if (this.autoLoadMapping && mapping) {
        gps.mapping = mapping;
        console.log(
          `[Gamepad] Connected, auto-loaded mapping for ${ev.gamepad.id}`,
        );
    } else if (ev.gamepad.mapping == "standard") {
      console.log(`[Gamepad] Connected standard gamepad ${ev.gamepad.id}.`);
    } else {
      console.log(
        `[Gamepad] Connected non-standard gamepad ${ev.gamepad.id}.Consider remapping it.`,
      );
    }

    console.log(
      `[Gamepad] buttons: ${ev.gamepad.buttons.length}, axes: ${ev.gamepad.axes.length}`,
    );
  }

  _update(): void {
    this.gamepads.forEach((gp) => gp.update(this.dispatch));
  }

  /**
   * 
   * @param target Which controller?
   * @returns all of the sticks. Convention is 0 = left, 1 = right.
   */
  getSticks(target: number): Vector2[] {
    const gp = this.gamepads.get(target);
    if (gp) {
      return gp.sticks;
    }
    return [];
  }

  /** Check if a gamepad button is down. */
  isButtonDown(
    target: GamepadTarget,
    buttonRaw: number | LikeButton,
  ): boolean | undefined {
    const btn = GamepadInternal.getButtonNumber(buttonRaw);
    if (target == "any") {
      return this.gamepads.values().some((gp) => gp.pressed[btn]);
    } else {
      return this.gamepads.get(target)?.pressed[btn];
    }
  }

  /**
   * Returns true for only one frame/update if a button is pressed.
   * Consider using `gamepadpressed` callback instead.
   */
  isButtonJustPressed(
    target: GamepadTarget,
    buttonRaw: number | LikeButton,
  ): boolean | undefined {
    const btn = GamepadInternal.getButtonNumber(buttonRaw);
    if (target == "any") {
      return this.gamepads.values().some((gp) => gp.justPressed[btn]);
    } else {
      return this.gamepads.get(target)?.justPressed[btn];
    }
  }

  /**
   * Get a controller mapping.
   * Note that modifying this mapping in place will modify the target controller.
   * However, use `setMapping` to finalize the mapping.
   */
  getMapping(index: number): Mapping | undefined {
    return this.gamepads.get(index)?.mapping;
  }

  /**
   * Set the mapping for a particular controller.
   *
   * Set `save = false` if you don't want this written into localstorage.
   */
  setMapping(index: number, mapping: Mapping, save = true) {
    const gp = this.gamepads.get(index);
    if (gp) {
      gp.mapping = mapping;
      if (save) {
        this.saveMapping(index, mapping);
      }
    }
  }

  /**
   * Get saved mapping from db, if it exists.
   */
  loadMapping(index: number): Mapping | undefined {
    const gp = navigator.getGamepads()?.[index];
    if (gp) {
      const item = localStorage.getItem(getLocalstoragePath(gp));
      if (item) {
        return JSON.parse(item);
      }
    }
  }

  /**
   * Save a mapping to persistant storage
   */
  saveMapping(index: number, mapping: Mapping) {
    const gp = navigator.getGamepads()?.[index];
    if (gp) {
      localStorage.setItem(getLocalstoragePath(gp), JSON.stringify(mapping));
    }
  }

  /**
   * Enable automatically loading mappings.
   *
   * When a gamepad with a known (to this system) ID is plugged in,
   * this will load the previously saved mapping.
   *
   * @param autosave (default true)
   */
  enableAutoLoadMapping(enable: boolean) {
    this.autoLoadMapping = enable;
  }

  _dispose(): void {
    this.abort.abort();
  }

  public static getButtonName(button: number | LikeButton): LikeButton {
    return typeof button == "number"
      ? (numberToName.get(button) ?? `Button${button}`)
      : button;
  }

  public static getButtonNumber(button: number | LikeButton): number {
    return typeof button == "number"
      ? button
      : (nameToNumber.get(button) ?? Number(button.substring(6)));
  }
}

function getLocalstoragePath(gamepad: Gamepad): string {
  return `${gamepad.axes.length}A${gamepad.buttons.length}B${gamepad.id}`;
}

/** Internal class: Using it externally could result
 * in a gamepad being disconnected and still trying to maintain
 * its state.
 */
class GamepadState {
  public mapping: Mapping;
  public pressed: boolean[] = [];
  public sticks: Vector2[] = [];
  public justPressed: boolean[] = [];

  constructor(public index: number) {
    const gp = navigator.getGamepads()[this.index]!;
    this.mapping = defaultMapping(gp.axes.length);
    console.log(JSON.stringify(this.mapping));
  };

  update(dispatch: EngineDispatch) {
    const gp = navigator.getGamepads()[this.index]!;
    
    gp.buttons.forEach((_, i) => {
      this.justPressed[i] = false;/** Vector2 is a subset of pair. */
      const pressed = gp.buttons[this.mapping.buttons[i] ?? i].pressed;
      if (pressed && !this.pressed[i]) {
        dispatch('gamepadpressed', [this.index, i, GamepadInternal.getButtonName(i)])
        this.justPressed[i] = true;
      } else if (!pressed && this.pressed[i]) {
        dispatch('gamepadreleased', [this.index, i, GamepadInternal.getButtonName(i)])
      }
      this.pressed[i] = pressed;
    });

    this.sticks = this.mapping.sticks.map((mapping) =>
      mapping.map(({index, invert}) => (invert ? -1 : 1) * (gp.axes[index] ?? 0)) as Vector2
    )
  }

  clear() { this.pressed = [] }
}
