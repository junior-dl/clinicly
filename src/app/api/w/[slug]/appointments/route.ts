import { route } from "@/server/lib/http";
import { requireMember } from "@/server/lib/tenant";
import { createAppointmentUseCase, listAppointmentsUseCase } from "@/server/usecases/appointment.usecase";

type Ctx = RouteContext<"/api/w/[slug]/appointments">;

export const GET = route(async (req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  const q = Object.fromEntries(new URL(req.url).searchParams);
  return Response.json(await listAppointmentsUseCase(await requireMember(slug), q));
});

export const POST = route(async (req, ctx: Ctx) => {
  const { slug } = await ctx.params;
  return Response.json(await createAppointmentUseCase(await requireMember(slug), await req.json()), { status: 201 });
});
