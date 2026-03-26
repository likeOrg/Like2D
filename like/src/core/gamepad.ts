import { defaultMapping, fullButtonName, GamepadMappingEntry, getMappingFromGamepad, LikeButton, mapStick, standardButtonMapping } from './gamepad-mapping';
import { EngineDispatch } from '../engine';
import { Vector2 } from '../math/vector2';

type GamepadMapping = GamepadMappingEntry;

export {
  type LikeButton,
  type GamepadMappingEntry as GamepadMapping,
  type StickMapping,
  type StickAxisMapping,
  defaultMapping,
} from "./gamepad-mapping";

/** A selector for a gamepad. */
export type GamepadTarget = number | "any";

/** LIKE Gamepad Wrapper
 * 
 *  - Allows events/callbacks to be sent from joy buttons.
 *  - Can track if any gamepad has a button pressed / just pressed.
 *  - Remaps raw input numbers to readable strings -- by default using SDL database.
 * 
 * If you're planning on supporting gamepads, please include a
 * way to generate {@link GamepadMapping} and set it with {@link Gamepad.setMapping}.
 * 
 * If you don't want to make your own, take a look at `prefab-scenes/mapGamepad`.
 * 
 * ## Getting events
 * ```ts
 * like.gamepadpressed = (idx: number, button: LikeButton) => {
 *   console.log(`Button ${button} pressed on controller ${idx}`);
 * }
 * ```
 * 
 * ## Using the built-in mapping scene
 * ```ts
 * import { buttonSetSNES, MapGamepad } from "like/prefab-scenes";
 * 
 * like.gamepadconnected = (index: number, mapped: boolean) => {
 *   if (!mapped) {
 *     const myTargetMapping = { buttons: buttonSetSNES, sticks: 2 };
 *     const mappingScene = new MapGamepad(myTargetMapping, index);
 *     like.scene.setScene(mappingScene);
 *   }
 * }
 * ```
 * Available button sets:
 *  - `buttonSetNES`: A, B, Start, Select, DPad
 *  - `buttonSetSNES`: NES plus X, Y, L1, R1
 *  - `buttonSetPS1`: SNES plus L2, R2
 *  - `buttonSetAll`: PS1 plus Lstick, RStick (stick click buttons)
 * 
 */
