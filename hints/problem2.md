# Problem 2 – Push characters

**Function:** `pushCharacters(player, characters)`

---

**Hint 1**
Loop through each character. If Annie is close enough to one, push it away. Check the horizontal and vertical distance separately.

**Hint 2**
`dx = c.x - player.x` gives the horizontal gap. `Math.abs(dx)` removes the sign so you can compare it against the combined size. Do the same for `dy`. If both are within range, they are touching.

**Hint 3**
When they are touching, push the character away: if `dx > 0` the character is to Annie's right — push it further right (`c.x += player.speed`). If `dx <= 0` push it left (`c.x -= player.speed`). Do the same for `dy`.
