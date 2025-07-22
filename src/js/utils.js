export const TILE = 8;
export const MAP_W = 100;
export const MAP_H = 75;

export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}