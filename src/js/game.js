import { generateMap, NESTS } from './mapGen.js';
import { gameState } from './entities.js';
import { updatePheromones } from './pheromone.js';
import { Ant } from './ant.js';
import { cleanupDead } from './combat.js';
import { runAI } from './ai.js';
import { updateUI, bindButtons } from './ui.js';
import { TILE, MAP_W, MAP_H, ANT_COST } from './constants.js';

/* ---------- Rendering (same as before) ---------- */
const PALETTE = {
  dirt:'#6B4423',grass:'#3A5F0B',dgrass:'#2B4708',nest:'#8B4513',
  queen:'#FFD700',worker:'#90EE90',private:'#FF0000',
  general:'#0000FF',artillery:'#800080'
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const { map, resources } = generateMap(MAP_W, MAP_H, 12345);
gameState.resources = resources;

/* ---------- Player actions ---------- */
function spawnPlayerAnt(type) {
  const cost = ANT_COST[type];
  const team = gameState.teams[0];
  if (team.sugar < cost) return;
  team.sugar -= cost;
  const { x, y } = team.queen;
  gameState.ants.push(new Ant(type, 0, x + Math.random() - 0.5, y + Math.random() - 0.5));
  updateUI();
}

function orderPlayerAttack() {
  gameState.ants
    .filter(a => a.team === 0 && a.type !== 'worker' && a.type !== 'queen')
    .forEach(a => a.state = 'attacking');
}

bindButtons(spawnPlayerAnt, orderPlayerAttack);
updateUI();

/* ---------- Game loop ---------- */
let last = 0;
function gameLoop(ts) {
  const delta = ts - last;
  cleanupDead();
  updatePheromones(delta);
  gameState.ants.forEach(a => a.update(delta, map, gameState.resources));
  runAI(delta);
  updateUI();

  /* ---------- Rendering ---------- */
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      ctx.fillStyle = [PALETTE.dirt, PALETTE.grass, PALETTE.dgrass][map[y][x]];
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }

  NESTS.forEach(n => {
    ctx.fillStyle = PALETTE.nest;
    ctx.fillRect(n.x * TILE - 12, n.y * TILE - 12, 24, 24);
  });

  gameState.resources.forEach(r => {
    if (r.depleted) return;
    ctx.fillStyle = r.name.includes('Soda') ? '#FFFACD' :
                    r.name.includes('Corn') ? '#FFA500' : '#FF6347';
    ctx.beginPath(); ctx.arc(r.x * TILE, r.y * TILE, 4, 0, Math.PI * 2); ctx.fill();
  });

  gameState.ants.forEach(a => {
    ctx.fillStyle = PALETTE[a.type] || '#FFF';
    ctx.beginPath(); ctx.arc(a.x * TILE, a.y * TILE, 4, 0, Math.PI * 2); ctx.fill();
    if (a.hp < a.maxHp) {
      ctx.fillStyle = '#000'; ctx.fillRect(a.x * TILE - 4, a.y * TILE - 10, 8, 2);
      ctx.fillStyle = a.hp > a.maxHp * 0.5 ? '#0F0' : a.hp > a.maxHp * 0.2 ? '#FF0' : '#F00';
      ctx.fillRect(a.x * TILE - 4, a.y * TILE - 10, (a.hp / a.maxHp) * 8, 2);
    }
  });

  last = ts;
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);