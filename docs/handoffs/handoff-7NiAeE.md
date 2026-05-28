# Handoff: Landing + Booking Demo

## Current Objective

Continue building a commercial functional demo for a Venezuelan influencer: public landing page plus an operational booking/pre-reservation system for courses and theatrical events.

The user wants the demo inside this repo:

`/home/angeldaj/Projects/curso-nacional`

## Existing Artifacts

Primary design spec:

`docs/superpowers/specs/2026-05-28-landing-booking-demo-design.md`

Environment example already created:

`.env.example`

Do not duplicate the spec. Treat it as the source of truth for product scope, routes, roles, data model, reservation states, payment assumptions, uploads, and out-of-scope items.

## Repo State

The repo is a minimal Next app:

- Next.js 16.2.6
- React 19.2.4
- Tailwind CSS 4
- TypeScript
- App Router

Important files observed:

- `app/page.tsx`: default create-next-app page.
- `app/layout.tsx`: default layout using Geist fonts.
- `app/globals.css`: default Tailwind/global styles.
- `package.json`: only base Next dependencies currently.

Git note:

- `.git` exists but is empty.
- `git status --short` fails with `fatal: not a git repository`.
- Do not assume commits are possible until Git is initialized or repaired.

## Key Decisions Already Made

- Use Prisma ORM with real Prisma Postgres, not SQLite.
- Use real DB from the start.
- Use local filesystem uploads for demo.
- Use simple real admin login with seeded users.
- Roles: `ADMIN` and `OPERATOR` only.
- Public users do not log in.
- Pre-reservation flow with manual payment confirmation.
- Payment methods/currencies: Bs and USDT.
- Price base is USD; Bs uses a manually configured global exchange rate.
- WhatsApp prefilled only; no email, no WhatsApp API.
- Include minimal operational notices in checkout/confirmation.
- No scraping. All demo content is manually curated.
- Use real logo, real palette, one real influencer photo, placeholders for other images.

## Immediate Next Step

Move from design to implementation planning, then implementation.

Likely implementation sequence:

1. Install dependencies: Prisma, Prisma Client, validation/auth helpers, icons if desired.
2. Add Prisma schema for the approved model.
3. Configure Prisma Postgres env handling.
4. Add seed script for users, payment methods, exchange rate, and sample events.
5. Build domain libs: db, auth, permissions, pricing, reservations, uploads.
6. Build public pages and reservation flow.
7. Build admin login/dashboard/events/reservations/configuration.
8. Run migration/seed/build/lint and manual flow verification.

## Required Inputs From User

Before database work can run against the real Prisma Postgres instance:

- Real `DATABASE_URL`.
- Real `DIRECT_URL` if Prisma provides one.
- `AUTH_SECRET`.

Before visual polish can be final:

- Logo file.
- Palette values.
- One real influencer photo.
- Demo-safe brand/name/content.

## Suggested Skills For Next Session

- `brainstorming`: only if scope changes or new product decisions appear.
- `vercel-react-best-practices`: when implementing/refactoring React and Next.js code.
- `frontend-design`, `design-taste-frontend`, or `impeccable`: when building the public landing/admin UI.
- `shadcn`: only if the project adopts shadcn/ui or `components.json` is introduced.
- `diagnose`: if Prisma/Postgres, auth, uploads, or build issues appear.

## Constraints To Preserve

- Keep the app Spanish-only.
- Keep demo functional but not production-hardened.
- Avoid adding CMS, online payment processing, email, marketing tracking, seat maps, dynamic user management, audit history, or external storage unless the user changes scope.
- Follow the existing design spec instead of reopening decisions already closed in the grill-me session.
