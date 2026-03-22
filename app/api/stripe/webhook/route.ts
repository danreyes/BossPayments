import { headers } from "next/headers";
import type { Id } from "@/convex/_generated/dataModel";
import type Stripe from "stripe";

import { internal } from "@/convex/_generated/api";
import { adminMutation } from "@/lib/convex-admin";
import { rateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";

// Allow 60 webhook calls per minute per IP (Stripe retries use the same IP)
const WEBHOOK_MAX = 60;
const WEBHOOK_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`webhook:${ip}`, WEBHOOK_MAX, WEBHOOK_WINDOW_MS);
  if (!allowed) {
    return new Response("Too many requests", { status: 429 });
  }

  const body = await request.text();
  const signature = headersList.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return new Response(`Webhook error: ${error instanceof Error ? error.message : "Invalid signature"}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Only record payment for job checkouts (not subscription checkouts)
    if (session.metadata?.jobId) {
      await adminMutation(internal.payments.recordCheckoutCompleted, {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: String(session.payment_intent ?? ""),
        jobId: session.metadata.jobId as Id<"jobs">,
        merchantId: String(session.metadata?.merchantId ?? ""),
        paymentMethod: String(session.metadata?.method ?? "unknown"),
        amountCents: Number(session.amount_total ?? 0)
      });
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const periodEnd = subscription.items.data[0]?.current_period_end ?? 0;
    await adminMutation(internal.payments.syncSubscription, {
      stripeCustomerId: String(subscription.customer),
      status: subscription.status,
      currentPeriodEnd: Number(periodEnd) * 1000
    });
  }

  return Response.json({ received: true });
}
