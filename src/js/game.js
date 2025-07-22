import mulberry32       from './prng.js';
import { generateMap, NESTS } from './mapGen.js';
import { gameState }    from './entities.js';

/* ---------- Rendering Helpers ---------- */
const PALETTE = {
  dirt:  '#6B4423',
  grass: '#3A5F0B',
  dgrass:'#2B4708',
  nest:  '#8B4513',
  queen: '#FFD700',
  soda:  '#FFFACD',
  syrup: '#FFA500',
  energy:'#FF6347'
};

function drawTile(ctx, x, y, type) {
  ctx.fillStyle = type === 0 ? PALETTE.dirt :
                  type === 1 ? PALETTE.grass : PALETTE.dgrass;
  ctx.fillRect(x * 8, y * 8, 8, 8);
}

function drawCircle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x * 8, y * 8, r, 0, Math.PI * 2);
  ctx.fill();
}

/* ---------- Canvas & Loop ---------- */
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
canvas.width  = 800;
canvas.height = 600;

// --- Map generation with seed ---
const SEED = 12345; // later user-supplied
const { map, resources } = generateMap(100, 75, SEED);

function update() {
  // Phase-2: nothing dynamic yet
}

function draw() {
  // Terrain
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      drawTile(ctx, x, y, map[y][x]);
    }
  }

  // Nests
  NESTS.forEach(n => {
    drawCircle(ctx, n.x, n.y, 12, PALETTE.nest);
    drawCircle(ctx, n.x, n.y, 6, PALETTE.queen);
  });

  // Resources
  resources.forEach(r => {
    const color = r.name.includes('Soda') ? PALETTE.soda :
                  r.name.includes('Corn') ? PALETTE.syrup : PALETTE.energy;
    drawCircle(ctx, r.x, r.y, 4, color);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);