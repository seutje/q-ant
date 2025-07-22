export const TILE = 8;
export const MAP_W = 100;
export const MAP_H = 75;

export const ANT_COST = {
  worker:   8,
  private:  12,
  general:  40,
  artillery:25
};

export const ANT_STATS = {
  worker:   { hp: 20, dmg: 0, range: 0, speed: 0.035 },
  private:  { hp: 25, dmg: 6, range: 1, speed: 0.045 },
  general:  { hp: 90, dmg: 18, range: 1, speed: 0.022 },
  artillery:{ hp: 20, dmg: 10, range: 9, speed: 0.028 }
};