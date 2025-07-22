import { gameState } from './entities.js';
import { dist, TILE } from './utils.js';
import { addPheromone, getPheromone } from './pheromone.js';
import mulberry32 from './prng.js';

const SPEED = 0.03; // cells per ms

export class Ant {
  constructor(type, team, x, y) {
    this.type = type;     // 'worker', 'queen', etc.
    this.team = team;
    this.x = x;
    this.y = y;
    this.carryingSugar = 0;
    this.state = type === 'queen' ? 'idle' : 'wandering';
    this.target = null;
    this.rand = mulberry32(team * 9999 + Date.now());
  }

  update(delta, map, resources) {
    if (this.type === 'queen') return;

    const nest = gameState.teams[this.team].queen;

    switch (this.state) {
      case 'wandering': {
        // find nearest unseen sugar
        const nearby = resources.filter(r => !r.depleted && dist(this, r) < 15);
        if (nearby.length) {
          this.target = nearby.sort((a, b) => dist(this, a) - dist(this, b))[0];
          this.state = 'gathering';
          break;
        }

        // follow pheromone or random
        let best = null, bestScore = 0;
        for (let a = 0; a < 8; a++) {
          const ang = Math.PI * 2 * a / 8;
          const dx = Math.cos(ang) * 2;
          const dy = Math.sin(ang) * 2;
          const score = getPheromone(this.x + dx, this.y + dy, this.team);
          if (score > bestScore) { bestScore = score; best = { dx, dy }; }
        }
        if (best) {
          this.move(best.dx * delta, best.dy * delta, map);
        } else {
          this.move(
            (this.rand() - 0.5) * 2 * delta * SPEED,
            (this.rand() - 0.5) * 2 * delta * SPEED,
            map
          );
        }
        break;
      }

      case 'gathering': {
        if (dist(this, this.target) < 1) {
          this.carryingSugar = Math.min(this.target.amount, 10);
          this.target.amount -= this.carryingSugar;
          if (this.target.amount <= 0) this.target.depleted = true;
          this.state = 'returning';
          this.target = null;
        } else {
          this.stepToward(this.target.x, this.target.y, delta, map);
        }
        break;
      }

      case 'returning': {
        if (dist(this, nest) < 1) {
          gameState.teams[this.team].sugar += this.carryingSugar;
          this.carryingSugar = 0;
          this.state = 'wandering';
        } else {
          this.stepToward(nest.x, nest.y, delta, map);
          addPheromone(this.x, this.y, this.team);
        }
        break;
      }
    }
  }

  move(dx, dy, map) {
    this.x = Math.max(0.5, Math.min(99.5, this.x + dx));
    this.y = Math.max(0.5, Math.min(74.5, this.y + dy));
  }

  stepToward(tx, ty, delta, map) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    this.move(dx / len * delta * SPEED, dy / len * delta * SPEED, map);
  }
}