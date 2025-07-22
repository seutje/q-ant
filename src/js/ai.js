import { Ant } from './ant.js';
import { gameState } from './entities.js';
import { ANT_COST } from './constants.js';

export function runAI(delta) {
  gameState.teams.forEach((team, tid) => {
    if (tid === 0) return; // skip human

    const ants = gameState.ants.filter(a => a.team === tid && !a.dead);
    const workers = ants.filter(a => a.type === 'worker').length;
    const soldiers = ants.length - workers;

    // decide what to build
    let nextType = null;
    if (workers < 5) nextType = 'worker';
    else if (soldiers < 3) nextType = 'private';
    else if (Math.random() < 0.2) nextType = 'artillery';
    else if (Math.random() < 0.1) nextType = 'general';

    if (nextType && team.sugar >= ANT_COST[nextType]) {
      team.sugar -= ANT_COST[nextType];
      const { x, y } = team.queen;
      gameState.ants.push(new Ant(nextType, tid, x + Math.random() - 0.5, y + Math.random() - 0.5));
    }

    // attack trigger (simple timer)
    if (Math.random() < 0.0005 * delta) {
      setTeamAttackMode(tid);
    }
  });
}

function setTeamAttackMode(teamId) {
  gameState.ants
    .filter(a => a.team === teamId && a.type !== 'worker' && a.type !== 'queen')
    .forEach(a => a.state = 'attacking');
}