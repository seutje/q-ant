const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rng = RNG.createRNG(12345);
const gameMap = new GameMap(50, 50, rng);

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

class Team {
    constructor(id, x, y) {
        this.id = id;
        this.nest = { x, y };
        this.sugar = 0;
    }
}

const teams = [];

function initTeams(count) {
    const positions = [
        { x: 0, y: 0 },
        { x: gameMap.width - 1, y: 0 },
        { x: 0, y: gameMap.height - 1 },
        { x: gameMap.width - 1, y: gameMap.height - 1 },
    ];
    for (let i = 0; i < count && i < positions.length; i++) {
        const pos = positions[i];
        teams.push(new Team(i, pos.x, pos.y));
    }
}

initTeams(4);

function update() {
    // TODO: game logic will go here
}

function draw() {
    ctx.fillStyle = Renderer.Colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // TODO: drawing logic will go here
    const cellWidth = canvas.width / gameMap.width;
    const cellHeight = canvas.height / gameMap.height;
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
    Renderer.drawCircle(ctx, canvas.width / 2, canvas.height / 2, 20, Renderer.Colors.ant);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
