import type { Vector2 } from './vector2';
export type EventMap = {
    load: [];
    update: [dt: number];
    draw: [];
    resize: [size: Vector2, pixelSize: Vector2, fullscreen: boolean];
    keypressed: [scancode: string, keycode: string];
    keyreleased: [scancode: string, keycode: string];
    mousepressed: [x: number, y: number, button: number];
    mousereleased: [x: number, y: number, button: number];
    gamepadpressed: [gamepadIndex: number, buttonIndex: number, buttonName: string];
    gamepadreleased: [gamepadIndex: number, buttonIndex: number, buttonName: string];
    actionpressed: [action: string];
    actionreleased: [action: string];
};
export type EventType = keyof EventMap;
export type Like2DEvent = {
    [K in EventType]: {
        type: K;
        args: EventMap[K];
        timestamp: number;
    };
}[EventType];
//# sourceMappingURL=events.d.ts.map