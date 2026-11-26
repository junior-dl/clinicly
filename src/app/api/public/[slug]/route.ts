import { route } from "@/server/lib/http";
import { visitorContext } from "@/server/lib/tenant";
import { getPublicBookingPageUseCase } from "@/server/usecases/appointment.usecase";

export const GET = route(async (_req, ctx: RouteContext<"/api/public/[slug]">) => {
  const { slug } = await ctx.params;
  return Response.json(await getPublicBookingPageUseCase(await visitorContext(slug)));
});
