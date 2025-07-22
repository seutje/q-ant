const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rng = RNG.createRNG(12345);
const gameMap = new GameMap(50, 50, rng);

for (let y = 0; y < gameMap.height; y++) {
    const row = [];
    for (let x = 0; x < gameMap.width; x++) {
        row.push(0);
    }
    GameState.pheromones.push(row);
}

const teams = [];

const GameState = {
    teams,
    units: [],
    pheromones: [],
};

class Ant {
    constructor(x, y, teamId) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = 1;
        this.teamId = teamId;
        this.state = 'wandering';
    }
}

class Queen extends Ant {
    constructor(x, y, teamId) {
        super(x, y, teamId);
        this.state = 'queen';
    }

    update() {
        // Queen is stationary; no movement logic for now
    }

    birthAnt(AntType, cost = 10) {
        return birthAnt(teams[this.teamId], AntType, cost);
    }
}

class Worker extends Ant {
    constructor(x, y, teamId) {
        super(x, y, teamId);
        this.state = 'WANDERING';
        this.carrying = 0;
    }

    update() {
        const team = teams[this.teamId];
        if (this.state === 'WANDERING') {
            // random movement
            const dirs = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 },
            ];
            const dir = dirs[Math.floor(rng() * dirs.length)];
            const nx = Math.max(0, Math.min(gameMap.width - 1, this.x + dir.x));
            const ny = Math.max(0, Math.min(gameMap.height - 1, this.y + dir.y));
            this.x = nx;
            this.y = ny;
            const res = gameMap.getResourceAt(this.x, this.y);
            if (res) {
                res.amount -= 1;
                this.carrying = 1;
                this.state = 'RETURNING';
            }
        } else if (this.state === 'RETURNING') {
            // deposit pheromone
            GameState.pheromones[this.y][this.x] += 0.1;
            if (this.x < team.nest.x) this.x++; else if (this.x > team.nest.x) this.x--;
            if (this.y < team.nest.y) this.y++; else if (this.y > team.nest.y) this.y--;
            if (this.x === team.nest.x && this.y === team.nest.y) {
                team.sugar += this.carrying;
                this.carrying = 0;
                this.state = 'WANDERING';
            }
        }
    }
}

class Team {
    constructor(id, x, y) {
        this.id = id;
        this.nest = { x, y };
        this.sugar = 20;
        this.queen = new Queen(x, y, id);
    }
}


function initTeams(count) {
    const positions = [
        { x: 0, y: 0 },
        { x: gameMap.width - 1, y: 0 },
        { x: 0, y: gameMap.height - 1 },
        { x: gameMap.width - 1, y: gameMap.height - 1 },
    ];
    for (let i = 0; i < count && i < positions.length; i++) {
        const pos = positions[i];
        const team = new Team(i, pos.x, pos.y);
        teams.push(team);
        GameState.units.push(team.queen);
        const worker = new Worker(pos.x, pos.y, team.id);
        GameState.units.push(worker);
    }
}

initTeams(4);

function birthAnt(team, AntType, cost = 10) {
    if (team.sugar >= cost) {
        team.sugar -= cost;
        const ant = new AntType(team.nest.x, team.nest.y, team.id);
        GameState.units.push(ant);
        return ant;
    }
    return null;
}

function update() {
    // decay pheromones
    for (let y = 0; y < GameState.pheromones.length; y++) {
        for (let x = 0; x < GameState.pheromones[y].length; x++) {
            const current = GameState.pheromones[y][x];
            GameState.pheromones[y][x] = Math.max(0, current - 0.01);
        }
    }

    for (const unit of GameState.units) {
        if (typeof unit.update === 'function') {
            unit.update();
        }
    }
}

function draw() {
    ctx.fillStyle = Renderer.Colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // TODO: drawing logic will go here
    const cellWidth = canvas.width / gameMap.width;
    const cellHeight = canvas.height / gameMap.height;
    Renderer.drawPheromones(ctx, GameState.pheromones, cellWidth, cellHeight);
    for (let y = 0; y < gameMap.height; y++) {
        for (let x = 0; x < gameMap.width; x++) {
            if (gameMap.grid[y][x] === 1) {
                Renderer.drawRectangle(
                    ctx,
                    x * cellWidth,
                    y * cellHeight,
                    cellWidth,
                    cellHeight,
                    '#004400'
                );
            }
        }
    }
    for (const res of gameMap.resources) {
        const color = {
            [ResourceTypes.SODA.name]: '#4444ff',
            [ResourceTypes.CORN_SYRUP.name]: '#ff8800',
            [ResourceTypes.ENERGY_DRINK.name]: '#ff00ff',
        }[res.type.name];
        Renderer.drawCircle(
            ctx,
            res.x * cellWidth + cellWidth / 2,
            res.y * cellHeight + cellHeight / 2,
            Math.min(cellWidth, cellHeight) / 3,
            color
        );
    }
    for (const team of teams) {
        Renderer.drawRectangle(
            ctx,
            team.nest.x * cellWidth,
            team.nest.y * cellHeight,
            cellWidth,
            cellHeight,
            Renderer.Colors.nest || '#aaaa00'
        );
    }

    for (const unit of GameState.units) {
        const color = unit instanceof Queen ? '#ffaaaa' : Renderer.Colors.ant;
        Renderer.drawCircle(
            ctx,
            unit.x * cellWidth + cellWidth / 2,
            unit.y * cellHeight + cellHeight / 2,
            Math.min(cellWidth, cellHeight) / 2,
            color
        );
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
