import { route } from "@/server/lib/http";
import { visitorContext } from "@/server/lib/tenant";
import { createPublicBookingUseCase } from "@/server/usecases/appointment.usecase";

export const POST = route(async (req, ctx: RouteContext<"/api/public/[slug]/book">) => {
  const { slug } = await ctx.params;
  return Response.json(await createPublicBookingUseCase(await visitorContext(slug), await req.json()), { status: 201 });
});
