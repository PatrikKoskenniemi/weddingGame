// ============================================================
// TINY WEDDING GAME – ROOM RENDERER
// Composes a room background from tilesets onto an offscreen canvas.
// ============================================================

const TILESETS = {
  floors:           { src: "assets/sprites/floors.png" },
  walls:            { src: "assets/sprites/walls.png" },         // 512x640
  bedside_table:    { src: "assets/sprites/bedside_table.png" },    // 32x48
  chair:            { src: "assets/sprites/chair.png" },            // 16x32
  crib:             { src: "assets/sprites/crib.png" },             // 32x32
  curtain_bedroom:  { src: "assets/sprites/curtain_bedroom.png" },  // 32x32
  doll:             { src: "assets/sprites/doll.png" },             // 32x32
  dollhouse:        { src: "assets/sprites/dollhouse.png" },        // 32x32
  drawer:           { src: "assets/sprites/drawer.png" },           // 16x32
  hanging_glitter:  { src: "assets/sprites/hanging_glitter.png" },  // 32x32
  lamp_button:      { src: "assets/sprites/lamp_button.png" },      // 16x16
  teddy_paddington: { src: "assets/sprites/teddy_bear_paddington.png" }, // 16x32
  wardrobe_messy:   { src: "assets/sprites/wardrobe_messy.png" },   // 32x48
  playmat_left:     { src: "assets/sprites/playmat_left.png" },     // 32x48
  playmat_right:    { src: "assets/sprites/playmat_right.png" },    // 32x48
  poster_solarsystem_left:   { src: "assets/sprites/poster_solarsystem_left.png" },   // 32x32
  poster_solarsystem_middle: { src: "assets/sprites/poster_solarsystem_middle.png" }, // 16x32
  poster_solarsystem_right:  { src: "assets/sprites/poster_solarsystem_right.png" },  // 16x32
  table_left:       { src: "assets/sprites/table_left.png" },       // 16x32
  table_right:      { src: "assets/sprites/table_right.png" },      // 16x32
  teddy_bear:       { src: "assets/sprites/teddy_bear.png" },       // 16x32
  train_2:          { src: "assets/sprites/train_2.png" },          // 32x16
  car_red:          { src: "assets/sprites/car_red.png" },          // 16x16
  train:            { src: "assets/sprites/train.png" },            // 32x16
  wardrobe_big:     { src: "assets/sprites/wardrobe_big.png" },     // 32x48
  window_left:      { src: "assets/sprites/window_left.png" },      // 32x48
  window_right:     { src: "assets/sprites/window_right.png" },     // 16x48
};

const T = 16; // tile size in source sheets
const S = 3;  // render scale (16px source → 48px game)

