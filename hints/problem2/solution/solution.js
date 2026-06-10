function pushCharacters(player, characters) {
    for (const c of characters) {
        const dx = c.x - player.x;
        const dy = c.y - player.y;
        const minDist = player.size / 2 + c.size / 2;
        if (Math.abs(dx) < minDist && Math.abs(dy) < minDist) {
            c.x += dx > 0 ? player.speed : -player.speed;
            c.y += dy > 0 ? player.speed : -player.speed;
        }
    }
}
