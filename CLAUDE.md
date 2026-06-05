# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Notkode's official marketing site — a Next.js 15 App Router app (TypeScript, Tailwind, next-intl). Bilingual (PT default / EN), lead-generation focused: most pages funnel visitors into interactive multi-step forms that produce a price estimate or qualification and POST to a single lead-intake API.

> **Note:** `README.md` is in Portuguese and is partly stale (it describes an older dark/cyan theme with Sora/Acumin fonts). The design has since been redesigned to a warm-cream light theme with a blue primary and DM Sans / Parabole / JetBrains Mono fonts. Trust `tailwind.config.ts` + `src/app/globals.css` over the README for anything visual.

## Commands

```bash
pnpm install        # pnpm is the package manager (pnpm-lock.yaml is committed)
pnpm dev            # dev server at http://localhost:3000
pnpm build          # production build
pnpm start          # serve the production build
pnpm typecheck      # tsc --noEmit (strict mode)
pnpm lint           # next lint (eslint, next/core-web-vitals)
```

There is no test suite. Validate changes with `pnpm typecheck` and `pnpm lint`. `_legacy`, `_design-system`, and `_brand-manual` are excluded from the TypeScript program (`tsconfig.json`) and are reference-only — don't edit them expecting them to ship.

The `scripts/*.mjs` files are one-off asset generators (Freepik/Magnific image gen) run manually with API keys; they are not part of the build.

## Architecture

### Routing & i18n — `src/i18n/routing.ts` is the source of truth

`routing.ts` defines locales (`pt`, `en`, default `pt`), `localePrefix: 'always'` (every URL is prefixed, e.g. `/pt/...`, `/en/...`), and the **localized pathname map**. Slugs differ per locale, e.g. `/sistemas-ia` (pt) ⇄ `/ai-systems` (en), `/sobre` ⇄ `/about`. `src/middleware.ts` wires next-intl middleware for all non-`/api`, non-asset routes.

- `src/i18n/request.ts` loads `messages/{locale}.json` per request.
- All pages live under `src/app/[locale]/`. `src/app/[locale]/layout.tsx` calls `setRequestLocale`, wraps children in `NextIntlClientProvider`, and renders `Header`/`Footer`. It also `generateStaticParams` for both locales.
- **Always navigate with the typed helpers from `routing.ts`** (`Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`) — not `next/link` — so localized pathnames resolve correctly.
- Copy lives in `messages/pt.json` and `messages/en.json`, accessed via `useTranslations('Namespace')` (client) or `getTranslations` (server). **Edit both files in parallel** — a missing key in one locale throws at render.

To add a route: (1) add the slug to `pathnames` in `routing.ts`, (2) create `src/app/[locale]/<slug>/page.tsx`, (3) add its namespace to both message files.

### The lead pipeline (the most important cross-file flow)

Every form on the site funnels into one endpoint. Trace it through these files:

1. **Forms** (client components) collect input and `POST` JSON to `/api/lead`. Two distinct payload shapes exist (see below).
2. **`src/app/api/lead/route.ts`** — the only API route. It:
   - `normalize()`s either payload shape into a single flat `NormalizedLead`.
   - Inserts into the Supabase `leads` table via `getSupabaseAdmin()`.
   - Sends two emails through Resend: an **internal** notification (to Notkode) and a **visual proposal** copy to the lead.
   - Every step is **best-effort / fire-and-forget**: Supabase or email failures are logged but don't fail the request unless *both* persistence and notification fail. Forms don't depend on the response.
3. **`src/lib/supabase-admin.ts`** — server-only, lazily-cached client using the `service_role` key. Never import from a client component.
4. **`src/lib/lead-email.ts`** — builds the internal + lead HTML/text emails.
5. **`src/lib/lead-schemas.ts`** — a registry mapping `serviceTag` → `PricingSchema`, used server-side to render the proposal's scope/timeline/title in the email from the stored selection.

### Two form systems — pick the right base component

Both live in `src/components/ui/` and render a multi-step wizard ending in a contact-capture step, but they serve different goals:

