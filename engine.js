// ============================================================
// TINY WEDDING GAME – ENGINE
// ============================================================

// --- Canvas Setup ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

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
});

window.addEventListener("keyup", (e) => {
  if (e.key in keysPressed) {
    keysPressed[e.key] = false;
    e.preventDefault();
  }
});

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
  drawRoomTitle(ctx);
  drawHearts();
  drawPlayer();
  drawScore();
}

// --- Heart Respawn ---
function checkRespawn() {
  if (hearts.length === 0) {
    spawnHearts(8);
  }
}

// --- Game Loop ---
let lastTime = performance.now();

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Update logic (calls functions from gameLogic.js)
  updatePlayerPosition(player, keysPressed);
  score += checkHeartCollection(player, hearts);

  // Detect player facing direction for sprite animation
  updatePlayerDirection();

  // Update sprite animations
  updateSpriteAnimation(player.sprite, deltaTime);
  for (const heart of hearts) {
    updateSpriteAnimation(heart.sprite, deltaTime);
  }

  // Respawn hearts when all collected
  checkRespawn();

  // Draw everything
  render();

  requestAnimationFrame(gameLoop);
}

// --- Start ---
// Preload sprite sheets + tileset images, load Tiled map, then compose and start
const allLoads = [
  SpriteLoader.preloadAll(SPRITE_SHEETS),
  ...MAP_TILESETS.map((t) => SpriteLoader.load(t.src)),
];
Promise.allSettled(allLoads).then(async () => {
  const mapData = await loadMap("assets/maps/nursery.json");
  roomBackground = composeRoom(mapData);
  setRoomInfo({ year: "1993", title: "Learn to Walk" });
  spawnHearts(8);
  requestAnimationFrame(gameLoop);
});
