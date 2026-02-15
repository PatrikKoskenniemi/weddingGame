// ============================================================
// TINY WEDDING GAME – ENGINE
// This file is FULLY IMPLEMENTED. DO NOT MODIFY.
// ============================================================

// --- Canvas Setup ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// --- Game Objects ---
const player = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  size: 30,
  speed: 3,
};

let score = 0;

let hearts = [];

function spawnHearts(count) {
  for (let i = 0; i < count; i++) {
    hearts.push({
      x: Math.random() * (CANVAS_WIDTH - 40) + 20,
      y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
      size: 20,
      points: 1,
    });
  }
}

spawnHearts(8);

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

// --- Rendering ---
function drawPlayer() {
  ctx.fillStyle = "#4488ff";
  ctx.fillRect(
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size
  );
}

function drawHearts() {
  ctx.fillStyle = "#ff6699";
  for (const heart of hearts) {
    ctx.fillRect(
      heart.x - heart.size / 2,
      heart.y - heart.size / 2,
      heart.size,
      heart.size
    );
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
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function render() {
  drawBackground();
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
function gameLoop() {
  // Update logic (calls functions from gameLogic.js)
  updatePlayerPosition(player, keysPressed);
  score += checkHeartCollection(player, hearts);

  // Respawn hearts when all collected
  checkRespawn();

  // Draw everything
  render();

  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
