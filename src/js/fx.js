const popups = [];

export function addDamageText(x, y, dmg) {
  popups.push({ x, y, text: `-${dmg}`, life: 800, age: 0 });
}

export function updateFX(delta) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.age += delta;
    p.y -= 0.02 * delta;
    if (p.age >= p.life) popups.splice(i, 1);
  }
}

export function drawFX(ctx) {
  ctx.font = '10px monospace';
  ctx.fillStyle = '#FFF';
  popups.forEach(p => {
    ctx.globalAlpha = 1 - p.age / p.life;
    ctx.fillText(p.text, p.x * 8, p.y * 8);
  });
  ctx.globalAlpha = 1;
}