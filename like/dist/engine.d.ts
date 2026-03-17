import type { Like2DEvent } from './core/events';
import type { PartialCanvasMode } from './core/canvas-config';
import type { Like } from './core/like';
export declare class Engine {
    private canvas;
    private ctx;
    private isRunning;
    private lastTime;
    private container;
    private canvasManager;
    private handleEvent;
    private currentScene;
    readonly like: Like;
    constructor(container: HTMLElement);
    private dispatch;
    setMode(mode: PartialCanvasMode): void;
    start(handleEvent: (event: Like2DEvent) => void): Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=engine.d.ts.map