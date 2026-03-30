import { defaultMapping, fullButtonName, GamepadMapping, getSdlMapping, LikeButton, mapStick, standardButtonMapping } from './gamepad-mapping';
import { type Dispatcher, type LikeGamepadEvent } from '../events';
import { Vector2 } from '../math/vector2';
import { EngineProps } from '../engine';

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
 * Perhaps trigger it on {@link index.EventMap.gamepadconnected | gamepadconnected} events.
 * 
 * If you don't want to make your own, take a look at {@link prefab-scenes.MapGamepad}
 * 
 * ## When to use gamepad remapping
 * 
 * For games with heavy and varied gamepad use, mapping buttons is essential.
 * 
 * But if your game relies on a small set of logical actions like 'accept' or 'jump', don't hesitate to
 * reach for {@link input} in order to map based on actions instead.
 * 
 * 
 */
export class Gamepad {
  private dispatch: Dispatcher<LikeGamepadEvent>;
  private gamepads: Record<number, GamepadState> = {};
  private autoLoadMapping = true;

  constructor(props: EngineProps<LikeGamepadEvent>) {
    this.dispatch = props.dispatch;
    const { abort } = props;

    // Register event listeners
    window.addEventListener(
      "gamepadconnected",
      this.onGamepadConnected.bind(this),
      {
        signal: abort,
      },
    );
    window.addEventListener(
      "gamepaddisconnected",
      (ev: globalThis.GamepadEvent) => {
        console.log(`[Gamepad] Disconnected ${ev.gamepad.id}`);
        delete this.gamepads[ev.gamepad.index];
        this.dispatch("gamepaddisconnected", [ev.gamepad.index]);
      },
      { signal: abort },
    );
    window.addEventListener(
      "blur",
      () => {
        for (const gps of Object.values(this.gamepads)) {
          gps.clear();
        }
      },
      { signal: abort },
    );
    props.canvas.addEventListener("like:update", this.update.bind(this), {
      signal: abort,
    });
  }

  private onGamepadConnected(ev: globalThis.GamepadEvent) {
    const gps = new GamepadState(ev.gamepad.index);
    this.gamepads[ev.gamepad.index] = gps;
    console.log(
      `[Gamepad] Connected ${ev.gamepad.id}. buttons: ${ev.gamepad.buttons.length}, axes: ${ev.gamepad.axes.length}`,
    );

    const mapping = this.loadMapping(ev.gamepad.index);
    if (this.autoLoadMapping && mapping) {
      gps.mapping = mapping;
      console.log(`[Gamepad] Applied presaved mapping.`);
    } else if (ev.gamepad.mapping == 'standard') {
      gps.mapping = defaultMapping(ev.gamepad.axes.length / 2);
      gps.mapping.buttons = standardButtonMapping();
      console.log(`Loaded standard mapping.`);
    } else {
      const sdlMapping = getSdlMapping(ev.gamepad);
      if (sdlMapping) {
        gps.mapping.buttons = sdlMapping.mapping;
        console.log(
          `[Gamepad] Connected, applied SDL database mapping.`,
        );
      } else {
        console.log(
          `[Gamepad] Could not find mapping for gamepad. Consider remapping it.`,
        );
      }
    }

    this.dispatch("gamepadconnected", [ev.gamepad.index]);
  }

  /**
   * Called by the engine every frame.
   */
  private update(): void {
    Object.values(this.gamepads).forEach((gp) => gp.update(this.dispatch));
  }

  /**
   *
   * @param target Which controller?
   * @returns all of the sticks. Convention is 0 = left, 1 = right.
   */
  getSticks(target: number): Vector2[] {
    const gp = this.gamepads[target];
    if (gp) {
      return gp.getSticks();
    }
    return [];
  }

  fullButtonName(name: LikeButton): string {
    return fullButtonName.get(name as any) ?? name;
  }

  private checkButton(
    target: GamepadTarget,
    button: LikeButton | number,
    mode: "justPressed" | "isDown",
  ): boolean | undefined {
    if (target == "any") {
      return Object.values(this.gamepads).some((gp) => gp[mode](button));
    } else {
      return this.gamepads[target]?.[mode](button);
    }
  }

  /** Check if a gamepad button is down. */
  isDown(
    target: GamepadTarget,
    button: LikeButton | number,
  ): boolean | undefined {
    return this.checkButton(target, button, "isDown");
  }

