import mulberry32     from './prng.js';
import { generateMap, NESTS } from './mapGen.js';
import { gameState }  from './entities.js';
import { updatePheromones } from './pheromone.js';
import { Ant }        from './ant.js';
import { TILE, MAP_W, MAP_H } from './utils.js';

/* ---------- Rendering ---------- */
const PALETTE = {
  dirt:  '#6B4423',
  grass: '#3A5F0B',
  dgrass:'#2B4708',
  nest:  '#8B4513',
  queen: '#FFD700',
  worker:'#90EE90',
  soda:  '#FFFACD',
  syrup: '#FFA500',
  energy:'#FF6347'
};

const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
canvas.width  = 800;
canvas.height = 600;

// map
const SEED = 12345;
const { map, resources } = generateMap(MAP_W, MAP_H, SEED);
gameState.resources = resources;

// spawn 4 workers for team 0 to demo
for (let i = 0; i < 4; i++) {
  const n = gameState.teams[0].queen;
  gameState.ants.push(new Ant('worker', 0, n.x + (Math.random() - 0.5), n.y + (Math.random() - 0.5)));
}

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

function update(delta) {
  updatePheromones(delta);
  gameState.ants.forEach(a => a.update(delta, map, gameState.resources));
}

function draw() {
  // terrain
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      drawTile(x, y, map[y][x]);
    }
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
    drawCircle(a.x, a.y, 4, a.type === 'worker' ? PALETTE.worker : PALETTE.queen);
  });
}

let last = 0;
function gameLoop(timestamp) {
  const delta = timestamp - last;
  update(delta);
  draw();
  last = timestamp;
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);