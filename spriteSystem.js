// ============================================================
// TINY WEDDING GAME – SPRITE SYSTEM
// Handles sprite loading, caching, animation, and drawing.
// Falls back to colored rectangles when sprites aren't loaded.
// ============================================================

// --- Sprite Sheet Definitions ---
// Each key defines a sprite sheet: source image, frame dimensions, and animations.
// Animations are rows in the sheet; frames are columns.
const SPRITE_SHEETS = {
  player: {
    src: "assets/sprites/characters/sprite_annie.png",
    frameWidth: 16,
    frameHeight: 32,
    // Row 1 = idle (right 0-5, up 6-11, left 12-17, down 18-23)
    // Row 2 = run  (right 0-5, up 6-11, left 12-17, down 18-23)
    animations: {
      idle_down:  { row: 1, col: 18, frames: 6, speed: 120 },
      walk_down:  { row: 2, col: 18, frames: 6, speed: 120 },
      idle_up:    { row: 1, col: 6,  frames: 6, speed: 120 },
      walk_up:    { row: 2, col: 6,  frames: 6, speed: 120 },
      idle_left:  { row: 1, col: 12, frames: 6, speed: 120 },
      walk_left:  { row: 2, col: 12, frames: 6, speed: 120 },
      idle_right: { row: 1, col: 0,  frames: 6, speed: 120 },
      walk_right: { row: 2, col: 0,  frames: 6, speed: 120 },
    },
  },
  npc1: {
    src: "assets/sprites/characters/sprite_gustav.png",
    frameWidth: 16,
    frameHeight: 32,
    animations: {
      idle_down:  { row: 1, col: 18, frames: 6, speed: 120 },
      walk_down:  { row: 2, col: 18, frames: 6, speed: 120 },
      idle_up:    { row: 1, col: 6,  frames: 6, speed: 120 },
      walk_up:    { row: 2, col: 6,  frames: 6, speed: 120 },
      idle_left:  { row: 1, col: 12, frames: 6, speed: 120 },
      walk_left:  { row: 2, col: 12, frames: 6, speed: 120 },
      idle_right: { row: 1, col: 0,  frames: 6, speed: 120 },
      walk_right: { row: 2, col: 0,  frames: 6, speed: 120 },
      dance:      { row: 11, col: 0, frames: 56, speed: 100 },
    },
  },
  npc2: {
    src: "assets/sprites/characters/sprite_elina.png",
    frameWidth: 16,
    frameHeight: 32,
    animations: {
      idle_down:  { row: 1, col: 18, frames: 6, speed: 120 },
      walk_down:  { row: 2, col: 18, frames: 6, speed: 120 },
      idle_up:    { row: 1, col: 6,  frames: 6, speed: 120 },
      walk_up:    { row: 2, col: 6,  frames: 6, speed: 120 },
      idle_left:  { row: 1, col: 12, frames: 6, speed: 120 },
      walk_left:  { row: 2, col: 12, frames: 6, speed: 120 },
      idle_right: { row: 1, col: 0,  frames: 6, speed: 120 },
      walk_right: { row: 2, col: 0,  frames: 6, speed: 120 },
      dance:      { row: 11, col: 0, frames: 56, speed: 100 },
    },
  },
  trapdoor: {
    src: "assets/sprites/animated_trapdoor_1.png",
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      closed: { row: 0, col: 0, frames: 1, speed: 0 },
      open:   { row: 0, col: 0, frames: 4, speed: 200, loop: false },
    },
  },
  emergencyExit: {
    src: "assets/sprites/animated_door_6.png",
    frameWidth: 16,
    frameHeight: 32,
    animations: {
      closed:  { row: 0, col: 0, frames: 1, speed: 0 },
      opening: { row: 0, col: 0, frames: 5, speed: 200, loop: false },
      open:    { row: 0, col: 4, frames: 1, speed: 0 },
    },
  },
  heart: {
    src: "assets/sprites/heart_spritesheet_16x16.png",
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      pulse: { row: 1, col: 0, frames: 3, speed: 160, pingPong: true },
    },
  },
  emote: {
    src: "assets/sprites/UI_thinking_emotes_animation_16x16.png",
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      exclamation: { row: 4, col: 0, frames: 2, speed: 500 },
      heart:       { row: 2, col: 4, frames: 2, speed: 500 },
      question:    { row: 5, col: 2, frames: 2, speed: 500 },
    },
  },
};

