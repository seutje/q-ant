const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sugarDisplay = document.getElementById('sugarDisplay');
const workerDisplay = document.getElementById('workerDisplay');
const soldierDisplay = document.getElementById('soldierDisplay');
const messageDisplay = document.getElementById('gameMessage');
const setupScreen = document.getElementById('setupScreen');
const seedInput = document.getElementById('seedInput');
const startButton = document.getElementById('startButton');

let rng;
let GameState;
let gameMap;
let teams;
let playerController;
let aiControllers;
let animationStarted = false;

function areEnemies(id1, id2) {
    return id1 !== id2;
}

class Ant {
    constructor(x, y, teamId) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = 1;
        this.teamId = teamId;
        this.state = 'wandering';
        this.damageTimer = 0;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.damageTimer = 5;
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
                team.flashTimer = 5;
                this.carrying = 0;
                this.state = 'WANDERING';
            }
        }
    }
}

class Soldier extends Ant {
    constructor(x, y, teamId) {
        super(x, y, teamId);
        this.state = 'DEFENDING';
        this.damage = 1;
        this.range = 1;
        this.health = 2;
    }

    findEnemyInRange(range) {
        for (const unit of GameState.units) {
            if (areEnemies(unit.teamId, this.teamId) && unit.health > 0) {
                const dist = Math.abs(unit.x - this.x) + Math.abs(unit.y - this.y);
                if (dist <= range) {
                    return unit;
                }
            }
        }
        return null;
    }

    moveTowards(x, y) {
        if (this.x < x) this.x++; else if (this.x > x) this.x--;
        if (this.y < y) this.y++; else if (this.y > y) this.y--;
    }

    update() {
        const team = teams[this.teamId];
        if (team.attackMode && this.state !== 'ATTACKING') {
            this.state = 'ATTACKING';
        } else if (!team.attackMode && this.state === 'ATTACKING') {
            this.state = 'DEFENDING';
        }
        let target = this.findEnemyInRange(this.range);
        if (target) {
            target.takeDamage(this.damage);
            return;
        }
        if (this.state === 'DEFENDING') {
            const dist = Math.abs(this.x - team.nest.x) + Math.abs(this.y - team.nest.y);
            if (dist > 3) {
                this.moveTowards(team.nest.x, team.nest.y);
            } else {
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
            }
        } else if (this.state === 'ATTACKING') {
            const enemyTeam = teams.find(t => t.id !== this.teamId);
            if (enemyTeam) {
                this.moveTowards(enemyTeam.nest.x, enemyTeam.nest.y);
            }
        }
        target = this.findEnemyInRange(this.range);
        if (target) {
            target.takeDamage(this.damage);
        }
    }
}

class Private extends Soldier {
    constructor(x, y, teamId) {
        super(x, y, teamId);
        this.health = 3;
        this.damage = 1;
    }
}

class General extends Soldier {
    constructor(x, y, teamId) {
        super(x, y, teamId);
        this.health = 6;
        this.damage = 2;
    }
}

class Artillery extends Soldier {
    constructor(x, y, teamId) {
        super(x, y, teamId);
        this.health = 2;
        this.damage = 2;
        this.range = 3;
    }
}

class Team {
    constructor(id, x, y) {
        this.id = id;
        this.nest = { x, y };
        this.sugar = 20;
        this.queen = new Queen(x, y, id);
        this.attackMode = false;
        this.alive = true;
        this.flashTimer = 0;
    }
}

class PlayerController {
    constructor(team) {
        this.team = team;
        this.initInput();
        this.initUI();
    }

    initInput() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'w':
                    this.team.queen.birthAnt(Worker, 5);
                    break;
                case 'p':
                    this.team.queen.birthAnt(Private, 10);
                    break;
                case 'g':
                    this.team.queen.birthAnt(General, 20);
                    break;
                case 'r':
                    this.team.queen.birthAnt(Artillery, 15);
                    break;
                case 'a':
                    this.team.attackMode = !this.team.attackMode;
                    break;
            }
        });
    }

    initUI() {
        this.workerBtn = document.getElementById('btnWorker');
        this.privateBtn = document.getElementById('btnPrivate');
        this.generalBtn = document.getElementById('btnGeneral');
        this.artilleryBtn = document.getElementById('btnArtillery');
        this.attackBtn = document.getElementById('btnAttack');
        if (this.workerBtn)
            this.workerBtn.addEventListener('click', () => this.team.queen.birthAnt(Worker, 5));
        if (this.privateBtn)
            this.privateBtn.addEventListener('click', () => this.team.queen.birthAnt(Private, 10));
        if (this.generalBtn)
            this.generalBtn.addEventListener('click', () => this.team.queen.birthAnt(General, 20));
        if (this.artilleryBtn)
            this.artilleryBtn.addEventListener('click', () => this.team.queen.birthAnt(Artillery, 15));
        if (this.attackBtn)
            this.attackBtn.addEventListener('click', () => { this.team.attackMode = !this.team.attackMode; });
    }

    updateUI() {
        if (!this.workerBtn) return;
        this.workerBtn.disabled = this.team.sugar < 5;
        this.privateBtn.disabled = this.team.sugar < 10;
        this.generalBtn.disabled = this.team.sugar < 20;
        this.artilleryBtn.disabled = this.team.sugar < 15;
        this.attackBtn.textContent = this.team.attackMode ? 'RETREAT' : 'ATTACK!';
    }

    update() {
        this.updateUI();
    }
}

class AIController {
    constructor(team) {
        this.team = team;
        this.timer = 0;
    }

