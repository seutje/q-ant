/* ---------- Imports ---------- */
import { generateMap, NESTS } from './mapGen.js';
import { gameState } from './entities.js';
import { updatePheromones } from './pheromone.js';
import { Ant } from './ant.js';
import { cleanupDead } from './combat.js';
import { runAI } from './ai.js';
import { updateUI, bindButtons } from './ui.js';
import { TILE, MAP_W, MAP_H, ANT_COST } from './constants.js';

/* ---------- Rendering Constants ---------- */
const PALETTE = {
  dirt:   '#6B4423',
  grass:  '#3A5F0B',
  dgrass: '#2B4708',
  nest:   '#8B4513',
  queen:  '#FFD700',
  worker: '#90EE90',
  private:'#FF0000',
  general:'#0000FF',
  artillery:'#800080'
};

/* ---------- Canvas Setup ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

/* ---------- Map & Seed ---------- */
const SEED = Number(sessionStorage.getItem('qantSeed')) || 12345;
const { map, resources } = generateMap(MAP_W, MAP_H, SEED);
gameState.resources = resources;

/* ---------- Initial Demo Units ---------- */
function spawn(type, team) {
  const n = gameState.teams[team].queen;
  gameState.ants.push(new Ant(type, team, n.x + (Math.random() - 0.5), n.y + (Math.random() - 0.5)));
}
spawn('worker', 0);
spawn('worker', 0);
spawn('private', 0);
spawn('artillery', 0);
spawn('private', 1);
spawn('private', 1);
spawn('general', 1);

/* ---------- Rendering Helpers ---------- */
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

function drawHpBar(x, y, hp, maxHp) {
  const w = 8;
  ctx.fillStyle = '#000';
  ctx.fillRect(x * TILE - w / 2, y * TILE - 10, w, 2);
  ctx.fillStyle = hp > maxHp * 0.5 ? '#0F0' : hp > maxHp * 0.2 ? '#FF0' : '#F00';
  ctx.fillRect(x * TILE - w / 2, y * TILE - 10, (hp / maxHp) * w, 2);
}

/* ---------- Game-Over Handling ---------- */
function checkWinLoss() {
  const alive = gameState.teams.filter(t =>
    gameState.ants.some(a => a.type === 'queen' && a.team === t.id && !a.dead)
  );
  if (alive.length <= 1) {
    const playerAlive = alive.some(t => t.id === 0);
    showGameOver(playerAlive ? 'You Win!' : 'Game Over');
  }
}

function showGameOver(text) {
  document.getElementById('overlayText').textContent = text;
  document.getElementById('overlay').classList.remove('hidden');
}

document.getElementById('restartBtn').onclick = () => location.href = '../index.html';

/* ---------- Bind UI Buttons ---------- */
bindButtons(
  (type) => spawn(type, 0),
  () => gameState.ants.filter(a => a.team === 0 && a.type !== 'worker' && a.type !== 'queen')
                      .forEach(a => a.state = 'attacking')
);
updateUI();

/* ---------- Main Loop ---------- */
let last = 0;
function gameLoop(ts) {
  const delta = ts - last;

  cleanupDead();
  updatePheromones(delta);
  gameState.ants.forEach(a => a.update(delta, map, gameState.resources));
  runAI(delta);
  updateUI();
  checkWinLoss();

  /* ---------- Draw ---------- */
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // terrain
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      drawTile(x, y, map[y][x]);

  // nests
  NESTS.forEach(n => drawCircle(n.x, n.y, 12, PALETTE.nest));

  // resources
  gameState.resources.forEach(r => {
    if (r.depleted) return;
    const color = r.name.includes('Soda') ? '#FFFACD' :
                  r.name.includes('Corn') ? '#FFA500' : '#FF6347';
    drawCircle(r.x, r.y, 4, color);
  });

  // ants
  gameState.ants.forEach(a => {
    drawCircle(a.x, a.y, 4, PALETTE[a.type] || '#FFF');
    if (a.hp < a.maxHp) drawHpBar(a.x, a.y, a.hp, a.maxHp);
  });

  last = ts;
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);