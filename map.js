const ResourceTypes = {
    SODA: { name: 'Soda Puddle', sugar: 50, rarity: 0.02 },
    CORN_SYRUP: { name: 'Corn Syrup Puddle', sugar: 75, rarity: 0.015 },
    ENERGY_DRINK: { name: 'Energy Drink Puddle', sugar: 100, rarity: 0.01 },
};

class GameMap {
    constructor(width, height, rng) {
        this.width = width;
        this.height = height;
        this.rng = rng;
        this.grid = [];
        this.resources = [];
        this.generate();
        this.pheromones = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(0);
            }
            this.pheromones.push(row);
        }
    }

    generate() {
        // simple procedural generation using random noise
        this.grid = [];
        this.resources = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                const value = this.rng() < 0.2 ? 1 : 0; // 1 represents tree
                row.push(value);
            }
            this.grid.push(row);
        }

        // place resources
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 0) {
                    const rand = this.rng();
                    if (rand < ResourceTypes.SODA.rarity) {
                        this.resources.push({ x, y, type: ResourceTypes.SODA, amount: ResourceTypes.SODA.sugar });
                    } else if (rand < ResourceTypes.SODA.rarity + ResourceTypes.CORN_SYRUP.rarity) {
                        this.resources.push({ x, y, type: ResourceTypes.CORN_SYRUP, amount: ResourceTypes.CORN_SYRUP.sugar });
                    } else if (rand < ResourceTypes.SODA.rarity + ResourceTypes.CORN_SYRUP.rarity + ResourceTypes.ENERGY_DRINK.rarity) {
                        this.resources.push({ x, y, type: ResourceTypes.ENERGY_DRINK, amount: ResourceTypes.ENERGY_DRINK.sugar });
                    }
                }
            }
        }
    }

    getResourceAt(x, y) {
        return this.resources.find(r => r.x === x && r.y === y && r.amount > 0);
    }
}

window.GameMap = GameMap;
window.ResourceTypes = ResourceTypes;
