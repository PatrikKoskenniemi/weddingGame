# Tiled Map Editor — Cheat Sheet

## Tools

| Shortcut | Tool | Use when... |
|----------|------|-------------|
| **B** | Stamp Brush | Painting tiles onto a **tile layer** |
| **T** | Insert Tile | Placing a tile object onto an **object layer** |
| **E** | Eraser | Removing tiles from a tile layer |
| **S** | Select Area | Selecting, copying, or moving a group of tiles on a tile layer |
| **M** | Move | Moving objects on an object layer |
| **R** | Insert Rectangle | Drawing collision/trigger rectangles on an object layer |
| **U** | Bucket Fill | Filling a region with a tile (floors) |

## Tile Layer vs Object Layer

| | Tile Layer | Object Layer |
|---|-----------|-------------|
| **Snapping** | Grid-locked (16x16) | Free positioning |
| **Place with** | Stamp Brush (**B**) | Insert Tile (**T**) |
| **Move with** | Select (**S**) then drag | Move (**M**) |
| **Best for** | Floors, walls, repeating patterns | Furniture, decorations, items |
| **Multi-tile** | Click+drag in tileset to select group | One tile per object |

## General Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+Z** | Undo |
| **Ctrl+Y** | Redo |
| **Ctrl+C / V** | Copy / Paste selection |
| **Ctrl+X** | Cut selection |
| **Ctrl+S** | Save |
| **Ctrl+Shift+E** | Export map |
| **Ctrl+G** | Toggle grid |
| **+** / **-** | Zoom in / out |
| **Space + drag** | Pan the map |
| **X** | Flip tile horizontally (while painting) |
| **Y** | Flip tile vertically (while painting) |
| **Z** | Rotate tile (while painting) |

## Snapping (View → Snapping)

| Option | Effect |
|--------|--------|
| Snap to Grid | Objects snap to 16x16 grid |
| Snap to Fine Grid | Objects snap to smaller grid (set divisions in Map Properties) |
| No Snapping | Free pixel positioning |

## Layer Setup for a Room

```
4. Decorations (object layer) — wall art, small items
3. Furniture (object layer) — freely positioned furniture
2. Walls (tile layer) — walls, baseboards, ceiling
1. Ground (tile layer) — floor tiles
```

## Tips

- **Select multiple tiles**: In the tileset panel, click and drag to select a group — paint them together with Stamp Brush
- **Resize map**: Map → Resize Map
- **Map properties**: Map → Map Properties (tile size, grid divisions)
- **Transparent color**: Set in tileset properties if tiles have a solid background instead of transparency
- **Shadowless sheets**: Use `Theme_Sorter_Shadowless/` for cleaner transparency
