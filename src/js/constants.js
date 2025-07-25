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
  worker:   { hp: 10, dmg: 0, range: 0, speed: 0.050, attackSpeed: 100, size: 2 },
  private:  { hp: 25, dmg: 5, range: 1, speed: 0.045, attackSpeed: 100, size: 3 },
  general:  { hp: 90, dmg: 20, range: 1, speed: 0.022, attackSpeed: 200, size: 4 },
  artillery:{ hp: 20, dmg: 10, range: 9, speed: 0.028, attackSpeed: 150, size: 2 },
  defender: { hp: 300, dmg: 10, range: 1, speed: 0.015, attackSpeed: 200, size: 5 },
  queen:    { hp: 500, dmg: 0, range: 0, speed: 0, size: 6 }
};


/* ---------- Team colors ---------- */
export const TEAM_COLORS = [
  '#90EE90', // Team 0 - light green
  '#FF6B6B', // Team 1 - light red
  '#6BA8FF', // Team 2 - light blue
  '#FFD700'  // Team 3 - gold
];

/* ---------- Sugar resource types ---------- */
export const SUGAR_TYPES = [
  { name: 'Soda Puddle',       amount: 100, rarity: 0.6 },
  { name: 'Corn Syrup Puddle', amount: 200, rarity: 0.3 },
  { name: 'Energy Drink',      amount: 400, rarity: 0.1 }
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
