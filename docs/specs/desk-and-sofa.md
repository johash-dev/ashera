---
status: in-progress # draft | approved | in-progress | done | superseded
updated: 2026-11-23
phase: 2
---

# Desk and sofa

## Goal

Asher sees the rest of his Room furnished at real size: his computer desk with PC, monitor, keyboard and mouse on the east wall, a gaming chair at it, a sofa on the south wall and a dark rug, so he can judge breathing space. He can switch the sofa between a compact 2–3 seater and an L-shaped corner sofa to compare. Roadmap feature 1 (docs/concept.md); still fixed in place.

## User stories

- As Asher, I can see the desk, chair, sofa and rug from every View and judge how much floor is left.
- As Asher, I can click one Header button to switch between the compact sofa and the L-shaped sofa and compare them in every View.
- As the Owner, I can change an Item's size in one place (the Catalog) and see the Twin update with nothing else edited.

## Invariants

- All sizes in feet (ADR 0001). Item sizes live only in the Catalog; positions only in the starter arrangement, derived from `room.config.ts` (Wall faces, doorway, Door swing) and the sizes — no literals in components.
- Every Item sits inside the Room; no two Items intersect (resting on top is touching), for both sofa options and both TV sizes. Exception: the rug is a floor covering — other Items may stand on it, so it is left out of the no-overlap check, but it must stay inside the Room and out of the Door swing.
- No Item enters the Door swing (the existing conservative circle check).
- The desk stands against the east wall between the TV stand's front and the Door swing; the sofa stands against the south wall from the window (west) corner and never reaches the doorway.
- The sofa's back stays below the window sill.
- Draw calls stay under the e2e budget (< 100) in every View.

## Out of scope

Selecting, dragging, rotating or snapping Items; Layouts and saving; distance read-outs; pegboard and picture frames (roadmap feature 2); speakers (feature 3); lamps and any lighting (feature 5); remembering the chosen sofa after a reload; real product models or textures; cables.

## Data model

In the `editor` module; nothing is persisted, so no one-way door and no ADR. No new dependencies.

- **Item** gains a facing (north, east, south or west: the way its front points). Size stays width (along the Wall it backs onto) × height × depth; the rules turn it into a box along the Room's axes. TV-wall Items face south.
- **Catalog** — new Item types, all typical sizes and flagged `placeholder` until measured or a product model is named:

  | Item type     | Size (width × height × depth)                                                           | Source                          |
  | ------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
  | Computer desk | 4 × 2.5 × 2 ft (top 30 in high)                                                         | owner: 4 × 2 ft; height typical |
  | Monitor 27″   | 24.1 in × 20 in (panel on its stand) × 8 in                                             | typical 27″                     |
  | PC tower      | 8.5 in × 18 in × 17 in                                                                  | typical mid-size tower          |
  | Keyboard      | 17.5 in × 1.5 in × 5.5 in                                                               | typical full-size               |
  | Mouse         | 2.5 in × 1.5 in × 4.7 in                                                                | typical                         |
  | Gaming chair  | 27 in × 50 in × 27 in                                                                   | typical                         |
  | Compact sofa  | 5.5 × 2.5 × 3 ft (low back, slim arms)                                                  | agreed in grill, typical        |
  | L-shaped sofa | long side 5.5 × 2.5 × 3 ft; short side 3 × 2.5 × 2 ft (5 ft up the window wall overall) | agreed in grill, typical        |
  | Rug           | 5 × ½ in × 3.5 ft                                                                       | agreed in grill, typical        |

  The L-shaped sofa is listed as two Items, its long and short side, touching at the corner, so the existing box rules check it unchanged.

