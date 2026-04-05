import { EngineProps } from "../engine";
import type { LikeCanvasEventMap } from "../events";

export class Timer {
  private currentDelta = 0;
  private totalTime = 0;
  private frameCount = 0;
  private fps = 0;
  private fpsAccumulator = 0;

  constructor(props: EngineProps<never>) {
    props.canvas.addEventListener("like:update", this.update.bind(this), { signal: props.abort })
  }

  private update({detail: {dt}}: LikeCanvasEventMap["like:update"]): void {
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
}
