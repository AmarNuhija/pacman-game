import { gameState } from '../core/state.js';

export function drawGame () {
  const ctx = gameState.context;
  ctx.clearRect(0,0,gameState.boardWidth,gameState.boardHeight);

  ctx.fillStyle = 'white';
for (const f of gameState.foods) {
          if (f.image) {
            ctx.drawImage(f.image, f.x, f.y, f.width, f.height);
          } else {
            // Draw a larger white circle/rectangle for power pellets if no image
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(f.x + f.width / 2, f.y + f.height / 2, f.width / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
  for (const w of gameState.walls) ctx.drawImage(w.image,w.x,w.y,w.width,w.height);

  for (const g of gameState.ghosts) ctx.drawImage(g.image,g.x,g.y,g.width,g.height);

  if (gameState.pacman)
    ctx.drawImage(gameState.pacman.image,gameState.pacman.x,gameState.pacman.y,
                  gameState.pacman.width,gameState.pacman.height);

  ctx.fillStyle='white'; ctx.font='14px sans-serif';
  if (gameState.gameOver) ctx.fillText(`Game Over: ${gameState.score}`,8,14);
  else                    ctx.fillText(`x${gameState.lives}  ${gameState.score}`,8,14);
}