- **Starter arrangement** gains the rest of the Room, computed from the Room, the TV size and the chosen sofa (compact or L):
  - Desk: back against the east wall, facing west, its north end level with the TV stand's front. On it: monitor centred at the back, keyboard in front of it, mouse to its right (south), PC tower at the south end.
  - Gaming chair: facing the desk (east), centred on it, its front touching the desk's front.
  - Compact sofa: back against the south wall, west end in the window corner, facing north. L-shaped sofa: the same long side, plus the short side against the window wall facing east, from the long side's back corner.
  - Rug: long side west–east, east edge at the chair, centred north–south between the TV stand's front and the compact sofa's front; the same spot for both sofas (the L's short side stands on its edge).
- Sofa choice is app state (default compact), switchable from the Header and by `?sofa=compact|l`, so Views and screenshots are reproducible.

Desk height, monitor and tower sizes are furniture sizes, not Room measurements, so `docs/room-spec.md` "Measured values" gets no new rows.

## Testing seams

Unit (Vitest, `src/editor`):

- Item box from facing: an east-facing 4 × 2 ft Item spans 2 ft west–east and 4 ft north–south.
- Starter arrangement for both sofas × both TV sizes: every Item inside the Room; no two intersect (rug excepted); all clear of the Door swing.
- Desk back on the east wall face, north end level with the stand front; monitor, keyboard, mouse and tower resting on the desk top and within it.
- Sofa back on the south wall face, west end on the window wall face, east end west of the doorway; sofa height below the window sill. L short side on the window wall face, touching the long side.
- Rug inside the Room, east edge at the chair, out of the Door swing.
- `sofaFromSearch`: `?sofa=l` gives L; missing or unknown gives compact.

E2E (Playwright, `window.__ASHERA__`): `items` lists every Item with type, size, centre and facing; new `sofa`. The Header sofa button flips `sofa` and swaps the compact sofa for the two L-sofa Items; `?sofa=l` loads the L; no console errors; draw calls < 100 in every View.

Visual (`@visual`): per-View baselines updated each slice via the `update-snapshots` workflow; one extra `overview` baseline at `?sofa=l`.

## Done when

All must pass:

- [ ] `npm run verify` prints ALL GREEN
- [ ] `window.__ASHERA__.items` lists the desk, monitor, PC tower, keyboard, mouse, gaming chair, sofa and rug with the Catalog sizes above, and unit tests prove none leaves the Room, enters the Door swing or intersects another (rug excepted), for both sofas and both TV sizes
- [ ] The desk's back is on the east wall face and its north end level with the TV stand's front; the four desk-top Items rest on and within the desk top (unit tests)
- [ ] The sofa's back is on the south wall face, its west end on the window wall face, its east end west of the doorway, and its top below the window sill (unit tests, both sofas)
- [ ] The Header sofa button switches `window.__ASHERA__.sofa` between compact and L and the drawn sofa changes to match; `?sofa=l` loads the L (e2e)
- [ ] Draw calls stay < 100 in every View (e2e)
- [ ] No new Room measurements, so no new "Measured values" rows (stated in the log entry)
- [ ] Owner said "looks good" on before/after screenshots of every View, plus `overview` with the L-shaped sofa
- [ ] docs updated (architecture if the editor's role changes, GLOSSARY for new terms, room-spec "Planned items"), `docs/log.md` entry added

## Slices

1. **Tracer: the desk.** Facing on Items, the desk in the Catalog and the starter arrangement, drawn, listed in `__ASHERA__.items` with its facing. — _you'll see: a dark 4 × 2 ft desk against the east wall, between the TV stand and the door, in the overview and right-from-entrance Views._
2. **Desk setup and gaming chair.** Monitor, PC tower, keyboard, mouse on the desk; chair in front. — _you'll see: the monitor, tower, keyboard and mouse on the desk and the gaming chair pulled up to it, in the right-from-entrance View._
3. **Compact sofa.** — _you'll see: a low charcoal 2–3 seater against the back wall from the window corner, facing the TV, in the overview and window Views._
4. **L-shaped sofa and the sofa switch.** Header button, `?sofa=`. — _you'll see: one click swaps the compact sofa for the L-shaped one wrapping up the window wall, in every View._
5. **Rug.** — _you'll see: a dark rug on the floor between the sofa and the TV, in the overview and entrance Views._

## Open questions

- Real desk height, monitor size and PC tower size (typical until measured: 30 in, 27″, mid-size tower). To measure: tape from the floor to the desk top; the monitor's diagonal is on its box or label.
- The real desk's colour and finish — drawn dark like the TV stand until told otherwise.
- Gaming chair look (drawn near-black) and sofa and rug product models — all typical sizes until chosen.
