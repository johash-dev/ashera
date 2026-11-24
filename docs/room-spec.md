---
status: active
updated: 2026-11-21
---

# Room specification

The **numbers** live in [`src/room/room.config.ts`](../src/room/room.config.ts) — that file is the source of truth, and `validateRoom` checks its invariants in the unit tests. This page explains where the numbers came from and what is still unknown.

Sources: [hand sketch](reference/room-sketch.jpeg), [top-view floor plan](reference/floor-plan-top-view.png), [photos](reference/photos/).

## Measured values (checked by tests)

Every real measurement, written as measured. `src/room/measurements.test.ts` converts each one to feet and fails if `room.config.ts` disagrees, so a wrong conversion (like 7′ 2″ entered as 43 in) can't pass. Add a row whenever a placeholder gets measured. The first column is the config path; a list entry is picked by its `id`.

<!-- measurements:start -->

| Config path               | Measured |
| ------------------------- | -------- |
| `width`                   | 10′      |
| `depth`                   | 9′       |
| `ceilingHeight`           | 9′ 6″    |
| `walls.thickness`         | 6″       |
| `openings.doorway.width`  | 3′ 1″    |
| `openings.doorway.height` | 7′ 2″    |
| `openings.window.width`   | 5′ 9″    |
| `openings.window.height`  | 5′ 6″    |
| `beams.drop`              | 6″       |

<!-- measurements:end -->

## Layout (top view)

Wall names are **real compass directions** (north is geographic north).

```
                    NORTH — TV wall (10 ft) — no beam
              ┌────────────────────────────────────────┐
              │                                        │
  WEST       [ ]                                       │  EAST
  Window     [ ] window                                │  (9 ft)
  wall       [ ]                                       │  open door rests here;
  (9 ft)      │                              ╱         │  ~6 ft clear beyond it
              │              door swings in ╱          │
              └──────────────────────────────┤ doorway ├┘
                    SOUTH — Door wall (10 ft)   3 ft
```

- Interior 10 ft (west–east) × 9 ft (south–north); ceiling 9.5 ft.
- Entering through the doorway you face the north (TV) wall; the window is on your left.

## Features by wall

| Wall  | Features (from photos)                                                                |
| ----- | ------------------------------------------------------------------------------------- |
| North | Double socket low-left, wall plate mid-height (TV/data point); **no beam**            |
| East  | Open door rests against its south end; beam along the top                             |
| South | 3 ft doorway at the east end, 7 ft solid; switch plate and double socket; beam on top |
| West  | Window with curtain rod; beam along the top                                           |

- Beams drop 0.5 ft (underside at 9 ft).
- Finishes in reality: brick-pattern white wall tiles, dark wood skirting, grey marble-look floor tiles 4 × 2 ft, square flush ceiling panel light. The Twin re-skins these in the dark style.

## Planned items (owner's sketch and mood picture, agreed 2026-11-22)

The TV wall, following the owner's sketch and a mood picture shared in chat:

- **TV stand:** black cabinet hung on the north wall, 8 ft long × 1.5 ft high × 1 ft deep, 6 in above the floor (top at 2 ft), centred on the wall; two wide doors.
- **TV:** 55" or 65" (undecided — compare in the app), standing on its own feet on the stand, centred.
- **PS5:** upright on the stand, left of the TV. **Soundbar:** on the stand, centred in front of the TV.
- **Slat panel:** black vertical slats covering the whole north wall, corner to corner and floor to ceiling, with cut-outs for its socket and data plate.
- Later: controller and plant décor; green glow under the stand (Phase 3 lighting).

The rest of the Room (grill, 2026-11-22):

