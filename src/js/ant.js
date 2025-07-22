import { gameState } from './entities.js';
import { dist } from './utils.js';
import { addPheromone } from './pheromone.js';
import mulberry32 from './prng.js';
import { ANT_STATS } from './constants.js';

export class Ant {
  constructor(type, team, x, y) {
    this.type  = type;
    this.team  = team;
    this.x     = x;
    this.y     = y;
    Object.assign(this, ANT_STATS[type]); // hp,dmg,range,speed
    this.maxHp = this.hp;
    this.state = type === 'queen' ? 'idle'
               : type === 'worker' ? 'wandering'
               : 'defending'; // soldiers start defending
    this.target = null;
    this.rand   = mulberry32(team * 9999 + Math.random());
  }

  update(delta, map, resources) {
    if (this.type === 'queen') return;
    if (this.hp <= 0) { this.dead = true; return; }

    const nest = gameState.teams[this.team].queen;

    /* ---------- Worker behavior (unchanged) ---------- */
    if (this.type === 'worker') {
      // ... same code as before ...
      return;
    }

    /* ---------- Soldier behavior ---------- */
    const enemyAnts = gameState.ants.filter(a => a.team !== this.team && !a.dead);
    const enemyQueen = gameState.teams.find(t => t.id !== this.team).queen;

    switch (this.state) {
      case 'defending': {
        // attack any enemy within range of the nest
        const inRange = enemyAnts.filter(a => dist(a, nest) <= 20);
        if (inRange.length) {
          this.target = inRange[0];
          this.state = 'attacking';
        }
        break;
      }
      case 'attacking': {
        if (!this.target || this.target.dead) {
          // pick new closest enemy or march toward enemy queen
          this.target = enemyAnts.length
            ? enemyAnts.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b)
            : enemyQueen;
        }

        if (!this.target) break; // should never happen
        const d = dist(this, this.target);
        if (d <= this.range + 0.5) {
          this.attack(this.target);
        } else {
          this.stepToward(this.target.x, this.target.y, delta, map);
        }
        break;
      }
    }
  }

  /* ---------- Utility methods ---------- */
  attack(target) {
    if (target.hp !== undefined) {
      target.hp -= this.dmg;
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
    this.move(dx / len * delta * this.speed, dy / len * delta * this.speed, map);
  }
}