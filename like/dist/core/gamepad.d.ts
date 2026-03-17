import { getGPName, GP } from './gamepad-buttons';
import { ButtonMapping } from './gamepad-mapping';
export { GP, getGPName };
export interface StickPosition {
    x: number;
    y: number;
}
export type ButtonCallback = (gamepadIndex: number, buttonIndex: number, buttonName: string, pressed: boolean) => void;
export declare class Gamepad {
    private buttonTrackers;
    private connectedGamepads;
    private buttonMappings;
    onButtonEvent?: (gamepadIndex: number, buttonIndex: number, buttonName: string, pressed: boolean) => void;
    private onConnected?;
    private onDisconnected?;
    private gamepadConnectedHandler;
    private gamepadDisconnectedHandler;
    private blurHandler;
    constructor();
    private handleGamepadConnected;
    private handleGamepadDisconnected;
    private handleBlur;
    setCallbacks(callbacks: {
        onConnected?: (gamepad: globalThis.Gamepad) => void;
        onDisconnected?: (gamepadIndex: number) => void;
    }): void;
    dispose(): void;
    init(): Promise<void>;
    private onGamepadConnectedInternal;
    private onGamepadDisconnectedInternal;
    update(): void;
    isConnected(gamepadIndex: number): boolean;
    /**
     * Check if a button is currently pressed on a specific gamepad
     * Uses mapped button indices (standard layout)
     */
    isButtonDown(gamepadIndex: number, buttonIndex: number): boolean;
    isButtonDownOnAny(buttonIndex: number): boolean;
    getPressedButtons(gamepadIndex: number): Set<number>;
    getConnectedGamepads(): number[];
    /**
     * Get the raw Gamepad object for a specific index
     */
    getGamepad(gamepadIndex: number): globalThis.Gamepad | undefined;
    /**
     * Get the button mapping for a specific gamepad
     */
    getButtonMapping(gamepadIndex: number): ButtonMapping | undefined;
    /**
     * Check if a gamepad has a known mapping from the database
     */
    hasMapping(gamepadIndex: number): boolean;
    /**
     * Get the controller name for a specific gamepad
     */
    getControllerName(gamepadIndex: number): string | undefined;
    getAxis(gamepadIndex: number, axisIndex: number): number;
    getLeftStick(gamepadIndex: number): StickPosition;
    getRightStick(gamepadIndex: number): StickPosition;
}
//# sourceMappingURL=gamepad.d.ts.map