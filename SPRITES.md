# Modern Interiors Free v2.2 – Sprite Sheet Reference

## License
Non-commercial use only. See LICENSE.txt.

## Characters Available
Adam, Alex, Amelia, Bob — all in `Characters_free/`

## Files Per Character
Each character (e.g. Adam) has these files at 16x16 base size:
- `Adam_16x16.png` — **Combined sheet** (384x224) with all animations
- `Adam_run_16x16.png` — Run animation only (384x32, single row)
- `Adam_idle_16x16.png` — Static idle poses only
- `Adam_idle_anim_16x16.png` — Animated idle
- `Adam_sit_16x16.png` — Sitting poses
- `Adam_sit2_16x16.png` / `Adam_sit3_16x16.png` — More sitting variants
- `Adam_phone_16x16.png` — Phone poses

## Combined Sheet Layout (`_16x16.png`)
Image size: **384 x 224** pixels
Frame size: **16px wide x 32px tall** (consistent for ALL frames)

### Row Layout
| Row | Content | Frame Count | Notes |
|-----|---------|-------------|-------|
| 0 | Default idle poses | 4 | One per direction, no animation |
| 1 | **Idle animations** | 24 | 4 directions x 6 frames each |
| 2 | **Run animations** | 24 | 4 directions x 6 frames each |
| 3 | Sitting poses | ~12 | Various sitting angles |
| 4 | Sitting poses (variant) | ~12 | More sitting |
| 5 | Sitting poses (variant) | ~12 | More sitting |
| 6 | Misc poses | ~10 | Phone, other |

### Direction Order (Rows 1 and 2)
Each row has 24 frames (24 x 16px = 384px), divided into 4 groups of 6:

| Columns | Direction |
|---------|-----------|
| 0–5 | **Right** |
| 6–11 | **Up** (back view) |
| 12–17 | **Left** |
| 18–23 | **Down** (front view) |

### How to Extract Frames
For a given direction and animation type:
```
frameWidth = 16
frameHeight = 32
row = 1 (idle) or 2 (run)
colOffset = { right: 0, up: 6, left: 12, down: 18 }

sx = (colOffset + frameIndex) * frameWidth   // frameIndex 0-5
sy = row * frameHeight
```

### Row 0 (Default Idle Poses)
Only 4 frames at columns 0-3, rest is empty. Each is a static pose facing one direction.
Order: down, right, up, left (columns 0, 1, 2, 3).

## Single-Animation Sheets (`_run_16x16.png`, etc.)
These are **384x32** (single row, same 24-frame layout as the corresponding row in the combined sheet).
Same direction order: right (0-5), up (6-11), left (12-17), down (18-23).
