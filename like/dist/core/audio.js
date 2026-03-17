/** The audio module performs a few things:
 *
 * ## Make audio resources behave as if synchronous
 * Functions like playback and seeking are deferred until the sound is loaded.
 *
 * ## Track and give global control to all audio objects
 * Start, stop, or set global volume for every currently playing sound.
 *
 */
/**
 * Handle to a loaded audio resource.
 * Use `play()`, `stop()`, `pause()`, `resume()` for playback control.
 * Access the underlying HTMLAudioElement via `source.audio` for looping,
 * pitch, etc. Note: Use `source.setVolume()` instead of setting
 * `source.audio.volume` directly to ensure global volume scaling works correctly.
 */
export class Source {
    constructor(path, audioRef, options = {}) {
        Object.defineProperty(this, "path", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Underlying HTMLAudioElement. Modify directly for looping, pitch, etc. Use methods for playback control. Avoid setting volume directly. */
        Object.defineProperty(this, "audio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Resolves when the audio is loaded and ready to play. */
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "loadState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { loaded: false, pendingPlay: false, pendingSeek: 0 }
        });
        Object.defineProperty(this, "audioRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.path = path;
        this.audioRef = audioRef;
        this.audio = document.createElement('audio');
        this.audio.src = path;
        this.options = {
            volume: Math.max(0, Math.min(1, options.volume ?? 1))
        };
        this.audio.volume = this.options.volume * audioRef.getVolume();
        this.ready = new Promise((resolve, reject) => {
            this.audio.oncanplaythrough = () => {
                if (this.loadState.loaded)
                    return;
                const { pendingPlay, pendingSeek } = this.loadState;
                this.loadState = { loaded: true };
                this.audio.currentTime = pendingSeek;
                if (pendingPlay) {
                    this.audio.play()?.catch(() => {
                        // Play failed (autoplay policy) - reset so user can retry
                    });
                }
                resolve();
            };
            this.audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
            // Handle audio that is already loaded (cached) when we attach the listener
            if (this.audio.readyState >= 3) {
                this.loadState = { loaded: true };
                resolve();
            }
        });
    }
    isReady() {
        return this.loadState.loaded;
    }
    play() {
        if (this.loadState.loaded) {
            this.audio.play()?.catch(() => {
                // Play failed (autoplay policy) - ignore
            });
        }
        else {
            this.loadState.pendingPlay = true;
        }
    }
    stop() {
        if (this.loadState.loaded) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        else {
            this.loadState.pendingPlay = false;
            this.loadState.pendingSeek = 0;
        }
    }
    pause() {
        if (this.loadState.loaded) {
            this.audio.pause();
        }
        else {
            this.loadState.pendingPlay = false;
        }
    }
    resume() {
        if (this.loadState.loaded) {
            if (this.audio.paused) {
                this.audio.play()?.catch(() => {
                    // Play failed (autoplay policy, etc.) - ignore
                });
            }
        }
        else {
            this.loadState.pendingPlay = true;
        }
    }
    seek(position) {
        if (this.loadState.loaded) {
            this.audio.currentTime = position;
        }
        else {
            this.loadState.pendingSeek = position;
        }
    }
    tell() {
        if (this.loadState.loaded)
            return this.audio.currentTime;
        return this.loadState.pendingSeek;
    }
    isPlaying() {
        if (this.loadState.loaded)
            return !this.audio.paused && !this.audio.ended;
        return this.loadState.pendingPlay;
    }
    isPaused() {
        if (this.loadState.loaded)
            return this.audio.paused;
        return !this.loadState.pendingPlay;
    }
    isStopped() {
        if (this.loadState.loaded)
            return this.audio.paused && this.audio.currentTime === 0;
        return !this.loadState.pendingPlay && this.loadState.pendingSeek === 0;
    }
    /** Set volume (0-1). Applies global volume scaling. Prefer this over `source.audio.volume`. */
    setVolume(volume) {
        this.options.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.options.volume * this.audioRef.getVolume();
    }
    getVolume() {
        return this.options.volume;
    }
    getDuration() {
        if (this.loadState.loaded)
            return this.audio.duration;
        return 0;
    }
}
export class Audio {
    constructor() {
        Object.defineProperty(this, "sources", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "globalVolume", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
    }
    newSource(path, options) {
        const source = new Source(path, this, options);
        this.sources.push(new WeakRef(source));
        return source;
    }
    /** Get all audio sources -- note that sources are tracked
      * using weak references, and storing this list can cause
      * a memory leak.
      */
    getAllSources() {
        const active = [];
        for (const sourceRef of this.sources) {
            const source = sourceRef.deref();
            if (source)
                active.push(source);
        }
        return active;
    }
    stopAll() {
        this.getAllSources().forEach(s => s.stop());
    }
    pauseAll() {
        this.getAllSources().forEach(s => s.pause());
    }
    resumeAll() {
        this.getAllSources().forEach(s => s.resume());
    }
    setVolume(volume) {
        this.globalVolume = Math.max(0, Math.min(1, volume));
        this.getAllSources().forEach(s => {
            s.audio.volume = s.options.volume * this.globalVolume;
        });
    }
    getVolume() {
        return this.globalVolume;
    }
    clone(source) {
        return this.newSource(source.path, { ...source.options });
    }
}
