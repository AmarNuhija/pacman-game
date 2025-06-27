import { gameState } from '../core/state.js';
import { collision  } from '../core/collision.js';

const { tileSize, tileMap, walls } = gameState;

export class Block {
  constructor (img, x, y, w, h) {
    Object.assign(this, { image: img, x, y, width: w, height: h });
    this.startX = x; this.startY = y;
    this.direction     = 'R';
    this.nextDirection = null;
    this.updateVelocity();
  }

  updateVelocity () {
    const v = tileSize / 4;            
    this.velocityX = (this.direction === 'L' ? -v : this.direction === 'R' ? v : 0);
    this.velocityY = (this.direction === 'U' ? -v : this.direction === 'D' ? v : 0);
  }
  updateDirection (dir) { this.direction = dir; this.updateVelocity(); }

  reset () {
    Object.assign(this, { x: this.startX, y: this.startY,
                          direction: 'R', nextDirection: null });
    this.updateVelocity();
    this.image = gameState.pacmanRightImage;
  }

  isCentered () { return this.x % tileSize === 0 && this.y % tileSize === 0; }


  canMove (dir) {
    const cx = this.x + this.width  / 2;
    const cy = this.y + this.height / 2;
    let r = Math.floor(cy / tileSize);
    let c = Math.floor(cx / tileSize);
    if (dir === 'U') r--; else if (dir === 'D') r++;
    else if (dir === 'L') c--; else if (dir === 'R') c++;
    if (r < 0 || r >= gameState.rowCount || c < 0 || c >= gameState.columnCount)
      return false;
    return tileMap[r][c] !== 'X';
  }
}


export function handleInput (e) {
  if (gameState.gameOver) {
    if (e.code === 'Enter') {
      gameState.started  = false;
      gameState.gameOver = false;
      const img = {
        wall        : gameState.wallImage,
        blueGhost   : gameState.blueGhostImage,
        orangeGhost : gameState.orangeGhostImage,
        pinkGhost   : gameState.pinkGhostImage,
        redGhost    : gameState.redGhostImage,
        pacmanUp    : gameState.pacmanUpImage,
        pacmanDown  : gameState.pacmanDownImage,
        pacmanLeft  : gameState.pacmanLeftImage,
        pacmanRight : gameState.pacmanRightImage
      };
      import('../core/grid.js').then(m => m.loadMap(img));
      gameState.score = 0; gameState.lives = 3;
    }
    return;
  }

  const p = gameState.pacman; if (!p) return;
  let dir = null;
  switch (e.code) {
    case 'ArrowUp':   case 'KeyW': dir = 'U'; break;
    case 'ArrowDown': case 'KeyS': dir = 'D'; break;
    case 'ArrowLeft': case 'KeyA': dir = 'L'; break;
    case 'ArrowRight':case 'KeyD': dir = 'R'; break;
  }
  if (!dir) return;
  p.nextDirection = dir;

  if (!gameState.started) gameState.started = true;
}


export function updatePacman () {
  const p = gameState.pacman; if (!p) return;

  if (p.nextDirection && p.canMove(p.nextDirection) &&
      (p.isCentered() || (p.velocityX === 0 && p.velocityY === 0))) {
    p.updateDirection(p.nextDirection);
    p.image = {
      U: gameState.pacmanUpImage,
      D: gameState.pacmanDownImage,
      L: gameState.pacmanLeftImage,
      R: gameState.pacmanRightImage
    }[p.direction];
    p.nextDirection = null;
  }

  p.x += p.velocityX;
  p.y += p.velocityY;

  for (const w of walls) {
    if (collision(p, w)) {
      p.x -= p.velocityX; p.y -= p.velocityY;
      p.velocityX = p.velocityY = 0;
      break;
    }
  }
}