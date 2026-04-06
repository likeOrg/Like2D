/** The audio module performs a few things:
 *
 * ## Make audio resources behave as if synchronous
 * Functions like playback and seeking are deferred until the sound is loaded.
 * 
 * ## Track and give global control to all audio objects
 * Start, stop, or set global volume for every currently playing sound.
 */

/** Pass this into like.audio.newSource as config. */
export type AudioSourceOptions = {
  volume?: number;
}

type LoadState =
  | { loaded: false; pendingPlay: boolean; pendingSeek: number }
  | { loaded: true };

/**
 * Handle to a loaded audio resource, which pretends to be synchronous.
 * Use `play()`, `stop()`, `pause()`, `resume()` for playback control.
 */
export class AudioSource {
  readonly path: string;
  /**
   * Underlying HTMLAudioElement.
   *
   * This is _highly_ unstable to use, since web audio API
   * is coming soon.
   */
  readonly audio: HTMLAudioElement;
  /** Avoid setting these directly. */
  readonly options: Required<AudioSourceOptions>;
  /** Resolves when the audio is loaded and ready to play. */
  readonly ready: Promise<void>;
  private loadState: LoadState = { loaded: false, pendingPlay: false, pendingSeek: 0 };
  private audioRef: Audio;

  constructor(path: string, audioRef: Audio, options: AudioSourceOptions = {}) {
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
        if (this.loadState.loaded) return;
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

  isReady(): boolean {
    return this.loadState.loaded;
  }

  play(): void {
    if (this.loadState.loaded) {
      this.audio.play()?.catch(() => {
        // Play failed (autoplay policy) - ignore
      });
    } else {
      this.loadState.pendingPlay = true;
    }
  }

  stop(): void {
    if (this.loadState.loaded) {
      this.audio.pause();
      this.audio.currentTime = 0;
    } else {
      this.loadState.pendingPlay = false;
      this.loadState.pendingSeek = 0;
    }
  }

  pause(): void {
    if (this.loadState.loaded) {
      this.audio.pause();
    } else {
      this.loadState.pendingPlay = false;
    }
  }

  resume(): void {
    if (this.loadState.loaded) {
      if (this.audio.paused) {
        this.audio.play()?.catch(() => {
          // Play failed (autoplay policy, etc.) - ignore
        });
      }
    } else {
      this.loadState.pendingPlay = true;
    }
  }

  seek(position: number): void {
    if (this.loadState.loaded) {
      this.audio.currentTime = position;
    } else {
      this.loadState.pendingSeek = position;
    }
  }

  tell(): number {
    if (this.loadState.loaded) return this.audio.currentTime;
    return this.loadState.pendingSeek;
  }

  isPlaying(): boolean {
    if (this.loadState.loaded) return !this.audio.paused && !this.audio.ended;
    return this.loadState.pendingPlay;
  }

  isPaused(): boolean {
    if (this.loadState.loaded) return this.audio.paused;
    return !this.loadState.pendingPlay;
  }

  isStopped(): boolean {
    if (this.loadState.loaded) return this.audio.paused && this.audio.currentTime === 0;
    return !this.loadState.pendingPlay && this.loadState.pendingSeek === 0;
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
    if (this.loadState.loaded) return this.audio.duration;
    return 0;
  }

  setLooping(loop: boolean): void {
    this.audio.loop = loop;
  }
}

/**
 * The audio subsystem.
 * 
 * Manages a handful of AudioSource objects, for things like global volume,
 * global play/pause, etc..
 * 
 * To make a new source, use `like.audio.newSource`.
 */
export class Audio {
  private sources: WeakRef<AudioSource>[] = [];
  private globalVolume = 1;

  /**
   * Get a {@link AudioSource}
   */
  newSource(path: string, options?: AudioSourceOptions): AudioSource {
    const source = new AudioSource(path, this, options);
    this.sources.push(new WeakRef(source));
    return source;
  }

  /** Get all audio sources -- note that sources are tracked
    * using weak references, and storing this list can cause
    * a memory leak.
    */
  getAllSources(): AudioSource[] {
    const active: AudioSource[] = [];
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

  clone(source: AudioSource): AudioSource {
    return this.newSource(source.path, { ...source.options });
  }
}
