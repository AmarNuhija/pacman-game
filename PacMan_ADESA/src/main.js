// main.js

import { gameState, resetPositions }   from './core/state.js';
import { loadMap }                     from './core/grid.js';
import { handleInput, updatePacman }   from './characters/pacman.js';
import { updateGhosts }                from './characters/ghost.js';
import { drawGame }                    from './ui/draw.js';
import { collision }                   from './core/collision.js';
import { sfx }                         from './features/sound.js';

export function loadImages () {
  const src = {
    wall:'assets/images/wall.png',
    blueGhost:'assets/images/blueGhost.png',
    orangeGhost:'assets/images/orangeGhost.png',
    pinkGhost:'assets/images/pinkGhost.png',
    redGhost:'assets/images/redGhost.png',
    frightenedGhost:'assets/images/blueGhost.png', // Temporarily use blueGhost image
    powerPellet:'assets/images/powerPellet.png',         // New: Power Pellet Image
    pacmanUp:'assets/images/pacmanUp.png',
    pacmanDown:'assets/images/pacmanDown.png',
    pacmanLeft:'assets/images/pacmanLeft.png',
    pacmanRight:'assets/images/pacmanRight.png'
  };

  const img = {};
  let done = 0;
  const need = Object.keys(src).length;

  for (const [k, path] of Object.entries(src)) {
    const i = new Image();
    i.src = path;
    img[k] = i;
    gameState[k + 'Image'] = i;

    i.onload = () => {
      if (++done === need) init(img);
    };

    i.onerror = () => console.error('Bild fehlt:', path);
  }
}

const { walls, foods, ghosts } = gameState;
const FRAME_INTERVAL = 50; // Milliseconds per frame

let lastTime = 0;
let animationRunning = false;
let ghostEatMultiplier = 1; // For scoring eaten ghosts (200, 400, 800, 1600)

window.onload = () => {
  const canvas = document.getElementById('board');
  canvas.width = gameState.boardWidth;
  canvas.height = gameState.boardHeight;
  gameState.context = canvas.getContext('2d');
  loadImages();
};

function init(img) {
  loadMap(img);
  gameState.score = 0;
  gameState.lives = 3;
  gameState.started = false;
  gameState.gameOver = false;
  gameState.paused = false;
  gameState.powerUpActive = false;
  ghostEatMultiplier = 1; // Reset multiplier

  document.addEventListener('keydown', handleInput);

  if (!animationRunning) {
    animationRunning = true;
    lastTime = performance.now();
    loop(lastTime);
  }
}

function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  if (gameState.started && !gameState.gameOver && !gameState.paused) {
    updatePacman();
    updateGhosts(dt);

    const p = gameState.pacman;
    if (p) {
      // Pac-Man collision with Ghosts
      for (const g of ghosts) {
        if (collision(p, g)) {
          if (g.mode === 'frightened' && !g.eaten) {
            // Pac-Man eats a frightened ghost
            sfx.ghosteat.play();
            g.eaten = true; // Mark ghost as eaten
            g.image = gameState.blueGhostImage; // Or a specific 'eaten' ghost image
            g.mode = 'eaten'; // New mode for returning to ghost house
            gameState.score += (200 * ghostEatMultiplier);
            ghostEatMultiplier *= 2; // Increase multiplier for subsequent ghosts
          } else if (!g.eaten) { // Only lose life if ghost is not eaten
            sfx.death.play();
            if (--gameState.lives <= 0) {
              gameState.gameOver = true;
            } else {
              gameState.paused = true;
              setTimeout(() => {
                resetPositions();
                gameState.started = false;
                gameState.paused = false;
                ghostEatMultiplier = 1; // Reset multiplier after losing a life
              }, 3000); // Pause for 3 seconds after death
            }
            break; // Break from ghost loop after collision
          }
        }
      }

      // Pac-Man collision with Food
      let eat = null;
      for (const f of foods) {
        if (collision(p, f)) {
          eat = f;
          break;
        }
      }
      if (eat) {
        foods.delete(eat);
        if (eat.type === 'powerPellet') {
          gameState.score += 50;
          sfx.powerup.play();
          gameState.powerUpActive = true;
          ghostEatMultiplier = 1; // Reset multiplier when new power pellet is eaten

          // Set all ghosts to frightened mode
          ghosts.forEach(g => {
            if (!g.eaten) { // Don't change mode if ghost is already eaten
                g.mode = 'frightened';
                g.image = gameState.frightenedGhostImage;
            }
          });

          // Clear any existing power-up timer
          if (gameState.powerUpTimer) {
            clearTimeout(gameState.powerUpTimer);
          }

          // Set timer to end power-up mode
          gameState.powerUpTimer = setTimeout(() => {
            gameState.powerUpActive = false;
            ghosts.forEach(g => {
              if (!g.eaten) { // Don't change mode if ghost is eaten
                g.mode = 'scatter'; // Revert to scatter or chase based on game phase
                g.image = g.baseImage;
              }
            });
            gameState.powerUpTimer = null;
          }, 8000); // Power-up lasts 8 seconds
        } else {
          gameState.score += 10;
          sfx.chomp.play(); // Play chomp sound for regular pellets
        }
      }

      // Check if all food is eaten (level complete)
      if (foods.size === 0) {
        resetPositions();
        loadMap(gameState); // Reload map for next level (or just reset current)
        // Potentially increase difficulty here
      }
    }
  }

  drawGame();
  setTimeout(() => loop(performance.now()), FRAME_INTERVAL);
}
