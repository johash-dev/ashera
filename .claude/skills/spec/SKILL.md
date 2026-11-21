---
name: spec
description: Turn an agreed feature (usually after /grill) into docs/specs/<feature>.md with measurable done-criteria and vertical slices. Use when the owner says "write the spec", "plan this feature", or before implementing anything bigger than a small fix.
---

# Spec

1. Read `docs/specs/_template.md`, `GLOSSARY.md`, `docs/architecture.md`, and the modules the feature touches. Don't re-interview — use the conversation and docs. If something essential is unknown, ask (max 3 questions) or list it under Open questions.
2. Create `docs/specs/<kebab-feature>.md` from the template. Fill every section:
   - **Done when** = checks someone else could run and get the same answer (test names, `window.__ASHERA__` fields, Views to screenshot, numbers). No "works well".
   - **Testing seams**: name the pure functions to unit-test and the e2e/visual checks.
   - **Slices**: vertical, each a separate PR, each leaving `verify` green. Slice 1 = tracer bullet — the thinnest path through every layer it needs (data → logic → scene/ui → test).
   - Flag one-way doors → need an ADR before implementation.
3. Add the spec to `docs/index.md` under Specs. Set `status: draft`.
4. Show the owner a 5-line summary and the slice list; ask for approval. On approval set `status: approved`.

Keep it short — a spec is a contract, not an essay. Use GLOSSARY terms. No code.
