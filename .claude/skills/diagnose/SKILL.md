---
name: diagnose
description: Disciplined bug hunt — reproduce, hypothesise, instrument, fix with a regression test. Use when something is broken, a test fails unexpectedly, the scene looks wrong, or the owner reports a bug.
---

# Diagnose

The owner reports bugs in one plain sentence ("the door looks too short"). Turn it into the brief yourself — which files, which measurement or doc says what's right, which tests pin the current value — never ask the owner to write or paste one.

1. **Reproduce first — no theories before a red loop.** Build the fastest deterministic way to see the bug: a failing unit test, a Playwright test using `?view=` and `window.__ASHERA__`, or exact manual steps in the browser pane. Compare against `docs/room-spec.md` and the photos in `docs/reference/`. Only if you still can't see it, ask the owner one plain question (which View, what they expected).
2. **Minimise** the repro to the smallest input/scene that still fails.
3. **Hypothesise.** List 3–5 falsifiable causes, ranked by likelihood, each with the experiment that would rule it in or out. Show the list before testing.
4. **Instrument.** Tag every temporary log with a unique marker, e.g. `[DEBUG-a4f2]`, so cleanup is one search. Test hypotheses in order; update the ranking as evidence arrives.
5. **Fix.** Turn the repro into a permanent regression test (failing), apply the smallest fix, watch it pass. Fix the cause, not the symptom.
6. **Clean up.** Remove all `[DEBUG-…]` logs. `npm run verify` → `ALL GREEN`.
7. **Record.** `docs/log.md` entry (`bug` type): symptom, root cause, fix, test name. Work on a `fix/…` branch, then continue as in `/ship` from review onwards (review, CI, Approval card, merge on "looks good").
