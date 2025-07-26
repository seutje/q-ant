import { Ant } from '../src/js/ant.js';
import { gameState } from '../src/js/entities.js';

test('ant attack does not reduce hp below zero', () => {
  const attacker = new Ant('private', 0, 0, 0);
  const target = new Ant('worker', 1, 0, 0);
  target.hp = 2;
  attacker.attack(target);
  expect(target.hp).toBe(0);
});

test('ant faces target when attacking', () => {
  gameState.ants = [];
  const attacker = new Ant('private', 0, 0, 0);
  const target = new Ant('worker', 1, 0.8, 0);
  gameState.ants.push(attacker, target);
  attacker.state = 'defending';
  attacker.target = target;

  attacker.update(1, [], []);

  const expectedDir = Math.atan2(target.y - attacker.y, target.x - attacker.x);
  expect(attacker.dir).toBeCloseTo(expectedDir);
});
