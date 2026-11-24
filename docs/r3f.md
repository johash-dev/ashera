---
status: active
updated: 2026-11-21
---

# React Three Fiber rules

Target: smooth on Asher's PC; the Twin must not stutter while orbiting or dragging Items.

## Render loop

- Never call React `setState` (or store setters that re-render) inside `useFrame`. Mutate refs (`ref.current.position.x = …`) instead.
- Don't allocate in `useFrame` (no `new Vector3()` per frame) — reuse module-level or `useMemo` objects.
- Prefer `frameloop="demand"` once the scene is mostly static; call `invalidate()` after changes.

## Resources

- Declarative geometries/materials in JSX are disposed by R3F automatically. Anything created manually with `new` must be disposed in a cleanup.
- Share geometries and materials between identical meshes; use `<Instances>`/`InstancedMesh` for repeated objects (wall tiles, floor tiles).
- Draw solid parts through `MergedBoxes` (one mesh per material). `mergeBoxes` rounds every box edge by a small default radius, clamped to a quarter of its thinnest side; pass `radius: 0` where pieces form one flat surface (Wall pieces) so no seam shows.
- Textures small and power-of-two; load through Drei helpers so they are cached.

## Lighting and look

- Few real-time lights; shadows only where they clearly add to the look, with small shadow maps.
- Fake glow/accents with emissive materials and baked or environment lighting before reaching for post-processing.

## Units and placement

- 1 unit = 1 ft, +x east, +y up, +z south, origin at floor centre (ADR 0001).
- Positions come from room data or editor state — never typed in as literals inside components.

## State

- Domain state lives outside components (room config now; editor store in Phase 2). Components subscribe to the smallest slice they need, so editing one Item doesn't re-render the room.
