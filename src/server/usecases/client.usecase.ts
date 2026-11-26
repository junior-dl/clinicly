import { z } from "zod";
import { withTenant, type TenantContext } from "@/server/db";
import * as clientService from "@/server/services/client.service";

const clientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().nullish(),
  phone: z.string().trim().max(30).nullish(),
  notes: z.string().max(2000).nullish(),
});

export function listClientsUseCase(ctx: TenantContext) {
  return withTenant(ctx, (tx) => clientService.listClients(tx));
}

export function createClientUseCase(ctx: TenantContext, raw: unknown) {
  const input = clientSchema.parse(raw);
  return withTenant(ctx, async (tx) => ({ id: await clientService.createClient(tx, ctx.workspaceId, input) }));
}
