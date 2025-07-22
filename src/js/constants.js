export const TILE = 8;
export const MAP_W = 100;
export const MAP_H = 75;

export const ANT_COST = {
  worker:   10,
  private:  15,
  general:  50,
  artillery:30
};

export const ANT_STATS = {
  worker:   { hp: 20, dmg: 0, range:0, speed: 0.03 },
  private:  { hp: 30, dmg: 8, range:1, speed: 0.04 },
  general:  { hp: 120,dmg:25, range:1, speed: 0.02 },
  artillery:{ hp: 25, dmg:12, range:8, speed: 0.025 }
};