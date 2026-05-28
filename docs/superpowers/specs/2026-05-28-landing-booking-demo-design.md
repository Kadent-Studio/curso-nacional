# Landing + Booking Demo Design

## Context

This project is a commercial functional demo for a Venezuelan influencer who sells courses and theatrical events. The goal is to present a renewed public landing page plus an operational booking system, not a production-hardened platform.

The existing repo is a minimal Next.js app. The demo will live inside this repo and use a real Prisma Postgres database.

## Product Direction

The public experience should mix editorial/theatrical presence with direct conversion. It uses the real logo, real palette, one real influencer photo, and placeholder imagery for the rest. The site is Spanish-only, mobile-first, and polished on desktop.

The admin experience should be sober and operational, with small brand accents. It should prioritize fast review of reservations, clear filters, and reliable event management.

## Technical Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Prisma ORM
- Prisma Postgres
- Server actions and route handlers for mutations/uploads
- Local filesystem uploads for demo files
- Simple cookie-based admin session

Prisma Postgres will use a real cloud database. `DATABASE_URL` is required for application traffic. `DIRECT_URL` should be provided when available for migrations and admin tooling, following Prisma's pooled/direct connection guidance.

## Route Structure

Public routes:

- `/`
- `/eventos`
- `/eventos/[slug]`
- `/reservas/[codigo]`

Admin routes:

- `/admin/login`
- `/admin`
- `/admin/eventos`
- `/admin/eventos/[id]`
- `/admin/reservas`
- `/admin/configuracion`

## Code Organization

The app should separate domain logic from pages:

- `src/lib/db.ts`: Prisma client.
- `src/lib/auth.ts`: password verification, session cookie, current user lookup.
- `src/lib/permissions.ts`: role checks.
- `src/lib/reservations.ts`: inventory, expiration, state transitions, overbooking rules.
- `src/lib/pricing.ts`: USD, Bs, and USDT calculations.
- `src/lib/uploads.ts`: file validation and local storage.
- `src/lib/format.ts`: currency, dates, reservation codes.

UI can be split into public and admin components once page complexity justifies it.

## Data Model

Core models:

- `User`: fixed seed users for `ADMIN` and `OPERATOR`.
- `Event`: event content, slug, type, modality, status, location, image, reservation expiration.
- `EventOccurrence`: date/function, capacity, status.
- `PriceVariant`: variant name, USD price, optional capacity, ordering, active status.
- `Reservation`: human code, buyer data, status, payment method/currency, calculated amounts, expiration, receipt, internal note.
- `ReservationItem`: occurrence, price variant, quantity.
- `PaymentMethod`: global payment instructions for Bs and USDT.
- `ExchangeRate`: manually managed Bs/USD rate.
- `UploadedFile`: local file metadata for event images and receipts.

Reservation codes are sequential and human-readable, e.g. `CN-000001`.

## Reservation Rules

Statuses:

- `PENDING_PAYMENT`
- `PAYMENT_REVIEW`
- `CONFIRMED`
- `REJECTED`
- `EXPIRED`
- `CANCELLED`

Inventory behavior:

- `PENDING_PAYMENT` blocks seats until `expiresAt`.
- `PAYMENT_REVIEW` keeps seats blocked.
- `CONFIRMED` consumes final capacity.
- `REJECTED`, `EXPIRED`, and `CANCELLED` do not consume capacity.
- Expiration is computed automatically by the system when reading or operating on reservations.
- Expired reservations cannot be renewed. The user must create a new reservation.
- Overbooking is blocked by default and can only be overridden by `ADMIN`.

Default expiration:

- Theatrical ticket/event: 20 minutes.
- Course: 24 hours.
- The value remains configurable per event.

## Public Flow

The landing page includes:

- Hero with brand/person name, logo, influencer photo, value copy, and CTA.
- Immediate preview of upcoming events.
- Featured courses/events.
- Authority/bio section.
- Testimonials or social proof.
- FAQ.
- Final CTA.