export class GamepadInternal {
  private gamepads = new Map<number, GamepadState>();
  private abort = new AbortController();
  private autoLoadMapping = false;

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
      gps.mapping.buttons = standardButtonMapping();
    } else {
      const sdlMapping = getMappingFromGamepad(ev.gamepad);
      if (sdlMapping.size > 0) {
        gps.mapping.buttons = sdlMapping;
        console.log(`[Gamepad] Connected, applied SDL database mapping for ${ev.gamepad.id}.`);
      } else {
        console.log(
          `[Gamepad] Connected non-standard gamepad ${ev.gamepad.id}. Consider remapping it.`,
        );
      }
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
      return gp.getSticks();
    }
    return [];
  }

  fullButtonName(name: LikeButton): string {
    return fullButtonName.get(name as any) ?? name;
  }

  _checkButton(
    target: GamepadTarget,
    button: LikeButton | number,
    mode: "isJustPressed" | "isDown",
  ): boolean | undefined {
    if (target == "any") {
      return this.gamepads.values().some((gp) => gp[mode](button));
    } else {
      return this.gamepads.get(target)?.[mode](button);
    }
  }

  /** Check if a gamepad button is down. */
  isDown(
    target: GamepadTarget,
    button: LikeButton | number,
  ): boolean | undefined {
    return this._checkButton(target, button, "isDown");
  }

  /**
   * Returns true for only one frame/update if a button is pressed.
   * Considered an alternative to `like.gamepadpressed`.
   */
  isJustPressed(
    target: GamepadTarget,
    button: LikeButton | number,
  ): boolean | undefined {
    return this._checkButton(target, button, "isJustPressed");
  }

  /**
   * Get a controller mapping.
   * Note that modifying this mapping in place will modify the target controller.
   * However, use `setMapping` to finalize the mapping.
   */
  getMapping(index: number): GamepadMapping | undefined {
    return this.gamepads.get(index)?.mapping;
  }

  /**
   * Set the mapping for a particular controller.
   *
   * Set `save = false` if you don't want this written into localstorage.
   */
  setMapping(index: number, mapping: GamepadMapping, save = true) {
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
  loadMapping(index: number): GamepadMapping | undefined {
    const gp = navigator.getGamepads()?.[index];
    if (gp) {
      const path = getLocalstoragePath(gp);
      console.log(`[Gamepad] Loaded mapping ${path} from localStorage.`)
      const item = localStorage.getItem(path);
      if (item) {
        const raw = JSON.parse(item);
        raw.buttons = new Map(Object.entries(raw.buttons));
        return raw;
      }
    }
  }

  /**
   * Save a mapping to persistant storage
   */
  saveMapping(index: number, mapping: GamepadMapping) {
    const gp = navigator.getGamepads()?.[index];
    if (gp) {
      const path = getLocalstoragePath(gp);
      console.log(`[Gamepad] Saved mapping ${path} to localStorage.`)
      localStorage.setItem(path, JSON.stringify(mapping));
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

}

function getLocalstoragePath(gamepad: Gamepad): string {
  return `${gamepad.axes.length}A${gamepad.buttons.length}B${gamepad.id}`;
}

/** Internal class: Using it externally could result
 * in a gamepad being disconnected and still trying to maintain
 * its state.
 */
class GamepadState {
  public mapping: GamepadMapping;
  public downNums = new Set<number>();
  public down = new Set<LikeButton>();
  public lastDownNums = new Set<number>();
  public lastDown = new Set<LikeButton>();

  constructor(public index: number) {
    const gp = navigator.getGamepads()[this.index]!;
    this.mapping = defaultMapping(gp.axes.length);
  }

  isDown(button: number | LikeButton): boolean {
    return typeof(button) == "number" ? this.downNums.has(button) : this.down.has(button);
  }

  isJustPressed(button: number | LikeButton): boolean {
    return typeof(button) == "number" ?
      (this.downNums.has(button) && !this.lastDownNums.has(button)) :
      (this.down.has(button) && !this.lastDown.has(button));
  }

  map(button: number): LikeButton {
    if (button > maxButtons) {
      // this is an axis
      return `$Axis${Math.floor(button - 64) / 2}${button % 2 ? '-' : '+'}` as LikeButton;
    } else {
      return this.mapping.buttons.get(button) ?? `Button${button}`;
    }
  }

  update(dispatch: EngineDispatch) {
    const gp = navigator.getGamepads()[this.index]!;

    // Swap down and last down, then clear 'down'
    // Rotates the button log backwards w/o allocation.
    [this.down, this.lastDown] = [this.lastDown, this.down];
    this.down.clear();
    [this.downNums, this.lastDownNums] = [this.lastDownNums, this.downNums];
    this.downNums.clear();

    gp.buttons.forEach((btn, i) => {
      const name = this.map(i);
      if (btn.pressed) {
        this.down.add(name);
        this.downNums.add(i);
      }
      if (btn.pressed && !this.lastDownNums.has(i)) {
        dispatch("gamepadpressed", [this.index, name, i]);
      } else if (!btn.pressed && this.downNums.has(i)) {
        dispatch("gamepadreleased", [this.index, name, i]);
      }
    });

    this.pressed = nextPressed;
  }

  getSticks(): Vector2[] {
    const gp = navigator.getGamepads()[this.index]!;
    return this.mapping.sticks.map((stick) => mapStick(gp, stick));
  }

  clear() {
    this.lastDown.clear();
    this.down.clear();
  }
}