const ctx = new (window.AudioContext || window.webkitAudioContext)();
let muted = true; // change to false to enable

export function click() {
  if (muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 600;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function toggleMute() {
  muted = !muted;
}