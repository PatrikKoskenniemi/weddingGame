// ============================================================
// TINY WEDDING GAME – GAME LOGIC
// This is YOUR file! Implement the functions below.
// ============================================================

function updatePlayerPosition(player, keysPressed) {
  let dx = 0;
  let dy = 0;

  if(keysPressed.ArrowUp){
    player.y = player.y-1
  }
    if(keysPressed.ArrowDown){
    player.y = player.y+1
  }
      if(keysPressed.ArrowLeft){
    player.x = player.x-1
  }
      if(keysPressed.ArrowRight){
    player.x = player.x+1
  }

}

function checkHeartCollection(player, hearts) {
  // TODO: Check if player overlaps any hearts
  // TODO: Remove collected hearts from the array
  // TODO: Return total points collected this frame
  return 0;
}
