/* ---------- Imports ---------- */
import { gameState } from './entities.js';
import { dist, TILE, MAP_W, MAP_H, ANT_STATS } from './constants.js';
import { addPheromone, getPheromone } from './pheromone.js';
import mulberry32 from './prng.js';
import { addDamageText } from './fx.js';

export class Ant {
  constructor(type, team, x, y) {
    this.type   = type;
    this.team   = team;
    this.x      = x;
    this.y      = y;

    // copy stats from constants
    Object.assign(this, ANT_STATS[type]);
    this.maxHp  = this.hp;
    this.carryingSugar = 0;
    this.state  = type === 'queen' ? 'idle'
                : type === 'worker' ? 'wandering'
                : 'defending';
    this.target = null;
    this.rand   = mulberry32(team * 9999 + Math.random());
    this.lastSugarResource = null;
  }

  /* ---------- Main update ---------- */
  update(delta, map, resources) {
    if (this.hp <= 0) { this.dead = true; return; }

    const nest = gameState.teams[this.team].queen;

    /* ---------- Worker FSM ---------- */
    if (this.type === 'worker') {
      switch (this.state) {
        case 'wandering': {
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
            this.move(best.dx * delta * this.speed, best.dy * delta * this.speed, map);
          } else {
            this.move(
              (this.rand() - 0.5) * 2 * delta * this.speed,
              (this.rand() - 0.5) * 2 * delta * this.speed,
              map
            );
          }
          break;
        }

        case 'gathering': {
          if (!this.target || this.target.depleted) {
            this.state = 'wandering';
            this.target = null;
            break;
          }
          if (dist(this, this.target) < 1) {
            this.carryingSugar = Math.min(this.target.amount, 10);
            this.target.amount -= this.carryingSugar;
            if (this.target.amount <= 0) this.target.depleted = true;
            this.lastSugarResource = this.target; // Store the last sugar resource
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
            if (this.lastSugarResource && !this.lastSugarResource.depleted) {
              this.state = 'returningToSugar';
              this.target = this.lastSugarResource;
            } else {
              this.state = 'wandering';
              this.lastSugarResource = null;
            }
          } else {
            this.stepToward(nest.x, nest.y, delta, map);
            addPheromone(this.x, this.y, this.team);
          }
          break;
        }

        case 'returningToSugar': {
          if (!this.target || this.target.depleted) {
            this.state = 'wandering';
            this.target = null;
            this.lastSugarResource = null;
            break;
          }
          if (dist(this, this.target) < 1) {
            this.state = 'gathering';
          } else {
            this.stepToward(this.target.x, this.target.y, delta, map);
          }
          break;
        }
      }
      return;
    }

    /* ---------- Queen ---------- */
    if (this.type === 'queen') {
      // Queens are stationary; nothing to do
      return;
    }

    /* ---------- Soldier ---------- */
    const enemyAnts = gameState.ants.filter(a => a.team !== this.team && !a.dead);
    const enemyQueen = gameState.teams.find(t => t.id !== this.team)?.queen;

    switch (this.state) {
      case 'defending': {
        const inRange = enemyAnts.filter(a => dist(a, nest) <= 20);
        if (inRange.length) {
          this.target = inRange[0];
          this.state = 'attacking';
        }
        break;
      }
      case 'attacking': {
        if (!this.target || this.target.dead) {
          this.target = enemyAnts.length
            ? enemyAnts.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b)
            : enemyQueen;
        }
        if (!this.target) break;
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

  /* ---------- Low-level movement ---------- */
  move(dx, dy, map) {
    this.x = Math.max(0.5, Math.min(MAP_W - 0.5, this.x + dx));
    this.y = Math.max(0.5, Math.min(MAP_H - 0.5, this.y + dy));
  }

  stepToward(tx, ty, delta, map) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    this.move(dx / len * delta * this.speed, dy / len * delta * this.speed, map);
  }

  attack(target) {
    if (target.hp !== undefined) {
      const dmg = this.dmg;
      target.hp -= dmg;
      addDamageText(target.x, target.y, dmg);
    }
  }
}