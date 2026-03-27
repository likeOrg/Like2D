import { EngineProps } from "../engine";

export class Timer {
  private currentDelta = 0;
  private totalTime = 0;
  private frameCount = 0;
  private fps = 0;
  private fpsAccumulator = 0;
  private sleepUntil: number | null = null;

  constructor(props: EngineProps<never>) {
    props.canvas.addEventListener("like:update", this.update.bind(this), { signal: props.abort })
  }

  private update(ev: HTMLElementEventMap["like:update"]): void {
    const {dt} = ev.detail;
    this.currentDelta = dt;
    this.totalTime += dt;
    this.frameCount++;
    this.fpsAccumulator += dt;

    if (this.fpsAccumulator >= 1) {
      this.fps = Math.round(this.frameCount / this.fpsAccumulator);
      this.frameCount = 0;
      this.fpsAccumulator = 0;
    }
  }

  /** Get `dt` (from the update loop) anywhere.
   * AKA the time since the last frame.
   */
  getDelta(): number {
    return this.currentDelta;
  }

  /** Get an estimated FPS based on one-second average. */
  getFPS(): number {
    return this.fps;
  }

  /** Get the ingame time. */
  getTime(): number {
    return this.totalTime;
  }

  /**
   * Whether or not the game is (supposed to be) frozen.
   * The only callback while sleeping is `draw`, and
   * calling this outside of `draw` will always return
   * false -- except if you have a custom runtime.
   */
  isSleeping(): boolean {
    if (this.sleepUntil === null) return false;
    const currentTime = performance.now();
    if (currentTime < this.sleepUntil) {
      return true;
    }
    this.sleepUntil = null;
    return false;
  }

  /**
   * Freeze the whole game for a time. Audio will keep playing,
   * but update functions won't be called and events won't fire.
   */
  sleep(duration: number): void {
    this.sleepUntil = performance.now() + (duration * 1000);
  }
}