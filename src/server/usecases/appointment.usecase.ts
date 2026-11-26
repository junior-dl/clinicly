import { z } from "zod";
import { withTenant, type TenantContext, type TenantTx } from "@/server/db";
import { AppError } from "@/server/lib/errors";
import { limitsFor } from "@/server/lib/plans";
import * as appointmentService from "@/server/services/appointment.service";
import * as serviceService from "@/server/services/service.service";
import * as clientService from "@/server/services/client.service";
import * as workspaceService from "@/server/services/workspace.service";

const rangeSchema = z.object({ from: z.coerce.date(), to: z.coerce.date() });

export function listAppointmentsUseCase(ctx: TenantContext, raw: unknown) {
  const range = rangeSchema.parse(raw);
  return withTenant(ctx, (tx) => appointmentService.listAppointments(tx, range));
}

export function listStaffUseCase(ctx: TenantContext) {
  return withTenant(ctx, (tx) => appointmentService.listStaff(tx));
}

/** Shared booking rules for staff-created and public bookings. */
async function book(
  tx: TenantTx,
  ctx: TenantContext,
  input: { serviceId: string; staffMemberId: string; clientId: string; startsAt: Date; notes?: string | null },
) {
  const ws = await workspaceService.getCurrentWorkspace(tx);
  if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");

  const limit = limitsFor(ws).maxBookingsPerMonth;
  if ((await appointmentService.countBookingsThisMonth(tx, ws.id)) >= limit) {
    throw new AppError("PLAN_LIMIT", `This workspace reached its ${limit} bookings/month limit on the Free plan`);
  }

  const svc = await serviceService.getService(tx, input.serviceId);
  if (!svc || !svc.isActive) throw new AppError("NOT_FOUND", "Service not available");

  if (input.startsAt.getTime() < Date.now()) throw new AppError("VALIDATION", "Pick a time in the future");
  const endsAt = new Date(input.startsAt.getTime() + svc.durationMinutes * 60_000);

  if (await appointmentService.staffHasOverlap(tx, input.staffMemberId, input.startsAt, endsAt)) {
    throw new AppError("CONFLICT", "That time slot is already booked");
  }

  return appointmentService.createAppointment(tx, { ...input, workspaceId: ctx.workspaceId, endsAt });
}

const staffBookingSchema = z.object({
  serviceId: z.string().uuid(),
  staffMemberId: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  startsAt: z.coerce.date(),
  notes: z.string().max(1000).nullish(),
});

export function createAppointmentUseCase(ctx: TenantContext, raw: unknown) {
  const input = staffBookingSchema.parse(raw);
  // Staff can only book onto their own calendar; managers can pick anyone.
  const staffMemberId = ctx.role === "staff" ? ctx.memberId! : (input.staffMemberId ?? ctx.memberId!);
  return withTenant(ctx, async (tx) => ({ id: await book(tx, ctx, { ...input, staffMemberId }) }));
}

const publicBookingSchema = z.object({
  serviceId: z.string().uuid(),
  staffMemberId: z.string().uuid(),
  startsAt: z.coerce.date(),
  client: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().email(),
    phone: z.string().trim().max(30).nullish(),
  }),
  notes: z.string().max(1000).nullish(),
});

/** Visitor role: may read active services/staff and insert a client + appointment, nothing else. */
export function createPublicBookingUseCase(ctx: TenantContext, raw: unknown) {
  if (ctx.role !== "visitor") throw new AppError("FORBIDDEN", "Public booking only");
  const input = publicBookingSchema.parse(raw);
  return withTenant(ctx, async (tx) => {
    const clientId = await clientService.createClient(tx, ctx.workspaceId, input.client);
    const id = await book(tx, ctx, { ...input, clientId });
    return { id };
  });
}

const statusSchema = z.object({ status: z.enum(["booked", "completed", "cancelled", "no_show"]) });

export function updateAppointmentStatusUseCase(ctx: TenantContext, id: string, raw: unknown) {
  const { status } = statusSchema.parse(raw);
  return withTenant(ctx, async (tx) => {
    const row = await appointmentService.updateAppointmentStatus(tx, id, status);
    if (!row) throw new AppError("NOT_FOUND", "Appointment not found");
    return row;
  });
}

export function getPublicBookingPageUseCase(ctx: TenantContext) {
  return withTenant(ctx, async (tx) => {
    const ws = await workspaceService.getCurrentWorkspace(tx);
    if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");
    const services = await serviceService.listServices(tx);
    const staff = await appointmentService.listStaff(tx);
    return {
      workspace: { name: ws.name, slug: ws.slug, brandColor: ws.plan === "pro" ? ws.brandColor : null, showClinicBranding: ws.plan === "free" },
      services,
      staff: staff.map((s) => ({ id: s.id, name: s.name })),
    };
  });
}
