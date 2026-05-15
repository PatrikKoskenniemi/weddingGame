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
let gameState = "loading"; // "loading" | "playing" | "levelComplete"
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

let hearts = [];

let pushables = [];
let roomDoorUnlocked = false;
let codingDarkUnlocked = false;

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

  // Space dismisses level complete popup
  if (gameState === "levelComplete" && e.key === " ") {
    advanceToNextRoom();
    e.preventDefault();
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
  if (!room || !room.door) return false;

  const door = doorToCanvas(room.door);
  return (
    player.x > door.x &&
    player.x < door.x + door.w &&
    player.y > door.y &&
    player.y < door.y + door.h
  );
}

// --- Room Loading ---
async function loadRoom(roomIndex) {
  gameState = "loading";
  currentRoomIndex = roomIndex;
  location.hash = "room=" + roomIndex;

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
    loadRoom(nextIndex);
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
  const room = ROOMS[currentRoomIndex];
  if (room.targets) drawTargetMarkers(ctx, room.targets);
  for (const p of pushables) {
    drawSprite(ctx, p.sprite, p.x, p.y, p.size, p.size * 2, "#ff8844");
  }
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
  drawBackground();
  drawAnimatedTiles(ctx);
  drawRoomForeground();
  drawHearts();
  drawPushables();
  drawPlayer();
  if (ROOMS[currentRoomIndex].id === "coding_in_the_dark") {
    drawSpotlightOverlay(ctx, player, codingDarkUnlocked);
  }
  if (ROOMS[currentRoomIndex].id === "single_life") {
    drawDiscoOverlay(ctx);
  }
  if (ROOMS[currentRoomIndex].showTitle !== false) drawRoomTitle(ctx);
  drawScore();

  if (gameState === "levelComplete") {
    drawLevelComplete(ctx, ROOMS[currentRoomIndex]);
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

  if (gameState === "playing") {
    // Update logic (calls functions from gameLogic.js)
    updatePlayerPosition(player, keysPressed);
    score += checkHeartCollection(player, hearts);

    if (hearts.length === 0 && ROOMS[currentRoomIndex].id === "coding_in_the_dark") {
      codingDarkUnlocked = true;
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
        return Math.abs(p.x - t.x) < 35 && Math.abs(p.y - t.y) < 35;
      });
    }

    // Check if player reached the door (requires pushables solved if room has them)
    const doorBlocked = pushables.length > 0 && !roomDoorUnlocked;
    if (checkDoorCollision() && !doorBlocked) {
      gameState = "levelComplete";
    }

    // Respawn hearts when all collected
    checkRespawn();
  }

  // Always update visuals (animations run in all states)
  updateAnimatedTiles(deltaTime);
  updatePlayerDirection();
  updateSpriteAnimation(player.sprite, deltaTime);
  for (const heart of hearts) {
    updateSpriteAnimation(heart.sprite, deltaTime);
  }
  for (const p of pushables) {
    updateSpriteAnimation(p.sprite, deltaTime);
  }

  // Draw everything
  render();

  requestAnimationFrame(gameLoop);
}

// --- Start ---
// Preload sprite sheets + tileset images, then load first room and start
const allLoads = [
  SpriteLoader.preloadAll(SPRITE_SHEETS),
];
Promise.allSettled(allLoads).then(async () => {
  await loadRoom(currentRoomIndex);
  requestAnimationFrame(gameLoop);
});
