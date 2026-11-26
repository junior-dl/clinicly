import { z } from "zod";
import { withTenant, type TenantContext } from "@/server/db";
import { AppError } from "@/server/lib/errors";
import { hasFeature } from "@/server/lib/plans";
import * as workspaceService from "@/server/services/workspace.service";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/, "3–32 chars: lowercase letters, numbers, hyphens"),
});

const RESERVED = new Set(["www", "app", "api", "admin", "billing", "auth", "dashboard"]);

export async function createWorkspaceUseCase(userId: string, raw: unknown) {
  const input = createWorkspaceSchema.parse(raw);
  if (RESERVED.has(input.slug) || (await workspaceService.isSlugTaken(input.slug))) {
    throw new AppError("CONFLICT", "That workspace address is taken");
  }
  return workspaceService.createWorkspaceWithOwner({ ...input, userId });
}

export function listMyWorkspacesUseCase(userId: string) {
  return workspaceService.listWorkspacesForUser(userId);
}

export function getWorkspaceUseCase(ctx: TenantContext) {
  return withTenant(ctx, async (tx) => {
    const ws = await workspaceService.getCurrentWorkspace(tx);
    if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");
    return { ...ws, role: ctx.role };
  });
}

const brandingSchema = z.object({
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
});

export function updateBrandingUseCase(ctx: TenantContext, raw: unknown) {
  const input = brandingSchema.parse(raw);
  return withTenant(ctx, async (tx) => {
    const ws = await workspaceService.getCurrentWorkspace(tx);
    if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");
    if (!hasFeature(ws, "customBranding")) throw new AppError("PLAN_LIMIT", "Custom branding is a Pro feature");
    return workspaceService.updateBranding(tx, input);
  });
}
