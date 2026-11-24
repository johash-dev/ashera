---
status: done # draft | approved | in-progress | done | superseded
updated: 2026-11-25
phase: 2
---

# Real colours

## Goal

Asher sees the Twin in the real room's colours: a light room (white floor tiles and walls, a grey PC wall) with black furniture and a charcoal sofa, so he can judge how the furniture will look before buying. Colour choices are in `docs/room-spec.md` "Real colours".

## User stories

- As Asher, I see white floor tiles and white west and south Walls, a mid-grey east Wall behind the desk, and the dark wood skirting, as in the photos.
- As Asher, I see a black desk and a full-black TV (no lit edge) standing against the light room.
- As Asher, I see the sofa in charcoal grey, in both the compact and the L-shaped form, to judge it against the grey wall.
- As the Owner, I can change any of these colours in one place (the look file) and see the Twin update with nothing else edited.

## Invariants

- Every colour lives only in `src/scene/look.ts`; no colour literals in components.
- Colours only: no geometry, size, position or Catalog change. Room measurements untouched.
- The Slat panel on the north wall is unchanged (black slats on black felt); it covers that wall, so the north wall has no visible colour of its own.
- The ceiling and the Beams are white like the west and south Walls (as in the photos), whichever Wall the Beam is on.
- Draw calls stay under the e2e budget (< 100) in every View; the extra grey wall material adds no meshes.
- Everything stays readable: black Items stand out against the light Walls, and no surface is clipped to pure white or pure black in any View.

## Out of scope

New furniture or shapes; textures or the brick pattern on the Walls; the curtain; the Door's colour; the page background behind the Room and the Header; moving to a light page theme; real sofa fabric texture; lighting layout beyond brightening the existing ceiling light; the violet accent details on the PC, chair and rug (kept as they are, re-tuned only if they clash).

## Data model

Nothing is persisted, so no one-way door and no ADR. No new dependencies. All changes are values in the look file plus one small change in the Room shell:

- **Look file:** wall, floor, ceiling-light brightness, TV, desk, sofa and tile-joint colours updated; one new colour for the grey east wall. Starting values (tuned on screenshots, the Owner approves the look): white walls `#f2f2f4`, mid-grey east wall `#8a8d94`, white floor `#e6e8ec`, black desk top `#0d0d10`, TV screen and edge `#050508` with the edge glow off, charcoal sofa `#3a3d46` (cushions one shade lighter). Skirting keeps its dark wood look. Floor-tile joints change from violet to a faint grey so they read as real grout on white.
- **Room shell:** the east Wall's boxes use the grey material; every other Wall, the ceiling and every Beam use the white one. A small pure function says which colour a Wall gets, so it can be unit-tested.

## Testing seams

Unit (Vitest):

- The Wall-colour function: east gets the grey, west, south and north get white; ceiling and Beams get white.
- Look file: every colour is a valid hex; the white walls are lighter than the grey wall, which is lighter than the desk; the TV edge glow is 0.

E2E (Playwright): no console errors; draw calls < 100 in every View; `window.__ASHERA__` item list unchanged (colours change nothing structural).

Visual (`@visual`): per-View baselines updated each slice via the `update-snapshots` workflow. The before/after screenshots of every View, plus `overview` with the L-shaped sofa, go on the Approval card.

## Done when

All must pass:

- [x] `npm run verify` prints ALL GREEN
- [x] The east Wall renders mid grey; west, south, ceiling and Beams render white (unit test on the Wall-colour function)
- [x] Floor tiles render white with faint grey joints; skirting stays dark wood (screenshot, `overview` and `top` Views)
- [x] Desk top and TV are black and the TV has no lit edge (unit test: glow 0; screenshot)
- [x] Sofa is charcoal grey in both forms (screenshots of `overview` and `overview` with the L-shaped sofa)
- [x] The Slat panel is visually unchanged (before/after compare in the `entrance` View)
- [x] Draw calls < 100 in every View (e2e)
- [x] No new Room measurements, so no new "Measured values" rows (stated in the log entry)
- [ ] Owner said "looks good" on before/after screenshots of every View
- [x] docs updated (room-spec "Real colours" matches the final look, concept "Visual style" already updated), `docs/log.md` entry added

## Slices

1. **Tracer: the light room.** Look file, grey east-wall material and the Wall-colour function, brighter ceiling light, white floor with grey joints. — _you'll see: the room turns white with a grey wall behind the desk and the dark skirting, in every View; the black furniture now stands out against it._
2. **Black furniture and charcoal sofa.** Desk top and legs black, TV full black with no lit edge, sofa charcoal grey in both forms, other Items re-tuned only where they now clash with the light room. — _you'll see: the black desk and TV, and the charcoal sofa (compact and L-shaped), in the overview and entrance Views._

## Open questions

- Page background behind the Room stays dark for now (out of scope); say if you want it lighter too.
- Exact greys and whites are my first picks; they will be tuned on screenshots and you approve the final look.
