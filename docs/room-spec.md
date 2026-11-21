---
status: active
updated: 2026-11-21
---

# Room specification

The **numbers** live in [`src/room/room.config.ts`](../src/room/room.config.ts) — that file is the source of truth, and `validateRoom` checks its invariants in the unit tests. This page explains where the numbers came from and what is still unknown.

Sources: [hand sketch](reference/room-sketch.jpeg), [top-view floor plan](reference/floor-plan-top-view.png), [photos](reference/photos/).

## Layout (top view)

```
                    NORTH — Window wall (9 ft)
              ┌───────────[ window ]───────────┐
              │                                │
  WEST        │                                │  EAST
  Door wall   │                                │  TV wall
  (10 ft)     │                                │  (10 ft)
              │                                │
         ║    │                                │
  doorway║    │ ╲  door swings in              │
   3 ft  ║    │  ╲                             │
              └────────────────────────────────┘
                    SOUTH (9 ft) — open door rests here; ~6 ft clear beyond it
```

- Interior 9 ft (west–east) × 10 ft (south–north); ceiling 9.5 ft.
- Entering through the doorway you face the east (TV) wall.

## Features by wall

| Wall  | Features (from photos)                                                                 |
| ----- | -------------------------------------------------------------------------------------- |
| North | Window with curtain rod; beam along the top                                            |
| East  | Double socket low-left, wall plate mid-height (TV/data point); **no beam**             |
| South | Open door rests against its west end; beam along the top                               |
| West  | 3 ft doorway at the south end, 7 ft solid; switch plate and double socket; beam on top |

- Beams drop 0.5 ft (underside at 9 ft).
- Finishes in reality: brick-pattern white wall tiles, dark wood skirting, large grey marble-look floor tiles (~2 ft), square flush ceiling panel light. The Twin re-skins these in the dark style.

## Planned items (owner's sketch)

TV 55" or 65" (undecided — compare in the app) on the east wall; TV stand 8 ft × 1.5 ft high × 1 ft deep below it; PS5.

## Still to measure

Placeholders are flagged `placeholder: true` in the config.

- [ ] Doorway height (placeholder 7 ft)
- [ ] Window width, height, sill and position (placeholder 4.5 × 4 ft, sill 3.5 ft, centred)
- [ ] Beam depth from each wall (placeholder 0.75 ft)
- [ ] Socket, switch and ceiling-light positions
