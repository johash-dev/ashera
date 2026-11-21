---
name: grill
description: Interview the owner about a feature or change until there is shared understanding, before any spec or code. Use when a new feature, a vague idea, or a design question comes up ("I want…", "what if…", "let's add…").
---

# Grill

Goal: remove ambiguity before it becomes code. You are interviewing the owner, not designing alone.

The owner is a designer, not an engineer: talk about what Asher sees and does, never about code, modules or data structures. Engineering choices are yours; make them and write them down.

1. Read `docs/index.md`, `docs/concept.md`, `GLOSSARY.md`, `docs/room-spec.md`, the photos in `docs/reference/`, and the code the feature touches. **Never ask what the code, docs or photos already answer.**
2. **Restate before asking.** Describe in plain words what you understood from the photos and docs about the parts of the room this touches (e.g. "the TV wall is north, the window is on your left as you walk in"), and ask the owner to confirm or correct it once.
3. Walk the design tree one branch at a time: purpose → what Asher sees and does → edge cases → what is out of scope. Ask 1–3 questions per message (AskUserQuestion when the options are clear). Each question:
   - is in plain language; any room or trade term is explained inline ("skirting — the strip along the bottom of the wall");
   - comes with your recommended answer, so "agree" is a complete reply;
   - asks for a real-world fact only the owner can get (a measurement, a photo) as such, and says how to measure it.

   Aim to finish in one round per feature.

4. Settle yourself, without asking: units, coordinates, modules, how it will be tested. Ask the owner only when something is a one-way door (saved Layout schema, coordinates, new dependency, device control); explain the trade-off in plain words with your recommendation.
5. As answers settle, **write them down immediately** (don't wait for the end):
   - New measurements → `docs/room-spec.md` "Measured values" table and `room.config.ts`.
   - New or sharpened terms → `GLOSSARY.md` (one line each, vocabulary only).
   - A decision that is hard to reverse, surprising without context, and a real trade-off → new ADR in `docs/adr/` (next number, same format as existing ones) + link in `docs/index.md`.
6. Stop when you could write the spec without guessing. Finish with a short plain-language summary of what was decided and any open questions, then go straight on to `/spec`.

Don't write code. Don't write the spec here. Don't invent requirements the owner didn't confirm.
