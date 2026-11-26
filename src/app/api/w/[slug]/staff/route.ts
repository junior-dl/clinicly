import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { listStaffUseCase } from "@/server/usecases/appointment.usecase";

export const GET = route(async (_req, ctx: RouteContext<"/api/w/[slug]/staff">) => {
  const { slug } = await ctx.params;
  return Response.json(await listStaffUseCase(await requireMember(slug)));
});
