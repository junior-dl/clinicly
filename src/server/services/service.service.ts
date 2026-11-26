import { asc, eq } from "drizzle-orm";
import { schema, type TenantTx } from "@/server/db";

const { service } = schema;

export type NewServiceInput = {
  name: string;
  description?: string | null;
  durationMinutes: number;
  priceCents: number;
};

export function listServices(tx: TenantTx) {
  return tx.select().from(service).orderBy(asc(service.name));
}

export async function getService(tx: TenantTx, id: string) {
  const [row] = await tx.select().from(service).where(eq(service.id, id)).limit(1);
  return row ?? null;
}

export async function createService(tx: TenantTx, workspaceId: string, input: NewServiceInput) {
  const [row] = await tx.insert(service).values({ ...input, workspaceId }).returning();
  return row;
}

export async function updateService(tx: TenantTx, id: string, input: Partial<NewServiceInput> & { isActive?: boolean }) {
  const [row] = await tx.update(service).set(input).where(eq(service.id, id)).returning();
  return row ?? null;
}

export async function deleteService(tx: TenantTx, id: string) {
  const rows = await tx.delete(service).where(eq(service.id, id)).returning({ id: service.id });
  return rows.length > 0;
}
