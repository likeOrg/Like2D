export declare class Keyboard {
    private pressedScancodes;
    onKeyEvent?: (scancode: string, keycode: string, type: 'keydown' | 'keyup') => void;
    private keydownHandler;
    private keyupHandler;
    private blurHandler;
    constructor();
    private handleKeyDown;
    private handleKeyUp;
    private handleBlur;
    dispose(): void;
    isDown(scancode: string): boolean;
    isAnyDown(...scancodes: string[]): boolean;
}
//# sourceMappingURL=keyboard.d.ts.map