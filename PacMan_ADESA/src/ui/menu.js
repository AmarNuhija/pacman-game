// menu.js

import { gameState, resetPositions } from '../core/state.js';
import { sfx, muteAllSounds } from '../features/sound.js';
import { loadImages } from '../main.js';

const menu     = document.getElementById('game-menu');
const settings = document.getElementById('settings');
const devs     = document.getElementById('devs');
const items    = Array.from(menu.querySelectorAll('.menu-item a'));
const canvas   = document.getElementById('board');
const btnBack  = document.getElementById('btn-back-game');

let selected = 0;
items[selected].classList.add('selected');

document.addEventListener('keydown', e => {
  if (menu.style.display !== 'none') {
    if (e.key === 'ArrowDown') {
      items[selected].classList.remove('selected');
      selected = (selected + 1) % items.length;
      items[selected].classList.add('selected');
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      items[selected].classList.remove('selected');
      selected = (selected - 1 + items.length) % items.length;
      items[selected].classList.add('selected');
      e.preventDefault();
    } else if (e.key === 'Enter') {
      activate(items[selected].dataset.action);
      e.preventDefault();
    }
  }
});

items.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    activate(link.dataset.action);
  });
});

function activate(action) {
  menu.style.display = 'none';

  switch (action) {
    case 'new':
      startGame();
      break;
    case 'load':
      settings.style.display = 'block';
      break;
    case 'dev':
      devs.style.display = 'block';
      break;
  }
}

function startGame() {
  canvas.style.display = 'block';
  btnBack.style.display = 'block';
  sfx.beginning.play(); // Play beginning sound when starting game
}

btnBack.addEventListener('click', () => {
  resetPositions();
  gameState.started = false;
  gameState.gameOver = false;
  gameState.paused = false;

  canvas.style.display = 'none';
  btnBack.style.display = 'none';
  menu.style.display = 'block';

  items.forEach(i => i.classList.remove('selected'));
  selected = 0;
  items[selected].classList.add('selected');

  // sfx.munch.play(); // Removed this, as it's not typical for menu return
  loadImages(); // Re-load images to ensure fresh state
});

document.getElementById('btn-back-settings').addEventListener('click', () => {
  settings.style.display = 'none';
  menu.style.display = 'block';
});

document.getElementById('btn-back-dev').addEventListener('click', () => {
  devs.style.display = 'none';
  menu.style.display = 'block';
  items.forEach(i => i.classList.remove('selected'));
  selected = 0;
  items[selected].classList.add('selected');
});

document.getElementById('toggle-sound').addEventListener('change', e => {
  muteAllSounds(!e.target.checked);
});
