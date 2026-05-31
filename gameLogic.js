// ============================================================
// TINY WEDDING GAME – GAME LOGIC
// This is YOUR file! Implement the functions below.
// ============================================================

function updatePlayerPosition(player, keysPressed) {
  let dx = 0;
  let dy = 0;
  const speed = 5
  if(keysPressed.ArrowUp){
    player.y = player.y-speed
  }
    if(keysPressed.ArrowDown){
    player.y = player.y+speed
  }
      if(keysPressed.ArrowLeft){
    player.x = player.x-speed
  }
      if(keysPressed.ArrowRight){
    player.x = player.x+speed
  }

}

function pushCharacters(player, characters) {
  const playerR = player.size / 2;

  for (const c of characters) {
    const r = c.size / 2;
    const dx = c.x - player.x;
    const dy = c.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = playerR + r;
    if (dist < minDist && dist > 0) {
      const overlap = minDist - dist;
      c.x += (dx / dist) * overlap;
      c.y += (dy / dist) * overlap;
    }
  }

  // Prevent the two characters from overlapping each other
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const a = characters[i];
      const b = characters[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.size / 2 + b.size / 2;
      if (dist < minDist && dist > 0) {
        const overlap = (minDist - dist) / 2;
        a.x -= (dx / dist) * overlap;
        a.y -= (dy / dist) * overlap;
        b.x += (dx / dist) * overlap;
        b.y += (dy / dist) * overlap;
      }
    }
  }
}

function checkHeartCollection(player, hearts) {
  // TODO: Check if player overlaps any hearts
  // TODO: Remove collected hearts from the array
  // TODO: Return total points collected this frame
  return 0;
}
