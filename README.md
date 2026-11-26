# Clinicly

Multi-tenant appointment booking SaaS for small clinics, barbershops and physio studios. Each business gets its own workspace (`acme.clinicly.app`), staff manage schedules, services and clients, and clients book through a public page.

## Plans
- **Free** — 1 staff member, 50 bookings/month, Clinicly branding
- **Pro** — unlimited staff and bookings, SMS/email reminders, custom branding, CSV export

## Roles
- **Owner** — billing, invites
- **Admin** — services, staff
- **Staff** — own calendar only
- **Visitor** — unauthenticated public booking page

## Stack
Next.js · TypeScript · Supabase (Postgres + RLS) · Drizzle ORM · Better Auth · Stripe · Zustand · pnpm

## Architecture
`database → drizzle → services → usecases → api routes → zustand stores → composables (hooks) → components / pages`
