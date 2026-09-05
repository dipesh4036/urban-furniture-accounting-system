---
name: frontend-nextjs
description: >-
  Frontend development guidelines for Next.js App Router, TypeScript, and Tailwind CSS, covering server/client components, data fetching, forms, and accessibility. Activate this skill when developing frontend pages, components, hooks, or forms.
---

# 06_FRONTEND_NEXTJS.md

# FRONTEND RULES (Next.js App Router + TypeScript + Tailwind)

## ROLE
You are a Senior Frontend Engineer.
The frontend renders and collects data. It does not own business rules.
The Express backend is the only source of truth.

---

# LAYER RULES
```
app/(route)/page.tsx      → composition only, no logic
features/x/components/    → feature UI
features/x/hooks/         → data fetching + state for that feature
features/x/services/      → API calls for that feature
lib/api.ts                → single axios/fetch instance
components/ui/            → dumb, reusable, no API knowledge
```

A component in `components/ui/` must never import from `features/`.
A page must never call `fetch` directly — it calls a service or hook.

---

# API LAYER
One configured client in `lib/api.ts`:
- `baseURL` from `NEXT_PUBLIC_API_URL`
- `withCredentials: true`
- response interceptor unwraps the `{ success, data }` envelope
- error interceptor converts the backend error into a normal `Error` with `message` and `code`
- 401 → clear session and redirect to login, once, not per-request

Every endpoint gets a typed function in a feature service. No inline URLs in components.

---

# SERVER VS CLIENT COMPONENTS
Default: Server Component.
Add `"use client"` only for state, effects, event handlers, browser APIs, or animation.
Push `"use client"` to the leaf, never to a layout or a whole page.
Never fetch the same data in both a server and a client component.

---

# DATA FETCHING
- Read-only page data → fetch in the Server Component.
- Interactive/refetching data → client hook.
- Every fetch state must be handled: `loading`, `error`, `empty`, `success`. Four branches, always.
- Use `loading.tsx` and `error.tsx` in route folders instead of ad-hoc spinners where possible.

---

# FORMS
React Hook Form + Zod resolver. Always.
- The Zod schema is shared with (or mirrors) the backend validator.
- Disable submit while pending; never allow double submit.
- Map backend `errors` object onto form fields with `setError`.
- Show inline field errors, not a single toast for validation.
- Toast is for outcomes (saved / deleted / failed), not for field errors.

---

# STATE
Priority order: local `useState` → URL search params → server data → Context → Zustand.
Filters, search, pagination, and tabs live in the URL, so the page is shareable and back works.
Never copy server data into global state.

---

# TYPES
`types/` holds shared shapes. API response types are derived from Zod schemas where possible.
`any` is banned. Non-null `!` is banned unless justified with a comment.
Props interfaces are named `XProps` and live next to the component.

---

# COMPONENTS
- Presentational components take props and render. No data fetching inside `components/ui/`.
- Max ~200 lines. Beyond that, split.
- No prop drilling deeper than 2 levels — restructure or use context.
- Every list needs a stable `key` — never the array index for reorderable data.

---

# TAILWIND
- Design tokens in `tailwind.config` (colors, spacing, radius). Never raw hex in JSX.
- Use `cn()` (clsx + tailwind-merge) for conditional classes.
- Extract a component when the same class string appears three times.
- No arbitrary values like `w-[437px]` unless truly unavoidable.
- Mobile-first: base styles, then `md:`, `lg:`.

---

# ROUTING
Route groups for `(auth)` and `(dashboard)` with their own layouts.
Protected routes are guarded in middleware, not by a `useEffect` redirect that flashes content.
Loading, error, and not-found files exist for every major segment.

---

# PERFORMANCE
`next/image` for all images with width/height. `next/font` for fonts.
Dynamic-import heavy widgets (charts, editors).
Memoize only after a measured problem, not preemptively.
Debounce search inputs (300ms). Abort stale requests.

---

# ACCESSIBILITY
Semantic elements (`button`, `nav`, `main`, `form`). `div` with `onClick` is banned.
Every input has a `<label htmlFor>`. Modals trap focus and close on Escape.
Visible focus ring everywhere. Icon-only buttons need `aria-label`.

---

# BEFORE FINISHING A FRONTEND TASK
✅ Server component unless client is needed
✅ Loading / error / empty / success all handled
✅ Form validated with Zod + RHF, submit disabled while pending
✅ Backend field errors surfaced inline
✅ No hardcoded URLs or colors
✅ Responsive at 360px, 768px, 1280px
✅ Keyboard reachable, labels present
✅ No `any`
