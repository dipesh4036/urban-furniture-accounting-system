# CLAUDE.md — Urban Furniture Accounting System

Instructions for Claude Code when working in this repository.

---

## Workspace Structure & Skills

All architectural and coding runbooks are structured as formal skills in `.agents/skills/`. **Before starting any task, read the relevant skill file:**

| Task Area | Skill to Read | Scope |
|-----------|---------------|-------|
| Architecture / Mindset | `.agents/skills/master-system/SKILL.md` | Core principles, quality bar, production standards |
| UI & Styling | `.agents/skills/ui-ux-design/SKILL.md` | 8px grid, typography, colors, SaaS polish, Tailwind |
| Stack & Structure | `.agents/skills/tech-architecture/SKILL.md` | Project structure, Next.js + Express + Prisma + MySQL |
| Business Domain | `.agents/skills/project-context/SKILL.md` | Entities, glossary, endpoints, pages (single source of truth) |
| Backend API | `.agents/skills/backend-express/SKILL.md` | Route → Controller → Service lifecycle, Zod, error envelope |
| Frontend UI | `.agents/skills/frontend-nextjs/SKILL.md` | App Router, Server/Client components, RHF + Zod forms |
| Database & Schema | `.agents/skills/database-prisma/SKILL.md` | MySQL schema, relations, indexes, migrations, queries |
| Feature Execution | `.agents/skills/feature-workflow/SKILL.md` | Step-by-step workflow: Contract → Build Order → DoD |

---

## Precedence Hierarchy

1. **`project-context`** overrides everything (project-specific source of truth).
2. **`backend-express`**, **`frontend-nextjs`**, and **`database-prisma`** (layer-specific rules).
3. **`tech-architecture`** (stack and system conventions).
4. **`master-system`** and **`ui-ux-design`** (quality standards and visual rules).

*If two rules conflict, the more specific one wins — explicitly state which rule was followed.*

---

## Stack & Architecture Conventions

- **Frontend**: Next.js (App Router), TypeScript (Strict), Tailwind CSS, shadcn/ui, TanStack React Query (@tanstack/react-query), Lucide Icons, Sonner.
- **Backend**: Node.js, Express, TypeScript, Zod, Prisma ORM.
- **Database**: MySQL (MAMP / local MySQL).
- **Backend Lifecycle**: `route → middleware(auth) → middleware(validate) → controller → service → repository/prisma → DB`.
  - Controllers: Max ~15 lines, call one service method. No business logic.
  - Services: All business logic, no Express `req`/`res`.
- **API Response Envelope**:
  - Success: `{ success: true, message: "...", data: {}, timestamp: "ISO" }`
  - Error: `{ success: false, message: "...", code: "ERROR_CODE", errors: {}, timestamp: "ISO" }`
- **Data Fetching**: TanStack React Query (`useQuery`, `useMutation` with query invalidation). Handle 4 states: loading, error, empty, success.
- **Forms**: React Hook Form + Zod resolver. Show field errors inline. Disable submit while pending.
- **Components**: shadcn/ui primitives in `components/ui/`, feature components composed in `features/`. Leaf `"use client"` only.

---

## Development Commands

```bash
# Backend (from backend/ directory)
npm run dev           # Start Express dev server
npx prisma migrate dev # Run Prisma migrations
npx prisma db seed    # Run database seed
npx prisma studio     # Launch Prisma Studio

# Frontend (from frontend/ directory)
npm run dev           # Start Next.js dev server
npm run build         # Production build check
npm run lint          # Run ESLint
npx shadcn@latest add <component> # Add shadcn/ui component
```

---

## Build Order & Definition of Done

Always follow bottom-up build order:
1. Prisma schema + migration
2. Zod validator (shared shape)
3. Service (business logic, no Express req/res)
4. Controller + route
5. Manual API verification
6. Frontend service function
7. Hook / server fetch
8. UI component (loading, error, empty, success states)

**Definition of Done Checklist**:
- [ ] Happy path functional
- [ ] Input validation: 422 with inline field errors
- [ ] Auth & authorization: 401/403 handled gracefully
- [ ] Empty state with actionable next step
- [ ] Loading state with disabled submit buttons
- [ ] Friendly error messages (no raw stack traces)
- [ ] Responsive layout at 360px, 768px, 1280px
- [ ] No `any`, no hardcoded secrets, no unindexed foreign keys
