/* ---------- Imports ---------- */
import { gameState } from './entities.js';
import { dist, TILE, MAP_W, MAP_H, ANT_STATS, DEBUG, TEAM_COLORS } from './constants.js';
import { addPheromone, getPheromone } from './pheromone.js';
import * as prng from './prng.js';
import { addDamageText } from './fx.js';

export class Ant {
  static nextId = 0;

  constructor(type, team, x, y) {
    this.id = Ant.nextId++;
    this.type   = type;
    this.team   = team;
    this.x      = x;
    this.y      = y;
    this.dir    = Math.PI / 2; // default facing downward

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
    this.lastAttackTime = 0;

    // track total ants spawned
    if (!gameState.totalAnts) gameState.totalAnts = [{}, {}, {}, {}];
    const totals = gameState.totalAnts[team];
    totals[type] = (totals[type] || 0) + 1;
  }

  /* ---------- Main update ---------- */
  update(delta, map, resources) {
    if (this.hp <= 0) { this.dead = true; return; }

    const nest = gameState.teams[this.team].queen;

    /* ---------- Queen ---------- */
    if (this.type === 'queen') {
      // Queens are stationary; nothing to do
      return;
    }

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
          let bestAngle = this.rand() * Math.PI * 2; // Start with a random angle

          if (!this.lastSugarResource) { // Only follow pheromones if not just returned from a sugar resource
            for (let a = 0; a < 8; a++) {
              const ang = Math.PI * 2 * a / 8;
              const dx = Math.cos(ang) * 2;
              const dy = Math.sin(ang) * 2;
              const score = getPheromone(this.x + dx, this.y + dy, this.team);
              if (score > bestScore) { bestScore = score; best = { dx, dy }; bestAngle = ang; }
            }
          }

          if (best) {
            // Move slightly towards the best pheromone direction, but also add some randomness
            const currentAngle = Math.atan2(this.wanderDirY, this.wanderDirX);
            const newAngle = currentAngle * 0.8 + bestAngle * 0.2 + (this.rand() - 0.5) * 0.5; // Blend and add noise
            this.wanderDirX = Math.cos(newAngle);
            this.wanderDirY = Math.sin(newAngle);
            this.move(this.wanderDirX * delta * this.speed, this.wanderDirY * delta * this.speed, map);
            this.wanderTicks = 0; // Reset wander ticks if following pheromone
          } else {
            if (this.wanderTicks <= 0 || this.lastSugarResource) { // Force new wander direction if just returned from sugar
              this.wanderDirX = (this.rand() - 0.5) * 2;
              this.wanderDirY = (this.rand() - 0.5) * 2;
              this.wanderTicks = Math.floor(this.rand() * 120) + 60; // Wander for 1-2 seconds (60-120 ticks)
              this.lastSugarResource = null; // Clear last sugar resource after starting to wander
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
            if (this.lastSugarResource) {
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
          // If target is invalid (e.g., null), transition to wandering from current location
          if (!this.target) {
            this.state = 'wandering';
            this.lastSugarResource = null; // Clear last sugar resource
            if (DEBUG && this.team === 0) {
              console.log(`Worker ${this.id} (Team ${this.team}) - Target lost, transitioning to wandering.`);
            }
            break;
          }

          // If reached the target location
          if (dist(this, this.target) < 1) {
            if (this.target.depleted) {
              // If resource is depleted, transition to wandering from this location
              this.state = 'wandering';
              this.target = null; // Clear target
              this.lastSugarResource = null; // Clear last sugar resource
              if (DEBUG && this.team === 0) {
                console.log(`Worker ${this.id} (Team ${this.team}) - Reached depleted sugar resource, transitioning to wandering.`);
              }
            } else {
              // If resource is not depleted, transition to gathering
              this.state = 'gathering';
              if (DEBUG && this.team === 0) {
                console.log(`Worker ${this.id} (Team ${this.team}) - Reached sugar resource, transitioning to gathering.`);
              }
            }
          } else {
            // Otherwise, keep moving towards the target
            this.stepToward(this.target.x, this.target.y, delta, map);
          }
          break;
        }
      }
      return;
    }

    /* ---------- Soldier ---------- */
    const enemyAnts = gameState.ants.filter(a => a.team !== this.team && !a.dead);
    const enemyQueens = gameState.ants.filter(a => a.type === 'queen' && a.team !== this.team && !a.dead);

    switch (this.state) {
      case 'defending': {
        const inRange = enemyAnts.filter(a => dist(a, nest) <= 20);
        if (inRange.length) {
          this.target = inRange[0];
          this.dir = Math.atan2(this.target.y - this.y, this.target.x - this.x);
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
        if (enemyQueens.length === 0) { // All enemy queens are dead
          this.state = 'defending'; // Return to defending state
          this.target = null;
          break;
        }

        if (!this.target || this.target.dead) {
          this.target = enemyAnts.length
            ? enemyAnts.reduce((a, b) => dist(this, a) < dist(this, b) ? a : b)
            : enemyQueens[0]; // Target the first available enemy queen if no other ants
        }
        if (!this.target) break;
        this.dir = Math.atan2(this.target.y - this.y, this.target.x - this.x);
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
    const newX = this.x + dx;
    const newY = this.y + dy;

    if (dx !== 0 || dy !== 0) {
      this.dir = Math.atan2(dy, dx);
    }

    // Check for horizontal boundaries
    if (newX < 0.5 || newX > MAP_W - 0.5) {
      this.wanderDirX *= -1; // Reverse horizontal direction
    }
    // Check for vertical boundaries
    if (newY < 0.5 || newY > MAP_H - 0.5) {
      this.wanderDirY *= -1; // Reverse vertical direction
    }

    this.x = Math.max(0.5, Math.min(MAP_W - 0.5, newX));
    this.y = Math.max(0.5, Math.min(MAP_H - 0.5, newY));
  }

  stepToward(tx, ty, delta, map) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    this.move(dx / len * delta * this.speed, dy / len * delta * this.speed, map);
  }

  attack(target) {
    if (this.type === 'defender') return; // Defender ants do not attack
    if (this.attackSpeed && (performance.now() - this.lastAttackTime < this.attackSpeed)) {
      return; // Not ready to attack yet
    }

    if (target.hp !== undefined) {
      const dmg = Math.min(this.dmg, target.hp);
      target.hp -= dmg;
      this.lastAttackTime = performance.now();
      addDamageText(target.x, target.y, dmg);
    }
  }

  draw(ctx) {
    const px = this.x * TILE;
    const py = this.y * TILE;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((this.dir || 0) - Math.PI / 2);

    // body
    ctx.fillStyle = TEAM_COLORS[this.team] || '#FFF';
    ctx.beginPath();
    const bodyR = this.size || 4;
    const bodyRx = bodyR * 0.6; // flat width
    const bodyRy = bodyR * 1.2; // elongated height
    ctx.ellipse(0, 0, bodyRx, bodyRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // head attached below the body
    const headR = bodyR * 0.5;
    ctx.beginPath();
    ctx.arc(0, bodyRy + headR - 2, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // antennae extending from the front of the head
    ctx.beginPath();
    ctx.moveTo(-headR * 0.3, bodyRy + headR * 1.2 - 2);
    ctx.lineTo(-headR * 1.5, bodyRy + headR * 3.0 - 2);
    ctx.moveTo(headR * 0.3, bodyRy + headR * 1.2 - 2);
    ctx.lineTo(headR * 1.5, bodyRy + headR * 3.0 - 2);
    ctx.stroke();

    // simple legs (2-frame walk)
    const wiggle = Math.sin(performance.now() * 0.01 * this.speed * 100) * 2;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    const r = bodyRx;

    // draw three pairs of legs with slight diagonal offsets
    // keep the diagonal legs closer to the middle pair
    const legAngles = [0, Math.PI / 8, -Math.PI / 8];
    legAngles.forEach(angle => {
      [-1, 1].forEach(side => {
        const dx = Math.cos(angle) * r * side;
        const dy = Math.sin(angle) * r + wiggle * side;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx * 2, dy * 2);
        ctx.stroke();
      });
    });

    ctx.restore();

    // health bar
    if (this.hp < this.maxHp) {
      ctx.fillStyle = '#000';
      ctx.fillRect(px - 4, py - 10, 8, 2);
      ctx.fillStyle = this.hp > this.maxHp * 0.5 ? '#0F0'
                    : this.hp > this.maxHp * 0.2 ? '#FF0' : '#F00';
      ctx.fillRect(px - 4, py - 10, (this.hp / this.maxHp) * 8, 2);
    }
  }
}