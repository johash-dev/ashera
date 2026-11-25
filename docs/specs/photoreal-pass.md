---
status: in-progress
updated: 2026-11-25
phase: 3
---

# Diorama look pass

Filename keeps the old working name `photoreal-pass`; the goal is NOT photoreal (see below).

## Goal

The Room looks like a polished game-engine diorama: the isometric cut-away look of the owner's three references (moody, dark surroundings, soft pools of coloured light, glowing strips, soft contact shadows, bevelled edges, a little bloom) — but subtle, not flashy. Every light in it is live, so when the owner later switches a real light, the Twin shows the same change (concept.md Phase 3 and 4).

## What the references share

1. Dark, soft-vignetted backdrop; the Room floats as a lit box.
2. Light is the star: warm lamp pools and coloured strips spill onto floor and walls and fall off smoothly.
3. Soft shadows and darkened corners everywhere; furniture sits on the floor.
4. Glowing sources bloom softly (strips, lamp shades, screens).
5. Rounded, slightly chunky forms that catch a highlight on the edge; simple materials with small surface variation, not photo textures.
6. Reflections on the floor and screens are soft, not mirror-like.

## Invariants

- **Lights are live, never baked.** No shadow, glow or colour from a light is baked into a texture, so changing a light's colour, brightness or on/off changes the whole picture. Only light-independent things (corner darkening, contact shadows from geometry) may be baked.
- Room measurements only from `room.config.ts`; light positions and shadow bounds derive from it.
- Item footprints and saved layouts unchanged.
- Draw-call budget stays under the e2e gate until the owner agrees to raise it.
- No new dependency or shipped asset without an ADR and the owner's approval.

## Light rig (the new seam)

One plain description of each light (name, kind, position from the Room/Fittings, colour, intensity, on or off) that the scene renders from, with the current look as the defaults. Glow materials (strips, lamp shades, screens) read the same state. It is just data inside the app for now: no device, no network, no saved layout.

The link from a real device to a light, and how state is stored or synced, is a one-way door ("device control") and is NOT decided here; it needs its own ADR in Phase 4. Slice 1 only makes sure the rig is data-driven so that door can open later without a rewrite.

## Out of scope

- Photoreal materials, wood-grain/tile photo textures, authored 3D model files, HDRI files, volumetric god rays.
- Real device control, light-state persistence, scenes UI (Phase 4).
- New Item types or any saved-layout change.

## Slices

Owner direction (2026-11-25): the Room and its props come first; where lights go is decided later. So the form and readability slices (1 to 4) come before any lighting slice, and slice 1 is the tracer bullet. The live light rig is still the rule for slices 5 onward; until then lights stay as they are.

What the current render shows (Overview, Entrance, checked in the dev server): black desk, TV, chair and PC gear melt into the black Slat panel wall and read as dark blobs; every edge is a sharp box; the Room has no depth cues (no shadows, no sill, no architrave); the Overview frames the Room small with the open door covering the view.

1. **Rounded edges, room shell and props** (done, awaiting owner "looks good": Wall pieces stay sharp so Opening seams do not show) — rounded corners inside the box merger with a small radius per box; the room shell is merged the same way (frees about 20 to 40 draw calls). — _you'll see: every edge of the desk, sofa, TV, skirting and walls softly rounded instead of razor-sharp, in every View._
2. **Props redone with real shapes** — chair back and seat, headphones band and cups, mouse, keyboard keys, monitor and TV stand, sofa cushions with soft puffy forms, rug edge; generated shapes, footprints unchanged. — _you'll see: a gaming chair, headphones and sofa that look like those objects, not stacks of boxes._
3. **Room details** — window sill, frame bars and a glass pane that reads as glass; door architrave and handle; skirting profile; ceiling beam edges; socket and switch plates; vent. Sizes from `room.config.ts` only. — _you'll see: a Room that looks built, with a proper window, door frame and trim._
4. **Black-on-black separation and framing** — a gentle fill so black furniture reads against the black Slat panel (edge highlights from slice 1 plus a faint cool rim light and soft corner darkening); Overview framed larger with the door not blocking the view; narrower lens for the isometric feel. This is the minimum lighting needed to see the props; it is not the light layout. — _you'll see: the desk, chair and TV clearly outlined against the dark wall, and a bigger Overview._
5. **Light rig and tone** — the data-driven light rig above; ceiling light as a soft area light; ambient dropped to a faint fill; soft code-only light-card environment at low strength; tuned tone curve (AgX or Neutral). Light positions beyond the existing ceiling light and accent strips wait for the owner. — _you'll see: the Room dimmer and warmer with the ceiling light falling off across the floor and the TV and glass catching reflections._
6. **Grounding** — soft shadows from the key light (one shadow map, redrawn only when a light or Item changes), contact shadows under furniture, gradient darkening in corners. — _you'll see: furniture sitting on the floor with soft shadows._
7. **Accent glow and spill** — real coloured lights at the strips and the green glow under the TV stand; glow faked with soft halos until slice 8. — _you'll see: coloured light washing the wall behind the desk and the floor near the TV._
8. **Finish pass (needs ADR)** — real bloom, soft corner occlusion, vignette, light colour grade via `@react-three/postprocessing`. Depth of field and film grain left out unless asked. — _you'll see: strips and lamp shades glowing softly, the frame darkening gently at the edges._
9. **Small surface variation and clutter** — faint floor tile variation, fabric sheen, soft reflections, cables, a plant, a power strip as static scenery (not Items); code-generated, no image files. — _you'll see: a lived-in room, less flat._

## Testing seams

- Unit: the light rig's defaults and on/off/colour updates (pure functions), shadow bounds derived from `room`, bevel and UV changes in `mergedBoxes.test.ts`.
- e2e: draw-call count under the gate; ready flag only after the environment bake; toggling a light in the rig (test handle) changes the rendered result.
- Visual: every View's snapshot changes in slices 1 to 5; one re-baseline per slice via the `update-snapshots` workflow, with before/after screenshots on the Approval card.

## Risks

- Re-baselining every snapshot each slice.
- Shadows roughly double draw calls for casters; slice 4's shell merge offsets it. Measure first.
- Environment bake must finish before ready, or e2e races.
- With the Room light-coloured (real-colours spec) and the references dark, "moody" means dim lights, not dark walls; the owner judges this on slice 1.
- Nothing has been measured or rendered yet. The four reviews only read code; frame costs are estimates.

## Done when

- [ ] `npm run verify` prints ALL GREEN
- [ ] Draw calls measured and under the gate
- [ ] Changing a light in the rig visibly changes the Room (shadow, spill and glow), with no baked light left
- [ ] Owner said "looks good" on before/after screenshots of every View, per slice
- [ ] docs updated (`concept.md`, `r3f.md`), `docs/log.md` entry added

## Open questions

- Light placements: decided later by the owner (2026-11-25); slices 5 to 7 wait on that.
- What bothers the owner most about the Room and props today? The renders show black-on-black blobs, sharp boxy shapes and a small, door-blocked Overview; slices 1 to 4 target those. Name any prop or part of the Room that matters most and it moves to the front.
- Approve `@react-three/postprocessing` (ADR) for slice 5, or stay with built-in three passes (more code, similar look)?
- Should the backdrop go bluish/violet like references 2 and 3, or stay near-black?
- Narrower lens on the Overview (more isometric), yes or no?
- Is a modest rise in the draw-call gate acceptable if measuring shows it is needed?
