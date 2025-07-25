/* ---------- Geometry & map ---------- */
export const TILE  = 8;
export const MAP_W = 100;
export const MAP_H = 75;
export const DEBUG = false;

/* ---------- Unit prices ---------- */
export const ANT_COST = {
  worker:    10,
  private:   15,
  general:   40,
  artillery: 30,
  defender:  15
};

/* ---------- Unit stats ---------- */
export const ANT_STATS = {
  worker:   { hp: 10, dmg: 0, range: 0, speed: 0.050, attackSpeed: 100 },
  private:  { hp: 25, dmg: 5, range: 1, speed: 0.045, attackSpeed: 100 },
  general:  { hp: 90, dmg: 20, range: 1, speed: 0.022, attackSpeed: 200 },
  artillery:{ hp: 20, dmg: 10, range: 9, speed: 0.028, attackSpeed: 150 },
  defender: { hp: 300, dmg: 10, range: 1, speed: 0.015, attackSpeed: 200 },
  queen:    { hp: 500, dmg: 0, range: 0, speed: 0 }
};

/* ---------- Ant visual size ---------- */
export const ANT_RADIUS = {
  worker: 1,
  private: 3,
  general: 4,
  artillery: 2,
  defender: 5,
  queen: 6
};

/* ---------- Team colors ---------- */
export const TEAM_COLORS = [
  '#90EE90', // Team 0 - light green
  '#FF6B6B', // Team 1 - light red
  '#6BA8FF', // Team 2 - light blue
  '#FFD700'  // Team 3 - gold
];

/* ---------- Helpers ---------- */
export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}