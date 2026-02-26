// ============================================================
// TINY WEDDING GAME – ROOM RENDERER (Tiled Map Loader)
// Loads a Tiled JSON map and composes the room onto an
// offscreen canvas. Drawn once, then blitted each frame.
// ============================================================

const T = 16; // tile size in source sheets
const S = 3;  // render scale (16px source → 48px game)

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
  },
  {
    id: "single_life",
    map: "assets/maps/single_life.json",
    year: "2015",
    title: "Single Life",
    door: { col: 15, row: 2, w: 2, h: 3 },
    spawn: { col: 2, row: 8 },
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

// Tileset definitions matching the Tiled map's tilesets.
// firstgid + columns come from the .tsx files referenced in nursery.json.
const MAP_TILESETS = [
  { name: "Room_Builder", firstgid: 1,    columns: 76, src: "assets/tilesets/room_builder.png" },
  { name: "Fishing",      firstgid: 8589, columns: 16, src: "assets/tilesets/fishing.png" },
  { name: "Bedroom",      firstgid: 9021, columns: 16, src: "assets/tilesets/bedroom.png" },
];

// Room bounds — set after map loads, used by engine for heart spawning
let ROOM_BOUNDS = { x: 0, y: 0, w: 0, h: 0, wallHeight: 0 };

let roomBackground = null;

// --- GID Resolution ---

// Tiled stores flip flags in the high bits of tile GIDs
const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;
const FLIP_D = 0x20000000;
const GID_MASK = ~(FLIP_H | FLIP_V | FLIP_D);

// Find which tileset a GID belongs to (search from highest firstgid down)
function findTileset(gid) {
  for (let i = MAP_TILESETS.length - 1; i >= 0; i--) {
    if (gid >= MAP_TILESETS[i].firstgid) return MAP_TILESETS[i];
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
  const col = localId % ts.columns;
  const row = Math.floor(localId / ts.columns);
  const img = SpriteLoader.get(ts.src);

  return img ? { img, sx: col * T, sy: row * T } : null;
}

// --- Map Loading ---

async function loadMap(url) {
  const resp = await fetch(url + "?v=" + Date.now());
  return resp.json();
}

// --- Room Composition ---

function composeRoom(mapData) {
  const offscreen = document.createElement("canvas");
  offscreen.width = CANVAS_WIDTH;
  offscreen.height = CANVAS_HEIGHT;
  const rc = offscreen.getContext("2d");
  rc.imageSmoothingEnabled = false;

  // Dark surround
  rc.fillStyle = "#1a1a2e";
  rc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const mapW = mapData.width;   // tiles across
  const mapH = mapData.height;  // tiles down
  const renderW = mapW * T * S;
  const renderH = mapH * T * S;
  const offsetX = Math.floor((CANVAS_WIDTH - renderW) / 2);
  const offsetY = Math.floor((CANVAS_HEIGHT - renderH) / 2);

  // Set room bounds for heart spawning.
  // Wall tiles occupy the first 4 rows; floor is the rest.
  const wallRows = 4;
  ROOM_BOUNDS = {
    x: offsetX,
    y: offsetY,
    w: renderW,
    h: renderH,
    wallHeight: wallRows * T * S,
  };

  // Render every layer in order
  for (const layer of mapData.layers) {
    if (!layer.visible) continue;

    if (layer.type === "tilelayer" && layer.data) {
      renderTileLayer(rc, layer, mapW, offsetX, offsetY);
    } else if (layer.type === "objectgroup" && layer.objects) {
      renderObjectLayer(rc, layer, offsetX, offsetY);
    }
  }

  return offscreen;
}

function renderTileLayer(rc, layer, mapW, offsetX, offsetY) {
  for (let i = 0; i < layer.data.length; i++) {
    const gid = layer.data[i];
    if (gid === 0) continue;

    const resolved = resolveGid(gid);
    if (!resolved) continue;

    const col = i % mapW;
    const row = Math.floor(i / mapW);
    const dx = offsetX + col * T * S;
    const dy = offsetY + row * T * S;

    rc.drawImage(
      resolved.img,
      resolved.sx, resolved.sy, T, T,
      dx, dy, T * S, T * S
    );
  }
}

function renderObjectLayer(rc, layer, offsetX, offsetY) {
  for (const obj of layer.objects) {
    if (!obj.visible || !obj.gid) continue;

    const resolved = resolveGid(obj.gid);
    if (!resolved) continue;

    // Tiled object y is at the BOTTOM of the object
    const dx = offsetX + obj.x * S;
    const dy = offsetY + (obj.y - obj.height) * S;
    const dw = obj.width * S;
    const dh = obj.height * S;

    rc.drawImage(
      resolved.img,
      resolved.sx, resolved.sy, T, T,
      dx, dy, dw, dh
    );
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

  const cx = ROOM_BOUNDS.x + ROOM_BOUNDS.w / 2;
  const wallTop = ROOM_BOUNDS.y;
  const wallBot = ROOM_BOUNDS.y + ROOM_BOUNDS.wallHeight;
  const midY = wallTop + (wallBot - wallTop) * 0.38;

  targetCtx.save();
  targetCtx.textAlign = "center";

  // Year — smaller, above the title
  if (currentRoomInfo.year) {
    targetCtx.font = "bold 26px monospace";
    targetCtx.fillStyle = "rgba(0,0,0,0.35)";
    //targetCtx.fillText(currentRoomInfo.year, cx + 2, midY - 48 + 2);
    targetCtx.fillText(currentRoomInfo.year, cx + 2, midY + 418 + 2);
    targetCtx.fillStyle = "#fff";
    //targetCtx.fillText(currentRoomInfo.year, cx, midY - 48);
    targetCtx.fillText(currentRoomInfo.year, cx, midY + 418);
  }

  // Title — larger
  if (currentRoomInfo.title) {
    targetCtx.font = "bold 34px monospace";
    targetCtx.fillStyle = "rgba(0,0,0,0.35)";
    //targetCtx.fillText(currentRoomInfo.title, cx + 2, midY - 19 + 2);
    targetCtx.fillText(currentRoomInfo.title, cx + 2, midY + 449 + 2);
    targetCtx.fillStyle = "#fff";
    //targetCtx.fillText(currentRoomInfo.title, cx, midY - 19);
    targetCtx.fillText(currentRoomInfo.title, cx, midY + 449);
  }

  targetCtx.restore();
}

function drawRoomBackground() {
  if (roomBackground) {
    ctx.drawImage(roomBackground, 0, 0);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
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
