// ============================================================
// TINY WEDDING GAME – ROOM RENDERER (Tiled Map Loader)
// Loads a Tiled JSON map and composes the room onto an
// offscreen canvas. Drawn once, then blitted each frame.
// ============================================================

const T = 16; // tile size in source sheets
const S = 4;  // render scale (16px source → 48px game)

// --- Room Registry ---
// Each room defines its map, metadata, door zone, and player spawn.
const ROOMS = [
  {
    id: "nursery",
    map: "assets/maps/nursery.json",
    year: "1993",
    title: "Learn to Walk",
    door: { col: 15, row: 2, w: 2, h: 3 },
    spawn: { col: 8, row: 8 },
    hearts: false,
  },
  {
    id: "single_life",
    map: "assets/maps/single_life.json",
    year: "2015",
    title: "Single Life",
    door: { col: 15, row: 2, w: 2, h: 3 },
    spawn: { col: 2, row: 8 },
    hearts: false,
  },
  {
    id: "coding_in_the_dark",
    map: "assets/maps/coding_in_the_dark.json",
    year: "",
    title: "Code in the Dark",
    door: { col: 14, row: 2, w: 2, h: 3 },
    spawn: { col: 2, row: 5 },
    hearts: true,
    showTitle: false,
  },
];

// Convert a tile-coordinate rect to canvas-pixel rect
function doorToCanvas(door) {
  return {
    x: ROOM_BOUNDS.x + door.col * T * S,
    y: ROOM_BOUNDS.y + door.row * T * S,
    w: door.w * T * S,
    h: door.h * T * S,
  };
}

// Convert tile coords to canvas-pixel position (center of tile)
function spawnToCanvas(spawn) {
  return {
    x: ROOM_BOUNDS.x + (spawn.col + 0.5) * T * S,
    y: ROOM_BOUNDS.y + (spawn.row + 0.5) * T * S,
  };
}

// Room bounds — set after map loads, used by engine for heart spawning
let ROOM_BOUNDS = { x: 0, y: 0, w: 0, h: 0, wallHeight: 0 };

// Per-room tilesets — loaded dynamically from .tsx files at map load time
let roomTilesets = [];

// Animated tiles collected at room load — overdrawn each frame between the two background layers
let roomAnimatedTiles = [];

// Static background split at the animated layer so animated tiles render in correct z-order:
//   roomBackgroundBelow: dark bg + all layers up to and including the last animated layer
//   roomBackgroundAbove: transparent + all layers above the last animated layer
let roomBackgroundBelow = null;
let roomBackgroundAbove = null;

// --- GID Resolution ---

// Tiled stores flip flags in the high bits of tile GIDs
const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;
const FLIP_D = 0x20000000;
const GID_MASK = ~(FLIP_H | FLIP_V | FLIP_D);

// Find which tileset a GID belongs to (search from highest firstgid down)
function findTileset(gid) {
  for (let i = roomTilesets.length - 1; i >= 0; i--) {
    if (gid >= roomTilesets[i].firstgid) return roomTilesets[i];
  }
  return null;
}

// Resolve a GID to { img, sx, sy } source rect (one T×T tile)
function resolveGid(gid) {
  const rawGid = gid & GID_MASK;
  if (rawGid === 0) return null;

  const ts = findTileset(rawGid);
  if (!ts) return null;

  const localId = rawGid - ts.firstgid;

  if (ts.columns === 0) {
    const tile = ts.tiles && ts.tiles[localId];
    if (!tile) return null;
    const img = SpriteLoader.get(tile.src);
    return img ? { img, sx: 0, sy: 0, w: tile.w, h: tile.h } : null;
  }

  const col = localId % ts.columns;
  const row = Math.floor(localId / ts.columns);
  const img = SpriteLoader.get(ts.src);

  return img ? { img, sx: col * T, sy: row * T } : null;
}

// --- Tileset Loading ---

function resolvePath(base, relative) {
  const parts = (base + relative).split("/");
  const result = [];
  for (const p of parts) {
    if (p === "..") result.pop();
    else if (p !== ".") result.push(p);
  }
  return result.join("/");
}

