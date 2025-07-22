# Q-Ant: 2D RTS Game Development Plan

This document outlines the tasks for creating "Q-Ant", a 2D real-time strategy simulation game built in HTML Canvas.

---

### Phase 1: Core Engine & Rendering Foundation

The goal of this phase is to set up the basic project structure and create a rendering engine capable of drawing primitive shapes on the canvas, which will represent our game objects.

- [x] **1. Project Scaffolding**
    - [x] 1.1. Create `index.html` to host the canvas.
    - [x] 1.2. Create `style.css` for basic page and canvas styling.
    - [x] 1.3. Create `game.js` which will contain the main game logic.
- [x] **2. Canvas and Game Loop**
    - [x] 2.1. Initialize the HTML canvas element and its 2D rendering context.
    - [x] 2.2. Implement the main game loop (`requestAnimationFrame`) that will consistently update and draw the game state.
    - [x] 2.3. Separate logic into `update()` and `draw()` functions.
- [x] **3. Pixel Art Rendering Module**
    - [x] 3.1. Create a rendering helper or module.
    - [x] 3.2. Implement functions to draw basic shapes (e.g., `drawCircle`, `drawRectangle`, `drawLine`) which will be used for all game elements (ants, nests, resources). No sprites or textures will be used.
    - [x] 3.3. Establish a color palette for the game's pixel art style.

---

### Phase 2: Game World & Procedural Map Generation

This phase focuses on creating the environment where the game takes place. The map will be procedurally generated but repeatable using seeds.

- [x] **1. Seedable Random Number Generator (RNG)**
    - [x] 1.1. Implement or import a simple pseudo-random number generator (PRNG) that can be initialized with a specific seed.
- [x] **2. Map Generation**
    - [x] 2.1. Create a data structure to hold the map grid (e.g., a 2D array).
    - [x] 2.2. Implement a procedural generation algorithm (e.g., using Perlin/Simplex noise or another method) to create a forest-themed background texture.
    - [x] 2.3. Ensure the generation logic uses the seeded RNG.
- [x] **3. Resource Placement**
    - [x] 3.1. Define the three sugar resource types: Soda Puddle, Corn Syrup Puddle, and Energy Drink Puddle, with properties for sugar amount and rarity.
    - [x] 3.2. During map generation, strategically place these resources on the map, respecting their rarity.
- [x] **4. Player & AI Setup**
    - [x] 4.1. Designate 4 fixed starting locations in the corners of the map for the nests.
    - [x] 4.2. Implement logic to initialize up to 4 teams (1 player, 3 AI or 4 AI) at these locations.

---

### Phase 3: Core Gameplay Loop & Ant Behavior

This phase introduces the primary game units and their fundamental autonomous behaviors.

- [x] **1. Game State Manager**
    - [x] 1.1. Create a central object to manage the state of the game, including sugar counts for each team, all active units, and pheromone trails.
- [x] **2. Ant Unit Blueprint**
    - [x] 2.1. Create a base `Ant` class or object factory with common properties like position, velocity, health, team ID, and state (e.g., 'wandering', 'gathering', 'attacking').
- [x] **3. Queen Ant**
    - [x] 3.1. Create the `Queen` ant type.
    - [x] 3.2. The Queen is stationary within the nest.
    - [x] 3.3. Implement a `birthAnt(type)` function that consumes sugar and adds a new ant of the specified type to the game.
- [x] **4. Worker Ant & Pheromones**
    - [x] 4.1. Create the `Worker` ant type.
    - [x] 4.2. Implement a state machine for worker behavior:
        - `WANDERING`: Move randomly to find sugar.
        - `GATHERING`: If it finds sugar, gather it and switch state.
        - `RETURNING`: Travel back to the nest. While returning with food, lay down a pheromone trail.
    - [x] 4.3. Implement the pheromone system:
        - A separate data layer on the map that stores pheromone strength.
        - Pheromones guide other workers to food.
        - Pheromones decay and disappear over time.
    - [x] 4.4. When a worker returns to the nest, the team's sugar total is increased.

---

