export declare class Timer {
    private currentDelta;
    private totalTime;
    private frameCount;
    private fps;
    private fpsAccumulator;
    private sleepUntil;
    private sceneStartTime;
    update(dt: number): void;
    resetSceneTime(): void;
    getDelta(): number;
    getFPS(): number;
    getTime(): number;
    getSceneTime(): number;
    isSleeping(): boolean;
    sleep(duration: number): void;
}
//# sourceMappingURL=timer.d.ts.map