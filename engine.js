// ============================================================
// TINY WEDDING GAME – ENGINE
// ============================================================

// --- Canvas Setup ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// --- Game State ---
let gameState = "start"; // "start" | "intro" | "settings" | "quit" | "loading" | "playing" | "dissolving" | "timeMachine" | "levelComplete"
let timeMachineElapsed = 0;
let dissolveElapsed = 0;
let introElapsed = 0;
const DISSOLVE_DURATION = 2500;
let selectedMenuItem = 0;
let selectedSettingsItem = 0;
let settingsToggle = false;
let currentRoomIndex = 0;

// Restore room from URL hash (e.g. #room=1) so refresh stays on same room
const hashMatch = location.hash.match(/room=(\d+)/);
if (hashMatch) {
  const idx = parseInt(hashMatch[1], 10);
  if (idx >= 0 && idx < ROOMS.length) currentRoomIndex = idx;
}

// --- Game Objects ---
const player = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  size: 48,
  speed: 4,
  sprite: createSpriteAnimation("player", "idle_down"),
  _prevX: CANVAS_WIDTH / 2,
  _prevY: CANVAS_HEIGHT / 2,
};

const startScreenSprites = {
  annie:  createSpriteAnimation("player", "idle_down"),
  gustav: createSpriteAnimation("npc1",   "idle_down"),
  elina:  createSpriteAnimation("npc2",   "idle_down"),
};

let hearts = [];

let pushables = [];
let scriptedNpcs = [];
let roomDoorUnlocked = false;
let codingDarkUnlocked = false;
let trapdoorAboveOverlay = false;
let roomPopoverActive = false;
let trapdoor = null;
let emergencyExit = null;
let emergencyExitTimeout = null;
let dissolveSoundSource = null;
let startScreenSoundSource = null;
let timeMachineSoundSource = null;
let aisleRoomMusicSource = null;
let danceRoomMusicSource = null;
let danceRoomMusicStarted = false;
let ceremony = null;
let activeEmotes = [];

function spawnHearts(count) {
  const margin = 40;
  const minX = ROOM_BOUNDS.x + margin;
  const maxX = ROOM_BOUNDS.x + ROOM_BOUNDS.w - margin;
  const minY = ROOM_BOUNDS.y + ROOM_BOUNDS.wallHeight + margin;
  const maxY = ROOM_BOUNDS.y + ROOM_BOUNDS.h - margin;
  for (let i = 0; i < count; i++) {
    hearts.push({
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
      size: 32,
      sprite: createSpriteAnimation("heart", "pulse"),
    });
  }
}

// --- Input System ---
const keysPressed = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

