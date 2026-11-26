import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { deleteServiceUseCase, updateServiceUseCase } from "@/server/usecases/service.usecase";

type Ctx = RouteContext<"/api/w/[slug]/services/[id]">;

export const PATCH = route(async (req, ctx: Ctx) => {
  const { slug, id } = await ctx.params;
  const tenant = await requireMember(slug, ["owner", "admin"]);
  return Response.json(await updateServiceUseCase(tenant, id, await req.json()));
});

export const DELETE = route(async (_req, ctx: Ctx) => {
  const { slug, id } = await ctx.params;
  await deleteServiceUseCase(await requireMember(slug, ["owner", "admin"]), id);
  return new Response(null, { status: 204 });
});
