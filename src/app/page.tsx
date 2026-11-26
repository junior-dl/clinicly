import Link from "next/link";

const STEPS = [
  { title: "Create your workspace", body: "Pick a name and a booking address like smile-dental.clinicly.app. Takes a minute." },
  { title: "Add services and staff", body: "List what you offer with a duration and price, then invite the people who take appointments." },
  { title: "Share your booking link", body: "Clients pick a service, a person and an open time. Bookings land on the right calendar." },
];

const ROLES: { role: string; sees: string; can: string }[] = [
  { role: "Owner", sees: "Every calendar and client", can: "Manage billing and invite the team" },
  { role: "Admin", sees: "Every calendar and client", can: "Edit services and staff" },
  { role: "Staff", sees: "Only their own calendar and clients", can: "Update their own appointments" },
  { role: "Client", sees: "Open services and staff names", can: "Book an appointment, no account needed" },
];

const FREE = ["1 staff member", "50 bookings a month", "Public booking page", "Clinicly name on your booking page"];
const PRO = ["Unlimited staff and bookings", "SMS and email reminders", "Your own colors and logo", "Export clients and bookings to CSV"];

const FAQ = [
  {
    q: "Is Clinicly a real product?",
    a: "No. It's a portfolio project that shows how a multi-tenant booking app works end to end: separate workspaces, roles, plan limits and subscriptions.",
  },
  {
    q: "What happens if I pay for Pro?",
    a: "Nothing is charged. Checkout runs in Stripe test mode, which only accepts test cards like 4242 4242 4242 4242 and declines real ones. Your workspace still switches to Pro so you can try it.",
  },
  {
    q: "Can one clinic see another clinic's data?",
    a: "No. Every workspace is isolated in the database itself with row-level security, not only in the app code, so even a buggy query can't return another clinic's rows.",
  },
  {
    q: "Should I enter real patient details?",
    a: "Please don't. Use made-up names and emails. Demo data may be cleared at any time.",
  },
];

export default function Home() {
  return (
    <div className="bg-white text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-teal">Clinicly</Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/sign-in" className="rounded-md px-3 py-2 hover:bg-mint">Sign in</Link>
          <Link href="/sign-up" className="rounded-md bg-ink px-4 py-2 font-medium text-white hover:bg-teal">Create a workspace</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-10 md:grid-cols-[1.15fr_1fr] md:pt-16">
        <div>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
            The appointment book for small clinics and salons.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink/75">
            Each business gets its own workspace and a booking page clients can use without signing up.
            Staff see their own day; owners see everyone&apos;s.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/sign-up" className="rounded-lg bg-teal px-5 py-3 font-medium text-white hover:bg-ink">Create a free workspace</Link>
            <Link href="/book/demo" className="rounded-lg border border-ink/20 px-5 py-3 font-medium hover:border-ink">Try the demo booking page</Link>
          </div>
        </div>

        <AppointmentSlip />
      </section>

      <section className="bg-mint">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight">Up and running before your next patient</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="font-display text-5xl font-bold text-teal/30" aria-hidden>{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight">Everyone sees only what they should</h2>
        <p className="mt-3 max-w-[40rem] text-ink/70">The database enforces these rules, so a mistake in one screen can&apos;t show one clinic&apos;s patients to another.</p>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink text-sm">
                <th className="py-3 pr-6 font-semibold">Role</th>
                <th className="py-3 pr-6 font-semibold">Sees</th>
                <th className="py-3 font-semibold">Can</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.role} className="border-b border-ink/10">
                  <td className="py-4 pr-6 font-display text-lg font-semibold">{r.role}</td>
                  <td className="py-4 pr-6 text-ink/80">{r.sees}</td>
                  <td className="py-4 text-ink/80">{r.can}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight">Plans</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 p-8">
              <h3 className="font-display text-2xl font-bold">Free</h3>
              <p className="mt-1 text-white/60">For a solo practitioner getting started</p>
              <p className="mt-6 font-display text-5xl font-bold">₱0</p>
              <Link href="/sign-up" className="mt-8 block rounded-lg bg-white py-3 text-center font-medium text-ink hover:bg-mint">Create a free workspace</Link>
              <ul className="mt-8 space-y-3">{FREE.map((f) => <Check key={f}>{f}</Check>)}</ul>
            </div>
            <div className="rounded-2xl bg-white p-8 text-ink">
              <h3 className="font-display text-2xl font-bold">Pro</h3>
              <p className="mt-1 text-ink/60">For a clinic with a team</p>
              <p className="mt-6 font-display text-5xl font-bold">₱799<span className="text-lg font-medium text-ink/60"> a month</span></p>
              <Link href="/sign-up" className="mt-8 block rounded-lg bg-teal py-3 text-center font-medium text-white hover:bg-ink">Start free, upgrade anytime</Link>
              <p className="mt-8 text-sm font-semibold">Everything in Free, plus:</p>
              <ul className="mt-3 space-y-3">{PRO.map((f) => <Check key={f}>{f}</Check>)}</ul>
              <p className="mt-8 rounded-lg bg-marigold/25 px-4 py-3 text-sm">Demo: checkout uses Stripe test mode. Pay with 4242 4242 4242 4242 and you won&apos;t be charged.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight">Questions</h2>
        <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span className="text-2xl font-light text-teal transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink/60">
          <p>Clinicly is a portfolio project by Justine Rose Limguis.</p>
          <div className="flex gap-5">
            <a href="https://justine-limguis.vercel.app/" className="hover:text-ink">Portfolio</a>
            <a href="https://github.com/junior-dl/clinicly" className="hover:text-ink">Source on GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-teal" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M4 10.5l4 4 8-9" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

/** The hero visual: the paper reminder slip a clinic hands you at the front desk. */
function AppointmentSlip() {
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-label="Example appointment confirmation">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-2xl bg-mint" aria-hidden />
      <div className="slip-in relative -rotate-2 rounded-2xl border border-ink/10 bg-white p-7 shadow-[0_20px_40px_-20px_rgba(19,35,58,0.35)]">
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border border-ink/10 bg-white" aria-hidden />
        <p className="font-display text-sm font-semibold text-teal">Smile Dental</p>
        <p className="mt-1 text-sm text-ink/60">Your next appointment</p>
        <div className="mt-6 flex items-end gap-4">
          <p className="font-display text-7xl font-bold leading-none tracking-tight">28</p>
          <div className="pb-1">
            <p className="font-semibold">Saturday</p>
            <p className="text-ink/60">November</p>
          </div>
        </div>
        <dl className="mt-6 space-y-3 border-t border-dashed border-ink/20 pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-ink/60">Time</dt><dd className="font-semibold">10:30 AM</dd></div>
          <div className="flex justify-between"><dt className="text-ink/60">Service</dt><dd className="font-semibold">Teeth cleaning, 45 min</dd></div>
          <div className="flex justify-between"><dt className="text-ink/60">With</dt><dd className="font-semibold">Dr. Reyes</dd></div>
        </dl>
        <p className="mt-6 rounded-lg bg-mint px-3 py-2 text-center text-sm text-teal">Booked online at smile-dental.clinicly.app</p>
      </div>
    </div>
  );
}
