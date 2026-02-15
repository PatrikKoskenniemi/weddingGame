// ============================================================
// TINY WEDDING GAME – GAME LOGIC
// This is YOUR file! Implement the functions below.
// ============================================================

function updatePlayerPosition(player, keysPressed) {
  let dx = 0;
  let dy = 0;

  if (keysPressed.ArrowUp) dy -= 1;
  if (keysPressed.ArrowDown) dy += 1;
  if (keysPressed.ArrowLeft) dx -= 1;
  if (keysPressed.ArrowRight) dx += 1;

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
  }

  player.x += dx * player.speed;
  player.y += dy * player.speed;

  // Keep player inside canvas bounds
  const half = player.size / 2;
  player.x = Math.max(half, Math.min(CANVAS_WIDTH - half, player.x));
  player.y = Math.max(half, Math.min(CANVAS_HEIGHT - half, player.y));
}

function checkHeartCollection(player, hearts) {
  // TODO: Check if player overlaps any hearts
  // TODO: Remove collected hearts from the array
  // TODO: Return total points collected this frame
  return 0;
}
