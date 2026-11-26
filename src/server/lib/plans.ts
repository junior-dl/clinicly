import type { Workspace } from "@/server/db/schema";

export const PLAN_LIMITS = {
  free: { maxStaff: 1, maxBookingsPerMonth: 50, reminders: false, customBranding: false, csvExport: false },
  pro: { maxStaff: Infinity, maxBookingsPerMonth: Infinity, reminders: true, customBranding: true, csvExport: true },
} as const;

export type PlanFeature = "reminders" | "customBranding" | "csvExport";

export function limitsFor(ws: Pick<Workspace, "plan">) {
  return PLAN_LIMITS[ws.plan];
}

export function hasFeature(ws: Pick<Workspace, "plan">, feature: PlanFeature) {
  return PLAN_LIMITS[ws.plan][feature];
}