window.addEventListener("keydown", (e) => {
  if (e.key in keysPressed) {
    keysPressed[e.key] = true;
    e.preventDefault();
  }

  if (gameState === "start" || gameState === "settings") {
    if (!startScreenSoundSource) {
      startScreenSoundSource = SoundSystem.play("startScreen", { loop: true });
    }
  }

  if (gameState === "start") {
    if (e.key === "ArrowUp") {
      selectedMenuItem = (selectedMenuItem - 1 + 3) % 3;
    } else if (e.key === "ArrowDown") {
      selectedMenuItem = (selectedMenuItem + 1) % 3;
    } else if (e.key === " " || e.key === "Enter") {
      if (selectedMenuItem === 0) {
        try { startScreenSoundSource?.stop(); } catch (_) {}
        startScreenSoundSource = null;
        gameState = "intro"; introElapsed = 0;
      } else if (selectedMenuItem === 1) {
        gameState = "settings"; selectedSettingsItem = 0;
      } else {
        try { startScreenSoundSource?.stop(); } catch (_) {}
        startScreenSoundSource = null;
        gameState = "quit";
      }
    }
    e.preventDefault();
  } else if (gameState === "settings") {
    if (e.key === "ArrowUp") {
      selectedSettingsItem = (selectedSettingsItem - 1 + 2) % 2;
    } else if (e.key === "ArrowDown") {
      selectedSettingsItem = (selectedSettingsItem + 1) % 2;
    } else if (e.key === " " || e.key === "Enter") {
      if (selectedSettingsItem === 0) { settingsToggle = !settingsToggle; }
      else { gameState = "start"; }
    }
    e.preventDefault();
  } else if (gameState === "intro") {
    const allShown = Math.floor(introElapsed / INTRO_LINE_INTERVAL) >= INTRO_LINES.length - 1;
    if (allShown && (e.key === " " || e.key === "Enter")) {
      loadRoom(0, true);
      e.preventDefault();
    }
  } else if (gameState === "quit") {
    if (e.key === " " || e.key === "Enter") {
      gameState = "start";
      e.preventDefault();
    }
  } else if (gameState === "playing" && roomPopoverActive) {
    if (e.key === " " || e.key === "Enter") {
      roomPopoverActive = false;
      e.preventDefault();
    }
  } else if (gameState === "levelComplete" || gameState === "timeMachine") {
    if (e.key === " ") {
      advanceToNextRoom();
      e.preventDefault();
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key in keysPressed) {
    keysPressed[e.key] = false;
    e.preventDefault();
  }
});

// --- Door Detection ---
function checkDoorCollision() {
  const room = ROOMS[currentRoomIndex];
  if (!room?.door) return false;

  const door = doorToCanvas(room.door);
  return (
    player.x > door.x &&
    player.x < door.x + door.w &&
    player.y > door.y &&
    player.y < door.y + door.h
  );
}

// --- Room Loading ---
async function loadRoom(roomIndex, showPopover = false) {
  gameState = "loading";
  currentRoomIndex = roomIndex;
  location.hash = "room=" + roomIndex;
  roomBackgroundBelow = null;
  roomBackgroundAbove = null;
  try { dissolveSoundSource?.stop(); } catch (_) {}
  try { timeMachineSoundSource?.stop(); } catch (_) {}
  try { aisleRoomMusicSource?.stop(); } catch (_) {}
  try { danceRoomMusicSource?.stop(); } catch (_) {}
  dissolveSoundSource = null;
  timeMachineSoundSource = null;
  aisleRoomMusicSource = null;
  danceRoomMusicSource = null;
  danceRoomMusicStarted = false;
  ceremony = null;
  activeEmotes = [];

  const room = ROOMS[roomIndex];
  const mapData = await loadMap(room.map);
  composeRoom(mapData);
  setRoomInfo({ year: room.year, title: room.title });

  // Place player at spawn point
  const spawn = spawnToCanvas(room.spawn);
  player.x = spawn.x;
  player.y = spawn.y;
  player._prevX = spawn.x;
  player._prevY = spawn.y;
  setSpriteAnimation(player.sprite, "idle_down");

  // Reset hearts for new room
  hearts = [];
  codingDarkUnlocked = false;
  trapdoorAboveOverlay = false;
  roomPopoverActive = showPopover && !!room.popover;
  trapdoor = room.id === "coding_in_the_dark"
    ? { sprite: createSpriteAnimation("trapdoor", "closed"), ...spawnToCanvas({ col: 13.5, row: 10 }) }
    : null;
  clearTimeout(emergencyExitTimeout);
  emergencyExitTimeout = null;
  emergencyExit = room.id === "single_life"
    ? { sprite: createSpriteAnimation("emergencyExit", "closed"), ...spawnToCanvas({ col: 8.6, row: 2.5 }) }
    : null;
  if (room.hearts) spawnHearts(8);

  // Spawn scripted (auto-walking) NPCs from room config
  scriptedNpcs = [];
  if (room.aisleNpcs) {
    for (const cfg of room.aisleNpcs) {
      const start = spawnToCanvas(cfg.start);
      const end   = spawnToCanvas(cfg.end);
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      let walkAnim = "walk_down";
      if (Math.abs(dy) >= Math.abs(dx)) walkAnim = dy < 0 ? "walk_up" : "walk_down";
      else walkAnim = dx < 0 ? "walk_left" : "walk_right";
      scriptedNpcs.push({
        x: start.x, y: start.y,
        startX: start.x, startY: start.y,
        targetX: end.x, targetY: end.y,
        size: 64,
        sprite: createSpriteAnimation(cfg.spriteKey, walkAnim),
        walkAnim,
        state: "walking",
        stateElapsed: 0,
        turnDelay: cfg.turnDelay ?? 2500,
      });
    }
  }

  // Spawn pushable characters from room config
  pushables = [];
  roomDoorUnlocked = false;
  if (room.pushables) {
    const npcKeys = ["npc1", "npc2"];
    for (let i = 0; i < room.pushables.length; i++) {
      const pos = spawnToCanvas(room.pushables[i]);
      const key = npcKeys[i] || "npc1";
      pushables.push({ x: pos.x, y: pos.y, size: 64, sprite: createSpriteAnimation(key, "dance") });
    }
  }

  if (room.roomMusic?.aisle) {
    const am = room.roomMusic.aisle;
    await SoundSystem.resume();
    aisleRoomMusicSource = SoundSystem.play(am.key, { offset: am.startOffset || 0, stopOffset: am.stopOffset ?? null, fadeOutMs: am.fadeOutMs || 0 });
  }

  gameState = "playing";
}

function advanceToNextRoom() {
  const nextIndex = currentRoomIndex + 1;
  if (nextIndex < ROOMS.length) {
    loadRoom(nextIndex, true);
  } else {
    // Last room — stay on level complete screen
    gameState = "levelComplete";
  }
}

// --- Player Direction Detection ---
function updatePlayerDirection() {
  const dx = player.x - player._prevX;
  const dy = player.y - player._prevY;
  const moving = dx !== 0 || dy !== 0;

  if (moving) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      setSpriteAnimation(player.sprite, dx > 0 ? "walk_right" : "walk_left");
    } else {
      setSpriteAnimation(player.sprite, dy > 0 ? "walk_down" : "walk_up");
    }
  } else {
    const dir = player.sprite.currentAnim.replace("walk_", "").replace("idle_", "");
    setSpriteAnimation(player.sprite, "idle_" + dir);
  }

  player._prevX = player.x;
  player._prevY = player.y;
}

