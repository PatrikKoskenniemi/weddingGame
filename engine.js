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

let score = 0;

const startScreenSprites = {
  annie:  createSpriteAnimation("player", "idle_down"),
  gustav: createSpriteAnimation("npc1",   "idle_down"),
  elina:  createSpriteAnimation("npc2",   "idle_down"),
};

let hearts = [];

let pushables = [];
let roomDoorUnlocked = false;
let codingDarkUnlocked = false;
let trapdoorAboveOverlay = false;
let roomPopoverActive = false;
let trapdoor = null;
let emergencyExit = null;
let dissolveSoundSource = null;
let timeMachineSoundSource = null;

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
      points: 1,
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

  if (gameState === "start") {
    if (e.key === "ArrowUp") {
      selectedMenuItem = (selectedMenuItem - 1 + 3) % 3;
    } else if (e.key === "ArrowDown") {
      selectedMenuItem = (selectedMenuItem + 1) % 3;
    } else if (e.key === " " || e.key === "Enter") {
      if (selectedMenuItem === 0) { gameState = "intro"; introElapsed = 0; }
      else if (selectedMenuItem === 1) { gameState = "settings"; selectedSettingsItem = 0; }
      else { gameState = "quit"; }
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
  dissolveSoundSource = null;
  timeMachineSoundSource = null;

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
  emergencyExit = room.id === "single_life"
    ? { sprite: createSpriteAnimation("emergencyExit", "closed"), ...spawnToCanvas({ col: 8.6, row: 2.5 }) }
    : null;
  if (room.hearts) spawnHearts(8);

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

function drawTargetMarkersOverlay() {
  const room = ROOMS[currentRoomIndex];
  if (!room.targets || pushables.length === 0) return;
  drawTargetMarkers(ctx, room.targets);
}

function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Score: " + score, 20, 20);
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
  if (emergencyExit) {
    if (roomDoorUnlocked) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(emergencyExit.x -20, emergencyExit.y -32, T * S - 10, T * S + 40);
    }
    drawSprite(ctx, emergencyExit.sprite, emergencyExit.x, emergencyExit.y - 9, T * S * 1.3, T * S * 2.5, "#00aa00");
  }
  drawHearts();
  drawTargetMarkersOverlay();
  drawPushables();
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
      ? pushables
          .map((p, i) => ({ p, t: spawnToCanvas(room.targets[i]) }))
          .filter(({ p, t }) => Math.abs(p.x - t.x) < 55 && Math.abs(p.y - t.y) < 55)
          .map(({ t }) => t)
      : [];
    drawDiscoOverlay(ctx, litSpots);
    drawPustervikSign(ctx);
  }
  if (ROOMS[currentRoomIndex].showTitle !== false) drawRoomTitle(ctx);
  drawScore();

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

// --- Game Loop ---
let lastTime = performance.now();

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  if (gameState === "playing" && !roomPopoverActive) {
    // Update logic (calls functions from gameLogic.js)
    updatePlayerPosition(player, keysPressed);
    score += checkHeartCollection(player, hearts);

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
      // Unlock door when all pushables are on their targets
      const room = ROOMS[currentRoomIndex];
      roomDoorUnlocked = pushables.every((p, i) => {
        const t = spawnToCanvas(room.targets[i]);
        return Math.abs(p.x - t.x) < 55 && Math.abs(p.y - t.y) < 55;
      });
      if (emergencyExit && roomDoorUnlocked && emergencyExit.sprite.currentAnim === "closed") {
        setSpriteAnimation(emergencyExit.sprite, "opening");
        setTimeout(() => setSpriteAnimation(emergencyExit.sprite, "open"), 5 * 150);
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
};

const allLoads = [
  SpriteLoader.preloadAll(SPRITE_SHEETS),
  SpriteLoader.load("assets/images/time_spiral.webp"),
  SpriteLoader.load("assets/images/start_screen.png"),
  SpriteLoader.load("assets/images/pustervik_sign.png"),
  SoundSystem.preloadAll(SOUNDS),
];
Promise.allSettled(allLoads).then(async () => {
  if (hashMatch) {
    await loadRoom(currentRoomIndex);
  }
  requestAnimationFrame(gameLoop);
});
