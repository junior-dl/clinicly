"use client";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { usePublicBooking } from "@/composables/use-public-booking";
import { peso } from "@/composables/use-format";
import { Button, Card, ErrorText, Input } from "@/components/ui";

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { page, loading, error, confirmedId, submit } = usePublicBooking(slug);
  const [serviceId, setServiceId] = useState("");
  const [staffMemberId, setStaffMemberId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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
            <Input label="Date & time" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
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
