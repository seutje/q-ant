/* ---------- Imports ---------- */
import { generateMap, NESTS } from './mapGen.js';
import { gameState } from './entities.js';
import { updatePheromones, getPheromoneGrid } from './pheromone.js';
import { Ant } from './ant.js';
import { cleanupDead } from './combat.js';
import { runAI } from './ai.js';
import { updateUI, bindButtons } from './ui.js';
import { TILE, MAP_W, MAP_H, ANT_COST, DEBUG } from './constants.js';
import { addDamageText, updateFX, drawFX } from './fx.js';
import { click } from './audio.js';

/* ---------- Rendering palette ---------- */
const PALETTE = {
  dirt:   '#6B4423',
  grass:  '#3A5F0B',
  dgrass: '#2B4708',
  nest:   '#8B4513'
};

/* ---------- Canvas ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width = 800; canvas.height = 600;

/* ---------- Seed / map ---------- */
const SEED = Number(sessionStorage.getItem('qantSeed')) || 12345;
const { map, resources } = generateMap(MAP_W, MAP_H, SEED);
gameState.resources = resources;

/* ---------- Spawn initial demo units & queens ---------- */
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

/* ---------- Spawn the four stationary queens ---------- */
gameState.teams.forEach(t => {
  gameState.ants.push(new Ant('queen', t.id, t.queen.x, t.queen.y));
});

/* ---------- Player actions + sound ---------- */
function spawnPlayerAnt(type) {
  const cost = ANT_COST[type];
  const team = gameState.teams[0];
  // Check if the queen is alive before allowing birthing
  const queenAlive = gameState.ants.some(a => a.type === 'queen' && a.team === team.id && !a.dead);
  if (!queenAlive) {
    return;
  }
  if (team.sugar < cost) return;
  team.sugar -= cost;
  const { x, y } = team.queen;
  gameState.ants.push(new Ant(type, 0, x + (Math.random() - 0.5), y + (Math.random() - 0.5)));
  click();
  updateUI();
}

function orderPlayerAttack() {
  gameState.ants
    .filter(a => a.team === 0 && !['worker','queen','defender'].includes(a.type))
    .forEach(a => a.state = 'attacking');
  click();
}

bindButtons(spawnPlayerAnt, orderPlayerAttack);
updateUI();

/* ---------- Visual helpers ---------- */
function drawTile(x, y, type) {
  ctx.fillStyle = [PALETTE.dirt, PALETTE.grass, PALETTE.dgrass][type];
  ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
}

function drawPheromones() {
  if (!DEBUG) return;
  const grid = getPheromoneGrid();
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const strength = grid[y][x][0]; // Assuming team 0 for now
      if (strength > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${strength / 10})`; // Red pheromones, opacity based on strength
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }
}


/* ---------- Win/Loss ---------- */
let playerFinalStats = null;

function getPlayerStats() {
  if (!gameState.totalAnts) return {};
  return { ...gameState.totalAnts[0] };
}

function checkWinLoss() {
  if (!gameState.ants.some(a => a.type === 'queen')) return; // wait until queens exist

  const playerQueenAlive = gameState.ants.some(
    a => a.type === 'queen' && a.team === 0 && !a.dead
  );
  if (!playerQueenAlive && playerFinalStats === null) {
    playerFinalStats = getPlayerStats();
  }

  const alive = gameState.teams.filter(t =>
    gameState.ants.some(a => a.type === 'queen' && a.team === t.id && !a.dead)
  );

  if (window.demoMode && alive.length <= 1) {
    location.reload();
    return;
  }

  if (alive.length === 1) {
    if (alive[0].id === 0) {
      showGameOver('You Win!');
    } else {
      showGameOver(`Team ${alive[0].id} Wins!`, playerFinalStats);
    }
  } else if (alive.length <= 1) {
    showGameOver('Game Over', playerFinalStats);
  }
}

function showGameOver(text, counts) {
  if (window.demoMode) return;
  document.getElementById('overlayText').textContent = text;
  const statsDiv = document.getElementById('overlayStats');
  if (statsDiv) {
    const stats = counts || getPlayerStats();
    const types = ['worker', 'private', 'general', 'artillery', 'defender', 'queen'];
    const lines = types.map(type =>
      `${type.charAt(0).toUpperCase() + type.slice(1)}: ${stats[type] || 0}`
    );
    const dead = gameState.deadAnts ? gameState.deadAnts[0] : 0;
    lines.push(`Dead ants: ${dead}`);
    statsDiv.innerHTML = lines.join('<br>');
  }
  document.getElementById('overlay').classList.remove('hidden');
}

document.getElementById('restartBtn').onclick = () => location.href = 'index.html';

/* ---------- Main loop ---------- */
let last = 0;
let gameSpeed = 0.5; // Initial game speed

const gameSpeedSlider = document.getElementById('gameSpeed');
const gameSpeedDisplay = document.getElementById('gameSpeedDisplay');

gameSpeedSlider.oninput = (e) => {
  gameSpeed = parseFloat(e.target.value);
  gameSpeedDisplay.textContent = `${gameSpeed.toFixed(1)}x`;
};

function gameLoop(ts) {
  const delta = (ts - last) * gameSpeed;

  cleanupDead();
  updatePheromones(delta);
  gameState.ants.forEach(a => {
    const prevHp = a.hp;
    a.update(delta, map, gameState.resources);
    if (a.hp < prevHp) addDamageText(a.x, a.y, prevHp - a.hp);
  });
  updateFX(delta);
  runAI(delta);
  updateUI();
  checkWinLoss();

  /* ---------- Render ---------- */
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // terrain
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) drawTile(x, y, map[y][x]);

  // pheromones
  drawPheromones();

  // nests
  NESTS.forEach(n => {
    ctx.fillStyle = PALETTE.nest;
    ctx.fillRect(n.x * TILE - 12, n.y * TILE - 12, 24, 24);
  });

  // resources
  gameState.resources.forEach(r => {
    if (r.depleted) return;
    ctx.fillStyle = r.name.includes('Soda') ? '#FFFACD' :
                    r.name.includes('Corn') ? '#FFA500' : '#FF6347';
    ctx.beginPath(); ctx.arc(r.x * TILE, r.y * TILE, 4, 0, Math.PI * 2); ctx.fill();
  });

  // ants
  gameState.ants.forEach(a => a.draw(ctx));
  drawFX(ctx);

  last = ts;
  requestAnimationFrame(gameLoop);
}

function handleResize() {
  const gameArea = document.getElementById('gameArea');
  const widthRatio = window.innerWidth / 800;
  const heightRatio = window.innerHeight / 600;
  const bestRatio = Math.min(widthRatio, heightRatio);
  gameArea.style.transform = `scale(${bestRatio})`;
}

window.addEventListener('resize', handleResize);
document.addEventListener('DOMContentLoaded', handleResize);

requestAnimationFrame(gameLoop);