// --- Rendering ---
function drawPlayer() {
  drawSprite(ctx, player.sprite, player.x, player.y, player.size, player.size * 2, "#4488ff");
}

function drawHearts() {
  for (const heart of hearts) {
    drawSprite(ctx, heart.sprite, heart.x, heart.y, heart.size, heart.size, "#ff6699");
  }
}

function drawPushables() {
  for (const p of pushables) {
    drawSprite(ctx, p.sprite, p.x, p.y, p.size, p.size * 2, "#ff8844");
  }
}

function drawScriptedNpcs() {
  for (const npc of scriptedNpcs) {
    drawSprite(ctx, npc.sprite, npc.x, npc.y, npc.size, npc.size * 2, "#ff8844");
  }
}

function drawTargetMarkersOverlay() {
  const room = ROOMS[currentRoomIndex];
  if (!room.targets || pushables.length === 0) return;
  drawTargetMarkers(ctx, room.targets);
}

function drawBackground() {
  drawRoomBackground();
}

function render() {
  if (gameState === "dissolving") {
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate(dissolveElapsed * 0.01);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
  }

  drawBackground();
  drawAnimatedTiles(ctx);
  drawRoomForeground();
  if (ROOMS[currentRoomIndex].showTitle !== false) drawRoomTitle(ctx);
  if (emergencyExit) {
    if (emergencyExit.sprite.currentAnim !== "closed") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(emergencyExit.x -20, emergencyExit.y -32, T * S - 10, T * S + 40);
    }
    drawSprite(ctx, emergencyExit.sprite, emergencyExit.x, emergencyExit.y - 9, T * S * 1.3, T * S * 2.5, "#00aa00");
  }
  drawHearts();
  drawTargetMarkersOverlay();
  drawPushables();
  drawScriptedNpcs();
  drawEmotes();
  if (trapdoor) {
    if (trapdoorAboveOverlay) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(trapdoor.x - T * S / 2, trapdoor.y - T * S / 2, T * S, T * S);
    }
    drawSprite(ctx, trapdoor.sprite, trapdoor.x, trapdoor.y, T * S, T * S, "#553300");
  }
  drawPlayer();
  if (ROOMS[currentRoomIndex].id === "coding_in_the_dark") {
    drawSpotlightOverlay(ctx, player, codingDarkUnlocked, trapdoorAboveOverlay ? trapdoor : null);
  }
  if (ROOMS[currentRoomIndex].id === "single_life") {
    const room = ROOMS[currentRoomIndex];
    const litSpots = room.targets
      ? room.targets
          .map(t => spawnToCanvas(t))
          .filter(tc => pushables.some(p => Math.abs(p.x - tc.x) < 55 && Math.abs(p.y - tc.y) < 55))
      : [];
    drawDiscoOverlay(ctx, litSpots);
    drawPustervikSign(ctx);
    drawYakiDaSign(ctx);
  }

  if (gameState === "dissolving") {
    ctx.restore();
    drawDissolveOverlay(ctx, dissolveElapsed / DISSOLVE_DURATION, dissolveElapsed);
  }

  if (roomPopoverActive && ROOMS[currentRoomIndex].popover) {
    drawRoomPopover(ctx, ROOMS[currentRoomIndex].popover);
  }
  if (gameState === "levelComplete") {
    drawLevelComplete(ctx, ROOMS[currentRoomIndex]);
  }
  if (gameState === "timeMachine") {
    drawTimeMachineScreen(ctx, timeMachineElapsed);
  }
}

