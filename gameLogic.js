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
    // TODO: Loop over characters
    // TODO: Calculate dx/dy between player and character
    // TODO: If close enough, push the character away from the player
}

function checkHeartCollection(player, hearts) {
  // TODO: Check if player overlaps any hearts
  // TODO: Remove collected hearts from the array
  // TODO: Return total points collected this frame
  return 0;
}
