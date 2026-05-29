# Handoff — Curso Nacional MVP

## Objective

Demo funcional para Curso Nacional: una marca venezolana de **formación
en emprendimiento** (cursos por WhatsApp, talleres presenciales en
Caracas, serie de economía, documental, guías impresas). El demo incluye
landing pública con flow de pre-inscripción y un panel admin para
operación.

Repo path: `C:\Users\angel\Project\curso-nacional`

## Status — Built

- **Public site** (`app/(public)/`)
  - Landing con secciones I–IX (hero, marquee, cartelera, serie de
    economía, presenciales/online, documental, guías, bio, testimonios,
    FAQ, CTA final).
  - `/eventos` lista (Cursos presenciales / Online por WhatsApp).
  - `/eventos/[slug]` detalle con form de pre-inscripción.
  - `/reservas` lookup por código.
  - `/reservas/[codigo]` estado, countdown, instrucciones de pago,
    upload de comprobante, deep-link WhatsApp prefilled (con cantidad +
    variant).
- **Admin** (`app/admin/(authed)/`, `app/admin/login/`)
  - Login con cookie HMAC firmada (seeded users only, sin OAuth).
  - Sidebar con `motion.layoutId` pill activa + `useLinkStatus` pending
    spinner.
  - Dashboard con 8 stat cards + tabla últimas inscripciones.
  - `/admin/reservas` con **tabs Cursos/Obras + sub-tabs por evento
    activo**, filtro por estado, búsqueda código/nombre/whatsapp.
  - `/admin/reservas/[id]` detalle con actions: confirm / reject /
    cancel (ADMIN+OPERATOR), extend (ADMIN).
  - `/admin/eventos` listado con conteo de fechas/inscritos.
  - `/admin/eventos/[id]` editor: datos + fechas + tarifas +
    **uploader de imagen** (preview, drag/quitar). `id="nuevo"` crea.
  - `/admin/configuracion` (ADMIN only): tasa Bs./USD + historial +
    métodos de pago BS/USDT.
- **Animaciones (Emil)**
  - Reveal/Stagger via Motion para hero, secciones y cards.
  - CSS keyframes para shimmer (skeletons), spin (spinners),
    slide-down-in (toasts), row-in/card-in (tablas/cards admin).
  - Loading skeletons en cada ruta admin.
  - `prefers-reduced-motion` respetado.
- **Domain logic** (`src/lib/`)
  - `reservations.ts`: createReservation, expireStale, confirm/reject/
    cancel, extendExpiration. Overbooking bloqueado por defecto.
  - `pricing.ts`: USD lineal, conversión a Bs con tasa activa.
  - `uploads.ts`: validación jpg/png/webp/pdf, max 8MB, `public/uploads/
    {events,receipts}/`.
  - `auth.ts`: HMAC cookie session, `getCurrentUser` memoizado con
    `React.cache()`.
  - `public-data.ts`: queries con fallback `safe()`, `available` por
    occurrence incluyendo PENDING+REVIEW+CONFIRMED como blocking.
  - `admin-data.ts`: queries admin.
- **Server actions** (`src/actions/`, `src/actions/admin/`).
- **Cache Next 16**:
  - `next.config.ts` `staleTimes.dynamic = 30, static = 180`.
  - `getCurrentUser` envuelto en `React.cache()` (dedup por request).

## Decisions Locked

- **Brand:** "Curso Nacional" (no Casa Nacional). Tagline "Mi futuro
  es hoy."
- **Tipografía:** Bricolage Grotesque (display), Geist Sans (body),
  Fraunces italic (flourish puntual).
- **Paleta:** `--brand: #d2a02b` (mostaza), `--brand-deep: #9a741a`,
  `--ink: #0b0b0b`, `--paper: #f7f4ec`. **No usar `red` como nombre
  de variable** — colisiona con Tailwind v4 default scale; usar `brand`.
- **Logo:** SVG inline (`src/components/logo.tsx`) — círculo mustard
  con "CURSO/NACIONAL" en dos líneas. Tamaños xs..xxl.
- **Roles:** `ADMIN` (full) + `OPERATOR` (sin config, sin edit eventos,
  sin extend, sin overbook).
- **Cantidad por reserva:** misma variant, qty 1..10. Sin descuento por
  cantidad (lineal puro). Atómica (todo-o-nada, no edit parcial).
- **Cupos en UI:** form muestra `8 cupos` o `agotada` por fecha;
  fechas con `available === 0` quedan `disabled` en el `<select>`.
- **Pagos:** Bs. (tasa manual global) + USDT (TRC-20). Sin pagos
  online.
- **Eventos no se borran** — solo se archivan (`status = ARCHIVED`).
- **Occurrences/variants** no se pueden borrar si tienen
  `ReservationItem` asociado.

## Out of Scope (NOT building)

Por decisión del usuario o spec original:
- **Override de overbooking** (ADMIN no puede pasar por encima del
  bloqueo). Explícitamente descartado.
- Pagos online, WhatsApp Business API, email transaccional, CMS para
  landing, multi-idioma, audit history, dynamic user management,
  external storage, backups, deploy.

