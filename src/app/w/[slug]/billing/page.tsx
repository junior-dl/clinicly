"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useWorkspace } from "@/composables/use-workspace";
import { PlanBadge } from "@/components/plan-badge";
import { Button, Card, ErrorText } from "@/components/ui";

export default function BillingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { workspace } = useWorkspace(slug);
  const [error, setError] = useState<string | null>(null);

  async function go(path: "checkout" | "portal") {
    setError(null);
    try {
      const { url } = await api<{ url: string }>(`/api/w/${slug}/billing/${path}`, { method: "POST" });
      window.location.href = url;
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!workspace) return null;
  return (
    <Card className="max-w-lg">
      <div className="mb-4 flex items-center gap-2"><h1 className="text-lg font-semibold">Plan</h1><PlanBadge plan={workspace.plan} /></div>
      {workspace.plan === "free" ? (
        <>
          <p className="mb-4 text-sm text-stone-600">Free covers 1 staff member and 50 bookings a month. Pro removes both limits and adds reminders, custom branding and CSV export.</p>
          <Button onClick={() => go("checkout")}>Upgrade to Pro</Button>
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">Demo checkout in Stripe test mode. Use card 4242 4242 4242 4242 with any future date and CVC. Nothing is charged.</p>
        </>
      ) : (
        <>
          <p className="mb-4 text-sm text-stone-600">
            Status: {workspace.subscriptionStatus}
            {workspace.currentPeriodEnd && <> · renews {new Date(workspace.currentPeriodEnd).toLocaleDateString()}</>}
          </p>
          <Button variant="ghost" onClick={() => go("portal")}>Manage subscription</Button>
        </>
      )}
      <div className="mt-3"><ErrorText>{error}</ErrorText></div>
    </Card>
  );
}
