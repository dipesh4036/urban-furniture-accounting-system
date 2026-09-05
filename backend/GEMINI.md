# Backend Guidelines & Rules (Express + TypeScript + Prisma + MySQL)

Instructions for Claude Code and Antigravity when working inside the `backend/` directory.

---

## Active Skills for Backend

Runbooks and detailed guidelines for backend work are available in [`skills/`](file:///backend/skills/):

| Skill | Path | Scope |
|-------|------|-------|
| **`backend-express`** | [`skills/backend-express/SKILL.md`](file:///backend/skills/backend-express/SKILL.md) | Controllers, services, auth, error handling, Zod validation |
| **`database-prisma`** | [`skills/database-prisma/SKILL.md`](file:///backend/skills/database-prisma/SKILL.md) | Prisma schema, MySQL relations, migrations, indexes, seeding |
| **`project-context`** | [`skills/project-context/SKILL.md`](file:///backend/skills/project-context/SKILL.md) | Entities, domain glossary, and planned API endpoints |
| **`feature-workflow`** | [`skills/feature-workflow/SKILL.md`](file:///backend/skills/feature-workflow/SKILL.md) | Contract-first development and build order |
| **`tech-architecture`** | [`skills/tech-architecture/SKILL.md`](file:///backend/skills/tech-architecture/SKILL.md) | Backend folder structure & configuration conventions |
| **`master-system`** | [`skills/master-system/SKILL.md`](file:///backend/skills/master-system/SKILL.md) | Code quality bar, security, and production standards |

---

## Request Lifecycle (Strictly Enforced)

```
route → middleware(auth) → middleware(validate) → controller → service → repository/prisma → DB
```

- **Routes (`src/routes/`)**: Path + HTTP verb + middleware wiring only. No try/catch, no business logic.
- **Middlewares (`src/middlewares/`)**: Auth, validation, error handler, rate limit.
- **Controllers (`src/controllers/`)**: Max ~15 lines. Read `req`, call ONE service method, send standard response envelope. Wrapped with `asyncHandler`.
- **Services (`src/services/`)**: ALL business rules and orchestration live here. **Never import `express` or access `req`/`res` in a service.**
- **Prisma**: Data access layer only.

---

## Mandatory API Response Format

### Success (Status: 200, 201, 204):
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {},
  "timestamp": "2026-09-05T10:30:00.000Z"
}
```

### Failure (Status: 400, 401, 403, 404, 409, 422, 500):
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": { "field": "Reason" },
  "timestamp": "2026-09-05T10:30:00.000Z"
}
```

---

## Database Rules (Prisma + MySQL)

1. **Every Model**: Must have `id String @id @default(cuid())`, `createdAt DateTime @default(now())`, and `updatedAt DateTime @updatedAt`.
2. **Money**: Always `Decimal @db.Decimal(10, 2)`. Never `Float`.
3. **Indexes**: Add `@@index` on every foreign key and column used in `where`/`orderBy`.
4. **Relations**: Define both sides with explicit `onDelete: Cascade | Restrict | SetNull`.
5. **No N+1 Queries**: Queries inside loops are strictly forbidden. Use `in`, `include`, or `createMany`.
6. **Transactions**: Multi-table writes must use `prisma.$transaction`.

---

## Backend Commands

```bash
npm run dev               # Start dev server
npx prisma migrate dev    # Apply migrations
npx prisma db seed        # Run seed script
npx prisma studio         # Open Prisma GUI
```
