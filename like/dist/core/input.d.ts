import type { Keyboard } from './keyboard';
import type { Mouse } from './mouse';
import type { Gamepad } from './gamepad';
export type InputType = 'keyboard' | 'mouse' | 'gamepad';
export interface InputBinding {
    type: InputType;
    code: string;
}
export declare class Input {
    private actionMap;
    private actionStateTracker;
    private keyboard;
    private mouse;
    private gamepad;
    constructor(deps: {
        keyboard: Keyboard;
        mouse: Mouse;
        gamepad: Gamepad;
    });
    map(action: string, inputs: string[]): void;
    unmap(action: string): void;
    isDown(action: string): boolean;
    justPressed(action: string): boolean;
    justReleased(action: string): boolean;
    update(): {
        pressed: string[];
        released: string[];
    };
    private parseInput;
    private isBindingActive;
    clear(): void;
}
//# sourceMappingURL=input.d.ts.map