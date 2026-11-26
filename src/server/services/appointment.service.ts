import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import { schema, type TenantTx } from "@/server/db";

const { appointment, service, client, member, user } = schema;

export type AppointmentStatus = (typeof schema.appointmentStatusEnum.enumValues)[number];

export function listAppointments(tx: TenantTx, range: { from: Date; to: Date }) {
  // RLS: managers get the whole workspace, staff only their own calendar.
  return tx
    .select({
      id: appointment.id,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      status: appointment.status,
      notes: appointment.notes,
      serviceName: service.name,
      clientName: client.name,
      staffMemberId: appointment.staffMemberId,
    })
    .from(appointment)
    .innerJoin(service, eq(service.id, appointment.serviceId))
    .leftJoin(client, eq(client.id, appointment.clientId))
    .where(and(gte(appointment.startsAt, range.from), lt(appointment.startsAt, range.to)))
    .orderBy(asc(appointment.startsAt));
}

export async function countBookingsThisMonth(tx: TenantTx, workspaceId: string) {
  const res = await tx.execute<{ n: number }>(sql`select workspace_month_booking_count(${workspaceId}) as n`);
  return Number(res.rows[0]?.n ?? 0);
}

export async function staffHasOverlap(tx: TenantTx, staffMemberId: string, startsAt: Date, endsAt: Date) {
  const res = await tx.execute<{ overlap: boolean }>(
    sql`select staff_has_overlap(${staffMemberId}, ${startsAt.toISOString()}, ${endsAt.toISOString()}) as overlap`,
  );
  return Boolean(res.rows[0]?.overlap);
}

/** Inserts without RETURNING so visitors (insert-only) can book. */
export async function createAppointment(
  tx: TenantTx,
  input: {
    workspaceId: string;
    serviceId: string;
    staffMemberId: string;
    clientId: string;
    startsAt: Date;
    endsAt: Date;
    notes?: string | null;
  },
) {
  const id = crypto.randomUUID();
  await tx.insert(appointment).values({ id, ...input });
  return id;
}

export async function updateAppointmentStatus(tx: TenantTx, id: string, status: AppointmentStatus) {
  const [row] = await tx.update(appointment).set({ status }).where(eq(appointment.id, id)).returning();
  return row ?? null;
}

export function listStaff(tx: TenantTx) {
  return tx
    .select({ id: member.id, role: member.role, name: user.name })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .orderBy(asc(user.name));
}