// --- Heart Respawn ---
function checkRespawn() {
  if (hearts.length === 0 && ROOMS[currentRoomIndex].hearts && !codingDarkUnlocked) {
    spawnHearts(8);
  }
}

// --- Scripted NPC Update ---
function updateScriptedNpcs(deltaTime) {
  for (const npc of scriptedNpcs) {
    if (npc.state === "walking") {
      const dx = npc.targetX - npc.x;
      const dy = npc.targetY - npc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 0.10;
      if (dist <= speed) {
        npc.x = npc.targetX;
        npc.y = npc.targetY;
        if (ROOMS[currentRoomIndex].ceremony) {
          npc.state = "atAltar";
          setSpriteAnimation(npc.sprite, "idle_down");
          checkCeremonyStart();
        } else {
          npc.state = "turned";
          npc.stateElapsed = 0;
          setSpriteAnimation(npc.sprite, "idle_down");
        }
      } else {
        npc.x += (dx / dist) * speed;
        npc.y += (dy / dist) * speed;
      }
    } else if (npc.state === "turned") {
      npc.stateElapsed += deltaTime;
      if (npc.stateElapsed >= npc.turnDelay) {
        npc.state = "dancing";
        setSpriteAnimation(npc.sprite, "dance");
        triggerDanceMusic();
      }
    } else if (npc.state === "walkingBack") {
      const dx = npc.walkBackTargetX - npc.x;
      const dy = npc.walkBackTargetY - npc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 1.00;
      if (dist <= speed) {
        npc.x = npc.walkBackTargetX;
        npc.y = npc.walkBackTargetY;
        npc.state = "dancing";
        setSpriteAnimation(npc.sprite, "dance");
        triggerDanceMusic();
      } else {
        npc.x += (dx / dist) * speed;
        npc.y += (dy / dist) * speed;
      }
    }
  }
  updateCeremony(deltaTime);
}

