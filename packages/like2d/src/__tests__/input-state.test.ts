import { describe, it, expect } from 'vitest';
import { InputStateTracker } from '../core/input-state';

describe('InputStateTracker', () => {
  it('tracks key states', () => {
    const tracker = new InputStateTracker<string>();

    // No keys pressed initially
    expect(tracker.isDown('KeyA')).toBe(false);

    // KeyA pressed
    tracker.update(new Set(['KeyA']));
    expect(tracker.isDown('KeyA')).toBe(true);
    expect(tracker.justPressed('KeyA')).toBe(true);

    // Next frame, KeyA still pressed
    tracker.update(new Set(['KeyA']));
    expect(tracker.isDown('KeyA')).toBe(true);
    expect(tracker.justPressed('KeyA')).toBe(false);

    // KeyA released
    tracker.update(new Set());
    expect(tracker.isDown('KeyA')).toBe(false);
    expect(tracker.justReleased('KeyA')).toBe(true);
  });

  it('reports justPressed and justReleased in update result', () => {
    const tracker = new InputStateTracker<string>();

    const r1 = tracker.update(new Set(['KeyA', 'KeyB']));
    expect(r1.justPressed).toEqual(['KeyA', 'KeyB']);
    expect(r1.justReleased).toEqual([]);

    const r2 = tracker.update(new Set(['KeyB', 'KeyC']));
    expect(r2.justPressed).toEqual(['KeyC']);
    expect(r2.justReleased).toEqual(['KeyA']);
  });

  it('clears state', () => {
    const tracker = new InputStateTracker<string>();
    tracker.update(new Set(['KeyA']));
    tracker.clear();
    expect(tracker.isDown('KeyA')).toBe(false);
  });
});
