import { gameState } from './entities.js';
import { ANT_COST } from './constants.js';

const $ = id => document.getElementById(id);

export function updateUI() {
  const team = gameState.teams[0];
  $('sugarDisplay').textContent   = team.sugar;
  $('workerCount').textContent    = gameState.ants.filter(a => a.team === 0 && a.type === 'worker').length;
  $('soldierCount').textContent   = gameState.ants.filter(a => a.team === 0 && a.type !== 'worker' && a.type !== 'queen').length;

  // disable buttons if not enough sugar
  Object.keys(ANT_COST).forEach(type => {
    $(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`).disabled =
      team.sugar < ANT_COST[type];
  });
}

export function bindButtons(spawnFn, attackFn) {
  document.getElementById('btnWorker').onclick    = () => spawnFn('worker');
  document.getElementById('btnPrivate').onclick   = () => spawnFn('private');
  document.getElementById('btnGeneral').onclick   = () => spawnFn('general');
  document.getElementById('btnArtillery').onclick = () => spawnFn('artillery');
  document.getElementById('btnAttack').onclick    = attackFn;
}