// --- Ceremony System ---

function triggerDanceMusic() {
  if (danceRoomMusicStarted) return;
  danceRoomMusicStarted = true;
  aisleRoomMusicSource?.fadeOut(2000);
  aisleRoomMusicSource = null;
  const dm = ROOMS[currentRoomIndex].roomMusic?.dance;
  if (dm) {
    const gap = dm.gapDelay || 0;
    setTimeout(async () => {
      await SoundSystem.resume();
      danceRoomMusicSource = SoundSystem.play(dm.key, { offset: dm.startOffset || 0, stopOffset: dm.stopOffset ?? null });
    }, gap);
  }
}

function checkCeremonyStart() {
  if (ceremony !== null) return;
  const allArrived = scriptedNpcs.length > 0 && scriptedNpcs.every(n => n.state === "atAltar");
  if (allArrived) startCeremony();
}

function startCeremony() {
  ceremony = { steps: ROOMS[currentRoomIndex].ceremony, stepIdx: 0, elapsed: 0, done: false };
  processCeremonyStep();
}

function processCeremonyStep() {
  if (!ceremony || ceremony.done) return;
  ceremony.elapsed = 0;
  const step = ceremony.steps[ceremony.stepIdx];

  if (step.type === "faceEachOther") {
    if (scriptedNpcs[0]) setSpriteAnimation(scriptedNpcs[0].sprite, "idle_right");
    if (scriptedNpcs[1]) setSpriteAnimation(scriptedNpcs[1].sprite, "idle_left");
    advanceCeremony();
    return;
  }

  if (step.type === "walkBack") {
    for (const npc of scriptedNpcs) {
      npc.state = "walkingBack";
      npc.walkBackTargetX = npc.x + (npc.startX - npc.x) * 0.35;
      npc.walkBackTargetY = npc.y + (npc.startY - npc.y) * 0.35;
      const dx = npc.walkBackTargetX - npc.x;
      const dy = npc.walkBackTargetY - npc.y;
      let walkAnim = "walk_down";
      if (Math.abs(dy) >= Math.abs(dx)) walkAnim = dy < 0 ? "walk_up" : "walk_down";
      else walkAnim = dx < 0 ? "walk_left" : "walk_right";
      setSpriteAnimation(npc.sprite, walkAnim);
    }
    ceremony.done = true;
    return;
  }

  // "emote" and "pause" steps are time-based and handled in updateCeremony
}

function advanceCeremony() {
  if (!ceremony) return;
  ceremony.stepIdx++;
  if (ceremony.stepIdx >= ceremony.steps.length) {
    ceremony.done = true;
    triggerDance();
    return;
  }
  processCeremonyStep();
}

function triggerDance() {
  for (const npc of scriptedNpcs) {
    if (npc.state === "atAltar") {
      npc.state = "dancing";
      setSpriteAnimation(npc.sprite, "dance");
    }
  }
  triggerDanceMusic();
}

function updateCeremony(deltaTime) {
  if (!ceremony || ceremony.done) return;

  const step = ceremony.steps[ceremony.stepIdx];
  ceremony.elapsed += deltaTime;

  if (step.type === "emote") {
    if (ceremony.elapsed <= deltaTime) {
      const room = ROOMS[currentRoomIndex];
      let emoteX, emoteY, trackNpc, offsetY;
      if (step.target === "priest" && room.priest) {
        const pos = spawnToCanvas(room.priest);
        emoteX = pos.x;
        emoteY = pos.y;
        trackNpc = null;
        offsetY = -52;
      } else if (typeof step.target === "number" && scriptedNpcs[step.target]) {
        const npc = scriptedNpcs[step.target];
        emoteX = npc.x;
        emoteY = npc.y;
        trackNpc = step.target;
        offsetY = -80;
      }
      if (emoteX !== undefined) {
        activeEmotes.push({
          x: emoteX, y: emoteY,
          offsetY, trackNpc,
          spriteIcon:   createSpriteAnimation("emote", step.emote),
          spriteBubble: createSpriteAnimation("emote", "bubble"),
          spriteTail:   createSpriteAnimation("emote", "tail"),
          elapsed: 0,
          duration: step.duration,
        });
      }
    }
    if (ceremony.elapsed >= step.duration) advanceCeremony();
  } else if (step.type === "pause") {
    if (ceremony.elapsed >= step.duration) advanceCeremony();
  }
}

