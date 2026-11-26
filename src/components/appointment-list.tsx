"use client";
import type { AppointmentItem } from "@/lib/types";
import { dateTime } from "@/composables/use-format";

const STATUS_STYLE: Record<AppointmentItem["status"], string> = {
  booked: "bg-teal-50 text-teal-800",
  completed: "bg-stone-100 text-stone-700",
  cancelled: "bg-red-50 text-red-700 line-through",
  no_show: "bg-amber-50 text-amber-800",
};

export function AppointmentList({ items, onStatus }: { items: AppointmentItem[]; onStatus: (id: string, s: AppointmentItem["status"]) => void }) {
  if (!items.length) return <p className="text-sm text-stone-500">No appointments this week.</p>;
  return (
    <ul className="divide-y divide-stone-200">
      {items.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div>
            <p className="font-medium">{a.serviceName} · {a.clientName ?? "Client"}</p>
            <p className="text-sm text-stone-500">{dateTime(a.startsAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLE[a.status]}`}>{a.status.replace("_", " ")}</span>
            {a.status === "booked" && (
              <select
                aria-label="Change status"
                className="rounded border border-stone-300 text-sm"
                defaultValue=""
                onChange={(e) => e.target.value && onStatus(a.id, e.target.value as AppointmentItem["status"])}
              >
                <option value="" disabled>Mark as…</option>
                <option value="completed">Completed</option>
                <option value="no_show">No-show</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
