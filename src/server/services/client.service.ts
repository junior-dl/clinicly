import { asc } from "drizzle-orm";
import { schema, type TenantTx } from "@/server/db";

const { client } = schema;

export type NewClientInput = { name: string; email?: string | null; phone?: string | null; notes?: string | null };

export function listClients(tx: TenantTx) {
  return tx.select().from(client).orderBy(asc(client.name));
}

/**
 * Inserts without RETURNING: visitors may insert but not read clients,
 * and RETURNING would require a SELECT policy. The id is generated here.
 */
export async function createClient(tx: TenantTx, workspaceId: string, input: NewClientInput) {
  const id = crypto.randomUUID();
  await tx.insert(client).values({ id, workspaceId, ...input });
  return id;
}
