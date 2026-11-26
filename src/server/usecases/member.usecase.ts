import { z } from "zod";
import { withTenant, type TenantContext } from "@/server/db";
import { AppError } from "@/server/lib/errors";
import { limitsFor } from "@/server/lib/plans";
import * as memberService from "@/server/services/member.service";
import * as workspaceService from "@/server/services/workspace.service";
import * as billingService from "@/server/services/billing.service";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "staff"]),
});

export function createInvitationUseCase(ctx: TenantContext, raw: unknown) {
  const input = inviteSchema.parse(raw);
  return withTenant(ctx, async (tx) => {
    const ws = await workspaceService.getCurrentWorkspace(tx);
    if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");
    const max = limitsFor(ws).maxStaff;
    if ((await memberService.countMembers(tx)) >= max) {
      throw new AppError("PLAN_LIMIT", `The Free plan allows ${max} staff member. Upgrade to Pro to invite more.`);
    }
    const inv = await memberService.createInvitation(tx, { ...input, workspaceId: ws.id, invitedBy: ctx.userId! });
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inv.token}`;
    // TODO: send email (Resend) — for now the owner copies the link.
    return { id: inv.id, email: inv.email, role: inv.role, url };
  });
}

export function listInvitationsUseCase(ctx: TenantContext) {
  return withTenant(ctx, (tx) => memberService.listInvitations(tx));
}

export async function acceptInvitationUseCase(userId: string, token: string) {
  const inv = await memberService.findOpenInvitation(token);
  if (!inv) throw new AppError("NOT_FOUND", "This invite is invalid or expired");
  // Re-check the seat limit at accept time: the plan may have been downgraded since.
  const ws = await billingService.getWorkspaceAdmin(inv.workspaceId);
  if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");
  if ((await memberService.countMembersAdmin(ws.id)) >= limitsFor(ws).maxStaff) {
    throw new AppError("PLAN_LIMIT", "This workspace has no free seats");
  }
  await memberService.acceptInvitation(inv.id, inv.workspaceId, userId, inv.role);
  return { slug: ws.slug };
}
