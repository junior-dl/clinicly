import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { updateBrandingUseCase } from "@/server/usecases/workspace.usecase";

export const PATCH = route(async (req, ctx: RouteContext<"/api/w/[slug]/branding">) => {
  const { slug } = await ctx.params;
  return Response.json(await updateBrandingUseCase(await requireMember(slug, ["owner", "admin"]), await req.json()));
});
