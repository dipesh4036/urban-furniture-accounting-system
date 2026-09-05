---
name: project-context
description: >-
  Project specification, domain glossary, entity relationships, API surface, and page definitions for the Urban Furniture Accounting System. Activate this skill when referencing business logic, domain terms, entities, or planning endpoints and pages.
---

# 04_PROJECT_CONTEXT.md

# PROJECT CONTEXT (FILL THIS BEFORE CODING)
This file is the single source of truth for WHAT we are building.
Every other rule file explains HOW. This one explains WHAT.
Update this file whenever scope changes.

---

# PROBLEM STATEMENT
<one paragraph, plain language>

# WHO USES IT
| Role | What they can do |
|------|------------------|
| Admin | |
| User | |
| Guest | |

# CORE MODULES (MVP ONLY)
1.
2.
3.

# OUT OF SCOPE
List things we are deliberately NOT building.
If a request falls here, ask before implementing.

---

# DOMAIN GLOSSARY
Define every business term once and use that exact word in
code, DB columns, API fields, and UI labels.

| Term | Meaning | Used as |
|------|---------|---------|
| | | model / field / route |

Never introduce a synonym for an existing term.

---

# ENTITY LIST
Entities and their relationships in one line each.
Example: `Order belongs to User, has many OrderItem`

---

# API SURFACE
List every planned endpoint before writing it.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/v1/auth/login | public | |

If an endpoint is not in this table, add it here first.

---

# PAGE LIST
| Route | Access | Purpose |
|-------|--------|---------|
| /login | public | |

---

# ASSUMPTIONS
Anything unclear that was assumed instead of asked.
Review this list before demo.
