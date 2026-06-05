# Tiny Wedding Game

Hej brudparet!

Det här är ett litet spel som vi har byggt till er. Ni ska live-koda spellogiken tillsammans på scenen medan alla tittar på storbilden. Inga panik — det är lättare än det låter!

## Hur kör man spelet?

1. Öppna en terminal i projektmappen
2. Kör: `python3 -m http.server 8080`
3. Öppna `http://localhost:8080` i Chrome
4. Spara filen och tryck F5 (eller CMD + R) för att ladda om efter ni ändrat koden

## Er fil

Ni behöver bara röra **en enda fil**: `gameLogic.js`

Den innehåller tre funktioner som ni ska implementera:

### `updatePlayerPosition(player, keysPressed)`
Få figuren att röra sig med piltangenterna.
- `player.x` och `player.y` är figurens position
- `keysPressed.ArrowUp/Down/Left/Right` är `true` om tangenten är nedtryckt

### `pushCharacters(player, characters)`
Låt figuren knuffa på karaktärerna.
- `characters` är en lista med karaktärer, varje en har `x`, `y` och `size`
- Flytta en karaktär bort från figuren om dom överlappar

### `checkHeartCollection(player, hearts)`
Ta bort hjärtan som figuren rör vid.
- `hearts` är en lista med hjärtan, varje ett har `x`, `y` och `size`
- Använd `hearts.splice(i, 1)` för att ta bort ett hjärta från listan

## Fusklapp

| Variabel | Värde | Beskrivning |
|----------|-------|-------------|
| `player.x` | | Figurens x-position (mitten) |
| `player.y` | | Figurens y-position (mitten) |
| `player.size` | 48 | Figurens storlek |
| `player.speed` | 4 | Figurens hastighet |
| `characters[i].x` | | Karaktärens x-position |
| `characters[i].y` | | Karaktärens y-position |
| `characters[i].size` | 64 | Karaktärens storlek |
| `hearts[i].x` | | Hjärtats x-position |
| `hearts[i].y` | | Hjärtats y-position |
| `hearts[i].size` | 32 | Hjärtats storlek |

Lycka till, och grattis!
