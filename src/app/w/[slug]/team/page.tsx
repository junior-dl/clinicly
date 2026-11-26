"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { StaffItem } from "@/lib/types";
import { Button, Card, ErrorText, Input } from "@/components/ui";

export default function TeamPage() {
  const { slug } = useParams<{ slug: string }>();
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { api<StaffItem[]>(`/api/w/${slug}/staff`).then(setStaff).catch((e) => setError(e.message)); }, [slug]);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api<{ url: string }>(`/api/w/${slug}/invitations`, { method: "POST", json: { email, role } });
      setLink(res.url);
      setEmail("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 font-semibold">Invite a team member</h2>
        <form onSubmit={invite} className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Role</span>
            <select className="w-full rounded-md border border-stone-300 px-3 py-2" value={role} onChange={(e) => setRole(e.target.value as "staff" | "admin")}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <Button>Invite</Button>
        </form>
        <ErrorText>{error}</ErrorText>
        {link && <p className="mt-3 break-all text-sm">Share this link: <code>{link}</code></p>}
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Team</h2>
        <ul className="divide-y divide-stone-200">
          {staff.map((s) => <li key={s.id} className="flex justify-between py-2 text-sm"><span>{s.name}</span><span className="text-stone-500">{s.role}</span></li>)}
        </ul>
      </Card>
    </div>
  );
}
