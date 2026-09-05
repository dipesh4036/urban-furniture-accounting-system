# Master System & Agent Guidelines — Urban Furniture Accounting System

This repository follows a disciplined software engineering standard for building a production-ready, full-stack application (Next.js App Router, Express, MySQL, Prisma, TypeScript, and Tailwind CSS).

---

## Skills Index & Read Order

All domain-specific runbooks and guidelines are structured as formal skills located in `.agents/skills/` (and mirrored in `skills/`):

| Skill Name | Path | Scope | When It Applies |
|------------|------|-------|-----------------|
| **`master-system`** | [SKILL.md](file:///.agents/skills/master-system/SKILL.md) | Mindset, principles, quality bar, production standards | Always active / architectural decisions |
| **`ui-ux-design`** | [SKILL.md](file:///.agents/skills/ui-ux-design/SKILL.md) | Visual + interaction design system, 8px grid, typography, SaaS polish | Any UI / frontend design work |
| **`tech-architecture`** | [SKILL.md](file:///.agents/skills/tech-architecture/SKILL.md) | Stack conventions, folder structure, system design | Always active / structure changes |
| **`project-context`** | [SKILL.md](file:///.agents/skills/project-context/SKILL.md) | Urban Furniture Accounting specifications, glossary, entities, API & page surfaces | Always — single source of truth for WHAT to build |
| **`backend-express`** | [SKILL.md](file:///.agents/skills/backend-express/SKILL.md) | Express, controllers, services, auth, error envelope, Zod validation | Any backend work |
| **`frontend-nextjs`** | [SKILL.md](file:///.agents/skills/frontend-nextjs/SKILL.md) | App Router, data fetching, forms (RHF + Zod), Tailwind, accessibility | Any frontend work |
| **`database-prisma`** | [SKILL.md](file:///.agents/skills/database-prisma/SKILL.md) | MySQL schema, relations, indexes, migrations, seeding, query rules | Any database / query work |
| **`feature-workflow`** | [SKILL.md](file:///.agents/skills/feature-workflow/SKILL.md) | Contract-first development, build order, edge cases, definition of done | Every task execution |

---

## Precedence Hierarchy

1. **`project-context`** overrides everything (it is project-specific).
2. **`backend-express`**, **`frontend-nextjs`**, and **`database-prisma`** (layer-specific rules).
3. **`tech-architecture`** (stack and system conventions).
4. **`master-system`** and **`ui-ux-design`** (general quality bar and visual rules).

*If two rules conflict, the more specific one wins — explicitly state which rule was followed.*

---

## Core Execution Process (from `feature-workflow`)

1. **Step 0 — Orient**: State what is requested, affected modules, reusable code, and clarify ambiguities.
2. **Step 1 — Contract First**: Define Prisma models, API request/response envelope, and UI states before writing code.
3. **Step 2 — Build Order**:
   - Prisma schema + migration
   - Zod validator (shared shapes)
   - Service (business logic, no Express req/res)
   - Controller + route
   - Manual API check (curl / test client)
   - Frontend service function
   - Hook / server fetch
   - UI component (handling loading, error, empty, success)
4. **Step 3 — Definition of Done**: Validate happy path, 422 inline errors, 401/403 handling, empty states, loading feedback, responsive views, and edge cases.
