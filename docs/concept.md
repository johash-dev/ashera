---
status: active
updated: 2026-11-21
---

# Concept

**ASHERA** (ASH + ERA — Asher's era) · _Enter Your Era._
A stylized 3D digital twin of Asher's gaming room, used on his PC to plan the room's layout and, later, to control its smart devices. Built and maintained by the Owner for Asher.

## Decisions

| Topic             | Decision                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Audience          | One user: Asher. Not a product or multi-room platform.                                                                              |
| Device            | PC browser only (mouse + keyboard).                                                                                                 |
| First goal        | Recreate the empty room accurately in 3D.                                                                                           |
| Visual style      | Stylized gaming vibe — real geometry and real colours (light room, black furniture; see room-spec), accent lighting. Not photoreal. |
| Furniture         | Asher places, moves and rotates furniture himself.                                                                                  |
| Saved layouts     | Browser storage on Asher's PC + JSON export/import ([ADR 0002](adr/0002-layouts-in-browser-storage.md)).                            |
| Hardware / budget | Deferred until Phase 4.                                                                                                             |

Room measurements: [room-spec.md](room-spec.md).

## Phases

### Phase 1 — Empty-room twin

Walls, floor, ceiling, beams, skirting, doorway, door with swing, window, sockets, ceiling light — all from `src/room/room.config.ts`. Orbit/pan/zoom plus preset Views matching the reference photos (entrance, window, left/right from entrance) and a top-down plan. Dark look established early.
**Done when:** the Twin matches the measurements and photos, navigates smoothly, and Items can be added without rebuilding the room.

### Phase 2 — Furniture editor

Catalog (TV 55"/65", 8 ft TV stand, gaming chair, desk, shelves, seating, décor) as simple shapes at real size. Select, move, rotate, snap to grid and walls; no passing through walls; warn when the Door swing or doorway is blocked; show distances (e.g. seat to TV). Multiple named Layouts, JSON export/import.
**Done when:** Asher can lay out the real room and compare options before buying.

### Phase 3 — Look & lighting

Refine the aesthetic; preview LED strips, lamps and accent lighting before buying.

### Phase 4 — Smart devices (later)

Choose hardware first. Likely Home Assistant as the hub, ASHERA talking only to it. Link Items to Devices (click a light to control it; state reflected in the Twin); room scenes (Gaming, Movie, Relax, All off).

## Roadmap (agreed 2026-11-22)

The order of features after the TV wall. Each gets its own `/grill` → `/spec`; planned positions are in [room-spec.md](room-spec.md) "Planned items".

1. **Desk and sofa** (Phase 2) — Asher's 4 × 2 ft desk with PC, monitor, keyboard and mouse on the east wall; gaming chair; sofa on the south wall, switchable between a compact 2–3 seater and an L-shaped corner sofa; dark rug. Fixed in place.
2. **Wall décor** (Phase 2) — pegboard above the desk, two or three picture frames above the sofa.
3. **Surround sound** (Phase 2) — speakers placed in the Twin. Requirement: the sound system must be controllable from ASHERA, down to switching the surround mode, so hardware is chosen with that in mind. Budget: LKR 50,000 for sound (owner, 2026-11-23).
4. **Moving furniture and Layouts** (Phase 2) — select, move, rotate, snap, warnings, distances, saved Layouts.
5. **Lighting preview** (Phase 3) — lamps, LED strips, the green glow under the TV stand.
6. **Smart devices and control** (Phase 4) — choose the hardware (lights, sound, plugs, maybe the AC) and control the Room from ASHERA's 3D world. Needs its own full discussion first; a do-it-yourself build (ESP32 boards, a Raspberry Pi hub) is on the table against buying ready-made devices.
7. **Shopping and labour list** (Phase 4) — built in the app from everything placed: what to buy and what work needs doing.

## Principles

- Accurate before decorative.
- Data-driven: room, Items and Devices are data; the scene renders data.
- Separate layers: room model, Layout, Device state.
- Simple until needed: no backend, accounts or device abstraction before a phase needs it ([ADR 0003](adr/0003-no-backend-until-needed.md)).

## Brand

Dark, minimal, premium, gaming — a refined control room, not a cluttered sci-fi prop. Dark base, one restrained accent colour. "ASHERA" is a coined name, not a claim about the word's historical meaning.
