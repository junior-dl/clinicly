# Clinicly

Multi-tenant appointment booking SaaS for small clinics, barbershops and physio studios. Each business gets its own workspace (`acme.clinicly.app`); staff manage schedules, services and clients, and clients book through a public page.

## Plans
| | Free | Pro |
|---|---|---|
| Staff | 1 | Unlimited |
| Bookings | 50 / month | Unlimited |
| Reminders (SMS/email) | — | ✓ |
| Custom branding | — (Clinicly branding) | ✓ |
| CSV export | — | ✓ |

Limits live in `src/server/lib/plans.ts` and are enforced in usecases (booking cap, seat cap, branding). Hitting one returns HTTP `402 PLAN_LIMIT`.

## Roles
| Role | Can |
|---|---|
| **Owner** | Everything, plus billing and invites |
| **Admin** | Manage services and staff, see every calendar |
| **Staff** | Only their own calendar and their own clients |
| **Visitor** | Unauthenticated: see active services and staff, create a booking. Nothing else |

## Stack
Next.js 16 (App Router) · TypeScript · Neon Postgres · Drizzle ORM · Better Auth · Stripe · Zustand · Tailwind 4 · pnpm

## Architecture
```
Neon Postgres (RLS) → Drizzle → services → usecases → API route handlers → Zustand stores → composables (hooks) → components / pages
```
| Layer | Path | Responsibility |
|---|---|---|
| DB | `src/server/db/` | Schema, Neon pools, `withTenant()` |
| Services | `src/server/services/*.service.ts` | Queries only, no business rules |
| Usecases | `src/server/usecases/*.usecase.ts` | Validation (zod), plan limits, booking rules, orchestration |
| API | `src/app/api/**/route.ts` | Auth/role guard → one usecase per handler |
| Stores | `src/stores/*.store.ts` | Zustand state + API calls |
| Composables | `src/composables/use-*.ts` | Reusable hooks over stores |
| UI | `src/components/`, `src/app/**/page.tsx` | Components and pages |

## Tenant isolation
Isolation is enforced by **Postgres row-level security**, not just `WHERE` clauses:

- The app queries as a restricted `clinicly_app` role (no `BYPASSRLS`).
- `withTenant(ctx, fn)` opens a transaction and sets `app.workspace_id`, `app.role` and `app.member_id` with `set_config(..., true)`, so the values are transaction-scoped and never leak across pooled connections.
- Policies in `drizzle/0001_rls.sql` read those settings. Clinic A can't see Clinic B, staff only see their own appointments and clients, and visitors can insert but not read.
- Plan-limit and double-booking checks use two small `SECURITY DEFINER` functions, so they count correctly even for callers who can't see every row.
- The table owner connection (`dbAdmin`) is used only where no tenant exists yet: auth, signup, invite acceptance and Stripe webhooks.

## Billing
- `POST /api/w/:slug/billing/checkout` creates a Stripe Checkout subscription session (Owner only).
- `POST /api/stripe/webhook` verifies the signature against the raw body, dedupes on `event.id` (`stripe_event` table), and syncs `plan` from `customer.subscription.*` events.
- `POST /api/w/:slug/billing/portal` opens the Stripe customer portal.

## Setup
```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm db:migrate              # runs drizzle/ migrations against DATABASE_URL
pnpm dev
```

**Database setup (Neon):** after migrating, give the app role a password and use it for `DATABASE_URL_APP`:
```sql
ALTER ROLE clinicly_app WITH LOGIN PASSWORD '...';
```

**Stripe (test mode):** create a recurring Pro price, then set `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID` and run
`stripe listen --forward-to localhost:3000/api/stripe/webhook` to get `STRIPE_WEBHOOK_SECRET`.

**Subdomains:** `src/proxy.ts` rewrites `acme.clinicly.app/` to `/book/acme`. Locally, use `/book/<slug>`.

## Roadmap
- [ ] Availability hours per staff + slot picker
- [ ] SMS/email reminders (Pro) via a scheduled job
- [ ] CSV export (Pro)
- [ ] Integration tests for RLS policies per role
