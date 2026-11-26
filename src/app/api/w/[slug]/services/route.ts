import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { createServiceUseCase, listServicesUseCase } from "@/server/usecases/service.usecase";

type Ctx = RouteContext<"/api/w/[slug]/services">;

export const GET = route(async (_req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  return Response.json(await listServicesUseCase(await requireMember(slug)));
});

export const POST = route(async (req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  const tenant = await requireMember(slug, ["owner", "admin"]);
  return Response.json(await createServiceUseCase(tenant, await req.json()), { status: 201 });
});
