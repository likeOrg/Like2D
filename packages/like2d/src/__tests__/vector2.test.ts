import { describe, it, expect } from 'vitest';
import { Vec2 } from '../core/vector2';

describe('Vec2', () => {
  it('adds two vectors', () => {
    expect(Vec2.add([1, 2], [3, 4])).toEqual([4, 6]);
  });

  it('subtracts two vectors', () => {
    expect(Vec2.sub([10, 5], [3, 2])).toEqual([7, 3]);
  });

  it('multiplies a vector by a number', () => {
    expect(Vec2.mul([2, 3], 3)).toEqual([6, 9]);
  });

  it('multiplies a vector by another vector', () => {
    expect(Vec2.mul([2, 3], [4, 5])).toEqual([8, 15]);
  });

  it('divides a vector by a number', () => {
    expect(Vec2.div([6, 9], 3)).toEqual([2, 3]);
  });

  it('divides a vector by another vector', () => {
    expect(Vec2.div([8, 15], [4, 5])).toEqual([2, 3]);
  });

  it('calculates the dot product', () => {
    expect(Vec2.dot([1, 2], [3, 4])).toBe(11);
  });

  it('calculates the cross product', () => {
    expect(Vec2.cross([1, 2], [3, 4])).toBe(-2);
  });

  it('calculates the length squared', () => {
    expect(Vec2.lengthSq([3, 4])).toBe(25);
  });

  it('calculates the length', () => {
    expect(Vec2.length([3, 4])).toBe(5);
  });

  it('normalizes a vector', () => {
    const v = Vec2.normalize([3, 4]);
    expect(v[0]).toBeCloseTo(0.6);
    expect(v[1]).toBeCloseTo(0.8);
  });

  it('normalizes a zero vector', () => {
    expect(Vec2.normalize([0, 0])).toEqual([0, 0]);
  });

  it('calculates distance between vectors', () => {
    expect(Vec2.distance([1, 1], [4, 5])).toBe(5);
  });

  it('linearly interpolates between vectors', () => {
    expect(Vec2.lerp([0, 0], [10, 20], 0.5)).toEqual([5, 10]);
  });

  it('calculates the angle of a vector', () => {
    expect(Vec2.angle([1, 0])).toBe(0);
    expect(Vec2.angle([0, 1])).toBe(Math.PI / 2);
  });

  it('rotates a vector', () => {
    const v = Vec2.rotate([1, 0], Math.PI / 2);
    expect(v[0]).toBeCloseTo(0);
    expect(v[1]).toBeCloseTo(1);
  });

  it('negates a vector', () => {
    expect(Vec2.negate([1, -2])).toEqual([-1, 2]);
  });

  it('floors a vector', () => {
    expect(Vec2.floor([1.2, 2.9])).toEqual([1, 2]);
  });

  it('ceils a vector', () => {
    expect(Vec2.ceil([1.2, 2.1])).toEqual([2, 3]);
  });

  it('rounds a vector', () => {
    expect(Vec2.round([1.2, 2.9])).toEqual([1, 3]);
  });

  it('calculates min of two vectors', () => {
    expect(Vec2.min([1, 5], [3, 2])).toEqual([1, 2]);
  });

  it('calculates max of two vectors', () => {
    expect(Vec2.max([1, 5], [3, 2])).toEqual([3, 5]);
  });

  it('clamps a vector', () => {
    expect(Vec2.clamp([5, 5], [0, 0], [2, 2])).toEqual([2, 2]);
    expect(Vec2.clamp([-5, -5], [0, 0], [2, 2])).toEqual([0, 0]);
    expect(Vec2.clamp([1, 1], [0, 0], [2, 2])).toEqual([1, 1]);
  });

  it('creates vector from angle', () => {
    const v = Vec2.fromAngle(Math.PI / 2, 10);
    expect(v[0]).toBeCloseTo(0);
    expect(v[1]).toBeCloseTo(10);
  });

  it('returns zero vector', () => {
    expect(Vec2.zero()).toEqual([0, 0]);
  });
});
