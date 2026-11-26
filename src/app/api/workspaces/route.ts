import { route } from "@/server/lib/http";
import { requireUser } from "@/server/lib/tenant";
import { createWorkspaceUseCase, listMyWorkspacesUseCase } from "@/server/usecases/workspace.usecase";

export const GET = route(async () => {
  const user = await requireUser();
  return Response.json(await listMyWorkspacesUseCase(user.id));
});

export const POST = route(async (req) => {
  const user = await requireUser();
  return Response.json(await createWorkspaceUseCase(user.id, await req.json()), { status: 201 });
});
