---
name: taste-and-motion
description: Comprehensive frontend design-taste and motion skill, synthesized from Emil Kowalski's design-engineering philosophy (emilkowal.ski/skill), the Taste Skill anti-slop frontend framework (tasteskill.dev), and Impeccable's design vocabulary and slop detector (impeccable.style). Use whenever writing, reviewing, critiquing, redesigning, or polishing ANY frontend UI, component, design system, or animation, including landing pages, marketing sites, portfolios, dashboards, product/app UI, forms, or CSS/JS/React motion code. Covers reading the brief and picking a register (marketing/brand vs product/dashboard), choosing a design system, typography, color, layout, interactive states and forms, the full animation and motion framework (easing, springs, transforms, clip-path, gesture physics, performance), dark mode, accessibility, image and content strategy, and a master list of "AI slop" tells (gradient text, cream/beige defaults, generic eyebrows, three-card grids, em-dashes, Jane Doe copy, fake screenshots, and more) with a pre-flight checklist to run before shipping. Consult this any time UI, styling, or animation code is being written, reviewed, or discussed, even if the person never says "design" or "taste."
version: 1.0.0
---

# Taste & Motion

A design-engineering skill for building and reviewing frontend interfaces that feel considered rather than generated. It merges three public design-taste skill files into one reference: [emil-design-eng](https://emilkowal.ski/skill) (Emil Kowalski's motion and craft philosophy), [Taste Skill](https://www.tasteskill.dev/) (Leon Lin and blueemi's anti-slop frontend framework), and [Impeccable](https://impeccable.style/) (Paul Bakaus's design vocabulary and slop detector). Full attribution is in **Sources** at the end.

## Craft Bar (Project Addendum)

Apply this skill the way a design engineer with a decade of shipped, scrutinized UI would: someone who has personally rebuilt the same dropdown five times because the fourth version's exit transition still felt one frame off. That means:

- **Check the micro before the macro.** Before approving any UI, look at it at the level of: does this specific corner radius match the one two components over, does this specific shadow have the right hue, does this specific transition curve actually feel like the element in question (not just "a transition"). The interfaces referenced throughout this skill (Linear, Raycast, Stripe) read as polished specifically because someone checked at this resolution, not because of one big visual idea.
- **Backgrounds are a craft surface, not a fill color.** A flat `bg-muted` on an entry screen (login, signup, empty states) is the reflexive default, not the finished state. Reach for a restrained ambient background treatment in the style of Aceternity/Manu Arora — a subtle dot-grid or line-grid radially masked so it fades toward the edges, a soft spotlight/glow tied to one accent color, or a barely-there noise/gradient layer — built in plain CSS (`radial-gradient`, `mask-image`, `background-image` grid patterns), not a screenshot or a heavy new dependency. Opacity stays low (the pattern should read as texture, not as a graphic); it must hold under both light and dark theme tokens, and must never reduce text contrast below the AA minimums in Section 7/9.
- **This still obeys the register gate in Section 2.** A product-register screen (a dashboard, a settings page) gets this treatment at most on its entry points (login, onboarding, empty states) — restrained, low `MOTION_INTENSITY`, one accent color, never on dense data screens themselves.

## Philosophy

- **Taste is trained, not innate.** It is a developed instinct for what elevates a piece of work, built by studying great software closely, asking why something feels right, and reverse-engineering the details until the "why" is explicit rather than a vibe.
- **Read the room before writing a line of code.** Most bad AI-generated UI happens because the model reaches for a default aesthetic instead of first working out what this specific brief, audience, and register actually call for (Section 1).
- **Unseen details compound.** Almost nobody consciously notices that a popover scales from its trigger, or that a tooltip skips its delay the second time around. That is the point: a thousand correct, invisible decisions add up to something that just feels right, the way a thousand barely audible voices singing in tune produce something that sounds like one clear voice.
- **A shared vocabulary beats a vague adjective.** Naming a pattern ("sticky-stack," "ease-out-expo," "bento grid") is faster and more precise than describing it from scratch every time, for a person and for an agent alike (Section 21).
- **Ship a checklist, not a feeling.** "It looks good to me" is not a finishing condition. Section 22's pre-flight checklist is.

---

## Contents

1. [Read the Brief](#1-read-the-brief-the-design-read)
2. [Register: Brand vs Product](#2-register-marketingbrand-vs-productdashboard)
3. [The Four Dials](#3-the-four-dials)
4. [Choosing a Design System](#4-choosing-a-design-system)
5. [Default Stack & Conventions](#5-default-stack--conventions)
6. [Typography](#6-typography)
7. [Color](#7-color)
8. [Layout & Composition](#8-layout--composition)
9. [Interactive States & Forms](#9-interactive-states--forms)
10. [Motion & Animation](#10-motion--animation)
11. [Component-Level Craft](#11-component-level-craft)
12. [CSS Transforms & clip-path](#12-css-transforms--clip-path)
13. [Gesture & Drag Physics](#13-gesture--drag-physics)
14. [Performance](#14-performance)
15. [Accessibility & Reduced Motion](#15-accessibility--reduced-motion)
16. [Dark Mode & Theme Lock](#16-dark-mode--theme-lock)
17. [Images & Visual Assets](#17-images--visual-assets-brand-register)
18. [Content, Copy & Data Density](#18-content-copy--data-density)
19. [The AI Tells Master List](#19-the-ai-tells-master-list)
20. [Redesign Protocol](#20-redesign-protocol)
21. [Reference Vocabulary](#21-reference-vocabulary)
22. [Review Format & Master Pre-Flight Checklist](#22-review-format--master-pre-flight-checklist)

Appendix A: [Install Commands](#appendix-a-design-system-install-commands) · Appendix B: [Canonical Docs](#appendix-b-canonical-docs-per-design-system) · Appendix C: [Easing Resources](#appendix-c-easing--motion-resources) · Appendix D: [Liquid Glass](#appendix-d-apple-liquid-glass-honestly)

---

## 1. Read the Brief (The Design Read)

Before touching code, work out what is actually being asked for. Most bad AI-generated UI happens because the model jumps to a default aesthetic instead of reading the room.

**Signals to read, in order:**

1. **Register.** Is this marketing/brand (a landing page, portfolio, campaign, editorial piece) or product (a dashboard, admin panel, tool, app shell)? See Section 2; this decision gates almost everything downstream.
2. **Page/surface kind**: landing (SaaS / consumer / agency / event), portfolio (dev / designer / studio), dashboard/app screen, redesign (preserve vs overhaul), editorial/blog.
3. **Vibe words** the person used, such as "minimalist," "calm," "Linear-style," "Awwwards," "brutalist," "premium consumer," "Apple-y," "playful," "serious B2B," "editorial," "dark tech," "glassy."
4. **Reference signals**: URLs linked, screenshots pasted, products named, competitors mentioned.
5. **Audience**: a procurement panel, a design-conscious consumer, a recruiter, an on-call engineer reading fast in the dark, a trader glancing at a screen between other tasks. The audience picks the aesthetic, not personal taste.
6. **Existing brand assets**: logo, color, type, photography. For redesigns these are starting material, not optional input (Section 20).
7. **Quiet constraints that override aesthetics**: accessibility-first audiences, public sector, regulated industries, trust-first commerce, children's products, a financial dashboard read under pressure.

**State the read in one line before generating anything:**

> "Reading this as: `<surface>` for `<audience>`, `<register>` register, leaning toward `<aesthetic/design-system family>`."

Examples:

- "Reading this as: B2B SaaS landing for technical buyers, brand register, Linear-style minimalist language, Tailwind + Geist + restrained motion."
- "Reading this as: a stock-screening dashboard for an active trader checking breakouts quickly, product register, dense but legible, native components over a heavy design system."
- "Reading this as: a solo developer portfolio for hiring managers, brand register, editorial/kinetic-type language, native CSS + scroll-driven animation."

**If the brief is ambiguous, ask exactly one question, never a list.** Example: "Should this feel closer to Linear-clean or Awwwards-experimental?" If a confident inference is possible from context, skip the question and just state the read.

**Anti-default discipline.** Do not reach for: AI-purple gradients, a centered hero over a dark mesh background, three equal feature cards, glassmorphism slapped on everything, infinite-loop micro-animations on every card, Inter + slate-900 by default. These are the reflexive defaults; Section 19 has the full list of tells to actively reach past.

---

## 2. Register: Marketing/Brand vs Product/Dashboard

Two of the three source skills split the world into "brand" and "product" registers, and the third explicitly puts dashboards **out of scope** for its landing-page rules. This skill reconciles that by covering both registers, with different sections applying to each.

- **Brand/marketing register**: design IS the product. Landing pages, campaigns, portfolios, editorial pieces, about pages. The person judges the page itself.
- **Product/dashboard register**: design SERVES the product. Dashboards, admin panels, SaaS app screens, internal tools, trading and data screens. The person is trying to get a task done, often repeatedly, often fast.

**Universal, applies to both registers:** typography (6), color contrast and consistency (7), layout mechanics, cards, and z-index discipline (8), interactive states and forms (9), all of motion and animation (10-14), accessibility and reduced motion (15), dark mode (16), content and copy hygiene (18), and the cross-register bans in the AI Tells list (19: em-dash, gradient text, side-stripe borders, glassmorphism-as-default, Jane Doe names, filler verbs, fake screenshots).

**Brand-register-only:** hero hard rules and hero stack discipline, eyebrow restraint, bento/zigzag/section-repetition caps, quotes and testimonials, "trusted by" logo walls, the reference vocabulary of hero and scroll paradigms (21), the premium-consumer palette ban. None of this applies to a settings screen or a data table.

**Product/dashboard-register-only:** reach for a real design system suited to dense UI first (Fluent, Carbon, Atlassian, Polaris; see Section 4) rather than inventing one; treat long lists and spec-style data with the alternatives in Section 18 instead of a `<ul>` with dividers; keep motion utilitarian, feedback- and state-driven rather than decorative, since the audience sees these screens dozens of times a day (see "Should this animate at all?" in Section 10); density can run much higher (`VISUAL_DENSITY` 6-9 is normal here, where it would be a mistake on a landing page).

A stock-screening dashboard, an admin panel, or a settings page is not out of scope. It just reads a different subset of this same skill.

---

## 3. The Four Dials

After the design read, set four dials. Everything downstream is gated by these. State them explicitly; do not silently default.

- **`DESIGN_VARIANCE`** (1 = perfectly symmetrical, 10 = artsy/asymmetric chaos)
- **`MOTION_INTENSITY`** (1 = static, 10 = cinematic/physics-driven choreography)
- **`VISUAL_DENSITY`** (1 = art-gallery/airy, 10 = cockpit/packed with data)
- **`COLOR_COMMITMENT`** (restrained → committed → full palette → drenched; see below)

**Baseline: 8 / 6 / 4 / restrained-to-committed** for a generic landing page. Override based on the design read; do not ask the person to edit numbers, adjust conversationally instead.

**Dial inference from vibe words:**

| Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Minimalist / calm / editorial / Linear-style | 5-6 | 3-4 | 2-3 |
| Premium consumer / Apple-y / luxury / brand | 7-8 | 5-7 | 3-4 |
| Playful / Dribbble / Awwwards / experimental / agency | 9-10 | 8-10 | 3-4 |
| Landing page / portfolio / marketing (default) | 7-9 | 6-8 | 3-5 |
| Trust-first / public sector / regulated / accessibility-critical | 3-4 | 2-3 | 4-5 |
| Product / dashboard / internal tool | 3-5 | 2-4 | 5-9 |
| Redesign, preserving the brand | match existing | +1 | match existing |
| Redesign, overhauling the brand | +2 | +2 | match existing |

**Use-case presets:**

| Use case | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Landing (mainstream SaaS) | 7 | 6 | 4 |
| Landing (agency/creative) | 9 | 8 | 3 |
| Landing (premium consumer) | 7 | 6 | 3 |
| Portfolio (designer/studio) | 8 | 7 | 3 |
| Portfolio (developer) | 6 | 5 | 4 |
| Editorial/blog | 6 | 4 | 3 |
| Public-sector service | 3 | 2 | 5 |
| Dashboard / trading screen / admin tool | 3 | 2 | 7 |

**`COLOR_COMMITMENT`** (folded in as the fourth dial; pick this before picking specific colors):

- **Restrained**: tinted neutrals plus one accent used on ≤10% of the surface. Default for product UI and brand minimalism.
- **Committed**: one saturated color carries 30-60% of the surface. Default for identity-driven brand pages.
- **Full palette**: 3-4 named color roles, each with a clear job. Brand campaigns, product data visualization.
- **Drenched**: the surface IS the color. Brand hero moments and campaign pages only.

Dark vs. light is never a silent default either. Before choosing, write one sentence of physical scene: who is using this, where, under what ambient light, in what mood. A trader glancing at a screen at their desk under office light needs different defaults than a habitual dark-mode command palette. If the sentence does not force an answer, add detail until it does.


---

## 4. Choosing a Design System

Once the register (2) and dials (3) are set, pick the right foundation. Do not hand-roll CSS for something that already has an official package, and do not dress up a mere aesthetic trend as if it were an official system.

**Reach for the official package when the brief matches:**

| Brief reads as… | Reach for | Why |
|---|---|---|
| Microsoft-style enterprise SaaS / dashboards | `@fluentui/react-components` | Official Fluent 2, Microsoft tokens, accessibility handled |
| Google-ish product, Material-flavored | `@material/web` + Material 3 tokens | Official, themeable |
| IBM-style B2B / enterprise analytics | `@carbon/react` + `@carbon/styles` | Official Carbon, mature data-density patterns |
| Shopify app surfaces | Polaris web components / React | Required for Shopify admin UI |
| Atlassian/Jira-style product | `@atlaskit/*` + `@atlaskit/tokens` | Official Atlassian design system |
| GitHub-style devtool / community page | `@primer/css` or `@primer/react-brand` | Official Primer; Brand variant for marketing |
| Public-sector UK service | `govuk-frontend` | Regulatorily expected |
| US public-sector / trust-first | `uswds` | Same reasoning |
| Fast local-business / agency MVP | Bootstrap 5.3 | Boring on purpose, fast, works |
| Modern accessible React foundation | `@radix-ui/themes` | Primitives plus a polished theme |
| Modern SaaS you want to own the code for | shadcn/ui | You own the components; never ship its default, un-themed state |
| Tailwind-based indie/small-team SaaS | Tailwind v4 utilities + `dark:` variant | Default when nothing above fits |

One system per project. Do not mix Fluent React with Carbon in the same tree, and do not drop shadcn components into a Material 3 app.

**When the brief is an aesthetic, not a system** (no single official package owns it), build with native CSS + Tailwind + a maintained component library, and be honest in code comments about what is borrowed inspiration versus official material:

| Aesthetic | Honest implementation |
|---|---|
| Glassmorphism / "frosted glass" | `backdrop-filter` + layered borders + highlight overlays; solid-fill fallback under `prefers-reduced-transparency` |
| Bento (Apple-style tile grid) | CSS Grid, mixed cell sizes; no library owns this |
| Brutalism | Native CSS, monospace, raw borders |
| Editorial/magazine | Serif type, asymmetric grid, generous whitespace |
| Dark tech/hacker | Monospace + neon accent, terminal motifs |
| Aurora/mesh gradients | SVG or layered radial gradients |
| Kinetic typography | Native CSS animation, scroll-driven animation, GSAP for hijacks |
| "Apple Liquid Glass" | Apple documents this for Apple platforms only; there is no public `liquid-glass.css`. A web version is an approximation (`backdrop-filter` + layered borders); label it as such (Appendix D) |

---

## 5. Default Stack & Conventions

Unless Section 4 points at a real design system, these are the defaults for a React project. Adapt the framework-specific bits (Next.js Server Components, `'use client'`) only when actually on Next.js or another RSC framework. On a plain Vite SPA the same instinct applies without the literal directive: isolate anything stateful, animated, or listening to pointer/scroll events into its own leaf component.

**Framework & rendering**

- React or Next.js. On Next.js, default to Server Components; wrap any provider that needs client state in a `'use client'` boundary.
- Isolate interactivity: any component using Motion, scroll listeners, or pointer physics should be its own leaf component (`'use client'` on Next.js), not baked into a page-level server component.

**Styling**

- Tailwind v4 by default (v3 only if an existing project demands it). On v4, use `@tailwindcss/postcss` or the Vite plugin, not the old `tailwindcss` PostCSS plugin.

**Animation library**

- Motion (formerly Framer Motion). Import from `motion/react`: `import { motion } from "motion/react"`. The `framer-motion` package still works as a legacy alias; prefer `motion/react` in new code.
- GSAP + ScrollTrigger for full-page scrolltelling and scroll hijacks, isolated in dedicated components with `useEffect` cleanup (Section 10.7).
- Never mix GSAP/Three.js and Motion inside the same component tree; they fight over the same animation frame.

**Fonts**

- `next/font` on Next.js, or self-hosted `@font-face` with `font-display: swap` elsewhere. Never a runtime `<link>` to Google Fonts in production.

**State**

- Local `useState`/`useReducer` for isolated UI. Global state (Zustand, Jotai, context) only to avoid deep prop-drilling.
- Never use `useState` for continuous, high-frequency values driven by user input: mouse position, scroll progress, pointer physics, magnetic hover. Use Motion's `useMotionValue` / `useTransform` / `useScroll` instead; `useState` re-renders the whole tree on every pixel of movement and drops frames on mobile.

**Icons**

- Preferred, in priority order: `@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`.
- `lucide-react` is discouraged as a default for a project's own codebase (it is what is available inside this chat's own React artifacts, but that is a separate, sandboxed context). Prefer the list above unless a project already depends on Lucide or the person explicitly asks for it.
- Never hand-roll SVG icon paths. If a glyph is missing, pull in a second library or compose from primitives.
- One icon family per project. Standardize `strokeWidth` globally (1.5 or 2.0).

**Emoji**

- Discouraged by default in code, markup, and visible UI text; use icon-library glyphs instead. Allowed, sparingly, only when the brief explicitly wants a playful, chat-style, or social-native voice.

**Responsiveness & layout mechanics**

- Standard breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.
- Contain page layouts with `max-w-[1400px] mx-auto` or `max-w-7xl`.
- Never `h-screen` for a full-height hero; always `min-h-[100dvh]` to avoid layout jumps caused by the mobile browser's address bar.
- Prefer CSS Grid over flexbox percentage math. `w-[calc(33%-1rem)]` is a smell; `grid grid-cols-1 md:grid-cols-3 gap-6` is the fix. For breakpoint-free responsive grids: `repeat(auto-fit, minmax(280px, 1fr))`.
- Flexbox for one-dimensional layout, Grid for two-dimensional. Do not reach for Grid when `flex-wrap` would be simpler, and do not reach for flex-math when Grid would be simpler.
- Build a real semantic z-index scale (`dropdown → sticky → modal-backdrop → modal → toast → tooltip`) in one place. Never arbitrary `z-10`/`z-50`/`z-9999` sprinkled around the codebase.

**Dependency hygiene**

- Check `package.json` before importing any third-party library. If it is missing, say so and give the install command first. Never assume a library is already there.

---

## 6. Typography

**Sizing & rhythm**

- Body copy: cap line length at 65-75ch (`max-w-[65ch]`), `leading-relaxed`.
- Display/headline sizing: fluid `clamp()`, roughly `text-4xl` to `text-7xl` across breakpoints for most heroes, tight tracking down to a floor of about `-0.04em` (tighter than that and letters start touching, which reads as cramped rather than "designed"). A hard ceiling of about `6rem` (96px) applies, reserved only for very short headlines (3-5 words). Plan font size and hero-image size together: if the headline is longer than about six words, do not start at the biggest size in the scale. A four-line hero headline is a font-size bug, not a copy-length problem, unless the words themselves genuinely need trimming.
- `text-wrap: balance` on h1-h3 for even line breaks; `text-wrap: pretty` on long-form prose to reduce orphans.
- Every italic word in a display headline needs descender clearance: letters like `y g j p q` clip under `leading-none`/`leading-[1]`. Use `leading-[1.1]` minimum plus a `pb-1`/`mb-1` reserve, and check every italic word before shipping.

**Font choice**

- `Inter` is discouraged as the silent default, not banned, just overused. Reach for `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or a brand-appropriate serif first. Inter is genuinely fine when the brief explicitly wants a neutral, standard, Linear-style feel, or for public-sector and accessibility-first work.
- Pairing rule: do not pair two fonts that are similar but not identical (two geometric sans, two humanist sans); it reads as an accident, not a choice. Pair across a real contrast axis (serif + sans, geometric + humanist), or use one family across multiple weights. Known-good pairs: `Geist` + `Geist Mono`, `Satoshi` + `JetBrains Mono`, `Cabinet Grotesk` + `Inter Tight`, `GT America` + `IBM Plex Mono`.
- **Serif discipline.** Serif is heavily discouraged as a default display choice. "It feels creative/premium/editorial" is not, on its own, a reason; that exact reasoning is one of the most reliable tells in AI-generated output. Serif earns its place only when the brand brief literally names one, or the aesthetic is genuinely editorial, luxury, publication, or heritage AND there is a specific reason this serif fits this specific brand. Otherwise default to a sans display face (`Geist Display`, `ABC Diatype`, `Söhne Breit`, `Cabinet Grotesk Display`, `PP Neue Montreal`); sans is not the boring choice, it is the same kind of default that black is in fashion. `Fraunces` and `Instrument Serif` specifically are the two most over-used AI-default display serifs; avoid them as the reflexive pick. If a serif genuinely is justified, rotate through a pool rather than reusing the same one project after project: `PP Editorial New`, `GT Sectra Display`, `Reckless Neue`, `Tiempos Headline`, `Recoleta`, `Cormorant Garamond`, `Playfair Display`, `EB Garamond`, `Canela`, `Domaine Display`, `Söhne Breit Kursiv`.
- To emphasize a word inside a headline, use italic or bold of the same family. Injecting a random serif word into a sans headline, or vice versa, to "add interest" reads as amateur; same-family emphasis reads as intentional.

---

## 7. Color

**Contrast is not optional.** Body text needs at least 4.5:1 against its background; large text (18px+ or bold 14px+) needs at least 3:1. Placeholder text needs the same 4.5:1 as body text, not a lighter "muted" gray; light-gray-for-elegance on a tinted near-white background is the single most common reason AI-generated UI is hard to read. If a contrast check is even close, push the body color toward the ink end of the ramp. Gray text over a colored background looks washed out; use a darker shade of that background's own hue, or lower the text's opacity against a solid color, instead of desaturating it.

**Use OKLCH** for color definitions; it makes lightness, chroma, and hue reasoning (and the bans below) actually checkable.

**Pick a color-commitment level before picking colors.** See `COLOR_COMMITMENT` in Section 3.

**The cream/sand/beige default.** The entire warm-neutral band (OKLCH lightness 0.84-0.97, chroma under 0.06, hue 40-100) reads as cream, sand, paper, or parchment no matter what it is named, and it is the single most reflexive AI body-background choice. Token names like `--paper`, `--cream`, `--sand`, `--bone`, `--linen`, `--parchment`, `--ivory` are themselves a tell. A brief like "warm, traditional, editorial-restraint" does not translate to a near-white warm-tinted background; that translation is the AI move. Instead: (a) use a saturated brand color as the body background (terracotta, oxblood, deep ochre, near-black), (b) use a true off-white at chroma near 0, or tinted toward the brand's own hue rather than warmth-by-default, or (c) use a darker mid-tone neutral that is clearly the brand's own. Carry "warmth" through the accent, typography, and imagery instead of the body background.

**The premium-consumer palette ban.** For premium-consumer briefs specifically (cookware, wellness, artisan goods, heritage craft, DTC home goods) the reflexive AI palette is warm beige/cream backgrounds plus brass/clay/oxblood/ochre accents plus espresso/near-black text. Concretely, avoid reaching for this family as a default:

- Backgrounds in the `#f5f1ea` / `#f7f5f1` / `#efeae0` / `#faf7f1` neighborhood ("warm paper/chalk/bone")
- Accents in the `#b08947` / `#b6553a` / `#9a2436` / `#9c6e2a` neighborhood ("brass/clay/oxblood/ochre")
- Text in the `#1a1714` / `#1a1814` neighborhood ("espresso/warm near-black")

Every premium-consumer brief reaching for exactly this palette is why so many of them look identical. Rotate through real alternatives instead, and do not reuse the same family two projects in a row: **Cold Luxury** (silver-grey, chrome, smoke), **Forest** (deep green, bone, amber accent), **Black and Tan** (true off-black plus warm tan, sharp contrast, no beige), **Cobalt + Cream** (one saturated blue against one neutral), **Terracotta + Slate** (warm rust against cool grey), **Olive + Brick + Paper**, or **pure monochrome plus one saturated pop** (off-white, off-black, one bright accent). The beige/brass/espresso combination is fine only when the brand explicitly names those colors, or the identity is genuinely vintage/artisan and it is a deliberate, specific fit, not a reflex.

**Consistency locks:**

- **One accent color, used identically everywhere.** Pick it once and audit every section; a warm-grey site does not get a blue CTA in section seven, a rose accent does not get a teal badge in the footer.
- **The AI-purple/blue-glow reflex** (automatic purple button glow, random neon gradient) is discouraged as a default. Use neutral bases (zinc/slate/stone) with one high-contrast accent (emerald, electric blue, deep rose, burnt orange). If the brand or brief genuinely wants purple, use it deliberately and consistently, not as generic gradient filler.
- **One palette per project.** Do not drift between warm and cool grays within the same build.
- Max one accent color at less than 80% saturation, unless `COLOR_COMMITMENT` is "drenched."

---

## 8. Layout & Composition

**General mechanics**

- Vary spacing deliberately for rhythm; do not apply the same gap everywhere.
- Cards are the lazy default. Use a card only when elevation communicates real hierarchy; otherwise group with `border-t`, `divide-y`, or negative space. Nested cards are always wrong. At `VISUAL_DENSITY > 7` (dashboards), skip generic card containers entirely and let data breathe in a plain layout.
- When a shadow is used, tint it toward the background hue; never a pure-black drop shadow on a light background.
- **Shape consistency lock.** Pick one corner-radius scale for the whole page and hold it: all-sharp (0), all-soft (12-16px), or all-pill for interactive elements. Mixed systems are fine only with a documented, page-wide rule ("buttons are full-pill, cards are 16px, inputs are 8px") applied everywhere; round buttons dropped into an otherwise-square layout is broken design, not a style choice.

**Anti-center bias (brand register).** Avoid a centered hero/H1 once `DESIGN_VARIANCE > 4`. Reach for a 50/50 split, left-aligned copy with a right-aligned asset, asymmetric whitespace, or a scroll-pinned structure instead. A centered hero is still the right call for a manifesto or launch-announcement brief where the message itself is the whole design.

**Hero hard rules (brand register)**

- The hero must fit in the first viewport: headline at most 2 lines on desktop, subtext at most 20 words AND at most 3-4 lines, CTA visible without scrolling. If the copy overflows, cut the copy or reduce the font scale; a four-line headline is a font-size bug, never a "the rule is too tight" problem.
- Top padding caps at `pt-24` (about 6rem) at desktop; more than that and the hero content visually floats halfway down the viewport, which reads as a bug, not breathing room. If more room is genuinely needed, grow the font or the asset instead.
- Max four text elements in the hero, in this order: one optional eyebrow-or-brand-strip (pick zero or one, not both), the headline, the subtext, and the CTA(s) (one primary, at most one secondary). Banned inside the hero: a tiny tagline under the CTAs, a trust micro-strip ("Used by teams at…"), a pricing teaser, a feature-bullet list, a social-proof avatar row; all of those belong in their own section directly below the hero, not crammed into it.
- A "trusted by" logo wall belongs directly under the hero, never inside it.

**Navigation**

- Must render on a single line at desktop; if items do not fit at `lg` (1024px), shorten labels, drop secondary items, or move to a hamburger. A two-line nav at desktop is broken, not "content-rich."
- Height caps at 80px, typically 64-72px. No oversized "agency" nav bars eating 15% of the viewport.

**Grids and repetition (brand register)**

- Bento grids need exactly as many cells as there is content: three items get three cells (a 1+2 or 2+1 split), five items get five (2+3, hero+4, and so on). An empty cell in the middle or at the end means the grid was planned wrong; reshape it, do not paste a blank tile.
- At least two or three cells in any multi-cell grid need real visual variation (a photo, a brand-appropriate gradient, a pattern, a tint); an all-white, all-typography bento grid reads as the AI default even when everything else on the page is good.
- **Section-layout-repetition ban.** Once a layout family (three-column image cards, full-width quote, split text/image) is used for one section, it can appear at most once more on the page; an eight-section landing page needs at least four different layout families. Two or more sections in a row with the same left-image/right-text-then-flip "zigzag" pattern is the specific, most common version of this: cap it at two in a row, and break the third with a full-width section, a stack, or a bento grid.
- **Split-header ban.** "Big headline on the left, small explainer paragraph floating in the right column" as a section header is banned by default; it reads as an unfilled template slot. If both a headline and an explainer are genuinely needed, stack them vertically (headline, then body, `max-w-[65ch]`) instead. Only use the split when the right column carries a real visual or interactive element, not filler text.
- **Eyebrow restraint (the single most over-used pattern).** A small uppercase, wide-tracked label above a section headline ("SELECTED WORK," "THE HARDWARE") is fine as an occasional device, not as the rhythm of every section. Cap it mechanically: at most one eyebrow per three sections (the hero counts as one). On a nine-section page that is three eyebrows total, and if section A has one, the next two cannot. When in doubt, drop it; the headline alone, in its position on the page, is usually enough context.
- Numbered section markers (`01 / Index`, `002 · Capabilities`) are the same reflex one layer deeper. They earn their place only when the section genuinely is a sequence (a real ordered process) where the order itself carries information; otherwise they are scaffolding, not content.

**Interactive & data-dense layout (product register)**

- Long lists need a different component, not a longer list; see Section 18 for the concrete alternatives. This shows up constantly in dashboards, screening tools, and spec sheets.
- Mobile collapse must be declared explicitly per multi-column section (`< 768px` fallback in the same component); do not assume Tailwind "handles it" implicitly.

---

## 9. Interactive States & Forms

Most AI-generated UI only implements the happy path. Build the full state cycle for anything interactive:

- **Loading**: skeleton loaders shaped like the real content, not a generic spinner.
- **Empty**: composed deliberately, showing how to populate the view rather than just "no data."
- **Error**: inline for forms, contextual toasts only for transient or global errors.
- **Tactile feedback**: `:active` states use `-translate-y-[1px]` or `scale-[0.98]` to simulate a physical press (see Section 11 for the full button treatment).

**Contrast checks before shipping any interactive element:**

- Every CTA's text must be readable against its own background. White text on a white button, `bg-white` with `text-white`, or a transparent ghost button with no border over a photo are all shipping bugs, not style. WCAG AA minimum: 4.5:1 for body-sized labels, 3:1 for large (18px+) ones. Ghost buttons over photography need a scrim, backdrop, or stroke to hold contrast.
- Form inputs, placeholders, focus rings, helper text, and error text all need to pass the same AA contrast against the section background; audit every form, not just the page's main text.

**CTA hygiene**

- A CTA label must fit on one line at desktop. If it wraps to two or three lines, either shorten the label (three words max, ideally one or two) or widen the button; do not force a `max-width` that causes the wrap.
- No duplicate CTA intent on one page. "Get in touch," "Let's talk," "Contact us," and "Start a project" are all the same intent; pick one label and reuse it everywhere (nav, hero, footer). Same logic for "signup" ("Try free" / "Get started" / "Sign up free") and "portfolio" ("View work" / "See selected work" / "Browse projects") intents.

**Forms**

- Label above the input, always. Helper text is optional but present in markup when used. Error text goes below the input. Standard `gap-2` for a label-plus-input-plus-helper block.
- Never use a placeholder as the label.

**Interaction mechanics**

- A dropdown positioned `absolute` inside an `overflow: hidden` or `overflow: auto` ancestor will get clipped. Use the native `<dialog>`/popover API, `position: fixed`, or a portal to escape the ancestor's stacking context.

---

## 10. Motion & Animation

This is the deepest section in the skill. It leans hardest on Emil Kowalski's design-engineering philosophy, and it is where the source skills' own default-easing advice actually agrees, once "no bounce" is read as "no bounce by default" rather than "never."

### 10.1 Should this animate at all?

Ask first: **how often will someone see this animation?**

| Frequency | Decision |
|---|---|
| 100+ times/day (keyboard shortcuts, command-palette toggle) | No animation. Ever. |
| Tens of times/day (hover states, list navigation) | Remove it, or cut it drastically |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare/first-time (onboarding, feedback forms, celebrations) | Room for real delight |

**Never animate a keyboard-initiated action.** These fire hundreds of times a day; animation makes them feel slow and disconnected from the keystroke that triggered them. Raycast ships with no open/close animation at all, which is the correct choice for something used that often.

### 10.2 What is the purpose?

Every animation needs a one-sentence answer to "why does this move?" Valid answers: **spatial consistency** (a toast enters and exits from the same direction, so swipe-to-dismiss feels intuitive), **state indication** (a button morphs to show a state change), **explanation** (a marketing animation demonstrating how a feature works), **feedback** (a button compresses on press, confirming the interface heard the click), and **preventing a jarring change** (elements popping in or out with no transition read as broken). "It looked cool" is not a valid answer once the element is seen often, and it is the single most common way GSAP or Motion gets bolted onto a page for no reason. If the reason cannot fit in one sentence, drop the animation.

Staggering the entries within one genuine list is legitimate motion, not decoration; the tell is applying the identical entrance to every section regardless of what it reveals, not stagger itself. Never suppress motion just to dodge that reflex; ship the reveal that actually fits what is being revealed.

### 10.3 Easing

Decision tree:

- Entering or exiting? → `ease-out` (starts fast, feels responsive)
- Moving or morphing on screen? → `ease-in-out`
- Hover or color change? → `ease`
- Constant motion (marquee, progress bar)? → `linear`
- Unsure? → `ease-out`

**Never use `ease-in` for UI.** It starts slow, which makes the interface feel sluggish before it is even finished; a dropdown at `ease-in` 300ms *feels* slower than the same 300ms at `ease-out`, because `ease-in` delays the exact moment being watched most closely.

**Use custom, stronger curves; the built-in CSS easings are too weak to feel intentional.** This is also where the "no bounce" guidance from the anti-slop side of this skill and the "springs can bounce" guidance from the motion side actually reconcile: these are strong **exponential** ease-out/ease-in-out curves, zero bounce, used for ordinary enter, exit, and move transitions.

```css
/* Strong ease-out for UI interactions (an "ease-out-expo" family curve) */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);

/* Strong ease-in-out for on-screen movement */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

/* iOS-like drawer curve (via Ionic Framework) */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

Reach for [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/) for further variants rather than inventing a curve from scratch.

Bounce is reserved for springs specifically (10.5), and only for drag-to-dismiss and explicitly playful or decorative interactions; never as the default for a dropdown, modal, or button.

### 10.4 Duration

| Element | Duration |
|---|---|
| Button press feedback | 100-160ms |
| Tooltips, small popovers | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modals, drawers | 200-500ms |
| Marketing/explanatory | Can run longer |

**Standard UI animation stays under 300ms.** A 180ms dropdown feels more responsive than a 400ms one at the exact same underlying load time; perception of speed matters as much as actual speed, and easing amplifies it (`ease-out` at 200ms *feels* faster than `ease-in` at 200ms because motion starts immediately). A faster-spinning spinner makes a load feel shorter even when it is not. Once one tooltip in a group is open, skip the delay and the animation on the next one; the whole cluster feels faster without undermining the initial delay's purpose of preventing accidental activation.

### 10.5 Springs

Springs simulate real physics instead of a fixed duration; they settle based on physical parameters, not a clock, which is why they feel more natural for anything that could be interrupted mid-motion.

**Use springs for:** drag interactions with momentum, elements that should feel "alive" (Dynamic-Island-style morphs), gestures the user might interrupt mid-animation, decorative mouse-tracking.

**Do not tie visual state directly to a raw input value** (mouse position, scroll offset); it feels artificial because it has no momentum. Interpolate through a spring instead:

```jsx
import { useSpring } from "motion/react";

// Without a spring: feels artificial, snaps instantly
const rotation = mouseX * 0.1;

// With a spring: feels natural, carries momentum
const springRotation = useSpring(mouseX * 0.1, {
  stiffness: 100,
  damping: 10,
});
```

This only makes sense when the motion is decorative. A functional chart in a trading dashboard should not have springy mouse-tracking; no animation is better than distracting animation on data someone is trying to read accurately.

**Configuration.** Apple's duration-plus-bounce model is easier to reason about than raw physics:

```js
// Apple-style (recommended default)
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Traditional physics (more manual control)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

Keep `bounce` in the 0.1-0.3 range when it is used at all, and reserve it for drag-to-dismiss and genuinely playful interactions. For everything else, dropdowns, modals, standard enter/exit, use `bounce: 0` (critically damped) or the exponential curves from 10.3; that is the version of "no bounce, no elastic" that both halves of this skill actually agree on.

**Interruptibility.** Springs keep their current velocity when interrupted; CSS keyframes restart from zero. If someone opens an expanded item and immediately hits Escape, a spring reverses smoothly from wherever it currently is; a keyframe animation snaps back to the start first. This is why springs are the right tool for anything a person might change their mind about mid-motion.

### 10.6 Motion accountability

- **"Motion claimed, motion shown."** If `MOTION_INTENSITY > 4`, the page needs to actually move: entry transitions on the hero, scroll-reveal on key sections, hover physics on CTAs, at minimum. A static page claiming a `MOTION_INTENSITY` of 7 is a broken deliverable. The inverse also holds: if working motion cannot be shipped in the available scope, drop the dial to 3 and ship a clean static page rather than half-building a ScrollTrigger that cuts off, an enter animation that jumps, or a cleanup function that is missing.
- **Marquee cap.** A horizontal scrolling text marquee (a logo strip, a manifesto scrolling sideways) earns a place at most once per page. Two or more reads as filler, not a feature.
- **Stagger delays stay short** (30-80ms between items); long delays make the whole interface feel slow. Stagger is decorative; never block interaction while a stagger sequence is still playing.

### 10.7 Canonical scroll patterns

For a **real** sticky-stack (cards that pin and physically shrink as the next one arrives, not a sequential reveal list), the trigger has to pin at the viewport's actual top:

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div key={i} className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center">
          {card}
        </div>
      ))}
    </div>
  );
}
```

The failure mode to check for: the trigger firing halfway through the scroll instead of pinning right at the top. The fix is always `start: "top top"`, never `"top center"` or `"top 80%"`.

For a **horizontal scroll-hijack** (vertical scroll drives horizontal pan), the same fix applies, plus the scroll distance has to equal the actual horizontal travel needed:

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center">
        {children}
      </div>
    </section>
  );
}
```

For the simpler "items fade in as they enter the viewport" case with no pinning, skip GSAP entirely and use Motion's `whileInView`; it is lighter and needs no ScrollTrigger:

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

Use this for feature lists, testimonial grids, and logo walls; save GSAP for actual pin-and-scrub work.

### 10.8 Forbidden animation patterns

- **`window.addEventListener("scroll", ...)`**: runs on every frame, unbatched, guaranteed jank. Use Motion's `useScroll()`, GSAP's `ScrollTrigger`, `IntersectionObserver`, or CSS scroll-driven animation (`animation-timeline: view()`).
- **Scroll progress computed from `window.scrollY` into React state**: same problem, re-renders every frame.
- **`requestAnimationFrame` loops that write to React state**: use `useMotionValue`/`useTransform` instead.
- **Motion's `x`/`y`/`scale` shorthand is not hardware-accelerated under load**: it runs via `requestAnimationFrame` on the main thread. When the main thread is busy (a page loading, scripts running), it drops frames. Use the full `transform` string instead:

```jsx
// NOT hardware-accelerated (convenient, but drops frames under load)
<motion.div animate={{ x: 100 }} />

// Hardware-accelerated (stays smooth even when the main thread is busy)
<motion.div animate={{ transform: "translateX(100px)" }} />
```

- Reach for Motion's `layout`/`layoutId` props specifically for visible state changes (reordering a list, expanding a shared element); do not wrap static content in `layout` "just in case," it costs a measurement pass for nothing.

---

## 11. Component-Level Craft

**Buttons must feel pressed.** Add `transform: scale(0.97)` on `:active` (0.95-0.98 range) to any pressable element; it is the cheapest way to make an interface feel like it is actually listening.

```css
.button {
  transition: transform 160ms ease-out;
}
.button:active {
  transform: scale(0.97);
}
```

**Never animate an entrance from `scale(0)`.** Nothing in the physical world disappears completely and reappears from nothing; `scale(0)` entrances look like they materialize from a glitch. Start from `scale(0.95)` combined with `opacity: 0` instead; even a barely visible starting scale reads as natural, like a balloon that still has a shape when it is deflated.

**Popovers scale from their trigger, not from center.** `transform-origin: center` is the wrong default for almost every popover; the exception is modals, which are not anchored to a trigger and should stay centered.

```css
/* Radix UI */
.popover { transform-origin: var(--radix-popover-content-transform-origin); }
/* Base UI */
.popover { transform-origin: var(--transform-origin); }
```

**Tooltips: delay once, then skip it.** The first tooltip in a group should delay before appearing, to prevent accidental activation on a stray hover, but once one is open, adjacent tooltips should open instantly with no animation. It feels faster without undermining the point of the initial delay.

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}
.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

**CSS transitions over keyframes for anything triggered rapidly.** Transitions can be interrupted and retargeted mid-flight; keyframes always restart from zero. Anything that can fire in quick succession (stacking toasts, toggling a state repeatedly) should use a transition, not a keyframe animation.

```css
/* Interruptible: good for dynamic UI */
.toast { transition: transform 400ms ease; }

/* Restarts from zero on interruption: avoid for anything rapid */
@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

**Blur can rescue a crossfade that will not settle.** If two states crossfading feels wrong no matter what easing or duration is tried, add a subtle `filter: blur(2px)` during the transition. Without blur, a crossfade shows two distinct objects overlapping; blur bridges the gap so the eye reads one continuous transformation instead of a swap. Keep blur under 20px; it is expensive, especially in Safari.

```css
.button-content {
  transition: filter 200ms ease, opacity 200ms ease;
}
.button-content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

**Use `@starting-style` for entrance animation instead of a mount-flag `useEffect`.**

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

Fall back to the classic `data-mounted` pattern where browser support demands it:

```jsx
useEffect(() => { setMounted(true); }, []);
// <div data-mounted={mounted}>
```

**Asymmetric enter/exit timing.** Slow where the interaction needs to feel deliberate, fast where the system responds. A hold-to-delete pattern should press slowly (2s, linear) but release snappily (200ms, ease-out); this pattern of slow-for-deciding, fast-for-responding generalizes well beyond hold-to-delete.

```css
.overlay {
  transition: clip-path 200ms ease-out; /* release: fast */
}
.button:active .overlay {
  transition: clip-path 2s linear; /* press: slow, deliberate */
}
```

---

## 12. CSS Transforms & clip-path

**`translateY` with percentages** is relative to the element's own size, not the viewport; `translateY(100%)` moves an element by exactly its own height regardless of actual pixel dimensions. This is how toast libraries position off-screen toasts and how drawer libraries hide a drawer before animating it in. Prefer percentages over hardcoded pixels; they adapt to content instead of breaking when it changes.

**`scale()` scales children too**, unlike `width`/`height`; a scaled button's icon and text scale proportionally along with it. That is a feature, not a bug, when used for press feedback.

**3D transforms for real depth.** `rotateX()`/`rotateY()` with `transform-style: preserve-3d` create genuine 3D effects in CSS: orbiting animations, coin flips, and depth, all without JavaScript.

**`transform-origin`** is the anchor point transforms execute from; the default is center. Set it to match the actual trigger location for origin-aware interactions (see popovers, Section 11).

**`clip-path` is an animation tool, not just a shape tool.** `clip-path: inset(top right bottom left)` defines a rectangular clip region, and each value "eats into" the element from that side:

```css
/* Fully hidden from the right */
.hidden { clip-path: inset(0 100% 0 0); }
/* Fully visible */
.visible { clip-path: inset(0 0 0 0); }
/* Reveal left to right */
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}
```

Patterns built on this:

- **Tabs with a perfect color transition**: duplicate the tab list, style the copy as "active," clip the copy so only the active tab shows, and animate the clip on tab change. This produces a seamless color swap that timing individual color transitions on separate elements can never quite match.
- **Hold-to-delete**: a colored overlay clipped at `inset(0 100% 0 0)`; on `:active`, transition to `inset(0 0 0 0)` over 2s linear; on release, snap back with 200ms ease-out (see the asymmetric-timing pattern in Section 11).
- **Image reveal on scroll**: start at `clip-path: inset(0 0 100% 0)` (hidden from the bottom), animate to `inset(0 0 0 0)` on viewport entry via `IntersectionObserver` or Motion's `useInView({ once: true, margin: "-100px" })`.
- **Comparison sliders**: overlay two images, clip the top one with `clip-path: inset(0 50% 0 0)`, and drive the right-side inset value from drag position; no extra DOM elements, fully hardware-accelerated.

---

## 13. Gesture & Drag Physics

- **Momentum-based dismissal.** Do not require a fixed drag distance before dismissing; compute velocity (`Math.abs(dragDistance) / elapsedTime`) and dismiss on a fast flick even if the distance threshold was not crossed:

```js
const timeTaken = new Date().getTime() - dragStartTime.current.getTime();
const velocity = Math.abs(swipeAmount) / timeTaken;
if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

- **Damping at boundaries, not hard stops.** When a drag goes past its natural limit (dragging a drawer up past fully open), apply increasing resistance rather than an abrupt wall; real things slow down before they stop.
- **Pointer capture on drag start** so the interaction continues even if the pointer leaves the element's bounds mid-drag.
- **Ignore additional touch points** once a drag has started; without this, switching fingers mid-drag makes the element jump.
- **Friction over hard stops, generally.** Letting a drag continue with rising resistance, instead of blocking it outright, feels more natural than hitting an invisible wall.

---

## 14. Performance

- **Animate only `transform` and `opacity`.** These skip layout and paint and run on the compositor thread. Animating `padding`, `margin`, `width`, or `height` triggers layout, paint, and composite, every single frame.
- **CSS custom properties are inherited, and that is a performance trap.** Updating a `--variable` on a parent forces a style recalculation on every descendant. In a drawer with many items, setting `--swipe-amount` on the container is expensive; set `transform` directly on the dragged element instead.

```js
// Expensive: forces recalculation on every child
element.style.setProperty('--swipe-amount', `${distance}px`);
// Cheap: only this element is affected
element.style.transform = `translateY(${distance}px)`;
```

- **CSS animations beat JS under load.** CSS animations run off the main thread; Motion's `requestAnimationFrame`-driven ones do not. When the browser is busy loading a page or running scripts, CSS keeps animating smoothly while JS-driven motion drops frames. Use CSS for predetermined animation, JS for anything dynamic or interruptible.
- **WAAPI for programmatic CSS-grade animation.** The Web Animations API gives JS control with CSS's hardware acceleration and interruptibility, no library required:

```js
element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

- **Grain and noise filters** go exclusively on a `fixed`, `pointer-events-none` pseudo-element; never on a scrolling container, where they force continuous GPU repaints and tank mobile frame rate.
- **Watch bundle size.** Motion is not tiny; Three.js is large. Lazy-load anything below the fold.
- **Core Web Vitals targets**: LCP under 2.5s (mark the hero image `priority`/preload it), INP under 200ms (keep heavy work off the main thread), CLS under 0.1 (reserve space for images, fonts, and embeds before they load). Run Lighthouse before calling a page done.

---

## 15. Accessibility & Reduced Motion

- **`prefers-reduced-motion` is mandatory, not optional, for anything above `MOTION_INTENSITY` 3.** Reduced does not mean zero: keep opacity and color transitions that aid comprehension, and remove movement or position-based motion. Infinite loops, parallax, scroll-hijacking, and magnetic-physics effects must all collapse to static or instant under reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s ease; /* keep: aids comprehension */
    /* no transform-based motion */
  }
}
```
```jsx
const shouldReduceMotion = useReducedMotion();
const closedX = shouldReduceMotion ? 0 : "-100%";
```

- **Gate hover effects behind a real hover-capability check.** Touch devices fire `:hover` on tap, producing false positives:

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); }
}
```

- **Contrast standards apply everywhere, not just body copy.** See Section 7 and Section 9 for the concrete thresholds (4.5:1 body and placeholders, 3:1 large text) and where they get missed most often: placeholders, ghost buttons over photography, and forms.

---

## 16. Dark Mode & Theme Lock

Design both modes from the start; never ship light-only or dark-only without an explicit instruction to do so.

- **Pick one token strategy and hold it**: Tailwind's `dark:` variant (`bg-white dark:bg-zinc-950`) for utility-first work, or CSS variables under `[data-theme="dark"]`/`prefers-color-scheme` for anything with built-in theming (shadcn/ui, Radix Themes). Set the theme once at the root, never per section.
- This skill does not prescribe specific dark-mode colors; the brief and brand decide those. What it enforces: **contrast** (WCAG AA minimum on body, AAA target on hero copy), **hierarchy parity** (whatever pops in light mode needs to pop in dark mode too), **brand fidelity** (the primary brand color stays recognizable, not desaturated into invisibility), and **no pure `#000000` or pure `#ffffff`**, using an off-black (zinc-950, a near-black warm gray) and an off-white instead, since pure values flatten depth.
- Respect `prefers-color-scheme` by default; add a manual toggle only when either mode would genuinely lose brand expression.
- **Test both modes before calling it done.** Do not ship a page only ever seen in one.

**Page theme lock.** The whole page has one theme. If it is dark, every section is dark; no light, warm-paper section sandwiched between dark ones (or the reverse). The person should not feel like they scrolled onto a different site mid-page. The one exception is a deliberate "theme switch on scroll" device used exactly once, as an intentional composition with a real transition, not a random flip. Section-level tint variation within the same theme family is fine (`bg-zinc-950` next to `bg-zinc-900`); flipping to `bg-amber-50` mid-page inside an otherwise dark build is not.

---

## 17. Images & Visual Assets (Brand Register)

Landing pages and portfolios are visual products; a text-only page with fake `<div>` "screenshots" is unfinished work, not minimalism.

**Priority order for any visual asset:**

1. **An image-generation tool, if one is available**: use it for hero photography, product shots, textures, and mood images at the right aspect ratio for the section. Do not skip this because hand-rolled CSS feels faster.
2. **Real photography, if no generation tool exists**: `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` for placeholder photography (seed the string with something describing the section), actual brand or stock URLs when provided, or open-license sources when explicitly allowed.
3. **A clearly labeled placeholder as the last resort**: leave a `<!-- TODO: hero product photo, 1600x1200 -->` slot and tell the person exactly where real images are needed, rather than filling the gap with a hand-rolled illustration or a fake screenshot.

Even a restrained, minimalist brief needs at least two or three real images (a hero shot, one product or lifestyle image, one supporting image); a pure-text page is incomplete, not minimalist.

**Social-proof logo walls need real logos**, not styled text wordmarks. Use Simple Icons (`https://cdn.simpleicons.org/{slug}/{hexcolor}` or the `simple-icons` npm package) for known brands, or `devicon` for tech-stack logos. For an invented brand name, generate a simple monogram SVG rather than a plain text wordmark. Make sure every logo renders in both light and dark mode. **Logo-only rule**: the logo wall is logos, full stop; no category label printed underneath ("Vercel" / "hosting," "Stripe" / "payments"). The logo already carries the credibility.

**Never build a fake product preview out of styled `<div>` rectangles** (a fake task list, fake terminal, fake dashboard). It is one of the most reliable tells there is. Use a real screenshot, a generated image, an actual mini version of the real UI, or skip the preview and use photography instead. A hero built from "text plus gradient blob" is not a hero, it is a placeholder that shipped by accident.

---

## 18. Content, Copy & Data Density

**Cut ruthlessly.** A landing page lives on the first impression, not the full read: default to a headline of at most 8 words, a sub-paragraph of at most 25 words, and one visual or one CTA per section. Anything beyond that needs to be justified by the section's actual job.

**Long lists and dense data need a different component, not a longer list.** A default `<ul>` with bullets, or a table with `border-b` under every row, is the laziest possible choice once there are more than about five items, and it is exactly the shape of screening tables, sector lists, and breakout-signal feeds, so this is worth internalizing for dashboard work specifically, not just landing pages. Reach instead for: a two-column card grid grouping related items, tabs or an accordion when items are categorizable, horizontal scroll-snap pills, a carousel for breadth-heavy content (testimonials, logos), or a marquee for "lots of things that do not need individual attention." For a long spec-sheet-style table specifically: group rows into two or three logical clusters with one soft divider per cluster, not one hairline per row, or feature the three or four most important values as large display tiles with the rest collapsed under a "view full list" disclosure.

**Copy self-audit before shipping.** Re-read every visible string: headlines, eyebrows, button labels, body copy, captions, alt text, error messages. Flag anything grammatically broken, anything with an unclear referent, or anything that reads like a forced metaphor or performative cleverness rather than a plain sentence. If a string's sense is in doubt, replace it with the plain functional version; AI-generated "clever" copy that does not quite land is worse than boring copy.

**Fake precision is a tell.** Numbers like `92%`, `4.1x`, or `48k` are fine when they come from real data, or are explicitly marked as mock or sample; inventing engineering-sounding precision the brand has not earned is not.

**One copy register per page.** Do not mix technical monospace metadata, editorial prose, and marketing punch in the same composition unless the brand voice genuinely calls for it.

**Quotes and testimonials**: cap the visible quote body at about three lines, never six; a landing-page quote is a snippet, not the full review. Attribution needs a name, role, and ideally a company; never a first name alone. Use real typographic quote marks or none; never straight ASCII quotes, and never an em-dash as a design flourish inside the quote (the em-dash ban in Section 19 is absolute, quotes included).

**People and brand names.** No generic "Jane Doe"/"John Doe"/"Sarah Chan" placeholder names; use realistic, locale-appropriate ones instead. No generic egg-avatar or default user icons; use believable photo placeholders. No startup-slop invented brand names ("Acme," "Nexus," "SmartFlow," "Cloudly"); invent a name that sounds like it could be real. No filler verbs ("Elevate," "Seamless," "Unleash," "Next-Gen," "Revolutionize"); use concrete verbs that say what the thing actually does.

---

## 19. The AI Tells Master List

If someone could look at a build and say "AI made this" without hesitating, it has failed, regardless of how correctly any individual rule was followed. This section collects the tells not already covered in their natural section above: typography's serif and Inter defaults (6), color's cream, beige, and premium-consumer bans (7), layout's eyebrow, zigzag, split-header, and bento bans (8), and content's Jane Doe, Acme, and filler-verb bans (18). Treat every rule below as a hard default to avoid, not a permanent ban; each has the same shape of exception, which is that the brief explicitly and deliberately calls for it.

**The em-dash ban (the single most-violated rule).** The em-dash (Unicode character U+2014) is completely banned: no "use sparingly" carve-out, no "fine in body copy" exception. It does not appear in headlines, eyebrows, pills, button text, captions, nav items, body copy, or quote attribution. Restructure instead: two sentences with a period, a comma, parentheses, or a colon. The en-dash used as a separator is banned the same way; date and number ranges use a plain hyphen (`2018-2026`, `40-80k`). The only permitted dash characters anywhere visible are the regular hyphen and a mathematical minus sign. A single em-dash anywhere in the output fails the pre-flight check (Section 22) and needs a rewrite; this rule does not bend to "used naturally" phrasing.

**Visual & CSS**

- No neon or outer glows by default; use inner borders or a subtle background-tinted shadow instead.
- No pure black (`#000000`); use off-black, zinc-950, or charcoal.
- No oversaturated accent colors; desaturate to sit with the neutrals (see Section 7).
- No gradient text (`background-clip: text` combined with a gradient background) as decoration; it is never meaningful, only decorative. Use a solid color and vary weight or size for emphasis instead.
- No custom mouse cursors; outdated, and hostile to both accessibility and performance.
- No side-stripe borders (`border-left`/`border-right` used as a colored accent stripe on a card or callout); rewrite with a full border, a background tint, a leading icon, or nothing.
- No glassmorphism as an unearned default; rare and purposeful, or skip it (see the honest implementation table in Section 4).
- No "hero-metric template" (big number, small label, supporting stats, gradient accent) as the reflexive SaaS layout.
- No identical card grids: same-sized cards repeating icon-plus-heading-plus-text endlessly, including the classic three-equal-column feature row (see the section-repetition and bento rules in Section 8 for the layout-level version of this same ban).

**Hero & top-of-page**

- No version labels in the hero (`V0.6`, `BETA`, `INVITE-ONLY PREVIEW`, `ALPHA`) unless the brief is genuinely about a product launch or preview status.
- No "Brand · No. 01"-style sub-eyebrow micro-meta line under the hero headline.
- No decoration text strip at the hero's bottom (`BRAND. MOTION. SPATIAL.`, `TYPE / FORM / MOTION`) unless it is a real, navigable sticky-bottom nav or genuine status info.

**Section numbering, separators, and dots**

- No section-number eyebrows (`00 / INDEX`, `001 · Capabilities`, `06 · how it works`); name the topic in plain language instead (see Section 8's eyebrow-restraint rule for the mechanical cap).
- No `01 / 4`-style pagination labels on images or bento tiles someone can already count.
- No section-number prefix on a scroll cue, and, separately, no scroll cue at all (`Scroll`, `scroll to explore`, an animated mouse-wheel icon). Someone looking at a hero already knows what scrolling is.
- The middle dot (·) is rationed to at most one per metadata line; do not make it the default separator for everything. Prefer line breaks, hairlines, or columns for anything more complex.
- No decorative colored status dot in front of every nav item, list row, or badge; reserve it for a real semantic state (an actual live or server indicator), used sparingly.

**Fake product previews and version stamps**

- No `<div>`-built fake product UI (fake task list, fake terminal, fake dashboard); see Section 17 for the real alternatives.
- No fake version footers inside a mock screenshot (`v0.6.2-rc.1`, `last sync 4s ago · main`).
- No version footers on an actual marketing page either (`v1.4.2`, `Build 0048`); that is CLI/devtool furniture, not landing-page content.
- No pills or labels overlaid directly on a photo (`Plate · Brand`, `Field notes - journal`); let the image stand alone, or caption it plainly underneath, outside the image.
- No invented photo-credit captions (`Field study no. 12 · Ines Caetano`) unless a real photographer is actually being credited with permission.
- No "Reservation 412 of 800"-style live-stock counters unless the brief is a genuine limited-run waitlist with real numbers behind it.

**Marketing-copy tics**

- No "Quietly in use at" / "Quietly trusted by"; say "Trusted by," "Used at," "Customers include," or skip the header if the logos speak for themselves.
- No performative-craftsman section labels ("Field notes," "Currently on the bench," "Loose plates"); use a plain functional label ("Testimonials," "Latest writing," "Now working on") or none at all.
- No micro-meta commentary sentences floating under an eyebrow, explaining what the section is about in a faux-thoughtful tone; eyebrow (if any) plus headline plus body is already enough.
- No generic numbered step labels ("Stage 1 / Stage 2 / Stage 3," "Phase 01 / Phase 02"); the step's actual verb ("Install," "Configure," "Ship") is the label, do not wrap it in ceremony.
- No locale, time, or weather strips ("LIS 14:23 · 18°C," a city name dropped into the hero or footer) unless the brief is genuinely about a globally distributed team, a travel brand, or a real physical venue; one plain contact address in a footer is fine, an atmospheric locale strip is not.
- No floating top-right sub-text paragraph in a section header with no clear alignment to anything (see the split-header ban in Section 8 for the layout-level version).
- No scoring or progress bars with a filled background track used purely as a comparison visual on a marketing page; that is dashboard furniture. Use a number plus a small icon, or a thin bar with no background track.
- No `border-t` plus `border-b` on every row of a long list or spec table; see Section 18 for the real alternatives.

**External resources**

- No hand-rolled SVG icon paths (Section 5); hand-rolled decorative illustrations are strongly discouraged as a default too, and acceptable only when the brief explicitly asks for one simple geometric mark.
- No broken or generic Unsplash-style links; use a seeded Picsum URL, a generated image, or a real asset (Section 17).
- shadcn/ui components are fine, but never in their default, un-themed state; customize radius, color, shadow, and type to the actual project.

**Text overflow.** Long heading words combined with a large `clamp()` scale and a narrow grid cause overflow on tablet and mobile. Test the actual heading copy at every breakpoint; if it overflows, reduce the clamp max or shorten the copy. The viewport is part of the design, not an afterthought to test later.

**The AI slop test, as a closing gut check.** Run this at two altitudes; the second catches what the first misses.

- **First order**: could someone guess the theme and palette from the category alone (a cookware brief leads to beige and brass, a fintech brief leads to navy and gold)? If yes, that is the first, most obvious training-data reflex; rework the color strategy and the one-sentence physical scene from Section 3 until the answer is not obvious from the category.
- **Second order**: once the first-order guess is avoided, could someone guess the aesthetic family from category-plus-anti-references (an AI workflow tool that avoided SaaS-cream must be editorial-typographic; a fintech that avoided navy-and-gold must be terminal-dark-mode)? That is the trap one layer deeper, avoiding the first reflex only to land in the next-most-common one. Keep reworking until neither guess is obvious.

---

## 20. Redesign Protocol

**Detect the mode first**; misclassifying this is the single biggest source of bad redesign output.

- **Greenfield**: no existing site, or a full overhaul is explicitly approved. Use the dial baseline from Section 3.
- **Preserve**: modernize without breaking the existing brand. Audit first, extract the real tokens, evolve gradually.
- **Overhaul**: a new visual language on top of existing content; treat the visuals as greenfield, but keep the content and information architecture.

If it is ambiguous, ask exactly one question: "Should this preserve the existing brand, or are we starting visually from scratch?"

**Audit before touching anything.** Document, before proposing changes: the brand tokens (colors, type, logo treatment, radii); the information architecture (page tree, primary nav, conversion paths); which content blocks are doing real work versus which are filler; which patterns are worth preserving (a signature interaction, a recognizable hero, the copy voice); which patterns are worth retiring (slop tells, broken layouts, dead links, generic stock photography, performance traps); a rough dial reading of the current site, which is the actual starting point, not the Section 3 baseline; and the SEO baseline (ranking pages, meta titles, structured data, OG cards; SEO migration is the single biggest redesign risk).

**What preservation actually means**: do not change the information architecture unless asked, keeping slugs, anchor IDs, and nav labels stable for both SEO and muscle memory; extract the brand's real colors before applying Section 7's rules, since a brand that is already purple stays purple (the "AI-purple" ban is about the reflexive default, not an existing identity); preserve the copy voice unless a rewrite was explicitly requested; do not regress existing accessibility wins (focus states, alt text, keyboard nav, contrast); do not rename buttons, fields, or section IDs that analytics already depend on.

**Modernization levers, in priority order** (stop once the brief is satisfied): typography refresh (biggest visual lift for the least risk), then spacing and vertical rhythm, then color recalibration (desaturate, unify neutrals, keep the brand accent), then a motion layer added to existing components at the dial-appropriate intensity, then hero and key-section recomposition using the vocabulary in Section 21, and only then full block replacement, when the existing block is genuinely unsalvageable.

**Decision tree**: if the information architecture, content, and SEO are sound, do a targeted evolution (levers one through four above), which captures most of the value at a fraction of the risk. If the visual debt is structural (broken IA, no design system, broken mobile), do a full redesign with strict content preservation. If the brand itself is changing, treat it as greenfield.

**Never change silently, even during an overhaul**: URL structure and route slugs, primary nav labels, form field names or order (breaks analytics and autofill), the logo or wordmark, and existing legal, consent, or cookie copy.

---

## 21. Reference Vocabulary

A shared vocabulary beats a vague adjective; naming a pattern is faster and more precise than describing it from scratch. These are names to recognize and reach for deliberately when the design read calls for them, not defaults to apply everywhere.

**Hero paradigms**: Asymmetric Split Hero (text one side, asset the other, generous whitespace) · Editorial Manifesto Hero (large type, no asset, near-poster) · Video/Media Mask Hero (type cut out as a mask over video) · Kinetic-Type Hero (animated typography as the primary visual) · Curtain-Reveal Hero (parts like a curtain on scroll) · Scroll-Pinned Hero (stays pinned while content scrolls behind it).

**Navigation & menus**: Dock Magnification (icons scale fluidly on hover, macOS-dock style) · Magnetic Button (pulls toward the cursor) · Gooey Menu (sub-items detach like viscous liquid) · Dynamic Island (a morphing pill for status/alerts) · Contextual Radial Menu (expands circularly from the click point) · Floating Speed Dial (a FAB springing into curved secondary actions) · Mega Menu Reveal (full-screen dropdown, staggered content).

**Layout & grids**: Bento Grid (asymmetric tile grouping) · Masonry Layout (staggered grid, no fixed row height) · Chroma Grid (borders/tiles with a subtly animating gradient) · Split-Screen Scroll (two halves sliding in opposite directions) · Sticky-Stack Sections (Section 10.7's canonical pattern).

**Cards & containers**: Parallax Tilt Card (3D tilt tracking the cursor) · Spotlight Border Card (border illuminates under the cursor) · Glassmorphism Panel (frosted glass with inner refraction) · Holographic Foil Card (iridescent shift on hover) · Tinder Swipe Stack (physical card stack, swipe-away) · Morphing Modal (a button expanding into its own dialog).

**Scroll**: Sticky Scroll Stack · Horizontal Scroll Hijack (Section 10.7) · Locomotive/Sequence Scroll (video or 3D sequence tied to the scrollbar) · Zoom Parallax (a central image zooming on scroll) · Scroll Progress Path (an SVG line drawing itself) · Liquid Swipe Transition (a viscous page transition).

**Galleries & media**: Dome Gallery (3D panoramic) · Coverflow Carousel (3D carousel, angled edges) · Drag-to-Pan Grid (boundless draggable canvas) · Accordion Image Slider (narrow strips expanding on hover) · Hover Image Trail (a trail of images following the cursor) · Glitch Effect Image (RGB-channel shift on hover).

**Typography & text**: Kinetic Marquee (endless text bands, reversing on scroll) · Text Mask Reveal (large type as a transparent window onto video) · Text Scramble Effect (matrix-style decode on load/hover) · Circular Text Path (text curving along a spinning circle) · Gradient Stroke Animation (an outlined headline with a running gradient) · Kinetic Typography Grid (letters dodging the cursor).

**Micro-interactions**: Particle Explosion Button (a CTA shattering on success) · Liquid Pull-to-Refresh · Skeleton Shimmer · Directional Hover-Aware Button (fill enters from the cursor's exact side) · Ripple Click Effect · Animated SVG Line Drawing · Mesh Gradient Background · Lens Blur Depth (background blurred to focus the foreground action).

**Choosing an animation library**: Motion (`motion/react`) for UI, bento, and state-change motion by default · GSAP + ScrollTrigger for full-page scrolltelling and hijacks, isolated in dedicated leaf components · Three.js/WebGL for canvas backgrounds and 3D scenes, same isolation rule · never mix GSAP/Three.js with Motion in the same tree (Section 5).

---

## 22. Review Format & Master Pre-Flight Checklist

**Whenever reviewing or critiquing existing UI code, use a Before/After/Why markdown table.** Not a list with "Before:" and "After:" on separate lines; an actual table, one row per issue:

| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Name the exact property; avoid `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing in the real world appears from nothing |
| `ease-in` on a dropdown | `ease-out` or a custom curve | `ease-in` delays the moment being watched most closely |

This format extends to any critique produced by this skill, not just animation review; the same Before/After/Why shape works for a typography, color, or layout pass too.

**Run every box below before calling any UI work done.** If a box cannot be honestly ticked, the work is not finished; fix it first. This merges the checklists from all three source skills, so it is long on purpose; treat it as a final filter, not reading material.

**Brief & setup**

- [ ] Design read stated in one line (Section 1)?
- [ ] Register identified (brand vs product) and the right rule subset applied (Section 2)?
- [ ] All four dials explicit and reasoned from the brief, not silently defaulted (Section 3)?
- [ ] Design system chosen deliberately (Section 4), or the aesthetic honestly labeled as inspiration rather than an official system?
- [ ] If this is a redesign: mode detected and audit performed (Section 20)?

**Typography & color**

- [ ] Body text at least 4.5:1 contrast, large text at least 3:1, including placeholders (Section 7)?
- [ ] One accent color, used identically across every section (color-consistency lock)?
- [ ] If a serif is used, it is not Fraunces or Instrument Serif (or it is, with an explicit brand reason), and it is different from the last project's serif?
- [ ] Body background is not a reflexive cream, sand, or beige (check the OKLCH range in Section 7)?
- [ ] If this is a premium-consumer brief: the palette is not the default beige-brass-oxblood-espresso family, and it is a different family from the last premium-consumer project?
- [ ] Every italic word with a descender (`y g j p q`) has `leading-[1.1]` minimum plus reserved space?
- [ ] Heading copy tested at every breakpoint for overflow?

**Layout (brand register)**

- [ ] One corner-radius system applied consistently (shape-consistency lock)?
- [ ] Hero fits the first viewport: headline at most 2 lines, subtext at most 20 words/4 lines, CTA visible without scrolling, font scale planned jointly with the hero asset?
- [ ] Hero top padding at most `pt-24` at desktop?
- [ ] Hero has at most 4 text elements, no tagline, trust strip, or pricing teaser crammed in?
- [ ] Eyebrow count at most ceil(section count ÷ 3), hero counted as one section?
- [ ] No split-header pattern (big headline plus small floating explainer) used as a section header?
- [ ] No 3+ consecutive sections sharing the same layout family, and no 3+ consecutive image/text-split "zigzag" sections?
- [ ] No two CTAs carrying the same intent anywhere on the page?
- [ ] Bento grids have exactly as many cells as content items, with real visual variation in at least 2-3 cells?
- [ ] "Trusted by" logo wall sits under the hero, not inside it, uses real SVG logos, and carries no category labels?
- [ ] Nav renders on one line at desktop, height at most 80px?

**Interactive states & forms**

- [ ] Every CTA's text is readable against its own background (no white-on-white, no ghost-over-photo without a scrim)?
- [ ] No CTA label wraps to 2+ lines at desktop?
- [ ] Form inputs, placeholders, focus rings, and error text all pass AA contrast against the section background?
- [ ] Loading, empty, and error states all designed, not just the happy path?

**Motion**

- [ ] Every animation answerable in one sentence: hierarchy, storytelling, feedback, or state transition, never "it looked cool"?
- [ ] If `MOTION_INTENSITY > 4`: the page actually moves (motion claimed equals motion shown)?
- [ ] No animation on a keyboard-initiated action?
- [ ] No `ease-in` anywhere in the UI?
- [ ] Standard UI transitions under 300ms; duration matches the Section 10.4 table for its element type?
- [ ] Springs use `bounce: 0` (or an exponential ease-out curve) everywhere except drag-to-dismiss and playful interactions, where 0.1-0.3 is acceptable?
- [ ] At most one marquee on the page?
- [ ] Sticky-stack and horizontal-pan scroll patterns use `start: "top top"` and `pin: true`, not a looser trigger?
- [ ] No `window.addEventListener("scroll", ...)` or scroll-driven React state; Motion's `useScroll`, ScrollTrigger, or `IntersectionObserver` used instead?
- [ ] `prefers-reduced-motion` honored everywhere above `MOTION_INTENSITY` 3, collapsing to static or instant rather than to nothing?
- [ ] Hover animations gated behind `@media (hover: hover) and (pointer: fine)`?

**Component & CSS craft**

- [ ] No entrance animating from `scale(0)`?
- [ ] Popovers use trigger-aware `transform-origin` (modals stay centered)?
- [ ] Anything triggered rapidly (toasts, repeated toggles) uses a transition, not a keyframe?
- [ ] Only `transform` and `opacity` are animated; no `top`/`left`/`width`/`height` animation?
- [ ] Motion's `x`/`y`/`scale` shorthand avoided in favor of the full `transform` string wherever frame drops under load would matter?
- [ ] No CSS custom property updated on a parent every frame (Section 14's inheritance trap)?
- [ ] `useEffect`-based animations have real cleanup functions?
- [ ] Icons all come from one allowed library, no hand-rolled SVG paths?

**Dark mode & accessibility**

- [ ] Dark mode designed and tested, not just light mode?
- [ ] One page-wide theme; no section flips to the opposite mode mid-scroll, apart from one deliberate, well-executed theme-switch device?
- [ ] No pure `#000000`/`#ffffff` anywhere?
- [ ] `min-h-[100dvh]` used instead of `h-screen` for full-height sections?

**Images & content**

- [ ] Real images used (generated, or a seeded placeholder, or an explicitly labeled TODO); no `<div>`-built fake screenshots, no hand-rolled decorative SVGs, no all-text "minimalism"?
- [ ] Every visible string re-read for grammar, unclear referents, and forced-metaphor AI copy?
- [ ] No fake-precise numbers without real data or an explicit mock label?
- [ ] Quotes at most 3 lines, real attribution, no em-dash inside them?
- [ ] Long lists or spec data use a real component (grid, tabs, grouped clusters), not a `<ul>` with a hairline under every row?

**The AI tells sweep (Section 19)**

- [ ] Zero em-dashes anywhere in the visible output: headlines, eyebrows, pills, body, quotes, captions, buttons, alt text?
- [ ] No gradient text, no side-stripe borders, no glassmorphism-as-default, no hero-metric template, no identical three-card grids?
- [ ] No version labels or badges in the hero, no section-number eyebrows, no decorative dots, no locale/time/scroll-cue strips, unless the brief specifically calls for one of these?
- [ ] No Jane-Doe names, no Acme-style brand names, no filler verbs (elevate, seamless, unleash), no generic egg avatars?
- [ ] Passed both the first-order and second-order AI-slop test (Section 19's closing gut check)?

**Ship**

- [ ] Core Web Vitals plausible: LCP under 2.5s, INP under 200ms, CLS under 0.1?
- [ ] One design system used throughout; nothing mixed (Fluent plus shadcn, Material plus Carbon, and so on)?

If every box above is honestly checked, the work is done. If even one is not, that is the next thing to fix, not a footnote.

---

## Appendix A: Design-System Install Commands

```bash
# Material Web (Material 3)
npm install @material/web

# Fluent UI React (v9)
npm install @fluentui/react-components

# Fluent UI Web Components (framework-free)
npm install @fluentui/web-components @fluentui/tokens

# IBM Carbon
npm install @carbon/react @carbon/styles

# Radix Themes
npm install @radix-ui/themes

# shadcn/ui (open code, owned components)
npx shadcn@latest init
npx shadcn@latest add button card badge separator input

# Primer CSS (GitHub product/devtool UI)
npm install --save @primer/css

# Primer Brand (GitHub marketing UI)
npm install @primer/react-brand

# GOV.UK Frontend
npm install govuk-frontend

# USWDS (US Web Design System)
npm install uswds

# Atlassian Design System (Atlaskit)
yarn add @atlaskit/css-reset @atlaskit/tokens @atlaskit/button @atlaskit/badge

# Bootstrap 5.3
npm install bootstrap
```

## Appendix B: Canonical Docs Per Design System

- Material Web: https://material-web.dev/theming/material-theming/ · https://m3.material.io/develop/web
- Fluent UI: https://fluent2.microsoft.design/get-started/develop · https://github.com/microsoft/fluentui
- Carbon: https://carbondesignsystem.com/ · https://carbondesignsystem.com/developing/react-tutorial/overview/
- Shopify Polaris: https://shopify.dev/docs/api/app-home/web-components · https://polaris-react.shopify.com/components
- Atlassian: https://atlassian.design/get-started/develop · https://atlassian.design/tokens/design-tokens
- Primer: https://primer.style/ · https://github.com/primer/brand
- GOV.UK: https://design-system.service.gov.uk/components/button/
- USWDS: https://designsystem.digital.gov/documentation/developers/
- Bootstrap: https://getbootstrap.com/docs/5.3/layout/grid/
- Tailwind: https://tailwindcss.com/docs/dark-mode · https://tailwindcss.com/blog/tailwindcss-v4
- Radix: https://www.radix-ui.com/themes/docs/components/theme
- shadcn/ui: https://ui.shadcn.com/docs
- Native CSS reference: `backdrop-filter`, `prefers-color-scheme`, `prefers-reduced-motion`, CSS Grid, and scroll-driven animations, all on MDN.

## Appendix C: Easing & Motion Resources

- The three custom curves from Section 10.3 (`--ease-out`, `--ease-in-out`, `--ease-drawer`), ready to drop into a stylesheet as CSS variables.
- Further curve variants: [easing.dev](https://easing.dev/), [easings.co](https://easings.co/).
- Emil Kowalski's motion vocabulary and course: [animations.dev](https://animations.dev/), [emilkowal.ski/ui](https://emilkowal.ski/ui).

## Appendix D: "Apple Liquid Glass," Honestly

Apple documents Liquid Glass in its Human Interface Guidelines and developer documentation, for Apple platforms; it is not a public web CSS package, and there is no official `liquid-glass.css`. A web approximation is legitimate as long as it is labeled as one:

```css
.liquid-glass-web-approx {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / .32);
  background:
    linear-gradient(135deg, rgb(255 255 255 / .30), rgb(255 255 255 / .08)),
    rgb(255 255 255 / .12);
  backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .48),
    inset 0 -1px 0 rgb(255 255 255 / .12),
    0 18px 60px rgb(0 0 0 / .18);
}

@media (prefers-color-scheme: dark) {
  .liquid-glass-web-approx {
    border-color: rgb(255 255 255 / .18);
    background:
      linear-gradient(135deg, rgb(255 255 255 / .16), rgb(255 255 255 / .04)),
      rgb(15 23 42 / .42);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-web-approx {
    background: rgb(255 255 255 / .96);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

`prefers-reduced-transparency` has uneven browser support; test it directly, and make sure contrast holds even with the blur disabled.

---

## Sources

This skill is a synthesis, not a transcription, of three public skill files:

- [emil-design-eng](https://emilkowal.ski/skill): Emil Kowalski's design-engineering and motion philosophy.
- [Taste Skill / design-taste-frontend](https://www.tasteskill.dev/): the anti-slop frontend framework by Leon Lin (@lexnlin) and blueemi.
- [Impeccable](https://impeccable.style/): the design vocabulary and slop detector by Paul Bakaus (@pbakaus).

Where the sources agreed, this kept the sharper version of the rule. Where they genuinely differed (springs and bounce, register scope, palette bans), it is reconciled explicitly in the relevant section rather than silently picking one.