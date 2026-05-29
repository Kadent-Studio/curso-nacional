# Curso Nacional — Project Guidance

## Workflow Rules

- **Never run `pnpm exec tsc --noEmit` or `pnpm build` at task end.** Dev server (HMR) catches errors fast enough. Skip both unless the user explicitly asks.
- Lint (`pnpm lint`) is OK to skip too unless explicitly asked.
- Trust the dev server for verification.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, Tailwind v4
- Prisma v6 + Prisma Postgres (DB connection placeholder until provided)
- Motion (formerly framer-motion) for animations
- Geist Sans (body), Bricolage Grotesque (display), Fraunces italic (flourish)
- pnpm workspace, `allowBuilds` for prisma/esbuild

## Conventions

- Tailwind v4 custom colors must avoid default scale names (`red`, `blue`, etc.) — use `brand`, `paper`, `ink`, `gold`, `mute`.
- Server actions live in `src/actions/`.
- DB queries wrapped in `safe()` fallbacks in `src/lib/public-data.ts` so UI renders without a real DB.
- Pages that touch Prisma get `export const dynamic = "force-dynamic"`.

## Brand Direction

- "Aula nacional / manifesto contemporáneo" — emprendimiento + voz directa, guiño editorial-teatral mínimo.
- Voz: motivacional, directa, venezolana. Tagline base: "Mi futuro es hoy."
- Public site is Spanish-only.
