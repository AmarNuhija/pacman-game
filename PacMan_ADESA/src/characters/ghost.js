import { gameState } from '../core/state.js';
import { collision  } from '../core/collision.js';
import { Block      } from './pacman.js';

const { tileSize, tileMap, walls, ghosts } = gameState;

function centered (b) { return b.x % tileSize === 0 && b.y % tileSize === 0; }
function opposite  (d) { return {U:'D', D:'U', L:'R', R:'L'}[d]; }
function boxCollideStep (g) {
  for (const w of walls) if (collision(g, w)) return true;
  return false;
}
function tileFree (r, c) {
  if (r < 0 || r >= gameState.rowCount || c < 0 || c >= gameState.columnCount)
    return false;
  return tileMap[r][c] !== 'X';
}

export class Ghost extends Block {
  constructor(img, x, y, w, h, type) {
    super(img, x, y, w, h);
    this.baseImage = img;  
    this.type = type;
    this.mode = 'scatter'; // 'scatter', 'chase', 'frightened'
    this.eaten = false; // New state for when ghost is eaten
  }
  reset() {
    super.reset();
    this.image = this.baseImage;
    this.mode = 'scatter'; // Reset mode
    this.eaten = false; // Reset eaten state
  }

  targetTile () {
    const pac = gameState.pacman;
    const pr  = Math.floor((pac.y + pac.height/2) / tileSize);
    const pc  = Math.floor((pac.x + pac.width /2) / tileSize);

    if (this.mode === 'scatter') {
      return { blinky:{r:0,                       c:gameState.columnCount-1},
               pinky :{r:0,                       c:0},
               inky  :{r:gameState.rowCount-1,    c:gameState.columnCount-1},
               clyde :{r:gameState.rowCount-1,    c:0} }[this.type];
    } else if (this.mode === 'frightened' || this.eaten) {
        // In frightened mode or when eaten, ghosts scatter to a random corner or their home
        // For simplicity, let's make them target a random valid tile or their home
        // If eaten, they should return to the ghost house
        if (this.eaten) {
            // Target ghost house center (adjust coordinates as per your map)
            return { r: 9, c: 9 }; // Example: center of the ghost house
        } else {
            // Frightened: target a random corner or just move randomly
            const corners = [
                {r:0, c:0},
                {r:0, c:gameState.columnCount-1},
                {r:gameState.rowCount-1, c:0},
                {r:gameState.rowCount-1, c:gameState.columnCount-1}
            ];
            return corners[Math.floor(Math.random() * corners.length)];
        }
    }

    // Chase mode logic
    switch (this.type) {
      case 'blinky': return { r:pr, c:pc };
      case 'pinky':  return { r: pr + (pac.direction==='D'?4:pac.direction==='U'?-4:0),
                              c: pc + (pac.direction==='R'?4:pac.direction==='L'?-4:0) };
      case 'inky': {
        const bl = [...ghosts].find(g => g.type === 'blinky');
        const vr = pr + (pac.direction==='D'?2:pac.direction==='U'?-2:0);
        const vc = pc + (pac.direction==='R'?2:pac.direction==='L'?-2:0);
        return { r: vr*2 - Math.floor((bl.y+bl.height/2) / tileSize),
                 c: vc*2 - Math.floor((bl.x+bl.width /2) / tileSize) };
      }
      case 'clyde': {
        const gr = Math.floor((this.y+this.height/2)/tileSize);
        const gc = Math.floor((this.x+this.width /2)/tileSize);
        const dist2 = (pr-gr)**2 + (pc-gc)**2;
        return dist2 > 64 ? { r:pr, c:pc } : { r:gameState.rowCount-1, c:0 };
      }
    }
  }

  chooseDir () {
    if (!centered(this)) return;

    const dirs = ['U','L','D','R'];       
    let tgt;
    let best = this.direction, bestScore = 1e9;

    if (this.mode === 'frightened' || this.eaten) {
        // In frightened mode, ghosts move randomly (or towards home if eaten)
        const validDirs = dirs.filter(d => {
            if (d === opposite(this.direction)) return false; // Cannot reverse
            const r = Math.floor(this.y / tileSize) + (d==='U'?-1:d==='D'?1:0);
            const c = Math.floor(this.x / tileSize) + (d==='L'?-1:d==='R'?1:0);
            return tileFree(r,c);
        });
        if (validDirs.length > 0) {
            // If eaten, try to move towards target (ghost house)
            if (this.eaten) {
                tgt = this.targetTile();
                for (const d of validDirs) {
                    const r = Math.floor(this.y / tileSize) + (d==='U'?-1:d==='D'?1:0);
                    const c = Math.floor(this.x / tileSize) + (d==='L'?-1:d==='R'?1:0);
                    const score = (tgt.r - r)**2 + (tgt.c - c)**2;
                    if (score < bestScore) { bestScore = score; best = d; }
                }
            } else {
                // Frightened: choose a random valid direction
                best = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
        }
    } else {
        // Scatter/Chase mode logic
        tgt  = this.targetTile();
        dirs.forEach(d => {
            if (d === opposite(this.direction)) return;    
            const r = Math.floor(this.y / tileSize) + (d==='U'?-1:d==='D'?1:0);
            const c = Math.floor(this.x / tileSize) + (d==='L'?-1:d==='R'?1:0);
            if (!tileFree(r,c)) return;
            const score = (tgt.r - r)**2 + (tgt.c - c)**2;
            if (score < bestScore) { bestScore = score; best = d; }
        });
    }
    this.updateDirection(best);
  }
}

let modeTimer = 0;
const SCATTER_MS = 7000, CHASE_MS = 20000;
const FRIGHTENED_SPEED_FACTOR = 0.5; // Ghosts move slower when frightened
const EATEN_SPEED_FACTOR = 2.0; // Eaten ghosts move faster to return home

export function updateGhosts (dt) {
  // Only switch modes if not in frightened or eaten state
  if (!gameState.powerUpActive) {
    modeTimer += dt;
    const sample = ghosts.values().next().value;
    if (sample && modeTimer > (sample.mode==='scatter'?SCATTER_MS:CHASE_MS)) {
      ghosts.forEach(g => {
        if (!g.eaten) { // Don't change mode if ghost is eaten
            g.mode = g.mode==='scatter' ? 'chase' : 'scatter';
        }
      });
      modeTimer = 0;
    }
  }

  ghosts.forEach(g => {
    g.chooseDir();
    let currentSpeed = tileSize / 4; // Base speed
    if (g.mode === 'frightened') {
        currentSpeed *= FRIGHTENED_SPEED_FACTOR;
    } else if (g.eaten) {
        currentSpeed *= EATEN_SPEED_FACTOR;
    }

    g.velocityX = (g.direction === 'L' ? -currentSpeed : g.direction === 'R' ? currentSpeed : 0);
    g.velocityY = (g.direction === 'U' ? -currentSpeed : g.direction === 'D' ? currentSpeed : 0);

    g.x += g.velocityX; g.y += g.velocityY;

    if (boxCollideStep(g)) {     
      g.x -= g.velocityX; g.y -= g.velocityY;
      g.velocityX = g.velocityY = 0;
    }

    // If an eaten ghost reaches its home (approximate center of ghost house)
    if (g.eaten && centered(g) && Math.abs(g.x - (9 * tileSize)) < tileSize && Math.abs(g.y - (9 * tileSize)) < tileSize) {
        g.eaten = false;
        g.mode = 'scatter'; // Or 'chase' depending on current game phase
        g.image = g.baseImage;
    }
  });
}
