import { gameState } from './state.js';
import { Block      } from '../characters/pacman.js';
import { Ghost      } from '../characters/ghost.js';

const { tileSize, tileMap } = gameState;

export function loadMap (img) {
  gameState.walls.clear();
  gameState.foods.clear();
  gameState.ghosts.clear();
  gameState.pacman = null;

  for (let r = 0; r < gameState.rowCount; r++) {
    for (let c = 0; c < gameState.columnCount; c++) {
      const chr = tileMap[r][c];
      const x = c * tileSize, y = r * tileSize;

      if      (chr === 'X') gameState.walls.add(new Block(img.wall,x,y,tileSize,tileSize));
      else if (chr === 'b') gameState.ghosts.add(new Ghost(img.blueGhost  ,x,y,tileSize,tileSize,'inky'));
      else if (chr === 'o') gameState.ghosts.add(new Ghost(img.orangeGhost,x,y,tileSize,tileSize,'clyde'));
      else if (chr === 'p') gameState.ghosts.add(new Ghost(img.pinkGhost  ,x,y,tileSize,tileSize,'pinky'));
      else if (chr === 'r') gameState.ghosts.add(new Ghost(img.redGhost   ,x,y,tileSize,tileSize,'blinky'));
      else if (chr === 'P') gameState.pacman = new Block(img.pacmanRight,x,y,tileSize,tileSize);
      else if (chr === ' ') gameState.foods.add(new Block(null,x+14,y+14,4,4, 'pellet')); // Added type 'pellet'
      else if (chr === 'O') gameState.foods.add(new Block(img.powerPellet,x+10,y+10,12,12, 'powerPellet')); // New: Power Pellet
    }
  }
}