function updateEmotes(deltaTime) {
  for (const emote of activeEmotes) {
    emote.elapsed += deltaTime;
    if (emote.trackNpc !== null && scriptedNpcs[emote.trackNpc]) {
      emote.x = scriptedNpcs[emote.trackNpc].x;
      emote.y = scriptedNpcs[emote.trackNpc].y;
    }
    updateSpriteAnimation(emote.spriteIcon,   deltaTime);
    updateSpriteAnimation(emote.spriteBubble, deltaTime);
    updateSpriteAnimation(emote.spriteTail,   deltaTime);
  }
  activeEmotes = activeEmotes.filter(e => e.elapsed < e.duration);
}

function drawEmotes() {
  const size = 64;
  for (const emote of activeEmotes) {
    const bubbleY = emote.y + emote.offsetY;
    const tailY   = bubbleY + size;
    drawSprite(ctx, emote.spriteTail,   emote.x, tailY,   size, size, "#ffff00");
    drawSprite(ctx, emote.spriteBubble, emote.x, bubbleY, size, size, "#ffffff");
    drawSprite(ctx, emote.spriteIcon,   emote.x, bubbleY, size, size, "#ffff00");
  }
}

// --- Game Loop ---
let lastTime = performance.now();

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  if (gameState === "playing" && !roomPopoverActive) {
    // Update logic (calls functions from gameLogic.js)
    updatePlayerPosition(player, keysPressed);
    checkHeartCollection(player, hearts);

    if (hearts.length === 0 && ROOMS[currentRoomIndex].id === "coding_in_the_dark" && !codingDarkUnlocked) {
      codingDarkUnlocked = true;
      if (trapdoor) setTimeout(() => { trapdoorAboveOverlay = true; setSpriteAnimation(trapdoor.sprite, "open"); }, 1500);
    }

    // Push characters and clamp to room bounds
    if (pushables.length > 0) {
      pushCharacters(player, pushables);
      for (const p of pushables) {
        p.x = Math.max(ROOM_BOUNDS.x + p.size / 2, Math.min(ROOM_BOUNDS.x + ROOM_BOUNDS.w - p.size / 2, p.x));
        p.y = Math.max(ROOM_BOUNDS.y + ROOM_BOUNDS.wallHeight + p.size / 2, Math.min(ROOM_BOUNDS.y + ROOM_BOUNDS.h - p.size / 2, p.y));
      }
      // Unlock door when every target has at least one pushable on it
      const room = ROOMS[currentRoomIndex];
      roomDoorUnlocked = room.targets.every(t => {
        const tc = spawnToCanvas(t);
        return pushables.some(p => Math.abs(p.x - tc.x) < 55 && Math.abs(p.y - tc.y) < 55);
      });
      if (emergencyExit) {
        if (roomDoorUnlocked && emergencyExit.sprite.currentAnim === "closed") {
          setSpriteAnimation(emergencyExit.sprite, "opening");
          emergencyExitTimeout = setTimeout(() => setSpriteAnimation(emergencyExit.sprite, "open"), 5 * 200);
        } else if (!roomDoorUnlocked && emergencyExit.sprite.currentAnim !== "closed") {
          clearTimeout(emergencyExitTimeout);
          emergencyExitTimeout = null;
          setSpriteAnimation(emergencyExit.sprite, "closed");
        }
      }
    }

    // Check if player reached the door (requires pushables solved if room has them)
    const doorBlocked = (pushables.length > 0 && !roomDoorUnlocked) || (ROOMS[currentRoomIndex].hearts && !codingDarkUnlocked);
    if (checkDoorCollision() && !doorBlocked) {
      if (ROOMS[currentRoomIndex].id === "learn_to_walk") {
        gameState = "dissolving";
        dissolveElapsed = 0;
        initDissolve();
        dissolveSoundSource = SoundSystem.play("negativeAction");
      } else {
        gameState = "levelComplete";
      }
    }

    updateScriptedNpcs(deltaTime);

    // Respawn hearts when all collected
    checkRespawn();
  }

  // Always update visuals (animations run in all states)
  updateSpriteAnimation(startScreenSprites.annie,  deltaTime);
  updateSpriteAnimation(startScreenSprites.gustav, deltaTime);
  updateSpriteAnimation(startScreenSprites.elina,  deltaTime);
  updateAnimatedTiles(deltaTime);
  updatePlayerDirection();
  updateSpriteAnimation(player.sprite, deltaTime);
  for (const heart of hearts) {
    updateSpriteAnimation(heart.sprite, deltaTime);
  }
  for (const p of pushables) {
    updateSpriteAnimation(p.sprite, deltaTime);
  }
  for (const npc of scriptedNpcs) {
    updateSpriteAnimation(npc.sprite, deltaTime);
  }
  updateEmotes(deltaTime);
  if (trapdoor) updateSpriteAnimation(trapdoor.sprite, deltaTime);
  if (emergencyExit) updateSpriteAnimation(emergencyExit.sprite, deltaTime);

  if (gameState === "intro") introElapsed += deltaTime;
  if (gameState === "dissolving") {
    dissolveElapsed += deltaTime;
    if (dissolveElapsed >= DISSOLVE_DURATION) {
      gameState = "timeMachine";
      timeMachineElapsed = 0;
      try { dissolveSoundSource?.stop(); } catch (_) {}
      dissolveSoundSource = null;
      timeMachineSoundSource = SoundSystem.play("timeMachineScreen", { loop: true });
    }
  }
  if (gameState === "timeMachine") timeMachineElapsed += deltaTime;

  // Draw everything
  if (gameState === "start") {
    drawStartScreen(ctx, selectedMenuItem, startScreenSprites);
  } else if (gameState === "intro") {
    drawIntroScreen(ctx, introElapsed);
  } else if (gameState === "settings") {
    drawSettingsScreen(ctx, selectedSettingsItem, settingsToggle);
  } else if (gameState === "quit") {
    drawQuitScreen(ctx);
  } else {
    render();
  }

  requestAnimationFrame(gameLoop);
}