- **`pricing-form.tsx` (`PricingForm`)** — schema-driven price estimator. Given a `PricingSchema`, it renders the steps, computes a live `[min, max]` BRL range via `schema.calc(selection)`, shows a "report" reveal screen (scope `inclusions`, `timeline`, `reportTitle`), captures contact info, POSTs, and offers a prefilled WhatsApp deep link. **All per-service logic is data, not code** — see `PricingSchema` in this file for the full shape.
- **`qualification-form.tsx` (`QualificationForm`)** — needs/timing/identity qualifier for services without a clean price formula (e.g. `parcerias`, `sistemas-ia`). Sends the `{ kind: 'qualification', ... }` payload variant.

**Each service that uses pricing has its own `pricing-schema.ts`** colocated in its component folder (`src/components/{ecommerce,sites,brandbook,agentes-automacao}/pricing-schema.ts`). A schema defines `fields` (single/multi-select steps), `calc` (returns `[min,max]`), and optional `inclusions`/`timeline`/`reportTitle`/`copy`.

To add a new priced service: create `pricing-schema.ts` in the component folder, then register it in **both** the page (passing the schema to `<PricingForm>`) and in `src/lib/lead-schemas.ts`'s `REGISTRY` (so the email can reconstruct the proposal). The `serviceTag` string is the join key across the form, the DB row, and the email.

### Components & data

- `src/components/` is organized by **page/feature folder** (`home/`, `sistemas-ia/`, `cases/`, `sobre/`, etc.) plus shared `ui/`, `brand/` (Logo, CarinhaFloat mascot), and `layout/` (Header, Footer, language toggle, menus).
- Many heavy/animated sections have a `*-lazy.tsx` wrapper that `next/dynamic`-imports the real component — preserve this pattern when adding below-the-fold or client-heavy sections.
- **`src/data/cases.ts`** is the single source for portfolio cases, consumed by both `/cases` (grid) and `/cases/[slug]` (detail). `CaseItem.pending: true` marks cases whose full content isn't collected yet.
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — the standard class-merge helper.
- SEO: `src/app/robots.ts`, `src/app/sitemap.ts`, and `generateMetadata` per layout/page (`Meta` namespace in messages).

### Styling & design tokens

Tailwind 3 with a custom token system. **The active theme is a warm-cream light theme** (`--surface-base: 55 100% 97%` ≈ `#fffef2`, warm-dark text), defined as CSS variables in `src/app/globals.css` and surfaced through Tailwind in `tailwind.config.ts`.

- **Primary = `#3B82F6` (blue)**, `primary-soft = #93C5FD`. (Folder/token names like `cyan.*` are a legacy ramp that now holds blue values — don't assume cyan from the name.)
- Semantic color tokens consume CSS vars: `surface-{base,elevated,glass}`, `border-{subtle,strong}`, `text-{primary,secondary,muted,dim}`. Prefer these over hard-coded colors.
- Fonts: `font-sans`/`font-dm` → **DM Sans** (body), `font-bricolage` → **Parabole** (display, local `public/fonts/Parabole.woff2`), `font-mono`/`font-label` → **JetBrains Mono** (eyebrows, meta, mono labels). DM Sans + JetBrains Mono load via Google Fonts `@import` in `globals.css`.
- Custom animations are defined in `tailwind.config.ts` (`animate-float-soft`, `animate-glow-pulse`, `animate-marquee`, etc.); some form-specific keyframes (`pf-slide-*`, `priceReveal`) live in `globals.css`.

## Conventions

- **Path alias `@/*` → `src/*`** (tsconfig). Use it for all internal imports.
- **Server Components by default.** Add `'use client'` only for interactivity (forms, animations, anything using hooks). Form components and most `*-visual`/`*-background` components are client.
- TypeScript is `strict`. React 19 / Next 15: `params` in pages/layouts is a `Promise` — `await` it.
- Server-only modules (Supabase admin, lead email, anything reading `SUPABASE_SERVICE_ROLE_KEY`/`RESEND_*`) must never be imported into client components.

## Environment variables

Used by the lead pipeline (set in `.env.local`, which is gitignored):

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase insert into the `leads` table.
- `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL` — Resend email delivery. If any is missing, emails are skipped (logged) but the request still succeeds.

`next.config.mjs` allows remote images from `media.licdn.com` and `cdn.weweb.io`; add new hostnames there before using `next/image` with external URLs.
