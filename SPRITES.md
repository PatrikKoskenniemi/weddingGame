# Sprite & Asset Reference

## License
Commercial use allowed with credits to **limezu.itch.io**. Cannot resell or distribute the assets.

---

## Full Pack Location
`/private/tmp/modern_interiors/moderninteriors-win/`

**Top-level structure:**
```
moderninteriors-win/
├── 1_Interiors/          # All furniture, tiles, room components
├── 2_Characters/         # Character generator + premade characters
├── 3_Animated_objects/   # Doors, appliances, effects (spritesheets + GIFs)
├── 4_User_Interface_Elements/  # UI overlays, emotes, timers
├── 6_Home_Designs/       # Pre-made complete room layouts for reference
├── Palettes/
├── LICENSE.txt
├── READ_ME.txt
└── THIRD-PARTY TOOLS.txt
```

All categories are available in **16x16, 32x32, and 48x48** pixel sizes. This project uses **16x16**.

---

## 1. Interiors (Furniture & Tiles)

### Key Paths
```
1_Interiors/16x16/
├── Interiors_16x16.png           # Master compiled sheet (256 x 17024)
├── Room_Builder_16x16.png        # Room structure sheet (1216 x 1808)
├── Room_Builder_subfiles/        # Modular room building components
├── Theme_Sorter/                 # 26 themed compiled sheets
├── Theme_Sorter_Singles/         # Individual tile PNGs per theme
├── Theme_Sorter_Shadowless/      # Same themes without shadows
├── Theme_Sorter_Shadowless_Singles/
├── Theme_Sorter_Black_Shadow/    # Same themes with black shadows
└── Theme_Sorter_Black_Shadow_Singles/
```

### Room Builder Subfiles
Path: `1_Interiors/16x16/Room_Builder_subfiles/`

| File | Purpose |
|------|---------|
| `Room_Builder_Floors_16x16.png` | Floor tile patterns |
| `Room_Builder_Walls_16x16.png` | Wall tiles |
| `Room_Builder_3d_walls_16x16.png` | 3D perspective walls |
| `Room_Builder_Baseboards_16x16.png` | Baseboard trim pieces |
| `Room_Builder_borders_16x16.png` | Room edge/border tiles |
| `Room_Builder_Floor_Connectors_16x16.png` | Transition tiles between floor types |
| `Room_Builder_Floor_Paths_16x16.png` | Walkway/path overlays |
| `Room_Builder_Floor_Shadows_16x16.png` | Shadow tiles for depth |
| `Room_Builder_Arched_Entryways_16x16.png` | Arched doorway tiles |

### Theme Compiled Sheets
Path: `1_Interiors/16x16/Theme_Sorter/`

Each is a **256px wide** PNG (16 tiles across) of varying height.

| # | Theme | Notes |
|---|-------|-------|
| 1 | Generic | Common items (tables, chairs, plants, shelves) |
| 2 | Living Room | Sofas, TVs, coffee tables |
| 3 | Bathroom | Tubs, toilets, sinks |
| **4** | **Bedroom** | **Beds, cribs, wardrobes, rugs, toys, bunk beds, teddy bears, train sets, dolls, star garlands** |
| 5 | Classroom & Library | Desks, bookshelves |
| 6 | Music & Sport | Instruments, equipment |
| 7 | Art | Easels, supplies |
| 8 | Gym | Equipment |
| 9 | Fishing | Tackle, rods |
| **10** | **Birthday Party** | **Balloons, cakes, confetti, presents, banners** |
| 11 | Halloween | Spooky decorations |
| 12 | Kitchen | Stoves, fridges, counters |
| 13 | Conference Hall | Office furniture |
| 14 | Basement | Storage, tools |
| 15 | Christmas | Trees, decorations |
| 16 | Grocery Store | Shelves, registers |
| 17 | Visible Upstairs System | Multi-floor tiles |
| 18 | Jail | Cell bars, bunks |
| 19 | Hospital | Medical equipment |
| 20 | Japanese Interiors | Tatami, shoji screens |
| 21 | Clothing Store | Racks, mannequins |
| 22 | Museum | Display cases, exhibits |
| 23 | TV & Film Studio | Cameras, lights, sets |
| 24 | Ice Cream Shop | Counter, stools |
| 25 | Shooting Range | Targets, barriers |
| 26 | Condominium | Modern furniture |

### Bedroom Theme (Key for Nursery Room)
**File:** `Theme_Sorter/4_Bedroom_16x16.png` — **256 x 1712 pixels**

Contains nursery-relevant items:
- Cribs (multiple colors)
- Bunk beds
- Teddy bears
- Toy trains & dolls
- Star garlands
- Round rugs
- Kids' wardrobes & dressers
- Desks with chairs
- Regular beds (various styles)
- Curtains
- "REVAMPED STUFF" section at bottom with updated bed/furniture designs

### Individual Tiles (Singles)
Path: `1_Interiors/16x16/Theme_Sorter_Singles/4_Bedroom_Singles/`

Each furniture piece is an individual PNG file. Use these when you need exact tile coordinates — the filename tells you what it is. Much easier than guessing coordinates from the compiled sheet.

---

## 2. Characters

### Character Generator System
Path: `2_Characters/Character_Generator/`

Characters are built by **layering sprites** in this order (bottom to top):
1. **Body** (base layer)
2. **Eyes**
3. **Outfit**
4. **Hairstyle**
5. **Accessory** (top layer)

All layers use the same sprite sheet dimensions and frame layout, so they align when drawn on top of each other.

