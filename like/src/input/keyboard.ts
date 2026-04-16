// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import { EngineProps } from "../engine";
import { Dispatcher, type LikeCanvasElement, type LikeKeyboardEvent } from "../events";


/**
 * A basic wrapper around keyboard.
 * 
 * Keyboard uses scancodes by default, which are based on physical key
 * positions rather than the logical (letter) meaning of the key.
 *  
 * ## When to use Keyboard
 * 
 * Using keyboard directly is discouraged, but of course allowed.
 * Take a look at the actions system in {@link input} for a better solution.
 * 
 * Also where there's text input such as `enter your name`, use the key code.
 * This allows the user to use their intended keyboard layout.
 * 
 * ```
 * like.keypressed = (_code, key) => {
 *   name += key;
 * }
 * ```
 * 
 * Even if your game is heavily keyboard-reliant (like nethack), it is best to avoid mapping directly.
 * Referring to action `drink` instead of code `KeyD` is also more programmer-ergonomic.
 * 
 */
export class Keyboard {
  private pressedScancodes = new Set<string>();
  private canvas: LikeCanvasElement;
  private dispatch: Dispatcher<LikeKeyboardEvent>;

  constructor(props: EngineProps<LikeKeyboardEvent>) {
    this.canvas = props.canvas;
    this.dispatch = props.dispatch;
    const { abort } = props;

    this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this), { signal: abort });
    this.canvas.addEventListener('keyup', this.handleKeyUp.bind(this), { signal: abort });
    this.canvas.addEventListener('blur', this.handleBlur.bind(this), { signal: abort });
  }

  private handleKeyDown(e: globalThis.KeyboardEvent): void {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
    if (scrollKeys.includes(e.code)) {
      e.preventDefault();
    }

    if (e.code) {
      this.pressedScancodes.add(e.code);
    }
    this.dispatch('keypressed', [e.code, e.key]);
  }

  private handleKeyUp(e: globalThis.KeyboardEvent): void {
    if (e.code) {
      this.pressedScancodes.delete(e.code);
    }
    this.dispatch('keyreleased', [e.code, e.key]);
  }

  private handleBlur(): void {
    this.pressedScancodes.clear();
  }

  isDown(scancode: string): boolean {
    return this.pressedScancodes.has(scancode);
  }

  isAnyDown(...scancodes: string[]): boolean {
    return scancodes.some(code => this.pressedScancodes.has(code));
  }
}
