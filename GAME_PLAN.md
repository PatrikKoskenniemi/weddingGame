# Game Plan – Life Rooms

## Concept

The game is a journey through the couple's life, told in rooms. Each room represents a life stage, and the couple must live-code the gameplay mechanic for that stage on stage. The audience watches on a big screen.

Each room has:
- A **theme** (life stage)
- A **visual style** (colors, objects)
- A **gameplay objective** tied to the theme
- A **function to implement** (what the couple codes live)

Rooms progress from simple mechanics to more complex ones, building on previous code.

## Visual Style

Pokemon-inspired aesthetic throughout:
- Top-down 2D pixel art style
- Tile-based environments with clear, chunky sprites
- Dialog boxes / text boxes for room introductions (Pokemon-style bordered text box at bottom of screen)
- Room transitions similar to Pokemon area transitions
- Characters as small sprite-like figures

## Difficulty Approach

Not every room needs to be coded from scratch. Some rooms can have **broken implementations** that the couple must **debug and fix** instead of writing from zero. This lowers the difficulty, adds variety, and is funny for the audience (watching them find the bug).

Options per room:
- **Empty stub** — write the whole function (harder)
- **Broken code** — code is there but has bugs to fix (easier, funnier)
- **Partial code** — some logic works, finish the rest (medium)

## People & References

Real people and inside jokes from the couple's life should appear as characters, obstacles, or items throughout the game. This makes it personal and hilarious for the audience.

| Name | Context | How to use (TBD) |
|------|---------|-------------------|
| TjockSteffe | TBD | TBD |

*(Add more names as we learn them from friends and family)*

## Characters Per Room

Each room should have a unique player character that fits the life stage. The character changes as the story progresses.

| Room | Character | Notes |
|------|-----------|-------|
| 1 – Baby Steps | Baby | Crawling/toddler sprite |
| 2 – Single Life | TBD | Young adult, party vibe |
| 3 – First Date | TBD | Dressed up / romantic |
| 4 – Coding in the Dark | Programmer / Emo | Dark clothes, hoodie, emo-like feel |
| 5 – Moving In Together | TBD | Casual |
| 6 – Baby Born | TBD | Parent |
| 7 – Holiday Trip | TBD | Tourist |
| 8 – The Proposal | TBD | Dressed up |
| 9 – Wedding Day | Bride | Wedding dress sprite |

📋 **TODO:** Find or create specific character sprites for each room. Current asset pack (Modern Interiors Free v2.2) has: Adam, Alex, Amelia, Bob with walk/run/idle/sit/phone animations (16x32 frames).

---

## Rooms

### Room 1 – Baby Steps
**Life stage:** Babies learning to walk
**Objective:** Move the player around the room
**Mechanic:** Arrow key movement
**Function:** `updatePlayerPosition(player, keysPressed)`
- Move with arrow keys
- Normalize diagonal movement
- Stay inside bounds
**Visuals:** Pastel colors, pacifiers or rattles as decorations, soft feel
**Difficulty:** Easy
**Status:** ✅ CONFIRMED

---

### Room 2 – Single Life
**Life stage:** Young adults out in the world, dodging bad decisions
**Objective:** Dodge one night stands and other "obstacles" moving across the screen
**Mechanic:** Obstacle avoidance — obstacles move toward the player or across the screen, player must dodge
**Function:** `checkObstacleCollision(player, obstacles)`
- Check if player overlaps any obstacle
- Return true/false (engine handles life/damage)
**Also possible:** `updateObstacles(obstacles)` — move obstacles across screen
**Visuals:** Nightclub/bar vibe, neon colors, obstacles could be lipstick marks, drink glasses, etc.
**Difficulty:** Easy-Medium
**Status:** ✅ CONFIRMED

---

### Room 3 – First Date
**Life stage:** The couple meets and goes on their first date
**Objective:** TBD — something romantic and interactive
**Mechanic:** TBD
**Function:** TBD
**Visuals:** Warm colors, candlelight feel, romantic setting
**Difficulty:** Medium
**Status:** ⚠️ NEEDS: gameplay mechanic and coding task

Possible ideas to explore:
- NPC follows player (magnetic pull / gravity toward each other)
- Collect flowers/gifts to bring to a meeting point
- Two characters that must reach the same spot (pathfinding lite)

---

### Room 4 – Coding in the Dark
**Life stage:** Gustav and Elina had broken up, then ran into each other at a coding challenge event called "Coding in the Dark" (or similar). This was a turning point that brought them back together.
**Objective:** TBD — should tie into the coding challenge theme
**Mechanic:** TBD
**Function:** TBD
**Visuals:** Dark/dim screen, code-themed, terminal green text, dramatic reveal
**Difficulty:** TBD
**Status:** ⚠️ NEEDS: research + design

