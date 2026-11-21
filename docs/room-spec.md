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

- [ ] Doorway height (placeholder 7 ft)
- [ ] Window width, height, sill and position (placeholder 4.5 × 4 ft, sill 3.5 ft, centred)
- [ ] Beam depth from each wall (placeholder 0.75 ft)
- [ ] Socket, switch and ceiling-light positions
- [ ] Wall thickness, at the doorway jamb (placeholder 0.5 ft)
- [ ] Floor-tile direction and where the grid starts (placeholder: long side north–south, from the south-west corner)