async function loadTilesets(mapData, mapUrl) {
  const mapBase = mapUrl.substring(0, mapUrl.lastIndexOf("/") + 1);
  const tilesets = [];

  for (const ts of mapData.tilesets) {
    if (!ts.source) continue;

    const tsxPath = resolvePath(mapBase, ts.source);
    const tsxBase = tsxPath.substring(0, tsxPath.lastIndexOf("/") + 1);

    try {
      const resp = await fetch(tsxPath + "?v=" + Date.now());
      if (!resp.ok) { console.warn("Missing tileset:", tsxPath); continue; }
      const xml = await resp.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");

      const columns = Number.parseInt(doc.querySelector("tileset").getAttribute("columns") || "0");

      if (columns === 0) {
        // Collection tileset — each tile has its own image element
        const tiles = {};
        for (const tileEl of doc.querySelectorAll("tile")) {
          const localId = Number.parseInt(tileEl.getAttribute("id"));
          const tileImgEl = tileEl.querySelector("image");
          if (!tileImgEl) continue;
          const src = resolvePath(tsxBase, tileImgEl.getAttribute("source"));
          const w = Number.parseInt(tileImgEl.getAttribute("width") || "0");
          const h = Number.parseInt(tileImgEl.getAttribute("height") || "0");
          await SpriteLoader.load(src);
          tiles[localId] = { src, w, h };
        }
        tilesets.push({ firstgid: ts.firstgid, columns: 0, tiles });
        continue;
      }

      const imgEl = doc.querySelector("image");
      if (!imgEl) continue;

      const imgPath = resolvePath(tsxBase, imgEl.getAttribute("source"));
      await SpriteLoader.load(imgPath);

      const animations = {};
      for (const tileEl of doc.querySelectorAll("tile")) {
        const localId = Number.parseInt(tileEl.getAttribute("id"));
        const frames = [...tileEl.querySelectorAll("animation > frame")].map(f => ({
          tileid: Number.parseInt(f.getAttribute("tileid")),
          duration: Number.parseInt(f.getAttribute("duration")),
        }));
        if (frames.length > 0) animations[localId] = frames;
      }

      tilesets.push({ firstgid: ts.firstgid, columns, src: imgPath, animations });
    } catch (e) {
      console.warn("Failed to load tileset:", tsxPath, e);
    }
  }

  return tilesets;
}

// --- Map Loading ---

async function loadMap(url) {
  const resp = await fetch(url + "?v=" + Date.now());
  const mapData = await resp.json();
  roomTilesets = await loadTilesets(mapData, url);
  return mapData;
}

// --- Animated Tile Helpers ---

function isAnimatedGid(gid) {
  const rawGid = gid & GID_MASK;
  if (rawGid === 0) return false;
  const ts = findTileset(rawGid);
  return !!(ts && ts.animations && ts.animations[rawGid - ts.firstgid]);
}

function collectAnimatedTile(gid, dx, dy, dw, dh) {
  const rawGid = gid & GID_MASK;
  const ts = findTileset(rawGid);
  if (!ts) return;
  const localId = rawGid - ts.firstgid;
  const img = SpriteLoader.get(ts.src);
  if (!img) return;
  roomAnimatedTiles.push({
    dx, dy, dw, dh,
    frames: ts.animations[localId].map(f => ({
      img,
      sx: (f.tileid % ts.columns) * T,
      sy: Math.floor(f.tileid / ts.columns) * T,
      duration: f.duration,
    })),
    elapsed: 0,
    frameIdx: 0,
  });
}

// --- Room Composition ---

function makeCanvas() {
  const c = document.createElement("canvas");
  c.width = CANVAS_WIDTH;
  c.height = CANVAS_HEIGHT;
  const rc = c.getContext("2d");
  rc.imageSmoothingEnabled = false;
  return { canvas: c, rc };
}

