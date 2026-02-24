# Tiny Wedding Game

Hej brudparet!

Det här finns ett litet spel som vi har byggt till er. Ni ska live-koda spellogiken tillsammans på scenen medan alla tittar på storbilden. Inga panik — det är lättare än det låter!

## Hur funkar det?

Spelet är redan byggt och körs i webbläsaren. Allt renderas, figuren syns, hjärtan poppar upp — men ingenting funkar än! Det är där ni kommer in.

Ni ska skriva koden som får spelet att fungera. Ni behöver bara röra **en enda fil**:

```
gameLogic.js
```

Det är er fil. Allt annat är färdigbyggt.

## Hur kör man spelet?

1. Öppna en terminal i projektmappen
2. Kör: `python3 -m http.server 8080`
3. Öppna `http://localhost:8080` i Chrome
4. Tryck F5 för att ladda om efter ni ändrat koden

Ni behöver aldrig stänga servern — bara spara filen och tryck F5!

## Vad ska ni göra?

I `gameLogic.js` finns två funktioner som ni ska implementera:

### 1. `updatePlayerPosition(player, keysPressed)`

Få figuren att röra sig med piltangenterna!

Ni har tillgång till:
- `player.x` och `player.y` — figurens position (mitten)
- `player.speed` — hur snabbt figuren rör sig (4)
- `keysPressed.ArrowUp`, `keysPressed.ArrowDown`, `keysPressed.ArrowLeft`, `keysPressed.ArrowRight` — `true` om tangenten är nedtryckt

Tips:
- Flytta `player.x` och `player.y` baserat på vilka tangenter som är nedtryckta
- Använd `player.speed` för att bestämma hur långt figuren rör sig
- Se till att figuren inte går utanför skärmkanten! Använd `CANVAS_WIDTH` (1280) och `CANVAS_HEIGHT` (720)
- Bonusutmaning: om man går diagonalt (två tangenter samtidigt) ska man inte gå snabbare

### 2. `checkHeartCollection(player, hearts)`

Samla hjärtan och få poäng!

Ni har tillgång till:
- `player.x`, `player.y`, `player.size` — figurens position och storlek
- `hearts` — en lista med hjärtan, varje hjärta har `x`, `y`, `size` och `points`

Vad funktionen ska göra:
- Kolla om figuren överlappar något hjärta
- Ta bort hjärtan som samlats in från listan
- Returnera hur många poäng ni fick den här bildrutan

Tips:
- Två objekt överlappar om avståndet mellan dem är mindre än summan av deras halva storlekar
- Använd `hearts.splice(i, 1)` för att ta bort ett hjärta från listan
- Glöm inte att returnera poängen! (inte bara `0`)

## Fusklapp

Dessa variabler finns tillgängliga överallt i `gameLogic.js`:

| Variabel | Värde | Beskrivning |
|----------|-------|-------------|
| `CANVAS_WIDTH` | 1280 | Skärmens bredd |
| `CANVAS_HEIGHT` | 720 | Skärmens höjd |
| `player.x` | | Figurens x-position (mitten) |
| `player.y` | | Figurens y-position (mitten) |
| `player.size` | 48 | Figurens storlek |
| `player.speed` | 4 | Figurens hastighet |

Lycka till, och grattis!
