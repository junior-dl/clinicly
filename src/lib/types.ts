export type Plan = "free" | "pro";
export type Role = "owner" | "admin" | "staff";

export interface WorkspaceSummary { id: string; slug: string; name: string; plan: Plan; role: Role }
export interface WorkspaceDetail extends Omit<WorkspaceSummary, "role"> {
  role: Role;
  brandColor: string | null;
  logoUrl: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
}
export interface ServiceItem { id: string; name: string; description: string | null; durationMinutes: number; priceCents: number; isActive: boolean }
export interface AppointmentItem {
  id: string; startsAt: string; endsAt: string; status: "booked" | "completed" | "cancelled" | "no_show";
  notes: string | null; serviceName: string; clientName: string | null; staffMemberId: string;
}
export interface StaffItem { id: string; name: string; role?: Role }
export interface PublicBookingPage {
  workspace: { name: string; slug: string; brandColor: string | null; showClinicBranding: boolean };
  services: ServiceItem[];
  staff: StaffItem[];
}