📋 **TODO:** Research what "Coding in the Dark" actually was — what kind of event, what did participants do? This will inform the mechanic.

Possible ideas:
- Screen is mostly blacked out, player codes "blind" (limited visibility radius)
- Two characters on opposite sides of the screen must find each other in the dark
- Flashlight mechanic — player can only see a small area around them

---

### Room 5 – Moving In Together
**Life stage:** First shared apartment
**Objective:** Arrange furniture — push items to target zones
**Mechanic:** Item pickup and placement / snapping to grid
**Function:** `checkPlacement(item, targetZone)`
- Check if item overlaps the target zone
- Return true/false for each item
- Engine shows visual feedback when placed correctly
**Visuals:** Apartment layout, furniture items, cozy feel
**Difficulty:** Easy-Medium
**Status:** ✅ CONFIRMED

---

### Room 6 – Baby Born
**Life stage:** Their daughter arrives
**Objective:** Catch falling baby items (bottles, diapers, teddy bears)
**Mechanic:** Items fall from top of screen, player catches them
**Function:** `updateFallingItems(items)`
- Move each item downward by its speed each frame
- Remove items that fall off the bottom of the screen
**Also:** `checkCatch(player, items)` — detect if player overlaps a falling item, remove it, return points
**Visuals:** Soft warm colors, nursery feel, baby items
**Difficulty:** Medium
**Status:** ✅ CONFIRMED

---

### Room 7 – The Holiday Trip
**Life stage:** A memorable trip together
**Objective:** Navigate a scrolling landscape, collecting souvenirs and avoiding obstacles
**Mechanic:** Auto-scrolling level, player moves up/down to collect items and dodge obstacles
**Function:** `updateScroll(objects, scrollSpeed)`
- Move all world objects (items + obstacles) to the left each frame
- Remove objects that go off-screen
**Visuals:** Travel themed — beach, mountains, landmarks
**Difficulty:** Medium
**Status:** ✅ CONFIRMED

---

### Room 8 – The Proposal
**Life stage:** The big question
**Objective:** Reach the ring / reach each other
**Mechanic:** Win condition — reach the goal
**Function:** TBD
**Visuals:** Romantic setting, spotlight on the ring/goal, dramatic feel
**Difficulty:** Easy-Medium
**Status:** ⚠️ NEEDS: coding task details

Possible ideas:
- Simple distance check to goal (too trivial?)
- Navigate through a heart-shaped path to reach the ring
- Timed challenge with countdown adding tension

---

### Room 9 – The Wedding Day (Finale)
**Life stage:** Today! The wedding itself
**Objective:** Collect all the hearts together — massive heart rain, celebration
**Mechanic:** Heart spawning and collection to hit a score target
**Function:** `spawnHeartWave(hearts, waveNumber)`
- Spawn hearts in patterns (rows, circles, random bursts)
- Increase count or speed with each wave
- Return the new hearts array
**Visuals:** White and gold, confetti particles, heart rain, celebration mode
**Difficulty:** Medium
**Status:** ✅ CONFIRMED

---

## Room Summary

| # | Room | Life Stage | Function | Status |
|---|------|-----------|----------|--------|
| 1 | Baby Steps | Baby | `updatePlayerPosition` | ✅ |
| 2 | Single Life | Young adult | `checkObstacleCollision` | ✅ |
| 3 | First Date | Meeting | TBD | ⚠️ |
| 4 | Coding in the Dark | Reunion | TBD | ⚠️ |
| 5 | Moving In Together | First apartment | `checkPlacement` | ✅ |
| 6 | Baby Born | Parenthood | `updateFallingItems` + `checkCatch` | ✅ |
| 7 | Holiday Trip | Travel | `updateScroll` | ✅ |
| 8 | The Proposal | Proposal | TBD | ⚠️ |
| 9 | Wedding Day | Wedding | `spawnHeartWave` | ✅ |

---

## Open Questions

- **Room 3 (First Date):** What should the coding task be?
- **Room 4 (Coding in the Dark):** 📋 Research what the event actually was. Design mechanic around it.
- **Room 8 (Proposal):** What makes this fun to code?
- **Room count:** 9 rooms at ~3-5 min each = 30-45 min on stage. Will need to trim.
- **Score:** Carry across rooms or reset?
- **Transitions:** Title card between rooms? Fade? Story text?