Reservation flow:

1. User opens an event detail page.
2. User selects occurrence, price variant, quantity, and payment method/currency.
3. System calculates amount.
4. User enters buyer data.
5. System creates pending reservation and blocks capacity.
6. User sees code, countdown, payment instructions, WhatsApp prefilled CTA, and receipt upload.
7. User can revisit `/reservas/[codigo]` to check status and upload/view receipt.

Buyer data:

- First name
- Last name
- WhatsApp
- Quantity
- Variant
- Optional note

Checkout and confirmation include minimal operational notices about temporary reservation, payment validation, and automatic expiration.

## Pricing And Payments

There is no online payment processing in the demo.

Supported methods/currencies:

- Bs
- USDT

Events store a base USD price. The user chooses payment method/currency:

- USDT uses the USD amount.
- Bs uses the current manually configured Bs/USD rate.

The reservation stores the calculated amount at creation time so later exchange-rate changes do not alter existing reservations.

Payment/contact data in the demo is fictitious.

WhatsApp is prefilled for support/closure only. No email, WhatsApp Business API, Meta Pixel, Google Analytics, or UTM capture is included in the MVP.

## Uploads

Uploads are real and local for the demo:

- Event images: `public/uploads/events`
- Receipts: `public/uploads/receipts`

Accepted receipt formats:

- `jpg`
- `png`
- `webp`
- `pdf`

The admin detail view should preview images directly and link or embed PDFs.

## Admin Experience

Authentication:

- Real simple login.
- Seeded users only.
- No OAuth.
- No dynamic user management in the demo.

Roles:

- `ADMIN`: full access.
- `OPERATOR`: can view events, reservations, and receipts; can confirm, reject, or cancel reservations.

Admin-only capabilities:

- Create/edit/archive events.
- Edit event dates, variants, prices, capacities, status, and images.
- Configure exchange rate.
- Configure payment methods.
- Extend reservation expiration.
- Override overbooking.

Operator restrictions:

- Cannot edit events.
- Cannot edit prices or capacity.
- Cannot edit exchange rate or payment methods.
- Cannot extend expiration.
- Cannot overbook.

Dashboard:

- Pending payment count.
- Payment review count.
- Confirmed count.
- Expired count.
- Estimated revenue.
- Active events.

Event reservation management:

- Event list/tabs/accordion.
- Select event to view reservation table.
- Filter by status.
- Search by code, buyer name, or WhatsApp.
- Reservation detail with buyer data, event data, payment data, countdown/expiration, receipt preview/link, internal note, and state actions.

No real deletion:

- Events are archived.
- Reservations are cancelled or expired.

## Seeds

Seed data should include:

- One `ADMIN` user.
- One `OPERATOR` user.
- Two or three curated events.
- At least one course-like event and one theatrical event.
- Price variants.
- Occurrences.
- Global Bs/USD exchange rate.
- Fictitious Bs and USDT payment methods.

## Verification

Implementation should be verified with:

- `pnpm lint`
- `pnpm build`
- Prisma migration against the real Prisma Postgres database.
- Prisma seed.
- Manual flow test:
  - landing
  - event detail
  - reservation creation
  - receipt upload
  - reservation lookup
  - admin login
  - event reservation filtering
  - payment confirmation

## Out Of Scope

- Online payment processing.
- WhatsApp Business API.
- Transactional email.
- Scraping or automatic migration from the current website.
- CMS for general landing content.
- Seat maps or numbered seating.
- Multi-language support.
- Marketing tracking.
- Dynamic user management.
- Audit history.
- Production hardening.
- External file storage.
- Backups and deployment operations.

## Open Implementation Inputs

Before implementation starts, the project needs:

- Prisma Postgres `DATABASE_URL`.
- Prisma Postgres `DIRECT_URL` if available.
- Real logo file.
- Real palette values.
- One real influencer photo.
- Demo-safe brand/name/content.
