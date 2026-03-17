import type { Scene, Like } from '../index';
/**
 * A simple startup scene that waits for a mouse click before advancing.
 *
 * This exists to work around browser autoplay restrictions - browsers require
 * user interaction (like a click) before allowing audio playback. Show this
 * scene first, then transition to your game scene on click.
 */
export declare class StartupScene implements Scene {
    private next;
    private onDraw?;
    private logo;
    constructor(next: Scene, onDraw?: ((like: Like) => void) | undefined);
    load(like: Like): void;
    draw(like: Like): void;
    mousepressed(like: Like): void;
}
//# sourceMappingURL=startup.d.ts.map