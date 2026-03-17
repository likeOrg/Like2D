export interface ButtonMapping {
    toStandard: Map<number, number>;
    controllerName: string;
    hasMapping: boolean;
    vendor: number | null;
    product: number | null;
}
export declare class GamepadMapping {
    private dbLoaded;
    loadDatabase(): Promise<void>;
    loadDatabaseFromText(content: string): void;
    /**
     * Get button mapping for a specific gamepad
     */
    getMapping(gamepad: Gamepad): ButtonMapping;
    private extractVendorProduct;
}
export declare const gamepadMapping: GamepadMapping;
//# sourceMappingURL=gamepad-mapping.d.ts.map