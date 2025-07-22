import { generateMap, NESTS } from './mapGen.js';
import { gameState } from './entities.js';
import { updatePheromones } from './pheromone.js';
import { Ant } from './ant.js';
import { cleanupDead } from './combat.js';
import { TILE, MAP_W, MAP_H, ANT_COST, ANT_STATS } from './constants.js';

/* ---------- Rendering ---------- */
const PALETTE = {
  dirt: '#6B4423', grass: '#3A5F0B', dgrass: '#2B4708', nest: '#8B4513',
  queen: '#FFD700', worker: '#90EE90', private: '#FF0000',
  general: '#0000FF', artillery: '#800080'
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// map
const { map, resources } = generateMap(MAP_W, MAP_H, 12345);
gameState.resources = resources;

/* ---------- Team setup (demo units) ---------- */
function spawn(type, team) {
  const n = gameState.teams[team].queen;
  const x = n.x + (Math.random() - 0.5) * 2;
  const y = n.y + (Math.random() - 0.5) * 2;
  gameState.ants.push(new Ant(type, team, x, y));
}

// give team 0 some soldiers to watch combat
spawn('worker', 0);
spawn('worker', 0);
spawn('private', 0);
spawn('artillery', 0);

// give team 1 a few units so they fight
spawn('private', 1);
spawn('private', 1);
spawn('general', 1);

function drawTile(x, y, type) {
  ctx.fillStyle = type === 0 ? PALETTE.dirt :
                  type === 1 ? PALETTE.grass : PALETTE.dgrass;
  ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x * TILE, y * TILE, r, 0, Math.PI * 2);
  ctx.fill();
}

/* ---------- UI helper (tiny) ---------- */
function drawHpBar(x, y, hp, maxHp) {
  const w = 8;
  ctx.fillStyle = '#000';
  ctx.fillRect(x * TILE - w / 2, y * TILE - 10, w, 2);
  ctx.fillStyle = hp > maxHp * 0.5 ? '#0F0' : hp > maxHp * 0.2 ? '#FF0' : '#F00';
  ctx.fillRect(x * TILE - w / 2, y * TILE - 10, (hp / maxHp) * w, 2);
}

/* ---------- Game loop ---------- */
function update(delta) {
  updatePheromones(delta);
  gameState.ants.forEach(a => a.update(delta, map, gameState.resources));
  cleanupDead(); // remove dead ants
}

function draw() {
  // terrain
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) drawTile(x, y, map[y][x]);
  }

  // nests
  NESTS.forEach(n => drawCircle(n.x, n.y, 12, PALETTE.nest));

  // resources
  gameState.resources.forEach(r => {
    if (r.depleted) return;
    const color = r.name.includes('Soda') ? PALETTE.soda :
                  r.name.includes('Corn') ? PALETTE.syrup : PALETTE.energy;
    drawCircle(r.x, r.y, 4, color);
  });

  // ants
  gameState.ants.forEach(a => {
    const color = PALETTE[a.type] || '#FFF';
    drawCircle(a.x, a.y, 4, color);
    if (a.hp < a.maxHp) drawHpBar(a.x, a.y, a.hp, a.maxHp);
  });
}

let last = 0;
function gameLoop(ts) {
  const delta = ts - last;
  update(delta);
  draw();
  last = ts;
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);