// --- Room Definition: Nursery ---
const ROOM_NURSERY = {
  // Colors extracted from Room_Builder_Walls_16x16 blue wall tile (x=352, y=128)
  wallColor: "#86b8df",       // sky blue wall body
  floorColor: "#a08c73",
  borderColor: "#3a3a50",     // dark frame around room
  ceiling: {
    molding: "#f8f8f8",       // white ceiling molding
    border: "#3a3a50",        // dark line above/below molding
    height: 4,                // molding height in source px
  },
  baseboard: {
    colors: ["#e0b870", "#c78c59", "#c78c59", "#b5754d"],
    border: "#3a3a50",
  },

  roomX: 240,
  roomY: 120,
  roomW: 800,
  roomH: 480,
  wallHeight: 140,

  // Floor tile from floors.png — light diagonal parquet (row 18, col 1, 48x32)
  floorTile: { tileset: "floors", sx: 0, sy: 544, sw: 48, sh: 32 },

  // Room: x=240..1040, wall y=120..260, floor y=260..592

  furniture: [
    // === WALL DECORATIONS (on the wall, y=120..260) ===

    // Window — left area
    { tileset: "window_left", sx: 0, sy: 0, sw: 32, sh: 48, dx: 340, dy: 125 },
    { tileset: "window_right", sx: 0, sy: 0, sw: 16, sh: 48, dx: 436, dy: 125 },

    // Hanging glitter
    { tileset: "hanging_glitter", sx: 0, sy: 0, sw: 32, sh: 32, dx: 350, dy: 126 },

    // Poster solar system — 2 pieces adjacent
    { tileset: "poster_solarsystem_left", sx: 0, sy: 0, sw: 32, sh: 32, dx: 614, dy: 148 },
    { tileset: "poster_solarsystem_right", sx: 0, sy: 0, sw: 16, sh: 32, dx: 710, dy: 148 },

    // Window — right area (behind curtain, drawn first)
    { tileset: "window_left", sx: 0, sy: 0, sw: 32, sh: 48, dx: 848, dy: 122 },
    { tileset: "window_right", sx: 0, sy: 0, sw: 16, sh: 48, dx: 944, dy: 122 },

    // Curtain — over right window
    { tileset: "curtain_bedroom", sx: 0, sy: 0, sw: 32, sh: 32, dx: 872, dy: 140 },

    // === LARGE FURNITURE (against wall, straddling floor line y=260) ===

    // Wardrobe big — far left
    { tileset: "wardrobe_big", sx: 0, sy: 0, sw: 32, sh: 48, dx: 255, dy: 164 },

    // Crib — lower-left corner of floor
    { tileset: "crib", sx: 0, sy: 0, sw: 32, sh: 32, dx: 284, dy: 456 },

    // Bedside table + lamp
    { tileset: "bedside_table", sx: 0, sy: 0, sw: 32, sh: 48, dx: 548, dy: 164 },
    { tileset: "lamp_button", sx: 0, sy: 0, sw: 16, sh: 16, dx: 564, dy: 172 },

    // Dollhouse
    { tileset: "dollhouse", sx: 0, sy: 0, sw: 32, sh: 32, dx: 680, dy: 212 },

    // Wardrobe messy
    { tileset: "wardrobe_messy", sx: 0, sy: 0, sw: 32, sh: 48, dx: 812, dy: 164 },

    // Drawer — far right
    { tileset: "drawer", sx: 0, sy: 0, sw: 16, sh: 32, dx: 944, dy: 212 },

    // === FLOOR ITEMS ===

    // Playmat — center
    { tileset: "playmat_left", sx: 0, sy: 0, sw: 32, sh: 48, dx: 530, dy: 350 },
    { tileset: "playmat_right", sx: 0, sy: 0, sw: 32, sh: 48, dx: 626, dy: 350 },

    // Train — on playmat top-left corner
    { tileset: "train", sx: 0, sy: 0, sw: 32, sh: 16, dx: 530, dy: 350 },

    // Table — left floor area
    { tileset: "table_left", sx: 0, sy: 0, sw: 16, sh: 32, dx: 310, dy: 370 },
    { tileset: "table_right", sx: 0, sy: 0, sw: 16, sh: 32, dx: 358, dy: 370 },

    // Chair — next to table
    { tileset: "chair", sx: 0, sy: 0, sw: 16, sh: 32, dx: 406, dy: 380 },

    // Teddy bear — near crib on floor
    { tileset: "teddy_bear", sx: 0, sy: 0, sw: 16, sh: 32, dx: 460, dy: 300 },

    // Teddy bear Paddington — near table
    { tileset: "teddy_paddington", sx: 0, sy: 0, sw: 16, sh: 32, dx: 340, dy: 310 },

    // Doll — right floor area
    { tileset: "doll", sx: 0, sy: 0, sw: 32, sh: 32, dx: 740, dy: 420 },

    // Train 2 — right floor
    { tileset: "train_2", sx: 0, sy: 0, sw: 32, sh: 16, dx: 850, dy: 400 },

    // Red car — near table
    { tileset: "car_red", sx: 0, sy: 0, sw: 16, sh: 16, dx: 380, dy: 470 },
  ],
};

// --- Room Composition ---
let roomBackground = null;

