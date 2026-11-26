import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { dbAdmin, schema, type TenantContext, type TenantRole } from "@/server/db";
import { auth } from "./auth";
import { AppError } from "./errors";

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AppError("UNAUTHORIZED", "Sign in required");
  return session.user;
}

/**
 * Resolves the signed-in caller's membership in a workspace by slug.
 * Membership lookup uses dbAdmin because no tenant context exists yet;
 * everything after this runs through withTenant() under RLS.
 */
export async function requireMember(slug: string, allowed?: TenantRole[]): Promise<TenantContext> {
  const user = await requireUser();
  const [row] = await dbAdmin
    .select({ workspaceId: schema.workspace.id, memberId: schema.member.id, role: schema.member.role })
    .from(schema.member)
    .innerJoin(schema.workspace, eq(schema.workspace.id, schema.member.workspaceId))
    .where(and(eq(schema.workspace.slug, slug), eq(schema.member.userId, user.id)))
    .limit(1);
  if (!row) throw new AppError("NOT_FOUND", "Workspace not found");
  if (allowed && !allowed.includes(row.role)) throw new AppError("FORBIDDEN", "Your role can't do this");
  return { workspaceId: row.workspaceId, memberId: row.memberId, role: row.role, userId: user.id };
}

/** Unauthenticated visitor on a workspace's public booking page. */
export async function visitorContext(slug: string): Promise<TenantContext> {
  const [ws] = await dbAdmin
    .select({ id: schema.workspace.id })
    .from(schema.workspace)
    .where(eq(schema.workspace.slug, slug))
    .limit(1);
  if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");
  return { workspaceId: ws.id, role: "visitor" };
}
