import type { Plan } from "@/lib/types";

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${plan === "pro" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"}`}>
      {plan}
    </span>
  );
}
