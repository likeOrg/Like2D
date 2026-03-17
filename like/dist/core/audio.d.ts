/** The audio module performs a few things:
 *
 * ## Make audio resources behave as if synchronous
 * Functions like playback and seeking are deferred until the sound is loaded.
 *
 * ## Track and give global control to all audio objects
 * Start, stop, or set global volume for every currently playing sound.
 *
 */
export type SourceOptions = {
    volume?: number;
};
/**
 * Handle to a loaded audio resource.
 * Use `play()`, `stop()`, `pause()`, `resume()` for playback control.
 * Access the underlying HTMLAudioElement via `source.audio` for looping,
 * pitch, etc. Note: Use `source.setVolume()` instead of setting
 * `source.audio.volume` directly to ensure global volume scaling works correctly.
 */
export declare class Source {
    readonly path: string;
    /** Underlying HTMLAudioElement. Modify directly for looping, pitch, etc. Use methods for playback control. Avoid setting volume directly. */
    readonly audio: HTMLAudioElement;
    readonly options: Required<SourceOptions>;
    /** Resolves when the audio is loaded and ready to play. */
    readonly ready: Promise<void>;
    private loadState;
    private audioRef;
    constructor(path: string, audioRef: Audio, options?: SourceOptions);
    isReady(): boolean;
    play(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    seek(position: number): void;
    tell(): number;
    isPlaying(): boolean;
    isPaused(): boolean;
    isStopped(): boolean;
    /** Set volume (0-1). Applies global volume scaling. Prefer this over `source.audio.volume`. */
    setVolume(volume: number): void;
    getVolume(): number;
    getDuration(): number;
}
export declare class Audio {
    private sources;
    private globalVolume;
    newSource(path: string, options?: SourceOptions): Source;
    /** Get all audio sources -- note that sources are tracked
      * using weak references, and storing this list can cause
      * a memory leak.
      */
    private getAllSources;
    stopAll(): void;
    pauseAll(): void;
    resumeAll(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    clone(source: Source): Source;
}
//# sourceMappingURL=audio.d.ts.map