# Urban Furniture Accounting System

A double-entry accounting and order-management application for a furniture business.
It covers the full flow from contacts and products through purchase/sales orders,
vendor bills and customer invoices, payments, journals, analytic accounts, budgets,
and financial reporting — plus a customer portal for invoice payment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui, TanStack React Query, React Hook Form + Zod, Axios, Lucide, Sonner, jsPDF |
| Backend | Node.js, Express 4, TypeScript, Prisma 6, Zod 4, JWT (access + refresh), bcryptjs, Helmet, express-rate-limit, Multer, Nodemailer |
| Database | MySQL (local / MAMP) |

---

## Repository Layout

```
urban-furniture-accounting-system/
├── backend/           # Express API
│   ├── prisma/        # schema.prisma, migrations, seed.ts
│   └── src/
│       ├── routes/        # endpoint definitions, mounted in routes/index.ts
│       ├── controllers/   # thin: validate → call service → return envelope
│       ├── services/      # all business logic (no req/res)
│       ├── middlewares/   # auth, validate, error handling
│       ├── validators/    # Zod schemas
│       └── index.ts       # entry point
├── frontend/          # Next.js app
│   └── src/
│       ├── app/           # routing only — (auth), (dashboard), portal
│       ├── components/ui/ # shadcn primitives
│       ├── features/      # feature modules (components/hooks/services/validators)
│       └── lib/           # api client, shared helpers
└── .agents/skills/    # architecture & coding runbooks (read before contributing)
```

---

## Prerequisites

- Node.js 20+
- MySQL 8 (or MAMP) running locally
- npm

---

## Getting Started

### 1. Database

Create an empty MySQL database, e.g. `urban_furniture`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit values (see below)
npx prisma migrate dev      # apply schema
npm run db:seed             # seed reference/demo data
npm run dev                 # starts on http://localhost:5000
```

Backend `.env`:

```
DATABASE_URL="mysql://root:root@127.0.0.1:8889/urban_furniture"
PORT=5000
JWT_ACCESS_SECRET="replace-with-a-long-random-secret"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-secret"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                 # starts on http://localhost:3000
```

Frontend `.env.local`:

```
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

---

## Scripts

### Backend (`backend/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Express dev server (ts-node-dev, hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |
| `npm run db:seed` | Seed the database |
| `npx prisma migrate dev` | Create/apply a migration |
| `npx prisma studio` | Browse data |

### Frontend (`frontend/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build check |
| `npm run lint` | Run ESLint |

---

## API

Base URL: `/api/v1`

| Prefix | Resource |
|--------|----------|
| `/auth` | login, contact-login, logout, me, forgot/reset password, activate-account |
| `/accounts` | chart of accounts |
| `/contacts` | customers & vendors |
| `/products` | product catalogue |
| `/users` | app users (admin) |
| `/journals` | journals |
| `/journal-entries` | double-entry journal entries + items |
| `/analytic-accounts` | analytic (cost) accounts |
| `/budgets` | budgets |
| `/purchase-orders` | purchase orders + items |
| `/vendor-bills` | vendor bills |
| `/sales-orders` | sales orders + items |
| `/customer-invoices` | customer invoices |
| `/payments` | payments against bills/invoices |
| `/reports` | financial reports |
| `/uploads` | file uploads |

### Response envelope

Success:
```json
{ "success": true, "message": "...", "data": {}, "timestamp": "ISO" }
```
Error:
```json
{ "success": false, "message": "...", "code": "ERROR_CODE", "errors": {}, "timestamp": "ISO" }
```

Validation failures return HTTP 422 with field errors in `errors`.
Auth failures return 401/403.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All coding conventions live as skills in
`.agents/skills/` and in [CLAUDE.md](CLAUDE.md) — read the relevant skill before
starting a task.