function composeRoom(mapData) {
  roomAnimatedTiles = [];

  const mapW = mapData.width;
  const mapH = mapData.height;
  const renderW = mapW * T * S;
  const renderH = mapH * T * S;
  const offsetX = Math.floor((CANVAS_WIDTH - renderW) / 2);
  const offsetY = Math.floor((CANVAS_HEIGHT - renderH) / 2);

  const wallRows = 4;
  ROOM_BOUNDS = { x: offsetX, y: offsetY, w: renderW, h: renderH, wallHeight: wallRows * T * S };

  // Find the last layer index that contains animated tiles.
  // Default to last layer so all layers go to below when there are no animated tiles.
  let lastAnimLayerIdx = mapData.layers.length - 1;
  let hasAnyAnim = false;
  for (let li = 0; li < mapData.layers.length; li++) {
    const layer = mapData.layers[li];
    if (!layer.visible) continue;
    const hasAnim =
      (layer.type === "tilelayer" && layer.data?.some(gid => gid !== 0 && isAnimatedGid(gid))) ||
      (layer.type === "objectgroup" && layer.objects?.some(obj => obj.gid && isAnimatedGid(obj.gid)));
    if (hasAnim) { lastAnimLayerIdx = li; hasAnyAnim = true; }
  }

  // Below: dark bg + all layers 0..lastAnimLayerIdx (animated tiles also drawn here at frame 0)
  const { canvas: below, rc: rcBelow } = makeCanvas();
  rcBelow.fillStyle = "#1a1a2e";
  rcBelow.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Above: transparent + layers lastAnimLayerIdx+1..end
  const { canvas: above, rc: rcAbove } = makeCanvas();

  for (let li = 0; li < mapData.layers.length; li++) {
    const layer = mapData.layers[li];
    if (!layer.visible) continue;

    const rc = li <= lastAnimLayerIdx ? rcBelow : rcAbove;
    const collectAnims = li <= lastAnimLayerIdx;

    if (layer.type === "tilelayer" && layer.data) {
      renderTileLayer(rc, layer, mapW, offsetX, offsetY, collectAnims);
    } else if (layer.type === "objectgroup" && layer.objects) {
      renderObjectLayer(rc, layer, offsetX, offsetY, collectAnims);
    }
  }

  roomBackgroundBelow = below;
  roomBackgroundAbove = hasAnyAnim ? above : null;
}

function renderTileLayer(rc, layer, mapW, offsetX, offsetY, collectAnims) {
  for (let i = 0; i < layer.data.length; i++) {
    const gid = layer.data[i];
    if (gid === 0) continue;

    const col = i % mapW;
    const row = Math.floor(i / mapW);
    const dx = offsetX + col * T * S;
    const dy = offsetY + row * T * S;

    if (collectAnims && isAnimatedGid(gid)) collectAnimatedTile(gid, dx, dy, T * S, T * S);

    const resolved = resolveGid(gid);
    if (!resolved) continue;

    rc.drawImage(resolved.img, resolved.sx, resolved.sy, T, T, dx, dy, T * S, T * S);
  }
}

function renderObjectLayer(rc, layer, offsetX, offsetY, collectAnims) {
  for (const obj of layer.objects) {
    if (!obj.visible || !obj.gid) continue;

    // Tiled object y is at the BOTTOM of the object
    const dx = offsetX + obj.x * S;
    const dy = offsetY + (obj.y - obj.height) * S;
    const dw = obj.width * S;
    const dh = obj.height * S;

    if (collectAnims && isAnimatedGid(obj.gid)) collectAnimatedTile(obj.gid, dx, dy, dw, dh);

    const resolved = resolveGid(obj.gid);
    if (!resolved) continue;

    const sw = resolved.w || T;
    const sh = resolved.h || T;
    rc.drawImage(resolved.img, resolved.sx, resolved.sy, sw, sh, dx, dy, dw, dh);
  }
}

// --- Animated Tile Update / Draw ---

function updateAnimatedTiles(deltaTime) {
  for (const anim of roomAnimatedTiles) {
    anim.elapsed += deltaTime;
    while (anim.elapsed >= anim.frames[anim.frameIdx].duration) {
      anim.elapsed -= anim.frames[anim.frameIdx].duration;
      anim.frameIdx = (anim.frameIdx + 1) % anim.frames.length;
    }
  }
}

function drawAnimatedTiles(targetCtx) {
  for (const anim of roomAnimatedTiles) {
    const f = anim.frames[anim.frameIdx];
    targetCtx.drawImage(f.img, f.sx, f.sy, T, T, anim.dx, anim.dy, anim.dw, anim.dh);
  }
}

// --- Room Info (title/year overlay) ---
// Set per room; drawn each frame over the wall area.
let currentRoomInfo = { year: "", title: "" };

function setRoomInfo(info) {
  currentRoomInfo = info;
}