    update() {
        this.timer++;
        const myUnits = GameState.units.filter(u => u.teamId === this.team.id);
        const workers = myUnits.filter(u => u instanceof Worker).length;
        const soldiers = myUnits.filter(u => u instanceof Soldier).length;
        if (workers < 5) {
            this.team.queen.birthAnt(Worker, 5);
        } else if (this.team.sugar >= 10) {
            this.team.queen.birthAnt(Private, 10);
        }
        if (this.timer > 600 && soldiers > 3) {
            this.team.attackMode = true;
            this.timer = 0;
        }
    }
}


function initGame(seed) {
    rng = RNG.createRNG(seed);
    gameMap = new GameMap(50, 50, rng);
    GameState = { teams: [], units: [], pheromones: [], gameOver: false };
    for (let y = 0; y < gameMap.height; y++) {
        const row = [];
        for (let x = 0; x < gameMap.width; x++) {
            row.push(0);
        }
        GameState.pheromones.push(row);
    }
    teams = GameState.teams;
    initTeams(4);
    playerController = new PlayerController(teams[0]);
    aiControllers = teams.slice(1).map(t => new AIController(t));
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
        const soldier = new Private(pos.x, pos.y, team.id);
        GameState.units.push(soldier);
    }
}

function birthAnt(team, AntType, cost = 10) {
    if (team.sugar >= cost) {
        team.sugar -= cost;
        const ant = new AntType(team.nest.x, team.nest.y, team.id);
        GameState.units.push(ant);
        return ant;
    }
    return null;
}

function startGame() {
    const seedStr = seedInput ? seedInput.value : '';
    const seed = seedStr ? parseInt(seedStr, 10) : Math.floor(Math.random() * 1e9);
    if (startButton) startButton.textContent = 'Restart Game';
    if (messageDisplay) {
        messageDisplay.style.display = 'none';
        messageDisplay.textContent = '';
    }
    if (setupScreen) setupScreen.style.display = 'none';
    initGame(seed);
    if (!animationStarted) {
        animationStarted = true;
        requestAnimationFrame(gameLoop);
    }
}

function update() {
    if (GameState.gameOver) return;
    // decay pheromones
    for (let y = 0; y < GameState.pheromones.length; y++) {
        for (let x = 0; x < GameState.pheromones[y].length; x++) {
            const current = GameState.pheromones[y][x];
            GameState.pheromones[y][x] = Math.max(0, current - 0.01);
        }
    }

    for (const unit of GameState.units) {
        if (unit.damageTimer > 0) {
            unit.damageTimer--;
        }
        if (typeof unit.update === 'function') {
            unit.update();
        }
    }
    playerController.update();
    for (const ai of aiControllers) {
        ai.update();
    }
    GameState.units = GameState.units.filter(u => u.health > 0);

    for (const team of teams) {
        if (team.alive && team.queen.health <= 0) {
            team.alive = false;
        }
        if (team.flashTimer > 0) {
            team.flashTimer--;
        }
    }
    checkGameOver();
}

function endGame(message) {
    GameState.gameOver = true;
    if (messageDisplay) {
        messageDisplay.textContent = message;
        messageDisplay.style.display = 'block';
    }
    if (setupScreen && startButton) {
        startButton.textContent = 'Restart Game';
        setupScreen.style.display = 'flex';
    }
}

function checkGameOver() {
    const aliveTeams = teams.filter(t => t.alive);
    if (!teams[0].alive) {
        endGame('Game Over');
    } else if (aliveTeams.length === 1) {
        endGame(aliveTeams[0].id === 0 ? 'You Win!' : 'Game Over');
    }
}

function draw() {
    Renderer.nextFrame();
    if (sugarDisplay) {
        sugarDisplay.textContent = `Sugar: ${teams[0].sugar}`;
    }
    if (workerDisplay) {
        const workers = GameState.units.filter(u => u.teamId === teams[0].id && u instanceof Worker).length;
        workerDisplay.textContent = `Workers: ${workers}`;
    }
    if (soldierDisplay) {
        const soldiers = GameState.units.filter(u => u.teamId === teams[0].id && u instanceof Soldier).length;
        soldierDisplay.textContent = `Soldiers: ${soldiers}`;
    }
    ctx.fillStyle = Renderer.Colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
                    Renderer.Colors.tree
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
        const nestColor = team.flashTimer > 0 ? '#ffff00' : (Renderer.Colors.nest || '#aaaa00');
        Renderer.drawRectangle(
            ctx,
            team.nest.x * cellWidth,
            team.nest.y * cellHeight,
            cellWidth,
            cellHeight,
            nestColor
        );
    }

    for (const unit of GameState.units) {
        let color = Renderer.Colors.ant;
        let size = Math.min(cellWidth, cellHeight) / 2;
        if (unit instanceof Queen) {
            color = Renderer.Colors.queen;
            size *= 1.2;
        } else if (unit instanceof Worker) {
            color = Renderer.Colors.worker;
            size *= 0.8;
        } else if (unit instanceof Private) {
            color = Renderer.Colors.private;
            size *= 0.8;
        } else if (unit instanceof General) {
            color = Renderer.Colors.general;
            size *= 1.2;
        } else if (unit instanceof Artillery) {
            color = Renderer.Colors.artillery;
        }
        if (unit.damageTimer > 0) {
            color = '#ffffff';
        }
        Renderer.drawAnt(
            ctx,
            unit.x * cellWidth + cellWidth / 2,
            unit.y * cellHeight + cellHeight / 2,
            size,
            color
        );
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

if (startButton) {
    startButton.addEventListener('click', startGame);
}
