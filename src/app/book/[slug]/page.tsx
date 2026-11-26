"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { usePublicBooking } from "@/composables/use-public-booking";
import { peso } from "@/composables/use-format";
import { Button, Card, ErrorText, Input } from "@/components/ui";

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { page, loading, error, confirmedId, submit } = usePublicBooking(slug);
  const [serviceId, setServiceId] = useState("");
  const [staffMemberId, setStaffMemberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Safe to read the clock on first render: the form only renders client-side after the page data loads.
  const [now, setNow] = useState(() => new Date());

  // Re-evaluate "now" every minute so a page left open doesn't offer slots that have passed.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const today = localDate(now);
  const slots = date ? timeSlots(date, now) : [];
  const startsAt = date && time ? `${date}T${time}` : "";

  if (loading || !page) return <p className="p-10 text-stone-500">{error ?? "Loading…"}</p>;
  const accent = page.workspace.brandColor ?? "#0f766e";

  async function handle(e: FormEvent) {
    e.preventDefault();
    await submit(slug, { serviceId, staffMemberId, startsAt, client: { name, email, phone: phone || undefined } });
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold" style={{ color: accent }}>{page.workspace.name}</h1>
      <p className="mb-6 text-sm text-stone-500">Book an appointment</p>
      {confirmedId ? (
        <Card><p className="font-medium">You&apos;re booked. See you soon!</p></Card>
      ) : (
        <Card>
          <form onSubmit={handle} className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium">Service</legend>
              {page.services.map((s) => (
                <label key={s.id} className={`flex cursor-pointer justify-between rounded-md border p-3 text-sm ${serviceId === s.id ? "border-stone-900" : "border-stone-200"}`}>
                  <span><input type="radio" name="service" className="mr-2" checked={serviceId === s.id} onChange={() => setServiceId(s.id)} required />{s.name} · {s.durationMinutes} min</span>
                  <span>{peso(s.priceCents)}</span>
                </label>
              ))}
            </fieldset>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">With</span>
              <select className="w-full rounded-md border border-stone-300 px-3 py-2" value={staffMemberId} onChange={(e) => setStaffMemberId(e.target.value)} required>
                <option value="" disabled>Choose…</option>
                {page.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" min={today} value={date} required
                onChange={(e) => { setDate(e.target.value); setTime(""); }} />
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-stone-700">Time</span>
                <select className="w-full rounded-md border border-stone-300 px-3 py-2 disabled:bg-stone-100" value={time} required
                  disabled={!date || slots.length === 0} onChange={(e) => setTime(e.target.value)}>
                  <option value="" disabled>{!date ? "Pick a date first" : slots.length ? "Choose…" : "No times left today"}</option>
                  {slots.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                </select>
              </label>
            </div>
            <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <ErrorText>{error}</ErrorText>
            <Button className="w-full" style={{ backgroundColor: accent }}>Book</Button>
          </form>
        </Card>
      )}
      {page.workspace.showClinicBranding && <p className="mt-8 text-center text-xs text-stone-400">Powered by Clinicly</p>}
    </main>
  );
}

const OPEN_HOUR = 8;   // TODO: replace with per-staff working hours
const CLOSE_HOUR = 18;
const pad = (n: number) => String(n).padStart(2, "0");

/** YYYY-MM-DD in the visitor's local time (toISOString() would shift to UTC). */
function localDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 15-minute slots within opening hours; for today, only slots after now. */
function timeSlots(date: string, now: Date) {
  const out: string[] = [];
  for (let m = OPEN_HOUR * 60; m < CLOSE_HOUR * 60; m += 15) {
    const t = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    if (new Date(`${date}T${t}`) > now) out.push(t);
  }
  return out;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}
