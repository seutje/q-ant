import { gameState } from './entities.js';
import { MAP_W, MAP_H } from './constants.js';

const GRID = Array.from({ length: MAP_H }, () =>
  Array.from({ length: MAP_W }, () => [0, 0, 0, 0]) // 4 teams
);

export function addPheromone(x, y, team) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
  GRID[y][x][team] = Math.min(GRID[y][x][team] + 1, 10);
}

export function getPheromone(x, y, team) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return 0;
  return GRID[y][x][team];
}

export function updatePheromones(delta) {
  const decay = 0.02 * delta / 16;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      for (let t = 0; t < 4; t++) {
        GRID[y][x][t] = Math.max(0, GRID[y][x][t] - decay);
      }
    }
  }
}