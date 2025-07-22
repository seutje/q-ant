import mulberry32 from './prng.js';

const TILE = 8;                  // pixel size of one map cell
const OCTAVES = 3;
const PERSISTENCE = 0.5;

// 2-D pseudo-Perlin noise (value noise) – plenty good for our pixel forest
function noise2D(x, y, rand) {
  const x0 = Math.floor(x) & 255;
  const y0 = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const n00 = rand();
  const n10 = rand();
  const n01 = rand();
  const n11 = rand();

  const u = fade(xf);
  const v = fade(yf);

  return lerp(v,
    lerp(u, n00, n10),
    lerp(u, n01, n11)
  );
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }

export function generateMap(width, height, seed) {
  const rand = mulberry32(seed);
  const map  = Array.from({length: height}, () => Array(width).fill(0));

  // --- Forest background ---
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let amplitude = 1.0;
      let frequency = 0.05;
      let value = 0;
      for (let i = 0; i < OCTAVES; i++) {
        value += noise2D(x * frequency, y * frequency, rand) * amplitude;
        amplitude *= PERSISTENCE;
        frequency *= 2;
      }
      // 0 = dirt, 1 = grass, 2 = darker grass
      map[y][x] = value < 0.2 ? 0 : value < 0.5 ? 1 : 2;
    }
  }

  // --- Sugar resources ---
  const resources = [];
  const SUGAR_TYPES = [
    { name: 'Soda Puddle',      amount: 50, rarity: 0.6 },
    { name: 'Corn Syrup Puddle',amount: 100, rarity: 0.3 },
    { name: 'Energy Drink',     amount: 200, rarity: 0.1 }
  ];

  for (let attempt = 0; attempt < width * height * 0.01; attempt++) {
    const x = Math.floor(rand() * width);
    const y = Math.floor(rand() * height);
    if (map[y][x] === 0) continue; // don’t spawn on bare dirt

    const roll = rand();
    let picked = null;
    for (const type of SUGAR_TYPES) {
      if (roll < type.rarity) { picked = type; break; }
    }
    if (!picked) continue;

    resources.push({ x, y, ...picked });
  }

  return { map, resources };
}

// Fixed corner nests
export const NESTS = [
  { team: 0, x: 2, y: 2 },
  { team: 1, x: 97, y: 2 },
  { team: 2, x: 2, y: 72 },
  { team: 3, x: 97, y: 72 }
];