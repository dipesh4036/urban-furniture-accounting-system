---
name: database-prisma
description: >-
  Database design, MySQL schema modeling, Prisma relations, indexes, migrations, and query optimization rules. Activate this skill when creating or modifying Prisma models, running migrations, writing database queries, or seeding data.
---

# 07_DATABASE_PRISMA.md

# DATABASE RULES (MySQL + Prisma)

## PRINCIPLE
Schema mistakes are the most expensive mistakes in the project.
Design the schema before writing a single endpoint.

---

# NAMING
- Model: `PascalCase`, singular → `User`, `OrderItem`
- Field: `camelCase` → `createdAt`, `isActive`
- Foreign key: `<relation>Id` → `userId`
- Table/column mapping: `@@map("users")`, `@map("created_at")` — DB stays snake_case
- Boolean fields read as a question: `isActive`, `hasVerifiedEmail`
- Enum values: `UPPER_SNAKE`

---

# EVERY MODEL MUST HAVE
```prisma
id        String   @id @default(cuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```
Add `deletedAt DateTime?` only where soft delete is genuinely needed, and then
every query must filter it. Do not add it "just in case".

---

# RELATIONS
Define both sides. Always set `onDelete` explicitly:
- child cannot exist alone → `Cascade`
- child should survive → `SetNull` (field must be nullable)
- deletion should be blocked → `Restrict`

Many-to-many with extra data (quantity, role, joinedAt) → explicit join model,
never implicit `@relation` many-to-many.

---

# INDEXES
Index every field used in `where`, `orderBy`, or `join`:
- every foreign key
- every `status` / `type` enum you filter on
- composite index for common pairs: `@@index([userId, createdAt])`
- `@unique` for email, slug, code
- compound uniqueness: `@@unique([userId, productId])`

---

# TYPES
- Money → `Decimal @db.Decimal(10, 2)`. Never `Float`.
- Long text → `@db.Text`
- Fixed sets → `enum`, not `String`
- Nullable only when "absent" is a real, meaningful state. Prefer a default over null.

---

# MIGRATIONS
- `prisma migrate dev --name verb_subject` (e.g. `add_order_status`)
- Every migration is committed to git.
- Never edit an already-applied migration; write a new one.
- Never use `db push` on anything with real data.
- Destructive changes get a separate migration with a comment.

---

# SEEDING
`prisma/seed.ts` must be idempotent (`upsert`, not `create`) and must produce
enough data to demo every screen: at least one admin, several users,
and lists long enough to show pagination and filters.

---

# QUERY RULES
- No query inside a loop. Use `include`, `where: { id: { in: [...] } }`, or `createMany`.
- Always `select` the fields you need on user-facing reads; never return `password`.
- Multi-table writes go in `$transaction`.
- Count and rows for pagination fetched in one `$transaction([...])`.
- Aggregations use `groupBy` / `aggregate`, not JS reduction over all rows.
- Raw SQL only as a last resort, and only parameterized (`$queryRaw` tagged template).

---

# DATA INTEGRITY
Validation in Zod is not a substitute for DB constraints.
Uniqueness, not-null, and foreign keys must exist at the database level too.
Catch `P2002` and translate it to a 409 with a human message.

---

# BEFORE FINISHING A SCHEMA CHANGE
✅ Naming matches the glossary in PROJECT_CONTEXT
✅ Timestamps present
✅ Relations both-sided with explicit onDelete
✅ Indexes on all FKs and filtered columns
✅ Correct types (Decimal for money, enum for fixed sets)
✅ Migration created, named, committed
✅ Seed still runs
✅ No sensitive field returned by default
