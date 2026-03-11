export class InputStateTracker {
  private prevState = new Set<string>();
  private currState = new Set<string>();

  update(pressedKeys: Set<string>): { justPressed: string[]; justReleased: string[] } {
    const justPressed: string[] = [];
    const justReleased: string[] = [];
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

  isDown(key: string): boolean {
    return this.currState.has(key);
  }

  justPressed(key: string): boolean {
    return !this.prevState.has(key) && this.currState.has(key);
  }

  justReleased(key: string): boolean {
    return this.prevState.has(key) && !this.currState.has(key);
  }

  clear(): void {
    this.prevState.clear();
    this.currState.clear();
  }
}
