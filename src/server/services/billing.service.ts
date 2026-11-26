import { eq } from "drizzle-orm";
import { dbAdmin, schema } from "@/server/db";

const { workspace, stripeEvent } = schema;

export async function getWorkspaceAdmin(id: string) {
  const [ws] = await dbAdmin.select().from(workspace).where(eq(workspace.id, id)).limit(1);
  return ws ?? null;
}

export async function saveStripeCustomer(workspaceId: string, customerId: string) {
  await dbAdmin.update(workspace).set({ stripeCustomerId: customerId }).where(eq(workspace.id, workspaceId));
}

/** Pro while the subscription is active/trialing; everything else falls back to Free. */
export async function applySubscription(input: {
  customerId: string;
  subscriptionId: string;
  status: string;
  currentPeriodEnd: Date | null;
}) {
  const plan = input.status === "active" || input.status === "trialing" ? "pro" : "free";
  await dbAdmin
    .update(workspace)
    .set({
      plan,
      stripeSubscriptionId: input.subscriptionId,
      subscriptionStatus: input.status,
      currentPeriodEnd: input.currentPeriodEnd,
    })
    .where(eq(workspace.stripeCustomerId, input.customerId));
}

/** Returns false if this event was already processed (Stripe retries deliveries). */
export async function markEventProcessed(id: string, type: string) {
  const rows = await dbAdmin.insert(stripeEvent).values({ id, type }).onConflictDoNothing().returning();
  return rows.length > 0;
}
