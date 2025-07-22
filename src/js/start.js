const seedInput = document.getElementById('seedInput');
const randomBtn = document.getElementById('randomBtn');
const startBtn  = document.getElementById('startBtn');

randomBtn.onclick = () => seedInput.value = Math.floor(Math.random() * 999999);
startBtn.onclick  = () => {
  const seed = seedInput.value || 12345;
  sessionStorage.setItem('qantSeed', seed);
  location.href = 'play.html';
};