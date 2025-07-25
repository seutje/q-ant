const seedInput = document.getElementById('seedInput');
const randomBtn = document.getElementById('randomBtn');
const startBtn  = document.getElementById('startBtn');

// Show a demo match using AI for all teams
window.demoMode = true;
['gameArea', 'ui-team-0', 'ui-team-1', 'ui-team-2', 'ui-team-3']
  .forEach(id => document.getElementById(id).classList.remove('hidden'));
import('./play.js');

randomBtn.onclick = () => {
  seedInput.value = Math.floor(Math.random() * 999999);
};

startBtn.onclick = async () => {
  window.demoMode = false;
  const seed = seedInput.value || 12345;
  sessionStorage.setItem('qantSeed', seed);
  document.getElementById('startScreen').classList.add('hidden');
  ['gameArea', 'ui-team-0', 'ui-team-1', 'ui-team-2', 'ui-team-3']
    .forEach(id => document.getElementById(id).classList.remove('hidden'));
  await import('./play.js');
};