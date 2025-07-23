import { gameState } from './entities.js';

export function cleanupDead() {
  gameState.ants = gameState.ants.filter(a => {
    if (a.dead) {
      if (!gameState.deadAnts) gameState.deadAnts = [0, 0, 0, 0];
      gameState.deadAnts[a.team] = (gameState.deadAnts[a.team] || 0) + 1;
      return false;
    }
    return true;
  });
}