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
}

/**
 * Handle to a loaded audio resource.
 * Access the underlying HTMLAudioElement via `source.audio` for playback control,
 * looping, pitch, etc. Note: Use `source.setVolume()` instead of setting
 * `source.audio.volume` directly to ensure global volume scaling works correctly.
 */
export class Source {
  readonly path: string;
  /** Underlying HTMLAudioElement. Modify directly for looping, pitch, etc. Avoid setting volume directly. */
  readonly audio: HTMLAudioElement;
  readonly options: Required<SourceOptions>;
  /** Resolves when the audio is loaded and ready to play. */
  readonly ready: Promise<void>;
  private loaded = false;
  private audioRef: Audio;
  private pending = {
    position: 0,
    playing: false
  };

  constructor(path: string, audioRef: Audio, options: SourceOptions = {}) {
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
        this.loaded = true;
        this.applyPendingState();
        resolve();
      };
      this.audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
    });
  }

  private applyPendingState(): void {
    this.audio.currentTime = this.pending.position;
    if (this.pending.playing) {
      this.audio.play();
    }
  }

  isReady(): boolean {
    return this.loaded;
  }

  play(): void {
    if (this.loaded) {
      this.audio.play();
    } else {
      this.pending.playing = true;
    }
  }

  stop(): void {
    if (this.loaded) {
      this.audio.pause();
      this.audio.currentTime = 0;
    } else {
      this.pending.playing = false;
      this.pending.position = 0;
    }
  }

  pause(): void {
    if (this.loaded) {
      this.audio.pause();
    } else {
      this.pending.playing = false;
    }
  }

  resume(): void {
    if (this.loaded) {
      if (this.audio.paused) this.audio.play();
    } else {
      this.pending.playing = true;
    }
  }

  seek(position: number): void {
    if (this.loaded) {
      this.audio.currentTime = position;
    } else {
      this.pending.position = position;
    }
  }

  tell(): number {
    if (this.loaded) return this.audio.currentTime;
    return this.pending.position;
  }

  isPlaying(): boolean {
    if (this.loaded) return !this.audio.paused && !this.audio.ended;
    return this.pending.playing;
  }

  isPaused(): boolean {
    if (this.loaded) return this.audio.paused;
    return !this.pending.playing;
  }

  isStopped(): boolean {
    if (this.loaded) return this.audio.paused && this.audio.currentTime === 0;
    return !this.pending.playing && this.pending.position === 0;
  }

  /** Set volume (0-1). Applies global volume scaling. Prefer this over `source.audio.volume`. */
  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this.options.volume * this.audioRef.getVolume();
  }

  getVolume(): number {
    return this.options.volume;
  }

  getDuration(): number {
    if (this.loaded) return this.audio.duration;
    return 0;
  }
}

export class Audio {
  private sources: WeakRef<Source>[] = [];
  private globalVolume = 1;

  newSource(path: string, options?: SourceOptions): Source {
    const source = new Source(path, this, options);
    this.sources.push(new WeakRef(source));
    return source;
  }

  /** Get all audio sources -- note that sources are tracked
    * using weak references, and storing this list can cause
    * a memory leak.
    */
  private getAllSources(): Source[] {
    const active: Source[] = [];
    for (const sourceRef of this.sources) {
      const source = sourceRef.deref();
      if (source) active.push(source);
    }
    return active;
  }

  stopAll(): void {
    this.getAllSources().forEach(s => s.stop());
  }

  pauseAll(): void {
    this.getAllSources().forEach(s => s.pause());
  }

  resumeAll(): void {
    this.getAllSources().forEach(s => s.resume());
  }

  setVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    this.getAllSources().forEach(s => {
      s.audio.volume = s.options.volume * this.globalVolume;
    });
  }

  getVolume(): number {
    return this.globalVolume;
  }

  clone(source: Source): Source {
    return this.newSource(source.path, { ...source.options });
  }
}
