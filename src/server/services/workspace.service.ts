import { eq } from "drizzle-orm";
import { dbAdmin, schema, type TenantTx } from "@/server/db";

const { workspace, member } = schema;

export async function getCurrentWorkspace(tx: TenantTx) {
  // RLS restricts this to the workspace in context.
  const [ws] = await tx.select().from(workspace).limit(1);
  return ws ?? null;
}

export async function isSlugTaken(slug: string) {
  const [row] = await dbAdmin.select({ id: workspace.id }).from(workspace).where(eq(workspace.slug, slug)).limit(1);
  return Boolean(row);
}

/** Bootstrap: creates a workspace and makes the creator its Owner. Runs as admin (no tenant yet). */
export async function createWorkspaceWithOwner(input: { name: string; slug: string; userId: string }) {
  return dbAdmin.transaction(async (tx) => {
    const [ws] = await tx.insert(workspace).values({ name: input.name, slug: input.slug }).returning();
    await tx.insert(member).values({ workspaceId: ws.id, userId: input.userId, role: "owner" });
    return ws;
  });
}

export async function listWorkspacesForUser(userId: string) {
  return dbAdmin
    .select({ id: workspace.id, slug: workspace.slug, name: workspace.name, plan: workspace.plan, role: member.role })
    .from(member)
    .innerJoin(workspace, eq(workspace.id, member.workspaceId))
    .where(eq(member.userId, userId));
}

export async function updateBranding(tx: TenantTx, data: { brandColor?: string | null; logoUrl?: string | null }) {
  const [ws] = await tx.update(workspace).set(data).returning();
  return ws;
}
