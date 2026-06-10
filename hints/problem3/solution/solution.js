function checkHeartCollection(player, hearts) {
    for (let i = hearts.length - 1; i >= 0; i--) {
        const dx = player.x - hearts[i].x;
        const dy = player.y - hearts[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < player.size / 2 + hearts[i].size / 2) {
            hearts.splice(i, 1);
        }
    }
}
