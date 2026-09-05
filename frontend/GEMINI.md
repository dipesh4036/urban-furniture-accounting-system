# Frontend Guidelines & Rules (Next.js App Router + TypeScript + Tailwind CSS)

Instructions for Claude Code and Antigravity when working inside the `frontend/` directory.

---

## Active Skills for Frontend

Runbooks and detailed guidelines for frontend work are available in [`skills/`](file:///frontend/skills/):

| Skill | Path | Scope |
|-------|------|-------|
| **`frontend-nextjs`** | [`skills/frontend-nextjs/SKILL.md`](file:///frontend/skills/frontend-nextjs/SKILL.md) | App Router, Server/Client components, RHF + Zod forms, data fetching |
| **`ui-ux-design`** | [`skills/ui-ux-design/SKILL.md`](file:///frontend/skills/ui-ux-design/SKILL.md) | 8px grid, typography hierarchy, calm color system, SaaS polish |
| **`project-context`** | [`skills/project-context/SKILL.md`](file:///frontend/skills/project-context/SKILL.md) | Entities, glossary, user roles, and planned page routes |
| **`feature-workflow`** | [`skills/feature-workflow/SKILL.md`](file:///frontend/skills/feature-workflow/SKILL.md) | UI implementation order, handling all 4 states, Definition of Done |
| **`tech-architecture`** | [`skills/tech-architecture/SKILL.md`](file:///frontend/skills/tech-architecture/SKILL.md) | Frontend folder structure & conventions |
| **`master-system`** | [`skills/master-system/SKILL.md`](file:///frontend/skills/master-system/SKILL.md) | Code quality bar, accessibility, and production standards |

---

## Frontend Layer Architecture

```
app/(route)/page.tsx      → Page composition only, no business logic or raw fetch
features/x/components/    → Feature UI components
features/x/hooks/         → Feature data fetching + state hooks
features/x/services/      → Feature typed API calls
lib/api.ts                → Single axios/fetch instance with credentials
components/ui/            → Reusable, dumb components (never import from features/)
```

- **Server vs Client**: Server Component by default. Add `"use client"` only for state, effects, event handlers, or animations. Push `"use client"` to the leaf component.
- **Data Fetching States**: Handle all 4 branches explicitly: `loading`, `error`, `empty`, and `success`.
- **Forms**: React Hook Form + Zod resolver. Show field-level errors inline below inputs. Disable submit while pending.
- **State Priority**: Local `useState` → URL search params (for filters, search, tabs) → Server data → Context. Never copy server data into global state.

---

## UI/UX Design Standards

1. **Clean & Calm**: No flashy animations or visual noise. Look like enterprise SaaS (Linear, Stripe Dashboard).
2. **Color Palette**: Primary color, subtle neutral grays, semantic colors (Green = Success, Orange = Warning, Red = Error). No random colors.
3. **8px Spacing Grid**: Use standard multiples: `8px`, `16px`, `24px`, `32px`, `48px`, `64px`.
4. **Typography**: Clear hierarchy (Page Title -> Section Title -> Body -> Small Helper).
5. **Accessibility**: Visible focus rings, `<label htmlFor>`, semantic elements (`<button>`, `<main>`, `<nav>`), mobile responsive (360px, 768px, 1280px).

---

## Frontend Commands

```bash
npm run dev               # Start Next.js dev server
npm run build             # Run production build check
npm run lint              # Check ESLint rules
```
