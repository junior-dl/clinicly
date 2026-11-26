import { route } from "@/server/lib/http";
import { handleStripeWebhookUseCase } from "@/server/usecases/billing.usecase";

// Signature verification needs the exact raw body, so read text(), never json().
export const POST = route(async (req) => {
  const result = await handleStripeWebhookUseCase(await req.text(), req.headers.get("stripe-signature"));
  return Response.json(result);
});
