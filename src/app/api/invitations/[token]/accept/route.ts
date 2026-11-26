import { route } from "@/server/lib/http";
import { requireUser } from "@/server/lib/tenant";
import { acceptInvitationUseCase } from "@/server/usecases/member.usecase";

export const POST = route(async (_req, ctx: RouteContext<"/api/invitations/[token]/accept">) => {
  const { token } = await ctx.params;
  const user = await requireUser();
  return Response.json(await acceptInvitationUseCase(user.id, token));
});
