/* ========== Rendering Helpers (Pixel-Art Style) ========== */
const PALETTE = {
  bg:        '#222',
  nest:      '#8B4513',
  antWorker: '#90EE90',
  antQueen:  '#FFD700',
  sugar:     '#FFFACD',
  phero:     '#FF69B4',
  black:     '#000'
};

function drawCircle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawRectangle(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/* ========== Canvas & Game Loop ========== */
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');

let lastTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

function update(delta) {
  // Phase-1 stub: nothing to update yet
}

function draw() {
  // Clear
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Placeholder graphics to prove the engine works
  // Nest
  drawRectangle(ctx, 50, 50, 100, 100, PALETTE.nest);
  // Queen
  drawCircle(ctx, 100, 100, 12, PALETTE.antQueen);
  // Worker
  drawCircle(ctx, 300, 400, 8, PALETTE.antWorker);
  // Sugar puddle
  drawCircle(ctx, 600, 500, 20, PALETTE.sugar);
}

function gameLoop(timestamp) {
  const delta = timestamp - lastTime;
  if (delta >= FRAME_TIME) {
    update(delta);
    draw();
    lastTime = timestamp;
  }
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);