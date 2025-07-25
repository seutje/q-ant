const seedInput = document.getElementById('seedInput');
const randomBtn = document.getElementById('randomBtn');
const startBtn  = document.getElementById('startBtn');

// use any stored seed on reloads
seedInput.value = sessionStorage.getItem('qantSeed') || '';

// check if we should immediately start a fresh game
const startNow = sessionStorage.getItem('qantPlay') === 'true';
if (startNow) {
  sessionStorage.removeItem('qantPlay');
  window.demoMode = false;
  document.getElementById('startScreen').classList.add('hidden');
} else {
  // Show a demo match using AI for all teams
  window.demoMode = true;
}

function updateSeedAndRestart() {
  const seed = seedInput.value || 12345;
  sessionStorage.setItem('qantSeed', seed);
  if (window.demoMode) {
    location.reload();
  }
}

['gameArea', 'ui-team-0', 'ui-team-1', 'ui-team-2', 'ui-team-3']
  .forEach(id => document.getElementById(id).classList.remove('hidden'));
import('./play.js');

randomBtn.onclick = () => {
  seedInput.value = Math.floor(Math.random() * 999999);
  updateSeedAndRestart();
};

seedInput.addEventListener('change', updateSeedAndRestart);

startBtn.onclick = () => {
  const seed = seedInput.value || 12345;
  sessionStorage.setItem('qantSeed', seed);
  sessionStorage.setItem('qantPlay', 'true');
  location.reload();
};
