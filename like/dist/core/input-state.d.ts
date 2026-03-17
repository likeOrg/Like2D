export declare class InputStateTracker<T> {
    private prevState;
    private currState;
    update(pressedKeys: Set<T>): {
        justPressed: T[];
        justReleased: T[];
    };
    isDown(key: T): boolean;
    justPressed(key: T): boolean;
    justReleased(key: T): boolean;
    getCurrentState(): Set<T>;
    clear(): void;
}
//# sourceMappingURL=input-state.d.ts.map