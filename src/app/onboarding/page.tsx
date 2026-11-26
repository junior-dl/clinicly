"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Button, Card, ErrorText, Input } from "@/components/ui";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32);

export default function OnboardingPage() {
  const router = useRouter();
  const create = useWorkspaceStore((s) => s.create);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const ws = await create({ name, slug });
      router.push(`/w/${ws.slug}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto mt-16 max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Set up your business</h1>
      <form onSubmit={handle} className="space-y-3">
        <Input label="Business name" value={name} required onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }} />
        <Input label="Booking address" value={slug} required onChange={(e) => setSlug(slugify(e.target.value))} />
        <p className="text-xs text-stone-500">{slug || "acme"}.clinicly.app</p>
        <ErrorText>{error}</ErrorText>
        <Button className="w-full" disabled={busy}>{busy ? "Creating…" : "Create workspace"}</Button>
      </form>
    </Card>
  );
}
