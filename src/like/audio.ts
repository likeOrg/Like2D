interface SourceOptions {
  volume?: number;
  pitch?: number;
  looping?: boolean;
}

export class Source {
  private audio: HTMLAudioElement;
  private _volume: number = 1;
  private _pitch: number = 1;
  private _looping: boolean = false;
  private path: string;
  private isLoaded = false;
  private loadPromise: Promise<void>;

  constructor(path: string, options: SourceOptions = {}) {
    this.path = path;
    this.audio = document.createElement('audio');
    this.audio.src = path;
    this._volume = options.volume ?? 1;
    this._pitch = options.pitch ?? 1;
    this._looping = options.looping ?? false;

    this.audio.volume = this._volume;
    this.audio.loop = this._looping;
    this.updatePlaybackRate();

    // Wait for audio to be ready
    this.loadPromise = new Promise((resolve, reject) => {
      this.audio.oncanplaythrough = () => {
        this.isLoaded = true;
        resolve();
      };

      this.audio.onerror = () => {
        reject(new Error(`Failed to load audio: ${path}`));
      };

      // If already cached, it might already be ready
      if (this.audio.readyState >= 4) {
        this.isLoaded = true;
        resolve();
      }
    });
  }

  ready(): Promise<void> {
    return this.loadPromise;
  }

  private updatePlaybackRate(): void {
    this.audio.playbackRate = this._pitch;
  }

  play(): boolean {
    if (!this.isLoaded) {
      console.warn(`Audio not yet loaded: ${this.path}`);
      return false;
    }
    
    // Only reset to beginning if stopped (not paused)
    if (this.isStopped() || this.audio.ended) {
      this.audio.currentTime = 0;
    }
    
    const playPromise = this.audio.play();
    if (playPromise) {
      playPromise.catch(err => {
        console.warn(`Failed to play audio "${this.path}":`, err.message);
      });
    }
    return true;
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  pause(): void {
    this.audio.pause();
  }

  resume(): boolean {
    if (this.audio.paused) {
      return this.play();
    }
    return false;
  }

  seek(position: number): void {
    this.audio.currentTime = position;
  }

  tell(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  isPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended;
  }

  isPaused(): boolean {
    return this.audio.paused && this.audio.currentTime > 0;
  }

  isStopped(): boolean {
    return this.audio.paused && this.audio.currentTime === 0;
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this._volume;
  }

  getVolume(): number {
    return this._volume;
  }

  setPitch(pitch: number): void {
    this._pitch = Math.max(0.125, Math.min(8, pitch));
    this.updatePlaybackRate();
  }

  getPitch(): number {
    return this._pitch;
  }

  setLooping(looping: boolean): void {
    this._looping = looping;
    this.audio.loop = looping;
  }

  isLooping(): boolean {
    return this._looping;
  }

  clone(): Source {
    const clone = new Source(this.path, {
      volume: this._volume,
      pitch: this._pitch,
      looping: this._looping
    });
    return clone;
  }

  getType(): 'static' | 'stream' {
    return 'static';
  }
}

export class Audio {
  private sources: Set<Source> = new Set();
  private globalVolume: number = 1;

  async newSource(path: string, type: 'static' | 'stream' = 'static'): Promise<Source> {
    const source = new Source(path);
    this.sources.add(source);
    await source.ready();
    return source;
  }

  play(source: Source): boolean {
    return source.play();
  }

  stop(source?: Source): void {
    if (source) {
      source.stop();
    } else {
      this.sources.forEach(s => s.stop());
    }
  }

  pause(source?: Source): void {
    if (source) {
      source.pause();
    } else {
      this.sources.forEach(s => {
        if (s.isPlaying()) {
          s.pause();
        }
      });
    }
  }

  resume(source?: Source): void {
    if (source) {
      source.resume();
    } else {
      this.sources.forEach(s => {
        if (s.isPaused()) {
          s.resume();
        }
      });
    }
  }

  setVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    this.sources.forEach(source => {
      const sourceVolume = source.getVolume();
      source.setVolume(sourceVolume * this.globalVolume);
    });
  }

  getVolume(): number {
    return this.globalVolume;
  }

  setPosition(x: number, y: number, z: number): void {
    // Web Audio API spatial audio not implemented in this basic version
    // Would require AudioContext and PannerNode
  }

  getActiveSourceCount(): number {
    let count = 0;
    this.sources.forEach(source => {
      if (source.isPlaying()) {
        count++;
      }
    });
    return count;
  }

  getActiveSources(): Source[] {
    const active: Source[] = [];
    this.sources.forEach(source => {
      if (source.isPlaying()) {
        active.push(source);
      }
    });
    return active;
  }
}

export const audio = new Audio();
export default audio;
