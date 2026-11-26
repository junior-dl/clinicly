import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { createInvitationUseCase, listInvitationsUseCase } from "@/server/usecases/member.usecase";

type Ctx = RouteContext<"/api/w/[slug]/invitations">;

export const GET = route(async (_req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  return Response.json(await listInvitationsUseCase(await requireMember(slug, ["owner"])));
});

export const POST = route(async (req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  return Response.json(await createInvitationUseCase(await requireMember(slug, ["owner"]), await req.json()), { status: 201 });
});
