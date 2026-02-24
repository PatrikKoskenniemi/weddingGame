# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based 2D wedding game used as a live coding activity at a wedding. The couple live-codes gameplay logic on stage while the audience watches on a big screen. No build tools, no dependencies.

The game is a journey through the couple's life told in rooms. Each room has a theme, visual style, and a coding task. See `GAME_PLAN.md` for room designs.

## Running

```bash
python3 -m http.server 8080
# Open http://localhost:8080/index.html
```

Cache-busting is built into index.html — normal F5 refresh always loads fresh JS.

## Architecture

Load order: `spriteSystem.js` → `gameLogic.js` → `engine.js`

- **spriteSystem.js** — Sprite loading, caching, animation state, and drawing with colored-rectangle fallback. Defines `SPRITE_SHEETS` with frame layouts.
- **gameLogic.js** — The ONLY file the couple edits on stage. Contains stub functions they implement live.
- **engine.js** — Game loop, rendering, input, direction detection, heart spawning. Calls functions from gameLogic.js each frame. Auto-detects player facing direction from position delta.

## Game Loop Flow

```
gameLoop(currentTime)
  → deltaTime calculation
  → updatePlayerPosition(player, keysPressed)
  → score += checkHeartCollection(player, hearts)
  → updatePlayerDirection()          // auto-detect from position delta
  → updateSpriteAnimation(...)       // advance frame timers
  → checkRespawn()
  → render()
```

## Key Globals (defined in engine.js, available in gameLogic.js)

- `CANVAS_WIDTH` (1280), `CANVAS_HEIGHT` (720)
- `player` — `{ x, y, size: 48, speed: 4, sprite }` — position is CENTER
- `hearts` — array of `{ x, y, size: 32, points: 1, sprite }` — position is CENTER
- `keysPressed` — `{ ArrowUp, ArrowDown, ArrowLeft, ArrowRight }` booleans

## Sprite System

**Always consult `SPRITES.md` before working with sprites.** If you discover new information about sprite layouts or add new sprite sheets, update `SPRITES.md` to keep it accurate.

Key points:
- All character sprites from **Modern Interiors Free v2.2** use 16x32px frames
- Combined sheets (`_16x16.png`) are 384x224: Row 1 = idle, Row 2 = run
- Direction order in each row: right (col 0-5), up (6-11), left (12-17), down (18-23)
- Source assets at `/private/tmp/modern_interiors/Modern tiles_Free/Characters_free/`
- Item sprites from **Top-Down Retro Interior** at `/private/tmp/retro_interior/`
- `drawSprite()` falls back to colored rectangles when sprites aren't loaded

## Design Constraints

- Pokemon-inspired top-down pixel art aesthetic
- High-contrast for big screen projection (dark bg, bright sprites, large score text)
- `ctx.imageSmoothingEnabled = false` for crisp pixel art
- Game appears "alive but broken" when logic stubs are empty
- Some rooms use intentionally broken code for the couple to debug instead of writing from scratch
