/* ---------- Geometry & map ---------- */
export const TILE  = 8;
export const MAP_W = 100;
export const MAP_H = 75;
export const DEBUG = false;

/* ---------- Unit prices ---------- */
export const ANT_COST = {
  worker:    8,
  private:   12,
  general:   40,
  artillery: 25,
  defender:  15
};

/* ---------- Unit stats ---------- */
export const ANT_STATS = {
  worker:   { hp: 20, dmg: 0, range: 0, speed: 0.035, attackSpeed: 100 },
  private:  { hp: 25, dmg: 6, range: 1, speed: 0.045, attackSpeed: 100 },
  general:  { hp: 90, dmg: 18, range: 1, speed: 0.022, attackSpeed: 100 },
  artillery:{ hp: 20, dmg: 10, range: 9, speed: 0.028, attackSpeed: 150 },
  defender: { hp: 300, dmg: 2, range: 1, speed: 0.015, attackSpeed: 100 },
  queen:    { hp: 500, dmg: 0, range: 0, speed: 0 }
};

/* ---------- Helpers ---------- */
export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}