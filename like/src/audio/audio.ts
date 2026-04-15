/**
 *  The current state of a playing (or paused) channel.
 */
export type ChannelState = {
  index: number,
  // affects speed and pitch both
  speed: number,
  // multiplied by global volume
  volume: number,
  // seek position; equivalent to `tell`
  seek: number,
  loop: boolean,
}

/**
 * A decoded audio resource. Create with {@link Audio.load}.
 *
 * Pretends to be synchronous: you _can_ play it before loading,
 * and LĨKE will do its best to maintain timings.
 */
export class Wave {
  // resolves when loaded.
  readonly ready: Promise<void>;
  // check this field if loading fails.
  public error?: any;

  /**
    Escape hatch:
    - Yes you can see the underlying decoded buffer.
    - No you can't rely on this working the same way forever.
  */
  public buffer?: AudioBuffer;

  constructor(readonly path: string, context: AudioContext) {
    this.ready = new Promise(async (resolve, reject) => {
      try {
        const file = await fetch(this.path);
        const arrBuf = await file.arrayBuffer();
        this.buffer = await context.decodeAudioData(arrBuf);
        resolve();
      } catch (err) {
        this.error = err;
        reject(err);
      }
    })
  }

  isReady(): boolean {
    return !!this.buffer;
  }

  getDuration(): number | null {
    return this.buffer?.duration ?? null;
  }
}

type Channel = {
  state: ChannelState,
  lastUpdate: number,
  defer: boolean,
  sourceNode?: AudioBufferSourceNode,
  buffer?: AudioBuffer,
  gainNode?: GainNode,
  path: string,
}

/**
 * The audio subsystem.
 *
 * Create with `like.audio`. Manages {@link Wave} resources and playback channels.
 */
export class Audio {
  private context: AudioContext;
  private masterGain: GainNode;
  private channels: (Channel | undefined)[] = new Array(1);
  private globalVolume = 1;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }

  /**
   * Load a sound file into a {@link Wave}.
   *
   * Save this wave and reuse it! Construction is slow and expensive.
   * Avoid loading large files (>5 minutes) to avoid using excess memory.
   *
   * To unload a wave file, simply drop all references to it so the
   * garbage collector can clear it out.
   *
   * Use promise `Wave.ready` or check `Wave.isReady` to know that it
   * has finished loading.
   */
  loadWave(path: string): Wave {
    return new Wave(path, this.context);
  }

  /**
   * Play a wave.
   *
   * If `options.channel` is set, this will overwrite the playback
   * state of the previous channel. Otherwise, it allocates a new one.
   *
   * If the wave is not loaded, LÏKE will begin playing when it is
   * loaded. This does not cause delay, but it may cause cut-in.
   *
   * @param wave use {@link loadWave}
   * @param options Playback options (volume, speed, seek, loop)
   * @returns The index of the active channel (starting at 1),
   *          unless the wave file failed to load.
   */
  play(wave: Wave, options: Partial<ChannelState> = {}): number | null {
    if (wave.error) return null;
    const buffer = wave.buffer;

    const channel: Channel = {
      state: {
        speed: 1,
        seek: 0,
        volume: 1,
        index: this.channels.length,
        loop: false,
        ...options,
      },
      path: wave.path,
      defer: !wave.buffer,
      lastUpdate: this.context.currentTime,
    }
    const index = channel.state.index;
    this.stop(index);
    this.channels[channel.state.index] = channel;

    if (buffer) {
      this.startPlayback(channel, buffer);
    } else {
      wave.ready.then(() => {
        const ch = this.channels[channel.state.index];
        if (wave.buffer && ch === channel) {
          this.startPlayback(ch, wave.buffer)
        }
      })
    }
    return channel.state.index;
  }

  /**
   *  Update a playing channel.
   *
   *  If the channel's wave is not-yet-loaded / not-yet-playing,
   *  we make a best effort
   *  to synchronize state as if it had been playing this whole time.
   */
  update(params: Partial<ChannelState> & { index: number }) {
    const channel = this.channels[params.index];
    if (!channel) return; // fail silently
    const state = channel.state;
    const next: ChannelState = {
      ...state,
      ...params,
    }

    // may be used for catch-up
    const elapsed = this.elapsed(channel);
    next.seek += elapsed;
    channel.lastUpdate = this.context.currentTime;

    if (channel.sourceNode && channel.gainNode) {
      // OK, we're loaded!
      channel.sourceNode.loop = next.loop;
      channel.sourceNode.playbackRate.value = next.speed;
      channel.gainNode.gain.value = next.volume;

      if (channel.defer) {
        // Time to play catch-up
        channel.defer = false;
        const duration = channel.sourceNode.buffer!.duration;
        next.seek += elapsed;
        if (!state.loop && next.seek > duration) {
          // Oh, it ended already...
          delete this.channels[state.index];
          return;
        }
      }

      if (channel.sourceNode) {
        if (next.loop) {
          channel.sourceNode.onended = null;
        } else {
          channel.sourceNode.onended = () => {
            delete this.channels[state.index];
          };
        }
      }
    }
    channel.state = next;
  }

  /** Get the time elapsed since the last time the state was updated. */
  private elapsed(ch: Channel) {
      return (this.context.currentTime - ch.lastUpdate) * ch.state.speed
  }

  private startPlayback(channel: Channel, buf: AudioBuffer) {
    channel.buffer = buf;
    channel.gainNode = this.context.createGain();
    channel.sourceNode = this.context.createBufferSource();
    channel.sourceNode.buffer = buf;
    channel.sourceNode.connect(channel.gainNode);
    channel.gainNode.connect(this.masterGain);
    channel.sourceNode.start()
    this.update({ index: channel.state.index });
  }

  /** Stop a playing channel and deallocate it. */
  stop(channel: number): void {
    const ch = this.channels[channel];
    if (ch?.sourceNode) {
      ch.sourceNode.stop(0);
    }
    delete this.channels[channel];
  }

  /** Get play state for every active channel */
  active(): ChannelState[] {
    return this.channels
      .map((ch) => ch && this.status(ch.state.index))
      .filter(ch => !!ch);
  }

  status(channel: number): ChannelState | undefined {
    const ch = this.channels[channel];
    if (ch) {
      return {
        ...ch.state,
        seek: ch.state.seek + this.elapsed(ch),
      }
    }
    return;
  }

  tell(channel: number): number | undefined {
    return this.status(channel)?.seek ?? undefined;
  }

  /** Stop all playing channels. */
  stopAll(): void {
    this.channels.forEach(c => c && this.stop(c.state.index));
    this.channels = Array(1);
  }

  /** Stop all channels playing a specific wave. */
  stopWave(wave: Wave): void {
    for (const ch of this.channels) {
      if (ch && ch.path == wave.path) {
        this.stop(ch.state.index);
      }
    }
  }

  setGlobalVolume(volume: number): void {
    this.globalVolume = volume;
    this.masterGain.gain.value = volume;
  }

  /** Get global volume. */
  getGlobalVolume(): number {
    return this.globalVolume;
  }

  /** Get audio context (escape hatch).
   *  Not guaranteed to work the same way in future versions.
   */
  getContext(): AudioContext {
    return this.context;
  }
}
