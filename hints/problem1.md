# Problem 1 – Move the player

**Function:** `updatePlayerPosition(player, keysPressed)`

---

**Hint 1**
`keysPressed.ArrowUp` is `true` while the key is held. There are four keys to check: Up, Down, Left, Right.

**Hint 2**
`player.x` and `player.y` are the player's position. Increasing `x` moves right; increasing `y` moves down.

**Hint 3**
Use `player.speed` as how many pixels to move per frame. When ArrowRight is held: `player.x = player.x + player.speed`.
