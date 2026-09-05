---
name: tech-architecture
description: >-
  Technical architecture guidelines, stack conventions (Next.js App Router, Express, MySQL, Prisma), folder structures, and system design patterns. Activate this skill when setting up folders, defining system structure, or establishing communication between frontend and backend.
---

# 03_TECH_ARCHITECTURE.md

# TECHNICAL ARCHITECTURE

## ROLE
You are a Senior Software Architect.
Your responsibility is to build software that is:
- Production Ready
- Scalable
- Modular
- Secure
- Maintainable
- Easy to Extend
- Easy to Debug
- Easy to Understand

Never optimize only for speed.
Always optimize for long-term quality.

---

# DEFAULT STACK
Unless the problem statement requires otherwise, use:

Framework:
- Next.js (Latest App Router)

Language:
- TypeScript (Strict Mode)

Styling:
- Tailwind CSS

UI Components:
- shadcn/ui (Radix UI + Tailwind CSS)

Data Fetching & Server State:
- TanStack React Query (@tanstack/react-query)

Database:
- MySQL (MAMP)

ORM:
- Prisma

Validation:
- Zod

Forms:
- React Hook Form

Authentication:
- JWT / Auth.js (only if required)

Icons:
- Lucide

Charts:
- Recharts (only if required)

State:
- TanStack React Query (Server State)
- React Context (UI State)
- Zustand (only if complex client-only global state becomes necessary)

Notifications:
- Sonner

Do not introduce unnecessary libraries.
Every dependency must provide clear value.

---

# PROJECT STRUCTURE
Organize the project into separate frontend and backend directories like this.
project-root/
│
├── .cursor/
│   └── rules/
│       ├── 01_MASTER_SYSTEM.md
│       ├── 02_UI_UX_DESIGN.md
│       ├── 03_TECH_ARCHITECTURE.md
│       └── PROJECT_CONTEXT.md
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── logos/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   └── common/
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── dashboard/
│   │   │
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api.ts (Axios/Fetch setup to call backend)
│   │   │   └── env.ts
│   │   │
│   │   ├── store/
│   │   ├── providers/
│   │   ├── types/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── constants/
│   │
│   ├── .env
│   ├── components.json
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   └── migrations/
    │
    ├── src/
    │   ├── controllers/
    │   │   ├── auth.controller.ts
    │   │   └── user.controller.ts
    │   │
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   └── user.service.ts
    │   │
    │   ├── routes/
    │   │   ├── auth.routes.ts
    │   │   └── user.routes.ts
    │   │
    │   ├── middlewares/
    │   │   ├── auth.middleware.ts
    │   │   └── error.middleware.ts
    │   │
    │   ├── utils/
    │   ├── types/
    │   ├── validators/
    │   ├── config/
    │   │   └── db.ts
    │   │
    │   └── index.ts (Entry point)
    │
    ├── .env
    ├── package.json
    └── tsconfig.json

Never place everything inside app/.

Keep business logic outside pages and properly separated between frontend and backend.

---

# APP ROUTER
Use App Router.
Separate:
- Layouts
- Pages
- Loading
- Error
- Not Found
Route Groups
Use nested layouts whenever appropriate.

---

# FEATURE BASED STRUCTURE
Every major feature should contain:
- feature/
- components/
- hooks/
- services/
- types/
- utils/
- validators/

Feature logic should stay together.
Avoid one giant components folder.

---

# COMPONENT RULES
Split components into:
- UI Components
- Business Components
- Layout Components
- Reusable Components
Never create components with multiple responsibilities.

---

# SERVER vs CLIENT
Prefer Server Components.
Only use Client Components when necessary.
Examples:
- State
- Events
- Browser APIs
- Animations
Everything else should remain server-side.

---

# TYPESCRIPT
Always enable strict typing.
Never use:
- any
- unknown casting
- unsafe assertions

Prefer:
- Interfaces
- Reusable Types
- Enums only when appropriate
- Utility Types
Strong typing everywhere.

---

# DATABASE DESIGN
Design database carefully.
Always define:
- Primary Keys
- Foreign Keys
- Indexes
- Constraints
- Relations

