import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { updateAppointmentStatusUseCase } from "@/server/usecases/appointment.usecase";

export const PATCH = route(async (req, ctx: RouteContext<"/api/w/[slug]/appointments/[id]">) => {
  const { slug, id } = await ctx.params;
  return Response.json(await updateAppointmentStatusUseCase(await requireMember(slug), id, await req.json()));
});
