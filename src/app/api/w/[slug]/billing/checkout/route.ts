import { route } from "@/server/lib/http";
import { requireMember, requireUser } from "@/server/lib/tenant";
import { createCheckoutUseCase } from "@/server/usecases/billing.usecase";

export const POST = route(async (_req, ctx: RouteContext<"/api/w/[slug]/billing/checkout">) => {
  const { slug } = await ctx.params;
  const tenant = await requireMember(slug, ["owner"]);
  const user = await requireUser();
  return Response.json(await createCheckoutUseCase(tenant, user.email));
});
