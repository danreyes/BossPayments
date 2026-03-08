import { headers } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import type { Id } from "@/convex/_generated/dataModel";
import type Stripe from "stripe";

import { api } from "@/convex/_generated/api";
import { stripe } from "@/lib/stripe";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return new Response(`Webhook error: ${error instanceof Error ? error.message : "Invalid signature"}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await convex.mutation(api.payments.recordCheckoutCompleted, {
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: String(session.payment_intent ?? ""),
      jobId: String(session.metadata?.jobId ?? "") as Id<"jobs">,
      merchantId: String(session.metadata?.merchantId ?? ""),
      paymentMethod: String(session.metadata?.method ?? "unknown"),
      amountCents: Number(session.amount_total ?? 0)
    });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await convex.mutation(api.payments.syncSubscription, {
      stripeCustomerId: String(subscription.customer),
      status: subscription.status,
      currentPeriodEnd: Date.now()
    });
  }

  return Response.json({ received: true });
}