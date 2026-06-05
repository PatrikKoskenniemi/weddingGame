// ============================================================
// TINY WEDDING GAME – GAME LOGIC
// This is YOUR file! Implement the functions below.
// ============================================================

function updatePlayerPosition(player, keysPressed) {
  // TODO: Move the player using the arrow keys.
  //
  // Available variables:
  //   player.x            — horizontal position (increase = move right)
  //   player.y            — vertical position (increase = move down)
  //   player.speed        — how many pixels to move per frame (4)
  //   keysPressed.ArrowUp
  //   keysPressed.ArrowDown
  //   keysPressed.ArrowLeft
  //   keysPressed.ArrowRight — true while the key is held down
}

function pushCharacters(player, characters) {
  // TODO: Push each character away from the player when they overlap.
  //
  // Available variables:
  //   player.x, player.y, player.size
  //   characters[i].x, characters[i].y, characters[i].size
  //
  // Hint: two circles overlap when the distance between their centres
  //       is less than the sum of their radii (size / 2).
  //       Move the character along the dx/dy vector by the overlap amount.
}

function checkHeartCollection(player, hearts) {
  // TODO: Remove any heart the player is touching.
  //
  // Available variables:
  //   player.x, player.y, player.size
  //   hearts[i].x, hearts[i].y, hearts[i].size
  //
  // Hint: use the same distance check as pushCharacters.
  //       Use hearts.splice(i, 1) to remove a heart from the list.
  //       Loop backwards (i = hearts.length - 1 down to 0) when splicing.
}
