import { bench, describe } from 'vitest';
import { Vec2, type Vector2 } from '../math/vector2';

const VEC2_COUNT = 10000;

function makeVec2s(count: number): Vector2[] {
  const vec2s: Vector2[] = [];
  for (let i = 0; i < count; i++) {
    vec2s.push([Math.random() * 1000, Math.random() * 1000]);
  }
  return vec2s;
}

describe('Vector2', () => {
  const a = makeVec2s(VEC2_COUNT);
  const b = makeVec2s(VEC2_COUNT);

  describe('binary operations', () => {
    bench('add', () => {
      let sum = 0;
      for (let i = 0; i < VEC2_COUNT; i++) {
        const result = Vec2.add(a[i], b[i]);
        sum += result[0];
      }
      if (sum === -1) console.log(sum);
    });

    bench('sub', () => {
      let sum = 0;
      for (let i = 0; i < VEC2_COUNT; i++) {
        const result = Vec2.sub(a[i], b[i]);
        sum += result[0];
      }
      if (sum === -1) console.log(sum);
    });

    bench('mul', () => {
      let sum = 0;
      for (let i = 0; i < VEC2_COUNT; i++) {
        const result = Vec2.mul(a[i], b[i]);
        sum += result[0];
      }
      if (sum === -1) console.log(sum);
    });

    bench('div', () => {
      let sum = 0;
      for (let i = 0; i < VEC2_COUNT; i++) {
        const result = Vec2.div(a[i], b[i]);
        sum += result[0];
      }
      if (sum === -1) console.log(sum);
    });

    bench('dot', () => {
      let sum = 0;
      for (let i = 0; i < VEC2_COUNT; i++) {
        const result = Vec2.dot(a[i], b[i]);
        sum += result;
      }
      if (sum === -1) console.log(sum);
    });

    bench('chained ops (add, sub, mul, div, dot)', () => {
      let sum = 0;
      for (let i = 0; i < VEC2_COUNT; i++) {
        const r1 = Vec2.add(a[i], b[i]);
        const r2 = Vec2.sub(r1, a[i]);
        const r3 = Vec2.mul(r2, 2);
        const r4 = Vec2.div(r3, b[i]);
        const result = Vec2.dot(r4, a[i]);
        sum += result;
      }
      if (sum === -1) console.log(sum);
    });
  });
});
