---
status: in-progress # draft | approved | in-progress | done | superseded
updated: 2026-11-23
phase: 2
---

# Wall décor

## Goal

Asher sees the pegboard above his desk and three picture frames above the sofa, hung at real size and height, so the walls look lived-in and he can judge how they sit with the desk, monitor and sofa. Roadmap feature 2 (docs/concept.md); still fixed in place.

## User stories

- As Asher, I can see the pegboard (with headphones and a small shelf on it) above the desk and the three frames above the sofa from every View that shows those walls.
- As Asher, I see the frames in the same spot whichever sofa is chosen.
- As the Owner, I can change a décor Item's size in one place (the Catalog) and see the Twin update with nothing else edited.

## Invariants

- All sizes in feet (ADR 0001). Item sizes live only in the Catalog; positions only in the starter arrangement, derived from `room.config.ts` and the sizes — no literals in components.
- Wall décor is Items like any other: it stays inside the Room, intersects no other Item (touching is fine), and stays out of the Door swing, for both sofas and both TV sizes.
- Wall décor hangs on a Wall: its back is on the Wall face and its bottom is above the floor.
- Everything stays below the Beam underside (9 ft) of its Wall.
- The pegboard hangs on the east wall, centred on the desk, above the monitor's top. The frames hang on the south wall, centred on the sofa's long side (5½ ft from the window wall), clear of the south wall's Fittings.
- Draw calls stay under the e2e budget (< 100) in every View.

## Out of scope

Choosing or loading real pictures for the frames (later feature); drawing the pegboard's individual holes; more hooks or things on the pegboard; moving or selecting décor; Layouts; lighting; speakers; the Slat panel or any other wall.

## Data model

In the `editor` module; nothing is persisted, so no one-way door and no ADR. No new dependencies. Item needs no new field: a hung Item is just an Item whose centre is high above the floor and whose back is on a Wall face (facing west on the east wall, north on the south wall).

- **Catalog** — new Item types, all typical sizes and flagged `placeholder` until measured or a product is named:

  | Item type  | Size (width × height × depth)       | Source                   |
  | ---------- | ----------------------------------- | ------------------------ |
  | Pegboard   | 4 ft × 2 ft × 1 in                  | agreed in grill, typical |
  | Headphones | 7 in × 8 in × 3.5 in (hung on hook) | typical                  |
  | Shelf      | 12 in × 1 in × 4 in                 | typical                  |
  | Frame      | 1 ft × 1½ ft × 1 in                 | agreed in grill, typical |

- **Starter arrangement** gains the wall décor, computed from the Room, the desk's and sofa's spots and the Catalog:
  - Pegboard: back on the east wall face, facing west, centred on the desk north–south, bottom edge 4½ ft up. Headphones hang on a hook in its north third (Asher's left as he sits), the shelf sits on its south third at mid-height; both stand on the board's front face.
  - Three frames: back on the south wall face, facing north, bottom edge 4 ft up, 6 in apart, the middle one centred on the compact sofa's long side. The same spot for both sofas.
- Frame art, the hook and the pegboard's look are drawing only (dark placeholder art with a faint accent line; black board, black frames).

Décor sizes are furniture sizes, not Room measurements, so `docs/room-spec.md` "Measured values" gets no new rows.

## Testing seams

Unit (Vitest, `src/editor`):

- Starter arrangement for both sofas × both TV sizes: every décor Item inside the Room; no two Items intersect; all clear of the Door swing.
- Pegboard back on the east wall face and centred on the desk; bottom above the monitor's top; top below the Beam underside. Headphones and shelf on the board's front face and within its outline.
- Frames back on the south wall face, bottom above the sofa's top, evenly spaced and centred on the sofa, top below the Beam underside, none covering a south wall Fitting.
- All décor bottoms above the floor.

E2E (Playwright, `window.__ASHERA__`): `items` lists the pegboard, headphones, shelf and three frames with type, size, centre and facing; the frames' positions are the same with `?sofa=l`; no console errors; draw calls < 100 in every View.

Visual (`@visual`): per-View baselines updated each slice via the `update-snapshots` workflow.

## Done when

All must pass:

- [ ] `npm run verify` prints ALL GREEN
- [ ] `window.__ASHERA__.items` lists the pegboard, headphones, shelf and three frames with the Catalog sizes above, and unit tests prove none leaves the Room, enters the Door swing or intersects another Item, for both sofas and both TV sizes
- [ ] The pegboard's back is on the east wall face, centred on the desk, its bottom at 4½ ft and above the monitor's top, its top below the Beam underside (unit tests)
- [ ] The three frames' backs are on the south wall face, centred on the sofa, bottom at 4 ft, above the sofa's top, clear of the Fittings, same spot with either sofa (unit + e2e)
- [ ] Draw calls stay < 100 in every View (e2e)
- [ ] No new Room measurements, so no new "Measured values" rows (stated in the log entry)
- [ ] Owner said "looks good" on before/after screenshots of every View (plus `overview` with the L-shaped sofa)
- [ ] docs updated (architecture if the editor's role changes, GLOSSARY, room-spec "Planned items"), `docs/log.md` entry added

## Slices

1. **Tracer: the pegboard.** Catalog entry, placement on the east wall above the desk, drawn as a black board, listed in `__ASHERA__.items`. — _you'll see: a black 4 × 2 ft board on the east wall above the monitor, in the overview and right-from-entrance Views._
2. **Headphones and shelf on the pegboard.** — _you'll see: headphones hanging on a hook and a small shelf on the board, in the right-from-entrance View._
3. **Three picture frames.** Catalog, placement above the sofa (same for both sofas), drawn with dark placeholder art. — _you'll see: three black portrait frames above the sofa on the back wall, in the overview and window Views, and still there after switching to the L-shaped sofa._

## Open questions

- Real pegboard size, hook and shelf positions, and frame sizes (typical until measured). To measure: tape across and up the pegboard and frames, and from the floor to their bottom edges.
- Whether the pegboard should show its holes (not drawn for now; plain black board).
