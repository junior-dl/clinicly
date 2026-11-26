import type Stripe from "stripe";
import { AppError } from "@/server/lib/errors";
import { stripe } from "@/server/lib/stripe";
import type { TenantContext } from "@/server/db";
import * as billingService from "@/server/services/billing.service";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createCheckoutUseCase(ctx: TenantContext, userEmail: string) {
  const ws = await billingService.getWorkspaceAdmin(ctx.workspaceId);
  if (!ws) throw new AppError("NOT_FOUND", "Workspace not found");
  if (ws.plan === "pro") throw new AppError("CONFLICT", "Already on Pro");

  let customerId = ws.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe().customers.create({ email: userEmail, name: ws.name, metadata: { workspaceId: ws.id } });
    customerId = customer.id;
    await billingService.saveStripeCustomer(ws.id, customerId);
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    client_reference_id: ws.id,
    success_url: `${appUrl()}/w/${ws.slug}/billing?status=success`,
    cancel_url: `${appUrl()}/w/${ws.slug}/billing?status=cancelled`,
  });
  return { url: session.url };
}

export async function createPortalUseCase(ctx: TenantContext) {
  const ws = await billingService.getWorkspaceAdmin(ctx.workspaceId);
  if (!ws?.stripeCustomerId) throw new AppError("NOT_FOUND", "No billing account yet");
  const portal = await stripe().billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: `${appUrl()}/w/${ws.slug}/billing`,
  });
  return { url: portal.url };
}

/** Verifies the signature, dedupes the event, and syncs the workspace plan. */
export async function handleStripeWebhookUseCase(rawBody: string, signature: string | null) {
  if (!signature) throw new AppError("VALIDATION", "Missing signature");
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    throw new AppError("VALIDATION", "Invalid signature");
  }

  if (!(await billingService.markEventProcessed(event.id, event.type))) return { duplicate: true };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const periodEnd = sub.items.data[0]?.current_period_end;
      await billingService.applySubscription({
        customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        subscriptionId: sub.id,
        status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      });
      break;
    }
  }
  return { received: true };
}
