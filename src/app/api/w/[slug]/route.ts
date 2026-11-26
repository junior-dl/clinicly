import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { getWorkspaceUseCase } from "@/server/usecases/workspace.usecase";

export const GET = route(async (_req, ctx: RouteContext<"/api/w/[slug]">) => {
  const { slug } = await ctx.params;
  return Response.json(await getWorkspaceUseCase(await requireMember(slug)));
});
