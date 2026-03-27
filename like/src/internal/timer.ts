export class TimerInternal {
  private currentDelta = 0;
  private totalTime = 0;
  private frameCount = 0;
  private fps = 0;
  private fpsAccumulator = 0;
  private sleepUntil: number | null = null;

  _update(dt: number): void {
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

  getDelta(): number {
    return this.currentDelta;
  }

  getFPS(): number {
    return this.fps;
  }

  getTime(): number {
    return this.totalTime;
  }

  isSleeping(): boolean {
    if (this.sleepUntil === null) return false;
    const currentTime = performance.now();
    if (currentTime < this.sleepUntil) {
      return true;
    }
    this.sleepUntil = null;
    return false;
  }

  sleep(duration: number): void {
    this.sleepUntil = performance.now() + (duration * 1000);
  }
}
