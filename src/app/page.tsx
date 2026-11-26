import Link from "next/link";

const PLANS = [
  { name: "Free", price: "₱0", items: ["1 staff member", "50 bookings / month", "Public booking page", "Clinicly branding"] },
  { name: "Pro", price: "₱799 / mo", items: ["Unlimited staff & bookings", "SMS & email reminders", "Your own branding", "CSV export"] },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="text-lg font-bold text-teal-800">Clinicly</span>
        <nav className="flex gap-4 text-sm">
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up" className="rounded-md bg-teal-700 px-3 py-1.5 text-white">Get started</Link>
        </nav>
      </header>
      <section className="mt-20">
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight">Bookings for small clinics, barbershops and studios.</h1>
        <p className="mt-4 max-w-xl text-stone-600">
          Each business gets its own workspace and a public booking page at <code>yourname.clinicly.app</code>. Staff see their own calendar; owners see everything.
        </p>
      </section>
      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.name} className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-1 text-2xl font-semibold">{p.price}</p>
            <ul className="mt-4 space-y-1 text-sm text-stone-600">{p.items.map((i) => <li key={i}>· {i}</li>)}</ul>
          </div>
        ))}
      </section>
    </main>
  );
}
