import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timer } from '../core/timer';

describe('Timer', () => {
  let timer: Timer;

  beforeEach(() => {
    timer = new Timer();
    vi.stubGlobal('performance', {
      now: vi.fn(() => 0),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('tracks delta time and total time', () => {
    timer.update(0.1);
    expect(timer.getDelta()).toBe(0.1);
    expect(timer.getTime()).toBe(0.1);

    timer.update(0.2);
    expect(timer.getDelta()).toBe(0.2);
    expect(timer.getTime()).toBeCloseTo(0.3);
  });

  it('calculates FPS', () => {
    // 60 frames in 1 second
    for (let i = 0; i < 60; i++) {
      timer.update(1 / 60);
    }
    expect(timer.getFPS()).toBe(60);
  });

  it('tracks scene time', () => {
    timer.update(1.0);
    timer.resetSceneTime();
    timer.update(0.5);
    expect(timer.getSceneTime()).toBe(0.5);
    expect(timer.getTime()).toBe(1.5);
  });

  it('handles sleep', () => {
    const mockNow = vi.fn(() => 1000);
    vi.stubGlobal('performance', { now: mockNow });

    timer.sleep(2); // Sleep for 2 seconds
    expect(timer.isSleeping()).toBe(true);

    mockNow.mockReturnValue(2000); // 1 second passed
    expect(timer.isSleeping()).toBe(true);

    mockNow.mockReturnValue(3100); // 2.1 seconds passed
    expect(timer.isSleeping()).toBe(false);
  });
});
