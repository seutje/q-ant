export const gameState = {
  teams: [
    { id: 0, sugar: 100, queen: { x: 2, y: 2 } },
    { id: 1, sugar: 100, queen: { x: 97, y: 2 } },
    { id: 2, sugar: 100, queen: { x: 2, y: 72 } },
    { id: 3, sugar: 100, queen: { x: 97, y: 72 } }
  ],
  ants: [],
  resources: [],
  pheromones: []  // flat array [{x,y,team,strength}]
};