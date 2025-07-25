import { dist, clamp } from '../src/js/constants.js';

test('dist calculates Euclidean distance', () => {
  expect(dist({x:0, y:0}, {x:3, y:4})).toBe(5);
});

test('clamp limits values within range', () => {
  expect(clamp(5, 1, 4)).toBe(4);
  expect(clamp(-1, 0, 10)).toBe(0);
  expect(clamp(5, 0, 10)).toBe(5);
});
