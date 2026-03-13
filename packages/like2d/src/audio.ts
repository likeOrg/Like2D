export interface SourceOptions {
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
    if (this.pending.position !== 0) {
      this.audio.currentTime = this.pending.position;
    }
    if (this.pending.playing) {
      this.pending.playing = false;
      this.doPlay();
    }
  }

  private doPlay(): void {
    this.audio.play().catch(err => {
      console.warn(`Failed to play audio "${this.path}":`, err.message);
    });
  }

  isReady(): boolean {
    return this.loaded;
  }

  play(): void {
    if (this.loaded) {
      this.doPlay();
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
      if (this.audio.paused) this.doPlay();
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

  getDuration(): number {
    return this.loaded ? this.audio.duration || 0 : 0;
  }

  isPlaying(): boolean {
    if (this.loaded) return !this.audio.paused && !this.audio.ended;
    return this.pending.playing;
  }

  isPaused(): boolean {
    if (this.loaded) return this.audio.paused && this.audio.currentTime > 0;
    return !this.pending.playing && this.pending.position > 0;
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
}

export class Audio {
  private sources: WeakRef<Source>[] = [];
  private globalVolume = 1;

  newSource(path: string, options?: SourceOptions): Source {
    const source = new Source(path, this, options);
    this.sources.push(new WeakRef(source));
    return source;
  }

  private getAllSources(): Source[] {
    const active: Source[] = [];
    this.sources = this.sources.filter(ref => {
      const source = ref.deref();
      if (source) {
        active.push(source);
        return true;
      }
      return false;
    });
    return active;
  }

  stopAll(): void {
    this.getAllSources().forEach(s => {
      s.audio.pause();
      s.audio.currentTime = 0;
    });
  }

  pauseAll(): void {
    this.getAllSources().forEach(s => s.audio.pause());
  }

  resumeAll(): void {
    this.getAllSources().forEach(s => {
      if (s.isPaused()) {
        s.resume();
      }
    });
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

export const audio = new Audio();