function drawRoomTitle(targetCtx) {
  if (!currentRoomInfo.title && !currentRoomInfo.year) return;

  const cx = CANVAS_WIDTH / 2;
  const bottom = CANVAS_HEIGHT - 44;

  targetCtx.save();
  targetCtx.textAlign = "center";

  // Title — larger, near bottom
  if (currentRoomInfo.title) {
    targetCtx.font = "bold 34px monospace";
    targetCtx.fillStyle = "rgba(0,0,0,0.35)";
    targetCtx.fillText(currentRoomInfo.title, cx + 2, bottom + 2);
    targetCtx.fillStyle = "#fff";
    targetCtx.fillText(currentRoomInfo.title, cx, bottom);
  }

  // Year — smaller, above the title
  if (currentRoomInfo.year) {
    targetCtx.font = "bold 26px monospace";
    targetCtx.fillStyle = "rgba(0,0,0,0.35)";
    targetCtx.fillText(currentRoomInfo.year, cx + 2, bottom - 38 + 2);
    targetCtx.fillStyle = "#fff";
    targetCtx.fillText(currentRoomInfo.year, cx, bottom - 38);
  }

  targetCtx.restore();
}

function drawRoomBackground() {
  if (roomBackgroundBelow) {
    ctx.drawImage(roomBackgroundBelow, 0, 0);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

function drawRoomForeground() {
  if (roomBackgroundAbove) {
    ctx.drawImage(roomBackgroundAbove, 0, 0);
  }
}

// --- Spotlight Overlay ---

function heartPath(ctx, cx, cy, r) {
  // Normalized in a 20×20 unit box (tip at bottom, bumps at top), scaled by r/10
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(r / 10, r / 10);
  ctx.beginPath();
  ctx.moveTo(0, 10);                                   // bottom tip
  ctx.bezierCurveTo(-2, 7.5, -10,  5,  -10, -1);      // lower-left side
  ctx.bezierCurveTo(-10, -7,  -5, -10,    0, -5);      // left bump to cleft
  ctx.bezierCurveTo(  5, -10,  10,  -7,  10, -1);      // cleft to right bump
  ctx.bezierCurveTo( 10,  5,    2,  7.5,   0, 10);     // lower-right side
  ctx.closePath();
  ctx.restore();
}

function drawSpotlightOverlay(targetCtx) {
  const offscreen = document.createElement("canvas");
  offscreen.width = CANVAS_WIDTH;
  offscreen.height = CANVAS_HEIGHT;
  const oc = offscreen.getContext("2d");

  oc.fillStyle = "rgba(0, 0, 0, 0.60)";
  oc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  oc.globalCompositeOperation = "destination-out";

  // Clear the north wall so wall images are fully visible
  oc.fillStyle = "rgba(255,255,255,1)";
  oc.fillRect(6.13 * T * S, 6, 495, 166);

  const spots = [
    { col: 8, row: 5.5 },
  ];

  const r = 185;
  for (const spot of spots) {
    const cx = ROOM_BOUNDS.x + spot.col * T * S;
    const cy = ROOM_BOUNDS.y + spot.row * T * S;

    oc.save();
    heartPath(oc, cx, cy, r);
    oc.clip();

    const grad = oc.createRadialGradient(cx, cy, 0, cx, cy, r * 1.95);
    grad.addColorStop(0,   "rgba(255,255,255,1)");
    grad.addColorStop(0.2, "rgba(255,255,255,0.8)");
    grad.addColorStop(1,   "rgba(255,255,255,0)");
    oc.fillStyle = grad;
    oc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    oc.restore();
  }

  targetCtx.drawImage(offscreen, 0, 0);
}

// --- Level Complete Overlay ---

function drawLevelComplete(targetCtx, roomInfo) {
  // Semi-transparent dark backdrop
  targetCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;

  targetCtx.save();
  targetCtx.textAlign = "center";

  // "Level Complete!" — large
  targetCtx.font = "bold 52px monospace";
  targetCtx.fillStyle = "rgba(0,0,0,0.4)";
  targetCtx.fillText("Level Complete!", cx + 3, cy - 40 + 3);
  targetCtx.fillStyle = "#ffd700";
  targetCtx.fillText("Level Complete!", cx, cy - 40);

  // Room title — 20px gap below "Level Complete!"
  targetCtx.font = "bold 28px monospace";
  targetCtx.fillStyle = "#fff";
  targetCtx.fillText(roomInfo.year + " — " + roomInfo.title, cx, cy + 20);

  // "Press space"
  targetCtx.font = "22px monospace";
  targetCtx.fillStyle = "rgba(255,255,255,0.6)";
  targetCtx.fillText("Press space to continue...", cx, cy + 70);

  targetCtx.restore();
}
