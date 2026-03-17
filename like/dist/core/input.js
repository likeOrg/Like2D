import { InputStateTracker } from './input-state';
import { GP_NAME_MAP } from './gamepad-buttons';
const buttonMap = {
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
    constructor(deps) {
        Object.defineProperty(this, "actionMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "actionStateTracker", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new InputStateTracker()
        });
        Object.defineProperty(this, "keyboard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mouse", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gamepad", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.keyboard = deps.keyboard;
        this.mouse = deps.mouse;
        this.gamepad = deps.gamepad;
    }
    map(action, inputs) {
        const bindings = inputs.map(input => this.parseInput(input));
        this.actionMap.set(action, bindings);
    }
    unmap(action) {
        this.actionMap.delete(action);
        this.actionStateTracker.clear();
    }
    isDown(action) {
        const bindings = this.actionMap.get(action);
        if (!bindings)
            return false;
        return bindings.some(binding => this.isBindingActive(binding));
    }
    justPressed(action) {
        return this.actionStateTracker.justPressed(action);
    }
    justReleased(action) {
        return this.actionStateTracker.justReleased(action);
    }
    update() {
        this.gamepad.update();
        const activeActions = new Set();
        for (const [action] of this.actionMap) {
            if (this.isDown(action)) {
                activeActions.add(action);
            }
        }
        const { justPressed, justReleased } = this.actionStateTracker.update(activeActions);
        return { pressed: justPressed, released: justReleased };
    }
    parseInput(input) {
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
    isBindingActive(binding) {
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
    clear() {
        this.actionMap.clear();
        this.actionStateTracker.clear();
    }
}
