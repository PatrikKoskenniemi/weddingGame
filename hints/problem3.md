# Problem 3 – Collect hearts

**Function:** `checkHeartCollection(player, hearts)`

---

**Hint 1**
Calculate the distance between Annie and each heart. If it is less than the sum of their radii (`player.size/2 + hearts[i].size/2`), she is touching it.

**Hint 2**
Remove a heart with `hearts.splice(i, 1)`. After splicing, the next element slides into index `i` and would be skipped. Loop **backwards** — start at `hearts.length - 1` and count down to `0`.

**Hint 3**
```js
for (let i = hearts.length - 1; i >= 0; i--) {
    const dx = player.x - hearts[i].x;
    const dy = player.y - hearts[i].y;
    if (Math.sqrt(dx*dx + dy*dy) < player.size/2 + hearts[i].size/2) {
        hearts.splice(i, 1);
    }
}
```