### Adult Character Parts
| Part | Path (under `Character_Generator/`) | Count |
|------|------|-------|
| Bodies | `Bodies/16x16/Body_01.png` – `Body_09.png` | 9 |
| Eyes | `Eyes/16x16/` | Multiple |
| Outfits | `Outfits/16x16/Outfit_01_01.png` etc. | 133 (33 categories × variants) |
| Hairstyles | `Hairstyles/16x16/` | Multiple with color variants |
| Accessories | `Accessories/16x16/` | Multiple |

### Kid Character Parts
| Part | Path (under `Character_Generator/`) | Count |
|------|------|-------|
| Bodies | `Bodies_kids/16x16/Body_1_kid.png` – `Body_4_kid.png` | 4 |
| Eyes | `Eyes_kids/16x16/Eyes_kids_1.png` – `Eyes_kids_6.png` | 6 |
| Outfits | `Outfits_kids/16x16/Outfit_kid_1.png` – `Outfit_kid_7_pajama_tiger.png` | 7 |
| Hairstyles | `Hairstyles_kids/16x16/Hairstyle_kid_N_C.png` | 30 (6 styles × 5 colors) |

**Kid Outfit Notes:**
- `Outfit_kid_6_pajama_frog.png` — frog pajamas with hood (no hairstyle needed)
- `Outfit_kid_7_pajama_tiger.png` — tiger pajamas with hood (no hairstyle needed)

### Kid Sprite Sheet Dimensions
**Body_1_kid.png:** 384 × 128 pixels
- Frame size: **16 x 16** (kids are shorter than adults!)
- 24 columns × 8 rows

**Note:** Kid characters are 16x16 frames (square), NOT 16x32 like adults.

### Premade Characters
Path: `2_Characters/Character_Generator/0_Premade_Characters/16x16/`
- 20 premade characters: `Premade_Character_01.png` – `Premade_Character_20.png`
- Visual reference: `Premade_Characters_LIST.png`

### Character Animation Row Layout
From `Spritesheet_animations_GUIDE.png`:

| Row | Animation | Notes |
|-----|-----------|-------|
| 0 | Default idle poses | 4 frames (one per direction) |
| 1 | **Idle animation** | 4 dirs × 6 frames = 24 frames |
| 2 | **Walk/Run animation** | 4 dirs × 6 frames = 24 frames |
| 3 | Sleep | |
| 4 | Sit | |
| 5 | 4-8 loop | |
| 6 | Phone | |
| 7 | Push cart | |
| 8+ | Pick up, gift, lift, throw, hit, punch, stab, grab gun, gun idle, shoot, hurt | |

**Direction order within rows 1-2 (24 frames per row):**
| Columns | Direction |
|---------|-----------|
| 0–5 | **Right** |
| 6–11 | **Up** (back view) |
| 12–17 | **Left** |
| 18–23 | **Down** (front view) |

**Frame extraction formula:**
```
frameWidth = 16
frameHeight = 32  (adults) or 16 (kids)
row = 1 (idle) or 2 (walk)
colOffset = { right: 0, up: 6, left: 12, down: 18 }

sx = (colOffset + frameIndex) * frameWidth   // frameIndex 0-5
sy = row * frameHeight
```

---

## 3. Animated Objects
Path: `3_Animated_objects/16x16/spritesheets/`

300+ animated objects including:
- Doors (regular, sliding, glass, prison, elevator)
- Kitchen appliances (oven, sink, fridge, toaster)
- Bathroom items (bathtub, sink)
- Shopping carts, security cameras
- Holiday items (Christmas, Halloween, birthday)
- Animals (cat, butterfly, frog, spider)
- Candles, clocks, TVs
- Traps, escalators, treadmills

GIF previews available in `3_Animated_objects/16x16/gif/`.

---

## 4. User Interface Elements
Path: `4_User_Interface_Elements/`

- `UI_16x16.png` (288 × 256) — Static UI elements
- `Animated_Spritesheets/` — Emotes, timers, indicators

---

## 6. Home Designs (Reference Layouts)
Path: `6_Home_Designs/`

Pre-made complete room layouts for reference:
- Generic Home, Condominium, Gym, Ice Cream Shop, Japanese, Museum, Shooting Range, TV Studio

Use `Generic_Home_Designs/` as reference for how rooms are assembled.

---

## Current Game Assets

### Player Sprite
- **Source:** `Adam_16x16.png` from free pack Characters
- **Location:** `assets/sprites/player.png`
- Frame size: 16×32, combined sheet 384×224
- Using idle (row 1) and walk (row 2) animations

### Heart Sprite
- **Source:** `SmallItems.png` from Top-Down Retro Interior pack
- **Location:** `assets/sprites/items.png`
- Frame: row 1, col 7 (16×16)

### Room Tilesets (Currently Loaded)
- `assets/sprites/room_builder.png` — Room Builder (FREE version, to be replaced)
- `assets/sprites/interiors.png` — Interiors (FREE version, to be replaced)

### What Needs Updating
- Replace `room_builder.png` with full pack version for more floor/wall options
- Replace `interiors.png` with bedroom theme or full interiors for nursery furniture
- Consider using kid character (Body_kid + Eyes_kid + Outfit_kid + Hairstyle_kid) for Room 1
- Consider using individual tile PNGs from Singles folders for easier coordinate work

---

## Tips for Working with Assets

1. **Use Singles folders** when you need specific furniture — individual PNGs are named descriptively, no coordinate guessing needed.
2. **Use Theme Sorter compiled sheets** when you want to browse visually or need many items from one theme.
3. **Kid characters are 16×16 frames** (not 16×32 like adults) — the spriteSystem.js frameHeight must change if switching to a kid character.
4. **Character Generator layers must all come from the same size folder** (all 16x16 or all 32x32).
5. **Pajama outfits** (frog/tiger) include a hood, so they don't need a hairstyle layer.
6. **3x scale** is used in-game (16px source → 48px rendered).
