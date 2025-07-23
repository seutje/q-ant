/* ---------- Imports ---------- */
import { gameState } from './entities.js';
import { dist, TILE, MAP_W, MAP_H, ANT_STATS, DEBUG } from './constants.js';
import { addPheromone, getPheromone } from './pheromone.js';
import * as prng from './prng.js';
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
    this.rand   = prng.default(team * 9999 + Math.random());
    this.wanderDirX = (this.rand() - 0.5) * 2;
    this.wanderDirY = (this.rand() - 0.5) * 2;
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
          if (DEBUG && this.team === 0) {
            console.log(`Worker ${this.id} (Team ${this.team}) - State: wandering`);
          }
          const nearby = resources.filter(r => !r.depleted && dist(this, r) < 15);
          if (nearby.length) {
            this.target = nearby.sort((a, b) => dist(this, a) - dist(this, b))[0];
            this.state = 'gathering';
            if (DEBUG && this.team === 0) {
              console.log(`Worker ${this.id} (Team ${this.team}) - Found sugar, transitioning to gathering.`);
            }
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
            this.wanderTicks = 0; // Reset wander ticks if following pheromone
          } else {
            // If near nest, move away
            if (dist(this, nest) < 5) {
              const dx = this.x - nest.x;
              const dy = this.y - nest.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              this.wanderDirX = dx / len;
              this.wanderDirY = dy / len;
              this.wanderTicks = Math.floor(this.rand() * 60) + 30; // Move away for a short duration
              if (DEBUG && this.team === 0) {
                console.log(`Worker ${this.id} (Team ${this.team}) - Near nest, moving away.`);
              }
            } else if (this.wanderTicks <= 0) {
              this.wanderDirX = (this.rand() - 0.5) * 2;
              this.wanderDirY = (this.rand() - 0.5) * 2;
              this.wanderTicks = Math.floor(this.rand() * 120) + 60; // Wander for 1-2 seconds (60-120 ticks)
              if (DEBUG && this.team === 0) {
                console.log(`Worker ${this.id} (Team ${this.team}) - Starting new random wander direction.`);
              }
            }
            this.move(
              this.wanderDirX * delta * this.speed,
              this.wanderDirY * delta * this.speed,
              map
            );
            this.wanderTicks--;
          }
          break;
        }

        case 'gathering': {
          if (DEBUG && this.team === 0) {
            console.log(`Worker ${this.id} (Team ${this.team}) - State: gathering`);
          }
          if (!this.target || this.target.depleted) {
            this.state = 'wandering';
            this.target = null;
            if (DEBUG && this.team === 0) {
              console.log(`Worker ${this.id} (Team ${this.team}) - Target depleted or lost, transitioning to wandering.`);
            }
            break;
          }
          if (dist(this, this.target) < 1) {
            this.carryingSugar = Math.min(this.target.amount, 10);
            this.target.amount -= this.carryingSugar;
            if (this.target.amount <= 0) this.target.depleted = true;
            this.lastSugarResource = this.target; // Store the last sugar resource
            this.state = 'returning';
            this.target = null;
            if (DEBUG && this.team === 0) {
              console.log(`Worker ${this.id} (Team ${this.team}) - Gathered sugar, transitioning to returning.`);
            }
          } else {
            this.stepToward(this.target.x, this.target.y, delta, map);
          }
          break;
        }

        case 'returning': {
          if (DEBUG && this.team === 0) {
            console.log(`Worker ${this.id} (Team ${this.team}) - State: returning`);
          }
          if (dist(this, nest) < 1) {
            gameState.teams[this.team].sugar += this.carryingSugar;
            this.carryingSugar = 0;
            if (this.lastSugarResource && !this.lastSugarResource.depleted) {
              this.state = 'returningToSugar';
              this.target = this.lastSugarResource;
              if (DEBUG && this.team === 0) {
                console.log(`Worker ${this.id} (Team ${this.team}) - Returned sugar, returning to last sugar resource.`);
              }
            } else {
              this.state = 'wandering';
              this.lastSugarResource = null;
              if (DEBUG && this.team === 0) {
                console.log(`Worker ${this.id} (Team ${this.team}) - Returned sugar, no last sugar resource, transitioning to wandering.`);
              }
            }
          } else {
            this.stepToward(nest.x, nest.y, delta, map);
            addPheromone(this.x, this.y, this.team);
          }
          break;
        }

        case 'returningToSugar': {
          if (DEBUG && this.team === 0) {
            console.log(`Worker ${this.id} (Team ${this.team}) - State: returningToSugar`);
          }
          if (!this.target || this.target.depleted) {
            this.state = 'wandering';
            this.target = null;
            this.lastSugarResource = null;
            if (DEBUG && this.team === 0) {
              console.log(`Worker ${this.id} (Team ${this.team}) - Target depleted or lost, transitioning to wandering.`);
            }
            break;
          }
          if (dist(this, this.target) < 1) {
            this.state = 'gathering';
            if (DEBUG && this.team === 0) {
              console.log(`Worker ${this.id} (Team ${this.team}) - Reached sugar resource, transitioning to gathering.`);
            }
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
          const d = dist(this, this.target);
          if (d <= this.range + 0.5) {
            this.attack(this.target);
          } else {
            this.stepToward(this.target.x, this.target.y, delta, map);
          }
        } else {
          this.target = null;
          if (dist(this, nest) > 1) {
            this.stepToward(nest.x, nest.y, delta, map);
          }
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
    if (this.type === 'defender') return; // Defender ants do not attack
    if (target.hp !== undefined) {
      const dmg = this.dmg;
      target.hp -= dmg;
      addDamageText(target.x, target.y, dmg);
    }
  }
}