// --- Start ---
// Preload sprite sheets + tileset images, then load first room and start
const SOUNDS = {
  negativeAction: "assets/sounds/floraphonic-classic-game-action-negative-3-224421.mp3",
  timeMachineScreen: "assets/sounds/rescopicsound-cinematic-designed-sci-fi-whoosh-transition-nexawave-228295.mp3",
  startScreen: "assets/sounds/Sprite_spark.mp3",
  weddingMarch: "assets/sounds/Wedding_March.mp3",
  weddingBerlin: "assets/sounds/Wedding_in_Berlin.m4a",
};

const allLoads = [
  SpriteLoader.preloadAll(SPRITE_SHEETS),
  SpriteLoader.load("assets/images/time_spiral.webp"),
  SpriteLoader.load("assets/images/start_screen.png"),
  SpriteLoader.load("assets/images/pustervik_sign.png"),
  SpriteLoader.load("assets/images/yaki_da_sign.png"),
  SoundSystem.preloadAll(SOUNDS),
];
Promise.allSettled(allLoads).then(async () => {
  if (hashMatch) {
    await loadRoom(currentRoomIndex);
  } else {
    startScreenSoundSource = SoundSystem.play("startScreen", { loop: true });
  }
  requestAnimationFrame(gameLoop);
});
