"use client";
import { useState, type FormEvent } from "react";
import { Button, ErrorText, Input } from "./ui";

export function ServiceForm({ onSubmit }: { onSubmit: (v: { name: string; durationMinutes: number; priceCents: number }) => Promise<void> }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ name, durationMinutes: Number(duration), priceCents: Math.round(Number(price) * 100) });
      setName("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handle} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <Input label="Service" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Teeth cleaning" />
      <Input label="Minutes" type="number" min={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
      <Input label="Price (₱)" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Button disabled={busy}>Add</Button>
      <div className="sm:col-span-4"><ErrorText>{error}</ErrorText></div>
    </form>
  );
}
