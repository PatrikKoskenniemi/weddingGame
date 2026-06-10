function updatePlayerPosition(player, keysPressed) {
    if (keysPressed.ArrowUp)    player.y -= player.speed;
    if (keysPressed.ArrowDown)  player.y += player.speed;
    if (keysPressed.ArrowLeft)  player.x -= player.speed;
    if (keysPressed.ArrowRight) player.x += player.speed;
}
