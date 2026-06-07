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
    id: "learn_to_walk",
    map: "assets/maps/learn_to_walk.json",
    year: "2024",
    title: "Baby Steps",
    door: { col: 14.0, row: 1, w: 2, h: 3 },
    spawn: { col: 6.3, row: 7 },
    hearts: false,
  },
  {
    id: "single_life",
    map: "assets/maps/single_life.json",
    year: "2015",
    title: "På Lokal",
    door: { col: 8.5, row: 1, w: 1, h: 2.5 },
    doorArrow: { col: 8.6, row: 1.4, requiresUnlock: true },
    spawn: { col: 5, row: 9 },
    hearts: false,
    pushables: [
      { col: 3, row: 7.5 },
      { col: 10, row: 2.5 },
    ],
    targets: [
      { col: 9, row: 6.2 },
      { col: 9, row: 10.1},
    ],
    popover: {
      title: "På lokal",
      lines: [
        "Annie har landat i 2015.",
        "En tid av Yrgo och praktikplatser,",
        "pingisbord på nattklubbarna",
        "och alldeles för många #TBT Instagram-poster",
        "",
        "På dansgolvet: Gustav",
        "Troligtvis karate-full.",
        "Definitivt inte medveten om vart han är.",
        "",
        "Vid baren: Elina.",
        "Postar sin tredje bild från Way Out West för dagen.",
        "",
        "Nu är det upp till Annie",
        "att se till att dessa två faktiskt träffas.",
        "",
        "Putta Gustav och Elina till pingisbordet.",
      ],
    },
    completeLines: [
      "Gustav och Elina spelar sin pingis-match och dom börjar dejta.",
      "Det går bra till en början",
      "och Annie börjar undra varför hon bara är 2 år gammal",
      "Men så händer något och mitt framför ögonen på Annie",
      "och plötsligt tar relationen.",
      "Vår hjältinna tvekar dock inte och kastar sig rakt in i nästa portal.",
      " \"Detta måste gå!\"",
    ],
  },
  {
    id: "coding_in_the_dark",
    map: "assets/maps/coding_in_the_dark.json",
    year: "",
    title: "Code in the Dark",
    door: { col: 13.5, row: 10, w: 2, h: 6 },
    spawn: { col: 2.5, row: 6.5 },
    hearts: true,
    showTitle: false,
    doorArrow: { col: 13.45, row: 8.9, requiresUnlock: true },
    popover: {
      title: "Stockholm - 2016???",
      lines: [
        "Vart är jag? Och varför är det så mörkt här?",
        "Men kolla, där på scenen sitter ju mamma och pappa!",
        "Dom skrattar och ler åt varandra!",
        "Nu har jag min chans,",
        "om jag bara samlar upp alla hjärtan",
        "så måste dom hitta tillbaka till varandra igen.",
        "Åhh neej, det går ju inte att plocka upp dom...",
        "",
        "Samla alla hjärtan innan det är försent!",
      ],
      height: 470
    },
  },
  {
    id: "wedding",
    map: "assets/maps/wedding.json",
    year: "2026-06-13",
    title: "Bröllop",
    spawn: { col: 6, row: 4.6 },
    hearts: false,
    aisleNpcs: [
      { spriteKey: "npc1", start: { col: 7.1, row: 12 }, end: { col: 7.1, row: 4.3 } },
      { spriteKey: "npc2", start: { col: 7.9, row: 12 }, end: { col: 7.9, row: 4.3 } },
    ],
    priest: { col: 7.5, row: 2.5 },
    ceremony: [
      { type: "faceEachOther" },
      { type: "pause", duration: 1500 },
      { type: "emote", target: 0, emote: "question",          duration: 2500, sound: "malegrunt"    },
      { type: "pause", duration: 500 },
      { type: "emote", target: 1, emote: "heart",             duration: 2000, sound: "femalegrunt1"  },
      { type: "pause", duration: 500 },
      { type: "emote", target: 1, emote: "question",          duration: 2500, sound: "femalegrunt2"  },
      { type: "pause", duration: 500 },
      { type: "emote", target: 0, emote: "heart",             duration: 2000, sound: "malegrunt2"    },
      { type: "pause", duration: 1000 },
      { type: "emote", target: "priest", emote: "exclamation", duration: 2000, sound: "maledeepgrunt" },
      { type: "pause", duration: 1500 },
      { type: "walkBack" },
    ],
    roomMusic: {
      aisle: { key: "weddingMarch",  startOffset: 0, stopOffset: 43, fadeOutMs: 3000 },
      dance: { key: "weddingBerlin", startOffset: 63.2, stopOffset: null },
    },
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
let spotlightUnlockTime = null;

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
  const tw = ts.tileWidth || T;
  const th = ts.tileHeight || T;
  const sp = ts.spacing || 0;
  const img = SpriteLoader.get(ts.src);

  return img ? { img, sx: col * (tw + sp), sy: row * (th + sp) } : null;
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
    // Embedded tileset (image path inline, no external .tsx)
    if (!ts.source && ts.image) {
      const imgPath = resolvePath(mapBase, ts.image);
      await SpriteLoader.load(imgPath);
      const animations = {};
      for (const tile of (ts.tiles || [])) {
        if (tile.animation) {
          animations[tile.id] = tile.animation.map(f => ({
            tileid: f.tileid,
            duration: f.duration,
          }));
        }
      }
      tilesets.push({ firstgid: ts.firstgid, columns: ts.columns, src: imgPath, animations });
      continue;
    }

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

      const tileWidth = Number.parseInt(doc.querySelector("tileset").getAttribute("tilewidth") || "16");
      const tileHeight = Number.parseInt(doc.querySelector("tileset").getAttribute("tileheight") || "16");
      const spacing = Number.parseInt(doc.querySelector("tileset").getAttribute("spacing") || "0");
      tilesets.push({ firstgid: ts.firstgid, columns, src: imgPath, animations, tileWidth, tileHeight, spacing });
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
  const flipH = !!(gid & FLIP_H);
  const flipV = !!(gid & FLIP_V);
  const rawGid = gid & GID_MASK;
  const ts = findTileset(rawGid);
  if (!ts) return;
  const localId = rawGid - ts.firstgid;
  const img = SpriteLoader.get(ts.src);
  if (!img) return;
  roomAnimatedTiles.push({
    dx, dy, dw, dh, flipH, flipV,
    frames: ts.animations[localId].map(f => ({
      img,
      sx: (f.tileid % ts.columns) * ((ts.tileWidth || T) + (ts.spacing || 0)),
      sy: Math.floor(f.tileid / ts.columns) * ((ts.tileHeight || T) + (ts.spacing || 0)),
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

function assembleTileData(layer, mapW, mapH) {
  if (!layer.chunks) return null;
  const data = new Array(mapW * mapH).fill(0);
  for (const chunk of layer.chunks) {
    for (let i = 0; i < chunk.data.length; i++) {
      const cx = (i % chunk.width) + chunk.x;
      const cy = Math.floor(i / chunk.width) + chunk.y;
      if (cx >= 0 && cx < mapW && cy >= 0 && cy < mapH) {
        data[cy * mapW + cx] = chunk.data[i];
      }
    }
  }
  return data;
}

function composeRoom(mapData) {
  roomAnimatedTiles = [];
  spotlightUnlockTime = null;

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
    const tileData = layer.type === "tilelayer" ? (layer.data || assembleTileData(layer, mapW, mapH)) : null;
    const hasAnim =
      (tileData && tileData.some(gid => gid !== 0 && isAnimatedGid(gid))) ||
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

    if (layer.type === "tilelayer") {
      const data = layer.data || assembleTileData(layer, mapW, mapH);
      if (data) renderTileLayer(rc, { ...layer, data }, mapW, offsetX, offsetY, collectAnims);
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

    if (collectAnims && isAnimatedGid(gid)) {
      collectAnimatedTile(gid, dx, dy, T * S, T * S);
      continue;
    }

    const resolved = resolveGid(gid);
    if (!resolved) continue;

    drawTileFlipped(rc, resolved.img, resolved.sx, resolved.sy, dx, dy, T * S, T * S, !!(gid & FLIP_H), !!(gid & FLIP_V));
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

    if (collectAnims && isAnimatedGid(obj.gid)) {
      collectAnimatedTile(obj.gid, dx, dy, dw, dh);
      continue;
    }

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

function drawTileFlipped(ctx, img, sx, sy, dx, dy, dw, dh, flipH, flipV) {
  if (!flipH && !flipV) {
    ctx.drawImage(img, sx, sy, T, T, dx, dy, dw, dh);
    return;
  }
  ctx.save();
  ctx.translate(dx + dw / 2, dy + dh / 2);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, sx, sy, T, T, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function drawAnimatedTiles(targetCtx) {
  for (const anim of roomAnimatedTiles) {
    const f = anim.frames[anim.frameIdx];
    drawTileFlipped(targetCtx, f.img, f.sx, f.sy, anim.dx, anim.dy, anim.dw, anim.dh, anim.flipH, anim.flipV);
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

function drawTargetMarkers(targetCtx, targets) {
  for (const t of targets) {
    const x = ROOM_BOUNDS.x + (t.col + 0.5) * T * S;
    const y = ROOM_BOUNDS.y + (t.row + 0.5) * T * S;
    const r = T * S * 0.4;
    targetCtx.save();
    targetCtx.strokeStyle = "rgba(255,255,255,0.5)";
    targetCtx.lineWidth = 3;
    targetCtx.setLineDash([6, 4]);
    targetCtx.beginPath();
    targetCtx.arc(x, y, r, 0, Math.PI * 2);
    targetCtx.stroke();
    targetCtx.restore();
  }
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

// --- Pustervik Sign ---

function drawPustervikSign(targetCtx) {
  const img = SpriteLoader.get("assets/images/pustervik_sign.png");
  if (!img) return;
  const w = 3 * T * S;
  const h = Math.round(w * img.naturalHeight / img.naturalWidth);
  const x = ROOM_BOUNDS.x + 3 * T * S;
  const y = ROOM_BOUNDS.y - 40 + Math.round((ROOM_BOUNDS.wallHeight - h) / 2);
  targetCtx.drawImage(img, x, y, w, h);
}

function drawYakiDaSign(targetCtx) {
  const img = SpriteLoader.get("assets/images/yaki_da_sign.png");
  if (!img) return;
  const w = 3.3 * T * S;
  const h = Math.round(w * img.naturalHeight / img.naturalWidth);
  const x = ROOM_BOUNDS.x + 3 * T * S;
  const y = ROOM_BOUNDS.y + Math.round((ROOM_BOUNDS.wallHeight - h) / 2) + 20;
  targetCtx.drawImage(img, x, y, w, h);
}

// --- Disco Overlay ---

function drawDiscoOverlay(targetCtx, litSpots = []) {
  const t = performance.now();
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const oc = offscreen.getContext("2d");

  oc.fillStyle = "rgba(0, 0, 0, 0.5)";
  oc.fillRect(0, 0, w, h);

  oc.globalCompositeOperation = "destination-out";

  const rings = [
    { rx: w * 0.38, ry: h * 0.30, r: 40, spots: [
      { speed: 0.00080, offset: 0 },
      { speed: 0.00060, offset: Math.PI * 1 / 3 },
      { speed: 0.00100, offset: Math.PI * 2 / 3 },
      { speed: 0.00070, offset: Math.PI },
      { speed: 0.00090, offset: Math.PI * 4 / 3 },
      { speed: 0.00055, offset: Math.PI * 5 / 3 },
    ]},
    { rx: w * 0.18, ry: h * 0.14, r: 30, spots: [
      { speed: -0.00110, offset: Math.PI / 6 },
      { speed: -0.00085, offset: Math.PI / 6 + Math.PI * 2 / 4 },
      { speed: -0.00095, offset: Math.PI / 6 + Math.PI * 4 / 4 },
      { speed: -0.00075, offset: Math.PI / 6 + Math.PI * 6 / 4 },
    ]},
  ];

  const cx = w / 2;
  const cy = h / 2;

  for (const ring of rings) {
   for (const spot of ring.spots) {
    const angle = t * spot.speed + spot.offset;
    const x = cx + Math.cos(angle) * ring.rx;
    const y = cy + Math.sin(angle) * ring.ry;
    const r = ring.r;

    const grad = oc.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0,   "rgba(255,255,255,1)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.5)");
    grad.addColorStop(1,   "rgba(255,255,255,0)");

    oc.fillStyle = grad;
    oc.beginPath();
    oc.arc(x, y, r, 0, Math.PI * 2);
    oc.fill();
   }
  }

  for (const spot of litSpots) {
    const r = 80;
    const grad = oc.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, r);
    grad.addColorStop(0,   "rgba(255,255,255,1)");
    grad.addColorStop(0.6, "rgba(255,255,255,0.8)");
    grad.addColorStop(1,   "rgba(255,255,255,0)");
    oc.fillStyle = grad;
    oc.beginPath();
    oc.arc(spot.x, spot.y, r, 0, Math.PI * 2);
    oc.fill();
  }

  targetCtx.drawImage(offscreen, 0, 0);
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

function drawSpotlightOverlay(targetCtx, player, unlocked, trapdoorSpot = null) {
  const offscreen = document.createElement("canvas");
  offscreen.width = CANVAS_WIDTH;
  offscreen.height = CANVAS_HEIGHT;
  const oc = offscreen.getContext("2d");

  oc.fillStyle = "rgba(0, 0, 0, 0.60)";
  oc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  oc.globalCompositeOperation = "destination-out";

  if (!unlocked) {
    spotlightUnlockTime = null;
    // Always keep the north wall (logo/screen) fully visible
    oc.fillStyle = "rgba(255,255,255,1)";
    oc.fillRect(6.13 * T * S, 6, 495, 166);
    // Phase 1: circle following the player
    const r = 140;
    const grad = oc.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    grad.addColorStop(0,   "rgba(255,255,255,1)");
    grad.addColorStop(0.6, "rgba(255,255,255,0.8)");
    grad.addColorStop(1,   "rgba(255,255,255,0)");
    oc.fillStyle = grad;
    oc.beginPath();
    oc.arc(player.x, player.y, r, 0, Math.PI * 2);
    oc.fill();
  } else {
    if (spotlightUnlockTime === null) spotlightUnlockTime = performance.now();

    const ANIM_DURATION = 1500;
    const progress = Math.min((performance.now() - spotlightUnlockTime) / ANIM_DURATION, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    const r = 185;
    const cx = ROOM_BOUNDS.x + 8 * T * S;
    const cy = ROOM_BOUNDS.y + 5.5 * T * S;

    const drawHalfHeart = (clipX, clipW, offset) => {
      oc.save();
      oc.beginPath();
      oc.rect(clipX, 0, clipW, CANVAS_HEIGHT);
      oc.clip();
      oc.translate(offset, 0);
      heartPath(oc, cx, cy, r);
      oc.clip();
      const grad = oc.createRadialGradient(cx, cy, 0, cx, cy, r * 1.95);
      grad.addColorStop(0,   "rgba(255,255,255,1)");
      grad.addColorStop(0.2, "rgba(255,255,255,0.8)");
      grad.addColorStop(1,   "rgba(255,255,255,0)");
      oc.fillStyle = grad;
      oc.fillRect(-CANVAS_WIDTH * 2, -CANVAS_HEIGHT, CANVAS_WIDTH * 5, CANVAS_HEIGHT * 3);
      oc.restore();
    };

    // Always keep the north wall (logo/screen) fully visible
    oc.fillStyle = "rgba(255,255,255,1)";
    oc.fillRect(6.13 * T * S, 6, 495, 166);

    if (progress >= 1) {
      drawHalfHeart(0, cx, 0);
      drawHalfHeart(cx, CANVAS_WIDTH - cx, 0);
    } else {
      const leftOffset  = -(cx + r) * (1 - ease);
      const rightOffset =  (CANVAS_WIDTH - cx + r) * (1 - ease);
      drawHalfHeart(0, cx, leftOffset);
      drawHalfHeart(cx, CANVAS_WIDTH - cx, rightOffset);
    }
  }

  if (trapdoorSpot) {
    oc.fillStyle = "rgba(255,255,255,1)";
    oc.fillRect(trapdoorSpot.x - T * S / 2, trapdoorSpot.y - T * S / 2, T * S, T * S);
  }

  targetCtx.drawImage(offscreen, 0, 0);
}

// --- Level Complete Overlay ---

// --- Wedding Complete (scrolling credits) ---

function drawWeddingComplete(targetCtx, elapsed) {
  const fadeAlpha = Math.min(0.66, (elapsed / 600) * 0.66);
  targetCtx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cx = CANVAS_WIDTH / 2;
  const startDelay = 1200;
  const lineH = 48;

  const items = [
    { text: "Game Completed!",                                        font: "bold 60px monospace",   color: "#f0e040", h: 80 },
    { text: null,                                                                                                       h: 56 },
    { text: "Gustav och Elina gifter sig den 13 juni 2026",           font: "28px monospace",        color: "#ffffff", h: lineH },
    { text: "omgivna av vänner och familj. Annie står bara",          font: "28px monospace",        color: "#ffffff", h: lineH },
    { text: "bredvid och ler, hon har räddat sin familj.",             font: "28px monospace",        color: "#ffffff", h: lineH },
    { text: null,                                                                                                       h: 40 },
    { text: "Och så de levde lyckliga i alla sina dar...",            font: "italic 32px monospace", color: "#ffffff", h: lineH + 8 },
    { text: null,                                                                                                       h: 72 },
    { text: null,                                                                                                       h: 72 },
    { text: "Stort grattis på er bröllopsdag!",                       font: "bold 44px monospace",   color: "#f0e040", h: 60 },
  ];

  const totalContentH = items.reduce((sum, item) => sum + item.h, 0);
  const targetStartY = Math.max(60, (CANVAS_HEIGHT - totalContentH) / 2);
  const maxScroll = CANVAS_HEIGHT + 60 - targetStartY;
  const scroll = Math.min(maxScroll, Math.max(0, (elapsed - startDelay) * 0.065));

  let y = CANVAS_HEIGHT + 60 - scroll;

  targetCtx.save();
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";
  targetCtx.beginPath();
  targetCtx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  targetCtx.clip();

  const contentAlpha = Math.min(1, elapsed / 400);

  for (const item of items) {
    if (item.text) {
      targetCtx.globalAlpha = contentAlpha;
      targetCtx.font = item.font;
      targetCtx.fillStyle = item.color;
      targetCtx.fillText(item.text, cx, y + item.h / 2);
    }
    y += item.h;
  }

  if (scroll >= maxScroll) {
    const blink = Math.floor(elapsed / 600) % 2 === 0 ? 0.6 : 0.25;
    targetCtx.globalAlpha = blink;
    targetCtx.font = "20px monospace";
    targetCtx.fillStyle = "#ffffff";
    targetCtx.fillText("Press space to close", cx, CANVAS_HEIGHT - 24);
  }

  targetCtx.restore();
}

// --- Dissolve Transition ---

let dissolveBlocks = [];

function initDissolve() {
  const cols = Math.ceil(CANVAS_WIDTH / (T * S));
  const rows = Math.ceil(CANVAS_HEIGHT / (T * S));
  dissolveBlocks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dissolveBlocks.push({ x: c * T * S, y: r * T * S });
    }
  }
  for (let i = dissolveBlocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dissolveBlocks[i], dissolveBlocks[j]] = [dissolveBlocks[j], dissolveBlocks[i]];
  }
}

function drawDissolveOverlay(targetCtx, progress, elapsed) {
  // Blocks blink randomly; density increases toward full black at progress=1
  const density = Math.min(1, progress + 0.1);
  targetCtx.fillStyle = "#000000";
  for (const block of dissolveBlocks) {
    if (Math.random() < density) {
      targetCtx.fillRect(block.x, block.y, T * S, T * S);
    }
  }

  // Warning triangle — blinks red/white
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;
  const th = 280;
  const tw = th / Math.sqrt(3) * 2;

  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.moveTo(cx, cy - th * 0.65);
  targetCtx.lineTo(cx - tw / 2, cy + th * 0.35);
  targetCtx.lineTo(cx + tw / 2, cy + th * 0.35);
  targetCtx.closePath();

  const blink = Math.floor(elapsed / 220) % 2 === 0;
  targetCtx.fillStyle = blink ? "#ff2200" : "#000000";
  targetCtx.fill();
  targetCtx.strokeStyle = blink ? "#000000" : "#ff2200";
  targetCtx.lineWidth = 6;
  targetCtx.stroke();

  // Exclamation mark inside triangle
  targetCtx.fillStyle = blink ? "#000000" : "#ff2200";
  targetCtx.font = "bold 120px monospace";
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";
  targetCtx.fillText("!", cx, cy + 20);

  targetCtx.restore();
}

function drawTimeMachineScreen(targetCtx, elapsed) {
  const img = SpriteLoader.get("assets/images/time_spiral.webp");
  if (!img) return;

  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;

  // Draw spiral image scaled to cover canvas with slow rotation + subtle breathe
  const diagonal = Math.hypot(CANVAS_WIDTH, CANVAS_HEIGHT);
  const baseScale = diagonal / Math.min(img.naturalWidth, img.naturalHeight);
  const pulse = 1 + 0.02 * Math.sin(elapsed / 900);
  const scale = baseScale * pulse;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;

  targetCtx.save();
  targetCtx.translate(cx, cy);
  targetCtx.rotate(elapsed * 0.00015);
  targetCtx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  targetCtx.restore();

  // Dark vignette
  const vignette = targetCtx.createRadialGradient(cx, cy, CANVAS_HEIGHT * 0.2, cx, cy, CANVAS_HEIGHT * 0.85);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.75)");
  targetCtx.fillStyle = vignette;
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Scanlines
  targetCtx.fillStyle = "rgba(0,0,0,0.12)";
  for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
    targetCtx.fillRect(0, y, CANVAS_WIDTH, 2);
  }

  // Title
  targetCtx.save();
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";

  targetCtx.font = "bold 52px monospace";
  targetCtx.fillStyle = "rgba(0,0,0,0.5)";
  targetCtx.fillText("RESER TILLBAKA I TIDEN...", cx + 3, cy - 40 + 3);
  targetCtx.fillStyle = "#6b5bff";
  targetCtx.fillText("RESER TILLBAKA I TIDEN...", cx, cy - 40);

  // Year display
  targetCtx.font = "bold 32px monospace";
  targetCtx.fillStyle = "#ffffff";
  targetCtx.fillText("2024  →  2015", cx, cy + 20);

  // Flashing "press space"
  if (Math.floor(elapsed / 500) % 2 === 0) {
    targetCtx.font = "22px monospace";
    targetCtx.fillStyle = "rgba(255,255,255,0.7)";
    targetCtx.fillText("Press space to continue...", cx, CANVAS_HEIGHT - 60);
  }

  targetCtx.restore();
}

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
  targetCtx.fillText("Level Complete!", cx + 3, cy - 180 + 3);
  targetCtx.fillStyle = "#ffd700";
  targetCtx.fillText("Level Complete!", cx, cy - 180);

  // Room title — gap below "Level Complete!"
  targetCtx.font = "bold 28px monospace";
  targetCtx.fillStyle = "#fff";
  targetCtx.fillText(roomInfo.year + " — " + roomInfo.title, cx, cy - 80);

  // Optional extra lines from room config
  const extraLines = roomInfo.completeLines || [];
  const lineH = 36;
  targetCtx.font = "28px monospace";
  targetCtx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < extraLines.length; i++) {
    targetCtx.fillText(extraLines[i], cx, cy - 30 + i * lineH);
  }

  // "Press space" — pushed down to clear extra lines
  const pressSpaceY = cy - 30 + extraLines.length * lineH + (extraLines.length > 0 ? 24 : 10);
  targetCtx.font = "22px monospace";
  targetCtx.fillStyle = "rgba(255,255,255,0.6)";
  targetCtx.fillText("Press space to continue...", cx, pressSpaceY);

  targetCtx.restore();
}

// --- Pre-Game Screens ---

const INTRO_LINES = [
  "Året är 2024.",
  "",
  "Annie tar sina första stapplande steg i sitt rum.",
  "",
  "I hörnet står en gammal garderob, ett arv från morfar.",
  "Den klickar och surrar på ett konstigt sätt.",
  "",
  "Annie är nyfiken. Annie är modig.",
  "Annie öppnar dörren.",
  "",
  "Det var ett misstag.",
  "",
  "Nu sitter hon fast i det förflutna, ",
  "och hennes föräldrar har inte ens träffats ännu.",
  "",
  "Om hon inte fixar det...",
  "finns hon inte.",
  "",
  "En stor uppgift för en liten tjej",
];

const INTRO_LINE_INTERVAL = 500;

function drawStartScreen(targetCtx, selectedItem, sprites) {
  const panelCx = CANVAS_WIDTH / 4;

  targetCtx.fillStyle = "#07071a";
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const bgImg = SpriteLoader.get("assets/images/start_screen.png");
  if (bgImg) {
    const scale = Math.max(CANVAS_WIDTH / bgImg.naturalWidth, CANVAS_HEIGHT / bgImg.naturalHeight);
    const dw = bgImg.naturalWidth * scale;
    const dh = bgImg.naturalHeight * scale;
    targetCtx.drawImage(bgImg, (CANVAS_WIDTH - dw) / 3, (CANVAS_HEIGHT - dh) / 2 +50, dw, dh);
  }

  targetCtx.save();
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";

  // Title — two lines to fit the panel width
  targetCtx.font = "bold 64px monospace";
  targetCtx.fillStyle = "#f0e040";
  targetCtx.fillText("CODE IN", panelCx, 160);
  targetCtx.fillText("THE LIGHT", panelCx, 236);

  targetCtx.font = "22px monospace";
  targetCtx.fillStyle = "rgba(255,255,255,0.45)";
  targetCtx.fillText("A Wedding Game", panelCx, 300);

  const items = ["START", "SETTINGS", "QUIT"];
  const menuY = 400;
  const lineH = 74;

  for (let i = 0; i < items.length; i++) {
    const y = menuY + i * lineH;
    const selected = i === selectedItem;
    targetCtx.font = `bold ${selected ? 38 : 30}px monospace`;
    targetCtx.fillStyle = selected ? "#ffffff" : "rgba(255,255,255,0.35)";
    targetCtx.fillText(selected ? "▶  " + items[i] : items[i], panelCx, y);
  }

  targetCtx.restore();

  // Characters in front of the church on the right side
  if (sprites) {
    const charW = 96;
    const charH = 192;
    const smallW = charW * 2 / 3;
    const smallH = charH * 2 / 3;
    const charY = 670;
    const cx = CANVAS_WIDTH / 2;
    const gap = 100;
    drawSprite(targetCtx, sprites.gustav, cx - gap, charY, charW,  charH,  "#ff8844");
    drawSprite(targetCtx, sprites.annie,  cx,        charY +15, smallW, smallH, "#4488ff");
    drawSprite(targetCtx, sprites.elina,  cx + gap,  charY, charW,  charH,  "#ff8844");
  }
}

function drawIntroScreen(targetCtx, elapsed) {
  const cx = CANVAS_WIDTH / 2;

  targetCtx.fillStyle = "#000000";
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  targetCtx.save();
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";

  const lineH = 38;
  const startY = lineH;

  for (let i = 0; i < INTRO_LINES.length; i++) {
    if (i > Math.floor(elapsed / INTRO_LINE_INTERVAL)) break;
    if (!INTRO_LINES[i]) continue;

    const age = elapsed - i * INTRO_LINE_INTERVAL;
    targetCtx.globalAlpha = Math.min(1, age / 350);
    const isLast = i === INTRO_LINES.length - 1;
    targetCtx.font = isLast ? "bold 30px monospace" : "26px monospace";
    targetCtx.fillStyle = isLast ? "#f0e040" : "#ffffff";
    targetCtx.fillText(INTRO_LINES[i], cx, startY + i * lineH);
  }

  targetCtx.globalAlpha = 1;

  const allShown = Math.floor(elapsed / INTRO_LINE_INTERVAL) >= INTRO_LINES.length - 1;
  if (allShown && Math.floor(elapsed / 500) % 2 === 0) {
    targetCtx.font = "22px monospace";
    targetCtx.fillStyle = "rgba(255,255,255,0.6)";
    targetCtx.fillText("Press space to begin...", cx, CANVAS_HEIGHT - 18);
  }

  targetCtx.restore();
}

function drawSettingsScreen(targetCtx, selectedItem, toggleValue) {
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;

  targetCtx.fillStyle = "#07071a";
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  targetCtx.save();
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";

  targetCtx.font = "bold 48px monospace";
  targetCtx.fillStyle = "#f0e040";
  targetCtx.fillText("SETTINGS", cx, cy - 130);

  const items = [
    "♡  EXTRA LOVE:  " + (toggleValue ? "ON" : "OFF"),
    "BACK",
  ];

  const menuY = cy + 10;
  const lineH = 84;

  for (let i = 0; i < items.length; i++) {
    const y = menuY + i * lineH;
    const selected = i === selectedItem;
    targetCtx.font = `bold ${selected ? 38 : 30}px monospace`;
    targetCtx.fillStyle = selected ? "#ffffff" : "rgba(255,255,255,0.35)";
    targetCtx.fillText(selected ? "▶  " + items[i] : items[i], cx, y);
  }

  targetCtx.restore();
}

function drawQuitScreen(targetCtx) {
  targetCtx.fillStyle = "#000000";
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawRoomPopover(targetCtx, popover) {
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;

  targetCtx.fillStyle = "rgba(0, 0, 0, 0.72)";
  targetCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const panelW = 780;
  const panelH = popover.height || 650;
  const px = cx - panelW / 2;
  const py = cy - panelH / 2;

  targetCtx.fillStyle = "#0d0d2b";
  targetCtx.strokeStyle = "#f0e040";
  targetCtx.lineWidth = 3;
  targetCtx.beginPath();
  targetCtx.roundRect(px, py, panelW, panelH, 12);
  targetCtx.fill();
  targetCtx.stroke();

  targetCtx.save();
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";

  targetCtx.font = "bold 36px monospace";
  targetCtx.fillStyle = "#f0e040";
  targetCtx.fillText(popover.title, cx, py + 52);

  const lineH = 34;
  const textStartY = py + 110;
  const lastIdx = popover.lines.reduce((last, l, i) => l ? i : last, -1);
  for (let i = 0; i < popover.lines.length; i++) {
    if (!popover.lines[i]) continue;
    const isLast = i === lastIdx;
    targetCtx.font = isLast ? "italic 24px monospace" : "24px monospace";
    targetCtx.fillStyle = isLast ? "#f0e040" : "#ffffff";
    targetCtx.fillText(popover.lines[i], cx, textStartY + i * lineH);
  }

  if (Math.floor(performance.now() / 500) % 2 === 0) {
    targetCtx.font = "20px monospace";
    targetCtx.fillStyle = "rgba(255,255,255,0.6)";
    targetCtx.fillText("Press space to continue...", cx, py + panelH - 30);
  }

  targetCtx.restore();
}
