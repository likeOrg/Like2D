import { getGPName, GP } from './gamepad-buttons';
import { InputStateTracker } from './input-state';
import { gamepadMapping } from './gamepad-mapping';
export { GP, getGPName };
const AXIS_DEADZONE = 0.15;
function applyDeadzone(value, deadzone = AXIS_DEADZONE) {
    if (Math.abs(value) < deadzone)
        return 0;
    const sign = value < 0 ? -1 : 1;
    const magnitude = Math.abs(value);
    return sign * (magnitude - deadzone) / (1 - deadzone);
}
function applyRadialDeadzone(x, y, deadzone = AXIS_DEADZONE) {
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude < deadzone)
        return { x: 0, y: 0 };
    const scale = (magnitude - deadzone) / (magnitude * (1 - deadzone));
    return { x: x * scale, y: y * scale };
}
export class Gamepad {
    constructor() {
        Object.defineProperty(this, "buttonTrackers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "connectedGamepads", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "buttonMappings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "onButtonEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onDisconnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Event handler references for cleanup
        Object.defineProperty(this, "gamepadConnectedHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gamepadDisconnectedHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "blurHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Bind event handlers
        this.gamepadConnectedHandler = this.handleGamepadConnected.bind(this);
        this.gamepadDisconnectedHandler = this.handleGamepadDisconnected.bind(this);
        this.blurHandler = this.handleBlur.bind(this);
        // Register event listeners
        window.addEventListener('gamepadconnected', this.gamepadConnectedHandler);
        window.addEventListener('gamepaddisconnected', this.gamepadDisconnectedHandler);
        window.addEventListener('blur', this.blurHandler);
    }
    handleGamepadConnected(e) {
        this.onGamepadConnectedInternal(e.gamepad);
        this.onConnected?.(e.gamepad);
    }
    handleGamepadDisconnected(e) {
        this.onGamepadDisconnectedInternal(e.gamepad.index);
        this.onDisconnected?.(e.gamepad.index);
    }
    handleBlur() {
        for (const tracker of this.buttonTrackers.values()) {
            tracker.clear();
        }
    }
    setCallbacks(callbacks) {
        this.onConnected = callbacks.onConnected;
        this.onDisconnected = callbacks.onDisconnected;
    }
    dispose() {
        window.removeEventListener('gamepadconnected', this.gamepadConnectedHandler);
        window.removeEventListener('gamepaddisconnected', this.gamepadDisconnectedHandler);
        window.removeEventListener('blur', this.blurHandler);
        this.connectedGamepads.clear();
        this.buttonTrackers.clear();
        this.buttonMappings.clear();
    }
    async init() {
        await gamepadMapping.loadDatabase();
    }
    onGamepadConnectedInternal(gamepad) {
        this.connectedGamepads.set(gamepad.index, gamepad);
        this.buttonTrackers.set(gamepad.index, new InputStateTracker());
        const mapping = gamepadMapping.getMapping(gamepad);
        this.buttonMappings.set(gamepad.index, mapping);
        console.log(`[Gamepad] Connected: "${gamepad.id}"`);
        if (mapping.vendor !== null && mapping.product !== null) {
            console.log(`[Gamepad] Vendor: 0x${mapping.vendor.toString(16).padStart(4, '0')}, Product: 0x${mapping.product.toString(16).padStart(4, '0')}`);
        }
        const mappingType = gamepad.mapping === 'standard' ? 'browser standard' : (mapping.hasMapping ? 'SDL DB' : 'unmapped');
        console.log(`[Gamepad] Mapped as: "${mapping.controllerName}" (${mappingType})`);
    }
    onGamepadDisconnectedInternal(gamepadIndex) {
        this.connectedGamepads.delete(gamepadIndex);
        this.buttonTrackers.delete(gamepadIndex);
        this.buttonMappings.delete(gamepadIndex);
    }
    update() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad) {
                this.connectedGamepads.set(i, gamepad);
                let tracker = this.buttonTrackers.get(i);
                if (!tracker) {
                    tracker = new InputStateTracker();
                    this.buttonTrackers.set(i, tracker);
                }
                // Get or update the button mapping for this gamepad
                let mapping = this.buttonMappings.get(i);
                if (!mapping) {
                    mapping = gamepadMapping.getMapping(gamepad);
                    this.buttonMappings.set(i, mapping);
                }
                const pressedButtons = new Set();
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
                    this.onButtonEvent?.(i, buttonIndex, getGPName(buttonIndex), true);
                }
                for (const buttonIndex of changes.justReleased) {
                    this.onButtonEvent?.(i, buttonIndex, getGPName(buttonIndex), false);
                }
            }
        }
    }
    isConnected(gamepadIndex) {
        return this.connectedGamepads.has(gamepadIndex);
    }
    /**
     * Check if a button is currently pressed on a specific gamepad
     * Uses mapped button indices (standard layout)
     */
    isButtonDown(gamepadIndex, buttonIndex) {
        const tracker = this.buttonTrackers.get(gamepadIndex);
        return tracker ? tracker.isDown(buttonIndex) : false;
    }
    isButtonDownOnAny(buttonIndex) {
        for (const tracker of this.buttonTrackers.values()) {
            if (tracker.isDown(buttonIndex))
                return true;
        }
        return false;
    }
    getPressedButtons(gamepadIndex) {
        const tracker = this.buttonTrackers.get(gamepadIndex);
        return tracker ? tracker.getCurrentState() : new Set();
    }
    getConnectedGamepads() {
        return Array.from(this.connectedGamepads.keys());
    }
    /**
     * Get the raw Gamepad object for a specific index
     */
    getGamepad(gamepadIndex) {
        return this.connectedGamepads.get(gamepadIndex);
    }
    /**
     * Get the button mapping for a specific gamepad
     */
    getButtonMapping(gamepadIndex) {
        return this.buttonMappings.get(gamepadIndex);
    }
    /**
     * Check if a gamepad has a known mapping from the database
     */
    hasMapping(gamepadIndex) {
        const mapping = this.buttonMappings.get(gamepadIndex);
        return mapping?.hasMapping ?? false;
    }
    /**
     * Get the controller name for a specific gamepad
     */
    getControllerName(gamepadIndex) {
        const mapping = this.buttonMappings.get(gamepadIndex);
        return mapping?.controllerName;
    }
    getAxis(gamepadIndex, axisIndex) {
        const gamepad = this.connectedGamepads.get(gamepadIndex);
        if (!gamepad || axisIndex < 0 || axisIndex >= gamepad.axes.length)
            return 0;
        return applyDeadzone(gamepad.axes[axisIndex]);
    }
    getLeftStick(gamepadIndex) {
        const gamepad = this.connectedGamepads.get(gamepadIndex);
        if (!gamepad || gamepad.axes.length < 2)
            return { x: 0, y: 0 };
        return applyRadialDeadzone(gamepad.axes[0], gamepad.axes[1]);
    }
    getRightStick(gamepadIndex) {
        const gamepad = this.connectedGamepads.get(gamepadIndex);
        if (!gamepad || gamepad.axes.length < 4)
            return { x: 0, y: 0 };
        return applyRadialDeadzone(gamepad.axes[2], gamepad.axes[3]);
    }
}