### Phase 4: Soldier Ants & Combat System

This phase implements the military aspect of the game, including different soldier types and combat mechanics.

- [ ] **1. Soldier Ant Types**
    - [ ] 1.1. Create the `Private` ant: cheap, fast, low health, low damage.
    - [ ] 1.2. Create the `General` ant: expensive, slow, high health, high damage.
    - [ ] 1.3. Create the `Artillery` ant: medium cost/speed, low health, ranged attack.
    - [ ] 1.4. Ensure each soldier type has distinct visual characteristics (size, color).
- [ ] **2. Soldier Behavior**
    - [ ] 2.1. Implement `DEFENDING` state: Soldiers stay near their nest and automatically attack any enemy ants within a certain radius.
    - [ ] 2.2. Implement `ATTACKING` state: When the global 'Attack' command is issued, all soldiers from that team will pathfind towards the nearest enemy queen and attack any enemies they encounter along the way.
- [ ] **3. Combat Logic**
    - [ ] 3.1. Implement health and damage calculations.
    - [ ] 3.2. When an ant's health reaches zero, it is removed from the game.
    - [ ] 3.3. For the Artillery ant, implement ranged attack logic (attacking without needing to be adjacent to the target).

---

### Phase 5: Player & AI Controllers

This phase focuses on how the player and the AI make high-level strategic decisions.

- [ ] **1. Player Controller**
    - [ ] 1.1. Create a system to handle player input.
    - [ ] 1.2. Link UI buttons to the player's queen to spend sugar on creating specific ant types.
    - [ ] 1.3. Implement the master "ATTACK!" button for the player.
- [ ] **2. AI Controller**
    - [ ] 2.1. Create a controller for each AI team.
    - [ ] 2.2. Implement a decision-making tree for the AI:
        - Logic to decide when to create workers vs. soldiers. (e.g., "if I have fewer than 10 workers, build a worker, otherwise build a soldier").
        - Logic to decide which type of soldier to build.
        - Logic to decide when to trigger the master "ATTACK!" command.
- [ ] **3. Team System**
    - [ ] 3.1. Solidify the team/faction system to ensure ants correctly identify friends and foes.

---

### Phase 6: UI & Game State Management

This phase is about providing the player with the necessary information and controls to play the game and defining the win/loss conditions.

- [ ] **1. User Interface (UI)**
    - [ ] 1.1. Display the player's current sugar count.
    - [ ] 1.2. Create HTML buttons for creating each ant type. Buttons should be disabled if there is not enough sugar.
    - [ ] 1.3. Create the main "ATTACK!" button.
    - [ ] 1.4. Display the number of active worker and soldier ants.
- [ ] **2. Game State**
    - [ ] 2.1. Implement win/loss conditions. A team loses when its queen is destroyed.
    - [ ] 2.2. The game ends when only one team remains or the player's team is defeated.
    - [ ] 2.3. Display a "You Win" or "Game Over" message.
- [ ] **3. Game Setup Screen**
    - [ ] 3.1. Create a simple starting screen where the player can input a map seed or start with a random one.
    - [ ] 3.2. Add a button to start/restart the game.

---

### Phase 7: Polish & Balancing

This final phase involves refining the game to make it more enjoyable and challenging.

- [ ] **1. Visual Enhancements**
    - [ ] 1.1. Refine the pixel art for ants and terrain.
    - [ ] 1.2. Add simple animations (e.g., walking legs, attack animations).
    - [ ] 1.3. Add visual feedback for events (e.g., damage indicators, sugar collection particles).
- [ ] **2. Gameplay Balancing**
    - [ ] 2.1. Tweak all numerical values: sugar yields, ant costs, health, damage, speed, etc.
    - [ ] 2.2. Playtest to ensure no single strategy is overpowered.
- [ ] **3. AI Improvements**
    - [ ] 3.1. Enhance the AI decision-making logic to be more adaptive to the player's strategy.
- [ ] **4. Sound (Optional)**
    - [ ] 4.1. Add simple sound effects for key events: ant creation, resource gathering, combat, and queen destruction.
