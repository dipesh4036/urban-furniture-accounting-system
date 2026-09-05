---
name: feature-workflow
description: >-
  Step-by-step feature execution procedure, contract-first development, build order, edge-case checklists, and definition of done. Activate this skill whenever planning or implementing any new feature or task from scratch.
---

# 08_FEATURE_WORKFLOW.md

# FEATURE WORKFLOW (HOW EVERY TASK IS EXECUTED)

This file turns the principles in 01_MASTER_SYSTEM into a repeatable procedure.
Follow it in order for every feature. No skipping.

---

# STEP 0 — ORIENT (do this before proposing anything)
State out loud, in 3–5 lines:
1. What the user is asking for.
2. Which existing modules it touches.
3. What already exists that can be reused.
4. Anything genuinely ambiguous.

If something is ambiguous and guessing wrong would cost real rework, ask.
Otherwise state the assumption and continue — do not stall on trivia.

---

# STEP 1 — CONTRACT FIRST
Before code, write down:
- Prisma model changes
- Endpoint(s): method, path, request shape, response shape, error cases
- Page(s) and the states they need

This is the contract. Get it agreed, then build. Changing the contract
mid-implementation is what creates inconsistent codebases.

---

# STEP 2 — BUILD ORDER
Always bottom-up, so nothing is built against an imaginary API:

1. Prisma schema + migration
2. Zod validator (shared shape)
3. Service (business logic, unit-testable, no express)
4. Controller + route
5. Manual API check (curl / REST client)
6. Frontend service function
7. Hook / server fetch
8. UI component
9. Wire states: loading, error, empty, success

Never write the UI against an endpoint that does not exist yet.

---

# STEP 3 — DEFINITION OF DONE
A feature is not done when it renders. It is done when:
- Happy path works
- Invalid input returns 422 with field errors, shown inline
- Unauthorized access returns 401/403 and the UI handles it
- Empty list shows a real empty state with a next action
- Slow network shows a loading state, buttons disabled
- Server error shows a friendly message, no stack trace
- Refresh/back/deep-link still work
- Mobile layout is not broken

---

# EDGE CASES TO CHECK EVERY TIME
Empty string · very long string · unicode/emoji · negative and zero numbers ·
duplicate submit (double click) · record deleted by someone else ·
expired token mid-session · pagination past the last page ·
concurrent edit · filter combination returning zero rows.

---

# WHEN MODIFYING EXISTING CODE
- Read the surrounding file first and match its style exactly.
- Change the minimum. Do not reformat, rename, or "improve" unrelated lines.
- If you spot a real problem outside scope, mention it — do not silently fix it.
- Never delete code you do not understand.

---

# WHEN SOMETHING IS ALREADY BROKEN
Diagnose before patching:
1. What is the actual observed behaviour?
2. What is the expected behaviour?
3. Which layer is it in — DB, service, controller, network, UI?
4. Smallest change that fixes the root cause.

Do not add a `try/catch` to hide a bug. Do not add a `setTimeout` to fix a race.

---

# GIT
Branch: `feat/<module>-<short>`, `fix/<module>-<short>`
Commit: `feat(auth): add refresh token rotation` — imperative, scoped, one concern.
Never commit: `.env`, `node_modules`, build output, commented-out code, `console.log`.

---

# COMMUNICATION STYLE WHEN RESPONDING
- Lead with the plan, then the code.
- Explain non-obvious decisions in one line, not three paragraphs.
- If you deviate from these rules, say why explicitly.
- If asked for something that will hurt the architecture, say so once, propose the
  better option, and if the user still wants it, do it their way.
