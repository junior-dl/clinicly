import { and, count, eq, gt, isNull } from "drizzle-orm";
import { dbAdmin, schema, type TenantTx } from "@/server/db";
import type { MemberRole } from "@/server/db/schema";

const { member, invitation } = schema;

export async function countMembers(tx: TenantTx) {
  const [row] = await tx.select({ n: count() }).from(member);
  return row?.n ?? 0;
}

export async function createInvitation(
  tx: TenantTx,
  input: { workspaceId: string; email: string; role: MemberRole; invitedBy: string },
) {
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [row] = await tx.insert(invitation).values({ ...input, token, expiresAt }).returning();
  return row;
}

export function listInvitations(tx: TenantTx) {
  return tx.select().from(invitation).where(isNull(invitation.acceptedAt));
}

/** Invitee isn't a member yet, so acceptance runs as admin, scoped by the secret token. */
export async function findOpenInvitation(token: string) {
  const [row] = await dbAdmin
    .select()
    .from(invitation)
    .where(and(eq(invitation.token, token), isNull(invitation.acceptedAt), gt(invitation.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function acceptInvitation(invitationId: string, workspaceId: string, userId: string, role: MemberRole) {
  return dbAdmin.transaction(async (tx) => {
    await tx.insert(member).values({ workspaceId, userId, role }).onConflictDoNothing();
    await tx.update(invitation).set({ acceptedAt: new Date() }).where(eq(invitation.id, invitationId));
  });
}

export async function countMembersAdmin(workspaceId: string) {
  const [row] = await dbAdmin.select({ n: count() }).from(member).where(eq(member.workspaceId, workspaceId));
  return row?.n ?? 0;
}
