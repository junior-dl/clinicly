import { z } from "zod";
import { withTenant, type TenantContext } from "@/server/db";
import { AppError } from "@/server/lib/errors";
import * as serviceService from "@/server/services/service.service";

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullish(),
  durationMinutes: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
});

export function listServicesUseCase(ctx: TenantContext) {
  return withTenant(ctx, (tx) => serviceService.listServices(tx));
}

export function createServiceUseCase(ctx: TenantContext, raw: unknown) {
  const input = serviceSchema.parse(raw);
  return withTenant(ctx, (tx) => serviceService.createService(tx, ctx.workspaceId, input));
}

export function updateServiceUseCase(ctx: TenantContext, id: string, raw: unknown) {
  const input = serviceSchema.partial().extend({ isActive: z.boolean().optional() }).parse(raw);
  return withTenant(ctx, async (tx) => {
    const row = await serviceService.updateService(tx, id, input);
    if (!row) throw new AppError("NOT_FOUND", "Service not found");
    return row;
  });
}

export function deleteServiceUseCase(ctx: TenantContext, id: string) {
  return withTenant(ctx, async (tx) => {
    if (!(await serviceService.deleteService(tx, id))) throw new AppError("NOT_FOUND", "Service not found");
  });
}
