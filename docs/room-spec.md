---
status: active
updated: 2026-11-21
---

# Room specification

The **numbers** live in [`src/room/room.config.ts`](../src/room/room.config.ts) — that file is the source of truth, and `validateRoom` checks its invariants in the unit tests. This page explains where the numbers came from and what is still unknown.

Sources: [hand sketch](reference/room-sketch.jpeg), [top-view floor plan](reference/floor-plan-top-view.png), [photos](reference/photos/).

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

## Planned items (owner's sketch)

TV 55" or 65" (undecided — compare in the app) on the north wall; TV stand 8 ft × 1.5 ft high × 1 ft deep below it; PS5.

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
