# Game Plan – Life Rooms

## Concept

The player is **Annie** — Gustav and Elina's young daughter. She accidentally walks through a time machine in her nursery and lands in her parents' past. Her mission: travel through the key moments of their lives and make sure they actually end up together. If she fails, she won't exist. No pressure.

Gustav and Elina live-code the gameplay logic for each room on stage while the audience watches on a big screen. Annie is always a small child sprite throughout the entire game, regardless of which year or setting she lands in.

Each room has:
- A **theme** (a moment in Gustav and Elina's story)
- A **visual style** (colors, objects)
- A **gameplay objective** Annie must complete to move the story forward
- A **function to implement** (what the couple codes live)

Rooms progress from simple mechanics to more complex ones, building on previous code.

## Visual Style

Pokemon-inspired aesthetic throughout:
- Top-down 2D pixel art style
- Tile-based environments with clear, chunky sprites
- Dialog boxes / text boxes for room introductions (Pokemon-style bordered text box at bottom of screen)
- Room transitions similar to Pokemon area transitions
- Story intro text between rooms to narrate the couple's journey
- Characters as small sprite-like figures

## Difficulty Approach

Not every room needs to be coded from scratch. Some rooms can have **broken implementations** that the couple must **debug and fix** instead of writing from zero. This lowers the difficulty, adds variety, and is funny for the audience (watching them find the bug).

Options per room:
- **Empty stub** — write the whole function (harder)
- **Broken code** — code is there but has bugs to fix (easier, funnier)
- **Partial code** — some logic works, finish the rest (medium)

## People & References

Real people and inside jokes from the couple's life should appear as characters, obstacles, or items throughout the game. This makes it personal and hilarious for the audience.

| Name | Context | How to use |
|------|---------|------------|
| TjockSteffe | TBD | TBD |
| Theo Berndt | Friend — known as "The Berndt" in the 2015 era, presumably renamed later | Namedrop in Room 2 screen text as a timestamp of the era |

*(Add more names as we learn them from friends and family)*

## Player Character

**Annie** (Gustav and Elina's daughter) is the player character throughout the entire game. She is always a small child sprite — a kid character, not an adult — regardless of which historical year she lands in. The comedy of a toddler showing up in a 2015 nightclub is intentional and should be leaned into.

📋 **TODO:** Find or assign a kid sprite for Annie. Current asset pack has kid body + outfit sheets in `moderninteriors-win/2_Characters/Character_Generator/Bodies_kids/16x16/`. Kid frames are 16x16 (square, not tall like adults).

---

## Story Intros

Between each room, a story text is shown to narrate Annie's time-travel mission and introduce the next room. Displayed as text overlays during transitions.

| Transition | Screen text | Tone |
|------------|------------|------|
| Room 1 → Room 2 | "Åh nej. Annie råkade gå igenom tidsmaskinen. Hon har landat i... 2015?" | Alarm, comedy |
| Room 2 intro | "2015 — Göteborg. Eran när klubbarna hade pingisbord och Theo Berndt fortfarande hette The Berndt. Men vad händer framför Annies ögon? Gustav är karate-full och har helt tappat bort sig i någon fuldans på dansgolvet. Samtidigt har Elina [FYLL I]. Hon måste föra dom samman på något sätt — men hur??" | Comedy, stakes |
| Before Room 4 – Code in the Dark | "Gustav och Elina växer upp, dom idrottar, dom studerar och träffar varandra — men beslutar sig för att gå vidare separat. Ödet verkar dock ha andra planer. Och Annie är fortfarande kvar i historien." | Drama |

*(Add more story intros as rooms are designed)*

---

## Rooms

### Room 1 – Baby Steps
**Life stage:** Annie's nursery — the present day (no year shown)
**Narrative:** This is Annie's own room. She is learning to walk. The door at the end of the room looks like an ordinary nursery door — but it is actually a time machine portal. Annie doesn't know this. Neither does the audience. When she reaches it, she vanishes.
**Objective:** Move Annie around the nursery and reach the door
**Mechanic:** Arrow key movement
**Function:** `updatePlayerPosition(player, keysPressed)`
- Move with arrow keys
- Normalize diagonal movement
- Stay inside bounds
**Visuals:** Nursery/children's bedroom — herringbone wood floor, textured walls, crib, star garlands, toys on the floor, wardrobe, rug. The door glows faintly — a subtle hint that something is off.
**Difficulty:** Easy
**Status:** ✅ CONFIRMED
**Note:** No year is shown in this room. The Level Complete text should play it as an "oh no" moment — Annie has disappeared through the portal.

---

### Room 2 – På Lokal
**Life stage:** 2015 — Göteborg. Annie lands here by accident.
**Narrative:** Annie arrives in 2015 Göteborg, the era of ping pong tables in nightclubs and Theo Berndt still going by "The Berndt". Gustav is on the dance floor, karate-full, doing something embarrassing. Elina is [FYLL I: vad Elina gör]. Annie has to bring them together somehow.
**Objective:** Push/guide Gustav and Elina toward each other (or to a meeting point)
**Mechanic:** Obstacle/character pushing — the couple moves when Annie bumps into them
**Function:** `pushCharacters(player, characters)`
- Push characters when Annie collides with them
- Get both characters to their target zones
**Visuals:** Nightclub/bar, neon colors, ping pong table visible, dance floor. Gustav NPC doing bad dancing. Elina NPC doing [FYLL I].
**Difficulty:** Easy-Medium
**Status:** ✅ CONFIRMED (mechanic built, narrative needs Elina detail)

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

### Room 4 – Code in the Dark
**Life stage:** Gustav and Elina had broken up, then ran into each other at a coding challenge event called "Code in the Dark". This was a turning point that brought them back together.
**Reference:** http://codeinthedark.com/
**Story intro:** "Gustav och Elina växer upp, dom idrottar, dom studera och träffar varandra mene besultar sig för att gå vidare separat. Ödet verkar dock ha andra planer..."
**Objective:** TBD — should tie into the coding challenge theme
**Mechanic:** TBD
**Function:** TBD
**Visuals:** Dark/dim screen, code-themed, terminal green text, dramatic reveal
**Difficulty:** TBD
**Status:** ⚠️ NEEDS: research + design

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
| 2 | På Lokal | Young adult | `checkObstacleCollision` | ✅ |
| 3 | First Date | Meeting | TBD | ⚠️ |
| 4 | Code in the Dark | Reunion | TBD | ⚠️ |
| 5 | Moving In Together | First apartment | `checkPlacement` | ✅ |
| 6 | Baby Born | Parenthood | `updateFallingItems` + `checkCatch` | ✅ |
| 7 | Holiday Trip | Travel | `updateScroll` | ✅ |
| 8 | The Proposal | Proposal | TBD | ⚠️ |
| 9 | Wedding Day | Wedding | `spawnHeartWave` | ✅ |

---

## Open Questions

- **Room 3 (First Date):** What should the coding task be?
- **Room 4 (Code in the Dark):** 📋 Research what the event actually was. Design mechanic around it.
- **Room 8 (Proposal):** What makes this fun to code?
- **Room count:** 9 rooms at ~3-5 min each = 30-45 min on stage. Will need to trim.
- **Score:** Carry across rooms or reset?
- **Transitions:** Title card between rooms? Fade? Story text?
