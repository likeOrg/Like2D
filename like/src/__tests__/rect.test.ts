// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import { describe, it, expect } from 'vitest';
import { Rect } from '../math/rect';

describe('Rect', () => {
  it('creates a rect from points', () => {
    expect(Rect.fromPoints([10, 20], [30, 40])).toEqual([10, 20, 20, 20]);
    expect(Rect.fromPoints([30, 40], [10, 20])).toEqual([10, 20, 20, 20]);
  });

  it('creates a rect from center and size', () => {
    expect(Rect.fromCenter([100, 100], [50, 50])).toEqual([75, 75, 50, 50]);
  });

  it('gets position of a rect', () => {
    expect(Rect.position([10, 20, 30, 40])).toEqual([10, 20]);
  });

  it('gets size of a rect', () => {
    expect(Rect.size([10, 20, 30, 40])).toEqual([30, 40]);
  });

  it('gets center of a rect', () => {
    expect(Rect.center([10, 20, 40, 60])).toEqual([30, 50]);
  });

  it('gets topLeft, topRight, bottomLeft, bottomRight corners', () => {
    const r: [number, number, number, number] = [10, 20, 30, 40];
    expect(Rect.topLeft(r)).toEqual([10, 20]);
    expect(Rect.topRight(r)).toEqual([40, 20]);
    expect(Rect.bottomLeft(r)).toEqual([10, 60]);
    expect(Rect.bottomRight(r)).toEqual([40, 60]);
  });

  it('calculates the area', () => {
    expect(Rect.area([0, 0, 10, 10])).toBe(100);
  });

  it('checks if a rect is empty', () => {
    expect(Rect.isEmpty([0, 0, 0, 10])).toBe(true);
    expect(Rect.isEmpty([0, 0, 10, 0])).toBe(true);
    expect(Rect.isEmpty([0, 0, 10, 10])).toBe(false);
  });

  it('checks if a point is contained', () => {
    const r: [number, number, number, number] = [0, 0, 10, 10];
    expect(Rect.containsPoint(r, [5, 5])).toBe(true);
    expect(Rect.containsPoint(r, [0, 0])).toBe(true);
    expect(Rect.containsPoint(r, [10, 10])).toBe(true);
    expect(Rect.containsPoint(r, [-1, 5])).toBe(false);
    expect(Rect.containsPoint(r, [11, 5])).toBe(false);
  });

  it('checks if a rect is contained', () => {
    const r: [number, number, number, number] = [0, 0, 10, 10];
    expect(Rect.containsRect(r, [1, 1, 5, 5])).toBe(true);
    expect(Rect.containsRect(r, [0, 0, 10, 10])).toBe(true);
    expect(Rect.containsRect(r, [-1, -1, 5, 5])).toBe(false);
  });

  it('checks for intersection', () => {
    const r1: [number, number, number, number] = [0, 0, 10, 10];
    const r2: [number, number, number, number] = [5, 5, 10, 10];
    const r3: [number, number, number, number] = [20, 20, 10, 10];
    expect(Rect.intersects(r1, r2)).toBe(true);
    expect(Rect.intersects(r1, r3)).toBe(false);
  });

  it('calculates intersection rect', () => {
    const r1: [number, number, number, number] = [0, 0, 10, 10];
    const r2: [number, number, number, number] = [5, 5, 10, 10];
    const r3: [number, number, number, number] = [20, 20, 10, 10];
    expect(Rect.intersection(r1, r2)).toEqual([5, 5, 5, 5]);
    expect(Rect.intersection(r1, r3)).toEqual([0, 0, 0, 0]);
  });

  it('calculates union rect', () => {
    const r1: [number, number, number, number] = [0, 0, 10, 10];
    const r2: [number, number, number, number] = [5, 5, 10, 10];
    expect(Rect.union(r1, r2)).toEqual([0, 0, 15, 15]);
  });

  it('inflates a rect', () => {
    expect(Rect.inflate([10, 10, 20, 20], 5)).toEqual([5, 5, 30, 30]);
  });

  it('offsets a rect', () => {
    expect(Rect.offset([10, 10, 20, 20], [5, 5])).toEqual([15, 15, 20, 20]);
  });

  it('sets the position', () => {
    expect(Rect.setPosition([10, 10, 20, 20], [30, 40])).toEqual([30, 40, 20, 20]);
  });

  it('sets the size', () => {
    expect(Rect.setSize([10, 10, 20, 20], [30, 40])).toEqual([10, 10, 30, 40]);
  });

  it('sets the center', () => {
    expect(Rect.setCenter([0, 0, 20, 20], [100, 100])).toEqual([90, 90, 20, 20]);
  });
});
