import { Ant } from './ant.js';
import { gameState } from './entities.js';
import { ANT_COST } from './constants.js';

const ATTACK_COOLDOWN = 8000; // ms between AI attacks
let lastAttack = [0, 0, 0, 0];

export function runAI(delta) {
  gameState.teams.forEach((team, tid) => {
    if (!window.demoMode && tid === 0) return; // skip human unless demo

    // Skip AI actions if the team's queen is dead
    const queenAlive = gameState.ants.some(
      a => a.type === 'queen' && a.team === tid && !a.dead
    );
    if (!queenAlive) {
      return;
    }

    const now = performance.now();
    const ants = gameState.ants.filter(a => a.team === tid && !a.dead);
    const workers = ants.filter(a => a.type === 'worker').length;
    const soldiers = ants.length - workers;

    // build logic – reacts to enemy army size
    const enemySoldiers = gameState.ants.filter(a => a.team === 0 && !['worker','queen'].includes(a.type)).length;
    let nextType = null;
    if (workers < 3) nextType = 'worker';
    else if (soldiers < enemySoldiers + 1) nextType = Math.random() < 0.5 ? 'private' : 'artillery';
    else if (Math.random() < 0.2) nextType = 'general';

    if (nextType && team.sugar >= ANT_COST[nextType]) {
      team.sugar -= ANT_COST[nextType];
      const { x, y } = team.queen;
      gameState.ants.push(new Ant(nextType, tid, x + (Math.random() - 0.5), y + (Math.random() - 0.5)));
    }

    // attack trigger
    if (now - lastAttack[tid] > ATTACK_COOLDOWN && soldiers >= 3) {
      setTeamAttackMode(tid);
      lastAttack[tid] = now;
    }
  });
}

function setTeamAttackMode(teamId) {
  gameState.ants
    .filter(a => a.team === teamId && !['worker','queen'].includes(a.type))
    .forEach(a => a.state = 'attacking');
}