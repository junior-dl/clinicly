"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useWorkspace } from "@/composables/use-workspace";
import { PlanBadge } from "@/components/plan-badge";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const { workspace, error, isManager, isOwner } = useWorkspace(slug);

  if (error) return <p className="p-10 text-red-700">{error}</p>;

  const nav = [
    { href: `/w/${slug}`, label: "Calendar", show: true },
    { href: `/w/${slug}/services`, label: "Services", show: true },
    { href: `/w/${slug}/team`, label: "Team", show: isOwner },
    { href: `/w/${slug}/billing`, label: "Billing", show: isOwner },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-teal-800">Clinicly</Link>
          <span className="text-stone-400">/</span>
          {workspace ? (
            <>
              <span className="font-medium">{workspace.name}</span>
              <PlanBadge plan={workspace.plan} />
            </>
          ) : (
            <span className="h-5 w-32 animate-pulse rounded bg-stone-200" />
          )}
        </div>
        <nav className="flex gap-1 text-sm">
          {nav.filter((n) => n.show).map((n) => (
            <Link key={n.href} href={n.href} className={`rounded-md px-3 py-1.5 ${pathname === n.href ? "bg-teal-700 text-white" : "hover:bg-stone-200"}`}>{n.label}</Link>
          ))}
          <a href={`/book/${slug}`} target="_blank" className="rounded-md px-3 py-1.5 hover:bg-stone-200">Booking page ↗</a>
        </nav>
      </header>
      {workspace && !isManager && <p className="mb-4 text-xs text-stone-500">You&apos;re signed in as staff — you only see your own calendar.</p>}
      {children}
    </div>
  );
}
