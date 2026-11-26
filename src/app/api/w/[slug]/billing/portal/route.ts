import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { createPortalUseCase } from "@/server/usecases/billing.usecase";

export const POST = route(async (_req, ctx: RouteContext<"/api/w/[slug]/billing/portal">) => {
  const { slug } = await ctx.params;
  return Response.json(await createPortalUseCase(await requireMember(slug, ["owner"])));
});