function composeRoom(roomDef) {
  const offscreen = document.createElement("canvas");
  offscreen.width = CANVAS_WIDTH;
  offscreen.height = CANVAS_HEIGHT;
  const rc = offscreen.getContext("2d");
  rc.imageSmoothingEnabled = false;

  const { roomX, roomY, roomW, roomH, wallHeight } = roomDef;

  // Dark surround
  rc.fillStyle = "#1a1a2e";
  rc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Floor — base color then tiled overlay
  const floorTop = roomY + wallHeight;
  const floorBottom = roomY + roomH - 8;
  const floorLeft = roomX + 8;
  const floorRight = roomX + roomW - 8;

  // Always fill base floor color first (covers any transparent tile pixels)
  rc.fillStyle = roomDef.floorColor;
  rc.fillRect(floorLeft, floorTop, floorRight - floorLeft, floorBottom - floorTop);

  if (roomDef.floorTile) {
    const ft = roomDef.floorTile;
    const floorImg = SpriteLoader.get(TILESETS[ft.tileset].src);
    if (floorImg) {
      const tw = ft.sw * S;
      const th = ft.sh * S;
      for (let y = floorTop; y < floorBottom; y += th) {
        for (let x = floorLeft; x < floorRight; x += tw) {
          const drawW = Math.min(tw, floorRight - x);
          const drawH = Math.min(th, floorBottom - y);
          const srcW = Math.min(ft.sw, Math.ceil(drawW / S));
          const srcH = Math.min(ft.sh, Math.ceil(drawH / S));
          rc.drawImage(floorImg, ft.sx, ft.sy, srcW, srcH, x, y, srcW * S, srcH * S);
        }
      }
    } else {
      rc.fillStyle = roomDef.floorColor;
      rc.fillRect(floorLeft, floorTop, floorRight - floorLeft, floorBottom - floorTop);
    }
  } else {
    rc.fillStyle = roomDef.floorColor;
    rc.fillRect(floorLeft, floorTop, floorRight - floorLeft, floorBottom - floorTop);
  }

  // Wall body — solid blue fill
  rc.fillStyle = roomDef.wallColor;
  rc.fillRect(roomX, roomY, roomW, wallHeight);

  // Ceiling decoration at top of wall
  if (roomDef.ceiling) {
    const c = roomDef.ceiling;
    const mh = c.height * S; // molding height scaled
    let cy = roomY;
    // Top border line
    rc.fillStyle = c.border;
    rc.fillRect(roomX, cy, roomW, S);
    cy += S;
    // White molding
    rc.fillStyle = c.molding;
    rc.fillRect(roomX, cy, roomW, mh);
    cy += mh;
    // Bottom border line
    rc.fillStyle = c.border;
    rc.fillRect(roomX, cy, roomW, S);
  }

  // Baseboard at bottom of wall
  if (roomDef.baseboard) {
    const bb = roomDef.baseboard;
    let by = roomY + wallHeight - (bb.colors.length + 1) * S;
    for (const color of bb.colors) {
      rc.fillStyle = color;
      rc.fillRect(roomX, by, roomW, S);
      by += S;
    }
    // Bottom border line
    rc.fillStyle = bb.border;
    rc.fillRect(roomX, by, roomW, S);
  }

  // Room border strips (frame)
  const borderColor = roomDef.borderColor || roomDef.wallColor;
  rc.fillStyle = borderColor;
  rc.fillRect(roomX, roomY, 8, roomH);              // Left
  rc.fillRect(roomX + roomW - 8, roomY, 8, roomH);  // Right
  rc.fillRect(roomX, roomY + roomH - 8, roomW, 8);  // Bottom

  // Draw furniture from tilesets
  for (const item of roomDef.furniture) {
    const img = SpriteLoader.get(TILESETS[item.tileset].src);
    if (img) {
      const s = item.scale || S;
      rc.drawImage(
        img,
        item.sx, item.sy, item.sw, item.sh,
        item.dx, item.dy, item.sw * s, item.sh * s
      );
    }
  }

  return offscreen;
}

function drawRoomBackground() {
  if (roomBackground) {
    ctx.drawImage(roomBackground, 0, 0);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}
