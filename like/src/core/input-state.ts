export class InputStateTracker<T> {
  private prevState = new Set<T>();
  public currState = new Set<T>();

  update(pressedKeys: Set<T>): { justPressed: T[]; justReleased: T[] } {
    const justPressed: T[] = [];
    const justReleased: T[] = [];
    const nextState = new Set(pressedKeys);

    for (const key of nextState) {
      if (!this.currState.has(key)) {
        justPressed.push(key);
      }
    }

    for (const key of this.currState) {
      if (!nextState.has(key)) {
        justReleased.push(key);
      }
    }

    this.prevState = new Set(this.currState);
    this.currState = nextState;

    return { justPressed, justReleased };
  }

  isDown(key: T): boolean {
    return this.currState.has(key);
  }

  justPressed(key: T): boolean {
    return !this.prevState.has(key) && this.currState.has(key);
  }

  justReleased(key: T): boolean {
    return this.prevState.has(key) && !this.currState.has(key);
  }

  getCurrentState(): Set<T> {
    return new Set(this.currState);
  }

  clear(): void {
    this.prevState.clear();
    this.currState.clear();
  }
}
