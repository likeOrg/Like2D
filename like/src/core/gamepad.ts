import { LikeButton } from './gamepad-mapping';
import { InputStateTracker } from './input-state';
import { GamepadMapping } from './gamepad-mapping';
import { EngineDispatch } from '../engine';

export type { LikeButton };

export class LikeGamepad {
  private buttonTracker = new InputStateTracker<LikeButton>();
  private buttonMappings = new Map<number, GamepadMapping>();

  private abort = new AbortController();

  constructor(private dispatch: EngineDispatch) {
    // Register event listeners
    window.addEventListener("gamepadconnected", (ev: GamepadEvent) => {
      console.log(`[Gamepad] connected. buttons: ${ev.gamepad.buttons.length}, axes: ${ev.gamepad.axes.length}`);
      this.buttonMappings.set(ev.gamepad.index, new GamepadMapping(ev.gamepad));
    });
    window.addEventListener("gamepaddisconnected", (ev: GamepadEvent) => {
      this.buttonMappings.delete(ev.gamepad.index);
    });
    window.addEventListener("blur", () => this.buttonTracker.clear());

    new GamepadMapping({id: "0420-a695-PissPad Big Boy Playtime", mapping: "blah"} as any);
    new GamepadMapping({id: "045e-0b20-Should be XBOne", mapping: "blah"} as any);
    new GamepadMapping({id: "Game sir! (Vendor: 05ac Product: 055b)", mapping: "blah"} as any);
  }

  update(): void {
    const gamepads = navigator.getGamepads().filter((v) => v !== null);

    const pressedButtons = new Set<LikeButton>();
    for (const gp of gamepads) {
      const mapping = this.buttonMappings.get(gp.index);
      if (!mapping) continue;
      gp.buttons.forEach((btn, i) => {
        if (btn.pressed) {
          const name = mapping.applyMapping(i);
          console.log(i, name);
          if (name) pressedButtons.add(name);
        }
      })
    }

    const changes = this.buttonTracker.update(pressedButtons);

    for (const button of changes.justPressed) {
      this.dispatch("gamepadpressed", [0, button]);
    }
    for (const button of changes.justReleased) {
      this.dispatch("gamepadreleased", [0, button]);
    }
  }

  isButtonDown(button: LikeButton): boolean {
    return this.buttonTracker.isDown(button);
  }

  getPressedButtons(): Set<LikeButton> {
    return this.buttonTracker.currState;
  }

  getAxes(gamepadIndex: number): readonly number[] | undefined {
    return navigator.getGamepads()?.[gamepadIndex]?.axes;
  }

  // Removed analog functions for now.
  // Must add mapping support

  // getLeftStick(gamepadIndex: number): Vector2 | undefined {
  //   const gamepad = navigator.getGamepads()?.[gamepadIndex];
  //   if (!gamepad || gamepad.axes.length < 2) return;
  //   return this.applyDeadzone([gamepad.axes[0], gamepad.axes[1]]);
  // }

  // getRightStick(gamepadIndex: number): Vector2 | undefined {
  //   const gamepad = navigator.getGamepads()?.[gamepadIndex];
  //   if (!gamepad || gamepad.axes.length < 4) return;
  //   return this.applyDeadzone([gamepad.axes[2], gamepad.axes[3]]);
  // }
  // private applyDeadzone (pos: Vector2, deadzone: number = 0.15): Vector2 {
  //   return Vec2.fromPolar(Math.max(0, Vec2.length(pos) - deadzone), Vec2.angle(pos));
  // }

  _dispose(): void {
    this.abort.abort();
  }

}
