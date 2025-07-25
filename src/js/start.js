import { gameState } from './entities.js';

const seedInput = document.getElementById('seedInput');
const randomBtn = document.getElementById('randomBtn');
const startBtn  = document.getElementById('startBtn');

// use any stored seed on reloads
seedInput.value = sessionStorage.getItem('qantSeed') || '';

function updateSeedAndRestart() {
  const seed = seedInput.value || 12345;
  sessionStorage.setItem('qantSeed', seed);
  if (window.demoMode && !window.isReloading) {
    window.isReloading = true;
    location.reload();
  }
}

// Show a demo match using AI for all teams
window.demoMode = true;
['gameArea', 'ui-team-0', 'ui-team-1', 'ui-team-2', 'ui-team-3']
  .forEach(id => document.getElementById(id).classList.remove('hidden'));
import('./play.js');

randomBtn.onclick = () => {
  seedInput.value = Math.floor(Math.random() * 999999);
  updateSeedAndRestart();
};

seedInput.addEventListener('change', updateSeedAndRestart);

startBtn.onclick = async () => {
  window.demoMode = false;

  // reset all dynamic game state before starting a fresh match
  gameState.ants = [];
  gameState.resources = [];
  gameState.pheromones = [];
  gameState.deadAnts = [0, 0, 0, 0];
  gameState.totalAnts = [{}, {}, {}, {}];
  gameState.teams.forEach(t => t.sugar = 100);

  const seed = seedInput.value || 12345;
  sessionStorage.setItem('qantSeed', seed);
  document.getElementById('startScreen').classList.add('hidden');
  ['gameArea', 'ui-team-0', 'ui-team-1', 'ui-team-2', 'ui-team-3']
    .forEach(id => document.getElementById(id).classList.remove('hidden'));
  // use a unique query string to force re-execution of play.js
  await import(`./play.js?seed=${seed}&t=${Date.now()}`);
};