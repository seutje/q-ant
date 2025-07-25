import { Ant } from '../src/js/ant.js';
import { gameState } from '../src/js/entities.js';

test('ant attack does not reduce hp below zero', () => {
  const attacker = new Ant('private', 0, 0, 0);
  const target = new Ant('worker', 1, 0, 0);
  target.hp = 2;
  attacker.attack(target);
  expect(target.hp).toBe(0);
});
