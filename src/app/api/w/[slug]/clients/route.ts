import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { createClientUseCase, listClientsUseCase } from "@/server/usecases/client.usecase";

type Ctx = RouteContext<"/api/w/[slug]/clients">;

export const GET = route(async (_req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  return Response.json(await listClientsUseCase(await requireMember(slug)));
});

export const POST = route(async (req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  return Response.json(await createClientUseCase(await requireMember(slug), await req.json()), { status: 201 });
});
