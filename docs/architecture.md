---
status: active
updated: 2026-11-22
---

# Architecture

## Modules

Each folder in `src/` is a module with one public entry point, `index.ts`. Other modules import only that entry (`../room`, never `../room/geometry`) — ESLint enforces it. Inside a module, structure is free.

| Module        | Owns                                                                                                                                                                                                 | May import       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `room`        | Room types, the measured config, pure geometry and invariants. No React, no three.js.                                                                                                                | —                |
| `editor`      | Catalog, the starter arrangement, the Slat panel layout, and the rules Items obey: inside the Room, no overlaps, Door swing clear (live); later placement, snapping, editor state. Pure logic first. | `room`           |
| `persistence` | (Phase 2) Layout save/load in browser storage, JSON export/import, schema versioning.                                                                                                                | `room`, `editor` |
| `scene`       | Everything rendered with React Three Fiber: room meshes, Items, lighting, camera Views.                                                                                                              | `room`, `editor` |
| `ui`          | HTML overlay: HUD, panels, controls. No 3D.                                                                                                                                                          | `room`, `editor` |
| `devices`     | (Phase 4, not created yet) Device state and the Home Assistant connection.                                                                                                                           | `room`           |

`App.tsx` composes the modules; `main.tsx` mounts the app.

## Data flow

```
room.config.ts ─► room (validated data + geometry) ─┬─► scene (renders)
                                                    ├─► editor (rules) ─► persistence (Layouts)
                                                    └─► ui (overlay)
```

The scene renders data; it never owns domain rules. When Phase 2 adds editor state, scene and ui read it through the editor module's public API.

## Coordinates

1 scene unit = 1 ft; origin at the floor centre; +x east, +y up, +z south. See [ADR 0001](adr/0001-units-and-coordinates.md).

## Test seams

- Pure logic: unit tests on module functions.
- Running app: `window.__ASHERA__` (dev only) exposes scene state for Playwright; `?view=` makes camera positions deterministic.