## Pending for MVP

### Must-do antes de demo en vivo

1. **Crear inscripción manual desde admin** — registrar pago por otro
   canal (presencial, transferencia directa) sin pasar por el form
   público. Toca:
   - Server action `createReservationManualAction(formData)` en
     `src/actions/admin/reservations.ts` que llama
     `createReservation` con datos del admin (puede saltarse expiración
     o forzar `PAYMENT_REVIEW`/`CONFIRMED` directo).
   - Página `/admin/reservas/nuevo` (o modal desde
     `/admin/reservas`) con form de evento + ocurrencia + variant +
     buyer + monto + opcional comprobante.
   - **No incluir override de cupos** (decisión del usuario).
2. **Verificación E2E manual** del flow completo. Ya hay DB real
   conectada (`DATABASE_URL` Prisma Postgres pooled). Falta:
   - Confirmar que `pnpm prisma migrate dev` y `pnpm db:seed` se
     corrieron contra la DB real.
   - Probar: reservar público → upload comprobante → admin confirma →
     estado refleja → countdown vence → expira → segundo intento.

### Pendientes operativos del usuario (assets reales)

3. **Foto real de la influencer** para hero de landing (`app/(public)/
   page.tsx` `<Hero>` — hoy hay placeholder con "CN" gigante y gradient).
4. **Foto real de la sección bio** (`<BioSection>` — placeholder
   aspect-4/5 con stamp).
5. **Fotos de las 3 guías impresas** para reemplazar los
   `<GuideCover>` placeholders (covers stylized con Vol. 01/02/03).
6. **Número de WhatsApp real** — hoy hardcoded `+58 414-000-0000` en
   varios sitios (`Hero`, `Documental`, `GuidesSection`, `FinalCta`,
   `SiteFooter`, `/reservas/[codigo]`). Centralizar en una constante
   `src/lib/contact.ts` o pasar a env var.
7. **Datos de pago demo-safe** o reales según se decida
   (`PaymentMethod.instructions` en seed.ts y/o desde `/admin/
   configuracion`).

### Nice-to-have (fuera de scope mínimo, ordenados por impacto)

8. **Páginas `not-found.tsx` + `error.tsx`** estilizadas con el shell
   público.
9. **Modal de confirmación** antes de cancelar/rechazar en admin
   (hoy un clic ejecuta — riesgo bajo de error humano pero existe).
10. **Búsqueda en `/admin/eventos`** (hoy solo tabla simple).
11. **Toast global Sonner** en vez de mensajes inline con `toast-in`
    (UX más limpia, mensaje sobrevive a navegación).
12. **Badge "nuevas inscripciones"** en sidebar (count
    PENDING_PAYMENT + PAYMENT_REVIEW como dot rojo en nav item).
13. **Export CSV** de inscripciones filtradas.
14. **Logo en favicon** + open-graph image.

## Tech Stack Reference

- **Next.js 16.2.6** (Turbopack, App Router) + **React 19.2.4**
- **Tailwind v4** + `@tailwindcss/postcss`
- **Prisma 6.19** + Prisma Postgres
- **Auth**: bcryptjs + HMAC cookie (`src/lib/auth.ts`)
- **Validation**: zod 4
- **Animations**: motion 12.40
- **Scripts**: tsx (para `prisma/seed.ts`)
- **pnpm 11** workspace con `allowBuilds` para
  `@prisma/{client,engines}`, `prisma`, `esbuild`.

## Key Files

- `app/layout.tsx` — root neutral con fonts.
- `app/(public)/layout.tsx` — adds `SiteHeader` + `SiteFooter`.
- `app/admin/layout.tsx` — pass-through.
- `app/admin/(authed)/layout.tsx` — auth guard + sidebar shell.
- `prisma/schema.prisma` — User, Event, EventOccurrence, PriceVariant,
  Reservation, ReservationItem, PaymentMethod, ExchangeRate,
  UploadedFile, ReservationCounter.
- `prisma/seed.ts` — admin+operator users, BS+USDT payment methods,
  rate 36.5, 3 sample events (Caracas Alibaba/Binance/Shein, Serie
  economía, Curso exportación).
- `CLAUDE.md` — convenciones y regla "no tsc/build al cerrar task".
- `.env` — `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
  `SEED_ADMIN_EMAIL/PASSWORD`, `SEED_OPERATOR_EMAIL/PASSWORD`.

## Suggested Skills For Next Session

- `frontend-design` / `emil-design-eng` — para polish UI.
- `copywriting` — si entra contenido real distinto al placeholder.
- `simplify` — antes de cerrar MVP, una pasada de revisión de código
  acumulado.
- `security-review` — antes de cualquier deploy.

## Verification Commands

```bash
pnpm dev                                 # dev (Turbopack)
pnpm prisma migrate dev                  # primera vez contra DB real
pnpm db:seed                             # seed inicial
pnpm prisma studio                       # inspección manual DB
```

No correr `pnpm exec tsc --noEmit` ni `pnpm build` al cierre de cada
task — preferencia del usuario codificada en `CLAUDE.md`.
