function checkHeartCollection(player, hearts) {
        for (let i = hearts.length - 1; i >= 0; i--) {
        const dx = player.x - hearts[i].x;
        const dy = player.y - hearts[i].y;
        const minDist = player.size / 2 + hearts[i].size / 2;
        if (Math.abs(dx) < minDist && Math.abs(dy) < minDist) {
            hearts.splice(i, 1);
        }
    }
}