- **Computer desk:** Asher's own desk, 4 × 2 ft, with his PC, monitor, keyboard and mouse on it. Against the east wall, long side along the Wall, between the TV stand and the Door swing; Asher sits facing east with the TV on his left.
- **Desk sizes** are typical until measured: desk top 30 in high, 27″ monitor, mid-size PC tower (placeholders).
- **Sofa:** low back (about 2½ ft, below the window sill), slim arms, dark charcoal fabric. Two options to compare with a switch, like the TV size: a compact 2–3 seater (about 5½ × 3 ft) on the south wall from the window corner, facing the TV; or an L-shaped corner sofa, about 5½ ft along the south wall and 5 ft up the window wall, 3 ft deep, its short leg below the window sill and about 2½ ft short of the TV stand.
- **Gaming chair** at the desk (typical, about 2½ × 2½ ft) and a **dark rug** (about 5 × 3½ ft) between the sofa and the TV.
- Fixed in place for now, like the TV wall; moving furniture comes later as its own feature.
- Also wanted, planned later: lamps (lighting).

Wall décor (grill, 2026-11-23; all sizes typical until measured):

- **Pegboard:** black, 4 ft wide × 2 ft tall, on the east wall above the desk, centred on it, bottom edge about 4½ ft up (just above the monitor top). Headphones on a hook and a small shelf hang on it.
- **Picture frames:** three black portrait frames, each 1 ft wide × 1½ ft tall, on the south wall, evenly spaced and centred over the compact sofa, hung about 4 ft up. Same spot with the L-shaped sofa. Plain dark placeholder art for now; real pictures are a later feature.
- Everything stays below the Beam underside (9 ft) and clear of the open Door leaf, which rests against the east wall's south end.

## Real colours (grill, 2026-11-25)

The Twin moves from the all-dark look toward the real room: a light room with black furniture. Colours are the owner's words; exact hex values are picked in the spec and approved on screenshots.

- **Floor tiles:** white (very light, slightly cool; reality is pale grey marble-look).
- **Walls:** west (window wall), south (door wall, picture frames) and north (behind the slat panel's edges, if any shows) white. East (PC wall) mid grey.
- **TV wall:** the existing black Slat panel, unchanged.
- **Black:** the computer desk and the TV (full black, no lit edge).
- **Skirting:** stays dark wood, as in the photos.
- **Sofa** (custom-made, not yet built): charcoal grey, to match the grey PC wall and black furniture.
- Ceiling light is brightened so white reads as white; the violet accent stays for small details only.

## Still to measure

Placeholders are flagged `placeholder: true` in the config.

- [x] Doorway height 7′ 2″ and width 3′ 1″, inside the frame (measured 2026-11-21; in the config). The frame is about 1″ and is drawn as part of the Wall.
- [x] Window width 5′ 9″ and height 5′ 6″ (measured 2026-11-21; in the config)
- [ ] Window sill height and position along the west wall (placeholder sill 3.5 ft — top then meets the Beam underside at 9 ft — and centred, offset 1′ 7½″)
- [ ] Beam depth from each wall (placeholder 0.75 ft)
- [ ] Socket, switch and ceiling-light positions and sizes (placeholders estimated from the photos, centre of each plate: north double socket 4.1 ft from the NW corner at 1 ft high, data plate 4.3 ft at 5 ft; south switch 4.2 ft from the SE corner at 4.2 ft, double socket 3.9 ft at 1 ft; ceiling light 2 × 2 ft, centred. Plates 0.48 × 0.28 ft double, 0.28 ft square single)
- [x] Wall thickness 6″ = 0.5 ft, at the doorway jamb (measured 2026-11-21; in the config)
- [ ] Door leaf thickness (placeholder 1½″ = 0.125 ft)
- [ ] Skirting depth — how far its face stands off the wall tiles (placeholder ⅝ in = 0.05 ft; height 0.3 ft ≈ 3½ in)
- [ ] Floor-tile direction and where the grid starts (placeholder: long side north–south, from the south-west corner)
- [ ] Window frame — how far the frame reaches into the opening and how deep it is (placeholder 1¼ in = 0.1 ft wide, 2½ in = 0.2 ft deep, centred in the Wall)