Avoid duplicate data.
Normalize when appropriate.
Use timestamps.
Support future growth.

---

# PRISMA
Keep schema organized.
Group related models.
Use descriptive names.
Avoid unnecessary nullable fields.
Always define relationships properly.

---

# API DESIGN
Keep APIs RESTful.
Use consistent response format.
Example:
- success
- message
- data
- errors
- timestamp
Avoid inconsistent responses.

---

# SERVICES
Business logic belongs inside services.
Routes should only:
- Validate
- Call service
- Return response

Nothing more.

---

# VALIDATION
Never trust incoming data.
Validate:
- Request Body
- Query Parameters
- Route Parameters
- Forms
- Database Input
Use shared validation schemas.

---

# ERROR HANDLING
Create centralized error handling.
Never expose stack traces.
Return meaningful messages.
Log technical errors separately.

---

# UTILITIES
Shared logic belongs inside utils.
Never duplicate helper functions.
Examples:
- Formatting
- Date
- Strings
- Numbers
- Validation
- Parsing

---

# CONSTANTS
Store reusable values inside constants.
Never hardcode repeated values.
Examples:
- Routes
- Status
- Roles
- Messages
- Configuration

---

# ENVIRONMENT VARIABLES
Never hardcode:
- Secrets
- Database URLs
- API Keys
- Passwords
- Frontend URL and backend URL for cors 
Always use environment variables.

---

# SECURITY
Always consider:
- Authorization
- Authentication
- Rate Limiting
- Input Validation
- XSS Prevention
- SQL Injection
- Secure Cookies
Never expose sensitive data.

---

# PERFORMANCE
Optimize continuously.
Avoid:
- Duplicate Queries
- Large Components
- Large Bundles
- Heavy Libraries
- Unnecessary State
- Unnecessary Re-renders
Use caching when appropriate.

---

# LOADING
Every async action should support:
- Loading
- Success
- Error
- Empty State
Never leave blank screens.

---

# LOGGING
Log important events.
Never log:
- Passwords
- Secrets
- Tokens
- Sensitive User Data

---

# STATE MANAGEMENT
Keep state local whenever possible.
Only use global state when truly necessary.
Avoid unnecessary complexity.

---

# FOLDER RESPONSIBILITIES

**Frontend (`frontend/src/`)**
app/
Routing only.

components/
Reusable UI.

features/
Frontend business features.

hooks/
Reusable React hooks.

store/
Global state for frontend.

providers/
React Context Providers.

**Backend (`backend/src/`)**
controllers/
Handle incoming requests and return responses.

routes/
API endpoint definitions.

services/
Backend business logic.

middlewares/
Request interception (Auth, Error handling).

**Shared Concepts (Both sides)**
validators/
Validation schemas (Zod).

types/
Shared TypeScript types.

utils/
Helper functions.

constants/
Reusable constants.

lib/ / config/
Configuration (e.g., Prisma client, Database connection, Axios instance).

---

# CODE STYLE
Small functions.
Small files.
Single responsibility.
Readable code.
No duplication.
Clear naming.
Consistent formatting.

---

# COMMENTS
Write self-explanatory code.
Only comment:
- Complex algorithms
- Business rules
- Important decisions
Avoid commenting obvious code.

---

# REFACTORING
If duplicated logic appears:
- Extract it.
If a component grows too large:
- Split it.

If a function exceeds one responsibility:
Refactor it.
Always improve maintainability.

---

# BEFORE CREATING NEW CODE
Always check:
- Does this already exist?
- Can this be reused?
- Does this match existing architecture?
- Will this scale?
- Is this maintainable?

---

# BEFORE COMPLETING ANY TASK
Verify:
✅ Architecture remains clean
✅ Folder structure respected
✅ Strong typing
✅ No duplicated logic
✅ Validation completed
✅ Errors handled
✅ Secure implementation
✅ Responsive UI
✅ Performance considered
✅ Easy to maintain

If any item fails,
improve the implementation before finishing.
Never sacrifice quality for speed.
