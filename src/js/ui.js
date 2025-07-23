import { gameState } from './entities.js';
import { ANT_COST } from './constants.js';

const $ = id => document.getElementById(id);

export function updateUI() {
  const playerTeam = gameState.teams[0];
  $('sugarDisplay').textContent   = playerTeam.sugar;
  $('workerCount').textContent    = gameState.ants.filter(a => a.team === 0 && a.type === 'worker').length;
  $('soldierCount').textContent   = gameState.ants.filter(a => a.team === 0 && a.type !== 'worker' && a.type !== 'queen' && a.type !== 'defender').length;
  const playerQueen = gameState.ants.find(a => a.team === 0 && a.type === 'queen');
  $('playerQueenHp').textContent = playerQueen ? playerQueen.hp.toFixed(0) : 'N/A';

  // disable buttons if not enough sugar
  const playerQueenAlive = gameState.ants.some(a => a.team === 0 && a.type === 'queen' && !a.dead);
  Object.keys(ANT_COST).forEach(type => {
    $(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`).disabled =
      playerTeam.sugar < ANT_COST[type] || !playerQueenAlive;
  });
  $('btnAttack').disabled = !playerQueenAlive;

  // AI team stats
  gameState.teams.forEach(team => {
    if (team.id === 0) return; // Skip human player

    const teamPanel = $(`ui-team-${team.id}`);
    if (!teamPanel) return;

    const queen = gameState.ants.find(a => a.team === team.id && a.type === 'queen');
    const workers = gameState.ants.filter(a => a.team === team.id && a.type === 'worker').length;
    const soldiers = gameState.ants.filter(a => a.team === team.id && a.type !== 'worker' && a.type !== 'queen').length;

    teamPanel.innerHTML = `
      <h3>Team ${team.id}</h3>
      <div>Sugar: ${team.sugar}</div>
      <div>Workers: ${workers}</div>
      <div>Soldiers: ${soldiers}</div>
      <div>Queen HP: ${queen ? queen.hp.toFixed(0) : 'N/A'}</div>
    `;
  });
}

export function bindButtons(spawnFn, attackFn) {
  document.getElementById('btnWorker').onclick    = () => spawnFn('worker');
  document.getElementById('btnPrivate').onclick   = () => spawnFn('private');
  document.getElementById('btnGeneral').onclick   = () => spawnFn('general');
  document.getElementById('btnArtillery').onclick = () => spawnFn('artillery');
  document.getElementById('btnDefender').onclick  = () => spawnFn('defender');
  $('btnAttack').onclick    = attackFn;
  // Disable buttons if queen is dead
  const playerQueenAlive = gameState.ants.some(a => a.team === 0 && a.type === 'queen' && !a.dead);
  if (!playerQueenAlive) {
    Object.keys(ANT_COST).forEach(type => {
      $(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`).disabled = true;
    });
    $('btnAttack').disabled = true;
  }
}