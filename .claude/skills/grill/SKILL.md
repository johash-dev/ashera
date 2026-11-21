---
name: grill
description: Interview the owner about a feature or change until there is shared understanding, before any spec or code. Use when a new feature, a vague idea, or a design question comes up ("I want…", "what if…", "let's add…").
---

# Grill

Goal: remove ambiguity before it becomes code. You are interviewing the owner, not designing alone.

1. Read `docs/index.md`, `docs/concept.md`, `GLOSSARY.md`, and the code the feature touches. **Never ask what the code or docs already answer.**
2. Walk the design tree one branch at a time: purpose → user-visible behaviour → edge cases → data → interaction with existing modules → what is out of scope. Ask 1–3 focused questions per message, each with your recommended answer.
3. Push on: which Room features it touches, units/coordinates, what Asher actually does with it, how we'll verify it, and whether anything is a one-way door (saved Layout schema, coordinates, new dependency, device control).
4. As answers settle, **write them down immediately** (don't wait for the end):
   - New or sharpened terms → `GLOSSARY.md` (one line each, vocabulary only).
   - A decision that is hard to reverse, surprising without context, and a real trade-off → new ADR in `docs/adr/` (next number, same format as existing ones) + link in `docs/index.md`.
5. Stop when you could write the spec without guessing. Finish with: a short summary of decisions, files you wrote, and remaining open questions. Suggest `/spec` next.

Don't write code. Don't write the spec here. Don't invent requirements the owner didn't confirm.
