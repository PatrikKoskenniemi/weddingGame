# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A tiny browser-based 2D wedding game used as a live coding activity at a wedding. The couple live-codes gameplay logic on stage while the audience watches on a big screen. No build tools, no dependencies — just open `index.html` in a browser.

## Project Description

Create a small browser game used in a live wedding activity where the bride and groom will live-code the missing game logic on stage. The audience watches the game on a big screen while they implement functions step-by-step.

The game must:
- Run in browser (no setup risk)
- Be visually understandable for non-developers
- Have a working engine, rendering and game loop
- Have missing gameplay logic implemented in a separate file
- The couple will only edit one file: `gameLogic.js`

**Game concept:** A tiny 2D game where the player (blue square) represents the couple, and hearts (pink squares) are love points. The goal is to move around and collect hearts to gain score. Later phases of the wedding activity will add enemies and win conditions, but the starter project only includes movement (missing) and heart collection (missing).

### Function Requirements

**`updatePlayerPosition(player, keysPressed)`** must:
- Move player with arrow keys
- Prevent faster diagonal movement (normalize vector)
- Keep player inside canvas bounds
- Player position uses CENTER coordinates

**`checkHeartCollection(player, hearts)`** must:
- Detect collision between player and hearts (distance or AABB)
- Remove collected hearts from array
- Return total points collected this frame

### UX Requirements
- Movement must be smooth
- Hearts disappear when collected
- Score updates live
- This is crucial for audience engagement

### Tone / Design
- Dark background, bright player color, bright heart color
- Big readable score
- Minimal and clear visuals — designed for projection on a big screen

## Architecture

The project uses an **engine/logic separation** pattern:

- **engine.js** — Fully implemented, **DO NOT MODIFY**. Handles canvas rendering, input system, game loop, and heart spawning. Calls functions defined in `gameLogic.js` each frame.
- **gameLogic.js** — The only file the couple edits. Contains `updatePlayerPosition()` and `checkHeartCollection()` stubs.
- **index.html** — Entry point. Loads `gameLogic.js` before `engine.js` (order matters for function availability).

## Game Loop Flow

```
gameLoop() → updatePlayerPosition(player, keysPressed)
           → score += checkHeartCollection(player, hearts)
           → checkRespawn()
           → render()
```

## Key Globals (defined in engine.js, available in gameLogic.js)

- `CANVAS_WIDTH` (1280), `CANVAS_HEIGHT` (720)
- `player` — `{ x, y, size: 30, speed: 3 }` — position is CENTER of the square
- `hearts` — array of `{ x, y, size: 20, points: 1 }` — position is CENTER
- `keysPressed` — `{ ArrowUp, ArrowDown, ArrowLeft, ArrowRight }` booleans

## Running

Open `index.html` directly in a browser. No server or build step needed.

## Design Constraints

- Visuals must be minimal and high-contrast for big screen projection (dark bg, bright colors, large score text).
- Game should appear "alive but broken" when logic stubs are empty — rendering works, nothing moves or scores.
- Future phases may add enemies and win conditions to `gameLogic.js`.
