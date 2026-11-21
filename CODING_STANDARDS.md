# Coding standards

The baseline for code review. Reviewers cite the rule number. Lint enforces what it can; the rest is judgment.

## TypeScript

1. Strict mode stays on. No `any`, no `as` casts (lint-enforced) — narrow with type guards instead.
2. Prefer `readonly` data and pure functions. Model the domain in types (`Room`, `Opening`, …) using GLOSSARY.md names.
3. No dead code, commented-out code, or speculative options/parameters.
4. Units are feet everywhere (ADR 0001). Name values so units are obvious when it is not a length (e.g. `angleRad`).

## Modules and architecture

5. Code in one `src/` module imports another only through its `index.ts` (lint-enforced). See docs/architecture.md.
6. Pure logic (geometry, placement, snapping, serialization) lives outside React components and has unit tests.
7. Components render; they do not compute domain rules inline.
8. Measurements come only from `src/room/room.config.ts`. No magic numbers for room dimensions.

## React / React Three Fiber

9. Follow docs/r3f.md: no React state updates inside `useFrame`; mutate refs instead; dispose what you create manually; reuse geometries/materials; instance repeated meshes.
10. Hooks follow the rules of hooks (lint-enforced). Keep effects minimal and dependency-correct.

## Tests

11. Test behaviour through public interfaces; a pure rename must not break a test.
12. Every bug fix starts with a failing test that reproduces it.
13. Don't unit-test rendered pixels — use e2e assertions on `window.__ASHERA__` and visual snapshots.

## Change hygiene

14. One logical change per commit; conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
15. Docs updated in the same PR as the behaviour they describe; `docs/log.md` entry added.
16. Don't fix unrelated things in a feature PR — list them under "Noticed, not fixed".
