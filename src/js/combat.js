import { gameState } from './entities.js';

export function cleanupDead() {
  gameState.ants = gameState.ants.filter(a => !a.dead);
}