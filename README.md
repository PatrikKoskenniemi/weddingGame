# Tiny Wedding Game

Hej brudparet!

Det har finns ett litet spel som vi har byggt till er. Ni ska live-koda spellogiken tillsammans pa scenen medan alla tittar pa storbilden. Inga panik — det ar lattare an det later!

## Hur funkar det?

Spelet ar redan byggt och kors i webblasaren. Allt renderas, figuren syns, hjartan poppar upp — men ingenting funkar an! Det ar dar ni kommer in.

Ni ska skriva koden som far spelet att fungera. Ni behover bara rora **en enda fil**:

```
gameLogic.js
```

Det ar er fil. Allt annat ar fardigbyggt.

## Hur kor man spelet?

1. Oppna en terminal i projektmappen
2. Kor: `python3 -m http.server 8080`
3. Oppna `http://localhost:8080` i Chrome
4. Tryck F5 for att ladda om efter ni andrat koden

Ni behover aldrig stanga servern — bara spara filen och tryck F5!

## Vad ska ni gora?

I `gameLogic.js` finns tva funktioner som ni ska implementera:

### 1. `updatePlayerPosition(player, keysPressed)`

Fa figuren att rora sig med piltangenterna!

Ni har tillgang till:
- `player.x` och `player.y` — figurens position (mitten)
- `player.speed` — hur snabbt figuren ror sig (4)
- `keysPressed.ArrowUp`, `keysPressed.ArrowDown`, `keysPressed.ArrowLeft`, `keysPressed.ArrowRight` — `true` om tangenten ar nedtryckt

Tips:
- Flytta `player.x` och `player.y` baserat pa vilka tangenter som ar nedtryckta
- Anvand `player.speed` for att bestamma hur langt figuren ror sig
- Se till att figuren inte gar utanfor skarmkanten! Anvand `CANVAS_WIDTH` (1280) och `CANVAS_HEIGHT` (720)
- Bonusutmaning: om man gar diagonalt (tva tangenter samtidigt) ska man inte ga snabbare

### 2. `checkHeartCollection(player, hearts)`

Samla hjartan och fa poang!

Ni har tillgang till:
- `player.x`, `player.y`, `player.size` — figurens position och storlek
- `hearts` — en lista med hjartan, varje hjarta har `x`, `y`, `size` och `points`

Vad funktionen ska gora:
- Kolla om figuren overlappar nagot hjarta
- Ta bort hjartan som samlats in fran listan
- Returnera hur manga poang ni fick den har bildrutan

Tips:
- Tva objekt overlappar om avstandet mellan dem ar mindre an summan av deras halva storlekar
- Anvand `hearts.splice(i, 1)` for att ta bort ett hjarta fran listan
- Glomd inte att returnera poangen! (inte bara `0`)

## Fusklapp

Dessa variabler finns tillgangliga overallt i `gameLogic.js`:

| Variabel | Varde | Beskrivning |
|----------|-------|-------------|
| `CANVAS_WIDTH` | 1280 | Skarmens bredd |
| `CANVAS_HEIGHT` | 720 | Skarmens hojd |
| `player.x` | | Figurens x-position (mitten) |
| `player.y` | | Figurens y-position (mitten) |
| `player.size` | 48 | Figurens storlek |
| `player.speed` | 4 | Figurens hastighet |

Lycka till, och grattis!
