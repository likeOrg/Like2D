import { Engine } from './engine';
export { Vec2 } from './core/vector2';
export { Rect } from './core/rect';
export { ImageHandle } from './core/graphics';
export { StartupScene } from './scenes/startup';
export { getGPName, GP } from './core/gamepad';
export function createLike(container) {
    const engine = new Engine(container);
    const callbacks = {};
    const handleEvent = (event) => {
        const cb = callbacks[event.type];
        if (cb)
            cb(...event.args);
    };
    return Object.assign(engine.like, callbacks, {
        start: () => engine.start(handleEvent),
        dispose: () => engine.dispose(),
    });
}
