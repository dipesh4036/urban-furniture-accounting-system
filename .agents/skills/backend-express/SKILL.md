---
name: backend-express
description: >-
  Backend architecture and development standards for Express, TypeScript, and Prisma, including controllers, services, error handling, Zod validation, and security. Activate this skill when writing or modifying backend APIs, routes, controllers, services, or middleware.
---

# 05_BACKEND_EXPRESS.md

# BACKEND RULES (Express + TypeScript + Prisma)

## ROLE
You are a Senior Backend Engineer.
The backend is an independent HTTP API. It knows nothing about Next.js,
React, or how the UI renders. It only speaks JSON.

---

# REQUEST LIFECYCLE (NEVER DEVIATE)
route → middleware(auth) → middleware(validate) → controller → service → repository/prisma → DB

Responsibilities, strictly:

- **route**: path + HTTP verb + middleware wiring. No logic. No try/catch.
- **middleware**: auth, validation, rate limit, error handling. Nothing domain-specific.
- **controller**: read `req`, call ONE service method, send response. Max ~15 lines.
- **service**: all business logic, all rules, all orchestration. No `req`/`res` here ever.
- **prisma**: data access only.

If a controller contains an `if` about business rules, it belongs in the service.
If a service imports `express`, the design is wrong.

---

# FILE NAMING
```
auth.routes.ts
auth.controller.ts
auth.service.ts
auth.validator.ts
auth.types.ts
```
One feature = one set. Same prefix everywhere. No `index.ts` barrel spam.

---

# ENTRY POINT ORDER (src/index.ts)
```
helmet → cors → json parser → cookie parser → rate limiter
→ /health → /api/v1 routes → notFound handler → error handler
```
Error handler is ALWAYS registered last.

---

# ASYNC HANDLING
Never write raw `try/catch` in controllers.
Use one wrapper:

```ts
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

Every controller is wrapped. Errors flow to the central error middleware.

---

# ERRORS
Use a single `AppError` class: `statusCode`, `message`, `code`, `isOperational`.

Throw domain errors from services:
```ts
throw new AppError(409, "Email already registered", "EMAIL_TAKEN");
```

Error middleware rules:
- Map Prisma error codes (P2002 → 409, P2025 → 404).
- Map ZodError → 422 with a field-level `errors` object.
- Unknown error → 500 with a generic message.
- Stack traces only when `NODE_ENV !== "production"`, and only in logs.
- Never leak SQL, table names, or file paths to the client.

---

# RESPONSE FORMAT (MANDATORY, EVERY ENDPOINT)
Success:
```json
{ "success": true, "message": "...", "data": {}, "timestamp": "ISO" }
```
Failure:
```json
{ "success": false, "message": "...", "code": "EMAIL_TAKEN", "errors": {}, "timestamp": "ISO" }
```
Use helpers `sendSuccess()` / the error middleware. Never hand-build a response object in a controller.

---

# STATUS CODES
200 read/update · 201 create · 204 delete · 400 malformed · 401 not logged in
403 logged in but not allowed · 404 missing · 409 conflict · 422 validation failed · 429 rate limited

401 and 403 are not interchangeable.

---

# VALIDATION
Zod schema per endpoint in `validators/`. A generic middleware validates
`body`, `params`, `query` and replaces `req` values with the parsed output.
The service receives already-typed, already-clean data — it never re-checks shape.
Infer TS types from the schema (`z.infer`), never write the type twice.

---

# AUTH
- Passwords: bcrypt, cost 10+. Never log or return a hash.
- JWT: short-lived access token + refresh token. Secrets from env only.
- Tokens in httpOnly, secure, sameSite cookies when the browser is the client.
- `authenticate` middleware attaches `req.user`.
- `authorize(...roles)` is a separate middleware. Never check roles inside a service by reading a global.
- Ownership checks (can this user touch THIS record?) belong in the service, not the middleware.

---

# PRISMA
- One shared client instance (`config/db.ts`), singleton in dev to survive hot reload.
- `select` or `include` explicitly. Never return the whole row blindly — password hashes leak that way.
- Related writes go in `prisma.$transaction`.
- Loops containing queries are forbidden. Use `include`, `in`, or `createMany`.
- Migrations are committed. Never edit an applied migration.
- Index every foreign key and every column used in `where`/`orderBy`.

---

# PAGINATION
Any list endpoint that can grow is paginated by default.
Query: `?page=1&limit=20&sort=createdAt&order=desc&search=`
Cap `limit` at 100. Return `meta: { page, limit, total, totalPages }`.

---

# CONFIG
Parse `process.env` once through a Zod schema in `config/env.ts` and crash on boot if
anything is missing. `process.env` is never read anywhere else in the codebase.

---

# LOGGING
Structured logger (pino/winston). Request id on every log line.
Log: method, path, status, duration, userId.
Never log: passwords, hashes, tokens, cookies, OTPs, full request bodies of auth routes.

---

# SECURITY BASELINE
helmet · cors with an explicit origin from env (never `*` with credentials) ·
rate limit on `/auth/*` · body size limit · no `eval` · no string-concatenated SQL ·
no user input in file paths.

---

# BEFORE FINISHING A BACKEND TASK
✅ Route thin, controller thin, logic in service
✅ Zod schema exists and is wired
✅ Response uses the standard envelope
✅ Correct status code
✅ Errors throw AppError, not raw strings
✅ No secret or hash in the response
✅ No query inside a loop
✅ Auth + ownership checked
✅ Added to the API table in PROJECT_CONTEXT