// --- Sprite Loader ---
const SpriteLoader = {
  cache: {},
  loading: {},
  failed: new Set(),

  load(src) {
    if (this.cache[src]) return Promise.resolve(this.cache[src]);
    if (this.loading[src]) return this.loading[src];

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache[src] = img;
        delete this.loading[src];
        resolve(img);
      };
      img.onerror = () => {
        this.failed.add(src);
        delete this.loading[src];
        reject(new Error("Failed to load: " + src));
      };
      img.src = src;
    });

    this.loading[src] = promise;
    return promise;
  },

  get(src) {
    return this.cache[src] || null;
  },

  isLoaded(src) {
    return src in this.cache;
  },

  preloadAll(sheetDefs) {
    const promises = Object.values(sheetDefs).map((def) => this.load(def.src));
    return Promise.allSettled(promises);
  },
};

// --- Sprite Animation State ---
function createSpriteAnimation(sheetKey, initialAnimation) {
  return {
    sheetKey: sheetKey,
    currentAnim: initialAnimation,
    frameIndex: 0,
    elapsed: 0,
    _dir: 1,
  };
}

function updateSpriteAnimation(anim, deltaTime) {
  const sheet = SPRITE_SHEETS[anim.sheetKey];
  if (!sheet) return;

  const animDef = sheet.animations[anim.currentAnim];
  if (!animDef || animDef.speed === 0 || animDef.frames <= 1) return;

  anim.elapsed += deltaTime;
  if (anim.elapsed >= animDef.speed) {
    anim.elapsed -= animDef.speed;
    if (animDef.pingPong) {
      const next = anim.frameIndex + anim._dir;
      if (next >= animDef.frames) {
        anim._dir = -1;
        anim.frameIndex = animDef.frames - 2;
      } else if (next < 0) {
        anim._dir = 1;
        anim.frameIndex = 1;
      } else {
        anim.frameIndex = next;
      }
    } else {
      const next = anim.frameIndex + 1;
      anim.frameIndex = (animDef.loop === false && next >= animDef.frames)
        ? animDef.frames - 1
        : next % animDef.frames;
    }
  }
}

function setSpriteAnimation(anim, newAnim) {
  if (anim.currentAnim === newAnim) return;
  anim.currentAnim = newAnim;
  anim.frameIndex = 0;
  anim.elapsed = 0;
  anim._dir = 1;
}

// --- Drawing ---
function drawSprite(ctx, anim, x, y, width, height, fallbackColor) {
  const sheet = SPRITE_SHEETS[anim.sheetKey];
  const img = sheet ? SpriteLoader.get(sheet.src) : null;

  if (img && sheet) {
    const animDef = sheet.animations[anim.currentAnim];
    if (!animDef) {
      drawFallbackRect(ctx, x, y, width, height, fallbackColor);
      return;
    }

    const fw = animDef.frameWidth || sheet.frameWidth;
    const fh = animDef.frameHeight || sheet.frameHeight;
    const colOffset = animDef.col || 0;
    const sx = (colOffset + anim.frameIndex) * fw;
    const sy = animDef.row * sheet.frameHeight;

    ctx.drawImage(
      img,
      sx, sy, fw, fh,
      x - width / 2, y - height / 2, width, height
    );
  } else {
    drawFallbackRect(ctx, x, y, width, height, fallbackColor);
  }
}

function drawFallbackRect(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
}