  /**
   * Returns true for only one frame/update if a button is pressed.
   * Considered an alternative to `like.gamepadpressed`.
   */
  justPressed(
    target: GamepadTarget,
    button: LikeButton | number,
  ): boolean | undefined {
    return this.checkButton(target, button, "justPressed");
  }

  /**
   * Get a controller mapping.
   * Note that modifying this mapping in place will modify the target controller.
   * However, use `setMapping` to finalize the mapping.
   */
  getMapping(index: number): GamepadMapping | undefined {
    return this.gamepads[index]?.mapping;
  }

  /**
   * Set the mapping for a particular controller.
   *
   * Set `save = false` if you don't want this written into localstorage.
   */
  setMapping(index: number, mapping: GamepadMapping, save = true) {
    const gp = this.gamepads[index];
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
      console.log(`[Gamepad] Found saved mapping for ${gp.id}.`);
      const item = localStorage.getItem(path);
      if (item) {
        return JSON.parse(item);
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
      console.log(`[Gamepad] Saved mapping ${path} to localStorage.`);
      localStorage.setItem(path, JSON.stringify(mapping));
    }
  }

  /**
   * Enable automatically loading mappings.
   *
   * When a gamepad with a known (to this system) ID is plugged in,
   * this will load the previously saved mapping.
   *
   * @param enable
   */
  enableAutoLoadMapping(enable: boolean) {
    this.autoLoadMapping = enable;
  }
}

function getLocalstoragePath(gamepad: globalThis.Gamepad): string {
  return `${gamepad.axes.length}A${gamepad.buttons.length}B${gamepad.id}`;
}

const maxButtons = 64;

/** Internal class: Using it externally could result
 * in a gamepad being disconnected and still trying to maintain
 * its state.
 */
class GamepadState {
  public mapping: GamepadMapping;
  public downNums: boolean[] = [];
  public lastDownNums: boolean[] = [];
  public down = {} as Record<LikeButton, true>;
  public lastDown = {} as Record<LikeButton, true>;

  constructor(public index: number) {
    const gp = navigator.getGamepads()[this.index]!;
    this.mapping = defaultMapping(gp.axes.length);
  }

  isDown(button: number | LikeButton): boolean {
    return typeof(button) == "number" ? !!this.downNums[button] : !!this.down[button];
  }

  justPressed(button: number | LikeButton): boolean {
    return typeof(button) == "number" ?
      (!!this.downNums[button] && !this.lastDownNums[button]) :
      (!!this.down[button] && !this.lastDown[button]);
  }

  map(button: number): LikeButton {
      return (
        this.mapping.buttons[button] ??
        (button < maxButtons
          ? `Button${button}`
          : `Axis${Math.floor((button - maxButtons) / 2)}${button % 2 ? "-" : "+"}`)
      );
  }

  update(dispatch: Dispatcher<LikeGamepadEvent>) {
    const gp = navigator.getGamepads()[this.index]!;
    if (!gp) return;

    [this.downNums, this.lastDownNums] = [this.lastDownNums, this.downNums];
    for (const k in this.downNums) {
      delete this.downNums[Number(k)];
    }

    gp.buttons.forEach((btn, i) => {
      if (btn.pressed) {
        this.downNums[i] = true;
      }
    });

    gp.axes.forEach((axis, i) => {
      const pos: -1 | 0 | 1 = Math.round(axis) as any;
      if (pos == 0) return;
      const index = 64 + i * 2 + (pos == -1 ? 1 : 0);
      this.downNums[index] = true;
    });

    [this.down, this.lastDown] = [this.lastDown, this.down];
    for (const k in this.down) {
      delete this.down[k as LikeButton];
    }

    for (const i in this.downNums) {
      const name = this.map(Number(i));
      this.down[name] = true;
      if (!this.lastDownNums[Number(i)]) {
        dispatch("gamepadpressed", [this.index, name, Number(i)]);
      }
    }

    for (const i in this.lastDownNums) {
      if (!this.downNums[Number(i)]) {
        const name = this.map(Number(i));
        dispatch("gamepadreleased", [this.index, name, Number(i)]);
      }
    }
  }

  getSticks(): Vector2[] {
    const gp = navigator.getGamepads()[this.index]!;
    return this.mapping.sticks.map((stick) => mapStick(gp, stick));
  }

  clear() {
    for (const k in this.lastDown) {
      delete this.lastDown[k as LikeButton];
    }
    for (const k in this.down) {
      delete this.down[k as LikeButton];
    }
  }
}
