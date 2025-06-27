export const gameState = {
  tileSize   : 32,
  rowCount   : 21,
  columnCount: 19,
  get boardWidth () { return this.columnCount * this.tileSize; },
  get boardHeight() { return this.rowCount    * this.tileSize; },

  context : null,
  walls   : new Set(),
  foods   : new Set(),
  ghosts  : new Set(),
  pacman  : null,

  started  : false, 
  gameOver : false,
  paused   : false,
  powerUpActive: false, // New state for power-up
  powerUpTimer: null,   // New timer for power-up duration

  score : 0,
  lives : 3,

  tileMap : [
    "XXXXXXXXXXXXXXXXXXX",
    "XOOOOOOO X OOOOOOOOX", // Power pellets added here
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "XOOX X       X XOOX", // Power pellets added here
    "XXXX X XXrXX X XXXX",
    "X       bpo       X",
    "XXXX X XXXXX X XXXX",
    "XOOX X       X XOOX", // Power pellets added here
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "XOOOOOOO X OOOOOOOOX", // Power pellets added here
    "XXXXXXXXXXXXXXXXXXX"
  ]
};

export function resetPositions () {
  const { pacman, ghosts } = gameState;
  if (!pacman) return;

  pacman.reset();
  ghosts.forEach(g => { g.reset(); });
  // Ensure ghosts revert to normal state after reset
  ghosts.forEach(g => {
    g.mode = 'scatter'; // Or 'chase' depending on initial game phase
    g.image = g.baseImage;
  });
  gameState.powerUpActive = false;
  if (gameState.powerUpTimer) {
    clearTimeout(gameState.powerUpTimer);
    gameState.powerUpTimer = null;
  }
}
