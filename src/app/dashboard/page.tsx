"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { PlanBadge } from "@/components/plan-badge";
import { Card } from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const { mine, loading, error, fetchMine } = useWorkspaceStore();
  useEffect(() => { fetchMine(); }, [fetchMine]);
  useEffect(() => { if (error?.includes("Sign in")) router.push("/sign-in"); }, [error, router]);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Your workspaces</h1>
      {loading && <p className="text-sm text-stone-500">Loading…</p>}
      <div className="space-y-3">
        {mine.map((w) => (
          <Link key={w.id} href={`/w/${w.slug}`}>
            <Card className="flex items-center justify-between hover:border-teal-700">
              <div><p className="font-medium">{w.name}</p><p className="text-sm text-stone-500">{w.slug}.clinicly.app · {w.role}</p></div>
              <PlanBadge plan={w.plan} />
            </Card>
          </Link>
        ))}
      </div>
      <Link href="/onboarding" className="mt-6 inline-block text-sm text-teal-700">+ Create a workspace</Link>
    </main>
  );
}
